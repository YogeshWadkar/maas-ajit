"use strict";

var config = require("../../server/config.json");
var app = require("../../server/server");
var moment = require("moment");
var Constants = require("../../server/constants.json");

module.exports = function(Meeting) {
  Meeting.afterRemote("create", async function(ctx, meeting, next) {
    try {
      //set meeting id and status
      var randNum = Math.random()
        .toString()
        .slice(2, 11);
      var meetingId =
        randNum.substr(0, 3) +
        "-" +
        randNum.substr(3, 3) +
        "-" +
        randNum.substr(6, 3);

      var status = await app.models.MeetingStatus.findOne({
        where: {
          name: "pending_approval"
        }
      });

      await meeting.updateAttributes({
        meetingId: meetingId,
        statusId: status.id
      });

      next();
    } catch (ex) {
      next(ex);
    }
  });

  Meeting.getBookedSlots = async function(userId, date) {
    var status = await app.models.MeetingStatus.findOne({
      where: { name: "rejected" }
    });

    var fromDt = moment(date)
      .hours(0)
      .minutes(0)
      .seconds(0);
    var toDt = moment(date)
      .hours(23)
      .minutes(59)
      .seconds(59);

    var bookedMeetings = await Meeting.find({
      where: {
        mentorUserId: userId,
        date: {
          between: [fromDt, toDt]
        },
        statusId: {
          neq: status.id
        }
      }
    });

    var ln = bookedMeetings.length;
    var slots = [];
    for (var i = 0; i < ln; i++) {
      var tmp = bookedMeetings[i];
      slots.push({
        fromTm: tmp.fromTm,
        toTm: tmp.toTm
      });
    }

    return slots;
  };

  Meeting.booked = async function(ctx, date) {
    const token = ctx && ctx.accessToken;
    const userId = token && token.userId;

    var slots = await Meeting.getBookedSlots(userId, date);

    return slots;
  };

  Meeting.afterRemote("prototype.patchAttributes", async function(
    ctx,
    meeting,
    next
  ) {
    const token = ctx && ctx.args.options.accessToken;
    const userId = token && token.userId;

    if (ctx.args.data.statusId) {
      var statusId = ctx.args.data.statusId;

      var status = await app.models.MeetingStatus.findById(statusId);
      if (status.name == "approved") {
        var startTm = moment(meeting.fromTm);
        var startDt = moment(meeting.date)
          .hours(0)
          .minutes(0)
          .seconds(0);
        var startTime = startDt
          .hour(startTm.hours())
          .minutes(startTm.minutes())
          .seconds(startTm.second());
        var endTm = moment(meeting.toTm);
        var endDt = moment(meeting.date)
          .hours(0)
          .minutes(0)
          .seconds(0);
        var endTime = endDt
          .hours(endTm.hours())
          .minutes(endTm.minutes())
          .seconds(endTm.seconds());

        var duration = moment.duration(endTime.diff(startTime)).as("minutes");

        var menteeUser = await app.models.TTUser.findById(meeting.seekerUserId);
        var mentorUser = await app.models.TTUser.findById(meeting.mentorUserId);

        var participants = [menteeUser.email, mentorUser.email];

        var zoomLink = await app.models.ZoomMeeting.getMeetingUrl(
          meeting.id,
          meeting.topic,
          meeting.agenda,
          startTime,
          duration,
          participants
        );

        await meeting.updateAttributes({
          zoomLink: zoomLink
        });

        await app.models.Notification.addAndSendMessage(
          {
            message: "approved meeting with id " + meeting.meetingId,
            type: Constants.ACTIVITY_UPDATE,
            fnType: "meeting",
            fnData: meeting,
            fromUserId: userId,
            toUserId: meeting.seekerUserId
          },
          meeting.seekerUserId
        );
      }

      if (status.name == "rejected") {
        var user = await app.models.TTUser.findById(meeting.mentorUserId);
        await app.models.Notification.addAndSendMessage(
          {
            message: "rejected meeting with id " + meeting.meetingId,
            type: Constants.ACTIVITY_UPDATE,
            fnType: "meeting",
            fnData: meeting,
            fromUserId: userId,
            toUserId: meeting.seekerUserId
          },
          meeting.seekerUserId
        );
      }

      if (status.name == "cancelled") {
        var user = await app.models.TTUser.findById(meeting.seekerUserId);
        await app.models.Notification.addAndSendMessage(
          {
            message: "cancelled meeting with id " + meeting.meetingId,
            type: Constants.ACTIVITY_UPDATE,
            fnType: "meeting",
            fnData: meeting,
            fromUserId: userId,
            toUserId: meeting.mentorUserId
          },
          meeting.mentorUserId
        );

        await app.models.ZoomMeeting.deleteMeeting(meeting.id);
      }

      if (status.name == "completed") {
        var user, toUserId;
        if (userId == meeting.mentorUserId) {
          user = await app.models.TTUser.findById(meeting.seekerUserId);
          toUserId = meeting.seekerUserId;
        } else if (userId == meeting.seekerUserId) {
          user = await app.models.TTUser.findById(meeting.mentorUserId);
          toUserId = meeting.mentorUserId;
        } else {
          user = await app.models.TTUser.findById(userId);
          toUserId = null;
        }

        //if it was for assessment, update the status of assessment request
        if (meeting.isForAssessment) {
          var completedStatus = await app.models.AssessmentStatus.findOne({
            where: {
              name: 'completed'
            }
          });
          var assReq = await app.models.AssessmentRequest.findById(meeting.assessmentId);
          assReq.updateAttributes({
            statusId: completedStatus.id,
            statusChangedOn: new Date()
          });
        }

        if (toUserId) {
          await app.models.Notification.addAndSendMessage(
            {
              message:
                "marked meeting with id " + meeting.meetingId + " completed",
              type: Constants.ACTIVITY_UPDATE,
              fnType: "meeting",
              fnData: meeting,
              fromUserId: userId,
              toUserId: user.id
            },
            user.id
          );
        }
      }
    }

    next();
  });

  Meeting.createApprovedMeeting = async function(meeting) {

    var startTm = moment(meeting.fromTm);
        var startDt = moment(meeting.date)
          .hours(0)
          .minutes(0)
          .seconds(0);
        var startTime = startDt
          .hour(startTm.hours())
          .minutes(startTm.minutes())
          .seconds(startTm.second());
        var endTm = moment(meeting.toTm);
        var endDt = moment(meeting.date)
          .hours(0)
          .minutes(0)
          .seconds(0);
        var endTime = endDt
          .hours(endTm.hours())
          .minutes(endTm.minutes())
          .seconds(endTm.seconds());

        var duration = moment.duration(endTime.diff(startTime)).as("minutes");

        var menteeUser = await app.models.TTUser.findById(meeting.seekerUserId);
        var mentorUser = await app.models.TTUser.findById(meeting.mentorUserId);

        var approvedStatus = await app.models.MeetingStatus.findOne({
          where: {
            name: 'approved'
          }
        });

        meeting.statusId = approvedStatus.id;

        var participants = [menteeUser.email, mentorUser.email];

        var meetingRec = await app.models.Meeting.create(meeting);

        var zoomLink = await app.models.ZoomMeeting.getMeetingUrl(
          meetingRec.id,
          meeting.topic,
          meeting.agenda,
          startTime,
          duration,
          participants
        );

        meetingRec.updateAttributes({
          zoomLink: zoomLink
        });

        return meetingRec;
  }

  Meeting.allocateToken = async function(ctx, meetingId, allocations) {
    try {
      const token = ctx && ctx.accessToken;
      const fromUserId = token && token.userId;

      await app.models.NFTToken.allocateToken(fromUserId, allocations);

      var meeting = await app.models.Meeting.findById(meetingId);
      meeting.updateAttributes({
        hasTokenAllocated: true
      });
    } catch (ex) {
      throw ex;
    }
  };

  Meeting.remoteMethod("booked", {
    description: "This method returns booked slots",
    accepts: [
      { arg: "ctx", type: "object", http: "optionsFromRequest" },
      { arg: "date", type: "string" }
    ],
    returns: { arg: "result", type: "object" }
  });

  Meeting.remoteMethod("allocateToken", {
    description:
      "This method allocates tokens and updates meeting for the same",
    accepts: [
      { arg: "ctx", type: "object", http: "optionsFromRequest" },
      { arg: "meetingId", type: "number" },
      { arg: "allocations", type: "array" }
    ],
    returns: { arg: "result", type: "object" }
  });
};
