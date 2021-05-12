import { Component, Input } from "@angular/core";

import { OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject } from "rxjs";
import { ViewOnlyProfileComponent } from "../viewonly-profile/viewonly-profile.component";
import { MatDialog } from "@angular/material";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { MessageService } from "../../services/message.service";
import { ConfirmationDialogComponent } from "../confirm-dialog/confirm-dialog.component";

import * as moment from "moment";
import { UserService } from '../../services/user.service';
import { AssessmentService } from '../../services/assessment.service';
import { ApproveAssessmentRequestsDialogComponent } from '../approve-assessment-requests-dialog/approve-assessment-requests-dialog.component';
import { FormDialogComponent } from '../form-dialog/form-dialog.component';
import { FieldGeneratorService } from '../../services/field-generator.service';

@Component({
  selector: "tt-assessment-requests",
  templateUrl: "./assessment-requests.component.html",
  styleUrls: ["./assessment-requests.component.css"]
})
export class AssessmentRequestsComponent implements OnInit {
  title = "Assessment Requests";

  columns = {
    "career-seeker": [
      { name: "requestId", displayName: "Request Id" },
      { name: "mentorUser.fullName", displayName: "Mentor", actionable: true },
      { name: "skill.name", displayName: "Skill" },
      { name: "level.description", displayName: "Level" },
      { name: "status.description", displayName: "Status" },
      { name: "rejectReason", displayName: "Reason for Rejection" },
      { name: "actions", displayName: "Actions" }
    ],
    mentor: [
      { name: "requestId", displayName: "Request Id" },
      {
        name: "seekerUser.fullName",
        displayName: "Career Seeker",
        actionable: true
      },
      { name: "level.description", displayName: "Level" },
      { name: "status.description", displayName: "Status" },
      { name: "rejectReason", displayName: "Reason for Rejection" },
      { name: "actions", displayName: "Actions" }
    ],
    "admin": [
      { name: "requestId", displayName: "Request Id" },
      { name: "mentorUser.fullName", displayName: "Mentor", actionable: true },
      { name: "seekerUser.fullName", displayName: "Career Seeker", actionable: true },
      { name: "skill.name", displayName: "Skill" },
      { name: "level.description", displayName: "Level" },
      { name: "status.description", displayName: "Status" },
      { name: "rejectReason", displayName: "Reason for Rejection" },
      { name: "actions", displayName: "Actions" }
    ],
  };

  statuses: any[];
  assessments: any[];
  pendingStatusId: number;
  acceptStatusId: number;
  rejectStatusId: number;

  @Input()
  requestId: number;
  
  _role: string;
  get role() {
    return this._role;
  }

  @Input()
  set role(val) {
    this._role = val;
    this.loadStatuses();
  }

  totalCount: any;

  private statusesSource = new Subject<any>();
  private statusesFetchedValue$ = this.statusesSource.asObservable();

  private roleSource = new Subject<any>();
  private roleFetchedValue$ = this.roleSource.asObservable();
  subscriptions: any = [];
  page: any;

  constructor(
    private router: Router,
    private assessmentService: AssessmentService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private globalCfgService: GlobalCfgService,
    private msgService: MessageService,
    private userService: UserService,
    private fgService: FieldGeneratorService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.statusesFetchedValue$.subscribe(() => {
        this.loadAssessmentRequests();
      })
    );

    this.subscriptions.push(
      this.roleFetchedValue$.subscribe(() => {
        this.loadStatuses();
      })
    );

    this.subscriptions.push(
      this.route.url.subscribe(url => {
        console.log("URL: ", url, url.length, url.values().next().value.path);
        //always the first part is role
        var role = url.values().next().value.path;
        if (role && role.length > 0) {
          this.role = url.values().next().value.path;
          this.roleSource.next();
        }
      })
    );
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private loadStatuses() {
    this.assessmentService.getAssessmentStatuses().subscribe(
      (response: any[]) => {
        this.statuses = response["data"];

        this.statuses.forEach(item => {
          if (item.name == "approved") {
            this.acceptStatusId = item.id;
          }
          if (item.name == "rejected") {
            this.rejectStatusId = item.id;
          }
          if (item.name == "pending_approval") {
            this.pendingStatusId = item.id;
          }
        });

        this.statusesSource.next();
      },
      error => {}
    );
  }

