import { Component, OnDestroy } from "@angular/core";
import Chart from "chart.js";

import { OnInit } from "@angular/core";
import { FeedEntry } from "../../services/model/feed-entry";
import { FeedService } from "../../services/feed.service";
import { DashboardService } from "../../services/dashboard.service";
import { MatDialog } from "@angular/material";

import * as moment from "moment";
import { ViewOnlyProfileComponent } from "../viewonly-profile/viewonly-profile.component";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { ProgramService } from '../../services/program.service';
import { EnrolDialogComponent } from '../enrol-dialog/enrol-dialog.component';
import { MessageService } from '../../services/message.service';
import { EventBusService } from '../../services/event-bus.service';

@Component({
  selector: "tt-ig-dashboard",
  templateUrl: "./ig-dashboard.component.html",
  styleUrls: ["./ig-dashboard.component.css"]
})
export class IGDashboardComponent implements OnInit, OnDestroy {
  private feedUrl: string = "https://medium.com/feed/the-ascent";
  feeds: Array<FeedEntry> = [];

  assessments = [];
  assessmentsCount: any;

  meetings = [];
  meetingsColumns = [
    { name: "seekerUser.fullName", displayName: "Seeker", actionable: true },
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
      name: "date",
      displayName: "Due Date",
      type: "date",
      format: "MM/DD/YYYY"
    },
    { name: "actions", displayName: "" }
  ];
  meetingsCount: any;
  tasksCount: any;

  adSlides: any[] = [];
  subscriptions: any[] = [];

  constructor(
    private feedService: FeedService,
    private dashboardService: DashboardService,
    private dialog: MatDialog,
    private globalCfgService: GlobalCfgService,
    private programService: ProgramService,
    private msgService: MessageService,
    private eventService: EventBusService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.eventService.adsFetchedValue$.subscribe(
        slides => (this.adSlides = slides)
      )
    );

    this.eventService.loadAds();

    this.refreshFeed();

    this.loadUpcomingMeetings();
    this.loadPendingTasks();
    this.loadRecentSkillRatings();
    this.loadUtilization();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  refreshFeed() {
    this.feeds.length = 0;
    // Adds 1s of delay to provide user's feedback.
    this.feedService.getFeedContent(this.feedUrl).subscribe(
      feed => {
        // console.log('FEED: ', feed);
        this.feeds = feed["items"].slice(0, 5);
      },
      error => console.log(error)
    );
  }

  loadUtilization() {
    var fromDtm = moment()
      .subtract(3, "months")
      .toDate();
    var toDtm = moment().toDate();
    this.dashboardService
      .getUtilisation(
        1,
        fromDtm,
        toDtm,
        "month",
        this.globalCfgService.getUserId()
      )
      .subscribe(
        response => {
          var ctx3 = "availabilityVsAllocationChart";
          var myLineChart = new Chart(ctx3, {
            type: "line",
            data: {
              labels: response["result"]["dimension"],
              datasets: [
                {
                  label: "Availability",
                  // backgroundColor: 'rgba(255, 99, 132, 1)',
                  // borderColor: 'rgba(255, 99, 132, 1)',
                  backgroundColor: "rgba(240, 107, 78, 1)",
                  borderColor: "rgba(240, 107, 78, 1)",
                  data: response["result"]["availableHrs"],
                  fill: false,
                  borderWidth: 1
                },
                {
                  label: "Allocation",
                  // backgroundColor: 'rgba(54, 162, 235, 1)',
                  // borderColor: 'rgba(54, 162, 235, 1)',
                  backgroundColor: "rgba(84, 71, 102, 1)",
                  borderColor: "rgba(84, 71, 102, 1)",
                  data: response["result"]["spentHrs"],
                  fill: false,
                  borderWidth: 1
                }
              ]
            },
            options: {
              // legend: {
              //   display: false
              // },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      beginAtZero: true
                    }
                  }
                ]
              }
            }
          });
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

  handleJoin(e) {
    console.log("handleJoin", e);

    var programId = e.id;
    this.programService.getProgramDetail(programId).subscribe(
      (program: any) => {
      const dialogRef = this.dialog.open(EnrolDialogComponent, {
        width: "480px",
        data: {
          title: "Join program",
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
