import { Component, Input, Inject } from "@angular/core";
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  selector: "tt-confirm-dialog",
  templateUrl: "./confirm-dialog.component.html",
  styleUrls: ["./confirm-dialog.component.css"]
})
export class ConfirmationDialogComponent implements OnInit {
  defaultTitle: string = "Confirm";
  isFormValid: boolean = true;
  defaultSaveBtnTxt: string = "Yes";
  formStatus: string = 'INVALID';

  constructor(
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  public form = {
    valid: false
  };
  

  ngOnInit() {}

  cancel() {
    this.dialogRef.close("no");
  }
   confirm() {
    this.dialogRef.close("yes");}


  close(fields, values) {
    var retData = {};
    fields.forEach(element => {
      if(typeof(values[element.key]) == "boolean"){
        retData[element.key] = values[element.key];
      } else {
        retData[element.key] = values[element.key] || element.value;
      }      
    });
      this.dialogRef.close(retData);
  }
  statusChanged(status) {
    this.formStatus = status;
  }

}



export interface DialogData {
  title: string;
  message: string;
  note: string;
  saveBtnTxt: string;
  fields: any[];
}
