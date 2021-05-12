import { Component } from "@angular/core";

import { OnInit } from "@angular/core";
import { FeedService } from "../../services/feed.service";
import { FeedEntry } from "../../services/model/feed-entry";
import { EventBusService } from "../../services/event-bus.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { DashboardService } from "../../services/dashboard.service";
import { MatDialog } from "@angular/material";
import { ViewOnlyProfileComponent } from "../viewonly-profile/viewonly-profile.component";

import * as moment from "moment";
import { TaskService } from "../../services/task.service";
import { MessageService } from "../../services/message.service";
import { Subject } from "rxjs";
import { ProgramService } from "../../services/program.service";
import { EnrolDialogComponent } from '../enrol-dialog/enrol-dialog.component';

@Component({
  selector: "tt-career-seeker-dashboard",
  templateUrl: "./career-seeker-dashboard.component.html",
  styleUrls: ["./career-seeker-dashboard.component.css"]
})
export class CareerSeekerDashboardComponent implements OnInit {
  private feedBaseUrl: string = "https://medium.com/feed/";
  feeds: Array<FeedEntry> = [];

  adSlides: any[] = [];

  mentors = [];
  mentorsColumns = [
    { name: "fullName", displayName: "Mentor", actionable: true },
    { name: "skillNames", displayName: "Skills" }
  ];

  meetings = [];
  meetingsColumns = [
    { name: "mentorUser.fullName", displayName: "Mentor", actionable: true },
    {
      name: "date",
      displayName: "Meeting On",
      type: "date",
      format: "MM/DD/YYYY"
    },
    { name: "time", displayName: "Timing" }
  ];

  tasks = [];
  tasksColumns = [
    { name: "title", displayName: "Title" },
    {
      name: "dueDt",
      displayName: "Due Date",
      type: "date",
      format: "MM/DD/YYYY"
    },
    { name: "actions", displayName: "" }
  ];
  mentorsCount: any;
  meetingsCount: any;
  tasksCount: any;
  assessmentsCount: any;
  assessments: any[] = [];
  subscriptions: any = [];
  doneStatusId: any;

  taskStatuses: any[] = [];

  private statusesSource = new Subject<any>();
  private statusesFetchedValue$ = this.statusesSource.asObservable();

  constructor(
    private feedService: FeedService,
    private globalCfgService: GlobalCfgService,
    private eventService: EventBusService,
    private dashboardService: DashboardService,
    private dialog: MatDialog,
    private taskService: TaskService,
    private msgService: MessageService,
    private programService: ProgramService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.eventService.settingsFetchedValue$.subscribe(() =>
        this.refreshFeed()
      )
    );

    this.subscriptions.push(
      this.statusesFetchedValue$.subscribe(() => this.loadPendingTasks())
    );

    this.subscriptions.push(
      this.eventService.adsFetchedValue$.subscribe(
        slides => (this.adSlides = slides)
      )
    );

    this.eventService.loadAds();

    this.loadMatchingMentors();
    this.loadUpcomingMeetings();
    this.loadRecentSkillRatings();
    this.loadTaskStatuses();
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  refreshFeed() {
    this.feeds.length = 0;
    console.log(
      "Medium URL: ",
      this.globalCfgService.getSettingValue("medium_feed_identifier")
    );
    this.feedService
      .getFeedContent(
        this.feedBaseUrl +
          this.globalCfgService.getSettingValue("medium_feed_identifier")
      )
      .subscribe(
        feed => {
          // console.log('FEED: ', feed);
          this.feeds = feed["items"].slice(0, 5);
        },
        error => console.log(error)
      );
  }

  loadMatchingMentors() {
    this.dashboardService.getRecentMatchingMentors().subscribe(
      (response: any[]) => {
        var mentors = response["result"]["mentors"];
        this.mentorsCount = response["result"]["count"];
        mentors.forEach(item => {
          item["fullName"] = item["firstName"] + " " + item["lastName"];
          var skills = [];
          var skillList = item["skillList"];
          skillList.forEach(element => {
            skills.push(element.name);
          });

          var str = skills.join().replace(/,/g, ", ");
          if (str.length > 28) {
            str = str.substring(0, 28) + "...";
          }
          item["skillNames"] = str;
        });
        this.mentors = mentors;
      },
      error => {
        console.log("Service error: ", error);
      }
    );
  }

  loadUpcomingMeetings() {
    this.dashboardService.getUpcomingMeetings().subscribe(
      (response: any[]) => {
        var meetings = response["result"]["meetings"];
        this.meetingsCount = response["result"]["count"];
        meetings.forEach(item => {
          var fromTm = moment(item.fromTm).format("hh:mm A");
          var toTm = moment(item.toTm).format("hh:mm A");
          item["time"] = fromTm + " - " + toTm;
          item["actions"] = [{ name: "done", tip: "Mark as done" }];
        });
        this.meetings = meetings;
      },
      error => {
        console.log("Service error: ", error);
      }
    );
  }

  loadPendingTasks() {
    this.dashboardService.getPendingTasks().subscribe(
      (response: any[]) => {
        var tasks = response["result"]["tasks"];
        this.tasksCount = response["result"]["count"];
        tasks.forEach(item => {
          var fromTm = moment(item.fromTm).format("hh:mm A");
          var toTm = moment(item.toTm).format("hh:mm A");
          item["time"] = fromTm + " - " + toTm;
          item["actions"] = [{ name: "done", tip: "Mark as done" }];
        });
        this.tasks = tasks;
      },
      error => {
        console.log("Service error: ", error);
      }
    );
  }

  loadRecentSkillRatings() {
    this.dashboardService.getRecentSkillRatings().subscribe(
      (response: any[]) => {
        var assessments = response["result"]["assessments"];
        this.assessmentsCount = response["result"]["count"];

        this.assessments = assessments;
      },
      error => {
        console.log("Service error: ", error);
      }
    );
  }

  onUserActionableClicked(userId) {
    const dialogRef = this.dialog.open(ViewOnlyProfileComponent, {
      width: "2400px",
      data: { userId: userId }
    });
  }

  private loadTaskStatuses() {
    this.taskService.getAllStatuses().subscribe(
      (response: any[]) => {
        let arr: any = response["data"];

        arr.forEach(element => {
          if (element.name == "done") {
            this.doneStatusId = element.id;
          }
        });

        this.statusesSource.next();
      },
      error => {
        console.log("Service error:", error);
      }
    );
  }

  onActionClicked(e) {
    var rec = e.record;
    this.taskService.updateTaskStatus(rec.id, this.doneStatusId).subscribe(
      () => {
        this.msgService.showSuccess("Task status has been updated to Done");
        this.loadPendingTasks();
      },
      error => {
        this.msgService.showError("Failed to update the task status");
      }
    );
  }

  handleJoin(e) {
    console.log("handleJoin", e);

    var programId = e.id;
    this.programService.getProgramDetail(programId).subscribe(
      (program: any) => {
      const dialogRef = this.dialog.open(EnrolDialogComponent, {
        width: "1200px",
        data: {
          // title: "Join program",
          formMetaData: JSON.parse(program.form.config),
          program: program
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          var rec = {
            requestData: JSON.stringify(result),
            userId: this.globalCfgService.getUserId(),
            programId: programId,
            formId: program.formId
          };

          this.programService.createRequest(rec).subscribe(
            ()=> {
              this.msgService.showSuccess('Your request has been submitted for review.');
            }
          );

        }
      });
    });
  }
}
