"use strict";

var appConfig = require("../../server/app-config.json");
var app = require("../../server/server");

var AWS = require("aws-sdk");

module.exports = function(Notification) {
  Notification.afterRemote("find", async function(ctx, notifications, next) {
    var ln = notifications.length;
    for (var i = 0; i < ln; i++) {
      var fromUser = await notifications[i].fromUser();
      var ud = await app.models.TTUserDetail.findOne({
        where: {
          userId: fromUser.id
        }
      });
      fromUser.fromUserDetail = ud;
    }

    if (Array.isArray(notifications)) {
      var filter = ctx.args.filter;

      var count = notifications.length;
      if (filter && filter.where) {
        count = await Notification.count(filter["where"]);
      }

      ctx.result = {
        count: count,
        data: notifications
      };
    }

    next();
  });

  Notification.createQueue = async function(toUserId) {
    AWS.config.update({
      accessKeyId: appConfig.awsAccessKeyId,
      secretAccessKey: appConfig.awsSecretAccessKey,
      region: appConfig.awsRegion
    });

    // Create an SQS service object
    var sqs = new AWS.SQS({});
    var params = {
      QueueName: "dev-" + toUserId,
      Attributes: {
        ReceiveMessageWaitTimeSeconds: "20"
      }
    };

    try {
      var data = await sqs.createQueue(params).promise();
      return data;
    } catch (ex) {
      throw ex;
    }
  };

  Notification.sendToQueue = async function(toUserId, type, message) {
    AWS.config.update({
      accessKeyId: appConfig.awsAccessKeyId,
      secretAccessKey: appConfig.awsSecretAccessKey,
      region: appConfig.awsRegion
    });

    // Create an SQS service object
    var sqs = new AWS.SQS({});

    var params = {
      MessageBody: JSON.stringify({ contentType: type, message: message }),
      QueueUrl: appConfig.awsSQSUrl + "/" + appConfig.awsSQSEnv + "-" + toUserId
    };

    try {
      var data = await sqs.sendMessage(params).promise();
      return data;
    } catch (ex) {
      throw ex;
    }
  };

  Notification.addAndSendMessage = async function(record, toUserId) {
    var rec = await Notification.create(record);
    try {
      var data = await Notification.sendToQueue(
        toUserId,
        record.type,
        record.message
      );
      rec.updateAttributes({
        status: "SUCCESS",
        statusMsg: data
      });
    } catch (ex) {
      rec.updateAttributes({
        status: "ERROR",
        statusMsg: ex
      });
    }
  };

  Notification.markAsRead = async function(ctx, type) {
    const token = ctx && ctx.accessToken;
    const userId = token && token.userId;

    var info = await Notification.updateAll(
      {
        toUserId: userId,
        type: type
      },
      {
        isRead: true
      }
    );

    return info.count;
  };

  Notification.remoteMethod("addAndSendMessage", {
    description: "This method returns user notifications",
    accepts: [
      { arg: "record", type: "object" },
      { arg: "toUserId", type: "number" }
    ],
    returns: { arg: "result", type: "object" }
  });

  Notification.remoteMethod("markAsRead", {
    description: "This method updates ",
    accepts: [
      { arg: "ctx", type: "object", http: "optionsFromRequest" },
      { arg: "type", type: "string" }
    ],
    returns: { arg: "result", type: "object" }
  });
};
