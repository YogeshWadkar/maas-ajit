import { Component } from "@angular/core";

import { OnInit } from "@angular/core";

import * as moment from "moment";
import { Subject } from "rxjs";
import { CalendarService } from "../../services/calendar.service";
import clonedeep from "lodash.clonedeep";
import { MessageService } from "../../services/message.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { ConfirmationDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { MeetingService } from "../../services/meeting.service";

@Component({
  selector: "tt-special-day-slots",
  templateUrl: "./special-day-slots.component.html",
  styleUrls: ["./special-day-slots.component.css"]
})
export class SpecialDaySlotsComponent implements OnInit {
  columns = [
    {
      name: "date",
      displayName: "Date Selected",
      type: "date",
      format: "MM/DD/YYYY"
    },
    { name: "slot", displayName: "Slots Selected" },
    { name: "actions", displayName: "Actions" }
  ];
  columns1 = [
    {
      name: "fromTm",
      displayName: "From Time",
      type: "time",
      format: "hh:mm A"
    },
    { name: "toTm", displayName: "To Time", type: "time", format: "hh:mm A" },
    { name: "actions", displayName: "Actions" }
  ];

  columns2 = [
    { name: "fromTm", displayName: "From Time" },
    { name: "toTm", displayName: "To Time" },
    { name: "actions", displayName: "Actions" }
  ];

  columns3 = [
    {
      name: "fromTm",
      displayName: "From Time",
      type: "time",
      format: "hh:mm A"
    },
    { name: "toTm", displayName: "To Time", type: "time", format: "hh:mm A" }
  ];

  today = new Date();
  selectedDate;
  // selectedDate = new FormControl(new Date());
  selectedMeridian = "all";

  selectedWeekdayId: number;
  availableSlots: any[] = [];
  refAvailableSlots: any[];
  bookedSlots: any[] = [];
  specialDaySlots: any[] = [];
  weekdays: any[];

  private weekdaysSource = new Subject<any>();
  private weekdaysFetchedValue$ = this.weekdaysSource.asObservable();
  specialDaySlotCount: any;
  availableSlotCount: any;
  publishedSlots: any[] = [];
  subscriptions: any = [];

  constructor(
    private dialog: MatDialog,
    private calendarService: CalendarService,
    private msgService: MessageService,
    private globalCfgService: GlobalCfgService,
    private meetingService: MeetingService
  ) {}

  private getWeekdayId(momentDt) {
    var day = momentDt.format("dddd");
    var retId;
    this.weekdays.forEach(weekday => {
      if (weekday.name === day) {
        retId = weekday.id;
      }
    });

    return retId;
  }

