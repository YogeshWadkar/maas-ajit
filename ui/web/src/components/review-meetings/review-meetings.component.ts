import { Component } from "@angular/core";

import { OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MeetingService } from "src/services/meeting.service";
import { Subject } from "rxjs";
import { ViewOnlyProfileComponent } from "../viewonly-profile/viewonly-profile.component";
import { MatDialog } from "@angular/material";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { MessageService } from "../../services/message.service";
import { ConfirmationDialogComponent } from "../confirm-dialog/confirm-dialog.component";

import * as moment from "moment";
import { UserService } from '../../services/user.service';
import { ChatDialogService } from '../../services/chat-dialog.service';

@Component({
  selector: "tt-review-meetings",
  templateUrl: "./review-meetings.component.html",
  styleUrls: ["./review-meetings.component.css"]
})
export class ReviewMeetingsComponent implements OnInit {
  title = "Accept/Reject Meetings";

  columns = {
    admin: [
      { name: "meetingId", displayName: "Request Id" },
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
      { name: "topic", displayName: "Topic" },
      { name: "agenda", displayName: "Agenda" },
      { name: "actions", displayName: "Actions" }
    ],
    mentor: [
      { name: "meetingId", displayName: "Request Id" },
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
      { name: "topic", displayName: "Topic" },
      { name: "agenda", displayName: "Agenda" },
      { name: "actions", displayName: "Actions" }
    ],
    "career-seeker": [
      { name: "meetingId", displayName: "Request Id" },
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
      { name: "topic", displayName: "Topic" },
      { name: "agenda", displayName: "Agenda" },
      { name: "actions", displayName: "Actions" }
    ]
  };

  meetingInContext: any;
  showChat: boolean = false;
  statuses: any[];
  meetings: any[];
  // upcomingStatusId: number;
  pendingStatusId: number;
  acceptStatusId: number;
  rejectStatusId: number;
  completedStatusId: number;
  role: string;
  totalCount: any;

  private statusesSource = new Subject<any>();
  private statusesFetchedValue$ = this.statusesSource.asObservable();

  private roleSource = new Subject<any>();
  private roleFetchedValue$ = this.roleSource.asObservable();
  cancelledStatusId: any;
  subscriptions: any = [];
  page: any;

