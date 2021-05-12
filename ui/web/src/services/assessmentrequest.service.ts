import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { GlobalCfgService } from "./globalcfg.service";
import { environment } from "../environments/environment";

import * as moment from "moment";

@Injectable()
export class AssessmentRequestService {
  constructor(
    private http: HttpClient,
    private globalCfgService: GlobalCfgService
  ) {}

  getUpcomingAssessments(statusId, page?) {
    var now = moment();
    var filter = JSON.stringify({
      where: {
        // date: 'gt ' + now,
        // fromTm: 'gt ' + now,
        statusId: statusId
      },
      include: ["mentorUser", "seekerUser", "status"],
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    });
    return this.http.get(
      environment.apiurl +
        "/AssessmentRequests/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  getExpiredAssessments(statusId, page?) {
    var now = moment();
    var filter = JSON.stringify({
      where: {
        statusId: statusId
      },
      include: ["mentorUser", "seekerUser", "status"],
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    });
    return this.http.get(
      environment.apiurl +
        "/AssessmentRequests/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  getPendingApprovalAssessments(statusId, userId, page?) {
    var now = moment();
    var filter = JSON.stringify({
      where: {
        // date: 'gt ' + now,
        // fromTm: 'gt ' + now,
        statusId: statusId
      },
      include: ["mentorUser", "seekerUser", "status"],
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    });
    return this.http.get(
      environment.apiurl +
        "/AssessmentRequests/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  getPendingApprovalAssessmentsForCS(statusId, userId, page?) {
    var now = moment();
    var filter = JSON.stringify({
      where: {
        seekerUserId: userId,
        // date: 'gt ' + now,
        // fromTm: 'gt ' + now,
        statusId: statusId
      },
      include: ["mentorUser", "seekerUser", "status"],
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    });
    return this.http.get(
      environment.apiurl +
        "/AssessmentRequests/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  getPendingApprovalAssessmentsForMentor(statusId, userId, page?) {
    var now = moment();
    var filter = JSON.stringify({
      where: {
        mentorUserId: userId,
        // date: 'gt ' + now,
        // fromTm: 'gt ' + now,
        statusId: statusId
      },
      include: ["mentorUser", "seekerUser", "status"],
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    });
    return this.http.get(
      environment.apiurl +
        "/AssessmentRequests/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  updateAssessmentStatus(id, statusId) {
    return this.http.patch(
      environment.apiurl +
        "/AssessmentRequests/" +
        id +
        "?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        statusId: statusId
      }
    );
  }

  bookMeeting(record) {
    return this.http.post(
      environment.apiurl +
        "/AssessmentRequests/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  //approve/reject/complete a meeting
  updateMeeting(record) {}

  getCompletedAssessments(statusId, page?) {
    var now = moment();
    var filter = JSON.stringify({
      where: {
        // date: 'gt ' + now,
        // fromTm: 'gt ' + now,
        statusId: statusId
      },
      include: ["mentorUser", "seekerUser", "status"],
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    });
    return this.http.get(
      environment.apiurl +
        "/AssessmentRequests/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  getWeekdayWiseAvailableSlots(weekdayId) {
    var rec = {};
    if (weekdayId) {
      rec = {
        weekdayId: weekdayId
      };
    }
    return this.http.post(
      environment.apiurl +
        "/SlotsAlloweds/weekdayWiseAvailableSlots/?access_token=" +
        this.globalCfgService.getAccessToken(),
      rec
    );
  }

  getDateWiseAvailableSlots(date, weekdayId) {
    return this.http.post(
      environment.apiurl +
        "/SlotsAlloweds/dateWiseAvailableSlots/?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        date: date,
        weekdayId: weekdayId
      }
    );
  }

  getAssessmentStatuses() {
    return this.http.get(
      environment.apiurl +
        "/AssessmentStatuses/?access_token=" +
        this.globalCfgService.getAccessToken()
    );
  }
}