  ngOnInit() {
    this.selectedDate = moment().hour(0).minute(0).second(0).millisecond(0).toDate();
    this.subscriptions.push(
      this.weekdaysFetchedValue$.subscribe(newMomentDt => {
        this.loadAvailableSlots(this.selectedWeekdayId);
        this.loadBookedSlots();
        this.loadSpecialDaySlots();
        this.loadPublishedSlots(this.selectedWeekdayId);
      })
    );

    this.getWeekdays();
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  getWeekdays() {
    this.calendarService.getWeekdays().subscribe(
      (response: any[]) => {
        this.weekdays = response["data"];
        var now = moment(this.selectedDate);
        this.selectedWeekdayId = this.getWeekdayId(now);

        this.weekdaysSource.next();
      },
      error => {
        console.log("Service error", error);
      }
    );
  }

  loadBookedSlots() {
    var now = this.selectedDate;
    this.calendarService.getBookedSlots(now).subscribe(
      (response: any[]) => {
        this.bookedSlots = response["result"];
      },
      error => {
        console.log("Service error", error);
      }
    );
  }

  loadPublishedSlots(weekdayId) {
    this.calendarService
      .getAllowedSlotsNotBooked(weekdayId, this.selectedDate)
      .subscribe(
        response => {
          this.publishedSlots = [];

          var res = response["result"];
          res.forEach(item => {
            item["actions"] = [{ name: "delete", tip: "Mark as Unavailable" }];
          });

          this.publishedSlots = res;
        },
        error => {
          console.log("Service error:", error);
        }
      );
  }

  loadAvailableSlots(weekdayId) {
    this.meetingService
      .getDateWiseAvailableSlots(this.selectedDate, weekdayId)
      .subscribe(
        response => {
          this.refAvailableSlots = [];

          var res = response["result"];

          for (var key in res) {
            //there will be only one key as we are fetching data for a single weekday
            this.refAvailableSlots = res[key];
          }

          var tmp = this.refAvailableSlots;
          tmp.forEach(item => {
            item["actions"] = [{ name: "add", tip: "Add" }];
          });

          this.availableSlots = clonedeep(this.refAvailableSlots);
          this.applyMeridianFilter();
        },
        error => {
          console.log("Service error:", error);
        }
      );
  }

  loadSpecialDaySlots() {
    var fromDt = moment(this.selectedDate)
      .seconds(0)
      .minutes(0)
      .hours(0);
    var toDt = moment(this.selectedDate)
      .seconds(59)
      .minutes(59)
      .hours(23);
    this.calendarService
      .getSpecialDaySlots(fromDt.toDate(), toDt.toDate())
      .subscribe(
        (response: any[]) => {
          this.specialDaySlots = response["data"];
          this.specialDaySlotCount = response["count"];

          var tmp = this.specialDaySlots;
          tmp.forEach(item => {
            item["slot"] =
              moment(item["fromTm"]).format("hh:mm A") +
              " - " +
              moment(item["toTm"]).format("hh:mm A");
            item["actions"] = [{ name: "delete", tip: "Move to unavailable" }];
          });
        },
        error => {
          console.log("Service error:", error);
        }
      );
  }

  onActionClicked(event) {
    var rec = event.record;
    switch (event.actionName.name) {
      case "add":
        var dt = moment(this.selectedDate);
        var formTm = moment(rec.fromTm, "hh:mm A");
        var fromTime = dt
          .hours(formTm.hours())
          .minutes(formTm.minutes())
          .seconds(0)
          .milliseconds(0)
          .toDate();
        var toTm = moment(rec.toTm, "hh:mm A");
        var toTime = dt
          .hours(toTm.hours())
          .minutes(toTm.minutes())
          .seconds(0)
          .milliseconds(0)
          .toDate();

        this.calendarService
          .addSpecialDaySlot({
            userId: this.globalCfgService.getUserId(),
            date: this.selectedDate,
            fromTm: fromTime,
            toTm: toTime,
            duration: rec.duration,
            slotId: rec.slotid
          })
          .subscribe(
            response => {
              console.log("slot added!");
              this.msgService.showSuccess("New slot has been added");
              this.loadSpecialDaySlots();
              this.loadAvailableSlots(this.selectedWeekdayId);
            },
            error => {
              console.log("Service error:", error);
            }
          );
        break;
      case "delete":
        const cnfmdialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: "450px",
          data: {
            title: "Delete Slot",
            message: "Are you sure you want to move the slot back to available?"
          }
        });
        cnfmdialogRef.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          if (result === "yes") {
            this.calendarService.deleteSpecialDaySlot(rec.id).subscribe(() => {
              this.msgService.showSuccess(
                "Slot has been moved back to available"
              );
              this.loadSpecialDaySlots();
              this.loadAvailableSlots(this.selectedWeekdayId);
            });
          }
        });

      default:
        console.log("Unhandled action: ", event.actionName.name);
    }
  }

  onPublishedActionClicked(event) {
    var rec = event.record;
    switch (event.actionName.name) {
      case "delete":
        const cnfmdialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: "450px",
          data: {
            title: "Remove Slot",
            message:
              "This slot will not be available for booking. Are you sure you want to unpublish it?"
          }
        });
        cnfmdialogRef.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          if (result === "yes") {
            this.calendarService.deletAllowedSlot(rec.id).subscribe(() => {
              this.msgService.showSuccess("Slot has been moved to unavailable");
              this.loadPublishedSlots(this.selectedWeekdayId);
              this.loadAvailableSlots(this.selectedWeekdayId);
            });
          }
        });

      default:
        console.log("Unhandled action: ", event.actionName.name);
    }
  }

  private handleDateChange(event) {
    this.selectedDate = event.value;
    this.selectedMeridian = "all";

    console.log(event.value, this.selectedMeridian, this.selectedDate);

    var newDt = moment(event.value);
    this.selectedWeekdayId = this.getWeekdayId(newDt);
    this.weekdaysSource.next();
  }

  private handleMeridianChange(event) {
    this.selectedMeridian = event.value;
  }

  private isAM(rec) {
    var val = rec.fromTm;
    return moment(val).format("A") === "AM";
  }

  private isPM(rec) {
    var val = rec.fromTm;
    return moment(val).format("A") === "PM";
  }

  private hasAM(rec) {
    var val = rec.fromTm;
    return val.indexOf("AM") > -1;
  }

  private hasPM(rec) {
    var val = rec.fromTm;
    return val.indexOf("PM") > -1;
  }

  filterAllSlots() {
    this.availableSlots = this.refAvailableSlots;
  }

  filterAMSlots() {
    this.availableSlots = this.refAvailableSlots;
    this.availableSlots = this.availableSlots.filter(this.hasAM);
  }

  filterPMSlots() {
    this.availableSlots = this.refAvailableSlots;
    this.availableSlots = this.availableSlots.filter(this.hasPM);
  }

  applyMeridianFilter() {
    if (this.selectedMeridian == 'am') {
      this.filterAMSlots();
    }
    if (this.selectedMeridian == 'pm') {
      this.filterPMSlots();
    }
    if (this.selectedMeridian == 'all') {
      this.filterAllSlots();
    }
  }
}
