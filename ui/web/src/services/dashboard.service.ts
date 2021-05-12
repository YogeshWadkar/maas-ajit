import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { GlobalCfgService } from "./globalcfg.service";
import { environment } from "../environments/environment";

import * as moment from "moment";

@Injectable()
export class DashboardService {
  constructor(
    private http: HttpClient,
    private globalCfgService: GlobalCfgService
  ) {}

  getRecentMatchingMentors() {
    return this.http.post(
      environment.apiurl +
        "/Dashboards/recentMatchingMentors?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        limit: 3
      }
    );
  }

  getUpcomingMeetings() {
    return this.http.post(
      environment.apiurl +
        "/Dashboards/upcomingMeetings?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        limit: 3
      }
    );
  }

  getPendingTasks() {
    return this.http.post(
      environment.apiurl +
        "/Dashboards/pendingTasks?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        limit: 3
      }
    );
  }

  getRecentSkillRatings() {
    return this.http.post(
      environment.apiurl +
        "/Dashboards/recentSkillRatings?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        limit: 4
      }
    );
  }

  getTotalUsers() {
    return this.http.post(
      environment.apiurl +
        "/Dashboards/totalUsers?access_token=" +
        this.globalCfgService.getAccessToken(),
      {}
    );
  }

  getSignUps(fromDtm, toDtm) {
    return this.http.post(
      environment.apiurl +
        "/Dashboards/signUps?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        fromDtm: fromDtm,
        toDtm: toDtm
      }
    );
  }

  getTopMentors() {
    return this.http.post(
      environment.apiurl +
        "/Dashboards/topMentors?access_token=" +
        this.globalCfgService.getAccessToken(),
      {}
    );
  }

  getTopSeekers() {
    return this.http.post(
      environment.apiurl +
        "/Dashboards/topSeekers?access_token=" +
        this.globalCfgService.getAccessToken(),
      {}
    );
  }

  getTopSkills() {
    return this.http.post(
      environment.apiurl +
        "/Dashboards/topSkills?access_token=" +
        this.globalCfgService.getAccessToken(),
      {}
    );
  }

  getTopCountries() {
    return this.http.post(
      environment.apiurl +
        "/Dashboards/topCountries?access_token=" +
        this.globalCfgService.getAccessToken(),
      {}
    );
  }

  getTopCompanies() {
    return this.http.post(
      environment.apiurl +
        "/Dashboards/topCompanies?access_token=" +
        this.globalCfgService.getAccessToken(),
      {}
    );
  }

  getTotalMentors(companyId) {
    return this.http.post(
      environment.apiurl +
        "/Dashboards/totalMentors?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        companyId: companyId
      }
    );
  }

  getYourContribution(companyId, fromDtm, toDtm) {
    return this.http.post(
      environment.apiurl +
        "/Dashboards/yourContribution?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        companyId: companyId,
        fromDtm: fromDtm,
        toDtm: toDtm
      }
    );
  }

  getYourTopMentors(companyId, limit = 5) {
    return this.http.post(
      environment.apiurl +
        "/Dashboards/yourTopMentors?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        companyId: companyId,
        limit: limit
      }
    );
  }

  getMeetingsTrend(companyId, fromDtm, toDtm) {
    var rec = {
      fromDtm: fromDtm,
      toDtm: toDtm
    };
    if (companyId) {
      rec["companyId"] = companyId;
    }
    return this.http.post(
      environment.apiurl +
        "/Dashboards/meetingsTrend?access_token=" +
        this.globalCfgService.getAccessToken(),
      rec
    );
  }

  getContributionReport(
    companyId,
    fromDtm,
    toDtm,
    presentation,
    selectedMentorId
  ) {
    var payload = {
      companyId: companyId,
      fromDtm: fromDtm,
      toDtm: toDtm,
      presentation: presentation
    };

    if (selectedMentorId && selectedMentorId != "all") {
      payload["mentorUserId"] = selectedMentorId * 1;
    }
    return this.http.post(
      environment.apiurl +
        "/Dashboards/contributionReport?access_token=" +
        this.globalCfgService.getAccessToken(),
      payload
    );
  }

  getUtilisationReport(
    companyId,
    fromDtm,
    toDtm,
    presentation,
    selectedMentorId
  ) {
    var payload = {
      companyId: companyId,
      fromDtm: fromDtm,
      toDtm: toDtm,
      presentation: presentation
    };

    if (selectedMentorId && selectedMentorId != "all") {
      payload["mentorUserId"] = selectedMentorId * 1;
    }
    return this.http.post(
      environment.apiurl +
        "/Dashboards/utilizationReport?access_token=" +
        this.globalCfgService.getAccessToken(),
      payload
    );
  }

  getUtilisation(companyId, fromDtm, toDtm, presentation, mentorId) {
    var payload = {
      companyId: companyId,
      fromDtm: fromDtm,
      toDtm: toDtm,
      presentation: presentation
    };

    if (mentorId && mentorId != "all") {
      payload["mentorUserId"] = mentorId * 1;
    }
    return this.http.post(
      environment.apiurl +
        "/Dashboards/utilization?access_token=" +
        this.globalCfgService.getAccessToken(),
      payload
    );
  }

  getReferralDetails(userId) {
    return this.http.post(
      environment.apiurl +
        "/Dashboards/referrals?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        userId: userId
      }
    );
  }
}
