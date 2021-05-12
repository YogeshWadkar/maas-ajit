import { Component } from "@angular/core";

import { OnInit } from "@angular/core";
import { MeetingService } from "src/services/meeting.service";
import { Subject } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { ViewOnlyProfileComponent } from "../viewonly-profile/viewonly-profile.component";
import { MatDialog } from "@angular/material";
import { MessageService } from "../../services/message.service";

import * as moment from "moment";
import { GlobalCfgService } from '../../services/globalcfg.service';
import { UserService } from '../../services/user.service';
import { ChatDialogService } from '../../services/chat-dialog.service';
import { FormDialogComponent } from '../form-dialog/form-dialog.component';
import { FieldGeneratorService } from '../../services/field-generator.service';
import { AssessmentService } from '../../services/assessment.service';

@Component({
  selector: "tt-upcoming-meetings",
  templateUrl: "./upcoming-meetings.component.html",
  styleUrls: ["./upcoming-meetings.component.css"]
})
export class UpcomingMeetingsComponent implements OnInit {
  columns = {
    admin: [
      { name: "meetingId", displayName: "Meeting Id" },
      {
        name: "seekerUser.fullName",
        displayName: "Scheduled With",
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
      {
        name: "zoomLink",
        displayName: "Zoom Meeting",
        actionable: true,
        actionableName: "Start Meeting"
      },
      { name: "actions", displayName: "Actions" }
    ],
    "career-seeker": [
      { name: "meetingId", displayName: "Meeting Id" },
      {
        name: "mentorUser.fullName",
        displayName: "Scheduled With",
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
      {
        name: "zoomLink",
        displayName: "Zoom Meeting",
        actionable: true,
        actionableName: "Start Meeting"
      },
      { name: "actions", displayName: "Actions" }
    ],
    mentor: [
      { name: "meetingId", displayName: "Meeting Id" },
      {
        name: "seekerUser.fullName",
        displayName: "Scheduled With",
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
      {
        name: "zoomLink",
        displayName: "Zoom Meeting",
        actionable: true,
        actionableName: "Start Meeting"
      },
      { name: "actions", displayName: "Actions" }
    ]
  };

  statuses: any[];
  meetings: any[];
  upcomingStatusId: number;
  completedStatusId: number;
  role: string;
  totalCount: any;
  page: any;

  private statusesSource = new Subject<any>();
  private statusesFetchedValue$ = this.statusesSource.asObservable();

  private roleSource = new Subject<any>();
  private roleFetchedValue$ = this.roleSource.asObservable();
  subscriptions: any = [];

  constructor(
    private meetingService: MeetingService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private globalCfgService: GlobalCfgService,
    private msgService: MessageService,
    private userService: UserService,
    private chatDialogService: ChatDialogService,
    private fgService: FieldGeneratorService,
    private assessmentService: AssessmentService
  ) { }

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
        // console.log('URL: ', url, url.length, url.values().next().value.path);

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
          if (item.name == "approved") {
            this.upcomingStatusId = item.id;
          }
          if (item.name == "completed") {
            this.completedStatusId = item.id;
          }
        });

        this.statusesSource.next();
      },
      error => { }
    );
  }

  private loadMeetings(page?) {
    this.meetingService
      .getUpcomingMeetings(this.upcomingStatusId, page)
      .subscribe(
        (response: any[]) => {
          this.meetings = response["data"];
          this.totalCount = response["count"];

          this.meetings.forEach(item => {
            var su = item["seekerUser"],
              mu = item["mentorUser"];
            su["fullName"] = su["firstName"] + " " + su["lastName"];
            mu["fullName"] = mu["firstName"] + " " + mu["lastName"];

            var now = moment();
            var fromTm = moment(item.fromTm);
            var then = moment(item.date)
              .hour(fromTm.hour())
              .minute(fromTm.minute());
            item["actions"] = [];
            if (now.diff(then) > 0) {
              item["actions"].push({ name: "done", tip: "Mark as completed" });
            }
            item["actions"].push({ name: "chat", tip: "Chat" });
          });
        },
        error => { }
      );
  }

  private onActionClicked(event) {
    console.log("onActionClicked:", event);
    switch (event.actionName.name) {
      case "done":
        var rec = event.record;

        if (rec.isForAssessment) {
          var fieldsArr = [
            { name: 'rating', displayName: 'Rating', required: true },
            { name: 'recommendation', displayName: 'Recommendation', type: 'longstring', required: true },
            { name: 'hasRecommendedForNextLevel', displayName: 'Recommended for next level?', type: 'boolean' }
          ];

          var fields = this.fgService.getFields(
            fieldsArr,
            event.record
          );
          const dialogRef = this.dialog.open(FormDialogComponent, {
            width: '450px',
            data: {
              title: "Assessment Feedback",
              fields: fields
            }
          });
          dialogRef.afterClosed().subscribe(result => {
            console.log("The dialog was closed", result);

            if (result) {

              this.assessmentService.getAssessment(rec.assessmentId).subscribe(
                (assessment: any) => {

                  assessment.recommendation = result.recommendation;
                  assessment.rating = parseInt(result.rating);
                  assessment.hasRecommendedForNextLevel = result.hasRecommendedForNextLevel;

                  this.assessmentService.updateAssessmentRequest(assessment).subscribe(
                    () => {
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
                    }
                  );
                }
              );
            }
          });



        } else {
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
        }
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
          (response: any) => {
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
        const dialogRef = this.dialog.open(ViewOnlyProfileComponent, {
          width: "2400px",
          data: { userId: userId }
        });
        break;
      case "mentorUser.fullName":
        userId = event.record.mentorUserId;
        const dialogRef1 = this.dialog.open(ViewOnlyProfileComponent, {
          width: "2400px",
          data: { userId: userId }
        });
        break;
      case "zoomLink":
        window.open(event.record.zoomLink, "_blank");
        break;
      default:
        console.log("Unhandled actionable: ", event.actionName);
    }
  }

  private onPageChanged(page) {
    this.loadMeetings(page);
    this.page = page;
  }
}
