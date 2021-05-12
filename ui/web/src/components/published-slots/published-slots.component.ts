import { Component, ViewEncapsulation } from "@angular/core";

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
  selector: "tt-available-slots",
  templateUrl: "./published-slots.component.html",
  styleUrls: ["./published-slots.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class PublishedSlotsComponent implements OnInit {
  /*columns1 = [
    {
      name: "fromTm",
      displayName: "From Time",
      type: "time",
      format: "hh:mm A"
    },
    { name: "toTm", displayName: "To Time", type: "time", format: "hh:mm A" },
   ]; */

  today = new Date();
  selectedDate = new Date();

  minDate: Date;
  maxDate: Date;
  public current;
  public datepipe;
  publishedSlotsAM: any[] = [];
  publishedSlotsPM: any[] = [];
  duration: any = 0;

  selectedWeekdayId: number;
  availableSlots: any[] = [];
  refAvailableSlots: any[];
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
  ) {
    this.minDate = new Date();
    this.maxDate = new Date();
    this.minDate.setDate(this.minDate.getDate() - 0);
    this.maxDate.setDate(this.maxDate.getDate() + 6);
  }

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

  public onSelect(event) {
    console.log(event);
    this.selectedDate = event;
    this.current = this.selectedDate;
    this.handleDateChange({ value: event });
  }

  ngOnInit() {
    this.current = new Date();
    this.datepipe = "EEE, MMM d y";

    this.subscriptions.push(
      this.weekdaysFetchedValue$.subscribe(newMomentDt => {
        // this.loadAvailableSlots(this.selectedWeekdayId);
        this.duration = this.globalCfgService.getSettingValue(
          "default_slot_duration"
        );
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
          this.duration = this.globalCfgService.getSettingValue(
            "default_slot_duration"
          );
          this.publishedSlots = res;
          this.filterSlots();
        },
        error => {
          console.log("Service error:", error);
        }
      );
  }

  // loadAvailableSlots(weekdayId) {
  //   this.meetingService
  //     .getDateWiseAvailableSlots(this.selectedDate, weekdayId)
  //     .subscribe(
  //       response => {
  //         this.refAvailableSlots = [];

  //         var res = response["result"];

  //         for (var key in res) {
  //           //there will be only one key as we are fetching data for a single weekday
  //           this.refAvailableSlots = res[key];
  //         }

  //         var tmp = this.refAvailableSlots;
  //         tmp.forEach(item => {
  //           item["actions"] = [{ name: "add", tip: "Add" }];
  //         });

  //         this.availableSlots = clonedeep(this.refAvailableSlots);
  //         this.filterSlots();
  //       },
  //       error => {
  //         console.log("Service error:", error);
  //       }
  //     );
  // }

  private handleDateChange(event) {
    this.selectedDate = event.value;
    console.log(event.value, this.selectedDate);

    var newDt = moment(event.value);
    this.selectedWeekdayId = this.getWeekdayId(newDt);
    this.weekdaysSource.next();
  }

  private isPM(rec) {
    var val = moment(rec.fromTm).format("hh:mm A");
    return val.split(" ")[1] === "PM";
  }
  private isAM(rec) {
    var val = moment(rec.fromTm).format("hh:mm A");
    return val.split(" ")[1] === "AM";
  }

  filterSlots() {
    this.publishedSlotsAM = this.publishedSlots.filter(this.isAM);
    this.publishedSlotsPM = this.publishedSlots.filter(this.isPM);
  }
}
