import { Component, OnInit } from "@angular/core";
import { ViewOnlyProfileComponent } from "../viewonly-profile/viewonly-profile.component";
import { MatDialog } from "@angular/material";
import { FormBase } from "../dynamic-form/form-base";
import { FieldGeneratorService } from "../../services/field-generator.service";
import { CompanyService } from "src/services/company.service";
import { FormDialogComponent } from "../form-dialog/form-dialog.component";
import { UserService } from '../../services/user.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: "tt-manage-sponsor",
  templateUrl: "./manage-sponsor.component.html",
  styleUrls: ["./manage-sponsor.component.css"]
})
export class ManageSponsorComponent implements OnInit {
  title = "Sponsors";
  dialogWidth = "500px";
  data: any[];
  totalCount: any;
  page: any;
  fields: FormBase<any>[];
  companiesList: any[] = [];

  columns: any[] = [
    {
      name: "company.name",
      displayName: "Company",
      required: true,
      type: "selection"
    },
    { name: "email", displayName: "Email", required: true, validationType: "email" },
    { name: "mobileNo", displayName: "Contact Number", required: true, validationType: "mobileNo"},
    {
      name: "fullName",
      displayName: "Name",
      actionable: true,
      editable: false
    },
    {
      name: "createdon",
      displayName: "Created On",
      type: "date",
      format: "MM/DD/YYYY hh:mm A",
      editable: false
    },
    { name: "actions", displayName: "Actions", editable: false }
  ];

  addSponsorColumns: any[] = [
    {
      name: "firstName",
      displayName: "First Name",
      required: true
    },
    {
      name: "lastName",
      displayName: "Last Name",
      required: true
    }
  ];

  constructor(
    private dialog: MatDialog,
    private fgService: FieldGeneratorService,
    private companyservice: CompanyService,
    private userService: UserService,
    private msgService: MessageService
  ) {
    this.getCompanies();
  }

  ngOnInit() {
    this.loadSponsors();
  }

  private loadSponsors(page?) {
    this.userService.getSponsors(page).subscribe(
      (response: any)=> {
        var arr = response['data'];
        arr.forEach(item => {
          item['fullName'] = item['firstName'] + ' ' + item['lastName'];
          item.actions = [];
          if (!item.isActive) {
            item.actions.push({name: 'panorama_fish_eye', tip: 'Activate'});
          } else {
            item.actions.push({name: 'lens', tip: 'De-activate'});
          }
        });
        this.data = arr;
        this.totalCount = response['count'];
      }
    );
  }

  private getCompanies() {
    this.companyservice.getCompanies().subscribe(
      response => {
        let arr: any = response["data"];

        arr.forEach(element => {
          this.companiesList.push({
            id: element.id,
            value: element.name
          });
        });
        this.columns[0]["options"] = this.companiesList;
      },
      error => {
        console.log(error);
        console.log("Service call failed!");
      }
    );
  }

  private addSponsor(): void {
    var addSponsorfields: any[] = this.addSponsorColumns.concat(this.columns);
    this.fields = this.fgService.getFields(addSponsorfields, null);

    const dialogRef = this.dialog.open(FormDialogComponent, {
      width: this.dialogWidth,
      data: { title: "New Sponsor", fields: this.fields }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed", result);

      if (result) {
        result.companyId = result['company.name'];

        this.userService.addSponsor(result).subscribe(
          ()=> {
            this.msgService.showSuccess('Sponsor added successfully!');
            this.loadSponsors(this.page);
          }
        );
      }
    });
  }

  private onActionClicked(event) {
    console.log("onActionClicked:", event);
    switch (event.actionName.name) {
      case "lens":
        var rec = event.record;
        //de-activate sponsor
        this.userService.updateSponsorStatus(rec.id, false).subscribe(
          ()=> {
            this.msgService.showSuccess('Sponsor de-activated successfully!');
            this.loadSponsors(this.page);
          }
        );
        break;
      case "panorama_fish_eye":
        var rec = event.record;
        //activate sponsor
        this.userService.updateSponsorStatus(rec.id, true).subscribe(
          ()=> {
            this.msgService.showSuccess('Sponsor activated successfully!');
            this.loadSponsors(this.page);
          }
        );
        break;
      default:
        console.log("Unhandled action. Please check!");
    }
  }

  private onActionableClicked(event) {
    console.log("onActionableClicked:", event);

    switch(event.actionName) {
      case "fullName":
        var userId = event.record.id;
        const dialogRef = this.dialog.open(ViewOnlyProfileComponent, {
          width: "2400px",
          data: { userId: userId }
        }); 
      break;
      default:
        console.log("Unhandled actionable: ", event.actionName);
    }
  }

  private onPageChanged(page) {
    this.loadSponsors(page);
    this.page = page;
  }
}
