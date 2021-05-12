"use strict";

var config = require("../../server/config.json");
var path = require("path");
var app = require("../../server/server");

var cloneDeep = require('lodash.clonedeep');

module.exports = function(SelfAssessment) {

  SelfAssessment.afterRemote('find', async function(ctx, assessments, next) {

    var ln = assessments.length;

    var levels;
    if (ln > 0) {
      levels = await app.models.AssessmentLevel.find({
        order: 'seq ASC'
      });

      var statuses = await app.models.AssessmentStatus.find({
        where: {
          name: {
            inq: ['pending_approval', 'approved']
          }
        }
      });

      var statusIds = [];
      var sLn = statuses.length;
      if ( sLn > 0) {
        for (var i = 0; i < sLn; i++) {
          statusIds.push(statuses[i].id);
        }
      }

      var lln = levels.length;

      for (var i = 0; i < ln; i++) {
        var a = assessments[i];

        for (var j = 0; j < lln; j++) {
          var l = levels[j];

          var assessReq = await app.models.AssessmentRequest.findOne({
            where: {
              selfAssessmentId: a.id, 
              levelId: l.id,
              hasRecommendedForNextLevel: true
            }
          });

          if (assessReq) {
            l.rating = assessReq.rating;
            l.recommendation = assessReq.recommendation;
            l.hasRecommendedForNextLevel = true;
            l.requestId = assessReq.id;
          } else {
            l.hasRecommendedForNextLevel = false;

            //is there any pending assessment request
            var pendingReq = await app.models.AssessmentRequest.findOne({
              where: {
                selfAssessmentId: a.id, 
                levelId: l.id,
                statusId: {
                  inq: statusIds
                }
              }
            });
            if (pendingReq) {
              l.requestId = pendingReq.id;
              l.hasPendingRequest = true;
            } else {
              l.hasPendingRequest = false;
            }
          }

          a[l.name] = cloneDeep(l);
        }
      }

      console.log('Retiuring: ', assessments);
    }

  });

  SelfAssessment.getSkillIdsInUse = async function(userId) {
    var assessments = await app.models.SelfAssessment.find({
      fields: {
        skillId: true
      },
      where: {
        userId: userId
      }
    });
    var ln = assessments.length;
    var retIds = [];
    for (var i = 0; i < ln; i++) {
      retIds.push(assessments[i].skillId);
    }
    return retIds;
  };

  SelfAssessment.overallAssessment = async function(categoryId, userId) {
    try {
      var skills = await app.models.Skill.find({
        where: {
          categoryId: categoryId
        }
      });

      var skillIds = [];
      for (var i = 0; i < skills.length; i++) {
        skillIds.push(skills[i].id);
      }

      var selfAssmts = await app.models.SelfAssessment.find({
        where: {
          userId: userId,
          skillId: {
            inq: skillIds
          }
        },
        include: ["skill", "category"]
      });

      var totalRating = 0;
      for (var i = 0; i < selfAssmts.length; i++) {
        var tmp = selfAssmts[i];
        var mentorAssmts = await app.models.MentorAssessment.find({
          where: {
            selfAssessmentId: tmp.id
          }
        });

        for (var j = 0; j < mentorAssmts.length; j++) {
          totalRating += mentorAssmts[j].rating;
        }

        tmp["agvMentorRating"] = totalRating / mentorAssmts.length;

        totalRating = 0;
      }

      return selfAssmts;
    } catch (ex) {
      throw ex;
    }
  };

  SelfAssessment.remoteMethod("overallAssessment", {
    accepts: [
      { arg: "categoryId", type: "number" },
      { arg: "userId", type: "number" }
    ],
    http: { verb: "post" },
    returns: { arg: "result", type: "any" }
  });
};
