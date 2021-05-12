"use strict";

var config = require("../../server/config.json");
var path = require("path");
var app = require("../../server/server");
var ejs = require("ejs");

module.exports = function(UserDetail) {
  UserDetail.afterRemote("find", async function(ctx, results, next) {
    try {
      var ln = results.length;
      for (var i = 0; i < results.length; i++) {
        var ud = results[i];
        var user = await app.models.TTUser.findById(ud.userId);
        if (user.ethAddress) {
          ud.tokenBalance = await app.models.NFTToken.tokenBalanceOfUser(
            user.ethAddress
          );
        }
      }
      next();
    } catch (ex) {
      next();
    }
  });

  UserDetail.afterRemote("replaceOrCreate", async function(ctx, user, next) {
    var firstName = user.firstName;
    var lastName = user.lastName;

    var u = await app.models.TTUser.findById(user.userId);

    if (firstName || lastName) {
      await u.updateAttributes({
        firstName: firstName,
        lastName: lastName
      });
    }

    next();
  });
};
