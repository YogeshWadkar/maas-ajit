import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { GlobalCfgService } from "./globalcfg.service";
import { environment } from "../environments/environment";

import * as moment from "moment";

@Injectable()
export class AssessmentService {
  constructor(
    private http: HttpClient,
    private globalCfgService: GlobalCfgService
  ) {}

  getSelfAssessments(categoryId, page?) {
    var filter = JSON.stringify({
      where: {
        categoryId: categoryId,
        userId: this.globalCfgService.getUserId()
      },
      include: ["skill", "category", "profile"],
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    });
    return this.http.get(
      environment.apiurl +
        "/SelfAssessments/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  getAllUserSkills(userId) {
    var filter = JSON.stringify({
      where: {
        userId: userId
      },
      include: ["skill", "category"]
    });
    return this.http.get(
      environment.apiurl +
        "/SelfAssessments/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  updateSelfAssessment(record) {
    return this.http.put(
      environment.apiurl +
        "/SelfAssessments/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  deleteSelfAssessment(id) {
    return this.http.delete(
      environment.apiurl +
        "/SelfAssessments/" +
        id +
        "?access_token=" +
        this.globalCfgService.getAccessToken()
    );
  }

  createSelfAssessment(record) {
    return this.http.post(
      environment.apiurl +
        "/SelfAssessments/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  getOverallAssements(categoryId) {
    return this.http.post(
      environment.apiurl +
        "/SelfAssessments/overallAssessment?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        categoryId: categoryId,
        userId: this.globalCfgService.getUserId()
      }
    );
  }

  getSelfAssessmentsForMentorAssessment(userId) {
    return this.http.post(
      environment.apiurl +
        "/SelfAssessments/selfAssessmentForMentorAssessment?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        userId: this.globalCfgService.getUserId()
      }
    );
  }

  getPendingAssessments() {}

  getOverallAvgRatings() {}

  getMentorAssessmentsForUser(userId) {
    var filter = JSON.stringify({
      where: {
        userId: userId
      },
      include: ["selfAssessment", "mentorUser", "seekerUser", "skill"]
    });
    return this.http.get(
      environment.apiurl +
        "/MentorAssessments/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  createAssessmentRequest(rec) {
    return this.http.post( environment.apiurl + "/AssessmentRequests?access_token=" + this.globalCfgService.getAccessToken(),rec);
  }

  getAssessmentStatuses() {
    return this.http.get(environment.apiurl + "/AssessmentStatuses?access_token=" + this.globalCfgService.getAccessToken());
  }

  getPendingApprovalAssessments(statusId, userId, page, requestId?) {
    var filter = {
      where: {
        // statusId: statusId,
      },
      include: ["mentorUser", "seekerUser", "status", "level"],
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    };

    if (requestId) {
      filter.where['id'] = requestId;
    }

    return this.http.get(
      environment.apiurl +
        "/AssessmentRequests/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        JSON.stringify(filter)
    );
  }

  getPendingApprovalAssessmentsForMentor(statusId, userId, page?, requestId?) {
    var now = moment();
    var filter = {
      where: {
        mentorUserId: userId,
        // statusId: statusId
      },
      include: ["mentorUser", "seekerUser", "status", "level"],
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    }

    if (requestId) {
      filter.where['id'] = requestId;
    }

    return this.http.get(
      environment.apiurl +
        "/AssessmentRequests/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        JSON.stringify(filter)
    );
  }

  getPendingApprovalAssessmentsForCS(statusId, userId, page?, requestId?) {
    var now = moment();
    var filter = {
      where: {
        seekerUserId: userId,
        // statusId: statusId
      },
      include: ["mentorUser", "seekerUser", "status", "level"],
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    }

    if (requestId) {
      filter.where['id'] = requestId;
    }

    return this.http.get(
      environment.apiurl +
        "/AssessmentRequests/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        JSON.stringify(filter)
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

  patchAssessmentRequest(id, attributes) {
    return this.http.patch(
      environment.apiurl +
        "/AssessmentRequests/" +
        id +
        "?access_token=" +
        this.globalCfgService.getAccessToken(),
        attributes
    );
  }

  approve(rec) {
    return this.http.post( environment.apiurl + "/AssessmentRequests/approve?access_token=" + this.globalCfgService.getAccessToken(),rec);
  }

  updateAssessmentRequest(rec) {
    return this.http.put( environment.apiurl + "/AssessmentRequests?access_token=" + this.globalCfgService.getAccessToken(),rec);
  }

  getAssessment(id) {
    return this.http.get( environment.apiurl + "/AssessmentRequests/" + id + "?access_token=" + this.globalCfgService.getAccessToken());
  }
}
