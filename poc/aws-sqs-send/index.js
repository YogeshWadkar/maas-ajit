var AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: 'AKIAZFPG5ENVMLXF4XXS',
    secretAccessKey: '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',
    region: 'us-east-2'
});

// Create an SQS service object
var sqs = new AWS.SQS({});

var params = {
    DelaySeconds: 10,
    MessageAttributes: {
        "Title": {
            DataType: "String",
            StringValue: "The Whistler"
        },
        "Author": {
            DataType: "String",
            StringValue: "John Grisham"
        },
        "WeeksOn": {
            DataType: "Number",
            StringValue: "6"
        }
    },
    MessageBody: "Information about current NY Times fiction bestseller for week of 12/11/2016.",
    QueueUrl: "https://sqs.us-east-2.amazonaws.com/630233834346/maas-dev-queue" //"https://sqs.ap-southeast-1.amazonaws.com/692854075416/changebit_test"
};

sqs.sendMessage(params, function(err, data) {
    if (err) {
    console.log("Error", err);
    } else {
    console.log("Success", data.MessageId);
    }
});