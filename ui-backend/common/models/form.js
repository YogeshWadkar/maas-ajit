"use strict";

var config = require("../../server/config.json");
var appConfig = require("../../server/app-config.json");
var Constants = require("../../server/constants.json");
var path = require("path");
var app = require("../../server/server");

module.exports = function(Form) {

    Form.afterRemote("create", async function(ctx, form, next) {
    try {
      var status = await app.models.FormStatus.findOne({
        where: {
          name: "draft"
        }
      });

      await form.updateAttributes({
        statusId: status.id
      });

      next();
    } catch (ex) {
      next(ex);
    }
  });
};
