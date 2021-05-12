"use strict";

var app = require("../../server/server");
var moment = require("moment");

module.exports = function(Slot) {

  Slot.beforeRemote("create", async function(ctx, unused, next) {
    await Slot.deleteAll();
    next();
  });

  Slot.generate = async function() {
    await Slot.deleteAll();

    var daywiseSlots = {};

    var dfltSlotDuration = await app.models.Setting.findOne({
      where: {
        name: "default_slot_duration"
      }
    });
    var gapBetweenMeetings = await app.models.Setting.findOne({
      where: {
        name: "gap_between_meetings"
      }
    });
    var slotDuration = dfltSlotDuration.value * 1;
    gapBetweenMeetings = gapBetweenMeetings.value * 1; //in minutes

    var numSlots = Math.floor((24 * 60) / (slotDuration + gapBetweenMeetings));

    var now = moment();
    now
      .second(0)
      .minute(0)
      .hour(0)
      .millisecond(0);

    var count = 0;

    for (var i = 0; i < numSlots; i++) {
      var fromTm = now.toDate();
      var toTm = now.add(slotDuration, "m").toDate();

      await Slot.create({
        fromTm: fromTm,
        toTm: toTm,
        duration: slotDuration
      });
      ++count;
      now = now.add(gapBetweenMeetings, "m");
    }

    return count;
  };
};
