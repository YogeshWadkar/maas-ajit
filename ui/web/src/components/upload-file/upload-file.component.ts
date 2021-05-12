import { Component, Input, Inject, Output, EventEmitter } from "@angular/core";

import { OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

import { environment } from "../../environments/environment";

import { FileUploader } from "ng2-file-upload";
import { UserService } from "../../services/user.service";
import { FileUploadService } from "../../services/file-upload.service";
import { MessageService } from "../../services/message.service";

@Component({
  selector: "tt-upload-file",
  templateUrl: "./upload-file.component.html",
  styleUrls: ["./upload-file.component.css"]
})
export class UploadFileComponent implements OnInit {
  attachment: any;
  uploader: FileUploader;

  @Input()
  container: string;

  @Input()
  icon: string = 'attach_file';

  @Input()
  label: string = 'Select a file';

  @Input()
  cmpId: string = 'file-field-123445';

  @Output()
  uploaded: any = new EventEmitter();

  constructor(
    private userService: UserService,
    private msgService: MessageService,
    private fuService: FileUploadService
  ) {}

  ngOnInit() {
    this.uploader = this.fuService.getUploader(this.container);
  }

  private onFileSelected(e) {
    console.log("File selected", arguments, e);

    if (e.length == 0) {
      return;
    }

    this.msgService.showSuccess("Uploading...");

    this.uploader.response.subscribe(
      response => {
        console.log("File uploaded:", response, JSON.parse(response));

        this.msgService.showSuccess("File uploaded successfully");

        var file = JSON.parse(response)["result"]["files"]["file"][0];
        this.label = file.originalFilename;
        this.uploaded.emit(file);
      },
      error => {
        console.log("File upload error:", error);
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
