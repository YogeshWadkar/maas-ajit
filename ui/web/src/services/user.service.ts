import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { GlobalCfgService } from "./globalcfg.service";
import { environment } from "../environments/environment";
import { combineAll } from "rxjs/operators";

@Injectable()
export class UserService {
  constructor(
    private http: HttpClient,
    private globalCfgService: GlobalCfgService
  ) {}

  getUserDetail(userId) {
    var filter = JSON.stringify({
      where: {
        id: userId
      },
      include: ["company", "role", "userDetail"]
    });

    return this.http.get(
      environment.apiurl +
        "/TTUsers/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  getDetail(userId) {
    var filter = JSON.stringify({
      where: {
        id: userId
      },
      include: ["country", "state", "city"]
    });

    return this.http.get(
      environment.apiurl +
        "/TTUserDetails/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  getUsersByRole(roleId, isActive = true, companyId = null,page?) {
    var filter = {
      where: {
        roleId: roleId,
        isActive: isActive
      },
      include: ["userDetail", "skills", "company"],
      limit: page && page.pageSize ? page.pageSize : 20,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    };
    if (companyId) {
      filter.where["companyId"] = companyId;
    }
    return this.http.get(
      environment.apiurl +
        "/TTUsers/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        JSON.stringify(filter)
    );
  }
  updateProfile(record) {
    return this.http.put(
      environment.apiurl +
        "/TTUserDetails/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  updateUserStatus(userId, isActive) {
    return this.http.patch(
      environment.apiurl +
        "/TTUsers/" +
        userId +
        "?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        isActive: isActive
      }
    );
  }

  getRoles() {
    return this.http.get(
      environment.apiurl +
        "/TTRoles/?access_token=" +
        this.globalCfgService.getAccessToken()
    );
  }

  rate(record) {
    return this.http.post(
      environment.apiurl +
        "/Ratings/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  getEducationDetail(userId) {
    var filter = JSON.stringify({
      where: {
        userId: userId
      }
    });
    return this.http.get(
      environment.apiurl +
        "/Education/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  addEducationDetail(record) {
    return this.http.post(
      environment.apiurl +
        "/Education/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  getCertifications(userId) {
    var filter = JSON.stringify({
      where: {
        userId: userId
      }
    });
    return this.http.get(
      environment.apiurl +
        "/Certifications/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  addCertification(record) {
    return this.http.post(
      environment.apiurl +
        "/Certifications/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  getWorkExpDetail(userId) {
    var filter = JSON.stringify({
      where: {
        userId: userId
      }
    });
    return this.http.get(
      environment.apiurl +
        "/WorkExperiences/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  addWorkExp(record) {
    return this.http.post(
      environment.apiurl +
        "/WorkExperiences/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  getUsersByName(roleId, searchTxt, isActive = true, companyId = null) {
    var filter = {
      where: {
        roleId: roleId,
        isActive: isActive,
        firstName: {
          ilike: encodeURI("%") + searchTxt + encodeURI("%")
        }
      },
      include: ["userDetail", "skills", "company"]
    };

    if (companyId) {
      filter.where["companyId"] = companyId;
    }

    return this.http.get(
      environment.apiurl +
        "/TTUsers/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        JSON.stringify(filter)
    );
  }

  getUsersBySkills(roleId, skillsSearchTxt, isActive = true, companyId = null) {
    var filter = {
      where: {
        roleId: roleId,
        isActive: isActive
      },
      include: ["userDetail", "skills", "company"]
    };

    if (companyId) {
      filter.where["companyId"] = companyId;
    }

    return this.http.post(
      environment.apiurl +
        "/TTUsers/bySkills?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        filter: filter,
        skills: skillsSearchTxt
      }
    );
  }

  getUsersByLocation(
    roleId,
    locationSearchTxt,
    isActive = true,
    companyId = null
  ) {
    var filter = {
      where: {
        roleId: roleId,
        isActive: isActive
      },
      include: ["userDetail", "skills", "company"]
    };

    if (companyId) {
      filter.where["companyId"] = companyId;
    }

    return this.http.post(
      environment.apiurl +
        "/TTUsers/byLocation?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        filter: filter,
        location: locationSearchTxt
      }
    );
  }

  importMentors(attachment, fieldsMap, companyId = null) {
    return this.http.post(
      environment.apiurl +
        "/TTUsers/import?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        attachment: attachment,
        fieldsMap: fieldsMap,
        companyId: companyId
      }
    );
  }

  updateUserPhoto(id, val) {
    return this.http.patch(
      environment.apiurl +
        "/TTUserDetails/" +
        id +
        "?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        photoUrl: val,
        avatarUrl: val
      }
    );
  }

  getLocation(url) {
    return this.http.get(url);
  }

  getCompanyMentors(companyId) {
    var filter = JSON.stringify({
      where: {
        companyId: companyId,
        signupAs: "mentor"
      },
      include: ["role", "userDetail", "company"]
    });

    return this.http.get(
      environment.apiurl +
        "/TTUsers/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  changePwd(rec) {
    return this.http.post(
      environment.apiurl +
        "/TTUsers/change-password?access_token=" +
        this.globalCfgService.getAccessToken(),
      rec
    );
  }

  invite(emails) {
    return this.http.post(
      environment.apiurl +
        "/TTUsers/invite?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        emails: emails
      }
    );
  }

  getSponsors(page?) {
    var filter = JSON.stringify({
      where: {
        signupAs: "sponsor"
      },
      order: 'createdon DESC',
      include: ["userDetail", "company"],
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    });
    return this.http.get(environment.apiurl +
      "/TTUsers?access_token=" +
      this.globalCfgService.getAccessToken() +
      "&filter=" +
      filter);
  }

  addSponsor(rec) {
    return this.http.post(environment.apiurl +
      "/TTUsers/addSponsor?access_token=" +
      this.globalCfgService.getAccessToken(), {user: rec});
  }

  updateSponsorStatus(userId, status:boolean) {
    return this.http.patch(environment.apiurl +
      "/TTUsers/" + userId + "?access_token=" +
      this.globalCfgService.getAccessToken(), {
        isActive: status
      });
  }
}
