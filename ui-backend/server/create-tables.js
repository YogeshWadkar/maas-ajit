var server = require("./server");
var chalk = require("chalk");
var app = require("./server");

var ds = server.dataSources.db;
var tables = [
  // "AccessToken",
  // "ACL",
  // "RoleMapping",
  // "TTRole",
  // "TTUser",
  // "TTUserDetail",
  // "AccessLog",
  // "Faq",
  // "Leave",
  // "Meeting",
  // "ProfileCategory",
  // "SelfAssessment",
  // "Setting",
  // "Skill",
  // "SkillCategory",
  // "SlotsAllowed",
  // "SpecialDaySlot",
  // "SystemAssessment",
  // "Task",
  // "Weekday",
  // "MeetingStatus",
  // "Country",
  // "State",
  // "City",
  // "Rating",
  // "TokenTransferLog",
  // "Attachment",
  // "TaskCategory",
  // "TaskStatus",
  // "Education",
  // "Certification",
  // "WorkExperience",
  // "ImportLog",
  // "ZoomMeeting",
  // "Company",
  // "Notification",
  // "Slot",
  // "ReferralCode",
  // "ZoomEventLog",
  // "Chat",
  // "FormStatus",
  // "Form",
  // "ProgramStatus",
  // "Program",
  // "ProgramEnrolmentStatus",
  // "ProgramEnrolment",
  // "ProgramMentor",
  // "ProgramMetric",
  // "FreeBusy",
  "CareerProfile",
  // "CareerProfileStatus",
  // "CareerProfileSkill",
  // "AssessmentStatus",
  // "AssessmentRequest",
  // "AssessmentLevel"
];
ds.automigrate(tables, async function(er) {
  if (er) throw er;

  console.log(
    chalk.green.bold("MaaS tables [") +
      tables +
      chalk.green.bold("] created in "),
    ds.adapter.name
  );

  //Create roles
  // TTRole = app.models.TTRole;
  // var roles = await TTRole.create([
  //   {
  //     name: "mentor",
  //     description: "Mentor"
  //   },
  //   {
  //     name: "career-seeker",
  //     description: "Career Seeker"
  //   },
  //   {
  //     name: "sponsor",
  //     description: "Sponsor"
  //   },
  //   {
  //     name: "admin",
  //     description: "Administrator"
  //   },
  //   {
  //     name: "system",
  //     description: "System"
  //   }
  // ]);

  // console.log(chalk.green.bold("Total roles created: "), roles.length);

  // var SkillCategory = app.models.SkillCategory;
  // var scs = await SkillCategory.create([
  //   { name: "Social & Behaviour" },
  //   { name: "Digital" },
  //   { name: "Business" },
  //   { name: "Technical" }
  // ]);
  // console.log(chalk.green.bold("Total skill categories created: "), scs.length);

  // var MeetingStatus = app.models.MeetingStatus;
  // var mStatuses = await MeetingStatus.create([
  //   { name: "pending_approval", description: "Pending Approval" },
  //   { name: "approved", description: "Approved" },
  //   { name: "cancelled", description: "Cancelled" },
  //   { name: "rejected", description: "Rejected" },
  //   { name: "completed", description: "Completed" },
  //   { name: "expired", description: "Expired" }
  // ]);

  // console.log(
  //   chalk.green.bold("Total meeting statuses created: "),
  //   mStatuses.length
  // );

  // var Weekday = await app.models.Weekday;
  // var weekdays = await Weekday.create([
  //   { name: "Monday", seq: 1, iso: 1 },
  //   { name: "Tuesday", seq: 2, iso: 2 },
  //   { name: "Wednesday", seq: 3, iso: 3 },
  //   { name: "Thursday", seq: 4, iso: 4 },
  //   { name: "Friday", seq: 5, iso: 5 },
  //   { name: "Saturday", seq: 6, iso: 6 },
  //   { name: "Sunday", seq: 7, iso: 7 }
  // ]);

  // console.log(chalk.green.bold("Total weekdays created: "), weekdays.length);

  // var countries = await app.models.Country.create([
  //   { code: "IN", name: "India" },
  //   { code: "US", name: "USA" }
  // ]);
  // console.log(chalk.green.bold("Total countries created: "), countries.length);

  // var country = await app.models.Country.findOne({
  //   where: { code: "IN" }
  // });
  // var states = await app.models.State.create([
  //   { code: "TS", name: "Telangana", countryId: country.id }
  // ]);
  // console.log(chalk.green.bold("Total states created: "), states.length);

  // var state = await app.models.State.findOne({
  //   where: { code: "TS" }
  // });
  // var cities = await app.models.City.create([
  //   { code: "HYD", name: "Hyderabad", countryId: country.id, stateId: state.id }
  // ]);
  // console.log(chalk.green.bold("Total cities created: "), cities.length);

  // var taskCategories = await app.models.TaskCategory.create([
  //   { name: "training", description: "Training" },
  //   { name: "task", description: "Task" },
  //   { name: "assessment", description: "Assessment" },
  //   { name: "project", description: "Project" },
  //   { name: "internship", description: "Internship" }
  // ]);
  // console.log(
  //   chalk.green.bold("Total task categories created: "),
  //   taskCategories.length
  // );

  // var taskStatuses = await app.models.TaskStatus.create([
  //   { name: "todo", description: "To Do" },
  //   { name: "inprogress", description: "In-Progress" },
  //   { name: "done", description: "Done" }
  // ]);
  // console.log(
  //   chalk.green.bold("Total task statuses created: "),
  //   taskStatuses.length
  // );

  // var formStatuses = await app.models.FormStatus.create([
  //   { name: "draft", description: "Draft" },
  //   { name: "published", description: "Published" }
  // ]);
  // console.log(
  //   chalk.green.bold("Total form statuses created: "),
  //   formStatuses.length
  // );

  // var programEnrolStatuses = await app.models.ProgramEnrolmentStatus.create([
  //   { name: "pending_approval", description: "Pending Approval" },
  //   { name: "approved", description: "Approved" },
  //   { name: "rejected", description: "Rejected" }
  // ]);
  // console.log(
  //   chalk.green.bold("Total program enrolment statuses created: "),
  //   programEnrolStatuses.length
  // );

  // var programStatuses = await app.models.ProgramStatus.create([
  //   { name: "draft", description: "Draft" },
  //   { name: "published", description: "Published" },
  //   { name: "completed", description: "Completed" },
  //   { name: "closed", description: "Registration Closed" },
  //   { name: "cancelled", description: "Cancelled" }
  // ]);
  // console.log(
  //   chalk.green.bold("Total program statuses created: "),
  //   programStatuses.length
  // );

  // var careerProfileStatuses = await app.models.CareerProfileStatus.create([
  //   { name: "draft", description: "Draft" },
  //   { name: "published", description: "Published" },
  // ]);
  // console.log(
  //   chalk.green.bold("Total career profile statuses created: "),
  //   careerProfileStatuses.length
  // );

  // var settings = await app.models.Setting.create([
  //   {
  //     name: "medium_feed_identifier",
  //     value: "the-story",
  //     description:
  //       "Medium user profile or publication for which feed needs to be shown."
  //   },
  //   {
  //     name: "default_slot_duration",
  //     value: "60",
  //     description: "Default meeting slot duration in minutes"
  //   },
  //   {
  //     name: "gap_between_meetings",
  //     value: "30",
  //     description: "Default gap between two consecutive meetings in minutes"
  //   },
  //   {
  //     name: "support_username",
  //     value: "Matthew Hall",
  //     description:
  //       "Default user name to be used to send support emails. E.g. sign up email verification."
  //   },
  //   {
  //     name: "invitation_link_expiry",
  //     value: "2",
  //     description: "Days after which the invitation link expires."
  //   },
  //   {
  //     name: "referral_reward_tokens",
  //     value: "1",
  //     description: "Tokens to be awarded upon invitee signup confirmation."
  //   },
  //   {
  //     name: "enable_recording",
  //     value: "false",
  //     description: "Turn of/off Zoom meeting recording"
  //   }
  // ]);
  // console.log(chalk.green.bold("Total settings created: "), settings.length);

  // var levels = await app.models.AssessmentLevel.create([
  //   {seq: 1, name: 'level1', description: 'Level 1'},
  //   {seq: 2, name: 'level2', description: 'Level 2'},
  //   {seq: 3, name: 'level3', description: 'Level 3'}
  // ]);
  // console.log(chalk.green.bold("Total assessment levels created: "), levels.length);

  // var assessmentStatuses = await app.models.AssessmentStatus.create([
  //   {name: 'pending_approval', description: 'Pending Approval'},
  //   {name: 'approved', description: 'Approved'},
  //   {name: 'rejected', description: 'Rejected'},
  //   {name: 'completed', description: 'Completed'}
  // ]);
  // console.log(chalk.green.bold("Total assessment statuses created: "), assessmentStatuses.length);

  ds.disconnect();
});
