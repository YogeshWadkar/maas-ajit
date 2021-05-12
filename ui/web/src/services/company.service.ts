import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { GlobalCfgService } from "./globalcfg.service";
import { environment } from "../environments/environment";

@Injectable()
export class CompanyService {
  constructor(
    private http: HttpClient,
    private globalCfgService: GlobalCfgService
  ) {}

  getCompanies(page?) {
    let filter = JSON.stringify({
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    });
    return this.http.get(
      environment.apiurl +
        "/Companies/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter,
      {}
    );
  }

  createCompany(record) {
    return this.http.post(
      environment.apiurl +
        "/Companies/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  updateCompany(record) {
    return this.http.put(
      environment.apiurl +
        "/Companies/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  deleteCompany(id) {
    return this.http.delete(
      environment.apiurl +
        "/Companies/" +
        id +
        "?access_token=" +
        this.globalCfgService.getAccessToken()
    );
  }
}
