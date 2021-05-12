import { Component } from "@angular/core";

import { OnInit } from "@angular/core";
import { ConfirmationDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { FormDialogComponent } from "../form-dialog/form-dialog.component";
import { FieldGeneratorService } from "../../services/field-generator.service";
import { SkillService } from "../../services/skill.service";
import { MatDialog } from "@angular/material";
import { FormBase } from "../dynamic-form/form-base";
import { CalendarService } from "../../services/calendar.service";
import { MessageService } from "../../services/message.service";
import { GlobalCfgService } from "../../services/globalcfg.service";

@Component({
  selector: "tt-holidays-leaves",
  templateUrl: "./holidays-leaves.component.html",
  styleUrls: ["./holidays-leaves.component.css"]
})
export class HolidaysLeavesComponent implements OnInit {
  title = "My Leaves";
  dialogWidth = "250px";
  data: any = [];
  columns = [
    {
      name: "date",
      displayName: "Leave Date",
      required: true,
      startAt: new Date(),
      type: "date",
      format: "MM/DD/YYYY"
    },
    { name: "detail", displayName: "Leave Detail", required: true },
    {
      name: "isHoliday",
      displayName: "Is Holiday?",
      required: true,
      type: "boolean"
    },
    { name: "actions", displayName: "Actions", type: "actions" }
  ];

  fields: FormBase<any>[];
  count: any;
  subscriptions: any = [];
  page: any;
  public isDone: boolean;

  constructor(
    private dialog: MatDialog,
    private skillService: SkillService,
    private calendarService: CalendarService,
    private fgService: FieldGeneratorService,
    private msgService: MessageService,
    private globalCfgService: GlobalCfgService
  ) {}

  private load(page?) {
    this.calendarService.getLeaves(page).subscribe(
      response => {
        let arr: any = response["data"];
        this.count = response["count"];

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
    this.subscriptions.push(
      this.globalCfgService.userFetchedValue$.subscribe(() => {
        this.load();
      })
    );
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  add(): void {
    this.fields = this.fgService.getFields(this.columns, null);
    const dialogRef = this.dialog.open(FormDialogComponent, {
      width: this.dialogWidth,
      data: { title: "New " + this.title, fields: this.fields }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed", result);
      this.calendarService
        .addLeave({
          date: result.date,
          detail: result.detail,
          isHoliday: result.isHoliday == null ? false : result.isHoliday,
          userId: this.globalCfgService.getUserId()
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

          if (result) {
            this.calendarService
              .updateLeave({
                id: event.record.id,
                date: result.date,
                detail: result.detail,
                isHoliday:
                  result.isHoliday == null
                    ? false
                    : result.isHoliday
                    ? true
                    : result.isHoliday,
                userId: this.globalCfgService.getUserId()
              })
              .subscribe(
                response => {
                  console.log("Updated!");
                  this.msgService.showSuccess("Record has been updated");
                  this.load(this.page);
                },
                error => {
                  console.log("Failed to update!", error);
                }
              );
          }
        });
        break;
      case "delete":
        console.log("Delete record");
        const cnfmdialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: "450px",
          data: {
            title: "Delete " + this.title,
            message:
              "Are you sure you want to delete " + event.record.detail + "?"
          }
        });
        cnfmdialogRef.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          if (result === "yes") {
            this.calendarService.deleteLeave(event.record.id).subscribe(
              response => {
                console.log("Deleted!");
                this.msgService.showSuccess("Record has been deleted");
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
