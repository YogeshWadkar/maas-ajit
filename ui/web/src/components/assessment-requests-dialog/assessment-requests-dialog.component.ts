import { Component, Inject } from "@angular/core";

import { OnInit } from "@angular/core";

import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { MessageService } from "../../services/message.service";

@Component({
  selector: "tt-assessment-requests-dialog",
  templateUrl: "./assessment-requests-dialog.component.html",
  styleUrls: ["./assessment-requests-dialog.component.css"]
})
export class AssessmentRequestsDialogComponent implements OnInit {
  title = "Assessment Requests";

  
  constructor(
    private dialogRef: MatDialogRef<AssessmentRequestsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    
  }

  ngOnDestroy() {
  }

  
}