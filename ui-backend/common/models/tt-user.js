"use strict";

var config = require("../../server/config.json");
var appConfig = require("../../server/app-config.json");
var Constants = require("../../server/constants.json");
var path = require("path");
var app = require("../../server/server");
var ejs = require("ejs");

var Excel = require("exceljs");

var generator = require('generate-password');

module.exports = function(User) {
  User.beforeRemote("*", function(ctx, unused, next) {
    console.log(ctx.methodString, "was invoked remotely"); // customers.prototype.save was invoked remotely
    next();
  });

  User.afterRemote("prototype.patchAttributes", async function(
    ctx,
    user,
    next
  ) {
    if (ctx.args.data.isActive && user.signupAs == 'mentor') {
      var user = await app.models.TTUser.findById(user.id, {
        include: ["role", "userDetail"]
      });

      await app.models.Notification.createQueue(user.id);

      //get account address from blockchain
      var bcUser = await app.models.NFTToken.register(
        user.firstName + " " + user.lastName,
        user.role().name
      );

      //update address and key
      var count = await user.userDetail().updateAttributes({
        ethAddress: bcUser.account.address,
        ethKey: bcUser.account.privateKey
      });

      var url = config.externalUrl + "/signin";
      var supportUser = await app.models.Setting.findOne({
        where: {
          name: "support_username"
        }
      });
      var html = await ejs.renderFile(
        path.resolve(__dirname, "../../server/views/mentor-activated.ejs"),
        {
          signLink: url,
          firstName: user.firstName,
          supportUserName: supportUser.value,
          externalUrl: config.externalUrl
        },
        {
          async: true
        }
      );

      app.models.Email.send(
        {
          to: user.email,
          from: config.senderEmailAddress,
          subject: "MaaS Account Activated",
          html: html
        },
        function(err) {
          if (err)
            return console.log("> error sending account activation email");
          console.log("> sending accountactivation email to:", user.email);
        }
      );

      var referralDetail = await app.models.ReferralCode.findOne({
        where: {
          inviteeUserId: user.id
        }
      })
      var adminUser = await app.models.TTUser.findOne({
        where: {
          signupAs: "admin"
        }
      });

      if (user.companyId != null) {
        await user.updateAttributes({
          source: "listed"
        });
      } else if (referralDetail && referralDetail.invitedByUserId == adminUser.id) {
        await user.updateAttributes({
          source: "verified"
        });
      } else {
        await user.updateAttributes({
          source: "public"
        });
      }
    }
  });

  User.afterRemote("confirm", async function(ctx, unused, next) {
    try {
      var uid = ctx.args.uid;
      var user = await app.models.TTUser.findById(uid, {
        include: ["role", "userDetail"]
      });

      //set the public url
      user.patchAttributes({
        publicUrl: appConfig.profileSsr + uid
      });

      //update referral code status, if used
      if (user.referralCode && user.referralCode.length > 0) {
        var refCode = await app.models.ReferralCode.findOne({
          where: {
            code: user.referralCode
          },
          include: ["invitedByUser"]
        });
        if (refCode) {
          await refCode.updateAttributes({
            hasConfirmed: true
          });

          var numToken = await app.models.Setting.findOne({
            where: {
              name: "referral_reward_tokens"
            }
          });
          var email = refCode.invitedByUser().email;
          console.log("invited by user", email);

          var supportUser = await app.models.Setting.findOne({
            where: {
              name: "support_username"
            }
          });
          //send email notification
          try {
            var html = await ejs.renderFile(
              path.resolve(
                __dirname,
                "../../server/views/invite-confirmation.ejs"
              ),
              {
                externalUrl: config.externalUrl,
                invitedByUserFirstName: refCode.invitedByUser().firstName,
                inviteeUserName: user.firstName + " " + user.lastName,
                supportUserName: supportUser.value,
                numTokens: numToken.value
              },
              {
                async: true
              }
            );
            app.models.Email.send(
              {
                to: email,
                from: config.senderEmailAddress,
                subject: "Your MaaS referral has joined!",
                html: html
              },
              async function(err) {
                if (err) {
                  console.log("> error sending invite email");
                }
                console.log("> sending invite email to:", email);
              }
            );
          } catch (ex) {
            console.warn("Failed to process invitation to: " + email);
          } //send in-app notification

          await app.models.Notification.addAndSendMessage(
            {
              message: "joined using your referral",
              type: Constants.ACTIVITY_UPDATE,
              fnType: "notification",
              fnData: null,
              fromUserId: refCode.inviteeUserId,
              toUserId: refCode.invitedByUserId
            },
            refCode.invitedByUserId
          );

          var adminUser = await app.models.TTUser.findOne({
            where: {
              signupAs: "admin"
            }
          });
          var alToken = await app.models.NFTToken.allocateToken(adminUser.id, [
            {
              userId: refCode.invitedByUserId,
              numTokens: numToken.value
            }
          ]);
          if (alToken) {
            await refCode.updateAttributes({
              hasTokenAllocated: true
            });
          }
        } else {
          console.warn(
            "Specified referral code not found: " + user.referralCode
          );
        }
      }

      if (user.signupAs != "mentor") {
        await app.models.Notification.createQueue(user.id);

        //get account address from blockchain
        var bcUser = await app.models.NFTToken.register(
          user.firstName + " " + user.lastName,
          user.role().name
        );

        //update address and key
        var count = await user.userDetail().updateAttributes({
          ethAddress: bcUser.account.address,
          ethKey: bcUser.account.privateKey
        });
        await user.updateAttributes({
          isActive: true
        });
      }

      next();
    } catch (ex) {
      next(ex, null);
    }
  });

  User.getSkillsList = async function(skills) {
    var retSkills = [];
    if (skills) {
      var l = skills.length;
      for (var j = 0; j < l; j++) {
        retSkills.push(await app.models.Skill.findById(skills[j].skillId));
      }
    }

    return retSkills;
  };

  User.queryResult = async function(connector, query, params) {
    return new Promise(function(resolve, reject) {
      connector.query(query, params, function(err, units) {
        if (err) {
          return reject(err);
        }
        return resolve(units);
      });
    });
  };

  User.getPeopleMentoredCnt = async function(userId) {
    var status = await app.models.MeetingStatus.findOne({
      where: {
        name: "completed"
      }
    });
    var connector = app.models.Meeting.getConnector();

    var sql =
      "SELECT distinct seekerUserId from Meeting WHERE statusId=$1 AND mentorUserId=$2";

    var recs = await User.queryResult(connector, sql, [status.id, userId]);

    return recs.length;
  }

  User.afterRemote("find", async function(ctx, users, next) {
    try {
      var resUsers = ctx.result;

      for (var i = 0; i < resUsers.length; i++) {
        var u = resUsers[i];

        var skills = await u.skills();
        // var retSkills = [];
        // if (skills) {
        //     var l = skills.length;
        //     for (var j = 0; j < l; j++) {
        //         // skills[j].skillDetail = await app.models.Skill.findById(skills[j].skillId);
        //         retSkills.push(await app.models.Skill.findById(skills[j].skillId));
        //     }
        // }

        var peopleMentored = await app.models.TTUser.getPeopleMentoredCnt(u.id);

        u.skillList = await app.models.TTUser.getSkillsList(skills);
        u.peopleMentored = peopleMentored;

        var ud = u.userDetail();
        if (ud) {
          u.photoUrl = ud.photoUrl;
          // var user = await app.models.TTUser.findById(ud.userId);
          if (ud.ethAddress) {
            try {
              ud.tokenBalance = await app.models.NFTToken.tokenBalanceOfUser(
                ud.ethAddress
              );
            } catch (ex) {
              console.log("Could not get the banlance for: ", ud.ethAddress);
              ud.tokenBalance = 0;
            }
          }
        }

        //is there a FreeBusy account?
        var fb = await app.models.FreeBusy.findOne({
          where: {
            userId: u.id
          }
        });
        if (fb) {
          u.hasFreeBusyAccount = true;
        }
      }
    } catch (ex) {
      next(ex);
    }
  });

  User.beforeRemote("create", async function(ctx, unused, next) {
    var mobileNo = ctx.args.data.mobileNo;
    var users = await app.models.TTUser.find({
      where: {
        mobileNo: mobileNo
      }
    });

    if (users.length > 0) {
      throw "User with mobile number already exists.";
    }

    next();
  });

  User.afterRemote("create", async function(ctx, user, next) {
    try {
      var TTRole = User.app.models.TTRole;
      var RoleMapping = User.app.models.RoleMapping;
      var TTUserDetail = User.app.models.TTUserDetail;

      if (user.hidden) {
        return;
      }

      var userDetail = await TTUserDetail.create({
        photoUrl: "/assets/images/default-profile.png",
        avatarUrl: "/assets/images/default-profile.png",
        userId: user.id
      });

      var role = await TTRole.findOne({ where: { name: user.signupAs } });
      await user.updateAttribute("roleId", role.id);

      var role = await TTRole.findById(user.roleId);

      //make user an admin
      var principal = await role.principals.create({
        principalType: RoleMapping.USER,
        principalId: user.id
      });

      //update referral code status, if used
      if (user.referralCode && user.referralCode.length > 0) {
        var refCode = await app.models.ReferralCode.validate(user.referralCode);
        if (refCode) {
          await refCode.updateAttributes({
            hasSignedUp: true,
            inviteeUserId: user.id
          });
        } else {
          console.warn(
            "Specified referral code not found: " + user.referralCode
          );
        }
      }

      // verify user
      var supportUser = await app.models.Setting.findOne({
        where: {
          name: "support_username"
        }
      });
      var buildVerificationTemplate = async function(
        verifyOptions,
        options,
        setHtmlContentAndSend
      ) {
        verifyOptions.verifyHref = verifyOptions.verifyHref.replace(
          verifyOptions.host,
          config.externalIP
        );

        var html = await ejs.renderFile(
          path.resolve(__dirname, "../../server/views/signup-verification.ejs"),
          {
            verifyLink: verifyOptions.verifyHref,
            firstName: user.firstName,
            supportUserName: supportUser.value,
            externalUrl: config.externalUrl
          },
          {
            async: true
          }
        );

        setHtmlContentAndSend(null, html);
      };

      var options = {
        type: "email",
        to: user.email,
        from: config.senderEmailAddress,
        subject: "Please verify your email address",
        redirect: config.externalUrl + "/verified",
        templateFn: buildVerificationTemplate,
        user: user,
        validate: false
      };

      var verifyRes = await user.verify(options);

      next();
    } catch (ex) {
      next(ex, null);
    }
  });

  User.beforeRemote("login", async function(ctx, unused, next) {
    var email = ctx.args.credentials.email;

    var user = await app.models.TTUser.findOne({
      where: {
        email: email
      }
    });

    if (!user) {
      throw "Email address does not exist.";
    }

    if (user.signupAs == "mentor" && !user.isActive) {
      throw "Account is pending admin approval. You will be notified upon approval.";
    }
    next();
  });

  User.afterRemote("login", async function(ctx, token, next) {
    try {
      // var includes = ctx.args.include;

      var user = await app.models.TTUser.findById(ctx.result.userId, {
        include: ["role", "userDetail"]
      });

      ctx.result["firstName"] = user.firstName;
      ctx.result["lastName"] = user.lastName;
      ctx.result["email"] = user.email;
      ctx.result["companyId"] = user.companyId;
      ctx.result["role"] = user.role();
      ctx.result["userDetail"] = user.userDetail();

      next();
    } catch (ex) {
      next(ex, null);
    }
  });

  User.on("resetPasswordRequest", async function(info) {
    try {
      console.log("resetPasswordRequest event fired!! Sending email!");

      var url =
        config.externalUrl +
        "/reset-password" +
        "?access_token=" +
        info.accessToken.id;

      var supportUser = await app.models.Setting.findOne({
        where: {
          name: "support_username"
        }
      });
      var html = await ejs.renderFile(
        path.resolve(__dirname, "../../server/views/reset-password.ejs"),
        {
          resetPwdLink: url,
          supportUserName: supportUser.value,
          externalUrl: config.externalUrl
        },
        {
          async: true
        }
      );
      app.models.Email.send(
        {
          to: info.email,
          from: config.senderEmailAddress,
          subject: "Reset MaaS account password",
          html: html
        },
        function(err) {
          if (err) return console.log("> error sending password reset email");
          console.log("> sending password reset email to:", info.email);
        }
      );
    } catch (ex) {
      console.log(ex);
    }
  });

  User.bySkills = async function(filter, skills, next) {
    var users = [];
    if (skills.length == 0) {
      users = await app.models.TTUser.find(filter);
      for (var i = 0; i < users.length; i++) {
        var u = users[i];
        u.skillList = await app.models.TTUser.getSkillsList(await u.skills());
      }

      return users;
    }

    var arr = skills.split(",");
    var ln = arr.length;
    var ids = [];
    for (var i = 0; i < ln; i++) {
      var tmp = arr[i];
      var skills = await app.models.Skill.find({
        where: {
          name: {
            ilike: "%" + tmp + "%"
          }
        }
      });
      var skillsLn = skills.length;
      for (var j = 0; j < skillsLn; j++) {
        ids.push(skills[j].id);
      }
    }

    if (ids.length > 0) {
      var matchingUsers = await app.models.SelfAssessment.find({
        where: {
          skillId: {
            inq: ids
          }
        }
      });

      var l = matchingUsers.length;
      var userIds = [];
      for (var i = 0; i < l; i++) {
        userIds.push(matchingUsers[i].userId);
      }

      filter.where["id"] = {
        inq: userIds
      };
      users = await app.models.TTUser.find(filter);
      for (var i = 0; i < users.length; i++) {
        var u = users[i];
        u.skillList = await app.models.TTUser.getSkillsList(await u.skills());
      }
    }

    return users;
  };

  User.byLocation = async function(filter, location, next) {
    var users = [];

    if (location.length == 0) {
      users = await app.models.TTUser.find(filter);
      for (var i = 0; i < users.length; i++) {
        var u = users[i];
        u.skillList = await app.models.TTUser.getSkillsList(await u.skills());
      }

      return users;
    }

    var arr = location.split(",");
    var ln = arr.length;
    var countryIds = [];
    var stateIds = [];
    var cityIds = [];
    for (var i = 0; i < ln; i++) {
      var tmp = arr[i];
      var countries = await app.models.Country.find({
        where: {
          name: {
            ilike: "%" + tmp + "%"
          }
        }
      });
      var countriesLn = countries.length;
      for (var j = 0; j < countriesLn; j++) {
        countryIds.push(countries[j].id);
      }

      var states = await app.models.State.find({
        where: {
          name: {
            ilike: "%" + tmp + "%"
          }
        }
      });
      var statesLn = states.length;
      for (var j = 0; j < statesLn; j++) {
        stateIds.push(states[j].id);
      }

      var cities = await app.models.City.find({
        where: {
          name: {
            ilike: "%" + tmp + "%"
          }
        }
      });
      var citiesLn = cities.length;
      for (var j = 0; j < citiesLn; j++) {
        cityIds.push(cities[j].id);
      }
    }

    var users = [];

    if (countryIds.length > 0 || stateIds.length > 0 || cityIds.length > 0) {
      var matchingUsers = await app.models.TTUserDetail.find({
        where: {
          or: [
            {
              countryId: {
                inq: countryIds
              }
            },
            {
              stateId: {
                inq: stateIds
              }
            },
            {
              cityId: {
                inq: cityIds
              }
            }
          ]
        }
      });

      var l = matchingUsers.length;
      var userIds = [];
      for (var i = 0; i < l; i++) {
        userIds.push(matchingUsers[i].userId);
      }

      filter.where["id"] = {
        inq: userIds
      };
      users = await app.models.TTUser.find(filter);
      for (var i = 0; i < users.length; i++) {
        var u = users[i];
        u.skillList = await app.models.TTUser.getSkillsList(await u.skills());
      }
    }

    return users;
  };

  User.importFileAndGetFields = async function(attachment) {
    var retFields = {
      sourceFields: [],
      targetFields: [
        { name: "firstName", displayName: "First Name" },
        { name: "lastName", displayName: "Last Name" },
        { name: "dob", displayName: "Date of Birth" },
        { name: "mobileNo", displayName: "Mobile No" },
        { name: "email", displayName: "Email" }
      ]
    };

    var rootFolder = app.dataSources.container.settings.root;

    var filename =
      rootFolder + "/" + attachment.container + "/" + attachment.name;

    var workbook = new Excel.Workbook();
    var data = await workbook.xlsx.readFile(filename);

    var headerRow = data.worksheets[0].getRow(1).values;
    headerRow.splice(0, 1);

    var ln = headerRow.length;
    for (var i = 0; i < ln; i++) {
      retFields.sourceFields.push({
        name: headerRow[i],
        displayName: headerRow[i]
      });
    }

    return retFields;
  };

  User.import = async function(attachment, fieldsMap, companyId, next) {
    if (!fieldsMap) {
      var fields = await User.importFileAndGetFields(attachment);
      return fields;
    }

    var rootFolder = app.dataSources.container.settings.root;

    var filename =
      rootFolder + "/" + attachment.container + "/" + attachment.name;

    var workbook = new Excel.Workbook();
    var data = await workbook.xlsx.readFile(filename);

    var ws = data.worksheets[0];
    var rows = ws._rows;
    var headerRow = rows.splice(0, 1)[0]; //remove 1st row as header
    var headerValues = headerRow.values;
    headerValues.splice(0, 1);

    var role = await app.models.TTRole.findOne({
      where: {
        name: "mentor"
      }
    });

    var ln = rows.length;
    for (var i = 0; i < ln; i++) {
      var rowValues = rows[i].values;
      rowValues.splice(0, 1);

      var user = await User.create({
        firstName: rowValues[headerValues.indexOf(fieldsMap["firstName"])],
        lastName: rowValues[headerValues.indexOf(fieldsMap["lastName"])],
        mobileNo: rowValues[headerValues.indexOf(fieldsMap["mobileNo"])],
        email: rowValues[headerValues.indexOf(fieldsMap["email"])],
        password: Constants.DEFAULT_PASSWORD,
        signupAs: "mentor",
        iAccept: true,
        emailVerified: true,
        roleId: role.id,
        companyId: companyId
      });

      var userDetail = await app.models.TTUserDetail.create({
        photoUrl: "/assets/images/default-profile.png",
        avatarUrl: "/assets/images/default-profile.png",
        userId: user.id,
        companyId: companyId
      });

      //make user a mentor
      await role.principals.create({
        principalType: app.models.RoleMapping.USER,
        principalId: user.id
      });
    }

    return {
      count: ws.rowCount - 1
    };
  };

  User.invite = async function(ctx, emails) {
    const token = ctx && ctx.accessToken;
    const fromUserId = token && token.userId;

    var emailsWithoutSpace = emails.replace(/\s/g, "");
    var emailsArr = emailsWithoutSpace.split(",");
    console.log("string to emailsArr", emailsArr);

    var linkExpiry = await app.models.Setting.findOne({
      where: {
        name: "invitation_link_expiry"
      }
    });

    var url = config.externalUrl + "/signup";
    var supportUser = await app.models.Setting.findOne({
      where: {
        name: "support_username"
      }
    });

    var ln = emailsArr.length;

    for (var i = 0; i < ln; i++) {
      var email = emailsArr[i];

      var tmpUser = await app.models.TTUser.findOne({
        where: {
          email: email
        }
      });

      if (!tmpUser) {
        var referralCode = await app.models.ReferralCode.getCode();

        await referralCode.updateAttributes({
          invitedByUserId: fromUserId,
          inviteeEmail: email
        });

        try {
          var html = await ejs.renderFile(
            path.resolve(__dirname, "../../server/views/invite.ejs"),
            {
              referralCode: referralCode.code,
              expiryDuration: linkExpiry.value + " Days",
              externalUrl: config.externalUrl,
              invitedByUserName: "",
              supportUserName: supportUser.value,
              signUpLink: url + "?ref_code=" + referralCode.code
            },
            {
              async: true
            }
          );

          app.models.Email.send(
            {
              to: email,
              from: config.senderEmailAddress,
              subject: "Invitation to join MaaS",
              html: html
            },
            async function(err, res) {
              console.log("email - response\n\n", res);
              if (err) {
                console.log("> error sending invite email");
              } else {
                console.log("> sending invite email to:", email);
              }
            }
          );
          await referralCode.updateAttributes({
            inviteSent: true
          });
        } catch (ex) {
          console.warn("Failed to process invitation to: " + email);
        }
      } else {
        console.log("Email is already registered: " + email);
      }
    }
  };

  User.validateReferralCode = async function(code) {
    var rec = await app.models.ReferralCode.validate(code);

    return rec ? true : false;
  };

  User.signUpVisited = async function(code) {
    var rec = await app.models.ReferralCode.findOne({
      where: {
        code: code
      }
    });

    if (rec) {
      await rec.updateAttributes({
        hasOpened: true
      });
      var user = await app.models.TTUser.findOne({
        where: {
          id: rec.invitedByUserId
        }
      });

      return {
        signUpVisited: true,
        invitorRole: user.signupAs
      };
    } else {
      return {
        signUpVisited: false,
      };
    }
  };

  User.getPublicProfileDetail = async function(userId, next) {
    var u = await app.models.TTUser.findOne({
      where: {
        id: userId
      },
      include: ['userDetail', 'role', 'company']
    });

    var assessments = await app.models.SelfAssessment.find({
      where: {
        userId: userId
      },
      include: ['skill']
    });

    var skills = [];
    var ln = assessments.length;
    for (var i = 0; i < ln; i++) {
      var t = assessments[i];
      skills.push({
        name: t.skill().name,
        rating: t.rating
      });
    }

    var ud = await app.models.TTUserDetail.findOne({
      where: {
        userId: userId
      },
      include: ['country', 'state', 'city']
    });

    var location = [];
    if (ud) {
      if (ud.city()) location.push(ud.city().name);
      if (ud.state()) location.push(ud.state().name);
      if (ud.country()) location.push(ud.country().name);
    }

    u.peopleMentored = await this.getPeopleMentoredCnt(userId);
    u.skillsList = skills;
    u.location = location.join().replace(/,/g, ', ');

    return u;
  }

  User.addSponsor = async function(ctx, user, next) {
    try {
      var TTRole = User.app.models.TTRole;
      var RoleMapping = User.app.models.RoleMapping;
      var TTUserDetail = User.app.models.TTUserDetail;

      var role = await TTRole.findOne({ where: { name: 'sponsor' } });
      var company = await app.models.Company.findOne({
        where: {
          id: user.companyId
        }
      });
      var pwd = generator.generate({
        length: 10,
        numbers: true
      });

      var ttUser = await app.models.TTUser.create({
        mobileNo: user.mobileNo,
        iAccept: true,
        signupAs: 'sponsor',
        firstName: user.firstName,
        lastName: user.lastName,
        hidden: false,
        password: pwd,
        email: user.email,
        roleId: role.id,
        companyId: user.companyId
      });

      var userDetail = await TTUserDetail.create({
        photoUrl: "/assets/images/default-profile.png",
        avatarUrl: "/assets/images/default-profile.png",
        userId: ttUser.id
      });

      await ttUser.updateAttribute("roleId", role.id);

      var role = await TTRole.findById(ttUser.roleId);

      //make user an admin
      var principal = await role.principals.create({
        principalType: RoleMapping.USER,
        principalId: ttUser.id
      });

      // verify user
      var supportUser = await app.models.Setting.findOne({
        where: {
          name: "support_username"
        }
      });
      var buildVerificationTemplate = async function(
        verifyOptions,
        options,
        setHtmlContentAndSend
      ) {
        verifyOptions.verifyHref = verifyOptions.verifyHref.replace(
          verifyOptions.host,
          config.externalIP
        );

        var html = await ejs.renderFile(
          path.resolve(__dirname, "../../server/views/sponsor-signup-verification.ejs"),
          {
            verifyLink: verifyOptions.verifyHref,
            firstName: user.firstName,
            companyName: company.name,
            pwd: pwd,
            supportUserName: supportUser.value,
            externalUrl: config.externalUrl
          },
          {
            async: true
          }
        );

        setHtmlContentAndSend(null, html);
      };

      var options = {
        type: "email",
        to: ttUser.email,
        from: config.senderEmailAddress,
        subject: "Please verify your email address",
        redirect: config.externalUrl + "/verified",
        templateFn: buildVerificationTemplate,
        user: ttUser,
        validate: false
      };

      var verifyRes = await ttUser.verify(options);

      next();
    } catch (ex) {
      next(ex, null);
    }
  }

  User.remoteMethod("addSponsor", {
    description: "This method creates a new sponsor type user",
    accepts: [
      { arg: "ctx", type: "object", http: "optionsFromRequest" },
      { arg: "user", type: "object" }
    ],
    returns: { arg: "result", type: "object" }
  });

  User.remoteMethod("bySkills", {
    description: "This method returns users with matching skills",
    accepts: [
      { arg: "filter", type: "object" },
      { arg: "skills", type: "string" }
    ],
    returns: { arg: "result", type: "object" }
  });

  User.remoteMethod("byLocation", {
    description: "This method returns users with matching location",
    accepts: [
      { arg: "filter", type: "object" },
      { arg: "location", type: "string" }
    ],
    returns: { arg: "result", type: "object" }
  });

  User.remoteMethod("import", {
    description:
      "This method imports users as mentors from the specified attachment",
    accepts: [
      { arg: "attachment", type: "object" },
      { arg: "fieldsMap", type: "object" },
      { arg: "companyId", type: "number" }
    ],
    returns: { arg: "result", type: "object" }
  });

  User.remoteMethod("invite", {
    description: "This method sends out invitations",
    accepts: [
      { arg: "ctx", type: "object", http: "optionsFromRequest" },
      { arg: "emails", type: "string" }
    ],
    returns: { arg: "result", type: "object" }
  });

  User.remoteMethod("validateReferralCode", {
    description: "This method validates a referral code",
    accepts: [{ arg: "code", type: "string" }],
    returns: { arg: "result", type: "object" }
  });

  User.remoteMethod("signUpVisited", {
    description:
      "This method updates the flag indicating a user has opened the referral sign up link",
    accepts: [{ arg: "code", type: "string" }],
    returns: { arg: "result", type: "object" }
  });

  User.remoteMethod("getPublicProfileDetail", {
    description:
      "This method returns public profile detail for a user",
    accepts: [{ arg: "userId", type: "number" }],
    returns: { arg: "result", type: "object" }
  });
};
