import { Component } from "@angular/core";

import { OnInit } from "@angular/core";
import { UserService } from "../../services/user.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { TaskService } from "../../services/task.service";
import { FormDialogComponent } from "../form-dialog/form-dialog.component";
import { FieldGeneratorService } from "../../services/field-generator.service";
import { MatDialog } from "@angular/material";
import { ConfirmationDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { Subject } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { MiscService } from "src/services/misc.service";
import { ViewOnlyProfileComponent } from "../viewonly-profile/viewonly-profile.component";
import { MessageService } from "../../services/message.service";
import { UploadFileDialogComponent } from "../upload-file-dialog/upload-file-dialog.component";
import { Utils } from "../../services/utils";
import { ChatDialogService } from '../../services/chat-dialog.service';

@Component({
  selector: "tt-actions-tracker",
  templateUrl: "./actions-tracker.component.html",
  styleUrls: ["./actions-tracker.component.css"]
})
export class ActionsTrackerComponent implements OnInit {
  selectedStatus = "all";
  selectedMentor = "all";
  selectedSeeker = "all";

  columns = {
    admin: [
      { name: "taskId", displayName: "Task Id", editable: false },
      { name: "title", displayName: "Title" },
      {
        name: "assignedToUser.fullName",
        displayName: "Assigned To",
        actionable: true,
        editable: false
      },
      {
        name: "assignedByUser.fullName",
        displayName: "Assigned By",
        actionable: true,
        editable: false
      },
      { name: "description", displayName: "Description" },
      {
        name: "dueDt",
        displayName: "Due Date",
        type: "date",
        format: "MM/DD/YYYY"
      },
      {
        name: "category",
        displayName: "Category",
        dataField: "category.description",
        required: true,
        type: "selection"
      },
      {
        name: "status",
        displayName: "Task Status",
        dataField: "status.description",
        required: true,
        type: "selection"
      },
      { name: "remark", displayName: "Remark" },
      // {name: 'comment', displayName: 'Comment', type: 'link'},
      {
        name: "taskDocLink",
        displayName: "Task Document",
        editable: false,
        type: "iconlink"
      },
      {
        name: "taskCompletionDocLink",
        displayName: "Task Completion Document",
        editable: false,
        type: "iconlink"
      },
      { name: "actions", displayName: "Actions", type: "actions" }
    ],
    "career-seeker": [
      { name: "taskId", displayName: "Task Id", editable: false },
      { name: "title", displayName: "Title" },
      {
        name: "assignedByUser.fullName",
        displayName: "Assigned By",
        actionable: true,
        editable: false
      },
      { name: "description", displayName: "Description" },
      {
        name: "dueDt",
        displayName: "Due Date",
        type: "date",
        format: "MM/DD/YYYY"
      },
      {
        name: "category",
        displayName: "Category",
        dataField: "category.description",
        required: true,
        type: "selection"
      },
      {
        name: "status",
        displayName: "Task Status",
        dataField: "status.description",
        required: true,
        type: "selection"
      },
      { name: "remark", displayName: "Remark" },
      // {name: 'comment', displayName: 'Comment', type: 'link'},
      {
        name: "taskDocLink",
        displayName: "Task Document",
        editable: false,
        type: "iconlink"
      },
      {
        name: "taskCompletionDocLink",
        displayName: "Task Completion Document",
        editable: false,
        type: "iconlink"
      },
      { name: "actions", displayName: "Actions", type: "actions" }
    ],
    mentor: [
      { name: "taskId", displayName: "Task Id", editable: false },
      { name: "title", displayName: "Title" },
      {
        name: "assignedToUser.fullName",
        displayName: "Assigned To",
        actionable: true,
        editable: false
      },
      { name: "description", displayName: "Description" },
      {
        name: "dueDt",
        displayName: "Due Date",
        type: "date",
        format: "MM/DD/YYYY"
      },
      {
        name: "category",
        displayName: "Category",
        dataField: "category.description",
        required: true,
        type: "selection"
      },
      {
        name: "status",
        displayName: "Task Status",
        editable: false,
        dataField: "status.description",
        required: true,
        type: "selection"
      },
      { name: "remark", displayName: "Remark" },
      // {name: 'comment', displayName: 'Comment', type: 'link', icon: 'attach_file'},
      {
        name: "taskDocLink",
        displayName: "Task Document",
        editable: false,
        type: "iconlink"
      },
      {
        name: "taskCompletionDocLink",
        displayName: "Task Completion Document",
        editable: false,
        type: "iconlink"
      },
      { name: "actions", displayName: "Actions", type: "actions" }
    ]
  };
  tokenAllocationFields = [
    { name: "mentorNumTokens", displayName: "Tokens to Mentor", required: true },
    { name: "seekerNumTokens", displayName: "Tokens to Career seeker", required: true }
  ];

  private statusesSource = new Subject<any>();
  private statusesFetchedValue$ = this.statusesSource.asObservable();

  private roleSource = new Subject<any>();
  private roleFetchedValue$ = this.roleSource.asObservable();

  role: any;
  seekers: any[];
  taskStatuses: any[] = [];
  taskCategories: any[] = [];
  tasks: any[] = [];

  dialogWidth = "350px";
  mentors: any[] = [];
  todoStatusId: any;
  wipStatusId: any;
  doneStatusId: any;
  totalCount: any;
  statusSubscriber: any;
  roleSubscriber: any;
  subscriptions: any = [];
  page: any;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private fgService: FieldGeneratorService,
    private userService: UserService,
    private globalCfgService: GlobalCfgService,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private miscService: MiscService,
    private msgService: MessageService,
    private utils: Utils,
    private chatDialogService: ChatDialogService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.statusesFetchedValue$.subscribe(() => {
        this.loadTasks();
      })
    );

    this.subscriptions.push(
      this.roleFetchedValue$.subscribe(() => {
        this.loadStatuses();
        this.loadCategories();
        this.loadSeekers();
        this.loadMentors();
      })
    );

    this.route.url.subscribe(url => {
      // console.log('URL: ', url, url.length, url.values().next().value.path);

      //always the first part is role
      this.role = url.values().next().value.path;
      this.roleSource.next();
    });
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private getColIdx(arr, colName) {
    var ln = arr.length;
    for (var i = 0; i < ln; i++) {
      if (arr[i].name == colName) {
        return i;
      }
    }

    return -1;
  }

  private loadMentors() {
    this.userService.getRoles().subscribe(
      (roles: any[]) => {
        roles["data"].forEach(item => {
          if (item.name === "mentor") {
            this.userService.getUsersByRole(item.id).subscribe(
              (response: any[]) => {
                this.mentors = response['data'];
              },
              error => {
                console.log("Service error:", error);
              }
            );
          }
        });
      },
      error => {
        console.log("Service error:", error);
      }
    );
  }

  private loadSeekers() {
    this.userService.getRoles().subscribe(
      (roles: any[]) => {
        roles["data"].forEach(item => {
          if (item.name === "career-seeker") {
            this.userService.getUsersByRole(item.id).subscribe(
              (response: any[]) => {
                this.seekers = response['data'];
              },
              error => {
                console.log("Service error:", error);
              }
            );
          }
        });
      },
      error => {
        console.log("Service error:", error);
      }
    );
  }

  private loadStatuses() {
    this.taskService.getAllStatuses().subscribe(
      (response: any[]) => {
        let arr: any = response["data"];

        arr.forEach(element => {
          if (element.name == "todo") {
            this.todoStatusId = element.id;
          }
          if (element.name == "inprogress") {
            this.wipStatusId = element.id;
          }
          if (element.name == "done") {
            this.doneStatusId = element.id;
          }

          this.taskStatuses.push({
            id: element.id,
            value: element.description
          });
        });

        var idx = this.getColIdx(this.columns[this.role], "status");
        if (idx > 0) {
          this.columns[this.role][idx]["options"] = this.taskStatuses;
        }
        this.statusesSource.next();
      },
      error => {
        console.log("Service error:", error);
      }
    );
  }

  private loadCategories() {
    this.taskService.getAllCategories().subscribe(
      (response: any[]) => {
        let arr: any = response["data"];

        arr.forEach(element => {
          this.taskCategories.push({
            id: element.id,
            value: element.description
          });
        });
        var idx = this.getColIdx(this.columns[this.role], "category");
        if (idx > 0) {
          this.columns[this.role][idx]["options"] = this.taskCategories;
        }
      },
      error => {
        console.log("Service error:", error);
      }
    );
  }

  private loadTasks(page?) {
    var fn,
      args,
      statusIds = this.selectedStatus == "all" ? [] : [this.selectedStatus];

    fn = this.taskService.getTasks;
    args = [statusIds, this.selectedSeeker, this.selectedMentor, page];

    fn.apply(this.taskService, args).subscribe(
      (response: any[]) => {
        this.tasks = response["data"];
        this.totalCount = response["count"];

        this.tasks.forEach(item => {
          var mu = item["assignedByUser"],
            su = item["assignedToUser"];
          mu["fullName"] = mu["firstName"] + " " + mu["lastName"];
          su["fullName"] = su["firstName"] + " " + su["lastName"];

          var user = this.globalCfgService.getFullUserObj();

          item.taskDocLink = {
            value: "",
            icon: "attach_file",
            tip: "Attach a file"
          };

          item.taskCompletionDocLink = {
            value: "",
            icon: "attach_file",
            tip: "Attach a file"
          };

          if (item.taskDoc && item.taskDoc.length > 0) {
            item.taskDocLink = {
              value: item.taskDoc,
              icon: "cloud_download",
              tip: "Download attachment"
            };
          }

          if (item.taskCompletionDoc && item.taskCompletionDoc.length > 0) {
            item.taskCompletionDocLink = {
              value: item.taskCompletionDoc,
              icon: "cloud_download",
              tip: "Download attachment"
            };
          }

          if (user.role.name == "admin") {
            if (item.statusId == this.todoStatusId) {
              item["actions"] = [
                { name: "edit", tip: "Edit" },
                { name: "play_circle_outline", tip: "Move to In-progress" }
              ];
            }
            if (item.statusId == this.wipStatusId) {
              item["actions"] = [
                { name: "edit", tip: "Edit" },
                { name: "done", tip: "Mark as Done" }                 
              ];
            }
            if (
              this.role == "admin" &&
              !item.hasTokenAllocated &&
              item.statusId == this.doneStatusId
            ) {
              item["actions"] = [{ name: "card_giftcard", tip: "Gift tokens" }];
            } else {
              if (item.statusId == this.todoStatusId) {
                item["actions"] = [
                  { name: "edit", tip: "Edit" },
                  { name: "play_circle_outline", tip: "Move to In-progress" }
                ];
              }
              if (item.statusId == this.wipStatusId) {
                item["actions"] = [
                  { name: "edit", tip: "Edit" },
                  { name: "done", tip: "Mark as Done" }  
                ];
              }  
            }
          } else {
            if (this.role == "mentor") {
              item["actions"] = [];
              if (item.statusId != this.doneStatusId) {
                item["actions"] = [
                  { name: "edit", tip: "Edit" },
                  { name: "delete", tip: "Delete" },
                  { name: 'chat', tip: 'Chat'}
                ];
              } else {
                if (item.hasChatLog) {
                  item["actions"].push({ name: 'chat', tip: 'View Chat Log'});
                }
              }
            }
            if (this.role == "career-seeker") {
              if (item.statusId == this.todoStatusId) {
                item["actions"] = [
                  { name: "edit", tip: "Edit" },
                  { name: "play_circle_outline", tip: "Move to In-progress" },
                  { name: 'chat', tip: 'Chat'}
                ];
              }
              if (item.statusId == this.wipStatusId) {
                item["actions"] = [
                  { name: "edit", tip: "Edit" },
                  { name: "done", tip: "Mark as Done" },
                  { name: 'chat', tip: 'Chat'}
                ];
              }

              if (item.statusId == this.doneStatusId && item.hasChatLog) {
                item["actions"] = [
                  { name: 'chat', tip: 'Chat'}
                ];
              }
            }
          }
          // task['actions'] = [{name: 'edit', tip: 'Edit'},{name:'delete', tip: 'Delete'}];
        });
      },
      error => {
        console.log("Service error:", error);
      }
    );
  }

  private onActionClicked(event) {
    console.log("onActionClicked: ", event);
    switch (event.actionName.name) {
      case "edit":
        var fields = this.fgService.getFields(
          this.columns[this.role],
          event.record
        );
        const dialogRef = this.dialog.open(FormDialogComponent, {
          width: this.dialogWidth,
          data: {
            title: "Edit Task",
            fields: fields
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          var rec = event.record;
          console.log(rec);
          this.taskService
            .updateTask({
              id: rec.id,
              taskId: rec.taskId,
              title: result.title,
              description: result.description,
              dueDt: result.dueDt,
              categoryId: result.category,
              statusId: rec.statusId,
              remark: result.remark,
              // comment: result.comment,
              // taskDoc: result.taskDoc,
              // taskCompletionDoc: result.taskCompletionDoc,
              assignedToUserId: rec.assignedToUserId,
              assignedByUserId: rec.assignedByUserId,
              meetingId: rec.meetingId
            })
            .subscribe(
              response => {
                console.log("Updated!");
                this.msgService.showSuccess("Task has been updated");
                this.loadTasks(this.page);
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
            title: "Delete Task",
            message:
              "Are you sure you want to delete " + event.record.title + "?"
          }
        });
        cnfmdialogRef.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          if (result === "yes") {
            this.taskService.deleteTask(event.record.id).subscribe(
              response => {
                console.log("Deleted!");
                this.msgService.showSuccess("Task has been deleted");
                this.loadTasks(this.page);
              },
              error => {
                console.log("Failed to delete!", error);
              }
            );
          }
        });
        break;
      case "card_giftcard":
        var rec = event.record;
        var fields = this.fgService.getFields(this.tokenAllocationFields, null);
        const dialogRef1 = this.dialog.open(FormDialogComponent, {
          width: this.dialogWidth,
          data: { title: "Allocate Token", fields: fields }
        });

        dialogRef1.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);

          this.miscService
            .allocateTaskTokens(this.globalCfgService.getUserId(), [
              {
                userId: rec["assignedByUserId"],
                numTokens: result["mentorNumTokens"]
              },
              {
                userId: rec["assignedToUserId"],
                numTokens: result["seekerNumTokens"]
              }
            ])
            .subscribe(
              response => {
                console.log("Tokens allocated!");
                this.msgService.showSuccess("Token has been allocated");
              },
              error => {
                console.log("Failed to create!", error);
              }
            );
        });
        break;
      case "taskDocLink":
        var rec = event.record;
        var taskDoc = event.record.taskDoc;

        const dialogRef2 = this.dialog.open(UploadFileDialogComponent, {
          width: "540px",
          data: { userId: event.record.assignedByUserId }
        });

        dialogRef2.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          if (result.action === "yes") {
            var path =
              "/uploads/" +
              result.attachment.container +
              "/" +
              result.attachment.name;
            this.taskService
              .updateTaskFile(event.record.id, path)
              .subscribe(response => {
                console.log("Path updated: ", response);
                this.loadTasks(this.page);
              });
          }
        });
        break;
      case "taskCompletionDocLink":
        const dialogRef3 = this.dialog.open(UploadFileDialogComponent, {
          width: "540px",
          data: { userId: event.record.assignedByUserId }
        });

        dialogRef3.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          if (result.action === "yes") {
            var path =
              "/uploads/" +
              result.attachment.container +
              "/" +
              result.attachment.name;
            this.taskService
              .updateCompletionTaskFile(event.record.id, path)
              .subscribe(response => {
                console.log("Path updated: ", response);
                this.loadTasks(this.page);
              });
          }
        });
        break;
      case "play_circle_outline":
        var rec = event.record;
        this.taskService.updateTaskStatus(rec.id, this.wipStatusId).subscribe(
          () => {
            this.msgService.showSuccess(
              "Task status has been updated to In-progress"
            );
            this.loadTasks(this.page);
          },
          error => {
            this.msgService.showError("Failed to update the task status");
          }
        );
        break;
      case "done":
        var rec = event.record;
        this.taskService.updateTaskStatus(rec.id, this.doneStatusId).subscribe(
          () => {
            this.msgService.showSuccess("Task status has been updated to Done");
            this.loadTasks(this.page);
          },
          error => {
            this.msgService.showError("Failed to update the task status");
          }
        );
        break;
      case 'chat':
          var rec = event.record;
          var toUser;
          if (this.globalCfgService.getUserId() == rec.assignedByUserId) {
            toUser = rec.assignedToUser;
          } else {
            toUser = rec.assignedByUser;
          }

          this.userService.getUserDetail(toUser.id).subscribe(
            (response: any)=> {
              var taskInContext = {
                ctx: 'task',
                ctxId: rec.taskId,
                ctxName: rec.title,
                fromUser: this.globalCfgService.getFullUserObj(),
                toUser: response['data'][0],
                readOnly: rec.statusId == this.doneStatusId
              };
              this.chatDialogService.add(taskInContext);
            }
          );
          break;
      default:
        console.log("Unhandled action: ", event.actionName);
    }
  }

  private onActionableClicked(event) {
    console.log("onActionableClicked:", event);

    var userId;
    switch (event.actionName) {
      case "assignedToUser.fullName":
        userId = event.record.assignedToUserId;
        this.dialog.open(ViewOnlyProfileComponent, {
          width: "2400px",
          data: { userId: userId }
        });
        break;
      case "assignedByUser.fullName":
        userId = event.record.assignedByUserId;
        this.dialog.open(ViewOnlyProfileComponent, {
          width: "2400px",
          data: { userId: userId }
        });
        break;
      default:
        console.log("Unhandled actionable: ", event.actionName);
    }
  }

  private applyFilter() {
    console.log(this.selectedMentor, this.selectedSeeker, this.selectedStatus);
    this.loadTasks();
  }

  private clearFilter() {
    this.selectedStatus = "all";
    this.selectedMentor = "all";
    this.selectedSeeker = "all";
    this.loadTasks();
  }

  private onPageChanged(page) {
    this.loadTasks(page);
    this.page = page;
  }
}
