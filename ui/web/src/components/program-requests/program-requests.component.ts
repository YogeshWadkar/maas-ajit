import { Component, OnInit } from "@angular/core";
import { FormBase } from "../dynamic-form/form-base";
import { MatDialog } from "@angular/material";
import { FieldGeneratorService } from "src/services/field-generator.service";
import { RequestFormComponent } from "../request-form/request-form.component";
import { ProgramService } from "../../services/program.service";
import { MessageService } from "../../services/message.service";
import { GlobalCfgService } from '../../services/globalcfg.service';
import { Utils } from '../../services/utils';
import { ViewOnlyProfileComponent } from '../viewonly-profile/viewonly-profile.component';
import { AddProgramDialogComponent } from '../add-program-dialog/add-program-dialog.component';
import { EnrolDialogComponent } from '../enrol-dialog/enrol-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import {environment} from '../../environments/environment';

@Component({
  selector: "tt-manage-programs",
  templateUrl: "./program-requests.component.html",
  styleUrls: ["./program-requests.component.css"]
})
export class ProgramsRequestsComponent implements OnInit {
  data: any[];
  totalCount: any;
  page: any;
  fields: FormBase<any>[];

  statuses: any;

  selectedStatus: any = 'all';

  subscriptions: any = [];

  columns = {
    sponsor: [{
      name: "program.name",
      displayName: "Program Name",
      actionable: true
    },
    {
      name: "user.fullName",
      displayName: "Requested By",
      actionable: true
    },
    {
      name: "createdon",
      displayName: "Requested On",
      type: "date",
      format: "MM/DD/YYYY"
    },
    {
      name: "modifiedon",
      displayName: "Last Updated On",
      type: "date",
      format: "MM/DD/YYYY"
    },
    {
      name: "status.description",
      displayName: "Status"
    },
    {
      name: "actions",
      displayName: "Actions"
    }],
    admin: [{
      name: "program.name",
      displayName: "Program Name",
      actionable: true
    },
    {
      name: "user.fullName",
      displayName: "Requested By",
      actionable: true
    },
    {
      name: "createdon",
      displayName: "Requested On",
      type: "date",
      format: "MM/DD/YYYY"
    },
    {
      name: "modifiedon",
      displayName: "Last Updated On",
      type: "date",
      format: "MM/DD/YYYY"
    },
    {
      name: "status.description",
      displayName: "Status"
    },
    {
      name: "actions",
      displayName: "Actions"
    }],
    'career-seeker': [{
      name: "program.name",
      displayName: "Program Name",
      actionable: true
    },
    {
      name: "createdon",
      displayName: "Requested On",
      type: "date",
      format: "MM/DD/YYYY"
    },
    {
      name: "modifiedon",
      displayName: "Last Updated On",
      type: "date",
      format: "MM/DD/YYYY"
    },
    {
      name: "status.description",
      displayName: "Status"
    },
    {
      name: "actions",
      displayName: "Actions"
    }],
    mentor: [{
      name: "program.name",
      displayName: "Program Name",
      actionable: true
    },
    {
      name: "createdon",
      displayName: "Requested On",
      type: "date",
      format: "MM/DD/YYYY"
    },
    {
      name: "modifiedon",
      displayName: "Last Updated On",
      type: "date",
      format: "MM/DD/YYYY"
    },
    {
      name: "status.description",
      displayName: "Status"
    },
    {
      name: "actions",
      displayName: "Actions"
    }]
  };

  pendingApprovalStatusId: number;
  approvedStatusId: number;
  rejectedStatusId: number;

