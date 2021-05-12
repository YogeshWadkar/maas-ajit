import { Component } from "@angular/core";

import { OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { MeetingService } from "../../services/meeting.service";
import { ActivatedRoute } from "@angular/router";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { MatDialog } from "@angular/material";
import { ViewOnlyProfileComponent } from "../viewonly-profile/viewonly-profile.component";

@Component({
  selector: "tt-expired-meetings",
  templateUrl: "./expired-meetings.component.html",
  styleUrls: ["./expired-meetings.component.css"]
})
export class ExpiredMeetingsComponent implements OnInit {
  title = "Expired Meetings";
  columns = {
    admin: [
      { name: "meetingId", displayName: "Meeting Id" },
      {
        name: "seekerUser.fullName",
        displayName: "Career Seeker",
        actionable: true
      },
      { name: "mentorUser.fullName", displayName: "Mentor", actionable: true },
      {
        name: "date",
        displayName: "Scheduled Date",
        type: "date",
        format: "MM/DD/YYYY"
      },
      {
        name: "fromTm",
        displayName: "From Time",
        type: "time",
        format: "hh:mm A"
      },
      { name: "toTm", displayName: "To Time", type: "time", format: "hh:mm A" },
      // {name: 'status.description', displayName: 'Status'},
      { name: "agenda", displayName: "Agenda" }
    ],
    "career-seeker": [
      { name: "meetingId", displayName: "Meeting Id" },
      { name: "mentorUser.fullName", displayName: "Mentor", actionable: true },
      {
        name: "date",
        displayName: "Scheduled Date",
        type: "date",
        format: "MM/DD/YYYY"
      },
      {
        name: "fromTm",
        displayName: "From Time",
        type: "time",
        format: "hh:mm A"
      },
      { name: "toTm", displayName: "To Time", type: "time", format: "hh:mm A" },
      // {name: 'status.description', displayName: 'Status'},
      { name: "agenda", displayName: "Agenda" }
    ],
    mentor: [
      { name: "meetingId", displayName: "Meeting Id" },
      {
        name: "seekerUser.fullName",
        displayName: "Career Seeker",
        actionable: true
      },
      {
        name: "date",
        displayName: "Scheduled Date",
        type: "date",
        format: "MM/DD/YYYY"
      },
      {
        name: "fromTm",
        displayName: "From Time",
        type: "time",
        format: "hh:mm A"
      },
      { name: "toTm", displayName: "To Time", type: "time", format: "hh:mm A" },
      // {name: 'status.description', displayName: 'Status'},
      { name: "agenda", displayName: "Agenda" }
    ]
  };

  statuses: any[];
  meetings: any[];
  expiredStatusId: number;
  role: string;
  page: any;

  dialogWidth: "250px";

  private statusesSource = new Subject<any>();
  private statusesFetchedValue$ = this.statusesSource.asObservable();

  private roleSource = new Subject<any>();
  private roleFetchedValue$ = this.roleSource.asObservable();
  user: any;
  totalCount: any;
  subscriptions: any = [];

  constructor(
    private dialog: MatDialog,
    private meetingService: MeetingService,
    private route: ActivatedRoute,
    private globalCfgService: GlobalCfgService
  ) {}
  ngOnInit() {
    this.subscriptions.push(
      this.statusesFetchedValue$.subscribe(() => {
        this.loadMeetings();
      })
    );

    this.subscriptions.push(
      this.roleFetchedValue$.subscribe(() => {
        this.loadStatuses();
      })
    );

    this.subscriptions.push(
      this.route.url.subscribe(url => {
        console.log("URL: ", url, url.length, url.values().next().value.path);
        //always the first part is role
        this.role = url.values().next().value.path;
        this.roleSource.next();
      })
    );
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private loadStatuses() {
    this.meetingService.getMeetingStatuses().subscribe(
      (response: any[]) => {
        this.statuses = response["data"];

        this.statuses.forEach(item => {
          // if (item.name == 'approved') {
          //   this.upcomingStatusId = item.id;
          // }
          if (item.name == "expired") {
            this.expiredStatusId = item.id;
          }
        });

        this.statusesSource.next();
      },
      error => {}
    );
  }

  private loadMeetings(page?) {
    this.meetingService
      .getExpiredMeetings(this.expiredStatusId, page)
      .subscribe(
        (response: any[]) => {
          this.meetings = response["data"];
          this.totalCount = response["count"];

          this.meetings.forEach(item => {
            var su = item["seekerUser"],
              mu = item["mentorUser"];
            su["fullName"] = su["firstName"] + " " + su["lastName"];
            mu["fullName"] = mu["firstName"] + " " + mu["lastName"];

            this.user = this.globalCfgService.getFullUserObj();
          });
        },
        error => {}
      );
  }

  private onActionableClicked(event) {
    console.log("onActionableClicked:", event);

    var userId;
    switch (event.actionName) {
      case "seekerUser.fullName":
        userId = event.record.seekerUserId;
        break;
      case "mentorUser.fullName":
        userId = event.record.mentorUserId;
        break;
      default:
        console.log("Unhandled actionable: ", event.actionName);
    }
    const dialogRef2 = this.dialog.open(ViewOnlyProfileComponent, {
      width: "2400px",
      data: { userId: userId }
    });
  }

  private onPageChanged(page) {
    this.loadMeetings(page);
    this.page = page;
  }
}
