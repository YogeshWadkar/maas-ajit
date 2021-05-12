import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { SettingService } from "../../services/setting.service";
import { MatDialog } from "@angular/material";
import { FormDialogComponent } from "../form-dialog/form-dialog.component";
import { FormBase } from "../dynamic-form/form-base";
import { FieldGeneratorService } from "../../services/field-generator.service";
import { ConfirmationDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { MessageService } from "../../services/message.service";

import clonedeep from "lodash.clonedeep";
import { Utils } from "../../services/utils";
import { GlobalCfgService } from '../../services/globalcfg.service';
var moment = require("moment");

@Component({
  selector: "tt-system-configuration",
  templateUrl: "./system-configuration.component.html",
  styleUrls: ["./system-configuration.component.css"]
})
export class SystemConfigurationComponent implements OnInit {
  title: string = "System Configuration";
  dialogWidth = "450px";

  data: any = [];
  columns = [
    { name: "name", displayName: "Config Key", required: true },
    { name: "value", displayName: "Config Value", required: true },
    { name: "description", displayName: "Description", required: true },
    { name: "actions", displayName: "Actions", type: "actions" }
  ];

  fields: FormBase<any>[];
  field: any;
  totalCount: any;
  //isReadOnly: boolean = true;
  form: FormGroup;
  currentCategory = {};
  page: any;

  constructor(
    private dialog: MatDialog,
    private fgService: FieldGeneratorService,
    private settingService: SettingService,
    private msgService: MessageService,
    private utils: Utils,
    private globalCfgService: GlobalCfgService
  ) {}

  private load(page?) {
    this.settingService.getSettings(page).subscribe(
      response => {
        let arr: any = response["data"];
        this.totalCount = response["count"];

        arr.forEach(element => {
          element["actions"] = [
            { name: "edit", tip: "Edit" }
            // { name: "delete", tip: "Delete" }
          ];

          if (element['name'] == "default_slot_duration") {
            element['actions'].push({name: 'double_arrow', tip: 'Generate slots'});
          }
        });

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

  private add(): void {
    this.fields = this.fgService.getFields(this.columns, null);
    const dialogRef = this.dialog.open(FormDialogComponent, {
      width: this.dialogWidth,
      data: { title: "New " + this.title, fields: this.fields }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed", result);
      this.settingService
        .createSetting({
          name: result.name,
          value: result.value,
          description: result.description
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
        // this.fields = this.fgService.getFields(this.columns, event.record);
        var clonedColumns = clonedeep(this.columns);
        var nameCol = this.utils.getObject("name", "name", clonedColumns);
        nameCol["disabled"] = true;

        this.fields = this.fgService.getFields(clonedColumns, event.record);
        const dialogRef = this.dialog.open(FormDialogComponent, {
          width: this.dialogWidth,
          data: {
            title: "Edit " + this.title,
            fields: this.fields
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          if (!result) {
            return;
          }
          this.settingService
            .updatedSetting({
              id: event.record.id,
              name: result.name,
              value: result.value,
              description: result.description
            })
            .subscribe(
              response => {
                console.log("Updated!");
                this.msgService.showSuccess("Configuration has been updated");
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
          width: this.dialogWidth,
          data: {
            title: "Delete " + this.title,
            message:
              "Are you sure you want to delete " + event.record.name + "?"
          }
        });
        cnfmdialogRef.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          if (result === "yes") {
            this.settingService.deleteSetting(event.record.id).subscribe(
              response => {
                console.log("Deleted!");
                this.msgService.showSuccess("Configuration has been deleted");
                this.load(this.page);
              },
              error => {
                console.log("Failed to delete!", error);
              }
            );
          }
        });
        break;

      case 'double_arrow':
          var daywiseSlots = {};

          debugger;

          var dfltSlotDuration = this.globalCfgService.getSettingValue('default_slot_duration');
          var gapBetweenMeetings = this.globalCfgService.getSettingValue('gap_between_meetings');

          var slotDuration = parseInt(dfltSlotDuration);
          gapBetweenMeetings = parseInt(gapBetweenMeetings); //in minutes
      
          var numSlots = Math.floor((24 * 60) / (slotDuration + gapBetweenMeetings));
      
          var now = moment();
          now.hour(0)
            .minute(0)
            .second(0)
            .millisecond(0);
      
          var count = 0;
          var recs = [];
      
          for (var i = 0; i < numSlots; i++) {
            var fromTm = now.toDate();
            var toTm = now.add(slotDuration, "m").toDate();
      
            recs.push({
              fromTm: fromTm,
              toTm: toTm,
              duration: slotDuration
            });
            ++count;
            now = now.add(gapBetweenMeetings, "m");
          }

          this.settingService.generateSlots(recs).subscribe(
            () => this.msgService.showSuccess("Slots generated successfully!")
          );
      
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
