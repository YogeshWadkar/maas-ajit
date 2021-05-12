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
  selector: "tt-skill",
  templateUrl: "./skill.component.html",
  styleUrls: ["./skill.component.css"]
})
export class SkillComponent implements OnInit {
  title = "Skill";
  data: any = [];
  dialogWidth = "250px";
  totalCount: any;
  page: any;

  columns = [
    { name: "name", displayName: "Skill Name", required: true },
    {
      name: "category",
      dataField: "category.name",
      displayName: "Category Name",
      required: true,
      type: "selection"
    },
    { name: "actions", displayName: "Actions", type: "actions" }
  ];

  fields: FormBase<any>[];
  categories: any[] = [];

  constructor(
    private dialog: MatDialog,
    private skillService: SkillService,
    private fgService: FieldGeneratorService,
    private msgService: MessageService
  ) {
    this.getCategories();
  }

  private load(page?) {
    this.skillService.getPageWiseSkills(page).subscribe(
      response => {
        let arr: any = response["data"];

        arr.forEach(element => {
          element["actions"] = [
            { name: "edit", tip: "Edit" },
            { name: "delete", tip: "Delete" }
          ];
        });
        this.totalCount = response["count"];
        this.data = arr;
      },
      error => {
        console.log(error);
        console.log("Service calls failed!");
      }
    );
  }
  ngOnInit() {
    this.load();
  }

  private addSkill(): void {
    this.fields = this.fgService.getFields(this.columns, null);

    const dialogRef = this.dialog.open(FormDialogComponent, {
      width: this.dialogWidth,
      data: { title: "New " + this.title, fields: this.fields }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed", result);
      this.skillService
        .createSkill({
          name: result.name,
          categoryId: result.category
        })
        .subscribe(
          response => {
            console.log("Created!");
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
        console.log("CATEGORIES: ", this.categories);
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
            .updateSkill({
              id: event.record.id,
              name: result.name,
              categoryId: result.category
            })
            .subscribe(
              response => {
                console.log("Skill updated!");
                this.msgService.showSuccess("Skill has been updated");
                this.load(this.page);
              },
              error => {
                console.log("Failed to update skill!", error);
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
            this.skillService.deleteSkill(event.record.id).subscribe(
              response => {
                console.log("Skill deleted!");
                this.msgService.showSuccess("Skill has been deleted");
                this.load(this.page);
              },
              error => {
                console.log("Failed to delete skill!", error);
              }
            );
          }
        });
        break;
      default:
        console.log("Unhandled action: ", event.actionName);
    }
  }

  private getCategories() {
    this.skillService.getSkillCategories().subscribe(
      response => {
        let arr: any = response["data"];

        arr.forEach(element => {
          this.categories.push({
            id: element.id,
            value: element.name
          });
        });
        this.columns[1]["options"] = this.categories;
      },
      error => {
        console.log(error);
        console.log("Service call failed!");
      }
    );
  }

  private onPageChanged(page) {
    this.load(page);
    this.page = page;
  }
}
