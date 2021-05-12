"use strict";

var config = require("../../server/config.json");
var path = require("path");
var app = require("../../server/server");

module.exports = function(Skill) {
  Skill.beforeRemote("find", async function(ctx, unused, next) {
    try {
      var filter = ctx.args.filter;
      if (filter) {
        if (filter.where && !filter.where.all) {
          var skillIds = await app.models.SelfAssessment.getSkillIdsInUse(
            ctx.req.accessToken.userId
          );
          if (skillIds) {
            filter["where"]["id"] = {
              nin: skillIds
            };
          }
        }
      }
      next();
    } catch (ex) {
      next(ex, null);
    }
  });

  Skill.afterRemote('create', async function(ctx, skill, next) {
    await skill.updateAttributes({
      iconUrl: '/assets/images/default_skill.png'
    });
  });
};
