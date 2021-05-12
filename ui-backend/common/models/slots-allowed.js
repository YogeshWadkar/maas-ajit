"use strict";

var config = require("../../server/config.json");
var app = require("../../server/server");
var moment = require("moment");

module.exports = function(SlotsAllowed) {
  SlotsAllowed.afterRemote("find", async function(ctx, slots, next) {
    try {
      var returnData = {};
      var slots = ctx.result;
      var ln = slots.length;
      for (var i = 0; i < ln; i++) {
        var tmp = slots[i];
        var weekday = tmp.weekday().name;
        if (!returnData[weekday]) {
          returnData[weekday] = [];
        }
        returnData[weekday].push(tmp);
      }

      ctx.result = returnData;
      next();
    } catch (ex) {
      next(ex, null);
    }
  });

  SlotsAllowed.open = async function(ctx, weekdayId, date) {
    const token = ctx && ctx.accessToken;
    const userId = token && token.userId;

    var allowedSlots = await app.models.SlotsAllowed.find({
      where: {
        userId: userId,
        weekdayId: weekdayId
      },
      include: ["weekday"],
      order: "fromTm ASC"
    });

    var availableSlots = [];
    var bookedMap = {};
    var bookedSlots = await app.models.Meeting.getBookedSlots(userId, date);
    var bsLn = bookedSlots.length;
    for (var i = 0; i < bsLn; i++) {
      var t = bookedSlots[i];
      var fromTm = moment(t.fromTm).format("h:mm A");
      bookedMap[fromTm] = {}; //nothing to store
    }

    var asLn = allowedSlots.length;
    for (var i = 0; i < asLn; i++) {
      var t = allowedSlots[i];
      var fromTm = moment(t.fromTm).format("h:mm A");
      if (!bookedMap[fromTm]) {
        availableSlots.push(t);
      }
    }

    return availableSlots;
  };

  SlotsAllowed.weekdayWiseAvailableSlots = async function(ctx, weekdayId) {
    const token = ctx && ctx.accessToken;
    const userId = token && token.userId;

    var daywiseSlots = {};

    var filter = {
      order: "seq ASC"
    };
    if (weekdayId) {
      filter["where"] = {
        id: weekdayId
      };
    }
    var weekdays = await app.models.Weekday.find(filter);
    var slots = await app.models.Slot.find();
    var numSlots = slots.length;

    for (var j = 0; j < weekdays.length; j++) {
      //filter out the already added slots
      var slotsAllowed = await app.models.SlotsAllowed.find({
        where: {
          weekdayId: weekdays[j].id,
          userId: userId
        }
      });
      var slotMap = {};
      var saLn = slotsAllowed.length;
      for (var a = 0; a < saLn; a++) {
        var fromTm = moment(slotsAllowed[a].fromTm).format("h:mm A");
        // slotMap[fromTm] = {}; //nothing needs to be stored in the map
        slotMap[slotsAllowed[a].slotId] = {}; //nothing needs to be stored in the map
      }

      var availableSlots = [];

      for (var i = 0; i < numSlots; i++) {
        var s = slots[i];
        var fromTm = moment(s.fromTm).format("h:mm A");
        var toTm = moment(s.toTm).format("h:mm A");

        if (!slotMap[s.id]) {
          availableSlots.push({
            weekday: weekdays[j].name,
            fromTm: fromTm,
            toTm: toTm,
            duration: s.duration,
            slotid: s.id
          });
        }
      }
      daywiseSlots[weekdays[j].name] = availableSlots;
    }

    return daywiseSlots;
  };

  SlotsAllowed.dateWiseAvailableSlots = async function(ctx, date, weekdayId) {
    const token = ctx && ctx.accessToken;
    const userId = token && token.userId;

    var daywiseSlots = {};

    var filter = {
      order: "seq ASC"
    };
    if (weekdayId) {
      filter["where"] = {
        id: weekdayId
      };
    }
    var weekdays = await app.models.Weekday.find(filter);
    var slots = await app.models.Slot.find();
    var numSlots = slots.length;

    for (var j = 0; j < weekdays.length; j++) {
      //filter out the already added slots
      var slotsAllowed = await app.models.SlotsAllowed.find({
        where: {
          weekdayId: weekdays[j].id,
          userId: userId
        }
      });
      var slotMap = {};
      var saLn = slotsAllowed.length;
      for (var a = 0; a < saLn; a++) {
        var fromTm = moment(slotsAllowed[a].fromTm).format("h:mm A");
        // slotMap[fromTm] = {}; //nothing needs to be stored in the map
        slotMap[slotsAllowed[a].slotId] = {}; //nothing needs to be stored in the map
      }

      //filter out special day slots
      var fromDt = moment(date)
        .seconds(0)
        .minutes(0)
        .hours(0);
      var toDt = moment(date)
        .seconds(59)
        .minutes(59)
        .hours(23);
      var sdSlots = await app.models.SpecialDaySlot.find({
        where: {
          userId: userId,
          date: {
            between: [fromDt, toDt]
          }
        }
      });
      var sdsLn = sdSlots.length;
      for (var a = 0; a < sdsLn; a++) {
        var fromTm = moment(sdSlots[a].fromTm).format("h:mm A");
        // slotMap[fromTm] = {}; //nothing needs to be stored in the map
        slotMap[sdSlots[a].slotId] = {}; //nothing needs to be stored in the map
      }

      var availableSlots = [];

      for (var i = 0; i < numSlots; i++) {
        var s = slots[i];
        var fromTm = moment(s.fromTm).format("h:mm A");
        var toTm = moment(s.toTm).format("h:mm A");

        if (!slotMap[s.id]) {
          availableSlots.push({
            weekday: weekdays[j].name,
            fromTm: fromTm,
            toTm: toTm,
            duration: s.duration,
            slotid: s.id
          });
        }
      }
      daywiseSlots[weekdays[j].name] = availableSlots;
    }

    return daywiseSlots;
  };

  SlotsAllowed.availableForBooking = async function(ctx, userId, date, weekdayId) {
    var availableSlots = [];

    var fromDt = moment(date)
      .hours(0)
      .minutes(0)
      .seconds(0);
    var toDt = moment(date)
      .hours(23)
      .minutes(59)
      .seconds(59);

    var leaves = await app.models.Leave.find({
      where: {
        userId: userId,
        date: {
          between: [fromDt, toDt]
        }
      }
    });

    if (leaves.length > 0) {
      return availableSlots;
    }

    var allowedSlots = await app.models.SlotsAllowed.find({
      where: {
        userId: userId,
        weekdayId: weekdayId
      }
    });

    var sdSlots = await app.models.SpecialDaySlot.find({
      where: {
        userId: userId,
        date: {
          between: [fromDt, toDt]
        }
      }
    });

    //filter out booked slots, i.e. meetings
    var bookedSlotsMap = {};
    var meetings = await app.models.Meeting.getBookedSlots(userId, date);
    var mLn = meetings.length;
    for (var i = 0; i < mLn; i++) {
      var tm = moment(meetings[i].fromTm).format("h:mm A");
      bookedSlotsMap[tm] = {}; //nothing needs to be stored
    }

    var asLn = allowedSlots.length;
    for (var i = 0; i < asLn; i++) {
      var t = allowedSlots[i];
      var fromTm = moment(t.fromTm).format("h:mm A");
      if (!bookedSlotsMap[fromTm]) {
        availableSlots.push({
          fromTm: t.fromTm,
          toTm: t.toTm,
          duration: t.duration,
          id: t.id
        });
      }
    }
    var sdLn = sdSlots.length;
    for (var i = 0; i < sdLn; i++) {
      var t = sdSlots[i];
      var fromTm = moment(t.fromTm).format("h:mm A");
      if (!bookedSlotsMap[fromTm]) {
        availableSlots.push({
          fromTm: t.fromTm,
          toTm: t.toTm,
          duration: t.duration,
          id: t.id
        });
      }
    }

    function sortByTime(obj) {
      var sortable = [];
      for (var key in obj) sortable.push(obj[key]);

      // sort items by value
      sortable.sort(function(a, b) {
        return moment(a.fromTm).diff(moment(b.fromTm)); // compare numbers
      });
      return sortable;
    }

    var result = sortByTime(availableSlots);
    return result;
  };

  SlotsAllowed.remoteMethod("weekdayWiseAvailableSlots", {
    description: "This method returns weekday wise available slots",
    accepts: [
      { arg: "ctx", type: "object", http: "optionsFromRequest" },
      { arg: "weekdayId", type: "number" }
    ],
    returns: { arg: "result", type: "object" }
  });

  SlotsAllowed.remoteMethod("dateWiseAvailableSlots", {
    description: "This method returns date wise available slots",
    accepts: [
      { arg: "ctx", type: "object", http: "optionsFromRequest" },
      { arg: "date", type: "date" },
      { arg: "weekdayId", type: "number" }
    ],
    returns: { arg: "result", type: "object" }
  });

  SlotsAllowed.remoteMethod("availableForBooking", {
    description: "This method returns slots available for booking",
    accepts: [
      { arg: "ctx", type: "object", http: "optionsFromRequest" },
      { arg: "userId", type: "number" },
      { arg: "date", type: "date" },
      { arg: "weekdayId", type: "number" }
    ],
    returns: { arg: "result", type: "object" }
  });

  SlotsAllowed.remoteMethod("open", {
    description: "This method returns open slots (not booked)",
    accepts: [
      { arg: "ctx", type: "object", http: "optionsFromRequest" },
      { arg: "weekdayId", type: "number" },
      { arg: "date", type: "date" }
    ],
    returns: { arg: "result", type: "object" }
  });
};
