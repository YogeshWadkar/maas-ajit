import { Component } from "@angular/core";

import { OnInit, ViewChild } from "@angular/core";
import { AssessmentService } from "../../services/assessment.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { MatYearView, MatDialog } from "@angular/material";
import { ViewOnlyProfileComponent } from "../viewonly-profile/viewonly-profile.component";

@Component({
  selector: "tt-cs-assessment",
  templateUrl: "./cs-assessment.component.html",
  styleUrls: ["./cs-assessment.component.css"]
})
export class CSAssessmentComponent implements OnInit {
  data: any[] = [];
  columns = [
    { name: "seekerUser.firstName", displayName: "Seeker", actionable: true },
    { name: "skill.name", displayName: "Skill" },
    {
      name: "rating",
      displayName: "Your Rating",
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
    // this.loadEndorsements();
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
