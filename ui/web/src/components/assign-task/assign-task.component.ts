import { Component } from "@angular/core";

import { OnInit } from "@angular/core";
import { UserService } from "../../services/user.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { TaskService } from "../../services/task.service";
import { FormDialogComponent } from "../form-dialog/form-dialog.component";
import { FieldGeneratorService } from "../../services/field-generator.service";
import { MatDialog } from "@angular/material";
import { ConfirmationDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { Subject, Observable } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";

import { MessageService } from "../../services/message.service";
import { Utils } from "../../services/utils";
import { UploadFileDialogComponent } from "../upload-file-dialog/upload-file-dialog.component";

@Component({
  selector: "tt-assign-task",
  templateUrl: "./assign-task.component.html",
  styleUrls: ["./assign-task.component.css"]
})
export class AssignTaskComponent implements OnInit {
  columns = [
    { name: "taskId", displayName: "Task Id", editable: false },
    { name: "title", displayName: "Title" },
    { name: "description", displayName: "Description" },
    {
      name: "dueDt",
      displayName: "Due Date",
      type: "date",
      format: "MM/DD/YYYY",
      startAt: new Date()
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
    // {name: 'comment', displayName: 'Comment'},
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
      actionable: true,
      type: "iconlink"
    },
    { name: "actions", displayName: "Actions", type: "actions" }
  ];

  seekers: any[];
  taskStatuses: any[] = [];
  taskCategories: any[] = [];
  tasks: any[] = [];

  dialogWidth = "350px";
  user: any;
  meetingId: any;

  private userSource = new Subject<any>();
  private userFetchedValue$ = this.userSource.asObservable();
  todoStatusId: any;
  subscriptions: any = [];
  doneStatusId: any;
  totalCount: any;
  page: any;

  constructor(
    private dialog: MatDialog,
    private fgService: FieldGeneratorService,
    private userService: UserService,
    private globalCfgService: GlobalCfgService,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router,
    private msgService: MessageService,
    private utils: Utils
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.userFetchedValue$.subscribe(user => {
        this.user = user;
        this.loadTasks(user.id);
      })
    );

    this.subscriptions.push(
      this.route.url.subscribe(url => {
        console.log(
          "URL: ",
          this.route,
          this.route.params,
          this.route.queryParamMap
        );

        this.route.queryParamMap.subscribe(val => {
          console.log("query params: ", val.get("meeting"));
          this.meetingId = val.get("meeting");
        });

        //always the first part is role
        this.route.params.subscribe(val => {
          console.log("URL: ", val);
          this.getUser(val.id);
        });
      })
    );

    this.loadCategories();
    this.loadStatuses();
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private getUser(userId) {
    this.userService.getUserDetail(userId).subscribe(
      response => {
        this.userSource.next(response['data'][0]);
      },
      error => {
        console.log("Service error:");
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

  loadStatuses() {
    this.taskService.getAllStatuses().subscribe(
      (response: any[]) => {
        let arr: any = response["data"];

        arr.forEach(element => {
          if (element.name == "todo") {
            this.todoStatusId = element.id;
          }
          if (element.name == "done") {
            this.doneStatusId = element.id;
          }

          this.taskStatuses.push({
            id: element.id,
            value: element.description
          });
        });
        this.columns[5]["options"] = this.taskStatuses;
      },
      error => {
        console.log("Service error:", error);
      }
    );
  }

  loadCategories() {
    this.taskService.getAllCategories().subscribe(
      (response: any[]) => {
        let arr: any = response["data"];

        arr.forEach(element => {
          this.taskCategories.push({
            id: element.id,
            value: element.description
          });
        });
        this.columns[4]["options"] = this.taskCategories;
      },
      error => {
        console.log("Service error:", error);
      }
    );
  }

  loadTasks(userId, page?) {
    this.taskService.getTasks([], userId, "all", page).subscribe(
      (response: any[]) => {
        var tasks = response["data"];
        this.totalCount = response["count"];

        tasks.forEach(item => {
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

          if (item.statusId == this.todoStatusId) {
            item["actions"] = [
              { name: "edit", tip: "Edit" },
              { name: "delete", tip: "Delete" }
            ];
          }

          this.tasks = tasks;
        });
      },
      error => {
        console.log("Service error:", error);
      }
    );
  }

  private addTask(): void {
    var fields = this.fgService.getFields(this.columns, null);

    const dialogRef = this.dialog.open(FormDialogComponent, {
      width: this.dialogWidth,
      data: { title: "Assign New Task", fields: fields }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed", result);
      if (!result) {
        return;
      }
      this.taskService
        .createTask({
          title: result.title,
          description: result.description,
          dueDt: result.dueDt,
          categoryId: result.category,
          statusId: this.todoStatusId,
          remark: result.remark,
          // comment: result.comment,
          // taskDoc: result.taskDoc,
          // taskCompletionDoc: result.taskCompletionDoc,
          assignedToUserId: this.user.id,
          assignedByUserId: this.globalCfgService.getUserId(),
          meetingId: this.meetingId * 1
        })
        .subscribe(
          response => {
            console.log("Created!");
            this.loadTasks(this.user.id, this.page);
          },
          error => {
            console.log("Service error:", error);
          }
        );
    });
  }

  private onActionClicked(event) {
    console.log("onActionClicked: ", event);
    switch (event.actionName.name) {
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
                this.loadTasks(this.user.id, this.page);
              });
          }
        });
        break;
      case "taskCompletionDocLink":
        const dialogRef1 = this.dialog.open(UploadFileDialogComponent, {
          width: "540px",
          data: { userId: event.record.assignedByUserId }
        });

        dialogRef1.afterClosed().subscribe(result => {
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
                this.loadTasks(this.user.id, this.page);
              });
          }
        });
        break;
      case "edit":
        var fields = this.fgService.getFields(this.columns, event.record);
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
                this.loadTasks(this.user.id, this.page);
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
                this.loadTasks(this.user.id, this.page);
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
    this.loadTasks(this.user.id, page);
    this.page = page;
  }
}
