"use strict";

var config = require("../../server/config.json");
var path = require("path");
var app = require("../../server/server");

var moment = require("moment");

module.exports = function(ReferralCode) {
  ReferralCode.getCode = async function() {
    function getRndInteger(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }

    async function getUniqueCode() {
      var chrPool =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

      var code = [];
      for (var i = 0; i < 6; i++) {
        var idx = getRndInteger(0, 61);
        code.push(chrPool[idx]);
      }

      var val = code.join("");
      var rec = await ReferralCode.create({
        code: val
      });

      return rec;
    }

    var rec;
    try {
      rec = await getUniqueCode();
    } catch (ex) {
      console.log(ex);
      rec = await getUniqueCode();
    }

    return rec;
  };

  ReferralCode.validate = async function(code) {
    var refCode = await app.models.ReferralCode.findOne({
      where: {
        code: code
      }
    });

    //TODO: Check if the code has not expired
    var linkExpiry = await app.models.Setting.findOne({
      where: {
        name: "invitation_link_expiry"
      }
    });

    if (linkExpiry) {
      var valInDays = parseInt(linkExpiry.value);
      var sentDt = moment(refCode.invitedOnDtm);
      var now = moment();
      if (now.diff(sentDt, "days") > valInDays) {
        console.warn("Token has expired: ", code);
        return null;
      }
    }

    return refCode;
  };
};
