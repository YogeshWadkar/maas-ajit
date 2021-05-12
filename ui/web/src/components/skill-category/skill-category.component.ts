import { Component } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";

import { OnInit } from "@angular/core";
import { SkillService } from "../../services/skill.service";
import { FormBase } from "../dynamic-form/form-base";
import { FieldGeneratorService } from "../../services/field-generator.service";
import { FormDialogComponent } from "../form-dialog/form-dialog.component";
import { ConfirmationDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { MessageService } from "../../services/message.service";

@Component({
  selector: "tt-skill-category",
  templateUrl: "./skill-category.component.html",
  styleUrls: ["./skill-category.component.css"]
})
export class SkillCategoryComponent implements OnInit {
  title = "Skill Category";
  dialogWidth = "250px";
  data: any = [];
  columns = [
    { name: "name", displayName: "Category Name", required: true },
    { name: "actions", displayName: "Actions", type: "actions" }
  ];

  fields: FormBase<any>[];
  totalCount: any;
  page: any;

  constructor(
    private dialog: MatDialog,
    private skillService: SkillService,
    private fgService: FieldGeneratorService,
    private msgService: MessageService
  ) {}

  private load(page?) {
    this.skillService.getSkillCategories(page).subscribe(
      response => {
        let arr: any = response["data"];
        this.totalCount = response["count"];

        arr.forEach(element => {
          element["actions"] = [
            { name: "edit", tip: "Edit" },
            { name: "delete", tip: "Delete" }
          ];
        });

        this.data = arr;
      },
      error => {
        console.log(error);
        console.log("Login failed!");
      }
    );
  }

  ngOnInit() {
    this.load();
  }

  addCategory(): void {
    this.fields = this.fgService.getFields(this.columns, null);
    const dialogRef = this.dialog.open(FormDialogComponent, {
      width: this.dialogWidth,
      data: { title: "New " + this.title, fields: this.fields }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed", result);
      this.skillService
        .createSkillCategory({
          name: result.name
        })
        .subscribe(
          response => {
            console.log("Created!");
            this.msgService.showSuccess("Skill category has been created");
            this.load(this.page);
          },
          error => {
            console.log("Failed to create!", error);
          }
        );
    });
  }

  private onActionClicked(event) {
    console.log("onActionClicked: ", event);
    switch (event.actionName.name) {
      case "edit":
        this.fields = this.fgService.getFields(this.columns, event.record);
        const dialogRef = this.dialog.open(FormDialogComponent, {
          width: this.dialogWidth,
          data: {
            title: "Edit " + this.title,
            fields: this.fields
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          this.skillService
            .updateSkillCategory({
              id: event.record.id,
              name: result.name
            })
            .subscribe(
              response => {
                console.log("Updated!");
                this.msgService.showSuccess("Skill category has been updated");
                this.load(this.page);
              },
              error => {
                console.log("Failed to update!", error);
              }
            );
        });
        break;
      case "delete":
        console.log("Delete record");
        const cnfmdialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: "450px",
          data: {
            title: "Delete " + this.title,
            message:
              "Are you sure you want to delete " + event.record.name + "?"
          }
        });
        cnfmdialogRef.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          if (result === "yes") {
            this.skillService.deleteSkillCategory(event.record.id).subscribe(
              response => {
                console.log("Deleted!");
                this.msgService.showSuccess("Skill category has been deleted");
                this.load(this.page);
              },
              error => {
                console.log("Failed to delete!", error);
              }
            );
          }
        });
        break;
      default:
        console.log("Unhandled action: ", event.actionName);
    }
  }

  private onPageChanged(page) {
    this.load(page);
    this.page = page;
  }
}
