import { Component, Input, Inject } from "@angular/core";

import { OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

import { environment } from "../../environments/environment";

import { FileUploader } from "ng2-file-upload";
import { UserService } from "../../services/user.service";
import { FileUploadService } from "../../services/file-upload.service";
import { MessageService } from "../../services/message.service";

@Component({
  selector: "tt-upload-file-dialog",
  templateUrl: "./upload-file-dialog.component.html",
  styleUrls: ["./upload-file-dialog.component.css"]
})
export class UploadFileDialogComponent implements OnInit {
  attachment: any;
  uploader: FileUploader;

  constructor(
    private userService: UserService,
    private msgService: MessageService,
    private fuService: FileUploadService,
    private dialogRef: MatDialogRef<UploadFileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImportDialogData
  ) {}

  ngOnInit() {
    this.uploader = this.fuService.getUploader("taskfiles");
  }

  private onFileSelected() {
    console.log("File selected", arguments);

    this.msgService.showSuccess("Uploading...");

    this.uploader.response.subscribe(
      response => {
        console.log("File uploaded:", response, JSON.parse(response));

        this.msgService.showSuccess("File uploaded successfully");

        this.dialogRef.close({
          action: "yes",
          attachment: JSON.parse(response)["result"]["files"]["file"][0]
        });
      },
      error => {
        console.log("File upload error:", error);
        this.dialogRef.close({
          action: "no"
        });
        this.msgService.showError("File uploaded failed!");
      }
    );
  }
}

export interface ImportDialogData {
  userId: any;
  taskId: any;
  folder: any;
}
