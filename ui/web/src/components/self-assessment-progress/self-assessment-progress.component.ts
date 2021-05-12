import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import Chart from "chart.js";
import { DashboardService } from "../../services/dashboard.service";

import * as moment from "moment";
import { TaskService } from "../../services/task.service";
import { MessageService } from "../../services/message.service";
import { Subject } from "rxjs";

import { ActivatedRoute, Router } from "@angular/router";
import { GlobalCfgService } from "../../services/globalcfg.service";

import { UserService } from "../../services/user.service";
import { AssessmentService } from "../../services/assessment.service";
import { CareerProfileService } from "src/services/career-profile.service";

@Component({
  selector: "tt-self-progress",
  templateUrl: "./self-assessment-progress.component.html",
  styleUrls: ["./self-assessment-progress.component.css"]
})
export class SelfAssessmentProgressComponent implements OnInit {
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
  skillsData: any[];
  taskStatuses: any[] = [];

  user: object;
  chart: any;

  private statusesSource = new Subject<any>();
  private statusesFetchedValue$ = this.statusesSource.asObservable();
  constructor(
    private dashboardService: DashboardService,
    private taskService: TaskService,
    private assessmentService: AssessmentService,
    private globalCfgService: GlobalCfgService,
    private careerProfileService: CareerProfileService,
    private dialogRef: MatDialogRef<SelfAssessmentProgressComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadTaskStatuses();
    this.loadCareerProfile();
  }

  private loadSkills() {
    this.assessmentService.getAllUserSkills(this.user["id"]).subscribe(
      (response: any[]) => {
        this.skillsData = response["data"];
      },
      error => {
        console.log("Service error: ", error);
      }
    );
  }

  // drawChart() {
  //   if (this.chart) {
  //     this.chart.destroy();
  //   }
  // }

  loadUsers() {
    this.dashboardService.getTotalUsers().subscribe(
      response => {
        var ctx = "totalLevelChart";
        var myPieChart = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Level1", "Level2", "Level3"],
            datasets: [
              {
                label: "Job Readiness",
                backgroundColor: [
                  "rgba(240, 107, 78, 1)",
                  "rgba(0, 186, 101)",
                  "rgb(8, 158, 218)"
                ],
                borderColor: "#fff",
                data: response["result"]
              }
            ]
          },
          options: {
            circumference: 1 * Math.PI,
            rotation: 1 * Math.PI,
            cutoutPercentage: 65
          }
        });

        var ctx1 = "LevelOneChart";
        var myPieChart = new Chart(ctx1, {
          type: "doughnut",
          data: {
            dataLabels: {
              enabled: true
            },
            labels: ["Level1"],
            datasets: [
              {
                label: "Job Readiness",
                backgroundColor: ["rgba(240, 107, 78, 1)"],
                borderColor: "#fff",
                data: [40, 10]
              }
            ]
          },
          options: {
            circumference: 1 * Math.PI,
            rotation: 1 * Math.PI,
            cutoutPercentage: 65
          }
        });

        var ctx2 = "LevelTwoChart";
        var myPieChart = new Chart(ctx2, {
          type: "doughnut",
          data: {
            labels: ["Level2"],
            datasets: [
              {
                label: "Job Readiness",
                backgroundColor: ["rgba(0, 186, 101)"],
                borderColor: "#fff",
                data: response["result"]
              }
            ]
          },
          options: {
            circumference: 1 * Math.PI,
            rotation: 1 * Math.PI,
            cutoutPercentage: 65
          }
        });

        var ctx3 = "LevelthreeChart";
        var myPieChart = new Chart(ctx3, {
          type: "doughnut",
          data: {
            labels: ["Level3"],
            datasets: [
              {
                label: "Job Readiness",
                backgroundColor: ["rgb(8, 158, 218)"],
                borderColor: "#fff",
                data: response["result"]
              }
            ]
          },
          options: {
            circumference: 1 * Math.PI,
            rotation: 1 * Math.PI,
            cutoutPercentage: 65
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

  private loadCareerProfile() {
    this.careerProfileService
      .getCareerProfileDetail(this.data["cProfileId"])
      .subscribe((response: any) => {
        this.user = response;
        console.log("view career profile data:", this.user);
      });
  }
}

export interface DialogData {
  cProfileId: number;
}
