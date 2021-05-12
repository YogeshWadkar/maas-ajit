import { Component } from "@angular/core";

import Chart from "chart.js";

import { OnInit } from "@angular/core";
import { DashboardService } from "../../services/dashboard.service";
import * as moment from "moment";
import { UserService } from "../../services/user.service";
import { GlobalCfgService } from "../../services/globalcfg.service";

@Component({
  selector: "tt-contribution-report",
  templateUrl: "./contribution-report.component.html",
  styleUrls: ["./contribution-report.component.css"]
})
export class ContributionReportComponent implements OnInit {
  title = "Contribution Report";
  dateRange = "7days";
  filteredData = [];

  dateRangeTxt = {
    "7days": "Last 7 Days",
    "2weeks": "Last 2 Weeks",
    "1month": "Last 1 Month",
    "6months": "Last 6 Months",
    "12months": "Last 12 Months"
  };

  columns = {
    "7days": [
      // { name: 'date', displayName: 'Date', type: 'date', format: 'MM/DD/YYYY' },
      {
        name: "user.userDetail.avatarUrl",
        displayName: "",
        type: "image",
        style: "width: 78px; border-radius:39px;"
      },
      { name: "user.fullName", displayName: "Mentor", actionable: true },
      { name: "hoursContributed", displayName: "Hrs Contributed" },
      {
        name: "percentageContribution",
        displayName: "Contribution(%)",
        type: "widget",
        widget: { type: "progress" }
      }
    ],
    "2weeks": [
      // { name: 'date', displayName: 'Date', type: 'date', format: 'MM/DD/YYYY' },
      {
        name: "user.userDetail.avatarUrl",
        displayName: "",
        type: "image",
        style: "width: 78px; border-radius:39px;"
      },
      { name: "user.fullName", displayName: "Mentor", actionable: true },
      { name: "hoursContributed", displayName: "Hrs Contributed" },
      {
        name: "percentageContribution",
        displayName: "Contribution(%)",
        type: "widget",
        widget: { type: "progress" }
      }
    ],
    "1month": [
      // { name: 'presentationDt', displayName: 'Week' },
      {
        name: "user.userDetail.avatarUrl",
        displayName: "",
        type: "image",
        style: "width: 78px; border-radius:39px;"
      },
      { name: "user.fullName", displayName: "Mentor", actionable: true },
      { name: "hoursContributed", displayName: "Hrs Contributed" },
      {
        name: "percentageContribution",
        displayName: "Contribution(%)",
        type: "widget",
        widget: { type: "progress" }
      }
    ],
    "6months": [
      // { name: 'presentationDt', displayName: 'Month' },
      {
        name: "user.userDetail.avatarUrl",
        displayName: "",
        type: "image",
        style: "width: 78px; border-radius:39px;"
      },
      { name: "user.fullName", displayName: "Mentor", actionable: true },
      { name: "hoursContributed", displayName: "Hrs Contributed" },
      {
        name: "percentageContribution",
        displayName: "Contribution(%)",
        type: "widget",
        widget: { type: "progress" }
      }
    ],
    "12months": [
      // { name: 'presentationDt', displayName: 'Month' },
      {
        name: "user.userDetail.avatarUrl",
        displayName: "",
        type: "image",
        style: "width: 78px; border-radius:39px;"
      },
      { name: "user.fullName", displayName: "Mentor", actionable: true },
      { name: "hoursContributed", displayName: "Hrs Contributed" },
      {
        name: "percentageContribution",
        displayName: "Contribution(%)",
        type: "widget",
        widget: { type: "progress" }
      }
    ]
  };

  data: any[];
  totalHours: any;
  totalMentors: any;
  mentors: any[];
  selectedMentor = "all";
  companyId: any;
  subscriptions: any = [];

  constructor(
    private dashboardService: DashboardService,
    private userService: UserService,
    private globalCfgService: GlobalCfgService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.globalCfgService.userFetchedValue$.subscribe(() => {
        this.companyId = this.globalCfgService.getFullUserObj().companyId;

        this.loadMentors();
        this.loadContributionReport();
      })
    );
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onSelectionChange() {
    this.loadContributionReport();
  }

  loadMentors() {
    this.userService.getCompanyMentors(this.companyId).subscribe(
      (response: any[]) => {
        this.mentors = response['data'];
      },
      error => {
        console.log("Service error: ", error);
      }
    );
  }

  loadContributionReport() {
    var fromDtm, toDtm, presentation;
    if (this.dateRange == "7days") {
      fromDtm = moment()
        .subtract(7, "days")
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toDate();
      toDtm = moment().toDate();
      presentation = "date";
    }

    if (this.dateRange == "2weeks") {
      fromDtm = moment()
        .subtract(14, "days")
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toDate();
      toDtm = moment().toDate();
      presentation = "date";
    }

    if (this.dateRange == "1month") {
      fromDtm = moment()
        .subtract(1, "month")
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toDate();
      toDtm = moment().toDate();
      presentation = "week";
    }

    if (this.dateRange == "6months") {
      fromDtm = moment()
        .subtract(6, "months")
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toDate();
      toDtm = moment().toDate();
      presentation = "month";
    }

    if (this.dateRange == "12months") {
      fromDtm = moment()
        .subtract(12, "months")
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toDate();
      toDtm = moment().toDate();
      presentation = "month";
    }

    this.dashboardService
      .getContributionReport(
        this.companyId,
        fromDtm,
        toDtm,
        presentation,
        this.selectedMentor
      )
      .subscribe(
        response => {
          this.data = response["result"]["contributions"];
          this.totalHours = response["result"]["totalHours"].toFixed(2);
          this.totalMentors = response["result"]["totalMentors"];

          var ctx3 = "availabilityVsAllocationChart";
          var myLineChart = new Chart(ctx3, {
            type: "line",
            data: {
              labels: response["result"]["hours"]["dimension"],
              datasets: [
                {
                  label: "Spent Hours",
                  // backgroundColor: 'rgba(54, 162, 235, 1)',
                  // borderColor: 'rgba(54, 162, 235, 1)',
                  backgroundColor: "rgba(240, 107, 78, 1)",
                  borderColor: "rgba(240, 107, 78, 1)",
                  data: response["result"]["hours"]["facts"],
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
}
