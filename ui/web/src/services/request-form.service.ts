import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { GlobalCfgService } from "./globalcfg.service";
import { environment } from "../environments/environment";

@Injectable()
export class RequestFormService {
  constructor(
    private http: HttpClient,
    private globalCfgService: GlobalCfgService
  ) {}

  add(rec) {
    return this.http.post(environment.apiurl + "/Forms/?access_token=" + this.globalCfgService.getAccessToken(), rec);
  }

  update(id, attributes) {
    return this.http.patch(environment.apiurl + "/Forms/" + id + "?access_token=" + this.globalCfgService.getAccessToken(), attributes);
  }

  get(companyId, page?) {
    var filter = JSON.stringify({
      where: {
        companyId: companyId,
      },
      order: 'createdon DESC',
      include: ['status'],
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    });
    return this.http.get(environment.apiurl + "/Forms/?access_token=" + this.globalCfgService.getAccessToken() + "&filter=" + filter);
  }

  getFormsByStatus(companyId, statusId) {
    var filter = JSON.stringify({
      order: 'name ASC',
      where: {
        companyId: companyId,
        statusId: statusId
      }
    });
    return this.http.get(environment.apiurl + "/Forms/?access_token=" + this.globalCfgService.getAccessToken() + "&filter=" + filter);
  }

  delete(id) {
    return this.http.delete(environment.apiurl + "/Forms/" + id + "?access_token=" + this.globalCfgService.getAccessToken());
  } 


  updateStatus(programId, statusId) {
    return this.http.patch(environment.apiurl + "/Forms/" + programId + "?access_token=" + this.globalCfgService.getAccessToken(), {statusId: statusId});
  }

  getStatuses() {
    return this.http.get(environment.apiurl + "/FormStatuses/?access_token=" + this.globalCfgService.getAccessToken());
  }
}
