var server = require('../server/server');
var chalk = require('chalk');
var app = require('../server/server');
var Constants = require('../server/constants.json');

var moment = require('moment');

//this script is run every 5 minutes and it checks all the pending approval and approved 
//meeting to see if any meeting needs to be expired

async function markAsExpired() {
  console.log(chalk.cyan.bold('Entered markAsExpired...'));
  //get the relevant meetings
  var meetingStatuses = await app.models.MeetingStatus.find({
    where: {
      name: {
          inq: ['pending_approval', 'approved']
      }
    }
  });

  var statusIds = [];
  var ln = meetingStatuses.length;
  for (var i = 0; i < ln; i++) {
    statusIds.push(meetingStatuses[i].id);
  }

  var now = moment().year(0).month(0).date(0);

  var meetings = await app.models.Meeting.find({
    where: {
      statusId: {
          inq: statusIds
      },
      toTm: {
        lte: new Date()
      }
    }
  });

  var ln = meetings.length;
  if (ln > 0) {
    console.log(chalk.green.bold('Found ' + ln + ' meetings for processing.'));

    var expiredStatus = await app.models.MeetingStatus.findOne({
      where: {
        name: 'expired'
      }
    });

    //update the meeting status
    for (var i = 0; i < ln; i++) {
      var tmp = meetings[i];
      console.log(chalk.green.bold('Processing: '), tmp.id);

      await tmp.updateAttributes({
        statusId: expiredStatus.id
      });

      //notify users inside the app
      var systemUser = await app.models.TTUser.findOne({
          where: {
              signupAs: 'system'
          }
      });
      await app.models.Notification.addAndSendMessage(
        {
          message: "expired meeting with id " + tmp.meetingId,
          type: Constants.ACTIVITY_UPDATE,
          fnType: "meeting",
          fnData: tmp,
          fromUserId: systemUser.id,
          toUserId: tmp.seekerUserId
        },
        tmp.seekerUserId
      );
      await app.models.Notification.addAndSendMessage(
        {
          message: "expired meeting with id " + tmp.meetingId,
          type: Constants.ACTIVITY_UPDATE,
          fnType: "meeting",
          fnData: tmp,
          fromUserId: systemUser.id,
          toUserId: tmp.mentorUserId
        },
        tmp.mentorUserId
      );
    }
  } else {
    console.log(chalk.cyan.bold('No meetings to be updated.'));
  }
  console.log(chalk.cyan.bold('Returning from markAsExpired...'));
  process.exit(0);
}

try {
  markAsExpired();
} catch (ex) {
  console.log(ex);
  process.exit(1);
}