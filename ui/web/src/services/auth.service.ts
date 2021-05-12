import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { GlobalCfgService } from "./globalcfg.service";
import { environment } from "../environments/environment";

@Injectable()
export class AuthService {
  constructor(
    private http: HttpClient,
    private globalCfgService: GlobalCfgService
  ) {}

  signup(userObj) {
    return this.http.post(environment.apiurl + "/TTUsers", userObj);
  }
  login(userObj) {
    return this.http.post(environment.apiurl + "/TTUsers/login", userObj);
  }

  resetPwdWithEmail(email) {
    return this.http.post(environment.apiurl + "/TTUsers/reset", {
      email: email
    });
  }

  resetPassword(newPassword, tmpToken) {
    return this.http.post(
      environment.apiurl + "/TTUsers/reset-password?access_token=" + tmpToken,
      { newPassword: newPassword }
    );
  }

  changePassword(obj) {
    return this.http.post(
      environment.apiurl +
        "/TTUsers/change-password?access_token=" +
        this.globalCfgService.getAccessToken(),
      obj
    );
  }

  logout() {
    return this.http.post(
      environment.apiurl +
        "/TTUsers/logout?access_token=" +
        this.globalCfgService.getAccessToken(),
      {}
    );
  }

  validateReferralCode(code) {
    return this.http.post(
      environment.apiurl + "/TTUsers/validateReferralCode",
      {
        code: code
      }
    );
  }

  signUpVisitedWithCode(code) {
    return this.http.post(environment.apiurl + "/TTUsers/signUpVisited", {
      code: code
    });
  }
}
