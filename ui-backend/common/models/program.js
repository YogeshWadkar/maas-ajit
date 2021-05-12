"use strict";

var config = require("../../server/config.json");
var appConfig = require("../../server/app-config.json");
var Constants = require("../../server/constants.json");
var path = require("path");
var app = require("../../server/server");
var ejs = require("ejs");

module.exports = function(Program) {

  Program.beforeRemote("deleteById", async function(ctx, unused, next) {
    var pid = ctx.args.id;
    
    var draftStatus = await app.models.ProgramStatus.findOne({
      where: {
        name: 'draft'
      }
    });

    var program = await app.models.Program.findById(pid);
    if (!program) {
      throw 'Program does not exist';
    }
    
    if (program && program.statusId == draftStatus.id) {
      next();
    } 
    
    throw 'Program is not in draft status';

  });

  Program.afterRemote("deleteById", async function(ctx, unused, next) {

    var pid = ctx.args.id;

    //delete associated mentors
    await app.models.ProgramMentor.destroyAll({
      programId: pid
    });
    next();
  });

  Program.getMentors = async function(programId) {
    var mIds = [];
    var mentors = await app.models.ProgramMentor.find({
      where: {
        programId: programId
      }
    });

    if (mentors && mentors.length > 0) {
      var mLn = mentors.length;
      for (var i = 0; i < mLn; i++) {
        mIds.push(mentors[i].userId);
      }
    }
    return mIds;
  }

  Program.afterRemote("find", async function(ctx, programs, next) {
    try {
      var pLn = programs.length;
      for (var i = 0; i < pLn; i++) {
        var p = programs[i];
        p.mentors = await app.models.Program.getMentors(p.id);
      }
  } catch (ex) {
    next(ex);
  }
  });

  Program.afterRemote("findById", async function(ctx, program, next) {
    try {
        program.mentors = await app.models.Program.getMentors(program.id);
      next();
    } catch (ex) {
      next(ex);
    }
  });

  Program.afterRemote("create", async function(ctx, program, next) {
    try {
      var status = await app.models.ProgramStatus.findOne({
        where: {
          name: "draft"
        }
      });

      await program.updateAttributes({
        statusId: status.id
      });

      if (program.mentors && program.mentors.length > 0) {
        var mentors = program.mentors;
        var mLn = mentors.length;
        for (var i = 0; i < mLn; i++) {
          await app.models.ProgramMentor.create({
            userId: mentors[i],
            programId: program.id
          });
        }
      }

      next();
    } catch (ex) {
      next(ex);
    }
  });

    Program.afterRemote("prototype.patchAttributes", async function(
        ctx,
        program,
        next
      ) {
        const token = ctx && ctx.args.options.accessToken;
        const userId = token && token.userId;

        if (!ctx.args.data.statusId) {
          //re-create mentors
          await app.models.ProgramMentor.destroyAll({
            programId: program.id
          });

          if (program.mentors && program.mentors.length > 0) {
            var mentors = program.mentors;
            var mLn = mentors.length;
            for (var i = 0; i < mLn; i++) {
              await app.models.ProgramMentor.create({
                userId: mentors[i],
                programId: program.id
              });
            }
          }
        }

        if (ctx.args.data.statusId) {
          var statusId = ctx.args.data.statusId;
    
          var status = await app.models.ProgramStatus.findById(statusId);
          if (status.name == "published") {
            await program.patchAttributes({
                publicUrl: appConfig.programSsr + program.id,
                modifiedon: new Date()
            });
          } else {
            await program.patchAttributes({
              modifiedon: new Date()
            });
          }
        }

        next();
    });

  Program.getPublicProgramDetail = async function(programId, next) {
    var p = await app.models.Program.findOne({
      where: {
        id: programId
      },
      include: []
    });

    await app.models.ProgramMetric.create({
      type: 'linkopened',
      programId: programId,
      on: new Date()
    });

    return p;
  };

  Program.allocateToken = async function(
    ctx,
    programId,
    numTokensToMentors,
    numTokensToParticipants
  ) {
    try {
      const token = ctx && ctx.accessToken;
      const fromUserId = token && token.userId;

      var mentors = await app.models.ProgramMentor.find({
        where: {
          programId: programId
        }
      });

      if (mentors && mentors.length > 0) {
        var mLn = mentors.length;

        var allocations = [];
        for (var i = 0; i < mLn; i++) {
            allocations.push({
                userId: mentors[i].userId,
                numTokens: numTokensToMentors
            });
        }
      }

      var participants = await app.models.ProgramEnrolment.find({
        where: {
          programId: programId
        }
      });

      if (participants && participants.length > 0) {
        var pLn = participants.length;

        var allocations = [];
        for (var i = 0; i < pLn; i++) {
            var uid = participants[i].userId;
            var verifiedUser = await app.models.TTUser.findOne({
                where: {
                    id: uid,
                    emailVerified: true
                }
            });

            if (verifiedUser) {
                allocations.push({
                    userId: uid,
                    numTokens: numTokensToParticipants
                });
            }
        }
      }

      if (allocations.length > 0) {
        await app.models.NFTToken.allocateToken(fromUserId, allocations);

        var program = await app.models.Program.findById(programId);
        program.updateAttributes({
          hasTokenAlloted: true,
          tokenAllotedByUserId: fromUserId,
          tokenAllotedOn: new Date()
        });
      }

    } catch (error) {
      // console.log("this is allocate token exception", ex);
      throw error;
    }
  }

  Program.metrics = async function(ctx, programId) {
    var linkOpenedCnt = await app.models.ProgramMetric.count({
      programId: programId,
      type: 'linkopened'
    });

    var requestCnt = await app.models.ProgramEnrolment.count({
      programId: programId
    });

    var mentorCnt = await app.models.ProgramMentor.count({
      programId: programId
    });

    return [{
      linkOpenedCnt: linkOpenedCnt,
      requestCnt: requestCnt,
      mentorCnt: mentorCnt
    }]
  }

  Program.issueCert = async function(ctx, programId, next) {
    try {
      const token = ctx && ctx.accessToken;
      const userId = token && token.userId;

      var program = await app.models.Program.findById(programId);
      if (!program) {
        throw 'No program found';
      }

      var completedStatus = await app.models.ProgramStatus.findOne({
        where: {
          name: 'completed'
        }
      });
      if (program.statusId != completedStatus.id) {
        throw 'Program is not in the desired status';
      }

      var user = await app.models.TTUser.findById(userId);
      //TODO: check if the user is authorised to issue
      program.patchAttributes({
        hasCertificateIssued: true,
        certIssuedOn: new Date(),
        certIssuedByUserId: userId
      });

      //notify participants
      //TODO - this needs to be moved outside of this as a separate job as this will not scale for large programs
      var enrollments = await app.models.ProgramEnrolment.find({
        where: {
          programId: programId
        }
      });

      var ln = enrollments.length;
      for (var i = 0; i < ln; i++) {
        var user = await app.models.TTUser.findById(enrollments[i].userId, {
          include: ['role']
        });
        var url = config.externalUrl + "/" + user.role().name + "/program-requests";
        var supportUser = await app.models.Setting.findOne({
          where: {
            name: "support_username"
          }
        });
        var html = await ejs.renderFile(
          path.resolve(__dirname, "../../server/views/certificate-issued.ejs"),
          {
            viewLink: url,
            firstName: user.firstName,
            supportUserName: supportUser.value,
            programName: program.name,
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
            subject: "Certificate is ready for download",
            html: html
          },
          function(err) {
            if (err)
              return console.log("> error sending certificate issued email");
            console.log("> sending certificate issued email to:", user.email);
          }
        );
      }
    } catch(ex) {
      next(ex)
    }
  }

  Program.remoteMethod("allocateToken", {
    description: "This method allocates tokens and updates program for the same",
    accepts: [
      { arg: "ctx", type: "object", http: "optionsFromRequest" },
      { arg: "programId", type: "number" },
      { arg: "numTokensToMentors", type: "number" },
      { arg: "numTokensToParticipants", type: "number" }
    ],
    returns: { arg: "result", type: "object" }
  });

  Program.remoteMethod("getPublicProgramDetail", {
    description: "This method returns public detail for a sponsor program",
    accepts: [{ arg: "programId", type: "number" }],
    returns: { arg: "result", type: "object" }
  });

  Program.remoteMethod("metrics", {
    description: "This method returns program performance metrics",
    accepts: [
      { arg: "ctx", type: "object", http: "optionsFromRequest" },
      { arg: "programId", type: "number" }
    ],
    returns: { arg: "result", type: "object" }
  });

  Program.remoteMethod("issueCert", {
    description: "This method marks the program to issue certificates",
    accepts: [
      { arg: "ctx", type: "object", http: "optionsFromRequest" },
      { arg: "programId", type: "number" }
    ],
    returns: { arg: "result", type: "object" }
  });
};
