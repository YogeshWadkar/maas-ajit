import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { GlobalCfgService } from "./globalcfg.service";
import { environment } from "../environments/environment";

@Injectable()
export class SkillService {
  constructor(
    private http: HttpClient,
    private globalCfgService: GlobalCfgService
  ) {}

  getSkillCategories(page?) {
    let filter = JSON.stringify({
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    });
    return this.http.get(
      environment.apiurl +
        "/SkillCategories/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter,
      {}
    );
  }

  createSkillCategory(record) {
    return this.http.post(
      environment.apiurl +
        "/SkillCategories/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  updateSkillCategory(record) {
    return this.http.put(
      environment.apiurl +
        "/SkillCategories/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  deleteSkillCategory(id) {
    return this.http.delete(
      environment.apiurl +
        "/SkillCategories/" +
        id +
        "?access_token=" +
        this.globalCfgService.getAccessToken()
    );
  }

  getAllUnusedSkills() {
    let filter = JSON.stringify({
      where: {},
      include: ["category"]
    });
    return this.http.get(
      environment.apiurl +
        "/Skills/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter,
      {}
    );
  }

  getPageWiseSkills(page?) {
    let filter = JSON.stringify({
      include: ["category"],
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    });
    return this.http.get(
      environment.apiurl +
        "/Skills/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter,
      {}
    );
  }

  getSkills(categoryId, all) {
    let filter = JSON.stringify({
      where: {
        categoryId: categoryId,
        all: all
      },
      include: ["category"]
    });
    return this.http.get(
      environment.apiurl +
        "/Skills/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter,
      {}
    );
  }

  createSkill(record) {
    return this.http.post(
      environment.apiurl +
        "/Skills/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  updateSkill(record) {
    return this.http.put(
      environment.apiurl +
        "/Skills/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  deleteSkill(id) {
    return this.http.delete(
      environment.apiurl +
        "/Skills/" +
        id +
        "?access_token=" +
        this.globalCfgService.getAccessToken()
    );
  }
}
