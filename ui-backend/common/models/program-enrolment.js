"use strict";

var config = require("../../server/config.json");
var appConfig = require("../../server/app-config.json");
var Constants = require("../../server/constants.json");
var path = require("path");
var app = require("../../server/server");
var ejs = require("ejs");
var moment = require("moment");
const uuidv4 = require('uuid/v4');
const Promise = require('bluebird');
const pdf = Promise.promisifyAll(require('html-pdf'));

module.exports = function(ProgramEnrolment) {
  ProgramEnrolment.afterRemote("prototype.patchAttributes", async function(
    ctx,
    programEnrolment,
    next
  ) {
    const token = ctx && ctx.args.options.accessToken;
    const userId = token && token.userId;

    if (ctx.args.data.statusId) {
      var statusId = ctx.args.data.statusId;

      var program = await app.models.Program.findById(programEnrolment.programId);
      var status = await app.models.ProgramEnrolmentStatus.findById(statusId);
      var user = await app.models.TTUser.findById(programEnrolment.userId, {
        include: ["role"]
      });

      if (status.name == "approved") {
        var url =
          config.externalUrl + "/" + user.role().name + "/program-requests";
        var supportUser = await app.models.Setting.findOne({
          where: {
            name: "support_username"
          }
        });
        var html = await ejs.renderFile(
          path.resolve(
            __dirname,
            "../../server/views/program-request-accepted.ejs"
          ),
          {
            viewLink: url,
            firstName: user.firstName,
            programName: program.name,
            supportUserName: supportUser.value,
            externalUrl: config.externalUrl
          },
          {
            async: true
          }
        );

        app.models.Email.send(
          {
            to: user.email,
            from: config.senderEmailAddress,
            subject: program.name + " - request to join has been accepted",
            html: html
          },
          function(err) {
            if (err)
              return console.log("> error sending join request accepted email");
            console.log(
              "> sending join request accepted email to:",
              user.email
            );
          }
        );

        await app.models.Notification.addAndSendMessage({
            message: "approved program request for " + program.name,
            type: Constants.ACTIVITY_UPDATE,
            fnType: "program",
            fnData: programEnrolment,
            fromUserId: programEnrolment.approvedByUserId,
            toUserId: programEnrolment.userId
          },
          programEnrolment.userId
        );
      }

      if (status.name == "rejected") {
        var url =
          config.externalUrl + "/" + user.role().name + "/program-requests";
        var supportUser = await app.models.Setting.findOne({
          where: {
            name: "support_username"
          }
        });
        var html = await ejs.renderFile(
          path.resolve(
            __dirname,
            "../../server/views/program-request-rejected.ejs"
          ),
          {
            viewLink: url,
            firstName: user.firstName,
            programName: program.name,
            supportUserName: supportUser.value,
            externalUrl: config.externalUrl
          },
          {
            async: true
          }
        );

        app.models.Email.send(
          {
            to: user.email,
            from: config.senderEmailAddress,
            subject: program.name + " - request to join has been rejected",
            html: html
          },
          function(err) {
            if (err)
              return console.log("> error sending join request rejected email");
            console.log(
              "> sending join request rejected email to:",
              user.email
            );
          }
        );

        await app.models.Notification.addAndSendMessage({
              message: "rejected program request for " + program.name,
              type: Constants.ACTIVITY_UPDATE,
              fnType: "program",
              fnData: programEnrolment,
              fromUserId: programEnrolment.approvedByUserId,
              toUserId: programEnrolment.userId
            },
            programEnrolment.userId
          );
      }

      await program.patchAttributes({
        modifiedon: new Date()
      });
    }

    next();
  });

  ProgramEnrolment.afterRemote("create", async function(ctx, programEnrolment, next) {
    try {
      var status = await app.models.ProgramEnrolmentStatus.findOne({
        where: {
          name: "pending_approval"
        }
      });

      await programEnrolment.updateAttributes({
        statusId: status.id
      });

      var program = await app.models.Program.findById(programEnrolment.programId);
      var user = await app.models.TTUser.findById(program.userId, {
          include: ['role']
      });

      var requestedByUser = await app.models.TTUser.findById(programEnrolment.userId);

      //notify sponsor about request
      var url =
          config.externalUrl + "/" + user.role().name + "/program-requests";
        var supportUser = await app.models.Setting.findOne({
          where: {
            name: "support_username"
          }
        });
        var html = await ejs.renderFile(
          path.resolve(
            __dirname,
            "../../server/views/program-request.ejs"
          ),
          {
            viewLink: url,
            firstName: user.firstName,
            requestedByUserName: requestedByUser.firstName + ' ' + requestedByUser.lastName,
            programName: program.name,
            supportUserName: supportUser.value,
            externalUrl: config.externalUrl
          },
          {
            async: true
          }
        );

        app.models.Email.send(
          {
            to: user.email,
            from: config.senderEmailAddress,
            subject: program.name + " - request to join",
            html: html
          },
          function(err) {
            if (err)
              return console.log("> error sending join request email");
            console.log(
              "> sending join request email to:",
              user.email
            );
          }
        );

        await app.models.Notification.addAndSendMessage({
              message: "submitted request for " + program.name,
              type: Constants.ACTIVITY_UPDATE,
              fnType: "program",
              fnData: program,
              fromUserId: requestedByUser.id,
              toUserId: user.id
            },
            user.id
          );

      next();
    } catch (ex) {
      next(ex);
    }
  });

  ProgramEnrolment.downloadCert = async function(ctx, programId, next) {

    try {
      const token = ctx && ctx.accessToken;
      const userId = token && token.userId;

      //check if this user is part of the program
      var programEnrolment = await app.models.ProgramEnrolment.findOne({
        where: {
          userId: userId,
          programId: programId
        }
      });

      if (!programEnrolment) {
        throw 'You are not part of the requested program';
      }

      var user = await app.models.TTUser.findById(userId);
      var program = await app.models.Program.findById(programId);

      if (!program.hasCertificateIssued) {
        throw 'Sponsor has not issued the certificates'
      }

      if (programEnrolment.certPath) {
        return programEnrolment.certPath;
      }

      var html = await ejs.renderFile(
        path.resolve(__dirname, "../../server/views/program-certificate.ejs"),
        {
          externalUrl: config.externalUrl,
          participantName: user.firstName + ' ' + user.lastName,
          programName: program.name,
          startDate: moment(program.startDt).format("MM/DD/YYYY"),
          endDate: moment(program.endDt).format("MM/DD/YYYY")
        },
        {
          async: true
        }
      );

      var pdfConfig = {
  
        "height": "8.5in", 
        "width": "11in",
        "border": "0",
        "type": "png"
      }
      
      var uuid = uuidv4();
      var filePath = "/downloads/certificates/" + uuid + ".png";
      var res = await pdf.createAsync(html, { format: 'A4', filename: path.resolve(__dirname, "../../client" + filePath) });
      
      programEnrolment.patchAttributes({
        certPath: filePath
      });

      return filePath;

    } catch(ex) {
      next(ex);
    }
  }

  ProgramEnrolment.remoteMethod("downloadCert", {
    description: "This method returns the certificate path for downloading",
    accepts: [
      { arg: "ctx", type: "object", http: "optionsFromRequest" },
      { arg: "programId", type: "number" }
    ],
    returns: { arg: "result", type: "object" }
  });
};
