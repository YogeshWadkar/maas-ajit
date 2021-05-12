import { Component, Inject } from "@angular/core";

import { OnInit } from "@angular/core";
import { UserService } from "../../services/user.service";
import { Subject } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { MatDialog } from "@angular/material";
import { ViewOnlyProfileComponent } from "../viewonly-profile/viewonly-profile.component";
import { ImportMentorComponent } from "../import-mentor-dialog/import-mentor-dialog.component";
import { MessageService } from "../../services/message.service";
import { EventBusService } from "../../services/event-bus.service";
import { StartupService } from "../../services/startup.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { SelfAssessmentComponent } from '../self-assessment/self-assessment.component';

@Component({
  selector: "tt-search-guru-dialog",
  templateUrl: "./search-guru-dialog.component.html",
  styleUrls: ["./search-guru-dialog.component.css"]
})
export class SearchGuruDialogComponent implements OnInit {

  searchTxt: string = "";
  levelId: number;
  
  constructor(
    private dialogRef: MatDialogRef<SearchGuruDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData

  ) {

  }

  ngOnInit() {
    
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
  }

  requestAssessment(mentorUserId) {
    this.dialogRef.close({mentorUserId: mentorUserId});
  }

}

export interface DialogData {
  skills: string; //comma separated skill names
  levelId: number;
  role: string;
  requestBtnLabel: string;
}