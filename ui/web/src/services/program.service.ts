import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { GlobalCfgService } from "./globalcfg.service";
import { environment } from "../environments/environment";

@Injectable()
export class ProgramService {
  constructor(
    private http: HttpClient,
    private globalCfgService: GlobalCfgService
  ) {}

  add(rec) {
    return this.http.post(environment.apiurl + "/Programs/?access_token=" + this.globalCfgService.getAccessToken(), rec);
  }

  get(companyId, page?, statusId?) {
    var filter = {
      where: {
      },
      order: 'createdon DESC',
      include: ['status', 'company'],
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    };
    if (companyId) {
      filter.where['companyId'] = companyId;
    }
    if (statusId) {
      filter.where['statusId'] = statusId;
    }
    return this.http.get(environment.apiurl + "/Programs/?access_token=" + this.globalCfgService.getAccessToken() + "&filter=" + JSON.stringify(filter));
  }

  delete(id) {
    return this.http.delete(environment.apiurl + "/Programs/" + id + "?access_token=" + this.globalCfgService.getAccessToken());
  } 

  update(programId, rec) {
    return this.http.patch(environment.apiurl + "/Programs/" + programId + "?access_token=" + this.globalCfgService.getAccessToken(), rec);
  }

  updateStatus(programId, statusId) {
    return this.http.patch(environment.apiurl + "/Programs/" + programId + "?access_token=" + this.globalCfgService.getAccessToken(), {statusId: statusId});
  }

  getStatus() {
    return this.http.get(environment.apiurl + "/ProgramStatuses/?access_token=" + this.globalCfgService.getAccessToken());
  }

  getRequestStatuses() {
    var filter = JSON.stringify({
      order: 'createdon ASC'
    });
    return this.http.get(environment.apiurl + "/ProgramEnrolmentStatuses/?access_token=" + this.globalCfgService.getAccessToken() + "&filter=" + filter);
  }

  getRequests(companyId, statusId, page?, userId?) {
    var filter = {
      where: {
      },
      order: 'createdon DESC',
      include: ['user', 'approvedByUser', 'program', 'form', 'status'],
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    };

    if (companyId) {
      filter.where['companyId'] = companyId;
    }

    if (statusId != 'all') {
      filter.where['statusId'] = statusId;
    }

    if (userId) {
      filter.where['userId'] = userId;
    }

    return this.http.get(environment.apiurl + "/ProgramEnrolments/?access_token=" + this.globalCfgService.getAccessToken() + "&filter=" + JSON.stringify(filter));
  }

  updateRequest(requestId, rec) {
    return this.http.patch(environment.apiurl + "/ProgramEnrolments/" + requestId + "?access_token=" + this.globalCfgService.getAccessToken(), rec);
  }

  getProgramDetail(programId) {
    var filter = JSON.stringify({
      include: ['form']
    });
    return this.http.get(environment.apiurl + "/Programs/" + programId + "?access_token=" + this.globalCfgService.getAccessToken() + "&filter=" + filter);
  }

  createRequest(rec) {
    return this.http.post(environment.apiurl + "/ProgramEnrolments/?access_token=" + this.globalCfgService.getAccessToken(), rec);
  }
  
  getProgramMetrics(programId, page?) {
    return this.http.post(environment.apiurl + "/Programs/metrics?access_token=" + this.globalCfgService.getAccessToken(), {
      programId: programId
    });
  }

  issueCert(programId) {
    return this.http.post(environment.apiurl + "/Programs/issueCert?access_token=" + this.globalCfgService.getAccessToken(), {
      programId: programId
    });
  }

  downloadCert(programId) {
    return this.http.post(environment.apiurl + "/ProgramEnrolments/downloadCert?access_token=" + this.globalCfgService.getAccessToken(), {
      programId: programId
    });
  }

  allocateTokens(programId, numTokensToMentors, numTokensToParticipants) {
    return this.http.post(
      environment.apiurl +
        "/Programs/allocateToken?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        fromUserId: this.globalCfgService.getUserId(),
        programId: programId,
        numTokensToMentors: numTokensToMentors,
        numTokensToParticipants: numTokensToParticipants
      }
    );
  }
}
