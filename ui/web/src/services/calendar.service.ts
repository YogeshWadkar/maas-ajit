import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { GlobalCfgService } from "./globalcfg.service";
import { environment } from "../environments/environment";

@Injectable()
export class CalendarService {
  constructor(
    private http: HttpClient,
    private globalCfgService: GlobalCfgService
  ) {}

  getDaywiseAvaliableSlots() {
    return this.http.get(
      environment.apiurl +
        "/SelfAssessments/?access_token=" +
        this.globalCfgService.getAccessToken(),
      {}
    );
  }

  getLeaves(page?) {
    var filter = JSON.stringify({
      where: {
        userId: this.globalCfgService.getUserId()
      },
      limit: page && page.pageSize ? page.pageSize : 5,
      skip: page && page.pageSize ? page.pageSize * page.pageIndex : 0
    });
    return this.http.get(
      environment.apiurl +
        "/Leaves/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  addLeave(record) {
    return this.http.post(
      environment.apiurl +
        "/Leaves/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  updateLeave(record) {
    return this.http.put(
      environment.apiurl +
        "/Leaves/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  deleteLeave(id) {
    return this.http.delete(
      environment.apiurl +
        "/Leaves/" +
        id +
        "?access_token=" +
        this.globalCfgService.getAccessToken()
    );
  }

  getSpecialDaySlots(fromDt, toDt) {
    var filter = JSON.stringify({
      where: {
        date: {
          between: [fromDt, toDt]
        }
      },
      order: 'fromTm ASC'
    });
    return this.http.get(
      environment.apiurl +
        "/SpecialDaySlots/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  addSpecialDaySlot(record) {
    return this.http.post(
      environment.apiurl +
        "/SpecialDaySlots/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  deleteSpecialDaySlot(recId) {
    return this.http.delete(
      environment.apiurl +
        "/SpecialDaySlots/" +
        recId +
        "?access_token=" +
        this.globalCfgService.getAccessToken()
    );
  }

  deletAllowedSlot(recId) {
    return this.http.delete(
      environment.apiurl +
        "/SlotsAlloweds/" +
        recId +
        "?access_token=" +
        this.globalCfgService.getAccessToken()
    );
  }

  getBookedSlots(date) {
    var data = {
      date: date
    };
    return this.http.post(
      environment.apiurl +
        "/Meetings/booked?access_token=" +
        this.globalCfgService.getAccessToken(),
      data
    );
  }

  getUserAvailableSlots(userId, weekdayId) {
    var filter = JSON.stringify({
      where: {
        userId: userId,
        weekdayId: weekdayId
      },
      include: ["weekday"],
      order: 'fromTm ASC'
    });
    return this.http.get(
      environment.apiurl +
        "/SlotsAlloweds/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  getAllowedSlotsNotBooked(weekdayId, date) {
    return this.http.post(
      environment.apiurl +
        "/SlotsAlloweds/open?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        weekdayId: weekdayId,
        date: date
      }
    );
  }

  getAvailableSlots(userId, date, weekdayId) {
    return this.http.post(
      environment.apiurl +
        "/SlotsAlloweds/availableForBooking?access_token=" +
        this.globalCfgService.getAccessToken(),
      {
        userId: userId,
        date: date,
        weekdayId: weekdayId
      }
    );
  }

  addToAllowedSlots(record) {
    return this.http.post(
      environment.apiurl +
        "/SlotsAlloweds/?access_token=" +
        this.globalCfgService.getAccessToken(),
      record
    );
  }

  removeFromAllowedSlots(recId) {
    return this.http.delete(
      environment.apiurl +
        "/SlotsAlloweds/" +
        recId +
        "?access_token=" +
        this.globalCfgService.getAccessToken()
    );
  }

  getAllowedSlots(weekdayId) {
    var filter = {
      where: {
        userId: this.globalCfgService.getUserId()
      },
      include: ["weekday"],
      order: 'fromTm ASC'
    };

    if (weekdayId) {
      filter["where"]["weekdayId"] = weekdayId;
    }

    return this.http.get(
      environment.apiurl +
        "/SlotsAlloweds/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        JSON.stringify(filter)
    );
  }

  getWeekdays() {
    var filter = JSON.stringify({
      order: "seq ASC"
    });
    return this.http.get(
      environment.apiurl +
        "/Weekdays/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }

  getRefSlots(weekdayId) {
    var filter = JSON.stringify({
      where: {
        weekdayId: weekdayId
      },
      order: "fromTm ASC"
    });

    return this.http.get(
      environment.apiurl +
        "/Slots/?access_token=" +
        this.globalCfgService.getAccessToken() +
        "&filter=" +
        filter
    );
  }
}
