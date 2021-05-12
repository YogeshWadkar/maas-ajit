import { Component } from "@angular/core";

import { OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { MeetingService } from "../../services/meeting.service";
import { Router, ActivatedRoute } from "@angular/router";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { FieldGeneratorService } from "../../services/field-generator.service";
import { MatDialog } from "@angular/material";
import { FormDialogComponent } from "../form-dialog/form-dialog.component";
import { MiscService } from "../../services/misc.service";
import { RateDialogComponent } from "../rate-dialog/rate-dialog.component";
import { UserService } from "../../services/user.service";
import { ViewOnlyProfileComponent } from "../viewonly-profile/viewonly-profile.component";
import { MessageService } from "../../services/message.service";
import { ChatDialogService } from '../../services/chat-dialog.service';

@Component({
  selector: "tt-completed-meetings",
  templateUrl: "./completed-meetings.component.html",
  styleUrls: ["./completed-meetings.component.css"]
})
export class CompletedMeetingsComponent implements OnInit {
  title = "Completed Meetings";
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
      { name: "agenda", displayName: "Agenda" },
      { name: "actions", displayName: "Actions" }
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
      { name: "agenda", displayName: "Agenda" },
      { name: "actions", displayName: "Actions" }
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
      { name: "agenda", displayName: "Agenda" },
      { name: "actions", displayName: "Actions" }
    ]
  };

  tokenAllocationFields = [
    { name: "mentorNumTokens", displayName: "Tokens to Mentor", required: true },
    { name: "seekerNumTokens", displayName: "Tokens to Career seeker", required: true }
  ];

  meetingInContext: any;
  showChat: boolean = false;
  statuses: any[];
  meetings: any[];
  // upcomingStatusId: number;
  completedStatusId: number;
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
    private globalCfgService: GlobalCfgService,
    private fgService: FieldGeneratorService,
    private miscService: MiscService,
    private userService: UserService,
    private msgService: MessageService,
    private chatDialogService: ChatDialogService
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
          if (item.name == "completed") {
            this.completedStatusId = item.id;
          }
        });

        this.statusesSource.next();
      },
      error => {}
    );
  }

  private loadMeetings(page?) {
    this.meetingService
      .getCompletedMeetings(this.completedStatusId, page)
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
            if (this.user.role.name == "admin") {
              if (this.role == "admin" && !item.hasTokenAllocated) {
                item["actions"] = [
                  { name: "card_giftcard", tip: "Gift tokens" }
                ];
              }
            } else {
              item["actions"] = item["actions"] || [];
              if (
                (this.role == "career-seeker" &&
                  item.hasSeekerRated != "true") ||
                (this.role == "mentor" && item.hasMentorRated != "true")
              ) {
                item["actions"].push({ name: "star_border", tip: "Rate" });
              }
              if ((this.role == "career-seeker" || this.role == "mentor") && item.hasChatLog) {
                item["actions"].push({ name: "chat", tip: "View Chat History" });
              }
            }
          });
        },
        error => {}
      );
  }

  private onActionClicked(event) {
    console.log("onActionClicked:", event);
    switch (event.actionName.name) {
      case "card_giftcard":
        var rec = event.record;
        var fields = this.fgService.getFields(this.tokenAllocationFields, null);
        const dialogRef = this.dialog.open(FormDialogComponent, {
          width: this.dialogWidth,
          data: { title: "Allocate Token", fields: fields }
        });

        dialogRef.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);

          this.miscService
            .allocateTokens(rec.id, [
              {
                userId: rec["mentorUserId"],
                numTokens: result["mentorNumTokens"]
              },
              {
                userId: rec["seekerUserId"],
                numTokens: result["seekerNumTokens"]
              }
            ])
            .subscribe(
              response => {
                this.msgService.showSuccess("Token has been allocated");
                console.log("Tokens allocated!");
                this.loadMeetings(this.page);
              },
              error => {
                console.log("Failed to create!", error);
              }
            );
        });
        break;
      case "star_border":
        var rec = event.record;
        console.log("star_border:", rec);

        var userBeingRated;
        if (this.role == "career-seeker") {
          userBeingRated = rec["mentorUser"];
        }

        if (this.role == "mentor") {
          userBeingRated = rec["seekerUser"];
        }

        const cnfmdialogRef = this.dialog.open(RateDialogComponent, {
          width: this.dialogWidth,
          data: {
            userBeingRated: userBeingRated,
            message: ""
          }
        });
        cnfmdialogRef.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          if (result.action === "yes") {
            this.userService
              .rate({
                rating: result.rating,
                fromUserId: this.globalCfgService.getUserId(),
                forUserId: userBeingRated.id,
                meetingId: rec.id
              })
              .subscribe(
                response => {
                  console.log("Rated!");
                  this.msgService.showSuccess("Thank you for rating!");
                  this.loadMeetings(this.page);
                },
                error => {
                  console.log("Failed to delete!", error);
                }
              );
          }
        });
        break;
      case 'chat':
        var rec = event.record;
        var toUser;
        if (this.globalCfgService.getUserId() == rec.mentorUserId) {
          toUser = rec.seekerUser;
        } else {
          toUser = rec.mentorUser;
        }

        this.userService.getUserDetail(toUser.id).subscribe(
          (response: any)=> {
            var meetingInContext = {
              ctx: 'meeting',
              ctxId: rec.meetingId,
              ctxName: rec.topic,
              fromUser: this.globalCfgService.getFullUserObj(),
              toUser: response['data'][0],
              readOnly: true
            };
            // this.showChat = true;
            this.chatDialogService.add(meetingInContext);
          }
        );
        break;
      default:
        console.log("Unhandled action. Please check!");
    }
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
