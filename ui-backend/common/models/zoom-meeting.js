"use strict";

const jwt = require("jsonwebtoken");
var request = require("then-request");
var app = require("../../server/server");
var appConfig = require("../../server/app-config.json");

module.exports = function(ZoomMeeting) {
  ZoomMeeting.generateToken = function() {
    const payload = {
      iss: appConfig.zoomApiKey,
      exp: new Date().getTime() + 5000
    };
    var token = jwt.sign(payload, appConfig.zoomApiSecret);
    return token;
  };

  ZoomMeeting.getZoomAdminUserId = async function(jwtToken) {
    if (appConfig.zoomAdminUserId) {
      return appConfig.zoomAdminUserId;
    }

    var res = await request(
      "GET",
      appConfig.zoomApiBaseUrl + "/users?status=active",
      {
        headers: {
          Authorization: "Bearer " + jwtToken,
          "Content-Type": "application/json",
          "User-Agent": "Zoom-api-Jwt-Request"
        }
      }
    );
    var body = await res.getBody("utf8");
    var result = JSON.parse(body);

    console.log("Result: ", result, result.users[0].id);

    var users = result.users;
    var ln = users.length;
    var retUser;
    for (var i = 0; i < ln; i++) {
      var tmp = users[i];
      if (tmp.email == appConfig.zoomAdminEmail) {
        retUser = tmp;
      }
    }

    return retUser.id;
  };

  ZoomMeeting.doesUserExist = async function(jwtToken, email) {
    var res = await request(
      "GET",
      appConfig.zoomApiBaseUrl + "/users/email?email=" + email,
      {
        headers: {
          Authorization: "Bearer " + jwtToken,
          "Content-Type": "application/json",
          "User-Agent": "Zoom-api-Jwt-Request"
        }
      }
    );
    var body = await res.getBody("utf8");
    var result = JSON.parse(body);

    return result.existed_email;
  };

  ZoomMeeting.createCustUser = async function(jwtToken, email) {
    var res = await request("POST", appConfig.zoomApiBaseUrl + "/users", {
      headers: {
        Authorization: "Bearer " + jwtToken,
        "Content-Type": "application/json",
        "User-Agent": "Zoom-api-Jwt-Request"
      },
      json: {
        action: "custCreate",
        user_info: {
          email: email,
          type: 1,
          first_name: "Terry",
          last_name: "Jones"
        }
      }
    });
    var body = await res.getBody("utf8");
    var result = JSON.parse(body);

    return result;
  };

  ZoomMeeting.createMeeting = async function(
    jwtToken,
    userId,
    topic,
    agenda,
    startTime,
    duration,
    participants
  ) {

    var audioSetting = await app.models.Setting.findOne({
      where: {
        name: 'enable_recording'
      }
    });

    var res = await request(
      "POST",
      appConfig.zoomApiBaseUrl + "/users/" + userId + "/meetings",
      {
        headers: {
          Authorization: "Bearer " + jwtToken,
          "Content-Type": "application/json",
          "User-Agent": "Zoom-api-Jwt-Request"
        },
        json: {
          topic: topic,
          type: 2,
          start_time: startTime.format(),
          duration: duration,
          // "timezone": "Asia/Calcutta",
          // "password": "",
          agenda: agenda,
          settings: {
            host_video: false,
            participant_video: false,
            mute_upon_entry: true,
            join_before_host: true,
            watermark: true,
            approval_type: 2,
            audio: "both",
            auto_recording: audioSetting.value == "false" ? "none" : "cloud",
            enforce_login: false
            //   "enforce_login_domains": "string",
            //   "alternative_hosts": participants.join(),
            //   "global_dial_in_countries": [
            //     "India"
            //   ]
          }
        }
      }
    );

    var body = await res.getBody("utf8");
    var result = JSON.parse(body);

    return result;
  };

  ZoomMeeting.deleteMeeting = async function(meetingId) {

    var zoomMeeting = await app.models.ZoomMeeting.findOne({
      where: {
        meetingId: meetingId
      }
    });

    var jwtToken = this.generateToken();
    var res = await request(
      "PUT",
      appConfig.zoomApiBaseUrl + "/meetings/" + zoomMeeting.zoomMeetingId,
      {
        headers: {
          Authorization: "Bearer " + jwtToken,
          "Content-Type": "application/json",
          "User-Agent": "Zoom-api-Jwt-Request"
        },
        json: {
          schedule_for_reminder: true
        }
      }
    );

    var body = await res.getBody("utf8");
    var result = JSON.parse(body);

    return result;
  };

  /*
   * topic: string - meeting topic
   * agenda: string - meeting agenda
   * startTime: Date - meeting start time
   * duration: number - duration of the meeting
   * participants: array<string> - array of email ids of the participants
   */
  ZoomMeeting.getMeetingUrl = async function(
    meetingId,
    topic,
    agenda,
    startTime,
    duration,
    participants
  ) {
    var token = this.generateToken();
    var adminUserId = await this.getZoomAdminUserId(token);

    // setup participants as users in Zoom so that they can act as alternative hosts
    // var ln = participants.length;
    // for (var i= 0; i < ln; i++) {
    //     var email = participants[i];
    //     var exists = await this.doesUserExist(token, email);
    //     if (!exists) {
    //         await this.createCustUser(token, email);
    //     }
    // }

    var meetingObjToPersist = {};
    var retUrl = null;
    try {
      var meeting = await this.createMeeting(
        token,
        adminUserId,
        topic,
        agenda,
        startTime,
        duration,
        participants
      );
      meetingObjToPersist = {
        zoomMeetingId: meeting.id,
        zoomMeetingUUID: meeting.uuid,
        meetingId: meetingId,
        apiStatus: "SUCCESS",
        apiResponse: meeting
      };
      retUrl = meeting.join_url;
    } catch (ex) {
      meetingObjToPersist = {
        meetingId: meetingId,
        apiStatus: "ERROR",
        apiResponse: ex
      };
    }

    await this.create(meetingObjToPersist);
    return retUrl;
  };

  ZoomMeeting.eventNotificationWebhook = async function(ctx, notifyObj) {

    //check the verification token
    // var vt = ctx.

    var event = notifyObj.event;
    var payload = notifyObj.payload;
    var meetingUuid = notifyObj.payload.object.uuid;

    //check if it is for MaaS meetings
    var zoomMeeting = await app.models.ZoomMeeting.findOne({
      where: {
        zoomMeetingUUID: meetingUuid
      }
    });

    if (!zoomMeeting) {
      console.log('No matching meeting exist in the system. Ignoring the processing of event notification.....', event);
      return;
    }

    await app.models.ZoomEventLog.create({
      zoomMeetingUUID: meetingUuid,
      eventType: event,
      eventDtm: moment().toDate(),
      payload: payload
    });

    if (event == 'meeting.ended') {
      var meeting = await app.models.Meeting.findOne({
        where: {
          meetingId: zoomMeeting.meetingId
        }
      });
      var completedStatus = await app.models.MeetingStatus.findOne({
        where: {
          name: 'completed'
        }
      });

      await meeting.updateAttributes({
        statusId: completedStatus.id
      });
    }

  }

  ZoomMeeting.remoteMethod("eventNotificationWebhook", {
    description:
      "This is event notification webhook for Zoom Meeting",
    accepts: [
      { arg: "ctx", type: "object", http: "optionsFromRequest" },
      { arg: "event", type: "object" }],
    returns: { arg: "result", type: "object" }
  });

  
};
