"use strict";

var config = require("../../server/config.json");
var app = require("../../server/server");
var moment = require("moment");

var Constants = require("../../server/constants.json");

module.exports = function(Task) {
  Task.afterRemote("create", async function(ctx, task, next) {
    try {
      //set task id
      var randNum = Math.random()
        .toString()
        .slice(2, 11);
      var taskId =
        randNum.substr(0, 3) +
        "-" +
        randNum.substr(3, 3) +
        "-" +
        randNum.substr(6, 3);

      await task.updateAttributes({
        taskId: taskId
      });

      var status = await app.models.TaskStatus.findById(task.statusId);
      if (status.name == "todo") {
        var user = await app.models.TTUser.findById(task.assignedByUserId);
        await app.models.Notification.addAndSendMessage(
          {
            message: "assigned task " + task.taskId + " to you",
            type: Constants.ACTIVITY_UPDATE,
            fnType: "task",
            fnData: task,
            fromUserId: task.assignedByUserId,
            toUserId: task.assignedToUserId
          },
          task.assignedToUserId
        );
      }

      next();
    } catch (ex) {
      next(ex);
    }
  });

  Task.allocateToken = async function(ctx, taskId, allocations) {
    try {
      const token = ctx && ctx.accessToken;
      const fromUserId = token && token.userId;

      await app.models.NFTToken.allocateToken(fromUserId, allocations);

      var task = await app.models.Task.findById(taskId);
      task.updateAttributes({
        hasTokenAllocated: true
      });
    } catch (error) {
      // console.log("this is allocate token exception", ex);
      throw error;
    }
  };

  Task.remoteMethod("allocateToken", {
    description: "This method allocates tokens and updates task for the same",
    accepts: [
      { arg: "ctx", type: "object", http: "optionsFromRequest" },
      { arg: "taskId", type: "number" },
      { arg: "allocations", type: "array" }
    ],
    returns: { arg: "result", type: "object" }
  });
};
