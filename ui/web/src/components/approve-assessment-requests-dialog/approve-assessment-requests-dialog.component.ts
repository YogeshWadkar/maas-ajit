import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CalendarService } from 'src/services/calendar.service';
import * as moment from "moment";
import { FormGroup, FormControl } from '@angular/forms';
import { GlobalCfgService } from 'src/services/globalcfg.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'tt-approve-assessment-requests-dialog',
  templateUrl: './approve-assessment-requests-dialog.component.html',
  styleUrls: ['./approve-assessment-requests-dialog.component.css']
})
export class ApproveAssessmentRequestsDialogComponent implements OnInit {
  // selectedDate = moment().hours(0).minutes(0).seconds(0).milliseconds(0).toDate();
  selectedDate: any;
  minDate: Date;
  availableSlots: any[] = [];
  selectedWeekdayId: any;
  selectedWeekday: string;
  weekdays: any[];

  title: string = 'Accept';

  subscriptions: any = [];

  private weekdaysSource = new Subject<any>();
  private weekdaysFetchedValue$ = this.weekdaysSource.asObservable();

  slotsFormGroup = new FormGroup({
    dateSelected: new FormControl(),
    selectedSlot: new FormControl()
  });

  constructor(
    public dialogRef: MatDialogRef<ApproveAssessmentRequestsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private calendarService: CalendarService,
    private globalCfgService: GlobalCfgService,
  ) {
    this.title = data ? data.title : this.title;
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate() - 0);
   }

  ngOnInit() {
    this.selectedWeekday = moment().format("dddd");
    this.getWeekdays();

    this.subscriptions.push(
      this.weekdaysFetchedValue$.subscribe(() => {
        this.loadSlots();
      })
    );
  }

  private loadSlots() {
    this.calendarService.getAvailableSlots(this.globalCfgService.getUserId(), this.selectedDate, this.selectedWeekdayId).subscribe(
      (response: any[]) => {
        if (moment(this.selectedDate).isSame(moment(), "day")) {
          var now = moment()
            .year(0)
            .month(0)
            .date(0);
          var finalSlots = [];
          var data = response["result"];

          data.forEach(item => {
            var then = moment(item["fromTm"])
              .year(0)
              .month(0)
              .date(0);
            if (then.diff(now) > 0) {
              finalSlots.push(item);
            }
          });

          this.availableSlots = finalSlots;
        } else {
          this.availableSlots = response["result"];
        }
      },
      error => {
        console.log("Service error:");
      }
    );
  }

  private getWeekdays() {
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
    this.selectedDate = event.value;
    this.handleDateChange({ value: event });
  }

  private handleDateChange(event) {
    this.selectedWeekday = moment(this.selectedDate).format("dddd");
    this.selectedWeekdayId = this.getWeekdayId(moment(this.selectedDate));
    this.loadSlots();
  }

  onSubmit(values) {
    console.log("Form Values:", values);
    this.dialogRef.close(values);
  }

  cancel() {
    this.dialogRef.close();
  }
}

// export interface DialogData {
//   title: string;
//   data: any;
// }
