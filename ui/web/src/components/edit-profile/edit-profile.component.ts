import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";

import { OnInit, ViewChild } from "@angular/core";
import { MiscService } from "../../services/misc.service";
import { UserService } from "../../services/user.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { FormGroup, FormControl } from "@angular/forms";
import { AssessmentService } from "../../services/assessment.service";
import { FileUploadService } from "../../services/file-upload.service";
import { EventBusService } from "../../services/event-bus.service";
import { Utils } from "../../services/utils";
import { environment } from "../../environments/environment";
import { MessageService } from "../../services/message.service";
import { FieldGeneratorService } from "../../services/field-generator.service";
import { FormDialogComponent } from "../form-dialog/form-dialog.component";
import { MatDialog } from "@angular/material";
import { SkillService } from "../../services/skill.service";

@Component({
  selector: "tt-edit-profile",
  templateUrl: "./edit-profile.component.html",
  styleUrls: ["./edit-profile.component.css"]
})
export class EditProfileComponent implements OnInit, OnChanges {
  public uploader;
  dashboardLink = "";
  user: object;
  countries: any[];
  states: any[];
  cities: any[];

  selectedCountry;
  selectedState;
  selectedCity;
  firstName;
  lastName;
  dob;
  maxBirthDate = new Date();
  gender;
  address;
  pincode;
  about;
  photoUrl;

  editProfileFormGroup = new FormGroup({
    firstName: new FormControl(),
    lastName: new FormControl(),
    dob: new FormControl(),
    address: new FormControl(),
    countryId: new FormControl(),
    stateId: new FormControl(),
    cityId: new FormControl(),
    pincode: new FormControl(),
    about: new FormControl(),
    gender: new FormControl()
  });

