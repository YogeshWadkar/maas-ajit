import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export class GlobalCfgService {
  public REFRESH_FREEQUENCY = 180; //in seconds
  private loggedInUserObj;
  private fullUserObj;
  private LOGIN_TOKEN_PREFIX = "ttlogintoken108";
  public settings = {};
  private roles = [];

  public userSource = new Subject<any>();
  userFetchedValue$ = this.userSource.asObservable();

  constructor() {}

  getLoggedInUser() {
    if (typeof Storage !== "undefined") {
      var val = localStorage.getItem(this.LOGIN_TOKEN_PREFIX);
      if (val) {
        this.loggedInUserObj = JSON.parse(
          localStorage.getItem(this.LOGIN_TOKEN_PREFIX)
        );
      }
    } else {
      console.log(
        "Web sorage is not supported on this browser. Login token could not be persisted. You will have to login every time."
      );
    }
    return this.loggedInUserObj;
  }

  setLoggedInUser(obj, keepMeSignedIn) {
    if (!obj) {
      this.loggedInUserObj = null;
      this.fullUserObj = null;
      if (typeof Storage !== "undefined") {
        localStorage.setItem(this.LOGIN_TOKEN_PREFIX, "");
      }
      return;
    }

    this.loggedInUserObj = {
      accessToken: obj.id,
      userId: obj.userId
    };

    if (keepMeSignedIn) {
      if (typeof Storage !== "undefined") {
        localStorage.setItem(
          this.LOGIN_TOKEN_PREFIX,
          JSON.stringify(this.loggedInUserObj)
        );
      } else {
        console.log(
          "Web sorage is not supported on this browser. Login token cannot be persisted. You will have to login every time."
        );
      }
    }
  }

  //Input parameter is a user object along with user detail
  setFullUserObj(user) {
    this.fullUserObj = user;
    this.userSource.next(user);
  }

  getFullUserObj() {
    return this.fullUserObj;
  }

  getAccessToken() {
    return this.loggedInUserObj.accessToken;
  }

  getUserId() {
    return this.loggedInUserObj.userId;
  }

  setSettings(settings) {
    this.settings = settings;
  }

  getSettingValue(key) {
    return this.settings[key];
  }

  setRoles(roles) {
    this.roles = roles;
  }

  getRoles() {
    return this.roles;
  }
}
