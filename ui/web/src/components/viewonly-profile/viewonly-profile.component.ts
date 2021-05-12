import {
  Component,
  Inject
} from "@angular/core";

import { OnInit } from "@angular/core";
import { MiscService } from "../../services/misc.service";
import { UserService } from "../../services/user.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Subject } from "rxjs";
import { AssessmentService } from "../../services/assessment.service";

import {environment} from "../../environments/environment";

@Component({
  selector: "tt-viewonly-profile",
  templateUrl: "./viewonly-profile.component.html",
  styleUrls: ["./viewonly-profile.component.css"]
})
export class ViewOnlyProfileComponent implements OnInit {
  user: object;

  location: string = "";

  private userSource = new Subject<any>();
  private userFetchedValue$ = this.userSource.asObservable();
  skillsData: any[];
  skillsColumns = [
    { name: "skill.name", displayName: "Skill" },
    {
      name: "rating",
      displayName: "Rating",
      type: "widget",
      widget: { type: "rating" }
    }
  ];
  certificationData: any[];
  certificationColumns = [
    { name: "name", displayName: "Certification" },
    {
      name: "date",
      displayName: "Certified On",
      type: "date",
      format: "MM/DD/YYYY"
    },
    { name: "certifiedBy", displayName: "Certified By" },
    { name: "description", displayName: "Description" }
  ];
  workexpData: any[];
  workexpColumns = [
    { name: "organisation", displayName: "Organisation" },
    { name: "designation", displayName: "Designation" },
    { name: "location", displayName: "Location" },
    {
      name: "startDt",
      displayName: "Worked From",
      type: "date",
      format: "MM/DD/YYYY"
    },
    {
      name: "endDt",
      displayName: "Worked Till",
      type: "date",
      format: "MM/DD/YYYY"
    },
    { name: "isCurrentOrg", displayName: "Current Work Here?" }
  ];
  educationData: any[];
  educationColumns = [
    { name: "course", displayName: "Course" },
    { name: "specialisation", displayName: "Specialisation" },
    { name: "board", displayName: "Board/University" },
    { name: "fromDt", displayName: "From", type: "date", format: "MM/DD/YYYY" },
    { name: "toDt", displayName: "To", type: "date", format: "MM/DD/YYYY" }
  ];
  subscriptions: any = [];
  userdata1: any;
  userrole: any;
  constructor(
    private miscService: MiscService,
    private userService: UserService,
    private assessmentService: AssessmentService,
    private globalCfgService: GlobalCfgService,
    private dialogRef: MatDialogRef<ViewOnlyProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit() {
    this.user = this.globalCfgService.getFullUserObj();
    this.userdata1 = this.user["signupAs"];
    this.subscriptions.push(
      this.userFetchedValue$.subscribe(user => {
        this.user = user;
        this.userrole = this.user["role"]["name"];
        this.userService.getDetail(user.id).subscribe(details => {
          var arr: any[] = [
            details[0]["city"]["name"],
            details[0]["state"]["name"],
            details[0]["country"]["name"]
          ];

          this.location = arr.join().replace(/,/g, ", ");
        });

        // this.loadCountries();

        // if (this.selectedCountry) {
        //   this.loadStates(this.selectedCountry);
        // }
        // if (this.selectedState) {
        //   this.loadCities(this.selectedState);
        // }

        this.loadSkills();
        this.loadCertifications();
        this.loadEducationDetail();
        this.loadWorkExp();
      })
    );

    if (this.data.userId) {
      console.log("Loading detail for user: ", this.data.userId);
      this.userService.getUserDetail(this.data.userId).subscribe(
        users => {
          this.userSource.next(users['data'][0]);
        },
        error => {
          console.log("Service error: ", error);
        }
      );
    }
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // private loadCountries() {
  //   this.miscService.getCountries().subscribe(
  //     (response: any[])=> {
  //       this.countries = response;
  //     },
  //     (error)=> {
  //       console.log('Service failed:', error);
  //     }
  //   );
  // }

  // public loadStates(countryId) {
  //   console.log('selectCountry:', countryId);
  //   this.miscService.getStates(countryId).subscribe(
  //     (response: any[])=> {
  //       this.states = response;
  //     },
  //     (error)=> {
  //       console.log('Service failed:', error);
  //     }
  //   );
  // }

  // private loadCities(stateId) {
  //   console.log('selectState:', stateId);
  //   this.miscService.getCities(stateId).subscribe(
  //     (response: any[])=> {
  //       this.cities = response;
  //     },
  //     (error)=> {
  //       console.log('Service failed:', error);
  //     }
  //   );
  // }

  private loadSkills() {
    this.assessmentService.getAllUserSkills(this.user["id"]).subscribe(
      (response: any[]) => {
        this.skillsData = response["data"];
      },
      error => {
        console.log("Service error: ", error);
      }
    );
  }

  private loadCertifications() {
    this.userService.getCertifications(this.user["id"]).subscribe(
      (response: any[]) => {
        this.certificationData = response["data"];
      },
      error => {
        console.log("Service error: ", error);
      }
    );
  }

  private loadWorkExp() {
    this.userService.getWorkExpDetail(this.user["id"]).subscribe(
      (response: any[]) => {
        this.workexpData = response["data"];
      },
      error => {
        console.log("Service error: ", error);
      }
    );
  }

  private loadEducationDetail() {
    this.userService.getEducationDetail(this.user["id"]).subscribe(
      (response: any[]) => {
        this.educationData = response["data"];
      },
      error => {
        console.log("Service error: ", error);
      }
    );
  }

  getImgUrl(imgPath) {
    return environment.baseurl + imgPath;
  }
}

export interface DialogData {
  userId: number;
}