  skillsData: any[] = [];
  skillsColumns = [
    {
      name: "name",
      displayName: "Skill",
      dataField: "skill.name",
      required: true,
      type: "selection"
    },
    {
      name: "rating",
      displayName: "Rating",
      type: "widget",
      widget: { type: "rating" }
    }
  ];
  certificationData: any[] = [];
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
  workexpData: any[] = [];
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
    {
      name: "isCurrentOrg",
      displayName: "Currently Work Here?",
      type: "boolean"
    }
  ];
  educationData: any[] = [];
  educationColumns = [
    { name: "course", displayName: "Course" },
    { name: "specialisation", displayName: "Specialisation" },
    { name: "board", displayName: "Board/University" },
    { name: "fromDt", displayName: "From", type: "date", format: "MM/DD/YYYY" },
    { name: "toDt", displayName: "To", type: "date", format: "MM/DD/YYYY" }
  ];
  attachment: any;
  profilePicSbjt: any;
  profileStateSbjt: any;
  profilecitySbjt: any;

  dialogWidth: "350px";
  skills: any[];

  public repoUrl = "https://www.youtube.com/watch?v=24tQRwIRP_w";
  public text: any;
  public imageUrl = "http://jasonwatmore.com/_content/images/jason.jpg";
  public dec: any;

  constructor(
    private dialog: MatDialog,
    private miscService: MiscService,
    private userService: UserService,
    private globalCfgService: GlobalCfgService,
    private assessmentService: AssessmentService,
    private uploadService: FileUploadService,
    private busService: EventBusService,
    private utils: Utils,
    private msgService: MessageService,
    private fgService: FieldGeneratorService,
    private skillService: SkillService
  ) {}

  ngOnInit() {
    this.loadAllSkills();

    //keep the original object to restore values
    this.user = this.globalCfgService.getFullUserObj();
    this.text = this.user["firstName"] + " " + this.user["lastName"];
    this.dec = this.user["userDetail"]["about"];
    console.log("user data :", this.dec);
    this.uploader = this.uploadService.getUploader("profilepics");

    this.profilePicSbjt = this.busService.profilepicFetchedValue$.subscribe(
      userDetail => {
        this.user["userDetail"]["photoUrl"] = userDetail["photoUrl"];
      }
    );

    this.profileStateSbjt = this.busService.profileStateFetchedValue$.subscribe(
      state => {
        this.editProfileFormGroup.controls.stateId.setValue(state);
      }
    );

    this.profilecitySbjt = this.busService.profileCityFetchedValue$.subscribe(
      city => {
        this.editProfileFormGroup.controls.cityId.setValue(city);
      }
    );

    this.selectedCountry = this.user["userDetail"]["countryId"];
    this.selectedState = this.user["userDetail"]["stateId"];
    this.selectedCity = this.user["userDetail"]["cityId"];

    this.dashboardLink = "/" + this.user["role"]["name"];

    console.log("USER:", this.user, this.selectedCountry, this.selectedState);
    this.loadCountries();

    if (this.selectedCountry) {
      this.loadStates(this.selectedCountry);
    }
    if (this.selectedState) {
      this.loadCities(this.selectedState);
    }

    this.loadSkills();
    this.loadCertifications();
    this.loadEducationDetail();
    this.loadWorkExp();

    setTimeout(() => {
      this.updateProfile();
    }, 1000);
  }

  private updateProfile() {
    this.editProfileFormGroup.setValue({
      firstName: this.user["firstName"],
      lastName: this.user["lastName"],
      dob: this.user["userDetail"]["dob"],
      gender: this.user["userDetail"]["gender"],
      address: this.user["userDetail"]["address"],
      pincode: this.user["userDetail"]["pincode"],
      countryId: this.user["userDetail"]["countryId"]
        ? this.utils.getObject(
            "id",
            this.user["userDetail"]["countryId"],
            this.countries
          ).code
        : null,
      stateId: this.user["userDetail"]["stateId"]
        ? this.utils.getObject(
            "id",
            this.user["userDetail"]["stateId"],
            this.states
          ).name
        : null,
      cityId: this.user["userDetail"]["cityId"]
        ? this.utils.getObject(
            "id",
            this.user["userDetail"]["cityId"],
            this.cities
          ).name
        : null,
      about: this.user["userDetail"]["about"]
    });
  }

  private loadCountries() {
    this.miscService.getCountries().subscribe(
      (response: any[]) => {
        this.countries = response["data"];
      },
      error => {
        console.log("Service failed:", error);
      }
    );
  }

  onChangeCountry(countryId) {
    this.selectedState = null;
    this.selectedCity = null;
    this.states = [];
    this.cities = [];
    this.editProfileFormGroup.controls.stateId.setValue(this.selectedState);
    this.editProfileFormGroup.controls.cityId.setValue(this.selectedCity);
    this.editProfileFormGroup.controls.pincode.setValue(null);
    this.editProfileFormGroup.controls.address.setValue(null);
    this.loadStates(countryId);
  }

  public loadStates(countryId) {
    let countryObj = this.countries
      ? this.utils.getObject("code", countryId, this.countries)
      : { id: countryId };
    countryObj &&
      this.miscService.getStates(countryObj.id).subscribe(
        (response: any[]) => {
          this.states = response["data"];
          if (this.selectedState) {
            this.busService.profileStateSource.next(this.selectedState);
            this.loadCities(this.selectedState);
          }
        },
        error => {
          console.log("Service failed:", error);
        }
      );
  }

  private loadCities(stateId) {
    let stateObj = this.states
      ? this.utils.getObject("name", stateId, this.states)
      : { id: stateId };
    stateObj &&
      this.miscService.getCities(stateObj.id).subscribe(
        (response: any[]) => {
          this.cities = response["data"];
          if (this.selectedCity) {
            this.busService.profileCitySource.next(this.selectedCity);
          }
        },
        error => {
          console.log("Service failed:", error);
        }
      );
  }

  // private updateProfile() {
  //   console.log('updateProfile:');
  //   this.userService.updateProfile({
  //     id: this.user['userDetail']['id'],
  //     userId: this.user['id'],
  //     dob: this.dob,
  //     address: this.address,
  //     gender: this.gender,
  //     pincode: this.pincode,
  //     photoUrl: this.photoUrl,
  //     avatarUrl: this.photoUrl, //TODO: this.user['avatarUrl'],
  //     countryId: this.selectedCountry,
  //     stateId: this.selectedState,
  //     cityId: this.selectedCity,
  //     about: this.about
  //   }).subscribe(
  //     (response: any[]) => {
  //       console.log('Record updated');
  //     },
  //     (error) => {
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

  private onFileSelected() {
    console.log("File selected");
    this.uploader.response.subscribe(
      response => {
        console.log("File uploaded:", response, JSON.parse(response));

        this.attachment = JSON.parse(response)["result"]["files"]["file"][0];
        var path =
          "/uploads/" + this.attachment.container + "/" + this.attachment.name;

        this.userService
          .updateUserPhoto(this.user["userDetail"]["id"], path)
          .subscribe(
            response => {
              console.log("User updated");
              this.busService.profilepicSource.next(response);
            },
            error => {
              console.log("Service error:", error);
            }
          );
      },
      error => {
        console.log("File upload error:", error);
      }
    );
  }

  private getLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        success => {
          let GEOCODING = `${environment.geoCodeUrl}${success.coords.latitude}%2C${success.coords.longitude}&key=${environment.geoCodeAPI}`;

          this.userService.getLocation(GEOCODING).subscribe(location => {
            let pincodeValue,
              addressArray = location["results"][0].address_components;
            let addressValue = location["results"][0].formatted_address;
            addressArray.forEach(address => {
              if ("country" == address.types[0]) {
                this.selectedCountry = address.short_name;
              } else if ("postal_code" == address.types[0]) {
                pincodeValue = address.short_name;
              } else if ("administrative_area_level_1" == address.types[0]) {
                this.selectedState = address.short_name;
              } else if ("administrative_area_level_2" == address.types[0]) {
                this.selectedCity = address.short_name;
              }
            });

            this.loadStates(this.selectedCountry);
            this.editProfileFormGroup.controls.pincode.setValue(pincodeValue);
            console.log("#posttal " + pincodeValue);
            this.editProfileFormGroup.controls.countryId.setValue(
              this.selectedCountry
            );
            console.log("#country " + this.selectedCountry);
            this.editProfileFormGroup.controls.address.setValue(addressValue);
          });
        },
        error => {}
      );
    }
  }

  onSubmit(profile) {
    let profileObj = Object.assign({}, profile);
    profileObj.id = this.user["userDetail"]["id"];
    (profileObj.photoUrl = this.user["userDetail"]["photoUrl"]),
      (profileObj.avatarUrl = this.user["userDetail"]["avatarUrl"]),
      (profileObj.userId = this.user["id"]);

    var country = this.utils.getObject(
      "code",
      profile.countryId,
      this.countries
    );
    if (country) {
      profileObj.countryId = country.id;
    }

    var state = this.utils.getObject("name", profile.stateId, this.states);
    if (state) {
      profileObj.stateId = state.id;
    }

    var city = this.utils.getObject("name", profile.cityId, this.cities);
    if (city) {
      profileObj.cityId = city.id;
    }
    this.userService.updateProfile(profileObj).subscribe(
      (response: any) => {
        console.log("Record updated");
        this.busService.userNameSource.next({
          firstName: response.firstName,
          lastName: response.lastName
        });
        this.msgService.showSuccess("Profile has been updated");
      },
      error => {
        console.log("Service failed:", error);
      }
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("changes:", changes);
  }

  ngOnDestroy() {
    this.profilePicSbjt.unsubscribe();
    this.profileStateSbjt.unsubscribe();
    this.profilecitySbjt.unsubscribe();
  }

  private loadAllSkills() {
    this.skillService.getAllUnusedSkills().subscribe(
      (response: any[]) => {
        this.skills = [];
        response["data"].forEach(element => {
          this.skills.push({
            id: element.id,
            value: element.name,
            categoryId: element.categoryId
          });
        });
        this.skillsColumns[0]["options"] = this.skills;
      },
      error => {
        console.log(error);
        console.log("Service calls failed!");
      }
    );
  }

  addSkill() {
    var addtnlFields: any[] = [
      { name: "comment", displayName: "Comment" },
      { name: "categoryId", displayName: "Comment", editable: false }
    ];
    var fields = this.fgService.getFields(
      this.skillsColumns.concat(addtnlFields),
      {}
    );
    const dialogRef = this.dialog.open(FormDialogComponent, {
      width: this.dialogWidth,
      data: {
        title: "Add Skill",
        fields: fields
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed", result);

      var selectedSkill = this.utils.getObject("id", result.name, this.skills);

      this.assessmentService
        .createSelfAssessment({
          rating: result.rating,
          comment: result.comment,
          userId: this.globalCfgService.getUserId(),
          skillId: result.name,
          categoryId: selectedSkill.categoryId
        })
        .subscribe(
          () => {
            this.msgService.showSuccess("Skill has been added");
            this.loadSkills();
          },
          error => {
            console.log("Service error: ", error);
          }
        );
    });
  }

  addEducation() {
    var fields = this.fgService.getFields(this.educationColumns, {});
    const dialogRef = this.dialog.open(FormDialogComponent, {
      width: this.dialogWidth,
      data: {
        title: "Add Education Detail",
        fields: fields
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed", result);

      this.userService
        .addEducationDetail({
          course: result.course,
          board: result.board,
          specialisation: result.specialisation,
          userId: this.globalCfgService.getUserId(),
          fromDt: result.fromDt,
          toDt: result.toDt
        })
        .subscribe(
          () => {
            this.msgService.showSuccess("Education detail has been added");
            this.loadEducationDetail();
          },
          error => {
            console.log("Service error: ", error);
          }
        );
    });
  }

  addWorkExp() {
    var fields = this.fgService.getFields(this.workexpColumns, {});
    const dialogRef = this.dialog.open(FormDialogComponent, {
      width: this.dialogWidth,
      data: {
        title: "Add Work Experience",
        fields: fields
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed", result);
      this.userService
        .addWorkExp({
          organisation: result.organisation,
          designation: result.designation,
          location: result.location,
          userId: this.globalCfgService.getUserId(),
          startDt: result.startDt,
          endDt: result.isCurrentOrg ? null : result.endDt,
          isCurrentOrg: result.isCurrentOrg
        })
        .subscribe(
          () => {
            this.msgService.showSuccess("Work experience has been added");
            this.loadWorkExp();
          },
          error => {
            console.log("Service error: ", error);
          }
        );
    });
  }

  addCertification() {
    var fields = this.fgService.getFields(this.certificationColumns, {});
    const dialogRef = this.dialog.open(FormDialogComponent, {
      width: this.dialogWidth,
      data: {
        title: "Add Certification",
        fields: fields
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed", result);
      this.userService
        .addCertification({
          name: result.name,
          certifiedBy: result.certifiedBy,
          description: result.description,
          userId: this.globalCfgService.getUserId(),
          date: result.date
        })
        .subscribe(
          () => {
            this.msgService.showSuccess("Certification has been added");
            this.loadCertifications();
          },
          error => {
            console.log("Service error: ", error);
          }
        );
    });
  }

  getImgUrl(imgPath) {
    return environment.baseurl + imgPath;
  }
}
