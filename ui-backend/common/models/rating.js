"use strict";

var config = require("../../server/config.json");
var path = require("path");
var app = require("../../server/server");

module.exports = function(Rating) {
  Rating.afterRemote("create", async function(ctx, rating, next) {
    try {
      var UserDetail = app.models.TTUserDetail;
      var userDetail = await UserDetail.findOne({
        where: {
          userId: rating.forUserId
        }
      });

      var meeting = await app.models.Meeting.findById(rating.meetingId);

      //calculate average rating and total votes and stamp on the user model
      var oneVotes = await Rating.count({
        forUserId: rating.forUserId,
        rating: 1
      });
      var twoVotes = await Rating.count({
        forUserId: rating.forUserId,
        rating: 2
      });
      var threeVotes = await Rating.count({
        forUserId: rating.forUserId,
        rating: 3
      });
      var fourVotes = await Rating.count({
        forUserId: rating.forUserId,
        rating: 4
      });
      var fiveVotes = await Rating.count({
        forUserId: rating.forUserId,
        rating: 5
      });

      var avgRating = 0,
        totalVotes = 0;
      if (!oneVotes && !twoVotes && !threeVotes && !fourVotes && !fiveVotes) {
        avgRating = 0;
        totalVotes = 0;
      }
      totalVotes = oneVotes + twoVotes + threeVotes + fourVotes + fiveVotes;
      avgRating = (
        (oneVotes * 1 +
          twoVotes * 2 +
          threeVotes * 3 +
          fourVotes * 4 +
          fiveVotes * 5) /
        totalVotes
      ).toFixed(1);

      await userDetail.updateAttributes({
        avgRating: avgRating,
        totalVotes: totalVotes
      });

      if (meeting.mentorUserId === rating.forUserId) {
        await meeting.updateAttribute("hasSeekerRated", true);
      }

      if (meeting.seekerUserId === rating.forUserId) {
        await meeting.updateAttribute("hasMentorRated", true);
      }

      next();
    } catch (ex) {
      next(ex);
    }
  });
};
