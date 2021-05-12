var chalk = require("chalk");
var config = require("../server/config.json");
var app = require("../server/server");
var ejs = require("ejs");
var path = require("path");

var sendTo = "ajit.kumar.azad@gmail.com";

async function sendSignUpMail() {
  console.log(chalk.green("Entered sendSignUpMail"));

  var html = await ejs.renderFile(
    path.resolve(__dirname, "../server/views/signup-verification.ejs"),
    {
      verifyLink: config.externalUrl + "/verified",
      firstName: "Kevin",
      supportUserName: "Matthew Hall",
      externalUrl: config.externalUrl
    },
    {
      async: true
    }
  );

  console.log(chalk.cyan("Created Html..."));

  console.log(chalk.cyan("Sending Email..."));
  app.models.Email.send(
    {
      to: sendTo,
      from: config.senderEmail,
      subject: "Please verify your email address",
      html: html
    },
    function(err) {
      if (err)
        return console.log(
          chalk.red("Error sending signup confirmation email"),
          err
        );
      console.log(chalk.green("Sent signup confirmation email"));
    }
  );
}

async function sendResetPwdMail() {
  console.log(chalk.green("Entered sendResetPwdMail"));

  var html = await ejs.renderFile(
    path.resolve(__dirname, "../server/views/reset-password.ejs"),
    {
      resetPwdLink: config.externalUrl + "/reset-password",
      firstName: "Kevin",
      supportUserName: "Matthew Hall",
      externalUrl: config.externalUrl
    },
    {
      async: true
    }
  );

  console.log(chalk.cyan("Created Html..."));

  console.log(chalk.cyan("Sending Email..."));
  app.models.Email.send(
    {
      to: sendTo,
      from: config.senderEmail,
      subject: "Reset password",
      html: html
    },
    function(err) {
      if (err)
        return console.log(
          chalk.red("Error sending reset password email"),
          err
        );
      console.log(chalk.green("Sent reset password email"));
    }
  );
}

async function sendMentorActivatedMail() {
  console.log(chalk.green("Entered sendMentorActivatedMail"));

  var html = await ejs.renderFile(
    path.resolve(__dirname, "../server/views/mentor-activated.ejs"),
    {
      signLink: config.externalUrl + "/signin",
      firstName: "Kevin",
      supportUserName: "Matthew Hall",
      externalUrl: config.externalUrl
    },
    {
      async: true
    }
  );

  console.log(chalk.cyan("Created Html..."));

  console.log(chalk.cyan("Sending Email..."));
  app.models.Email.send(
    {
      to: sendTo,
      from: config.senderEmail,
      subject: "Account MaaS account has been activated",
      html: html
    },
    function(err) {
      if (err)
        return console.log(
          chalk.red("Error sending account activation email"),
          err
        );
      console.log(chalk.green("Sent account activation email"));
    }
  );
}

async function sendInviteMail() {
  console.log(chalk.green("Entered sendInviteMail"));

  var html = await ejs.renderFile(
    path.resolve(__dirname, "../server/views/invite.ejs"),
    {
      signUpLink: config.externalUrl + "/signup?ref_code=" + "y26Wna",
      referralCode: "y26Wna",
      expiryDuration: "2 Days",
      externalUrl: config.externalUrl,
      invitedByUserName: "MaaS Admin",
      supportUserName: "Matthew Hall"
    },
    {
      async: true
    }
  );

  console.log(chalk.cyan("Created Html..."));

  console.log(chalk.cyan("Sending Email..."));
  app.models.Email.send(
    {
      to: sendTo,
      from: config.senderEmail,
      subject: "Invitation to join MaaS",
      html: html
    },
    function(err) {
      if (err) return console.log(chalk.red("Error sending invite email"), err);
      console.log(chalk.green("Sent invite email"));
    }
  );
}

// sendSignUpMail();
// sendResetPwdMail();
// sendMentorActivatedMail();
sendInviteMail();
