import { Component, Input, Inject } from "@angular/core";

import { OnInit } from "@angular/core";
import { SkillService } from "../../services/skill.service";
import { FieldGeneratorService } from "../../services/field-generator.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  selector: "tt-form-dialog",
  templateUrl: "./form-dialog.component.html",
  styleUrls: ["./form-dialog.component.css"]
})
export class FormDialogComponent implements OnInit {
  defaultTitle: string = "Form Dialog";
  isFormValid: boolean = true;
  defaultSaveBtnTxt: string = "Save";
  formStatus: string = 'INVALID';

  constructor(
    private dialogRef: MatDialogRef<FormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  public form = {
    valid: false
  };
  
  ngOnInit() {}

  cancel() {
    this.dialogRef.close();
  }

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
  note: string;
  saveBtnTxt: string;
  fields: any[];
  viewOnly: boolean;
}
