import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { GlobalCfgService } from "./globalcfg.service";
import { environment } from "../environments/environment";

@Injectable()
export class TaskService {
  constructor(
    private http: HttpClient,
    private globalCfgService: GlobalCfgService
  ) {}

  // getTasks(userId) {
  //     var filter = {
  //         include: ['status', 'category', 'assignedToUser', 'assignedByUser']
  //     };
  //     if (userId) {
  //         filter['where'] = {
  //             assignedToUserId: userId
  //         };
  //     }
  //     return this.http.get(environment.apiurl + '/Tasks/?access_token=' + this.globalCfgService.getAccessToken() + '&filter=' + JSON.stringify(filter));
  // }

  getCompletedTasks(userId, doneStatusId) {
    var filter = {
      include: ["status", "category", "assignedToUser", "assignedByUser"],
      where: {
        statusId: doneStatusId
      }
    };
    if (userId) {
      filter["where"] = Object.assign(filter["where"], {
        assignedToUserId: userId
      });
    }
    return this.http.get(
      environment.apiurl +
        "/Tasks/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        JSON.stringify(filter)
    );
  }

  getTasks(statusIds, assignedToId, assignedById, page?) {
    var filter = {
      include: ["status", "category", "assignedToUser", "assignedByUser"],
      where: {},
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    };
    if (statusIds.length > 0) {
      filter["where"]["statusId"] = {
        inq: statusIds
      };
    }
    if (assignedToId != "all") {
      filter["where"]["assignedToUserId"] = assignedToId;
    }
    if (assignedById != "all") {
      filter["where"]["assignedByUserId"] = assignedById;
    }

    return this.http.get(
      environment.apiurl +
        "/Tasks/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        JSON.stringify(filter)
    );
  }

  getPendingTasks(doneStatusId, userId) {
    var filter = {
      include: ["status", "category", "assignedToUser", "assignedByUser"],
      where: {
        statusId: {
          neq: doneStatusId
        }
      }
    };
    if (userId) {
      filter["where"] = Object.assign(filter["where"], {
        assignedToUserId: userId
      });
    }
    return this.http.get(
      environment.apiurl +
        "/Tasks/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        JSON.stringify(filter)
    );
  }

  getOthersTasks(userId, statusId) {
    var filter = JSON.stringify({
      where: {
        userId: userId,
        statusId: statusId
      },
      include: ["status", "category", "assignedToUser"]
    });
    return this.http.get(
      environment.apiurl +
        "/Tasks/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  createTask(record) {
    return this.http.post(
      environment.apiurl +
        "/Tasks/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  deleteTask(taskId) {
    return this.http.delete(
      environment.apiurl +
        "/Tasks/" +
        taskId +
        "?access_token=" +
        this.globalCfgService.getAccessToken()
    );
  }

  updateTask(record) {
    return this.http.put(
      environment.apiurl +
        "/Tasks/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  updateTaskStatus(id, statusId) {
    return this.http.patch(
      environment.apiurl +
        "/Tasks/" +
        id +
        "?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        statusId: statusId
      }
    );
  }

  getAllCategories() {
    return this.http.get(
      environment.apiurl +
        "/TaskCategories/?access_token=" +
        this.globalCfgService.getAccessToken()
    );
  }

  getAllStatuses() {
    return this.http.get(
      environment.apiurl +
        "/TaskStatuses/?access_token=" +
        this.globalCfgService.getAccessToken()
    );
  }

  updateTaskFile(id, val) {
    return this.http.patch(
      environment.apiurl +
        "/Tasks/" +
        id +
        "?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        taskDoc: val
      }
    );
  }

  updateCompletionTaskFile(id, val) {
    return this.http.patch(
      environment.apiurl +
        "/Tasks/" +
        id +
        "?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        taskCompletionDoc: val
      }
    );
  }
}
