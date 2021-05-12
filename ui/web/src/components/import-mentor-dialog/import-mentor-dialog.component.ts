import { Component, Input, Inject } from "@angular/core";

import { OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

import { environment } from "../../environments/environment";

import { FileUploader } from "ng2-file-upload";
import { UserService } from "../../services/user.service";

@Component({
  selector: "tt-import-mentor-dialog",
  templateUrl: "./import-mentor-dialog.component.html",
  styleUrls: ["./import-mentor-dialog.component.css"]
})
export class ImportMentorComponent implements OnInit {
  isFileUploaded = false;
  filedsMapToSubmit = {};
  error: any;
  success: any;

  public uploader: FileUploader = new FileUploader({
    url: environment.apiurl + "/FileAttachments/importfiles/upload",
    autoUpload: true
  });
  fieldsMap: any;
  attachment: any;
  stats: any;

  constructor(
    private userService: UserService,
    private dialogRef: MatDialogRef<ImportMentorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImportMentorDialogData
  ) {}

  ngOnInit() {}

  cancel() {
    this.dialogRef.close({ action: "no" });
  }

  confirm() {
    this.userService
      .importMentors(
        this.attachment,
        this.filedsMapToSubmit,
        this.data.companyId
      )
      .subscribe(
        response => {
          this.error = null;
          this.success = true;
          // this.stats = response['result']['count'];
          this.dialogRef.close({ action: "yes" });
        },
        error => {
          console.log("Service error:", error);
          this.error = error;
        }
      );
  }

  private onFileSelected() {
    console.log("File selected", arguments);
    this.uploader.response.subscribe(
      response => {
        console.log("File uploaded:", response, JSON.parse(response));
        this.isFileUploaded = true;

        this.attachment = JSON.parse(response)["result"]["files"]["file"][0];
        this.userService
          .importMentors(this.attachment, null, this.data.companyId)
          .subscribe(
            response => {
              this.fieldsMap = response["result"];
              for (var key in this.fieldsMap) {
                var srcFlds = this.fieldsMap.sourceFields;
                var trgtFlds = this.fieldsMap.targetFields;

                trgtFlds.forEach(element => {
                  this.filedsMapToSubmit[element.name] = srcFlds[0].name;
                });
              }
            },
            error => {
              console.log("Service error:", error);
              this.error = error;
            }
          );
      },
      error => {
        console.log("File upload error:", error);
        this.isFileUploaded = false;
      }
    );
  }

  private handleSelectionChange(event, sourceFld) {
    console.log(event, sourceFld);

    this.filedsMapToSubmit[event.value] = sourceFld.name;
  }
}

export interface ImportMentorDialogData {
  companyId: any;
}
