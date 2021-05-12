// declare var require : any;
import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";

// var AWS = require('aws-sdk');

var AWS = window["AWS"];

@Injectable()
export class SQSService {
  RETRY_FREQUENCY = 10; //seconds

  constructor() {}

  readMessage(sqs, params, callback) {
    console.log("Fetching message....");
    var me = this;
    sqs.receiveMessage(params, function(err, data) {
      if (err) {
        console.log("Error", err);
        setTimeout(me.readMessage.bind(me), 1, sqs, params, callback);
      } else {
        if (data.Messages && data.Messages.length > 0) {
          callback(JSON.parse(data.Messages[0].Body));

          console.log("Success: ", data.Messages[0].Body);
          params["ReceiptHandle"] = data.Messages[0].ReceiptHandle;
          sqs.deleteMessage(params, function(err, data) {
            delete params.ReceiptHandle;
            if (err) {
              console.log("Error", err);
            } else {
              console.log("Deleted: ", data);
            }
            setTimeout(
              me.readMessage.bind(me),
              this.RETRY_FREQUENCY,
              sqs,
              params,
              callback
            );
          });
        } else {
          console.log(
            "Success: ",
            data.Messages && data.Messages.length > 0 ? data : "No more message"
          );
          setTimeout(me.readMessage.bind(me), 20, sqs, params, callback);
        }
      }
    });
  }

  receiveMessage(toUserId, callback) {
    var me = this;

    AWS.config.update({
      accessKeyId: environment.awsAccessKeyId,
      secretAccessKey: environment.awsSecretAccessKey,
      region: environment.awsRegion
    });

    // Create an SQS service object
    var sqs = new AWS.SQS({});

    var params = {
      QueueUrl:
        environment.awsSQSUrl + "/" + environment.awsSQSEnv + "-" + toUserId
    };

    this.readMessage(sqs, params, callback);
  }
}
