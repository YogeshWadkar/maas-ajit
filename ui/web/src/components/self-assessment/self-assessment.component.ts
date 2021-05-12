import { Component } from "@angular/core";

import { OnInit } from "@angular/core";
import { FieldGeneratorService } from "../../services/field-generator.service";
import { MatDialog } from "@angular/material";
import { FormBase } from "../dynamic-form/form-base";
import { Router, ActivatedRoute } from "@angular/router";
import { AssessmentService } from "../../services/assessment.service";
import { FormDialogComponent } from "../form-dialog/form-dialog.component";
import { ConfirmationDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { SkillService } from "../../services/skill.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { Subject } from "rxjs";
import { MessageService } from "../../services/message.service";

import { SearchGuruDialogComponent } from "../search-guru-dialog/search-guru-dialog.component";
import { UserService } from "../../services/user.service";
import { Utils } from 'src/services/utils';
import { StartupService } from 'src/services/startup.service';
import { EventBusService } from 'src/services/event-bus.service';
import { ViewCareerProfileComponent } from '../view-career-profile/view-career-profile.component';
import { AssessmentRequestsDialogComponent } from '../assessment-requests-dialog/assessment-requests-dialog.component';

@Component({
  selector: "tt-self-assessment",
  templateUrl: "./self-assessment.component.html",
  styleUrls: ["./self-assessment.component.css"]
})
export class SelfAssessmentComponent implements OnInit {
  title = "Self Assessment";
  dialogWidth = "250px";

  private skillsSource = new Subject<any>();
  private skillFetchedValue$ = this.skillsSource.asObservable();

  categories = [];
  currentCategory = {};
  role: any;
  data: any = [];
  columns = {
    'career-seeker': [
      {
        name: "profile.name",
        displayName: "Career Profile",
        editable: false,
        actionable: true
      },
      {
        name: "skill",
        displayName: "Skill Name",
        dataField: "skill.name",
        required: true,
        type: "selection"
      },
      {
        name: "rating",
        displayName: "Rating",
        required: true,
        type: "widget",
        widget: { type: "rating" }
      },
      { name: "comment", displayName: "Comment", required: true },
      {
        name: "level1.action",
        displayName: "Level 1",
        editable: false,
        actionable: true
      },
      {
        name: "level2.action",
        displayName: "Level 2",
        editable: false,
        actionable: true
      },
      {
        name: "level3.action",
        displayName: "Level 3",
        editable: false,
        actionable: true
      },
      { name: "actions", displayName: "Actions", type: "actions" }
    ],
    mentor: [
      {
        name: "skill",
        displayName: "Skill Name",
        dataField: "skill.name",
        required: true,
        type: "selection"
      },
      {
        name: "rating",
        displayName: "Rating",
        required: true,
        type: "widget",
        widget: { type: "rating" }
      },
      { name: "comment", displayName: "Comment", required: true },
      { name: "actions", displayName: "Actions", type: "actions" },
    ]
  };

  subscriptions: any = [];
  private roleSource = new Subject<any>();
  private roleFetchedValue$ = this.roleSource.asObservable();

  fields: FormBase<any>[];
  skills: any[] = [];
  skillsCount: any;
  count: any;
  page: any;

  constructor(
    private dialog: MatDialog,
    private fgService: FieldGeneratorService,
    private assessmentService: AssessmentService,
    private skillService: SkillService,
    private globalCfg: GlobalCfgService,
    private msgService: MessageService,
    private userService: UserService,
    private route: ActivatedRoute,
    private utils: Utils,
    private startupService: StartupService,
    private ebService: EventBusService
  ) {
    this.skillFetchedValue$.subscribe(() => this.load());
  }

  private load(page?) {

    this.assessmentService
      .getSelfAssessments(this.currentCategory["id"], page)
      .subscribe(
        response => {
          let arr: any = response["data"];

          arr.forEach(element => {
            element["actions"] = [
              { name: "edit", tip: "Edit" }
            ];
            if (element["level"] == null) {
              element["actions"].push({ name: "delete", tip: "Delete" })
            }

            if (this.role == 'career-seeker') {
              if (!element['profile']) {
                element['profile'] = {name: ''}
              }

              var l1 = this.utils.getObject('name', 'level1.action', this.columns[this.role]);
              var l2 = this.utils.getObject('name', 'level2.action', this.columns[this.role]);
              var l3 = this.utils.getObject('name', 'level3.action', this.columns[this.role]);

              l1.action = "";
              l2.action = "";
              l3.action = "";

              if (!element.level1.hasRecommendedForNextLevel) {
                if (element.level1.hasPendingRequest) {
                  element.level1.action = 'Pending';
                } else {
                  element.level1.action = 'Request Assessment';
                }
                // element.level2 = null;
                // element.level3 = null;
              } else {
                element.level1.action = 'View Assessment';
              }

              if (element.level2) {
                if (!element.level2.hasRecommendedForNextLevel) {
                  if (element.level2.hasPendingRequest) {
                    element.level2.action = 'Pending';
                  } else {
                    element.level2.action = 'Request Assessment';
                  }
                  // element.level3 = null;
                } else {
                  element.level2.action = 'View Assessment';
                }
              }

              if (element.level3) {
                if (!element.level3.hasRecommendedForNextLevel) {
                  if (element.level3.hasPendingRequest) {
                    element.level3.action = 'Pending';
                  } else {
                    element.level3.action = 'Request Assessment';
                  }
                } else {
                  element.level3.action = 'View Assessment';
                }
              }
            }


          });

          this.data = arr;
          this.count = response["count"];
        },
        error => {
          console.log(error);
          console.log("Service calls failed!");
        }
      );
  }

  private getSkills(all) {
    this.skillService.getSkills(this.currentCategory["id"], all).subscribe(
      (response: any[]) => {
        this.skills = [];
        this.skillsCount = response["count"];
        response["data"].forEach(element => {
          this.skills.push({
            id: element.id,
            value: element.name
          });
        });
        // this.columns[0]["options"] = this.skills;
        // debugger; Object.entries(this.skills)

        if (this.role == "mentor") {
          this.columns["mentor"]["options"] = this.skills;
        }
        if (this.role == "career-seeker") {
          this.columns["career-seeker"]["options"] = this.skills;
        }
        this.skillsSource.next();
      },
      error => {
        console.log(error);
        console.log("Service calls failed!");
      }
    );
  }

  private getCategories() {
    this.skillService.getSkillCategories().subscribe(
      (response: any[]) => {
        this.categories = response["data"];
        this.currentCategory = this.categories[0];

        this.getSkills(true);
      },
      error => {
        console.log(error);
        console.log("Service calls failed!");
      }
    );
  }

  ngOnInit() {
    this.subscriptions.push(
      this.route.url.subscribe(url => {
        //always the first part is role
        this.role = url.values().next().value.path;
        this.roleSource.next();
      })
    );
    this.getCategories();
  }

  private add(): void {
    this.fields = this.fgService.getFields(this.columns[this.role], null);
    if (this.role == "career-seeker") {
      this.fields[0]['options'] = this.columns["career-seeker"]["options"];
    }
    else {
      this.fields[0]['options'] = this.columns["mentor"]["options"];
    }
    const dialogRef = this.dialog.open(FormDialogComponent, {
      width: this.dialogWidth,
      data: {
        title: "New " + this.currentCategory["name"] + " Skill",
        fields: this.fields
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed", result);
      this.assessmentService
        .createSelfAssessment({
          skillId: result.skill,
          rating: result.rating,
          comment: result.comment,
          categoryId: this.currentCategory["id"],
          userId: this.globalCfg.getUserId()
        })
        .subscribe(
          response => {
            console.log("Created!");
            this.msgService.showSuccess("Skill rating has been added");
            this.getSkills(false);
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
        var sub = this.skillFetchedValue$.subscribe(() => {
          this.fields = this.fgService.getFields(this.columns[this.role], event.record);
          if (this.role == "career-seeker") {
            this.fields[0]['options'] = this.columns["career-seeker"]["options"];
          }
          else {
            this.fields[0]['options'] = this.columns["mentor"]["options"];
          }
          const dialogRef = this.dialog.open(FormDialogComponent, {
            width: this.dialogWidth,
            data: {
              title: "Update " + this.currentCategory["name"] + " Skill",
              fields: this.fields
            }
          });
          dialogRef.afterClosed().subscribe(result => {
            console.log("The dialog was closed", result);
            sub.unsubscribe();
            this.assessmentService
              .updateSelfAssessment({
                id: event.record.id,
                skillId: result.skill,
                rating: result.rating,
                comment: result.comment,
                categoryId: this.currentCategory["id"],
                userId: this.globalCfg.getUserId()
              })
              .subscribe(
                response => {
                  console.log("Updated!");
                  this.msgService.showSuccess("Skill rating has been updated");
                  this.load(this.page);
                },
                error => {
                  console.log("Failed to update!", error);
                }
              );
          });
        });
        this.getSkills(true);
        break;
      case "delete":
        console.log("Delete record");
        const cnfmdialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: "450px",
          data: {
            title: "Delete " + this.title,
            message:
              "Are you sure you want to delete " + event.record.skill.name + "?"
          }
        });
        cnfmdialogRef.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          if (result === "yes") {
            this.assessmentService
              .deleteSelfAssessment(event.record.id)
              .subscribe(
                response => {
                  console.log("Deleted!");
                  this.getSkills(false);
                  this.msgService.showSuccess("Skill rating has been deleted");
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

  private handleLevelAction(rec, level) {
    if (rec[level].hasRecommendedForNextLevel) {

      var fieldsArr = [
        { name: 'rating', displayName: 'Rating', required: true, disabled: true },
        { name: 'recommendation', displayName: 'Recommendation', type: 'longstring', required: true, disabled: true },
        { name: 'hasRecommendedForNextLevel', displayName: 'Recommended for next level?', type: 'boolean', disabled: true }
      ];

      var fields = this.fgService.getFields(
        fieldsArr,
        rec[level]
      );
      const dialogRef = this.dialog.open(FormDialogComponent, {
        width: '450px',
        data: {
          title: "Assessment Feedback",
          fields: fields,
          viewOnly: true
        }
      });

      return;
    } if (rec[level].hasPendingRequest) {

      const dialogRef = this.dialog.open(AssessmentRequestsDialogComponent, {
        width: '1024px',
        data: {
          role: this.role,
          requestId: rec[level].requestId
        }
      });

    } else {

      const dialogRef = this.dialog.open(SearchGuruDialogComponent, {
        width: "1600px",
        height: "640px",
        data: {
          skills: rec.skill.name,
          levelId: rec[level].id,
          role: this.role,
          requestBtnLabel: 'Request Assessment'
        }
      });
      var roles = this.globalCfg.getRoles();
      this.globalCfg.userSource.next();
      this.ebService.roleSource.next(roles);

      dialogRef.afterClosed().subscribe((result: any) => {

        //create assessment request
        this.assessmentService.createAssessmentRequest({
          note: " ",
          mentorUserId: result.mentorUserId,
          seekerUserId: this.globalCfg.getUserId(),
          levelId: rec[level].id,
          selfAssessmentId: rec.id
        }).subscribe(() => {
          this.msgService.showSuccess('Assessment request has been submitted for approval.');
        });

      });
    }

  }

  // Requriement Assement
  private onActionableClicked(event) {
    console.log("onActionableClicked:", event);

    var action = event.actionName;
    var rec = event.record;

    switch (action) {

      case 'profile.name':
        const dialogRef2 = this.dialog.open(ViewCareerProfileComponent, {
          width: "640px",
          data: { cProfileId:  event.record.profile.id}
        });
        break;

      case 'level1.action':
        this.handleLevelAction(rec, 'level1');
        break;
      case 'level2.action':
        this.handleLevelAction(rec, 'level2');
        break;
      case 'level3.action':
        this.handleLevelAction(rec, 'level3');
        break;
      default:
        console.log('Unhandled action: ', action);
    }
  }

  private getCategorywiseData(event) {
    console.log("Tab: ", arguments);

    this.currentCategory = this.categories[event.index];
    this.getSkills(false);
  }

  private onPageChanged(page) {
    this.load(page);
    this.page = page;
  }
}
