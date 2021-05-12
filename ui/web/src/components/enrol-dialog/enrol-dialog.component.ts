import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { GlobalCfgService } from '../../services/globalcfg.service';

@Component({
  selector: "tt-enrol-dialog",
  templateUrl: "./enrol-dialog.component.html",
  styleUrls: ["./enrol-dialog.component.css"]
})
export class EnrolDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<EnrolDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private globalCfgService: GlobalCfgService
  ) {}

  ngOnInit() {}

  cancel() {
    this.dialogRef.close();
  }

  confirm(requestForm) {
    this.dialogRef.close(requestForm.getValues());
  }
}

export interface DialogData {
  title: string;
  program: any;
  formMetaData: any;
  requestData: any;
  readOnly: boolean;
}
