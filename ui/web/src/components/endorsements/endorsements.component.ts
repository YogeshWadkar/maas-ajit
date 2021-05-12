import { Component } from "@angular/core";

import { OnInit, ViewChild } from "@angular/core";
import { AssessmentService } from "../../services/assessment.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { MatYearView, MatDialog } from "@angular/material";
import { ViewOnlyProfileComponent } from "../viewonly-profile/viewonly-profile.component";

@Component({
  selector: "tt-endorsements",
  templateUrl: "./endorsements.component.html",
  styleUrls: ["./endorsements.component.css"]
})
export class EndorsementsComponent implements OnInit {
  data: any[] = [];
  columns = [
    { name: "skill.name", displayName: "Skill" },
    { name: "mentorUser.fullName", displayName: "Mentor", actionable: true },
    {
      name: "rating",
      displayName: "Rating",
      type: "widget",
      widget: { type: "rating" }
    },
    { name: "comment", displayName: "Your Comment" }
  ];

  constructor(
    private dialog: MatDialog,
    private assessmentService: AssessmentService,
    private globalCfgService: GlobalCfgService
  ) {}

  ngOnInit() {
    this.loadEndorsements();
  }

  private loadEndorsements() {
    this.assessmentService
      .getMentorAssessmentsForUser(this.globalCfgService.getUserId())
      .subscribe(
        (response: any[]) => {
          this.data = response["data"];

          this.data.forEach(item => {
            var mu = item["mentorUser"];
            mu["fullName"] = mu["firstName"] + " " + mu["lastName"];
          });
        },
        error => {
          console.log("Service error: ", error);
        }
      );
  }

  private onActionableClicked(event) {
    console.log("onActionableClicked:", event);

    var userId;
    switch (event.actionName) {
      // case 'seekerUser.fullName':
      //   userId = event.record.seekerUserId;
      //   break;
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
}
