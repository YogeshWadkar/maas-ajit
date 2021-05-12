import { Component } from "@angular/core";

import { OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { FormDialogComponent } from "../form-dialog/form-dialog.component";
import { ConfirmationDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material";
import { FieldGeneratorService } from "../../services/field-generator.service";
import { AssessmentService } from "../../services/assessment.service";
import { SkillService } from "../../services/skill.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { FormBase } from "../dynamic-form/form-base";

@Component({
  selector: "tt-overall-assessment",
  templateUrl: "./overall-assessment.component.html",
  styleUrls: ["./overall-assessment.component.css"]
})
export class OverallAssessmentComponent implements OnInit {
  title = "Overall Assessment";
  dialogWidth = "250px";

  private skillsSource = new Subject<any>();
  private skillFetchedValue$ = this.skillsSource.asObservable();

  categories = [];
  currentCategory = {};

  data: any = [];
  columns = [
    { name: "skill.name", displayName: "Skill", required: true },
    {
      name: "rating",
      displayName: "Self Rating",
      required: true,
      type: "widget",
      widget: { type: "rating" }
    },
    {
      name: "agvMentorRating",
      displayName: "Mentors Rating",
      required: true,
      type: "widget",
      widget: { type: "rating" }
    }
  ];

  fields: FormBase<any>[];
  skills: any[] = [];
  subscriptions: any = [];

  constructor(
    private dialog: MatDialog,
    private fgService: FieldGeneratorService,
    private assessmentService: AssessmentService,
    private skillService: SkillService,
    private globalCfg: GlobalCfgService
  ) {
    this.subscriptions.push(
      this.skillFetchedValue$.subscribe(() => this.load())
    );
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private load() {
    this.assessmentService
      .getOverallAssements(this.currentCategory["id"])
      .subscribe(
        response => {
          let arr: any = response["result"];

          // arr.forEach(element => {
          //   element['actions'] = [{name: 'edit', tip: 'Edit'}, {name: 'delete', tip: 'Delete'}];
          // });

          this.data = arr;
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
        response.forEach(element => {
          this.skills.push({
            id: element.id,
            value: element.name
          });
        });
        this.columns[0]["options"] = this.skills;

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
        this.categories = response;
        this.currentCategory = response[0];

        this.getSkills(true);
      },
      error => {
        console.log(error);
        console.log("Service calls failed!");
      }
    );
  }

  ngOnInit() {
    this.getCategories();
  }

  private add(): void {
    this.fields = this.fgService.getFields(this.columns, null);
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
          this.fields = this.fgService.getFields(this.columns, event.record);
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
                categoryId: this.currentCategory["id"]
              })
              .subscribe(
                response => {
                  console.log("Updated!");
                  this.load();
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
                  this.load();
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

  private getCategorywiseData(event) {
    console.log("Tab: ", arguments);

    this.currentCategory = this.categories[event.index];
    this.getSkills(false);
  }
}
