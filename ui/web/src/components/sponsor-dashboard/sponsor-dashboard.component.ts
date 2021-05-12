import { Component } from "@angular/core";

import { OnInit } from "@angular/core";
import Chart from "chart.js";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { DashboardService } from "../../services/dashboard.service";
import { MatDialog } from "@angular/material";

import * as moment from "moment";

@Component({
  selector: "tt-sponsor-dashboard",
  templateUrl: "./sponsor-dashboard.component.html",
  styleUrls: ["./sponsor-dashboard.component.css"]
})
export class SponsorDashboardComponent implements OnInit {
  mentorData = [];
  mentorColumns = [
    {
      name: "avatarUrl",
      displayName: "",
      type: "image",
      style: "width: 78px; border-radius:39px;"
    },
    { name: "fullName", displayName: "Mentor" },
    { name: "hrsSpent", displayName: "Total Hrs. Spent" },
    {
      name: "rating",
      displayName: "Avg. Rating",
      type: "widget",
      widget: { type: "rating" }
    }
  ];
  avgMeetingDuration: any;
  companyId: any;
  subscriptions: any = [];

  constructor(
    private dashboardService: DashboardService,
    private dialog: MatDialog,
    private globalCfgService: GlobalCfgService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.globalCfgService.userFetchedValue$.subscribe(() => {
        console.log(
          "-----> COMPANY: ",
          this.globalCfgService.getFullUserObj().companyId
        );
        this.companyId = this.globalCfgService.getFullUserObj().companyId;

        this.loadTotalMentors();
        this.loadYourContribution();
        this.loadYourTopMentors();
        this.loadMeetingsTrend();
        this.loadUtilization();
      })
    );
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  loadUtilization() {
    var fromDtm = moment()
      .subtract(3, "months")
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0)
      .toDate();
    var toDtm = moment().toDate();
    this.dashboardService
      .getUtilisation(this.companyId, fromDtm, toDtm, "month", null)
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

  loadMeetingsTrend() {
    var fromDtm = moment()
      .subtract(3, "months")
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0);
    var toDtm = moment();
    this.dashboardService
      .getMeetingsTrend(this.companyId, fromDtm.toDate(), toDtm.toDate())
      .subscribe(
        response => {
          this.avgMeetingDuration = response["result"]["avgMeetingDuration"];

          var ctx4 = "meetingsChart";
          var meetingsChart = new Chart(ctx4, {
            type: "line",
            data: {
              labels: response["result"]["months"],
              datasets: [
                {
                  label: "Total Meetings",
                  // backgroundColor: 'rgba(255, 99, 132, 1)',
                  // borderColor: 'rgba(255, 99, 132, 1)',
                  backgroundColor: "rgba(240, 107, 78, 1)",
                  borderColor: "rgba(240, 107, 78, 1)",
                  data: response["result"]["allMeetings"],
                  fill: false,
                  borderWidth: 1
                },
                {
                  label: "Completed Meetings",
                  // backgroundColor: 'rgba(54, 162, 235, 1)',
                  // borderColor: 'rgba(54, 162, 235, 1)',
                  backgroundColor: "rgba(84, 71, 102, 1)",
                  borderColor: "rgba(84, 71, 102, 1)",
                  data: response["result"]["completedMeetings"],
                  fill: false,
                  borderWidth: 1
                },
                {
                  label: "Rejected Meetings",
                  // backgroundColor: 'rgba(255, 206, 86, 1)',
                  // borderColor: 'rgba(255, 206, 86, 1)',
                  backgroundColor: "rgba(191, 187, 199, 1)",
                  borderColor: "rgba(191, 187, 199, 1)",
                  data: response["result"]["rejectedMeetings"],
                  fill: false,
                  borderWidth: 1
                }
              ]
            },
            options: {
              legend: {
                display: false
              },
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

  loadYourContribution() {
    var fromDtm = moment()
      .subtract(3, "months")
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0);
    var toDtm = moment();
    this.dashboardService
      .getYourContribution(this.companyId, fromDtm.toDate(), toDtm.toDate())
      .subscribe(
        response => {
          var ctx2 = "monthwiseUsersChart";
          var myChart = new Chart(ctx2, {
            type: "bar",
            data: {
              labels: response["result"]["months"],
              datasets: [
                {
                  label: "Mentors",
                  // backgroundColor: 'rgba(255, 99, 132, 1)',
                  backgroundColor: "rgba(240, 107, 78, 1)",
                  data: response["result"]["mentors"]
                },
                {
                  label: "Hours Spent",
                  // backgroundColor: 'rgba(54, 162, 235, 1)',
                  backgroundColor: "rgba(84, 47, 66, 1)",
                  data: response["result"]["hours"]
                }
              ]
            },
            options: {
              legend: {
                display: false
              },
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

  loadYourTopMentors() {
    this.dashboardService.getYourTopMentors(this.companyId).subscribe(
      response => {
        this.mentorData = response["result"];
      },
      error => {}
    );
  }

  loadTotalMentors() {
    var user = this.globalCfgService.getFullUserObj();
    // this.dashboardService.getTotalMentors(user.userDetail.companyId).subscribe(
    this.dashboardService
      .getTotalMentors(this.companyId)
      .subscribe(response => {
        var ctx1 = "totalUsersChart";
        var myPieChart = new Chart(ctx1, {
          type: "doughnut",
          data: {
            datasets: [
              {
                data: response["result"],
                backgroundColor: [
                  // 'rgba(255, 99, 132, 1)',
                  // 'rgba(54, 162, 235, 1)',
                  // 'rgba(255, 206, 86, 1)'
                  "rgba(240, 107, 78, 1)",
                  "rgba(84, 71, 66, 1)",
                  "rgba(191, 187, 199, 1)"
                ]
              }
            ],
            labels: ["Yours", "Other Sponsored", "Non-sponsored"]
          },
          options: {
            legend: {
              position: "right"
            }
          }
        });
      });
  }
}
