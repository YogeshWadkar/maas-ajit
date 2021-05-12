import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { environment } from "../environments/environment";

@Injectable()
export class ProgramService {
  constructor(
    private http: HttpClient
  ) {}

  getProgramDetail(programId) {
    return this.http.post(environment.apiurl + "/Programs/getPublicProgramDetail", {
      programId: programId
    });
  }
}
