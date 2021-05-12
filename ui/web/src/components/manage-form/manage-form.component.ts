import { Component, OnInit } from "@angular/core";
import { FormBase } from "../dynamic-form/form-base";
import { MatDialog } from "@angular/material";
import { ConfirmationDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { MessageService } from "../../services/message.service";
import { RequestFormService } from '../../services/request-form.service';
import { RequestFormComponent } from '../request-form/request-form.component';
import { GlobalCfgService } from '../../services/globalcfg.service';
import { Utils } from '../../services/utils';

@Component({
  selector: "tt-manage-form",
  templateUrl: "./manage-form.component.html",
  styleUrls: ["./manage-form.component.css"]
})
export class ManageFormComponent implements OnInit {
  title = "Form";
  dialogWidth = "500px";
  data: any[];
  totalCount: any;
  page: any;
  fields: FormBase<any>[];

  columns: any[] = [
    {
      name: "name",
      displayName: "Name",
      required: true
    },
    {
      name: "createdon",
      displayName: "Created On",
      type: "date",
      format: "MM/DD/YYYY h:mm A",
      required: false,
      editable: false
    },
    {
      name: "modifiedon",
      displayName: "Last Updated On",
      type: "date",
      format: "MM/DD/YYYY h:mm A",
      required: false,
      editable: false
    },
    { name: "actions", displayName: "Actions", editable: false }
  ];

  statuses: any;

  draftStatusId: number;
  publisedStatusId: number;

  constructor(
    private dialog: MatDialog,
    private formService: RequestFormService,
    private msgService: MessageService,
    private globalCfgService: GlobalCfgService,
    private utils: Utils
  ) {}

  ngOnInit() {
    this.loadStatuses();
  }

  private loadStatuses() {
    this.formService.getStatuses().subscribe(
      (response)=> {
        this.statuses = response['data'];
        this.statuses.forEach(element => {
          if (element.name == 'draft') {
            this.draftStatusId = element.id;
          }

          if (element.name == 'published') {
            this.publisedStatusId = element.id;
          }
        });
        this.load();
      }
    );
  }

  private load(page?) {
    this.formService.get(this.globalCfgService.getFullUserObj().companyId, page).subscribe((response: any) => {
      var arr = response["data"];
      arr.forEach(item => {
        item.actions = [];
        if (item.statusId === this.draftStatusId) {
          item.actions = [
            { name: "edit", tip: "Edit" },
            { name: "delete", tip: "Delete" },
            { name: "publish", tip: "Publish" }
          ];
        }

        if (item.statusId === this.publisedStatusId) {
          item.actions = [
            { name: "info", tip: "View form" },
            { name: "undo", tip: "Un-publish" }
          ];
        }
      });
      this.data = arr;
      this.totalCount = response["count"];
    });
  }

  private add(): void {
    console.log("form added");

    const dialogRef = this.dialog.open(RequestFormComponent, {
        width: "2400px",
        data: { title: "New " + this.title }
    });

    dialogRef.afterClosed().subscribe(result => {
        console.log("The dialog was closed", result);
        if (result) {
            var u = this.globalCfgService.getFullUserObj();
            var rec = {
                name: result.name,
                config: JSON.stringify(result),
                userId: u.id,
                companyId: u.companyId
            };

            this.formService.add(rec).subscribe(
                ()=> {
                    this.msgService.showSuccess('Form added successfully!');
                    this.load(this.page);
                }
            );
        }
    });
  }

  private onActionClicked(event) {
    console.log("onActionClicked: ", event);
    var rec = event.record;
    switch (event.actionName.name) {
      case "edit":
        const dialogRef = this.dialog.open(RequestFormComponent, {
          width: "2400px",
          data: {
            title: "Edit " + this.title,
            model: JSON.parse(rec.config)
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
              this.formService.update(rec.id, {
                  name: result.name,
                  config: JSON.stringify(result),
                  modifiedon: new Date(),
              }).subscribe(
                  ()=> {
                      this.msgService.showSuccess('Form updated successfully!');
                      this.load(this.page);
                  }
              );
          }
        });
        break;
        case "info":
            const dialogRef1 = this.dialog.open(RequestFormComponent, {
              width: "640px",
              data: {
                title: "View " + this.title,
                model: JSON.parse(rec.config),
                readOnly: true
              }
            });
            break;
      case "delete":
        const cnfmdialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: "450px",
          data: {
            title: "Delete " + this.title,
            message:
              "Are you sure you want to delete " + rec.name + "?"
          }
        });
        cnfmdialogRef.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          if (result === "yes") {
            this.formService.delete(rec.id).subscribe(
              ()=> {
                this.msgService.showSuccess('Form deleted successfully!');
                this.load(this.page);
              }
            );
          }
        });
        break;
      case "publish":
        this.formService.updateStatus(rec.id, this.publisedStatusId).subscribe(
          ()=> {
            this.msgService.showSuccess("Form published successfully!");
            this.load(this.page);
          }
        );

        break;
      case "undo":
        this.formService.updateStatus(rec.id, this.draftStatusId).subscribe(
          ()=> {
            this.msgService.showSuccess("Form moved to draft successfully!");
            this.load(this.page);
          }
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
