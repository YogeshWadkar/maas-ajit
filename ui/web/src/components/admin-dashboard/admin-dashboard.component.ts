import { Component } from "@angular/core";

import { OnInit } from "@angular/core";
import Chart from "chart.js";
import { DashboardService } from "../../services/dashboard.service";

import * as moment from "moment";
import { TaskService } from "../../services/task.service";
import { MessageService } from "../../services/message.service";
import { Subject } from "rxjs";

@Component({
  selector: "tt-admin-dashboard",
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.css"]
})
export class AdminDashboardComponent implements OnInit {
  skillData = [
    { name: "Adaptability" },
    { name: "Empathy" },
    { name: "Team Spirit" }
  ];
  skillColumns = [{ name: "name", displayName: "Skill Name" }];
  tasks = [];
  countryData = [];
  countryColumns = [
    { name: "country", displayName: "Country" },
    { name: "total", displayName: "Total Users" }
  ];

  companyData = [];
  companyColumns = [
    { name: "company", displayName: "Company" },
    { name: "total", displayName: "Total Users" }
  ];
  usersData: any;
  topMentors: any;
  topSeekers: any;
  topSkills: any;
  avgMeetingDuration: any = 0;
  doneStatusId: any;
  tasksCount: any;

  taskStatuses: any[] = [];

  private statusesSource = new Subject<any>();
  private statusesFetchedValue$ = this.statusesSource.asObservable();
  constructor(
    private dashboardService: DashboardService,
    private taskService: TaskService,
    private msgService: MessageService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadSignUps();
    this.loadTopMentors();
    this.loadTopSeekers();
    this.loadTopSkills();
    this.loadTopCountries();
    this.loadTopCompanies();
    this.loadMeetingsTrend();
    this.loadTaskStatuses();
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
      .getMeetingsTrend(null, fromDtm.toDate(), toDtm.toDate())
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

  loadTopCompanies() {
    this.dashboardService.getTopCompanies().subscribe(
      response => {
        this.companyData = response["result"];
      },
      error => {
        console.log("Service error: ", error);
      }
    );
  }

  loadTopMentors() {
    this.dashboardService.getTopMentors().subscribe(
      response => {
        this.topMentors = response["result"];
      },
      error => {
        console.log("Service error: ", error);
      }
    );
  }

  loadTopCountries() {
    this.dashboardService.getTopCountries().subscribe(
      response => {
        this.countryData = response["result"];
      },
      error => {
        console.log("Service error: ", error);
      }
    );
  }

  loadTopSeekers() {
    this.dashboardService.getTopSeekers().subscribe(
      response => {
        this.topSeekers = response["result"];
      },
      error => {
        console.log("Service error: ", error);
      }
    );
  }

  loadTopSkills() {
    this.dashboardService.getTopSkills().subscribe(
      response => {
        this.topSkills = response["result"];
      },
      error => {
        console.log("Service error: ", error);
      }
    );
  }

  loadSignUps() {
    var toDtm = moment();
    var fromDtm = moment().subtract(3, "months");

    this.dashboardService
      .getSignUps(fromDtm.toDate(), toDtm.toDate())
      .subscribe(response => {
        var ctx2 = "monthwiseUsersChart";
        var myChart = new Chart(ctx2, {
          type: "bar",
          data: {
            labels: response["result"]["months"],
            datasets: [
              {
                label: "Mentor",
                // backgroundColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: "rgba(240, 107, 78, 1)",
                data: response["result"]["mentors"]
              },
              {
                label: "Seeker",
                // backgroundColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: "rgba(84, 47, 66, 1)",
                data: response["result"]["seekers"]
              },
              {
                label: "Sponsor",
                // backgroundColor: 'rgba(255, 206, 86, 1)',
                backgroundColor: "rgba(191, 187, 199, 1)",
                data: response["result"]["sponsors"]
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
      });
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

  loadUsers() {
    this.dashboardService.getTotalUsers().subscribe(
      response => {
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
                  "rgba(84, 47, 66, 1)",
                  "rgba(191, 187, 199, 1)"
                ]
              }
            ],
            labels: ["Mentor", "Seeker", "Sponsor"]
          },
          options: {
            legend: {
              position: "right"
            }
          }
        });
      },
      error => {
        console.log("Service error: ", error);
      }
    );
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
}