  constructor(
    private router: Router,
    private meetingService: MeetingService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private globalCfgService: GlobalCfgService,
    private msgService: MessageService,
    private userService: UserService,
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

        if (this.role != "mentor") {
          this.title = "Pending Approval Meetings";
        }
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
          if (item.name == "approved") {
            this.acceptStatusId = item.id;
          }
          if (item.name == "rejected") {
            this.rejectStatusId = item.id;
          }
          if (item.name == "pending_approval") {
            this.pendingStatusId = item.id;
          }
          if (item.name == "completed") {
            this.completedStatusId = item.id;
          }
          if (item.name == "cancelled") {
            this.cancelledStatusId = item.id;
          }
        });

        this.statusesSource.next();
      },
      error => {}
    );
  }

  private loadMeetings(page?) {
    var fn, args;

    if (this.role == "admin") {
      fn = this.meetingService.getPendingApprovalMeetings;
      args = [this.pendingStatusId, null, page];
    }
    if (this.role == "mentor") {
      fn = this.meetingService.getPendingApprovalMeetingsForMentor;
      args = [this.pendingStatusId, this.globalCfgService.getUserId(), page];
    }
    if (this.role == "career-seeker") {
      fn = this.meetingService.getPendingApprovalMeetingsForCS;
      args = [this.pendingStatusId, this.globalCfgService.getUserId(), page];
    }

    fn.apply(this.meetingService, args).subscribe(
      (response: any[]) => {
        this.meetings = response["data"];
        this.totalCount = response["count"];

        this.meetings.forEach(item => {
          var su = item["seekerUser"],
            mu = item["mentorUser"];
          su["fullName"] = su["firstName"] + " " + su["lastName"];
          mu["fullName"] = mu["firstName"] + " " + mu["lastName"];

          if (this.role == "mentor") {
            item["actions"] = [
              { name: "done", tip: "Approve" },
              { name: "clear", tip: "Reject" },
              { name: "assignment", tip: "Assign task to requestor" },
              { name: "chat", tip: "Chat" }
            ];
            var now = moment();
            var fromTm = moment(item.fromTm);
            var then = moment(item.date)
              .hour(fromTm.hour())
              .minute(fromTm.minute());
            if (now.diff(then) > 0) {
              item["actions"].push({
                name: "done_all",
                tip: "Mark as completed"
              });
            }
          }

          if (this.role == "career-seeker") {
            item["actions"] = [
              { name: "cancel", tip: "Cancel meeting" },
              { name: "chat", tip: "Chat" }
            ];
          }

          if (this.role == "admin") {
            item["actions"] = [
              { name: "done", tip: "Approve" },
              { name: "clear", tip: "Reject" },
              { name: "done_all", tip: "Mark as completed" }
            ];
          }
        });
      },
      error => {}
    );
  }

  private onActionClicked(event) {
    console.log("onActionClicked:", event);
    var cnfmdialogRef;
    switch (event.actionName.name) {
      case "done":
        var rec = event.record;
        console.log("marking meeting as accepted...");
        this.meetingService
          .updateMeetingStatus(rec.id, this.acceptStatusId)
          .subscribe(
            (response: any[]) => {
              console.log("Record updated.");
              this.msgService.showSuccess(
                "Thank you for accepting the meeting"
              );
              this.loadMeetings(this.page);
            },
            error => {
              console.log("Service error:", error);
            }
          );
        break;
      case "clear":
        var rec = event.record;
        console.log("marking meeting as rejected...");
        cnfmdialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: "450px",
          data: {
            title: "Reject Meeting Invite",
            message:
              "Are you sure you want to reject " +
              event.record.meetingId +
              " meeting?"
          }
        });
        cnfmdialogRef.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          if (result === "yes") {
            this.meetingService
              .updateMeetingStatus(rec.id, this.rejectStatusId)
              .subscribe(
                (response: any[]) => {
                  console.log("Record updated.");
                  this.msgService.showSuccess(
                    "Meeting request has been rejected"
                  );
                  this.loadMeetings(this.page);
                },
                error => {
                  console.log("Service error:", error);
                }
              );
          }
        });
        break;
      case "done_all":
        var rec = event.record;
        console.log("marking meeting as done...");
        this.meetingService
          .updateMeetingStatus(rec.id, this.completedStatusId)
          .subscribe(
            (response: any[]) => {
              console.log("Record updated.");
              this.msgService.showSuccess(
                "Meeting has been marked as completed"
              );
              this.loadMeetings(this.page);
            },
            error => {
              console.log("Service error:", error);
            }
          );
        break;
      case "cancel":
        var rec = event.record;
        console.log("marking meeting as cancel...");

        cnfmdialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: "450px",
          data: {
            title: "Cancel Meeting",
            message:
              "Are you sure you want to cancel " +
              event.record.meetingId +
              " meeting?"
          }
        });
        cnfmdialogRef.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          if (result === "yes") {
            this.meetingService
              .updateMeetingStatus(rec.id, this.cancelledStatusId)
              .subscribe(
                (response: any[]) => {
                  console.log("Record updated.");
                  this.msgService.showSuccess("Meeting has been cancelled");
                  this.loadMeetings(this.page);
                },
                error => {
                  console.log("Service error:", error);
                }
              );
          }
        });
        break;
      case "assignment":
        var rec = event.record;
        console.log("assign task");
        this.router.navigateByUrl(
          "/mentor/assign-task/" + rec.seekerUserId + "?meeting=" + rec.id
        );
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
              toUser: response['data'][0]
            };
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
