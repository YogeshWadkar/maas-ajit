import { Component, OnInit, Input } from "@angular/core";
import { MatDialog } from "@angular/material";
import { ManageProfilesDialogComponent } from "../manage-profiles-dialog/manage-profiles-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { CareerProfileService } from "src/services/career-profile.service";
import { MessageService } from "src/services/message.service";
import { ConfirmationDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { ViewCareerProfileComponent } from "../view-career-profile/view-career-profile.component";
import { GlobalCfgService } from "src/services/globalcfg.service";
import { AssessmentService } from "src/services/assessment.service";
import { SelfAssessmentProgressComponent } from "../self-assessment-progress/self-assessment-progress.component";

import { Subject } from "rxjs";

@Component({
  selector: "app-manage-profiles",
  templateUrl: "./manage-profiles.component.html",
  styleUrls: ["./manage-profiles.component.css"]
})
export class ManageProfilesComponent implements OnInit {
  title = "Career Profile";
  dialogWidth = "500px";
  data: any[];
  totalCount: any;
  page: any;
  seekerData: any[];
  seekerCount: any;
  seekerPage: any;

  STRLEN: number = 80;

  private skillsSource = new Subject<any>();
  private skillFetchedValue$ = this.skillsSource.asObservable();

  columns = {
    'admin': [{
      name: "name",
      displayName: "Career Profile",
      actionable: true
    },
    {
      name: "altName",
      displayName: "Alternative Names",
    },
    {
      name: "description",
      displayName: "Description",
    },
    {
      name: "status.description",
      displayName: "Status",
    },
    {
      name: "usersReg",
      displayName: "Total Seekers Registered",
    },
    { name: "actions", displayName: "Actions", editable: false }
    ],
    'career-seeker': [{
      name: "name",
      displayName: "Career Profile",
      actionable: true
    },
    { name: "actions", displayName: "Actions", editable: false }
  ]};

  subscriptions: any = [];

  badgeCount: any;
  panelOpenState = false;
  cProfileDetail: any;
  icon: boolean = false;

  click() {
    this.icon = !this.icon;
  }

  statuses: any;
  draftStatusId: number;
  publisedStatusId: number;
  unpublishStatusId: number;

  role: any;
  userId: number;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private careerProfileService: CareerProfileService,
    private msgService: MessageService,
    private globalCfgService: GlobalCfgService,
    private assessmentService: AssessmentService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.route.url.subscribe(url => {
        console.log("URL: ", url, url.length, url.values().next().value.path);
        //always the first part is role
        this.role = url.values().next().value.path;
      })
    );

    this.subscriptions.push(
      this.globalCfgService.userFetchedValue$.subscribe(() => {
        this.userId = this.globalCfgService.getUserId();
        this.loadCareerProfileStatuses();
      })
    );
  }

  private loadSeekerCareerProfiles() {
    this.careerProfileService.getSeekerCareerProfiles(this.userId).subscribe(
      response => {
        var result = response["result"];
        var arr = result["data"];
        arr.forEach(item => {
          item.actions = [{ name: "cancel", tip: "Remove Career Profile" }];
        });
        this.seekerData = arr;
        this.seekerCount = result["count"];
        console.log("seeker data ", this.seekerData);
      },

      error => {
        console.log("Service calls failed!");
      }
    );
  }

  private loadAvailableCareerProfiles() {
    this.careerProfileService.getAvailableCPs(this.publisedStatusId).subscribe(
      (response: any) => {
        console.log("loadAvailableCareerProfiles data:", response);
        var arr = response.result["data"];
      
        arr.forEach(item => {
          item.actions = [
            { name: "add", tip: "Add Career Profile" }
            // { name: "cancel", tip: "Remove Career Profile" }
          ];
        });
        this.data = arr;
        this.totalCount = response.result["count"];

      },
      error => {
        console.log("Service calls failed!");
      }
    );
  }

  private loadCareerProfiles(page?) {
    var statusId = null;
    if (this.role === "career-seeker") {
      statusId = this.publisedStatusId;
    }
    this.careerProfileService.get(page, statusId).subscribe((response: any) => {
      var arr = response["data"];
      if (this.role === "admin") {
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
            item.actions = [{ name: "undo", tip: "Un-publish" }];
          }
        });
      } else {
        arr.forEach(item => {
          item.actions = [
            { name: "add", tip: "Add Career Profile" }
            // { name: "cancel", tip: "Remove Career Profile" }
          ];
        });
      }
      this.data = arr;
      this.totalCount = response["count"];
    });
  }

  private loadCareerProfileStatuses() {
    this.careerProfileService.getStatus().subscribe(response => {
      this.statuses = response["data"];
      this.statuses.forEach(element => {
        if (element.name == "draft") {
          this.draftStatusId = element.id;
          this.unpublishStatusId = element.id;
        }

          if (element.name == 'published') {
            this.publisedStatusId = element.id;
          }
        });
        this.loadSeekerCareerProfiles();

        if (this.role == 'admin') {
          this.loadCareerProfiles();
        }
        
        if (this.role == 'career-seeker') {
          this.loadAvailableCareerProfiles();
        }
      }
    );
  }

  private addProfile(): void {
    const dialogRef = this.dialog.open(ManageProfilesDialogComponent, {
      width: this.dialogWidth,
      data: { title: "New " + this.title }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed", result);

      if (result) {
        var rec = {
          name: result.name,
          altName: result.altName,
          description: result.description,
          skills: result.skills
        };

        this.careerProfileService.add(rec).subscribe(() => {
          this.msgService.showSuccess("Career Profile added successfully!");
          this.loadCareerProfiles(this.page);
        });
      }
    });
  }

  private viewdetails(user): void{
    console.log("user data",user)
    var cProfileId;
    cProfileId = user.id;
    const dialogRef1 = this.dialog.open(ViewCareerProfileComponent, {
      width: "640px",
       data: { cProfileId: cProfileId }
    });
}

