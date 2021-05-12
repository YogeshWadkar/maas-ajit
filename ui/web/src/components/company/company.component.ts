import { Component } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";

import { OnInit } from "@angular/core";
import { FormBase } from "../dynamic-form/form-base";
import { FieldGeneratorService } from "../../services/field-generator.service";
import { FormDialogComponent } from "../form-dialog/form-dialog.component";
import { ConfirmationDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { MessageService } from "../../services/message.service";
import { CompanyService } from "src/services/company.service";

@Component({
  selector: "tt-company",
  templateUrl: "./company.component.html",
  styleUrls: ["./company.component.css"]
})
export class CompanyComponent implements OnInit {
  title = "Company";
  data: any = [];
  dialogWidth = "250px";

  columns = [
    { name: "name", displayName: "Company Name", required: true },
    { name: "actions", displayName: "Actions", type: "actions" }
  ];

  fields: FormBase<any>[];
  company: any[] = [];
  totalCount: any;
  page: any;

  constructor(
    private dialog: MatDialog,
    private companyservice: CompanyService,
    private fgService: FieldGeneratorService,
    private msgService: MessageService
  ) {
    // this.getCategories();
  }

  private load(page?) {
    this.companyservice.getCompanies(page).subscribe(
      response => {
        let arr: any = response["data"];
        this.totalCount = response["count"];

        arr.forEach(element => {
          element["actions"] = [
            { name: "edit", tip: "Edit" },
            { name: "delete", tip: "Delete" }
          ];
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

  private addCompany(): void {
    this.fields = this.fgService.getFields(this.columns, null);

    const dialogRef = this.dialog.open(FormDialogComponent, {
      width: this.dialogWidth,
      data: { title: "New " + this.title, fields: this.fields }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed", result);
      this.companyservice
        .createCompany({
          name: result.name,
          companyId: result.company
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
        // console.log('CATEGORIES: ', this.companies);
        this.fields = this.fgService.getFields(this.columns, event.record);
        const dialogRef = this.dialog.open(FormDialogComponent, {
          width: this.dialogWidth,
          data: {
            title: "Edit " + this.title,
            fields: this.fields
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          this.companyservice
            .updateCompany({
              id: event.record.id,
              name: result.name,
              companyId: result.company
            })
            .subscribe(
              response => {
                console.log("Company updated!");
                this.msgService.showSuccess("Company has been updated");
                this.load(this.page);
              },
              error => {
                console.log("Failed to update company!", error);
              }
            );
        });
        break;
      case "delete":
        console.log("Delete record");
        const cnfmdialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: "450px",
          data: {
            title: "Delete " + this.title,
            message:
              "Are you sure you want to delete " + event.record.name + "?"
          }
        });
        cnfmdialogRef.afterClosed().subscribe(result => {
          console.log("The dialog was closed", result);
          if (result === "yes") {
            this.companyservice.deleteCompany(event.record.id).subscribe(
              response => {
                console.log("Company deleted!");
                this.msgService.showSuccess("Company has been deleted");
                this.load(this.page);
              },
              error => {
                console.log("Failed to delete company!", error);
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
    this.load(page);
    this.page = page;
  }

  // private getCategories() {
  //   this.companyservice.getCompanies().subscribe(
  //     (response) => {
  //       let arr: any = response;

  //       arr.forEach(element => {
  //         this.categories.push({
  //           id: element.id,
  //           value: element.name
  //         });
  //       });
  //       this.columns[1]['options'] = this.categories;
  //     },
  //       (error) => {
  //         console.log(error);
  //         console.log('Service call failed!');
  //       }
  //   );
  // }
}
