
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from "@angular/core";
import { MatTableDataSource, MatPaginator, MatSort } from "@angular/material";
import {MatPaginatorModule} from '@angular/material/paginator';

import { OnInit } from "@angular/core";
import { UserService } from "../../services/user.service";
import { Subject } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material";
import { ViewOnlyProfileComponent } from "../viewonly-profile/viewonly-profile.component";
import { ImportMentorComponent } from "../import-mentor-dialog/import-mentor-dialog.component";
import { MessageService } from "../../services/message.service";
import { EventBusService } from "../../services/event-bus.service";
import { StartupService } from "../../services/startup.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { FieldGeneratorService } from 'src/services/field-generator.service';
import { FormDialogComponent } from '../form-dialog/form-dialog.component';

@Component({
  selector: "tt-search-guru",
  templateUrl: "./search-guru.component.html",
  styleUrls: ["./search-guru.component.css"]
})
export class SearchGuruComponent implements OnInit {

  @Input()
  columns: number = 5;

  @Input()
  searchBy: string = "byName";

  @Input()
  searchTxt: string = "";

  @Input()
  levelId: number;

  @Input()
  role: string;

  @Input()
  requestBtnLabel: string = 'Request Time'

  @Input()
  eventOnSelection: any = false;

  @Output()
  mentorSelected: any = new EventEmitter();

  STRLEN: number = 80;

  private title = "Search Mentor";
  active = "active";
 

  private skills: string;

  private mentorRoleId: number;
  private mentors: any[] = [];
  companyId: any;
  data: any = [];
  subscriptions: any = [];
  page: any;

  displayedColumns: any;
  dataSource: MatTableDataSource<any>;
  
  @Input("pagination")
  pagination: boolean = true;
  @Input("totalCount")
  totalCount: any;

   //Pagination
   private length: number = null;
   pageSize: number = 20;
   pageSizeOptions: number[] = [20, 40, 100];
   @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
 
