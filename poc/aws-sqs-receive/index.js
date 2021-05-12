var AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: 'AKIAZFPG5ENVMLXF4XXS',
    secretAccessKey: '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',
    region: 'us-east-2'
});

// Create an SQS service object
var sqs = new AWS.SQS({});

var params = {
    QueueUrl: "https://sqs.us-east-2.amazonaws.com/630233834346/maas-dev-queue"
};

sqs.receiveMessage(params, function (err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        if (data.Messages && data.Messages.length > 0) {
            console.log("Success: ", data.Messages[0].Body);
            params['ReceiptHandle'] = data.Messages[0].ReceiptHandle;
            sqs.deleteMessage(params, function (err, data) {
                if (err) {
                    console.log("Error", err);
                } else {
                    console.log("Deleted: ", data);
                }
            });
        } else {
            console.log("Success: ", data.Messages && data.Messages.length > 0 ? data : 'No more message');
        }

    }
});