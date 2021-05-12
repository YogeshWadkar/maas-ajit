import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { GlobalCfgService } from "./globalcfg.service";
import { environment } from "../environments/environment";

@Injectable()
export class CareerProfileService {

  constructor(
    private http: HttpClient,
    private globalCfgService: GlobalCfgService
  ) { }

  add(rec) {
    return this.http.post(environment.apiurl + "/CareerProfiles/?access_token=" + this.globalCfgService.getAccessToken(), rec);
  }

  get(page?, statusId?) {
    var filter = {
      where: {
      },
      order: 'createdon DESC',
      include: ['status'],
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    };
    if (statusId) {
      filter.where['statusId'] = statusId;
    }
    return this.http.get(environment.apiurl + "/CareerProfiles/?access_token=" + this.globalCfgService.getAccessToken() + "&filter=" + JSON.stringify(filter));
  }

  delete(id) {
    return this.http.delete(environment.apiurl + "/CareerProfiles/" + id + "?access_token=" + this.globalCfgService.getAccessToken());
  }

  update(id, rec) {
    return this.http.patch(environment.apiurl + "/CareerProfiles/" + id + "?access_token=" + this.globalCfgService.getAccessToken(), rec);
  }

  getCareerProfileDetail(cProfileId) {
    var filter = JSON.stringify({
      include: ['assessments']
    });
    return this.http.get(environment.apiurl + "/CareerProfiles/" + cProfileId + "?access_token=" + this.globalCfgService.getAccessToken() + '&filter=' + filter);
  }

  getStatus() {
    return this.http.get(environment.apiurl + "/CareerProfileStatuses/?access_token=" + this.globalCfgService.getAccessToken());
  }

  updateStatus(cProfileId, statusId) {
    return this.http.patch(environment.apiurl + "/CareerProfiles/" + cProfileId + "?access_token=" + this.globalCfgService.getAccessToken(), {statusId: statusId});
  }

  unpublish(cProfileId, statusId) {
    return this.http.post(environment.apiurl + "/CareerProfiles/unpublish/?access_token=" + this.globalCfgService.getAccessToken(), {statusId: statusId,
      cProfileId: cProfileId});
  }

  addCareerProfile(cProfileId, userId) {
    return this.http.post(environment.apiurl + "/CareerProfiles/addCP/?access_token=" + this.globalCfgService.getAccessToken(), {userId: userId,
      cProfileId: cProfileId});
  }

  removeCareerProfile(cProfileId, userId) {
    return this.http.post(environment.apiurl + "/CareerProfiles/removeCP/?access_token=" + this.globalCfgService.getAccessToken(), {userId: userId,
      cProfileId: cProfileId});
  }

  getSeekerCareerProfiles(userId) {
    return this.http.post(environment.apiurl + "/CareerProfiles/getSeekerCP/?access_token=" + this.globalCfgService.getAccessToken(), {id: userId});
  }

  getAvailableCPs(statusId) {
    var rec = {};
    if (statusId) {
      rec = {
        statusId: statusId
      };
    }
    return this.http.post(
      environment.apiurl +
        "/CareerProfiles/availableCP/?access_token=" +
        this.globalCfgService.getAccessToken(),
      rec
    );
  }
}