   //Sorting
   @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private userService: UserService,
    private route: ActivatedRoute,
    private msgService: MessageService,
    private ebService: EventBusService,
    private startupService: StartupService,
    private globalCfgService: GlobalCfgService,
    private fgService: FieldGeneratorService,
  ) {

    this.subscriptions.push(
      this.globalCfgService.userFetchedValue$.subscribe(() => {
        console.log(
          "-----> COMPANY: ",
          this.globalCfgService.getFullUserObj().companyId
        );
        this.companyId = this.globalCfgService.getFullUserObj().companyId;

        this.subscriptions.push(
          this.ebService.roleNameFetchedValue$.subscribe(roleName => {
            if (this.mentorRoleId) {
              this.loadMentors(this.mentorRoleId, true);
            }
          })
        );

        this.subscriptions.push(
          this.ebService.roleFetchedValue$.subscribe(roles => {
            roles.forEach(role => {
              if (role.name == "mentor") {
                this.mentorRoleId = role.id;
                this.ebService.roleNameSource.next(role.name);
              }
            });
          })
        );

        this.startupService.loadRoles();
      })
    );
  }
  

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  getBooktimeLink(mentorId) {
    return "/career-seeker/book-schedule/" + mentorId;
  }

  private loadMentors(roleId, isActive = true,page?) {
    this.userService.getUsersByRole(roleId, isActive, this.companyId,page).subscribe(
      (response: any[]) => {
        let arr: any;
        this.mentors = response['data'];
        this.length = response["count"];
      }, 
      error => {
        console.log("Service error:", error);
      }
    ); 
  }
  ngOnInit() {
    if (!this.role) {
      this.route.url.subscribe(url => {
        // console.log("URL: ", url, url.length, url.values().next().value.path);
        //always the first part is role
        this.role = url.values().next().value.path;
        // console.log('ROLE: ', this.role);
        this.ebService.roleNameSource.next(this.role);
      });
    }
  } 
  
  private loadMentorsByName(searchTxt) {
    this.userService
      .getUsersByName(this.mentorRoleId, searchTxt, true, this.companyId)
      .subscribe(
        (response: any[]) => {
          this.mentors = response['data'];
        },
        error => {
          console.log("Service error:", error);
        }
      );
  }

  private loadMentorsByLocation(searchTxt) {
    this.userService
      .getUsersByLocation(this.mentorRoleId, searchTxt, true, this.companyId)
      .subscribe(
        (response: any[]) => {
          this.mentors = response["result"];
        },
        error => {
          console.log("Service error:", error);
        }
      );
  }

  private loadMentorsBySkills(searchTxt) {
    this.userService
      .getUsersBySkills(this.mentorRoleId, searchTxt, true, this.companyId)
      .subscribe(
        (response: any[]) => {
          this.mentors = response["result"];
        },
        error => {
          console.log("Service error:", error);
        }
      );
  }

  loadMentorsByStatus(status) {
    var isActive = status == "active" ? true : false;
    this.loadMentors(this.mentorRoleId, isActive);
  }

  private getSkillsList(skillsList, all) {
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

  private viewProfile(userId) {
    const dialogRef = this.dialog.open(ViewOnlyProfileComponent, {
      width: "2400px",
      data: { userId: userId }
    });
  }

  private getSearchByTxt() {
    var txt = "";
    switch (this.searchBy) {
      case "byName":
        txt = "Name";
        break;
      case "byLocation":
        txt = "Location";
        break;
      case "bySkills":
        txt = "Comma Separated Skills";
        break;
      default:
        txt = "Name";
    }
    return txt;
  }

  private clearFilter() {
    console.log("clearFilter: ", this.searchBy, this.searchTxt);
    this.searchBy = "byName";
    this.searchTxt = "";

    this.loadMentors(this.mentorRoleId, true);
  }

  private applyFilter() {
    var by = this.searchBy;

    console.log("Search by:", by);

    switch (by) {
      case "byName":
        this.loadMentorsByName(this.searchTxt);
        break;
      case "byLocation":
        this.loadMentorsByLocation(this.searchTxt);
        break;
      case "bySkills":
        this.loadMentorsBySkills(this.searchTxt);
        break;
      case "byStatus":
        this.loadMentorsByStatus(this.active);
        break;
    }
  }

  private importMentors() {
    const dialogRef = this.dialog.open(ImportMentorComponent, {
      width: "540px",
      // height: '480px',
      data: { companyId: this.companyId }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed", result);
      if (result.action === "yes") {
        this.loadMentors(this.mentorRoleId);
      }
    });
  }

  inactivateUser(userId) {
    var isActive = this.active == "active" ? true : false;
    this.userService.updateUserStatus(userId, false).subscribe(
      () => {
        this.msgService.showSuccess("User has been marked as In-active.");
        this.loadMentors(this.mentorRoleId, isActive);
      },
      error => {}
    );
  }

  activateUser(userId) {
    var isActive = this.active == "active" ? true : false;
    this.userService.updateUserStatus(userId, true).subscribe(
      () => {
        this.msgService.showSuccess("User has been marked as Active.");
        this.loadMentors(this.mentorRoleId, isActive);
      },
      error => {}
    );
  }

  private onPageChanged(page) {
    this.loadMentors(page);
    this.page = page;
  }

  request(userId) {

    if (this.eventOnSelection) {
      this.mentorSelected.next(userId);
    } else {
      var url = this.getBooktimeLink(userId);
      this.router.navigateByUrl(url);
    }
  }

  inviteMentors() {
    var fields = this.fgService.getFields(
      [
        {
          name: "emails",
          displayName: "Emails (comma separated)",
          type: "longstring",
          required: true,
          pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/
        }
      ],
      {}
    );
    const dialogRef = this.dialog.open(FormDialogComponent, {
      width: "450px",
      data: {
        title: "Invite Mentors",
        saveBtnTxt: "Send Invite",
        fields: fields
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed", result);
      if (!result) {
        return;
      }
      
      this.userService.invite(result.emails).subscribe(
        success => {
          this.msgService.showSuccess("Invitations have been sent!");
          console.log("success message", success);
        },
        error => {
          this.msgService.showError("Failed to send invitations!");
        }
      );
    });
  }
}