private removedetails(user): void{
  console.log("Remove detalis",user)
  const cnfmdialogRef1 = this.dialog.open(ConfirmationDialogComponent, {
    width: "450px",
    data: {
      title: "Remove " + this.title,
      message:
        "Are you sure you want to remove " + user.name + " from your career profiles?"
    }
  });
  cnfmdialogRef1.afterClosed().subscribe(result => {
    console.log("The dialog was closed", result);
    if (result === "yes") {
      this.careerProfileService.removeCareerProfile(user.id, this.userId).subscribe(
        () => {
          this.msgService.showSuccess("Career Profile removed successfully!");
          this.loadSeekerCareerProfiles();
          this.loadAvailableCareerProfiles();
        }
      );
    }
  });  
}

private add(user): void{
  this.careerProfileService.addCareerProfile(user.id, this.userId).subscribe(
    () => {
      this.msgService.showSuccess("Career Profile added to your profiles successfully!");
      this.loadSeekerCareerProfiles();
      this.loadAvailableCareerProfiles();
    }
  );
}
  

  private onActionClicked(event) {
    console.log("onActionClicked: ", event);
    var rec = event.record;
    switch (event.actionName.name) {
      case "edit":
        const dialogRef = this.dialog.open(ManageProfilesDialogComponent, {
          width: this.dialogWidth,
          data: {
            title: "Edit " + this.title,
            data: {
              name: rec.name,
              altName: rec.altName,
              description: rec.description,
              skills: rec.skills
            }
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            var rec = {
              name: result.name,
              altName: result.altName,
              description: result.description,
              skills: result.skills
            };
            this.careerProfileService
              .update(event.record.id, rec)
              .subscribe(() => {
                this.msgService.showSuccess(
                  "Career Profile updated successfully!"
                );
                this.loadCareerProfiles(this.page);
              });
          }
        });
        break;
      case "delete":
        const cnfmdialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: "450px",
          data: {
            title: "Delete " + this.title,
            message: "Are you sure you want to delete " + rec.name + "?"
          }
        });
        cnfmdialogRef.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          if (result === "yes") {
            this.careerProfileService.delete(rec.id).subscribe(() => {
              this.msgService.showSuccess(
                "Career Profile deleted successfully!"
              );
              this.loadCareerProfiles(this.page);
            });
          }
        });
        break;
      case "publish":
        this.careerProfileService
          .updateStatus(rec.id, this.publisedStatusId)
          .subscribe(() => {
            this.msgService.showSuccess(
              "Career Profile published successfully!"
            );
            this.loadCareerProfiles(this.page);
          });
        break;
      case "undo":
        this.careerProfileService
          .unpublish(rec.id, this.unpublishStatusId)
          .subscribe(() => {
            this.msgService.showSuccess(
              "Career Profile moved to draft successfully!"
            );
            this.loadCareerProfiles(this.page);
          });
        break;
      case "add":
        this.careerProfileService
          .addCareerProfile(rec.id, this.userId)
          .subscribe(() => {
            this.msgService.showSuccess(
              "Career Profile added to your profiles successfully!"
            );
            this.loadCareerProfiles(this.page);
            this.loadSeekerCareerProfiles();
            this.loadAvailableCareerProfiles();
          }
        );
        break;
      default:
        console.log("Unhandled action: ", event.actionName);
    }
  }

  private loadCareerProfile() {
    this.careerProfileService
      .getCareerProfileDetail(this.data["cProfileId"])
      .subscribe((response: any) => {
        this.cProfileDetail = response;
        console.log("view career profile data:", this.cProfileDetail);
      });
  }

  private onActionableClicked(event) {
    console.log("onActionableClicked:", event);

    var cProfileId;
    cProfileId = event.record.id;
    const dialogRef2 = this.dialog.open(ViewCareerProfileComponent, {
      width: "640px",
      data: { cProfileId: cProfileId }
    });
  }

  private onPageChanged(page) {
    this.loadCareerProfiles(page);
    this.page = page;
  }

  private onSeekerActionableClicked(event) {
    var cProfileId;
    cProfileId = event.record.id;
    const dialogRef2 = this.dialog.open(ViewCareerProfileComponent, {
      width: "640px",
      data: { cProfileId: cProfileId }
    });
  }

  private onProgressActionableClicked(user) {
    console.log("onActionableClicked:", user);
    var userId;
    userId = user.id;
    const dialogRef = this.dialog.open(SelfAssessmentProgressComponent, {
      width: "2800px",
      height: "500px",
      data: {
        cProfileId: userId
      }
    });
  }

  private onSeekerActionClicked(event) {
    console.log("onActionClicked: ", event);
    var rec = event.record;
    switch (event.actionName.name) {
      case "cancel":
        const cnfmdialogRef1 = this.dialog.open(ConfirmationDialogComponent, {
          width: "450px",
          data: {
            title: "Remove " + this.title,
            message:
              "Are you sure you want to remove " +
              rec.name +
              " from your career profiles?"
          }
        });
        cnfmdialogRef1.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          if (result === "yes") {
            this.careerProfileService
              .removeCareerProfile(rec.id, this.userId)
              .subscribe(() => {
                this.msgService.showSuccess(
                  "Career Profile removed successfully!"
                );
                this.loadCareerProfiles(this.page);
                this.loadSeekerCareerProfiles();
                this.loadAvailableCareerProfiles();
              }
            );
          }
        });
        break;
      default:
        console.log("Unhandled action: ", event.actionName);
    }
  }

  private getSkillsList(skillsList, all) {
    if (!skillsList) {
      return '';
    }
    
    var ret = [];
    if (skillsList && skillsList.length == 0) {
      return ' Not available';
    }
    skillsList.forEach(element => {
      ret.push(element.name);
    });

    var str = ret.toString().replace(/,/g, ", ");
    if (!all) {
      if (str.length > this.STRLEN) {
        str = str.substring(0, this.STRLEN) + "...";
      }
    }
    return str;
  }
}