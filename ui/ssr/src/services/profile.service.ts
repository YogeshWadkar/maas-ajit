import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { environment } from "../environments/environment";

@Injectable()
export class ProfileService {
  constructor(
    private http: HttpClient
  ) {}

  getUserProfileDetail(userId) {
    return this.http.post(environment.apiurl + "/TTUsers/getPublicProfileDetail", {
        userId: userId
    });
  }
}
