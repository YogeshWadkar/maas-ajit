import { Component, OnInit } from "@angular/core";
import { FormBase } from "../dynamic-form/form-base";
import { MatDialog } from "@angular/material";
import { ConfirmationDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { AddProgramDialogComponent } from "../add-program-dialog/add-program-dialog.component";
import { ProgramService } from "../../services/program.service";
import { MessageService } from "../../services/message.service";

import { GlobalCfgService } from 'src/services/globalcfg.service';
import { FieldGeneratorService } from "src/services/field-generator.service";
import { ProgramViewProfileComponent } from "../programview-profile/programview-profile.component";
import { FormDialogComponent } from '../form-dialog/form-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { RequestFormService } from '../../services/request-form.service';

@Component({
  selector: "tt-manage-programs",
  templateUrl: "./manage-programs.component.html",
  styleUrls: ["./manage-programs.component.css"]
})
export class ManageProgramsComponent implements OnInit {
  title = "Program";
  dialogWidth = "1200px";
  data: any[];
  totalCount: any;
  page: any;
  fields: FormBase<any>[];
  formPublishedStatusId: number;

  columns = {
    'admin': [{
      name: "company.name",
      displayName: "Company",
    },
    {
      name: "name",
      displayName: "Program Name",
    },
    {
      name: "enrolByDt",
      displayName: "Enrol By",
      type: "date",
      format: "MM/DD/YYYY",
    },
    {
      name: "startDt",
      displayName: "Start Date",
      type: "date",
      format: "MM/DD/YYYY",
    },
    {
      name: "endDt",
      displayName: "End Date",
      type: "date",
      format: "MM/DD/YYYY",
    },
    {
      name: "status.description",
      displayName: "Status",
    },
    { name: "actions", displayName: "Actions", editable: false }
    ],
    'sponsor': [{
      name: "name",
      displayName: "Program Name",
      // actionable: true,
      required: true
    },
    {
      name: "enrolByDt",
      displayName: "Enrol By",
      type: "date",
      format: "MM/DD/YYYY",
    },
    {
      name: "startDt",
      displayName: "Start Date",
      type: "date",
      format: "MM/DD/YYYY",
    },
    {
      name: "endDt",
      displayName: "End Date",
      type: "date",
      format: "MM/DD/YYYY",
    },
    {
      name: "status.description",
      displayName: "Status",
    },
    { name: "actions", displayName: "Actions", editable: false }
    ]
  };

  statuses: any;
  addProgramfields: any[];
  draftStatusId: number;
  publisedStatusId: number;
  completedStatusId: number;
  unpublishStatusId: number;
  cancelledStatusId: number;

  subscriptions: any = [];

  tokenAllocationFields = [
    { name: "numTokensToMentors", displayName: "Tokens to Mentor", required: true },
    { name: "numTokensToParticipants", displayName: "Tokens to Participant", required: true }
  ];
  role: any;

  constructor(
    private dialog: MatDialog,
    private fgService: FieldGeneratorService,
    private programService: ProgramService,
    private msgService: MessageService,
    private globalCfgService: GlobalCfgService,
    private route: ActivatedRoute,
    private formService: RequestFormService
  ) { }

  ngOnInit() {
    this.subscriptions.push(this.globalCfgService.userFetchedValue$.subscribe(
      () => {
        this.loadProgramStatuses();
      }
    ));

    this.subscriptions.push(
      this.route.url.subscribe(url => {
        console.log("URL: ", url, url.length, url.values().next().value.path);
        //always the first part is role
        this.role = url.values().next().value.path;
      })
    );
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private loadFormStatuses() {
    this.formService.getStatuses().subscribe(
      (response) => {
        this.statuses = response['data'];
        this.statuses.forEach(element => {
          if (element.name == 'published') {
            this.formPublishedStatusId = element.id;
          }
        });
      }
    );
  }

  private loadProgramStatuses() {
    this.programService.getStatus().subscribe(
      (response) => {
        this.statuses = response['data'];
        this.statuses.forEach(element => {
          if (element.name == 'draft') {
            this.draftStatusId = element.id;
            this.unpublishStatusId = element.id;
          }

          if (element.name == 'published') {
            this.publisedStatusId = element.id;
          }
          if (element.name == 'completed') {
            this.completedStatusId = element.id;
          }

          if (element.name == 'cancelled') {
            this.cancelledStatusId = element.id;
          }
        });
        this.loadPrograms();
      }
    );
  }

  private loadPrograms(page?) {
    var companyId;
    if (this.role != 'admin') {
      companyId = this.globalCfgService.getFullUserObj().companyId;
    }
    this.programService.get(companyId, page).subscribe((response: any) => {
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
            { name: "info", tip: "View detail" },
            { name: "undo", tip: "Un-publish" },
            { name: "cancel", tip: "Cancel" },
            { name: "done_all", tip: "Mark as complete" }
          ];
        }

        if (item.statusId === this.completedStatusId) {
          item.actions = [{ name: "info", tip: "View detail" }];
          if (!item.hasTokenAlloted) {
            item.actions.push({ name: "card_giftcard", tip: "Allocate token" });
          }

          if (!item.hasCertificateIssued) {
            item.actions.push({ name: "card_membership", tip: "Issue certificate" });
          }
        }
      });
      this.data = arr;
      this.totalCount = response["count"];
    });
  }


  private addProgram(): void {
    const dialogRef = this.dialog.open(AddProgramDialogComponent, {
      width: this.dialogWidth,
      data: { title: "New " + this.title, formStatusId: this.formPublishedStatusId, data: { companyId: this.globalCfgService.getFullUserObj().companyId } }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed", result);

      if (result) {

        var u = this.globalCfgService.getFullUserObj();
        var rec = {
          name: result.name,
          description: result.description,
          enrolByDt: result.enrolByDt,
          startDt: result.startDt,
          endDt: result.endDt,
          text: result.text,
          imgPath: result.imgPath,
          bannerImgPath: result.bannerImgPath,
          criteria: result.criteria,
          formId: result.selectedForm,
          mentors: result.mentors,
          tncLink: result.tncLink,
          userId: u.id,
          companyId: u.companyId
        };

        this.programService.add(rec).subscribe(() => {
          this.msgService.showSuccess("Program added successfully!");
          this.loadPrograms(this.page);
        });
      }
    });
  }

  private onActionClicked(event) {
    
    console.log("onActionClicked: ", event);
    var rec = event.record;
    switch (event.actionName.name) {

      case "edit":
        const dialogRef = this.dialog.open(AddProgramDialogComponent, {
          width: this.dialogWidth,
          data: {
            title: "Edit " + this.title,
            data: {
              name: rec.name,
              description: rec.description,
              enrolByDt: rec.enrolByDt,
              startDt: rec.startDt,
              endDt: rec.endDt,
              text: rec.text,
              imgPath: rec.imgPath,
              bannerImgPath: rec.bannerImgPath,
              criteria: rec.criteria,
              selectedForm: rec.formId,
              tncLink: rec.tncLink,
              publicUrl: rec.publicUrl,
              mentorsAllocated: rec.mentors
            }
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            var rec = {
              name: result.name,
              description: result.description,
              enrolByDt: result.enrolByDt,
              startDt: result.startDt,
              endDt: result.endDt,
              text: result.text,
              imgPath: result.imgPath,
              bannerImgPath: result.bannerImgPath,
              criteria: result.criteria,
              formId: result.selectedForm,
              tncLink: result.tncLink,
              mentorsAllocated: result.mentors
            };
            this.programService.update(event.record.id, rec).subscribe(() => {
              this.msgService.showSuccess("Program updated successfully!");
              this.loadPrograms(this.page);
            });
          }
        });
        break;
      case "info":
        console.log("program View");
        // this.fields = this.fgService.getFields( this.addProgramfields, rec);
        const dialogRef1 = this.dialog.open(AddProgramDialogComponent, {
          width: this.dialogWidth,
          data: {
            title: "View " + this.title,
            // fields: this.fields,
            readOnly: true,
            data: {
              name: rec.name,
              description: rec.description,
              enrolByDt: rec.enrolByDt,
              startDt: rec.startDt,
              endDt: rec.endDt,
              text: rec.text,
              imgPath: rec.imgPath,
              bannerImgPath: rec.bannerImgPath,
              criteria: rec.criteria,
              selectedForm: rec.formId,
              tncLink: rec.tncLink,
              publicUrl: rec.publicUrl,
              mentorsAllocated: rec.mentors,
            }
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
            this.programService.delete(rec.id).subscribe(
              () => {
                this.msgService.showSuccess('Program deleted successfully!');
                this.loadPrograms(this.page);
              }
            );
          }
        });
        break;
      case "cancel":
        this.programService.updateStatus(rec.id, this.cancelledStatusId).subscribe(
          () => {
            this.msgService.showSuccess("Program cancelled successfully!");
            this.loadPrograms(this.page);
          }
        );
        break;
      case "publish":
        this.programService.updateStatus(rec.id, this.publisedStatusId).subscribe(
          () => {
            this.msgService.showSuccess("Program published successfully!");
            this.loadPrograms(this.page);
          }
        );

        break;
      case "undo":
        this.programService.updateStatus(rec.id, this.unpublishStatusId).subscribe(
          () => {
            this.msgService.showSuccess("Program moved to draft successfully!");
            this.loadPrograms(this.page);
          }
        );
        break;
      // case "visiblity":
      //   console.log("view program activities");
      //   break;
      case "done_all":
        this.programService.updateStatus(rec.id, this.completedStatusId).subscribe(
          () => {
            this.msgService.showSuccess("Program completed successfully!");
            this.loadPrograms(this.page);
          }
        );
        break;
      case 'card_membership':
        this.programService.issueCert(rec.id).subscribe(
          () => {
            this.msgService.showSuccess('Certificates have been issued!');
            this.loadPrograms(this.page);
          }
        );
        break;
      case 'card_giftcard':
        var rec = event.record;
        var fields = this.fgService.getFields(this.tokenAllocationFields, null);
        const dialogRef3 = this.dialog.open(FormDialogComponent, {
          width: "450px",
          data: { title: "Allocate Token", fields: fields }
        });

        dialogRef3.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);

          this.programService
            .allocateTokens(rec.id, parseInt(result["numTokensToMentors"]), parseInt(result["numTokensToParticipants"]))
            .subscribe(
              response => {
                this.msgService.showSuccess("Token has been allocated");
                console.log("Tokens allocated!");
                this.loadPrograms(this.page);
              },
              error => {
                console.log("Failed to create!", error);
              }
            );
        });
        break;
      default:
        console.log("Unhandled action: ", event.actionName);
    }
  }


  private onActionableClicked(event) {
    console.log("onActionableClicked:", event);

    var userId;
    userId = event.record.id;
    const dialogRef2 = this.dialog.open(ProgramViewProfileComponent, {
      width: "2400px",
      data: { userId: userId }
    });
  }

  private onPageChanged(page) {
    this.loadPrograms(page);
    this.page = page;
  }
}
