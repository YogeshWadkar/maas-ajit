'use strict';

var config = require('../../server/config.json');
var path = require('path');
var app = require('../../server/server');

var moment = require('moment');

module.exports = function (Dashboard) {

	Dashboard.recentMatchingMentors = async function (limit = 5, ctx) {
		const token = ctx && ctx.accessToken;
		const userId = token && token.userId;

		var mentorRole = await app.models.TTRole.findOne({
			where: {
				name: 'mentor'
			}
		});

		var skills = await app.models.SelfAssessment.find({
			where: {
				userId: userId
			}
		});
		var skillsLn = skills.length;
		var skillIds = [];
		for (var i = 0; i < skillsLn; i++) {
			skillIds.push(skills[i].skillId);
		}

		var mentors = await app.models.TTUser.find({
			where: {
				signupAs: 'mentor',
				isActive: true
			}
		});

		var mentorIds = [];
		var mentorsLn = mentors.length;
		for (var i = 0; i < mentorsLn; i++) {
			mentorIds.push(mentors[i].id);
		}

		var matchingMentorsSkills = await app.models.SelfAssessment.find({
			where: {
				userId: {
					inq: mentorIds,
					neq: userId
				},
				skillId: {
					inq: skillIds
				}
			},
			order: 'createdon DESC',
			include: ['user']
		});

		var uniqeUsers = [];
		var ln = matchingMentorsSkills.length;
		for (var i = 0; i < ln; i++) {
			var uid = matchingMentorsSkills[i].userId;
			if (uniqeUsers.length == limit) {
				break;
			}

			if (uniqeUsers.indexOf(uid) < 0) {
				uniqeUsers.push(uid);
			}
		}

		var users = await app.models.TTUser.find({
			where: {
				id: {
					inq: uniqeUsers
				}
			},
			include: ['userDetail', 'skills']
		});
		for (var i = 0; i < users.length; i++) {
			var u = users[i];
			u.skillList = await app.models.TTUser.getSkillsList(await u.skills());
		}

		return {
			mentors: users,
			count: (mentors.length - limit) > 0 ? mentors.length - limit : 0
		}
	}

	Dashboard.upcomingMeetings = async function (limit = 5, ctx) {
		const token = ctx && ctx.accessToken;
		const userId = token && token.userId;

		var approvedStatus = await app.models.MeetingStatus.findOne({
			where: {
				name: 'approved'
			}
		});

		var user = await app.models.TTUser.findOne({
			where: {
				id: userId
			},
			include: ['role']
		});
		
		var filter = {
			statusId: approvedStatus.id
		};

		var role = user.role();
		if (role.name == 'mentor') {
			filter['mentorUserId'] = userId;
		}
		if (role.name == 'career-seeker') {
			filter['seekerUserId'] = userId;
		}

		var meetings = await app.models.Meeting.find({
			where: filter,
			order: 'date DESC',
			limit: limit,
			include: ['seekerUser', 'mentorUser']
		});

		var ln = meetings.length;
		for (var i = 0; i < ln; i++) {
			var mu = meetings[i].mentorUser();
			var su = meetings[i].seekerUser();

			su.fullName = su.firstName + ' ' + su.lastName;
			mu.fullName = mu.firstName + ' ' + mu.lastName;
		}

		var count = await app.models.Meeting.count(filter);

		return {
			meetings: meetings,
			count: (count - limit) > 0 ? count - limit : 0
		}
	}

	Dashboard.pendingTasks = async function (limit = 5, ctx) {
		const token = ctx && ctx.accessToken;
		const userId = token && token.userId;

		var doneStatus = await app.models.TaskStatus.findOne({
			where: {
				name: 'done'
			}
		});

		var user = await app.models.TTUser.findOne({
			where: {
				id: userId
			},
			include: ['role']
		});

		var role = user.role();
		var filter = {
			assignedToUserId: userId,
			statusId: {
				neq: doneStatus.id
			}
		};

		var tasks = await app.models.Task.find({
			where: filter,
			order: 'dueDt ASC',
			limit: limit
		});

		var count = await app.models.Task.count(filter);

		return {
			tasks: tasks,
			count: (count - limit) > 0 ? count - limit : 0
		}
	}

	Dashboard.recentSkillRatings = async function (limit = 5, ctx) {
		const token = ctx && ctx.accessToken;
		const userId = token && token.userId;

		var filter = {
			userId: userId
		};

		var assessments = await app.models.SelfAssessment.find({
			where: filter,
			order: 'createdon DESC',
			limit: limit,
			include: ['skill']
		});

		var count = await app.models.SelfAssessment.count(filter);

		return {
			assessments: assessments,
			count: (count - limit) > 0 ? count - limit : 0
		}
	}

	Dashboard.weekdays = function (month, year, weekday) {
		var day, counter, date;

		day = 1;
		counter = 0;
		date = new Date(year, month, day);
		while (date.getMonth() === month) {
			if (date.getDay() === weekday) { // Sun=0, Mon=1, Tue=2, etc.
				counter += 1;
			}
			day += 1;
			date = new Date(year, month, day);
		}
		return counter;
	}

	Dashboard.utilization = async function (companyId, fromDtm, toDtm, presentation = 'date', mentorUserId = null) {

		var timeDim = [];
		var timeAvailableHrs = [];
		var timeSpentHrs = [];

		var totalDays = moment.duration(moment(toDtm).diff(moment(fromDtm))).as('days');

		var fmt;
		if (presentation == 'date') {
			fmt = 'MM/DD/YYYY';
		}
		if (presentation == 'week') {
			fmt = 'W';
		}
		if (presentation == 'month') {
			fmt = 'MMM YY';
		}

		//process allowed weekday slots
		var connector = app.models.SlotsAllowed.getConnector();
		var sql, params;

		for (var i = 0; i < totalDays; i++) {

			var date = moment(fromDtm).add(i, 'days');
			var wdIsoId = moment(date).isoWeekday();
			var wdId = await app.models.Weekday.findOne({
				where: {
					iso: wdIsoId
				}
			});
			var dt = date.format(fmt);

			if (mentorUserId) {
				sql = "SELECT * from SlotsAllowed WHERE userId=$1 AND weekdayId = $2";
				params = [mentorUserId, wdId.id];
			} else {
				sql = "SELECT * from SlotsAllowed WHERE userId IN (SELECT id FROM TTUser WHERE signupAs=$1 AND companyId=$2) AND weekdayId = $3";
				params = ['mentor', companyId, wdId.id];
			}

			var slotsAllowed = await this.queryResult(connector, sql, params);

			var saLn = slotsAllowed.length;
			for (var j = 0; j < saLn; j++) {
				var sa = slotsAllowed[j];

				var duration = (sa.duration / 60).toFixed(2) * 1;

				var idx = timeDim.indexOf(dt);
				if (idx == -1) {
					timeDim.push(dt);
					idx = timeDim.indexOf(dt);
				}
				if (!timeAvailableHrs[idx]) timeAvailableHrs[idx] = 0;

				timeAvailableHrs[idx] += duration.toFixed(2) * 1;
			}
		}

		//process leaves
		connector = app.models.Leave.getConnector();
		if (mentorUserId) {
			sql = "SELECT * from Leave WHERE userId=$1 AND date >= $2 AND date <= $3";
			params = [mentorUserId, fromDtm, toDtm];
		} else {
			sql = "SELECT * from Leave WHERE userId IN (SELECT id FROM TTUser WHERE signupAs=$1 AND companyId=$2) AND date >= $3 AND date <= $4";
			params = ['mentor', companyId, fromDtm, toDtm];
		}

		var leaves = await this.queryResult(connector, sql, params);

		var lln = leaves.length;
		for (var i = 0; i < lln; i++) {
			var l = leaves[i];
			var wd = moment(l.date).isoWeekday();
			var weekday = await app.models.Weekday.findOne({
				where: {
					iso: wd
				}
			});

			var slots = await app.models.SlotsAllowed.find({
				where: {
					weekdayId: weekday.id,
					userId: l.userid
				}
			});

			var saLn = slots.length;
			for (var j = 0; j < saLn; j++) {
				var sa = slots[j];

				var duration = (sa.duration / 60).toFixed(2) * 1;

				var dt = moment(l.date).format(fmt);
				var idx = timeDim.indexOf(dt);
				if (idx == -1) {
					timeDim.push(dt);
					idx = timeDim.indexOf(dt);
				}
				if (!timeAvailableHrs[idx]) timeAvailableHrs[idx] = 0;

				timeAvailableHrs[idx] -= duration.toFixed(2) * 1;
			}
		}

		//process special day slots
		connector = app.models.SpecialDaySlot.getConnector();
		if (mentorUserId) {
			sql = "SELECT * from SpecialDaySlot WHERE userId=$1 AND date >= $2 AND date <= $3";
			params = [mentorUserId, fromDtm, toDtm];
		} else {
			sql = "SELECT * from SpecialDaySlot WHERE userId IN (SELECT id FROM TTUser WHERE signupAs=$1 AND companyId=$2) AND date >= $3 AND date <= $4";
			params = ['mentor', companyId, fromDtm, toDtm];
		}
		var specialDaySlots = await this.queryResult(connector, sql, params);

		var sdsLn = specialDaySlots.length;
		for (var i = 0; i < sdsLn; i++) {
			var sds = specialDaySlots[i];

			var duration = (sds.duration / 60).toFixed(2) * 1;

			var dt = moment(sa.date).format(fmt);
			var idx = timeDim.indexOf(dt);
			if (idx == -1) {
				timeDim.push(dt);
				idx = timeDim.indexOf(dt);
			}
			if (!timeAvailableHrs[idx]) timeAvailableHrs[idx] = 0;

			timeAvailableHrs[idx] += duration.toFixed(2) * 1;
		}

		//process completed meetings
		var completedStatus = await app.models.MeetingStatus.findOne({
			where: {
				name: 'completed'
			}
		});

		connector = app.models.Meeting.getConnector();
		if (mentorUserId) {
			sql = "SELECT * from Meeting WHERE mentorUserId=$1 AND date >= $2 AND date <= $3 AND statusId=$4";
			params = [mentorUserId, fromDtm, toDtm, completedStatus.id];
		} else {
			sql = "SELECT * from Meeting WHERE mentorUserId IN (SELECT id FROM TTUser WHERE signupAs=$1 AND companyId=$2) AND date >= $3 AND date <= $4 AND statusId=$5";
			params = ['mentor', companyId, fromDtm, toDtm, completedStatus.id];
		}
		var meetings = await this.queryResult(connector, sql, params);

		var mLn = meetings.length;
		for (var j = 0; j < mLn; j++) {
			var m = meetings[j];

			var duration = (m.duration / 60).toFixed(2) * 1;

			var dt = moment(m.date).format(fmt);
			var idx = timeDim.indexOf(dt);
			if (idx == -1) {
				timeDim.push(dt);
				idx = timeDim.indexOf(dt);
			}
			if (!timeSpentHrs[idx]) timeSpentHrs[idx] = 0;

			timeSpentHrs[idx] += duration.toFixed(2) * 1;
		}

		return {
			dimension: timeDim,
			availableHrs: timeAvailableHrs,
			spentHrs: timeSpentHrs
		};
	}

	Dashboard.totalUsers = async function () {
		var mentorsCount = await app.models.TTUser.count({
			signupAs: 'mentor',
			isActive: true
		});

		var csCount = await app.models.TTUser.count({
			signupAs: 'career-seeker',
			isActive: true
		});

		var sponsorCount = await app.models.TTUser.count({
			signupAs: 'sponsor',
			isActive: true
		});

		var total = mentorsCount + csCount + sponsorCount;

		return [(100 * mentorsCount / total).toFixed(2) * 1, (100 * csCount / total).toFixed(2) * 1, (100 * sponsorCount / total).toFixed(2) * 1];
	}

	Dashboard.signUps = async function (fromDtm, toDtm) {

		var monthwiseSignups = {
			// 'Aug 19': [10,       15,         3]
			//            mentor    mentee      sponsor
		};

		var users = await app.models.TTUser.find({
			where: {
				signupAs: {
					inq: ['mentor', 'career-seeker', 'sponsor']
				},
				isActive: true,
				createdon: {
					between: [fromDtm, toDtm]
				}
			},
			order: 'createdon DESC'
		});

		var ln = users.length;
		for (var i = 0; i < ln; i++) {
			var u = users[i];
			var dt = moment(u.createdon).format('MMM YY');

			if (!monthwiseSignups[dt]) {
				monthwiseSignups[dt] = [0, 0, 0];
			}

			if (u.signupAs == 'mentor') {
				monthwiseSignups[dt][0] += 1;
			}

			if (u.signupAs == 'career-seeker') {
				monthwiseSignups[dt][1] += 1;
			}

			if (u.signupAs == 'sponsor') {
				monthwiseSignups[dt][2] += 1;
			}
		}

		var months = [];
		var mentors = [];
		var css = [];
		var sponsors = [];

		for (var month in monthwiseSignups) {
			months.unshift(month);

			mentors.unshift(monthwiseSignups[month][0]);
			css.unshift(monthwiseSignups[month][1]);
			sponsors.unshift(monthwiseSignups[month][2]);
		}

		return {
			months: months,
			mentors: mentors,
			seekers: css,
			sponsors: sponsors
		};
	}

	Dashboard.meetingsTrend = async function (fromDtm, toDtm, companyId = null, userId = null) {
		var completedStatus = await app.models.MeetingStatus.findOne({
			where: {
				name: 'completed'
			}
		});

		var rejectedStatus = await app.models.MeetingStatus.findOne({
			where: {
				name: 'rejected'
			}
		});

		var filter = {};
		if (companyId) {
			filter['companyId'] = companyId
		}
		if (userId) {
			filter['id'] = userId
		}

		// var users = await app.models.TTUserDetail.find({
		//     where: filter
		// });

		// var uLn = users.length;
		// var uids = [];
		// for (var i = 0; i < uLn; i++) {
		//     uids.push(users[i].userId);
		// }

		var where = {
			date: {
				between: [fromDtm, toDtm]
			}
		};
		if (userId) {
			where['mentorUserId'] = userId;
		}
		var meetings = await app.models.Meeting.find({
			where: where
		});

		var monthwiseStats = {};
		var mLn = meetings.length;

		var totalMinutes = 0;

		for (var i = 0; i < mLn; i++) {
			var m = meetings[i];
			var dt = moment(m.date).format('MMM YY');


			if (!monthwiseStats[dt]) {
				monthwiseStats[dt] = [0, 0, 0];
			}

			monthwiseStats[dt][0] += 1;

			if (m.statusId == completedStatus.id) {
				monthwiseStats[dt][1] += 1;

				var duration = m.duration;

				totalMinutes += duration;
			}

			if (m.statusId == rejectedStatus.id) {
				monthwiseStats[dt][2] += 1;
			}
		}

		var months = [];
		var allMeetings = [];
		var completedMeetings = [];
		var rejectedMeetings = [];

		for (var month in monthwiseStats) {
			months.push(month);

			allMeetings.push(monthwiseStats[month][0]);
			completedMeetings.push(monthwiseStats[month][1]);
			rejectedMeetings.push(monthwiseStats[month][2]);
		}

		// function for adding two numbers
		const addCM = (a, b) =>
		  a + b
		
		var avgDuration = 0;

		if(completedMeetings.length > 0){
			// use reduce to sum our array
			const completedMeetingsLn = completedMeetings.reduce(addCM);
			avgDuration = (totalMinutes / completedMeetingsLn).toFixed(2) * 1;
		}

		return {
			months: months,
			allMeetings: allMeetings,
			completedMeetings: completedMeetings,
			rejectedMeetings: rejectedMeetings,
			avgMeetingDuration: isNaN(avgDuration) ? 0 : avgDuration
		};
}

	Dashboard.queryResult = async function (connector, query, params) {
		return new Promise(function (resolve, reject) {
			connector.query(query, params, function (err, units) {
				if (err) {
					return reject(err);
				}
				return resolve(units);
			});
		});
	}

	Dashboard.topMentors = async function (limit = 5, next) {

		var connector = app.models.TTUser.getConnector();

		var sql = "SELECT userId from TTUserDetail WHERE userId IN (SELECT id FROM TTUser where signupAs=$1 ORDER BY totalVotes LIMIT $2)";

		var recs = await this.queryResult(connector, sql, ['mentor', limit]);

		var ids = [];
		var ln = recs.length;
		for (var i = 0; i < ln; i++) {
			ids.push(recs[i].userid);
		}

		var users = await app.models.TTUser.find({
			where: {
				id: {
					inq: ids
				}
			}
		});

		return users;
	}

	Dashboard.topSeekers = async function (limit = 5) {

		var connector = app.models.TTUser.getConnector();

		var sql = "SELECT userId from TTUserDetail WHERE userId IN (SELECT id FROM TTUser where signupAs=$1 ORDER BY totalVotes LIMIT $2)";

		var recs = await this.queryResult(connector, sql, ['career-seeker', limit]);

		var ids = [];
		var ln = recs.length;
		for (var i = 0; i < ln; i++) {
			ids.push(recs[i].userid);
		}

		var users = await app.models.TTUser.find({
			where: {
				id: {
					inq: ids
				}
			}
		});

		return users;
	}

	Dashboard.topSkills = async function (limit = 5) {
		var connector = app.models.TTUser.getConnector();

		var sql = "SELECT skillId, count(*) as total from SelfAssessment GROUP BY skillId ORDER BY total DESC LIMIT $1";

		var recs = await this.queryResult(connector, sql, [limit]);

		var ids = [];
		var ln = recs.length;
		for (var i = 0; i < ln; i++) {
			ids.push(recs[i].skillid);
		}

		var skills = await app.models.Skill.find({
			where: {
				id: {
					inq: ids
				}
			}
		});

		return skills;
	}

	Dashboard.topCountries = async function (limit = 5) {
		var connector = app.models.TTUser.getConnector();

		var sql = "SELECT countryId, count(*) as total FROM TTUserDetail GROUP BY countryId ORDER BY total DESC LIMIT $1";

		var recs = await this.queryResult(connector, sql, [limit]);

		var ln = recs.length;
		for (var i = 0; i < ln; i++) {
			if (recs[i].countryid) {
				var country = await app.models.Country.findById(recs[i].countryid);
				recs[i].country = country.name;
			} else {
				recs[i].country = 'UNKNOWN';
			}
		}

		return recs;
	}

	Dashboard.topCompanies = async function (limit = 5) {
		var connector = app.models.TTUser.getConnector();

		var sql = "SELECT companyId, count(*) as total FROM TTUserDetail WHERE companyId IS NOT NULL GROUP BY companyId ORDER BY total DESC LIMIT $1";

		var recs = await this.queryResult(connector, sql, [limit]);

		var ln = recs.length;
		for (var i = 0; i < ln; i++) {
			var company = await app.models.Company.findById(recs[i].companyid);
			recs[i].company = company.name;

		}

		return recs;
	}

	Dashboard.totalMentors = async function (companyId) {

		var yours = await app.models.TTUserDetail.count({
			companyId: companyId
		});

		var otherSponsored = await app.models.TTUserDetail.count({
			companyId: {
				nin: [null, companyId]
			}
		});

		var nonSponsored = await app.models.TTUserDetail.count({
			companyId: null
		});

		var total = yours + otherSponsored + nonSponsored;

		return [(100 * yours / total).toFixed(2) * 1, (100 * otherSponsored / total).toFixed(2) * 1, (100 * nonSponsored / total).toFixed(2) * 1];
	}

	Dashboard.yourContribution = async function (companyId, fromDtm, toDtm) {
		var monthwiseSignups = {
		};

		var completedStatus = await app.models.MeetingStatus.findOne({
			where: {
				name: 'completed'
			}
		});

		var users = await app.models.TTUserDetail.find({
			where: {
				companyId: companyId,
				createdon: {
					between: [fromDtm, toDtm]
				}
			}
		});

		var ln = users.length;
		for (var i = 0; i < ln; i++) {
			var u = users[i];
			var dt = moment(u.createdon).format('MMM YY');

			if (!monthwiseSignups[dt]) {
				monthwiseSignups[dt] = [0, 0, 0];
			}

			monthwiseSignups[dt][0] += 1;

			var meetings = await app.models.Meeting.find({
				where: {
					mentorUserId: u.id,
					statusId: completedStatus.id,
					date: {
						between: [fromDtm, toDtm]
					}
				}
			});

			var mLn = meetings.length;
			for (var j = 0; j < mLn; j++) {
				var m = meetings[j];
				var dt = moment(m.date).format('MMM YY');

				if (!monthwiseSignups[dt]) {
					monthwiseSignups[dt] = [0, 0, 0];
				}

				var duration = m.duration;

				monthwiseSignups[dt][1] += duration;
			}
		}

		var months = [];
		var mentors = [];
		var hours = [];

		for (var month in monthwiseSignups) {
			months.push(month);

			mentors.push(monthwiseSignups[month][0]);
			hours.push((monthwiseSignups[month][1] / 60).toFixed(2) * 1);
		}

		return {
			months: months,
			mentors: mentors,
			hours: hours
		};
	}

	Dashboard.yourTopMentors = async function (companyId, limit = 10) {

		var connector = app.models.TTUser.getConnector();

		var sql = "SELECT userId from TTUserDetail WHERE userId IN (SELECT id FROM TTUser WHERE signupAs=$1 AND companyId=$2 ORDER BY totalVotes LIMIT $3)";

		var recs = await this.queryResult(connector, sql, ['mentor', companyId, limit]);

		var ids = [];
		var ln = recs.length;
		for (var i = 0; i < ln; i++) {
			ids.push(recs[i].userid);
		}

		var users = await app.models.TTUser.find({
			where: {
				id: {
					inq: ids
				}
			},
			include: ['userDetail']
		});

		var completedStatus = await app.models.MeetingStatus.findOne({
			where: {
				name: 'completed'
			}
		});

		var uLn = users.length;
		var result = [];
		for (var i = 0; i < uLn; i++) {
			var tmp = users[i];
			var ud = tmp.userDetail();
			var u = {
				id: tmp.id,
				fullName: tmp.firstName + ' ' + tmp.lastName,
				avatarUrl: ud.avatarUrl,
				rating: ud.avgRating
			}

			var meetings = await app.models.Meeting.find({
				where: {
					mentorUserId: tmp.id,
					statusId: completedStatus.id
				}
			});

			var mLn = meetings.length;
			var hrsSpent = 0;
			for (var j = 0; j < mLn; j++) {
				var m = meetings[j];
				var dt = moment(m.date).format('MMM YY');

				var duration = m.duration;

				hrsSpent += duration;
			}

			u.hrsSpent = (hrsSpent / 60).toFixed(2) * 1;
			result.push(u);
		}

		function sortByContribution(obj) {
			var sortable = [];
			for (var key in obj)
				sortable.push(obj[key]);

			// sort items by value
			sortable.sort(function (a, b) {
				return b.hrsSpent - a.hrsSpent; // compare numbers
			});
			return sortable;
		}

		var sortedUtilisation = sortByContribution(result);

		return sortedUtilisation;
	}

	Dashboard.getTotalWeekdays = function (fromDtm, toDtm) {
		var result = {};
		var fromDt = moment(fromDtm);
		var toDt = moment(toDtm)

		var duration = moment.duration(toDt.diff(fromDt)).as('days');

		if (duration < 1) {
			return null;
		}

		var next = fromDt;
		var nextWeekday = fromDt.isoWeekday();
		for (var i = 0; i < duration; i++) {
			if (!result[nextWeekday]) {
				result[nextWeekday] = 0;
			}

			result[nextWeekday] += 1;

			next = fromDt.add(1, 'day');
			nextWeekday = next.isoWeekday();
		}

		return result;
	}

	Dashboard.utilizationReport = async function (companyId, fromDtm, toDtm, presentation = 'date', mentorUserId = null) {
		var timeDim = [];
		var timeAvailableHrs = [];
		var timeSpentHrs = [];

		var totalDays = moment.duration(moment(toDtm).diff(moment(fromDtm))).as('days');

		// var weekdaysAndCounts = Dashboard.getTotalWeekdays(fromDtm, toDtm);

		// var wdIsoIds = [];
		// var wdIsoIds = Object.keys(weekdaysAndCounts);

		// var weekdays = await app.models.Weekday.find({
		//     where: {
		//         iso: {
		//             inq: wdIsoIds
		//         }
		//     }
		// });

		// var wdIds = [];
		// var wdLn = weekdays.length;
		// for (var i = 0; i < wdLn; i++) {
		//     var wd = weekdays[i];

		//     wdIds.push(wd.id);
		// }

		// function generateInClause(arr, startIdx) {
		//     var result = {
		//         indices: [],
		//         values: []
		//     };

		//     var ln = arr.length;
		//     for (var i = 0; i < ln; i++) {
		//         result.indices.push('$' + (startIdx + i));
		//         result.values.push(arr[i]);
		//     }

		//     return result;
		// }

		var fmt;
		if (presentation == 'date') {
			fmt = 'MM/DD/YYYY';
		}
		if (presentation == 'week') {
			fmt = 'W';
		}
		if (presentation == 'month') {
			fmt = 'MMM YY';
		}

		//process allowed weekday slots
		var mentorwiseHours = {};
		var connector = app.models.SlotsAllowed.getConnector();
		var sql, params;

		for (var i = 0; i < totalDays; i++) {

			var date = moment(fromDtm).add(i, 'days');
			var wdIsoId = moment(date).isoWeekday();
			var wdId = await app.models.Weekday.findOne({
				where: {
					iso: wdIsoId
				}
			});
			var dt = date.format(fmt)

			if (mentorUserId) {
				sql = "SELECT * from SlotsAllowed WHERE userId=$1 AND weekdayId = $2";
				params = [mentorUserId, wdId.id];
			} else {
				sql = "SELECT * from SlotsAllowed WHERE userId IN (SELECT id FROM TTUser WHERE signupAs=$1 AND companyId=$2) AND weekdayId = $3";
				params = ['mentor', companyId, wdId.id];
			}

			var slotsAllowed = await this.queryResult(connector, sql, params);

			var saLn = slotsAllowed.length;
			for (var j = 0; j < saLn; j++) {
				var sa = slotsAllowed[j];
				if (!mentorwiseHours[sa.userid]) {
					mentorwiseHours[sa.userid] = {
						totalAllowedSlots: 0,
						totalSpecialdaySlots: 0,
						totalLeaves: 0,
						userId: sa.userid
					};
				}

				var duration = sa.duration;

				mentorwiseHours[sa.userid]['totalAllowedSlots'] += duration;

				var idx = timeDim.indexOf(dt);
				if (idx == -1) {
					timeDim.push(dt);
					idx = timeDim.indexOf(dt);
				}
				if (!timeAvailableHrs[idx]) timeAvailableHrs[idx] = 0;

				timeAvailableHrs[idx] += (duration / 60).toFixed(2) * 1;
			}
		}

		//process leaves
		connector = app.models.Leave.getConnector();
		if (mentorUserId) {
			sql = "SELECT * from Leave WHERE userId=$1 AND date >= $2 AND date <= $3";
			params = [mentorUserId, fromDtm, toDtm];
		} else {
			sql = "SELECT * from Leave WHERE userId IN (SELECT id FROM TTUser WHERE signupAs=$1 AND companyId=$2) AND date >= $3 AND date <= $4";
			params = ['mentor', companyId, fromDtm, toDtm];
		}

		var leaves = await this.queryResult(connector, sql, params);

		var lln = leaves.length;
		for (var i = 0; i < lln; i++) {
			var l = leaves[i];
			var wd = moment(l.date).isoWeekday();
			var weekday = await app.models.Weekday.findOne({
				where: {
					iso: wd
				}
			});

			var slots = await app.models.SlotsAllowed.find({
				where: {
					weekdayId: weekday.id,
					userId: l.userid
				}
			});

			var saLn = slots.length;
			for (var j = 0; j < saLn; j++) {
				var sa = slots[j];
				if (!mentorwiseHours[sa.userId]) {
					mentorwiseHours[sa.userId] = {
						totalAllowedSlots: 0,
						totalSpecialdaySlots: 0,
						totalLeaves: 0,
						userId: sa.userid
					};
				}

				var duration = sa.duration;

				mentorwiseHours[sa.userId]['totalLeaves'] += duration;

				var dt = moment(l.date).format(fmt);
				var idx = timeDim.indexOf(dt);
				if (idx == -1) {
					timeDim.push(dt);
					idx = timeDim.indexOf(dt);
				}
				if (!timeAvailableHrs[idx]) timeAvailableHrs[idx] = 0;

				timeAvailableHrs[idx] -= (duration / 60).toFixed(2) * 1;
			}
		}

		//process special day slots
		connector = app.models.SpecialDaySlot.getConnector();
		if (mentorUserId) {
			sql = "SELECT * from SpecialDaySlot WHERE userId=$1 AND date >= $2 AND date <= $3";
			params = [mentorUserId, fromDtm, toDtm];
		} else {
			sql = "SELECT * from SpecialDaySlot WHERE userId IN (SELECT id FROM TTUser WHERE signupAs=$1 AND companyId=$2) AND date >= $3 AND date <= $4";
			params = ['mentor', companyId, fromDtm, toDtm];
		}
		var specialDaySlots = await this.queryResult(connector, sql, params);

		var sdsLn = specialDaySlots.length;
		for (var i = 0; i < sdsLn; i++) {
			var sds = specialDaySlots[i];
			if (!mentorwiseHours[sds.userid]) {
				mentorwiseHours[sds.userid] = {
					totalAllowedSlots: 0,
					totalSpecialdaySlots: 0,
					totalLeaves: 0,
					userId: sa.userid
				};
			}

			var duration = sds.duration;

			mentorwiseHours[sds.userid]['totalSpecialdaySlots'] += duration;

			var dt = moment(sa.date).format(fmt);
			var idx = timeDim.indexOf(dt);
			if (idx == -1) {
				timeDim.push(dt);
				idx = timeDim.indexOf(dt);
			}
			if (!timeAvailableHrs[idx]) timeAvailableHrs[idx] = 0;

			timeAvailableHrs[idx] += (duration / 60).toFixed(2) * 1;
		}

		//process completed meetings
		var completedStatus = await app.models.MeetingStatus.findOne({
			where: {
				name: 'completed'
			}
		});

		var mentorsIds = Object.keys(mentorwiseHours);
		var miLn = mentorsIds.length;
		for (var i = 0; i < miLn; i++) {
			var meetings = await app.models.Meeting.find({
				where: {
					mentorUserId: mentorsIds[i] * 1,
					date: {
						between: [fromDtm, toDtm]
					},
					statusId: completedStatus.id
				}
			});

			var mLn = meetings.length;
			for (var j = 0; j < mLn; j++) {
				var m = meetings[j];

				var duration = m.duration;

				if (!mentorwiseHours[m.mentorUserId]['totalCompletedMeetingsTime']) {
					mentorwiseHours[m.mentorUserId]['totalCompletedMeetingsTime'] = 0;
				}
				mentorwiseHours[m.mentorUserId]['totalCompletedMeetingsTime'] += duration;

				var dt = moment(m.date).format(fmt);
				var idx = timeDim.indexOf(dt);
				if (idx == -1) {
					timeDim.push(dt);
					idx = timeDim.indexOf(dt);
				}
				if (!timeSpentHrs[idx]) timeSpentHrs[idx] = 0;

				timeSpentHrs[idx] += (duration / 60).toFixed(2) * 1;
			}
		}

		function sortByUtilization(obj) {
			var sortable = [];
			for (var key in obj)
				sortable.push(obj[key]);

			// sort items by value
			sortable.sort(function (a, b) {
				return b.totalCompletedMeetingsTime - a.totalCompletedMeetingsTime; // compare numbers
			});
			return sortable;
		}

		var sortedUtilisation = sortByUtilization(mentorwiseHours);
		var suLn = sortedUtilisation.length;

		var result = {
			utilization: []
		};
		var totalContributedHrs = 0;


		for (var i = 0; i < suLn; i++) {
			var su = sortedUtilisation[i];
			var hrsUtilised = (su.totalCompletedMeetingsTime / 60).toFixed(2) * 1;
			var hrsAvailable = ((su.totalAllowedSlots + su.totalSpecialdaySlots - su.totalLeaves) / 60).toFixed(2);

			var u = await app.models.TTUser.findById(su.userId, {
				include: ['userDetail']
			});


			if (isNaN(hrsUtilised)) {
				hrsUtilised = 0;
			}
			if (isNaN(hrsAvailable)) {
				hrsAvailable = 0;
			}

			u.hrsAvailable = hrsAvailable;
			u.hrsUtilised = hrsUtilised;
			u.pctContribution = 0;

			result.utilization.push(u);

			totalContributedHrs += hrsUtilised;
		}

		result['totalContributedHrs'] = totalContributedHrs;

		var rsLn = result['utilization'].length;
		for (var i = 0; i < rsLn; i++) {
			var u = result['utilization'][i];
			u.fullName = u.firstName + ' ' + u.lastName;
			if (totalContributedHrs > 0) {
				u.pctContribution = u.hrsUtilised * 100 / totalContributedHrs;
			}
		}

		result['hours'] = {
			dimension: timeDim,
			availableHrs: timeAvailableHrs,
			spentHrs: timeSpentHrs
		}

		return result;
	}

	Dashboard.contributionReport = async function (companyId, fromDtm, toDtm, presentation = 'date', mentorUserId = null) {

		var filter = {
			createdon: {
				between: [fromDtm, toDtm]
			},
			signupAs: 'mentor',
			companyId: companyId
		};
		if (mentorUserId) {
			filter['id'] = mentorUserId
		}

		var mentorsCount = await app.models.TTUser.count(filter);

		var completedStatus = await app.models.MeetingStatus.findOne({
			where: {
				name: 'completed'
			}
		});

		var connector = app.models.Meeting.getConnector();

		var sql = "SELECT * from Meeting WHERE mentorUserId IN (SELECT id FROM TTUser WHERE signupAs=$1 AND companyId=$2) AND date >= $3 AND date <= $4 AND statusId=$5 ORDER BY date ASC";

		var recs = await this.queryResult(connector, sql, ['mentor', companyId, fromDtm, toDtm, completedStatus.id]);

		var ln = recs.length;
		var userwiseContributions = {};
		var timeDim = [];
		var timeHrs = [];
		var totalHours = 0;
		for (var i = 0; i < ln; i++) {
			var m = recs[i];

			var duration = m.duration;

			totalHours += (duration / 60).toFixed(2) * 1;

			if (!userwiseContributions[m.mentoruserid]) {
				userwiseContributions[m.mentoruserid] = m;
			}

			var fmt;
			if (presentation == 'date') {
				fmt = 'MM/DD/YYYY';
			}
			if (presentation == 'week') {
				fmt = 'W';
			}
			if (presentation == 'month') {
				fmt = 'MMM YY';
			}

			var dt = moment(m.date).format(fmt);
			var idx = timeDim.indexOf(dt);
			if (idx == -1) {
				timeDim.push(dt);
				idx = timeDim.indexOf(dt);
			}
			if (!timeHrs[idx]) timeHrs[idx] = 0;

			timeHrs[idx] += (duration / 60).toFixed(2) * 1;

			if (!userwiseContributions[m.mentoruserid]['hoursContributed']) {
				userwiseContributions[m.mentoruserid]['hoursContributed'] = 0
			}

			userwiseContributions[m.mentoruserid]['hoursContributed'] += (duration / 60).toFixed(2) * 1;
			var u = await app.models.TTUser.find({
				where: { id: m.mentoruserid },
				include: ['userDetail']
			});

			u[0].fullName = u[0].firstName + ' ' + u[0].lastName;

			userwiseContributions[m.mentoruserid]['user'] = u[0];
			userwiseContributions[m.mentoruserid]['presentationDt'] = dt;
		}

		//order userwise contributions by their contribution
		function sortObj(obj) {
			var sortable = [];
			for (var key in obj)
				sortable.push(obj[key]);

			// sort items by value
			sortable.sort(function (a, b) {
				return b.hoursContributed - a.hoursContributed; // compare numbers
			});
			return sortable;
		}

		var sortedContributions = sortObj(userwiseContributions);
		var ln = sortedContributions.length;

		for (var i = 0; i < ln; i++) {
			var m = sortedContributions[i];
			m['percentageContribution'] = (m['hoursContributed'] * 100 / totalHours).toFixed(2) * 1;
		}

		return {
			contributions: sortedContributions,
			hours: {
				dimension: timeDim,
				facts: timeHrs
			},
			totalHours: totalHours,
			totalMentors: mentorsCount
		}
	}

	Dashboard.downloadUtilizationReport = async function (fromDtm, toDtm, mentorId) {

	}

	Dashboard.downloadContributionReport = async function (fromDtm, toDtm, mentorId) {

	}
	
	Dashboard.referrals = async function (ctx) {
		const token = ctx && ctx.accessToken;
        const userId = token && token.userId;
		var user = await app.models.TTUser.findById(userId);
		
		// var whereClause = {
		// 	inviteSent: true
		// };
		if (user.signupAs != 'admin') {
			// whereClause = { invitedByUserId: userId };
			// var invitesSent = await app.models.ReferralCode.count(whereClause);
			var invitesSent = await app.models.ReferralCode.count( { inviteSent: true, invitedByUserId: userId });
			var signUpsOpened = await app.models.ReferralCode.count( { hasOpened: true, invitedByUserId: userId });
			var hasSignedUp = await app.models.ReferralCode.count( { hasSignedUp: true, invitedByUserId: userId });
			var hasConfirmed = await app.models.ReferralCode.count( { hasConfirmed: true, invitedByUserId: userId });
			var tokensAllocated = await app.models.ReferralCode.count( { hasTokenAllocated: true, invitedByUserId: userId });
		} else {
			var invitesSent = await app.models.ReferralCode.count( { inviteSent: true });
			var signUpsOpened = await app.models.ReferralCode.count( { hasOpened: true });
			var hasSignedUp = await app.models.ReferralCode.count( { hasSignedUp: true });
			var hasConfirmed = await app.models.ReferralCode.count( { hasConfirmed: true });
			var tokensAllocated = await app.models.ReferralCode.count( { hasTokenAllocated: true });
		}

		return [{
			invitesSent: invitesSent,
			signUpsOpened: signUpsOpened,
			hasSignedUp: hasSignedUp,
			hasConfirmed: hasConfirmed,
			tokensAllocated: tokensAllocated
		}];
	}

	Dashboard.remoteMethod('recentMatchingMentors', {
		description: 'This method returns mentors whose recent skill matches with a mentee',
		accepts: [{ arg: 'limit', type: 'number' },
		{ "arg": "ctx", "type": "object", "http": "optionsFromRequest" }],
		returns: { arg: 'result', type: 'object' }
	});

	Dashboard.remoteMethod('upcomingMeetings', {
		description: 'This method returns upcoming meetings',
		accepts: [{ arg: 'limit', type: 'number' },
		{ "arg": "ctx", "type": "object", "http": "optionsFromRequest" }],
		returns: { arg: 'result', type: 'object' }
	});

	Dashboard.remoteMethod('pendingTasks', {
		description: 'This method returns pending tasks',
		accepts: [{ arg: 'limit', type: 'number' },
		{ "arg": "ctx", "type": "object", "http": "optionsFromRequest" }],
		returns: { arg: 'result', type: 'object' }
	});

	Dashboard.remoteMethod('recentSkillRatings', {
		description: 'This method returns recently rated skills',
		accepts: [{ arg: 'limit', type: 'number' },
		{ "arg": "ctx", "type": "object", "http": "optionsFromRequest" }],
		returns: { arg: 'result', type: 'object' }
	});

	Dashboard.remoteMethod('utilization', {
		description: 'This method returns utilization',
		accepts: [{ arg: 'companyId', type: 'number' },
		{ arg: 'fromDtm', type: 'date' },
		{ arg: 'toDtm', type: 'date' },
		{ arg: 'presentation', type: 'string' },
		{ arg: 'mentorUserId', type: 'number' }],
		returns: { arg: 'result', type: 'object' }
	});

	Dashboard.remoteMethod('totalUsers', {
		description: 'This method returns users distribution',
		accepts: [],
		returns: { arg: 'result', type: 'object' }
	});

	Dashboard.remoteMethod('signUps', {
		description: 'This method returns sign ups',
		accepts: [{ arg: 'fromDtm', type: 'date' },
		{ arg: 'toDtm', type: 'date' }],
		returns: { arg: 'result', type: 'object' }
	});

	Dashboard.remoteMethod('topMentors', {
		description: 'This method returns top mentors',
		accepts: [{ arg: 'limit', type: 'number' }],
		returns: { arg: 'result', type: 'object' }
	});

	Dashboard.remoteMethod('topSeekers', {
		description: 'This method returns top seekers',
		accepts: [{ arg: 'limit', type: 'number' }],
		returns: { arg: 'result', type: 'object' }
	});

	Dashboard.remoteMethod('topSkills', {
		description: 'This method returns top skills',
		accepts: [{ arg: 'limit', type: 'number' }],
		returns: { arg: 'result', type: 'object' }
	});

	Dashboard.remoteMethod('topCountries', {
		description: 'This method returns top countries',
		accepts: [{ arg: 'limit', type: 'number' }],
		returns: { arg: 'result', type: 'object' }
	});

	Dashboard.remoteMethod('topCompanies', {
		description: 'This method returns top companies',
		accepts: [{ arg: 'limit', type: 'number' }],
		returns: { arg: 'result', type: 'object' }
	});

	Dashboard.remoteMethod('totalMentors', {
		description: 'This method returns total mentors',
		accepts: [{ arg: 'companyId', type: 'number' }],
		returns: { arg: 'result', type: 'object' }
	});

	Dashboard.remoteMethod('yourContribution', {
		description: 'This method returns sign ups',
		accepts: [{ arg: 'companyId', type: 'number' },
		{ arg: 'fromDtm', type: 'date' },
		{ arg: 'toDtm', type: 'date' }],
		returns: { arg: 'result', type: 'object' }
	});

	Dashboard.remoteMethod('yourTopMentors', {
		description: 'This method returns sign ups',
		accepts: [{ arg: 'companyId', type: 'number' },
		{ arg: 'limit', type: 'number' }],
		returns: { arg: 'result', type: 'object' }
	});

	Dashboard.remoteMethod('meetingsTrend', {
		description: 'This method returns meetings trends',
		accepts: [{ arg: 'fromDtm', type: 'date' },
		{ arg: 'toDtm', type: 'date' },
		{ arg: 'companyId', type: 'number' },
		{ arg: 'userId', type: 'number' }
		],
		returns: { arg: 'result', type: 'object' }
	});

	Dashboard.remoteMethod('contributionReport', {
		description: 'This method returns contributions',
		accepts: [{ arg: 'companyId', type: 'number' },
		{ arg: 'fromDtm', type: 'date' },
		{ arg: 'toDtm', type: 'date' },
		{ arg: 'presentation', type: 'string' },
		{ arg: 'mentorUserId', type: 'number' }
		],
		returns: { arg: 'result', type: 'object' }
	});

	Dashboard.remoteMethod('utilizationReport', {
		description: 'This method returns utilization',
		accepts: [{ arg: 'companyId', type: 'number' },
		{ arg: 'fromDtm', type: 'date' },
		{ arg: 'toDtm', type: 'date' },
		{ arg: 'presentation', type: 'string' },
		{ arg: 'mentorUserId', type: 'number' }
		],
		returns: { arg: 'result', type: 'object' }
	});

	Dashboard.remoteMethod('referrals', {
		description: 'This method returns referrals details',
		accepts: [{arg: 'ctx', "type": "object", "http": "optionsFromRequest"}],
		returns: { arg: 'result', type: 'object' }
	});

}