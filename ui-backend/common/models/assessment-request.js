"use strict";

var config = require("../../server/config.json");
var app = require("../../server/server");
var moment = require("moment");
var Constants = require("../../server/constants.json");

module.exports = function(AssessmentRequest) {
    AssessmentRequest.afterRemote("create", async function(ctx, assessment, next) {
    try {
      //set meeting id and status
      var randNum = Math.random()
        .toString()
        .slice(2, 11);
      var requestId =
        randNum.substr(0, 3) +
        "-" +
        randNum.substr(3, 3) +
        "-" +
        randNum.substr(6, 3);

      var status = await app.models.AssessmentStatus.findOne({
        where: {
          name: "pending_approval"
        }
      });

      await assessment.updateAttributes({
        requestId: requestId,
        statusId: status.id
      });

      next();
    } catch (ex) {
      next(ex);
    }
  });

  AssessmentRequest.afterRemote("find", async function(ctx, assessments, next) {
    var ln = assessments.length;

    for (var i = 0; i < ln; i++) {
      var a = assessments[i];

      var selfAssessment = await app.models.SelfAssessment.findById(a.selfAssessmentId, {
        include: ['skill']
      });

      a.skill = selfAssessment.skill();
    }

  });

  AssessmentRequest.approve = async function(ctx, id, date, slotId) {

    const token = ctx && ctx.accessToken;
    const userId = token && token.userId;

    var approvedStatus = await app.models.AssessmentStatus.findOne({
      where: {
        name: 'approved'
      }
    });

    var slot = await app.models.SlotsAllowed.findById(slotId);

    var assessment = await app.models.AssessmentRequest.findById(id);
    if (!assessment) {
      throw 'No matching assessment found';
    }

    var selfAssessment = await app.models.SelfAssessment.findById(assessment.selfAssessmentId, {
      include: ['skill']
    });

    await assessment.updateAttributes({
      statusId: approvedStatus.id
    });

    //create a meeting
    var meeting = {
      meetingId: assessment.requestId,
      topic: selfAssessment.skill().name + ' assessment',
      agenda: assessment.note,
      date: date,
      fromTm: slot.fromTm,
      toTm: slot.toTm,
      duration: slot.duration,
      mentorUserId: assessment.mentorUserId,
      seekerUserId: assessment.seekerUserId,
      isForAssessment: true,
      assessmentId: assessment.id
    }
    var meetingRec = await app.models.Meeting.createApprovedMeeting(meeting);

    await assessment.updateAttributes({
      meetingId: meetingRec.id
    });

    await app.models.Notification.addAndSendMessage(
      {
        message: "approved assessment meeting with id " + meetingRec.meetingId,
        type: Constants.ACTIVITY_UPDATE,
        fnType: "meeting",
        fnData: meetingRec,
        fromUserId: userId,
        toUserId: meetingRec.seekerUserId
      },
      meetingRec.seekerUserId
    );

    return meetingRec;
  }

  AssessmentRequest.remoteMethod('approve', {
		description: 'This method approves an assessment request',
		accepts: [
      {arg: 'ctx', "type": "object", "http": "optionsFromRequest"},
      {arg: 'id', "type": "number"},
      {arg: 'date', "type": "date"},
      {arg: 'slotId', "type": "number"}
    ],
		returns: { arg: 'result', type: 'object' }
	});
}