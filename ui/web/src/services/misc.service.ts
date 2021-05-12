import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { GlobalCfgService } from "./globalcfg.service";
import { environment } from "../environments/environment";

@Injectable()
export class MiscService {
  constructor(
    private http: HttpClient,
    private globalCfgService: GlobalCfgService
  ) {}

  getCountries() {
    return this.http.get(
      environment.apiurl +
        "/Countries/?access_token=" +
        this.globalCfgService.getAccessToken(),
      {}
    );
  }

  getStates(countryId) {
    var filter = JSON.stringify({
      where: {
        countryId: countryId
      }
    });
    return this.http.get(
      environment.apiurl +
        "/States/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  getCities(stateId) {
    var filter = JSON.stringify({
      where: {
        stateId: stateId
      }
    });
    return this.http.get(
      environment.apiurl +
        "/Cities/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  allocateTokens(meetingId, allocation) {
    return this.http.post(
      environment.apiurl +
        "/Meetings/allocateToken?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        fromUserId: this.globalCfgService.getUserId(),
        meetingId: meetingId,
        allocations: allocation
      }
    );
  }

  allocateTaskTokens(taskId, allocation) {
    return this.http.post(
      environment.apiurl +
        "/Tasks/allocateToken?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        fromUserId: this.globalCfgService.getUserId(),
        taskId: taskId,
        allocations: allocation
      }
    );
  }

  getActivityNotifications(userId, limit = 5) {
    var filter = JSON.stringify({
      where: {
        toUserId: userId,
        type: "activityupdate",
        isRead: false
      },
      order: "createdon DESC",
      limit: limit,
      include: ["fromUser"]
    });

    return this.http.get(
      environment.apiurl +
        "/Notifications/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  getMeetingNotifications(userId, limit = 5) {
    var filter = JSON.stringify({
      where: {
        toUserId: userId,
        type: "meetingnotification",
        isRead: false
      },
      order: "createdon DESC",
      limit: limit,
      include: ["fromUser"]
    });

    return this.http.get(
      environment.apiurl +
        "/Notifications/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  markNotificationAsRead(type) {
    return this.http.post(
      environment.apiurl +
        "/Notifications/markAsRead?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        type: type
      }
    );
  }

  getFreeBusyDetail(userId) {
    var filter = JSON.stringify({
      where: {
        userId: userId
      }
    });

    return this.http.get(
      environment.apiurl +
        "/FreeBusies/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  saveFreeBusyDetail(rec) {
    return this.http.post(
      environment.apiurl +
        "/FreeBusies?access_token=" +
        this.globalCfgService.getAccessToken(),rec
    ); 
  }

  updateFreeBusyDetail(rec) {
    return this.http.put(
      environment.apiurl +
        "/FreeBusies?access_token=" +
        this.globalCfgService.getAccessToken(),rec
    ); 
  }
}
