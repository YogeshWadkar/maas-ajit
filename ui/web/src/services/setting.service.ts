import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { GlobalCfgService } from "./globalcfg.service";
import { environment } from "../environments/environment";

@Injectable()
export class SettingService {
  constructor(
    private http: HttpClient,
    private globalCfgService: GlobalCfgService
  ) {}

  getSettings(page?) {
    let filter = JSON.stringify({
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    });
    return this.http.get(
      environment.apiurl +
        "/Settings/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter,
      {}
    );
  }

  updatedSetting(record) {
    var userId = this.globalCfgService.getUserId();
    return this.http.put(
      environment.apiurl +
        "/Settings/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  createSetting(record) {
    var userId = this.globalCfgService.getUserId();
    return this.http.post(
      environment.apiurl +
        "/Settings/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  deleteSetting(id) {
    var userId = this.globalCfgService.getUserId();
    return this.http.delete(
      environment.apiurl +
        "/Settings/" +
        id +
        "?access_token=" +
        this.globalCfgService.getAccessToken()
    );
  }

  generateSlots(rec) {
    return this.http.post(environment.apiurl +
      "/Slots/?access_token=" +
      this.globalCfgService.getAccessToken(),
    rec);
  }
}
