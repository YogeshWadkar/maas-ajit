"use strict";

var appConfig = require("../../server/app-config.json");
var app = require("../../server/server");

module.exports = function(CareerProfile) {

  CareerProfile.afterRemote('findById', async function(ctx, profile, next) {
    
    var profileSkills = await app.models.CareerProfileSkill.find({
      where: {
        profileId: profile.id
      },
      include: ['skill']
    });

    var cP = await app.models.SelfAssessment.find({
      where: {
        profileId: profile.id
      }
    });

    var skills = [];
    var ln = profileSkills.length;
    for (var i = 0; i < ln; i++) {
      skills.push(profileSkills[i].skill());
    }

    profile.skills = skills;

    function getUnique(arr, comp) {
      const unique = arr
        .map(e => e[comp])
        .map((e, i, final) => final.indexOf(e) === i && i)
        .filter(e => arr[e])
        .map(e => arr[e]); 
      return unique;
    }
    var uniqueCP = getUnique(cP, "userId");
    profile.usersReg = uniqueCP.length > 0 ? uniqueCP.length : 0;
  });

  CareerProfile.afterRemote("find", async function(ctx, profiles, next) {
    try {
      var pLn = profiles.length;
      for (var i = 0; i < pLn; i++) {
        var p = profiles[i];

        var profileSkills = await app.models.CareerProfileSkill.find({
          where: {
            profileId: p.id
          },
          include: ["skill"]
        });
        var skills = [];
        var ln = profileSkills.length;
        for (var j = 0; j < ln; j++) {
          skills.push(profileSkills[j].skill());
        }

        var cP = await app.models.SelfAssessment.find({
          where: {
            profileId: p.id
          }
        });

        function getUnique(arr, comp) {
          const unique = arr
            .map(e => e[comp])
            .map((e, i, final) => final.indexOf(e) === i && i)
            .filter(e => arr[e])
            .map(e => arr[e]); 
          return unique;
        }

        var uniqueCP = getUnique(cP, "userId"); // removing duplicate career profiles
        p.usersReg = uniqueCP.length > 0 ? uniqueCP.length : 0;
        p.skills = skills;
      }
  } catch (ex) {
    next(ex);
  }
  });

  CareerProfile.getProfileDetail = async function(profileId) {
    var profile = await app.models.CareerProfile.findById(profileId);

    var totalCompleted = 0;
    var totalCount = 0;

    if (!profile) {
      throw 'Requested profile does not exist';
    }

    var openAssessmentStatuses = await app.models.AssessmentStatus.find({
      where: {
        name: {
          inq: ['pending_approval', 'approved']
        }
      }
    });
    var openStatuses = [];
    var oasLn = openAssessmentStatuses.length;
    for (var i = 0; i < oasLn; i++) {
      openStatuses.push(openAssessmentStatuses[i].id);
    }

    var closeAssessmentStatuses = await app.models.AssessmentStatus.find({
      where: {
        name: 'completed'
      }
    });
    var closeStatuses = [];
    var oasLn = closeAssessmentStatuses.length;
    for (var i = 0; i < oasLn; i++) {
      closeStatuses.push(closeAssessmentStatuses[i].id);
    }

    //get all the levels
    var levels = await app.models.AssessmentLevel.find({
      order: 'seq ASC'
    });

    var lLn = levels.length;
    var levelSkills = {};
    for (var j = 0; j < lLn; j++) {
      var l = levels[j];

      if (!levelSkills[l.name]) {
        levelSkills[l.name] = [];
      }

      var selfAssessments = await app.models.SelfAssessment.find({
        where: {
          profileId: profileId
        },
        include: ['skill'],
        order: 'createdon ASC'
      });
  
      var skills = [];
      var levelCompleted = 0;
      var ln = selfAssessments.length;
      for (var i = 0; i < ln; i++) {
        var sa = selfAssessments[i];
        var skill = sa.skill();
  
        //find out the mentor
        var assReq = await app.models.AssessmentRequest.findOne({
          where: {
            selfAssessmentId: sa.id,
            statusId: {
              inq: closeStatuses.concat(openStatuses)
            },
            levelId: l.id
          },
          include: ['mentorUser', 'status']
        });

        if (assReq) {
          var mentor = assReq.mentorUser();
          var ud = await app.models.TTUserDetail.findById(mentor.id);

          skill.mentor =  {
            avatarUrl: ud.avatarUrl,
            firstName: mentor.firstName,
            lastName: mentor.lastName
          }

          var idx = closeStatuses.indexOf(assReq.status().id);
          skill.hasAssessmentCompleted = idx > -1 ? true : false;
          levelCompleted += idx > -1 ? 1 : 0;
          
        } else {
          skill.mentor = null;
          skill.hasAssessmentCompleted = false;
        }
  
        skills.push(skill);
      }
      levelSkills[l.name] = {
        progress: ln ? ((levelCompleted/ln)*100).toFixed(2) : 0,
        skills: skills
      }

      totalCount += ln ? ln : 0;
      totalCompleted += ln ? levelCompleted : 0;
    }

    profile.skills = levelSkills;
    profile.progress = lLn ? ((totalCompleted/totalCount)*100).toFixed(2) : 0;

    return profile;
  }

  CareerProfile.progressReport = async function(ctx, profileId) {

    const token = ctx && ctx.accessToken;
    const userId = token && token.userId;

    var profile = await this.getProfileDetail(profileId);
    return profile;
  }

  CareerProfile.afterRemote("create", async function(ctx, careerProfile, next) {
    try {
      var status = await app.models.CareerProfileStatus.findOne({
        where: {
          name: "draft"
        }
      });

      await careerProfile.updateAttributes({
        statusId: status.id,
        iconUrl: '/assets/images/default_profile.png'
      });
      try {
        if (careerProfile.skills && careerProfile.skills.length > 0) {
          var skills = careerProfile.skills;
          var sLn = skills.length;
          for (var i = 0; i < sLn; i++) {
            await app.models.CareerProfileSkill.create({
              profileId: careerProfile.id,
              skillId: skills[i]
            });
          }
        }
      } catch (error) {
        throw error
      }
      

      next();
    } catch (ex) {
      next(ex);
    }
  });

  CareerProfile.afterRemote("prototype.patchAttributes", async function(
    ctx,
    profile,
    next
  ) {
    try {
      var status = await app.models.CareerProfileStatus.findOne({
        where: {
          name: "draft"
        }
      });
      if (profile.statusId == status.id) {
        await app.models.CareerProfileSkill.destroyAll({
          profileId: profile.id
        });
  
        var skills = profile.skills;
        var sLn = skills.length;
        if (skills && sLn > 0) {
          for (var i = 0; i < sLn; i++) {
            await app.models.CareerProfileSkill.create({
              profileId: profile.id,
              skillId: skills[i]
            });
          }
        }
      }
    } catch (error) {
      throw error
    }
  });

  CareerProfile.availableCP = async function(ctx, statusId, next) {
    try {
      const token = ctx && ctx.accessToken;
      const userId = token && token.userId;

      var filter = {
        order: "createdon DESC",
        include: ['status']
      };
      if (statusId) {
        filter["where"] = {
          statusId: statusId
        };
      }
      var allCPs = await app.models.CareerProfile.find(filter);  // skills are not included by default

      var pLn = allCPs.length;
      for (var i = 0; i < pLn; i++) {
        var p = allCPs[i];

        var profileSkills = await app.models.CareerProfileSkill.find({
          where: {
            profileId: p.id
          },
          include: ["skill"]
        });
        var skills = [];
        var ln = profileSkills.length;
        for (var j = 0; j < ln; j++) {
          skills.push(profileSkills[j].skill());
        }
        p.skills = skills;
      }
      var seekerCPsObj = await app.models.CareerProfile.getSeekerCP();
      var seekerCPs = seekerCPsObj["data"];

      if ( seekerCPs.length > 0 ) {
        var allCPIds = [];
        var seekerCPIds = [];

        allCPs.forEach(element => {
          allCPIds.push(element.id)
        });
        seekerCPs.forEach(element => {
          seekerCPIds.push(element.id)
        });

        var availableCpIds = allCPIds.filter(x => !seekerCPIds.includes(x));

        var availableCPs = allCPs.filter((el) => {
          return availableCpIds.some((f) => {
            return f === el.id;
          });
        });

        return {
          data: availableCPs ? availableCPs : [],
          count: availableCPs ? availableCPs.length : 0
        }
      } else {
        return {
          data: allCPs ? allCPs : [],
          count: allCPs ? allCPs.length : 0
        }
      }
    } catch (error) {
      throw error
    }
  };

  CareerProfile.unpublish = async function(cProfileId, statusId, next) {
    var cP = await app.models.SelfAssessment.find({
      where: {
        profileId: cProfileId
      }
    });
    var careerProfile = await app.models.CareerProfile.findOne({
      where: {
        id: cProfileId
      }
    });

    if (cP.length > 0) {
      throw "Users are registered. Cannot be unpublished";
    } else {
      await careerProfile.updateAttributes({
        statusId: statusId
      });
    }
  };

  CareerProfile.addCP = async function(cProfileId, userId, next) {
    try {
      var selfAssessment = await app.models.SelfAssessment.find({
        where: {
          userId: userId
        }
      });
      var cPskills = await app.models.CareerProfileSkill.find({
        where: {
          profileId: cProfileId
        }
      });
      var level = await app.models.AssessmentLevel.findOne({
        where: {
          seq: 1
        }
      })

      var selfAssessmentSkillIds = [];
      var cPSkillIds = [];

      selfAssessment.forEach(element => {
        selfAssessmentSkillIds.push(element.skillId);
      });

      cPskills.forEach(element => {
        cPSkillIds.push(element.skillId);
      });

      // var intersection = cPSkillIds.filter(x => selfAssessmentSkillIds.includes(x));
      var doNotMatch = selfAssessment.length > 0 ? cPSkillIds.filter(x => !selfAssessmentSkillIds.includes(x)) : cPSkillIds;
      
      if (selfAssessment.length > 0) {
        for (var j = 0; j < cPskills.length; j++) {
          for (var i = 0; i < selfAssessment.length; i++) {
            if (cPskills[j]["skillId"] == selfAssessment[i]["skillId"]) {
              if (selfAssessment[i]["level"] == null) {
                await selfAssessment[i].updateAttributes({
                  profileId: cProfileId,
                  level: level.name
                });
              } else {
                var skill = await app.models.Skill.findOne({
                  where : {
                    id : selfAssessment[i]["skillId"]
                  }
                })
                await app.models.SelfAssessment.create([
                  { level: level.name, userId: userId, skillId: selfAssessment[i]["skillId"], profileId: cProfileId, categoryId: skill.categoryId}
                ]);
              }
            }
          }
        } 
      }
      if (doNotMatch.length>0) {
        for (var i = 0; i < doNotMatch.length; i++) {
          var skill = await app.models.Skill.findOne({
            where : {
              id : doNotMatch[i]
            }
          })
          await app.models.SelfAssessment.create([
            { level: level.name, userId: userId, skillId: doNotMatch[i], profileId: cProfileId, categoryId: skill.categoryId}
          ]);
        }
      }
      
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  CareerProfile.removeCP = async function(cProfileId, userId, next) {
    try {
      await app.models.SelfAssessment.destroyAll({
          userId : userId,
          profileId : cProfileId
      })
      
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  CareerProfile.getSeekerCP = async function(ctx, id) {
    const token = ctx && ctx.accessToken;
    const userId = token && token.userId;

    try {
      var selfAssessment = await app.models.SelfAssessment.find({
        where: {
          userId: userId
        }
      });
      var profileIds = [];
      selfAssessment.forEach(element => {
        profileIds.push(element.profileId);
      });

      var profileIds = profileIds.filter(element => {
        return element != null;
      });

      var cProfiles = await app.models.CareerProfile.find({
        where: {
          id: {
            inq: profileIds
          }
        }
      });
      for (var i = 0; i < cProfiles.length; i++) {
        var p = cProfiles[i];

        var profileDetail = await this.getProfileDetail(p.id);

        var profileSkills = await app.models.CareerProfileSkill.find({
          where: {
            profileId: p.id
          },
          include: ['skill']
        });
    
        var skills = [];
        var ln = profileSkills.length;
        for (var j = 0; j < ln; j++) {
          skills.push(profileSkills[j].skill());
        }
    
        p.skills = skills;
        p.progress = profileDetail.progress;
      }
      return {
        data: cProfiles ? cProfiles : [],
        count: cProfiles ? cProfiles.length : 0
      };
      
      // var selfAssessment = await app.models.TTUser.find({
      //   where: {
      //     id: userId
      //   },
      //   include: ["skills"]
      // }); 

    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  CareerProfile.remoteMethod("availableCP", {
    description: "This method returns available Career Profiles for a Seeker",
    accepts: [
      { arg: "ctx", type: "object", http: "optionsFromRequest" },
      { arg: "statusId", type: "number" }
    ],
    returns: { arg: "result", type: "object" }
  });

  CareerProfile.remoteMethod("unpublish", {
    description: "This method returns unpublish detail for a career profile",
    accepts: [
      { arg: "cProfileId", type: "number" },
      { arg: "statusId", type: "number" }
    ],
    returns: { arg: "result", type: "object" }
  });

  CareerProfile.remoteMethod("addCP", {
    description: "This method adds career profile to seeker",
    accepts: [
      { arg: "cProfileId", type: "number" },
      { arg: "userId", type: "number" }
    ],
    returns: { arg: "result", type: "object" }
  });

  CareerProfile.remoteMethod("removeCP", {
    description: "This method removes career profile from seeker section",
    accepts: [
      { arg: "cProfileId", type: "number" },
      { arg: "userId", type: "number" }
    ],
    returns: { arg: "result", type: "object" }
  });

  CareerProfile.remoteMethod("getSeekerCP", {
    description: "This method returns career profiles of a seeker based on userId",
    accepts: [
      {arg: 'ctx', "type": "object", "http": "optionsFromRequest"}
    ],
    returns: { arg: "result", type: "object" }
  });

  CareerProfile.remoteMethod("progressReport", {
    description: "This method returns career profiles progress report for an user",
    accepts: [
      {arg: 'ctx', "type": "object", "http": "optionsFromRequest"},
      {arg: 'profileId', "type": "number", required: true}
    ],
    returns: { arg: "result", type: "object" }
  });

};
