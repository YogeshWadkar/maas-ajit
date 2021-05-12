import { Component, IterableDiffers, DoCheck } from "@angular/core";

import { OnInit } from "@angular/core";
import { MeetingService } from "../../services/meeting.service";

import * as moment from "moment";

import clonedeep from "lodash.clonedeep";
import { CalendarService } from "../../services/calendar.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { MessageService } from "../../services/message.service";

@Component({
  selector: "tt-available-slots",
  templateUrl: "./available-slots.component.html",
  styleUrls: ["./available-slots.component.css"]
})
export class AvailableSlotsComponent implements OnInit {
  selectedMeridian = "all";

  displayedColumns1 = [
    { name: "fromTm", displayName: "From Time" },
    { name: "toTm", displayName: "To Time" },
    { name: "weekday", displayName: "Weekday" },
    { name: "actions", displayName: "Actions" }
  ];
  displayedColumns2 = [
    { name: "weekday", dataField: "weekday.name", displayName: "Weekday" },
    {
      name: "fromTm",
      displayName: "From Time",
      type: "time",
      format: "hh:mm A"
    },
    { name: "toTm", displayName: "To Time", type: "time", format: "hh:mm A" },
    { name: "actions", displayName: "Actions" }
  ];

  weekdays: any[];
  refAvailableSlots: any;
  availableSlots: any = [];
  allowedSlots: any = [];

  constructor(
    private meetingService: MeetingService,
    private calendarService: CalendarService,
    private globalCfgService: GlobalCfgService,
    private msgService: MessageService
  ) {}

  getWeekdays() {
    this.calendarService.getWeekdays().subscribe(
      (response: any[]) => {
        this.weekdays = response["data"];
        this.generateSlots();
        this.loadAllowedSlots(null);
      },
      error => {
        console.log("Service error", error);
      }
    );
  }

  ngOnInit() {
    this.getWeekdays();
  }

  private loadAllowedSlots(weekdayId) {
    this.calendarService.getAllowedSlots(weekdayId).subscribe(
      response => {
        console.log("Got data:", response);
        let map: any = response;

        for (var key in map) {
          let arr: any[];
          map[key].forEach(element => {
            element["actions"] = [
              { name: "delete", tip: "Remove from allowed" }
            ];
          });
        }
        this.allowedSlots = map;
      },
      error => {
        console.log("Service error:", error);
      }
    );
  }

  private generateSlots() {
    this.meetingService.getWeekdayWiseAvailableSlots(null).subscribe(
      (response: any[]) => {
        this.refAvailableSlots = response["result"];

        for (var key in this.refAvailableSlots) {
          this.refAvailableSlots[key].forEach(element => {
            element["actions"] = [{ name: "add", tip: "Add to allowed" }];
          });
        }

        this.availableSlots = clonedeep(this.refAvailableSlots);
        console.log("this.availableSlots: ", this.availableSlots);
      },
      error => {
        console.log("Service failed:", error);
      }
    );
  }

  onActionClicked(event, weekday, idx) {
    console.log("onActionClicked:", arguments);
    if (event.actionName.name === "add") {
      var rec = event.record;
      var formTm = moment(rec.fromTm, "hh:mm A").toDate();
      var toTm = moment(rec.toTm, "hh:mm A").toDate();

      this.calendarService
        .addToAllowedSlots({
          fromTm: formTm,
          toTm: toTm,
          weekdayId: weekday.id,
          duration: event.record.duration,
          userId: this.globalCfgService.getUserId()
        })
        .subscribe(
          response => {
            console.log("Record added", response);
            this.msgService.showSuccess("Slot has been added");
            this.refAvailableSlots[weekday.name].splice(event.rowIndex, 1);
            this.availableSlots[weekday.name] = clonedeep(
              this.refAvailableSlots[weekday.name]
            );
            this.loadAllowedSlots(weekday.id);
          },
          error => {
            console.log("Service error:", error);
          }
        );
    }

    if (event.actionName.name === "delete") {
      this.calendarService
        .removeFromAllowedSlots(event.record.id)
        .subscribe(() => {
          this.msgService.showSuccess("Slot is no more available for booking");
          this.generateSlots();
          this.loadAllowedSlots(weekday.id);
        });
    }
  }

  private isAM(rec) {
    var val = rec.fromTm;
    return val.split(" ")[1] === "AM";
  }

  private isPM(rec) {
    var val = rec.fromTm;
    return val.split(" ")[1] === "PM";
  }

  filterAllSlots(weekday) {
    this.availableSlots[weekday.name] = this.refAvailableSlots[weekday.name];
  }

  filterAMSlots(weekday) {
    this.availableSlots[weekday.name] = this.refAvailableSlots[weekday.name];
    this.availableSlots[weekday.name] = this.availableSlots[
      weekday.name
    ].filter(this.isAM);
  }

  filterPMSlots(weekday) {
    this.availableSlots[weekday.name] = this.refAvailableSlots[weekday.name];
    this.availableSlots[weekday.name] = this.availableSlots[
      weekday.name
    ].filter(this.isPM);
  }
}
