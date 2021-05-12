import { Component, AfterContentInit } from "@angular/core";

import { OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";
import { UserService } from "../../services/user.service";
import { CalendarService } from "../../services/calendar.service";
import { GlobalCfgService } from "../../services/globalcfg.service";

import * as moment from "moment";
import { MeetingService } from "../../services/meeting.service";
import { FieldGeneratorService } from "../../services/field-generator.service";
import { MatDialog } from "@angular/material";
import { FormDialogComponent } from "../form-dialog/form-dialog.component";
import { MessageService } from "../../services/message.service";

import { ViewOnlyProfileComponent } from "../viewonly-profile/viewonly-profile.component";
import { ImportMentorComponent } from "../import-mentor-dialog/import-mentor-dialog.component";
import { EventBusService } from "../../services/event-bus.service";
import { StartupService } from "../../services/startup.service";

import {Location} from '@angular/common';

@Component({
  selector: "tt-book-schedule",
  templateUrl: "./book-schedule.component.html",
  styleUrls: ["./book-schedule.component.css"]
})
export class BookScheduleComponent implements OnInit, AfterContentInit {
  columns: any[] = [
    {
      name: "fromTm",
      displayName: "From Time",
      type: "time",
      format: "hh:mm A"
    },
    { name: "toTm", displayName: "To Time", type: "time", format: "hh:mm A" },
    {
      name: "book",
      displayName: "Actions",
      actionableName: "Book",
      actionable: true,
      tip: "Book this slot"
    }
  ];

  today = moment().hours(0).minutes(0).seconds(0).milliseconds(0).toDate();
  selectedDate = moment().hours(0).minutes(0).seconds(0).milliseconds(0).toDate();
  minDate: Date;
  maxDate: Date;
  weekdays: any[];
  duration: any = 0;

  private weekdaysSource = new Subject<any>();
  private weekdaysFetchedValue$ = this.weekdaysSource.asObservable();

  private mentorSource = new Subject<any>();
  private mentorFetchedValue$ = this.mentorSource.asObservable();


  private availableSlots: any[] = [];
  availableSlotsAM: any[] = [];
  availableSlotsPM: any[] = [];
  private count = 0;
  private selectedWeekday: string;
  private mentorUser: object;

  private userSource = new Subject<any>();
  private userFetchedValue$ = this.userSource.asObservable();

  private backLink = "/career-seeker/search-mentor";
  selectedWeekdayId: any;
  subscriptions: any = [];

  // search guru variables
  STRLEN: number = 80;
  selectedId: any;
  private title = "Search Mentor";
  searchBy = "byName";
  searchTxt = "";
  active = "active";

  private skills: string;

  private mentorRoleId: number;
  private mentors: any[] = [];
  role: any;
  companyId: any;
  public current;
  public datepipe;
  selectedMentor: any;
  freeBusy: any;

  constructor(
    private dialog: MatDialog,
    private fgService: FieldGeneratorService,
    private calendarService: CalendarService,
    private route: ActivatedRoute,
    private userService: UserService,
    private globalCfgService: GlobalCfgService,
    private meetingService: MeetingService,
    private msgService: MessageService,
    private ebService: EventBusService,
    private startupService: StartupService,
    private _location: Location
  ) {
    this.freeBusy = window['freebusy'];

    this.minDate = new Date();
    this.maxDate = new Date();
    this.minDate.setDate(this.minDate.getDate() - 0);
    //this.maxDate.setDate(this.maxDate.getDate() + 30);

    this.subscriptions.push(
      this.mentorFetchedValue$.subscribe(m => {
        if (this.selectedMentor.hasFreeBusyAccount) {
          document.getElementById('freebusy-pickatime-button').hidden = false;
          this.freeBusy.pickatime.init({
            buttonType: "native"
          });
        }
      })
    );

    this.subscriptions.push(
      this.globalCfgService.userFetchedValue$.subscribe(() => {
        console.log(
          "-----> COMPANY: ",
          this.globalCfgService.getFullUserObj().companyId
        );
        this.companyId = this.globalCfgService.getFullUserObj().companyId;
        this.duration = this.globalCfgService.getSettingValue('default_slot_duration');

        this.subscriptions.push(
          this.ebService.roleNameFetchedValue$.subscribe(roleName => {
            if (this.mentorRoleId) {
              this.loadMentors(this.mentorRoleId, true);
            }
          })
        );

        this.subscriptions.push(
          this.ebService.roleFetchedValue$.subscribe(roles => {
            roles.forEach(role => {
              if (role.name == "mentor") {
                this.mentorRoleId = role.id;
                this.ebService.roleNameSource.next(role.name);
              }
            });
          })
        );

        this.startupService.loadRoles();
      })
    );
  }

  public onSelect(event) {
    console.log(event);
    this.selectedDate = moment(event).hours(0).minutes(0).seconds(0).milliseconds(0).toDate();
    this.current = this.selectedDate;
    this.handleDateChange({ value: event });
  }

  ngOnInit() {
    this.current = new Date();
    this.datepipe = "EEE, MMM d y";
    this.selectedId = this.route.snapshot.params.id;

    //  new
    this.route.url.subscribe(url => {
      console.log("URL: ", url, url.length, url.values().next().value.path);
      //always the first part is role
      this.role = url.values().next().value.path;
      this.ebService.roleNameSource.next(this.role);
    });

    this.selectedWeekday = moment().format("dddd");
    this.subscriptions.push(
      this.userFetchedValue$.subscribe(user => {
        this.mentorUser = user;

        this.getWeekdays();
      })
    );

    this.subscriptions.push(
      this.weekdaysFetchedValue$.subscribe(() =>
        this.loadSlots(this.mentorUser["id"])
      )
    );

    this.subscriptions.push(
      this.route.url.subscribe(url => {
        console.log("URL: ", this.route, this.route.params);

        //always the first part is role
        var userId = this.route.params.subscribe(val => {
          console.log("URL: ", val);
          this.getUser(val.id);
        });
      })
    );

    this.freeBusy = window['freebusy'];

  }

  ngAfterContentInit() {
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // new functionality
  private loadMentors(roleId, isActive = true) {
    this.userService.getUsersByRole(roleId, isActive, this.companyId).subscribe(
      (response: any[]) => {
        this.mentors = response['data'];

        this.mentors.forEach(m => {
          if (m.id == this.selectedId) {
            this.selectedMentor = m;

            this.mentorSource.next(m);
          }
        });
      },
      error => {
        console.log("Service error:", error);
      }
    );
  }

  loadMentorsByStatus(status) {
    var isActive = status == "active" ? true : false;
    this.loadMentors(this.mentorRoleId, isActive);
  }

  private getSkillsList(skillsList, all) {
    var ret = [];

    if (skillsList && skillsList.length == 0) {
      return 'Not Available';
    }

    skillsList.forEach(element => {
      ret.push(element.name);
    });

    var str = ret.toString().replace(/,/g, ", ");
    if (!all) {
      if (str.length > this.STRLEN) {
        str = str.substring(0, this.STRLEN) + "...";
      }
    }
    return str;
  }

  private viewProfile(userId) {
    const dialogRef = this.dialog.open(ViewOnlyProfileComponent, {
      width: "2400px",
      data: { userId: userId }
    });
  }

  private getSearchByTxt() {
    var txt = "";
    switch (this.searchBy) {
      case "byName":
        txt = "Name";
        break;
      case "byLocation":
        txt = "Location";
        break;
      case "bySkills":
        txt = "Comma Separated Skills";
        break;
      default:
        txt = "Name";
    }
    return txt;
  }

  private clearFilter() {
    console.log("clearFilter: ", this.searchBy, this.searchTxt);
    this.searchBy = "byName";
    this.searchTxt = "";

    this.loadMentors(this.mentorRoleId, true);
  }

  private importMentors() {
    const dialogRef = this.dialog.open(ImportMentorComponent, {
      width: "540px",
      // height: '480px',
      data: { companyId: this.companyId }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed", result);
      if (result.action === "yes") {
        this.loadMentors(this.mentorRoleId);
      }
    });
  }

  //  private getTime( ) {
  //   var date = new Date();
  //       var hours: any = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
  //       var am_pm: any = date.getHours() >= 12 ? "PM" : "AM";
  //       hours = hours < 10 ? "0" + hours : hours;
  //       var minutes: any = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  //       var time = hours + ":" + minutes + " " + am_pm;
  //   console.log("manual time format:",time);

  // }
  //  result=this.getTime();

  inactivateUser(userId) {
    var isActive = this.active == "active" ? true : false;
    this.userService.updateUserStatus(userId, false).subscribe(
      () => {
        this.msgService.showSuccess("User has been marked as In-active.");
        this.loadMentors(this.mentorRoleId, isActive);
      },
      error => { }
    );
  }

  activateUser(userId) {
    var isActive = this.active == "active" ? true : false;
    this.userService.updateUserStatus(userId, true).subscribe(
      () => {
        this.msgService.showSuccess("User has been marked as Active.");
        this.loadMentors(this.mentorRoleId, isActive);
      },
      error => { }
    );
  }

  // end the new functionality

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

  private loadSlots(userId) {
    this.calendarService.getAvailableSlots(userId, this.selectedDate, this.selectedWeekdayId).subscribe(
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
          this.filterSlots();

          // var currentTime = moment(new Date()).format('HH:mm a');
          // var minutesOfDay = function(currentTime){
          //   return currentTime.minutes() + currentTime.hours() * 60;
          // }    // e.g. 11:00 pm

          this.count = finalSlots.length;
        } else {
          this.availableSlots = response["result"];
          this.filterSlots();
          this.count = this.availableSlots.length;
        }
      },
      error => {
        console.log("Service error:");
      }
    );
  }

  private getUser(userId) {
    this.userService.getUserDetail(userId).subscribe(
      response => {
        this.userSource.next(response['data'][0]);
      },
      error => {
        console.log("Service error:");
      }
    );
  }

  private onActionableClicked(data) {
    console.log("onActionableClicked:", data.record);
    console.log("index:", data.rowIndex);
    //
    var action = "book";
    var rec = data;

    if (action == "book") {
      var rec = data;
      var fields = this.fgService.getFields(
        [
          { name: "topic", displayName: "Topic", required: true },
          { name: "agenda", displayName: "Agenda", type: "longstring", required: true }
        ],
        { topic: "", agenda: "" }
      );

      var mmt = moment(this.selectedDate);

      const dialogRef = this.dialog.open(FormDialogComponent, {
        width: "450px",
        data: {
          title: "Meeting Agenda",
          fields: fields,
          note: "Book meeting on " + mmt.format("ddd, MMM DD YYYY") + " at " + moment(rec.fromTm).format("h:mm A")
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log("The dialog was closed", result);
        this.meetingService
          .bookMeeting({
            date: moment(this.selectedDate)
              .seconds(0)
              .minutes(0)
              .hours(0),
            fromTm: rec.fromTm,
            toTm: rec.toTm,
            topic: result.topic,
            agenda: result.agenda,
            duration: rec.duration,
            mentorUserId: this.mentorUser["id"],
            seekerUserId: this.globalCfgService.getUserId()
          })
          .subscribe(
            (response: any[]) => {
              this.msgService.showSuccess("Meeting request has been sent");

              this.loadSlots(this.mentorUser["id"]);

              //this.availableSlots.splice(event.rowIndex, 1);

              //this.availableSlots.splice(event.id, 1);
            },
            error => {
              console.log("Service error:");
            }
          );
      });
    } else {
      console.log("Unhandled action:", action);
    }
  }

  private handleDateChange(event) {
    // console.log(event.value);

    this.selectedWeekday = moment(this.selectedDate).format("dddd");
    this.selectedWeekdayId = this.getWeekdayId(moment(this.selectedDate));

    this.loadSlots(this.mentorUser["id"]);
  }

  // time filter
  private isPM(rec) {
    var val = moment(rec.fromTm).format("hh:mm A");
    return val.split(" ")[1] === "PM";
  }
  private isAM(rec) {
    var val = moment(rec.fromTm).format("hh:mm A");
    return val.split(" ")[1] === "AM";
  }

  filterSlots() {
    this.availableSlotsAM = this.availableSlots.filter(this.isAM);
    this.availableSlotsPM = this.availableSlots.filter(this.isPM);
  }

  openFreeBusy(e) {
    var msgService = this.msgService;

    this.freeBusy.pickatime.onselect(function (response, proposal) {
      debugger;
      if (response.statusCode === 200) {
        var meetingDate = new Date(proposal.startTime);
        var clientTz = proposal.organizer.timeZone;

        var el = document.getElementById('how-others-will-see');
        el.innerHTML = 'You have selected ' + meetingDate + ' in ' + clientTz + ' timezone'

      }
      else {
        msgService.showError('Error selecting date');
      }
    });

    var u = this.globalCfgService.getFullUserObj();

    this.freeBusy.pickatime.open({
      scenario: 'pick-a-time',
      display: 'modal'
    }, {
      calendarOwner: this.selectedMentor.email,
      durationInMin: 45,
      participants: [{
        email: u.email,
        name: u.firstName + ' ' + u.lastName,
        role: "proposer",
        timeZone: "America/Los_Angeles"
      }],
    });

  }

  backClicked() {
    this._location.back();
  }

}