  role: any;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private fgService: FieldGeneratorService,
    private programService: ProgramService,
    private msgService: MessageService,
    private globalCfgService: GlobalCfgService,
    private utils: Utils
  ) { }

  ngOnInit() {
    this.subscriptions.push(this.globalCfgService.userFetchedValue$.subscribe(
      ()=> {
        this.loadStatuses();
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

  private add() {
    const dialogRef = this.dialog.open(RequestFormComponent, {
      width: "2400px",
      data: ""
    });
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  load(page?) {

    var userId, companyId;
    if (this.role != 'admin' && this.role != 'sponsor') {
      userId = this.globalCfgService.getUserId();
    }

    if (this.role == 'sponsor') {
      companyId = this.globalCfgService.getFullUserObj().companyId;
    }

    this.programService.getRequests(companyId, this.selectedStatus, page, userId).subscribe(
      (result)=> {
        var arr = result['data'];
        arr.forEach(element => {
          element.user['fullName'] = element.user['firstName'] + ' ' + element.user['lastName'];

          element['actions'] = [];
          if (this.role == 'sponsor' || this.role == 'admin') {
            if (element.statusId == this.pendingApprovalStatusId) {
              element['actions'] = [
                { name: "done", tip: "Approve" },
                { name: "clear", tip: "Reject" }
              ];
            }
          }
          element['actions'].push({name: 'info', tip: 'View submitted request'});

          if (this.role == 'sponsor' || this.role == 'career-seeker') {
            if (element.program.hasCertificateIssued)
            element['actions'].push({name: 'cloud_download', tip: 'Download your certificate'});
          }
        });

        this.data = arr;
        this.totalCount = result['count'];
      }
    );
  }

  loadStatuses() {
    this.programService.getRequestStatuses().subscribe(
      (result)=> {
        this.statuses = result['data'];

        this.statuses.forEach(item => {
          if (item.name == 'pending_approval') {
            this.pendingApprovalStatusId = item.id;
          }
          if (item.name == 'approved') {
            this.approvedStatusId = item.id;
          }
          if (item.name == 'rejected') {
            this.rejectedStatusId = item.id;
          }
        });
        this.load();
      }
    );
  }

  private onActionClicked(event) {
    console.log("onActionClicked: ", event);
    var rec = event.record;
    switch (event.actionName.name) {
      case "done":
        this.programService.updateRequest(event.record.id, {
          approvedByUserId: this.globalCfgService.getUserId(),
          statusId: this.approvedStatusId
        }).subscribe(() => {
          this.msgService.showSuccess("Request has been approved!");
          this.load(this.page);
        });
        break;
      case "clear":
        this.programService.updateRequest(event.record.id, {
          approvedByUserId: this.globalCfgService.getUserId(),
          statusId: this.rejectedStatusId
        }).subscribe(() => {
          this.msgService.showSuccess("Request has been rejected!");
          this.load(this.page);
        });
        break;
      case "info":
        var programId = event.record.programId;
        this.programService.getProgramDetail(programId).subscribe(
          (program: any) => {
          const dialogRef = this.dialog.open(EnrolDialogComponent, {
            width: "1200px",
            data: {
              title: "Request Detail",
              formMetaData: JSON.parse(program.form.config),
              requestData: JSON.parse(event.record.requestData),
              readOnly: true,
              program: program
            }
          });
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              var rec = {
                requestData: JSON.stringify(result),
                userId: this.globalCfgService.getUserId(),
                programId: programId,
                formId: program.formId
              };

              this.programService.createRequest(rec).subscribe(
                ()=> {
                  this.msgService.showSuccess('Your request has been submitted for review.');
                }
              );

            }
          });
        });
        break;
      case 'cloud_download': 
        this.programService.downloadCert(rec.programId).subscribe(
          (res:any)=> {
            // this.msgService.showSuccess('Your request has been submitted for review.');
            window.open(environment.baseurl + res.result);
          }
        );
        break;
      default:
        console.log("Unhandled action: ", event.actionName);
    }
  }

  private onActionableClicked(event) {
    console.log("onActionableClicked:", event);

    switch (event.actionName) {
      case "user.fullName":
        var userId = event.record.userId;
        const dialogRef2 = this.dialog.open(ViewOnlyProfileComponent, {
          width: "2400px",
          data: { userId: userId }
        });
        break;
      case "program.name":
        var rec = event.record.program;
        rec.selectedForm = rec.formId;
        this.programService.getProgramDetail(rec.id).subscribe(
          (program: any) => {
            rec.mentorsAllocated = program.mentors;

            const dialogRef1 = this.dialog.open(AddProgramDialogComponent, {
              width: "1200px",
              data: { title: 'View Program Detail', 
              data: {
                  name: program.name,
                  description: program.description,
                  enrolByDt: program.enrolByDt,
                  startDt: program.startDt,
                  endDt: program.endDt,
                  text: program.text,
                  imgPath: program.imgPath,
                  bannerImgPath: program.bannerImgPath,
                  criteria: program.criteria,
                  selectedForm: program.formId,
                  mentorsAllocated: program.mentors,
                  tncLink: program.tncLink,
                  publicUrl: program.publicUrl
              }, 
              readOnly: true }
            });
        });
          
          break;
      default:
        console.log("Unhandled actionable: ", event.actionName);
    }
    
  }

  private onPageChanged(page) {
    this.load(page);
    this.page = page;
  }

  applyFilter() {
    this.page = null;
    this.load();
  }
}