  private loadAssessmentRequests(page?) {
    var fn, args;

    if (this.role == "admin") {
      fn = this.assessmentService.getPendingApprovalAssessments;
      args = [this.pendingStatusId, null, page, this.requestId];
    }
    if (this.role == "mentor") {
      fn = this.assessmentService.getPendingApprovalAssessmentsForMentor;
      args = [this.pendingStatusId, this.globalCfgService.getUserId(), page, this.requestId];
    }
    if (this.role == "career-seeker") {
      fn = this.assessmentService.getPendingApprovalAssessmentsForCS;
      args = [this.pendingStatusId, this.globalCfgService.getUserId(), page, this.requestId];
    }

    fn.apply(this.assessmentService, args).subscribe(
      (response: any[]) => {
        this.assessments = response["data"];
        this.totalCount = response["count"];
        
        this.assessments.forEach(item => {
          var su = item["seekerUser"],
            mu = item["mentorUser"];
          su["fullName"] = su["firstName"] + " " + su["lastName"];
          mu["fullName"] = mu["firstName"] + " " + mu["lastName"];

          if (this.role == "mentor") {
            if (item.statusId === this.pendingStatusId) {
              item["actions"] = [
                { name: "done", tip: "Approve" },
                { name: "clear", tip: "Reject" }
              ];
            }
            
          }

          if (this.role == "career-seeker") {
            if (item.statusId === this.pendingStatusId) {
              item["actions"] = [
                { name: "cancel", tip: "Cancel Request" }
              ];
            }
          }

          if (this.role == "admin") {
            if (item.statusId === this.pendingStatusId) {
              item["actions"] = [
                { name: "done", tip: "Approve" },
                { name: "clear", tip: "Reject" }
              ];
            }
          }
        });
      },
      error => {}
    );
  }

  private onActionClicked(event) {
    console.log("onActionClicked:", event);
    var cnfmdialogRef;
    switch (event.actionName.name) {
      case "done":
        var rec = event.record;
        console.log("marking request as accepted...");

        cnfmdialogRef = this.dialog.open(ApproveAssessmentRequestsDialogComponent, {
          width: "480px",
          data: {
            title: "Accept Assessment Request"
          }
        });
        cnfmdialogRef.afterClosed().subscribe(result => {
        
          if (result) {
            this.assessmentService
            .approve({
              id: rec.id,
              date: result.dateSelected,
              slotId: result.selectedSlot
            })
            .subscribe(
              (response: any[]) => {
                
                this.msgService.showSuccess(
                  "Thank you for accepting the assessment request. Meeting has been scheduled."
                );
                this.loadAssessmentRequests(this.page);
              },
              error => {
                console.log("Service error:", error);
              }
            );
          }
        });
        break;
      case "clear":
        var rec = event.record;
        console.log("marking meeting as rejected...");
        var fieldsArr = [
          {name: 'rejectReason', displayName: 'Reason for rejection', type: 'longstring'}
        ];
        var fields = this.fgService.getFields(fieldsArr, {});
        const dialogRef = this.dialog.open(FormDialogComponent, {
          width: '450px',
          data: {
            title: "Reject Request",
            fields: fields
          }
        });

        
        dialogRef.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          if (result) {
            this.assessmentService
              .patchAssessmentRequest(rec.id, {
                rejectReason: result.rejectReason,
                statusId: this.rejectStatusId,
                statusChangedOn: new Date()
              })
              .subscribe(
                (response: any[]) => {
                  console.log("Record updated.");
                  this.msgService.showSuccess(
                    "Assessment request has been rejected"
                  );
                  this.loadAssessmentRequests(this.page);
                },
                error => {
                  console.log("Service error:", error);
                }
              );
          }
        });
        break;
      default:
        console.log("Unhandled action. Please check!");
    }
  }

  private onActionableClicked(event) {
    console.log("onActionableClicked:", event);

    var userId;
    switch (event.actionName) {
      case "seekerUser.fullName":
        userId = event.record.seekerUserId;
        break;
      case "mentorUser.fullName":
        userId = event.record.mentorUserId;
        break;
      default:
        console.log("Unhandled actionable: ", event.actionName);
    }
    const dialogRef2 = this.dialog.open(ViewOnlyProfileComponent, {
      width: "2400px",
      data: { userId: userId }
    });
  }

  private onPageChanged(page) {
    this.loadAssessmentRequests(page);
    this.page = page;
  }
}