import { Component, OnInit, Inject, DoCheck, ViewEncapsulation } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { ElementRef, ViewChild } from "@angular/core";
import {
  MatAutocompleteSelectedEvent,
  MatAutocomplete
} from "@angular/material/autocomplete";
import { MatChipInputEvent } from "@angular/material/chips";
import { Observable, Subject } from "rxjs";
import { map, startWith, filter } from "rxjs/operators";
import { FileUploadService } from "../../services/file-upload.service";
import { ProgramService } from "../../services/program.service";
import { RequestFormService } from "../../services/request-form.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { UserService } from '../../services/user.service';
import { Utils } from '../../services/utils';

import { environment } from '../../environments/environment';

@Component({
  selector: "app-add-program-dialog",
  templateUrl: "./add-program-dialog.component.html",
  styleUrls: ["./add-program-dialog.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class AddProgramDialogComponent implements OnInit, DoCheck {
  imgUploader;
  bannerImgUploader;
  attachment: any;
  mentors: any[] = [];

  mentorsCtrl = new FormControl(this.mentors, Validators.required);

  programFormGroup = new FormGroup({
    name: new FormControl(),
    description: new FormControl(),
    enrolByDt: new FormControl(),
    text: new FormControl(),
    imgPath: new FormControl(),
    bannerImgPath: new FormControl(),
    criteria: new FormControl(),
    selectedForm: new FormControl(),
    // mentorsAllocated: new FormControl(this.mentors, Validators.required),
    startDt: new FormControl(),
    endDt: new FormControl(),
    tncLink: new FormControl(),
   mentorsAllocated: new FormControl()
  });

  forms: any[] = [];

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredMentors: Observable<any[]>;
  allMentors: any[] = [];

  @ViewChild("mentorInput", { static: false }) mentorInput: ElementRef<HTMLInputElement>;
  @ViewChild("auto", { static: false }) matAutocomplete: MatAutocomplete;
  imgPath: string;
  bannerImgPath: string;
  selectedItem: any;
  selectedMentorsId: any[] = [];

  public mentorsSource = new Subject<any>();
  public mentorsFetchedValue$ = this.mentorsSource.asObservable();

  minDate: Date;
  startDate: Date;
  endDate: Date;

  constructor(
    public dialogRef: MatDialogRef<AddProgramDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private uploadService: FileUploadService,
    private formService: RequestFormService,
    private globalCfgService: GlobalCfgService,
    private userService: UserService,
    private utils: Utils
  ) {
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate() - 0);
  }

  ngOnInit() {
    this.imgUploader = this.uploadService.getImgUploader("programpics");
    this.bannerImgUploader = this.uploadService.getProgramBannerUploader("programpics");
    this.loadForms();
    this.loadMentors();

    if (this.data.readOnly) {
      this.programFormGroup.disable();
      //this.programFormGroup.mentorsAllocated.disable()
    }
  }

  ngDoCheck() {
    this.startDate = this.programFormGroup.get("enrolByDt").value;
    this.endDate = this.programFormGroup.get("startDt").value;
  }

  loadForms() {
    this.formService.getFormsByStatus(this.data.data.companyId, this.data.formStatusId).subscribe(
      (result) => {
        this.forms = result['data'];
        var formData = this.data.data;
        if (formData) {
          this.imgPath = formData.imgPath;
          this.bannerImgPath = formData.bannerImgPath;
          this.programFormGroup.setValue(formData);
        }
      }
    );
  }

  loadMentors() {
    this.userService.getCompanyMentors(this.data.data.companyId).subscribe(
      (result: any) => {
        this.allMentors = result.data;

        const result1 = this.allMentors.find(({ source }) => source === 'public');

        let mentorsTempData = [];
        for (let i = 0; i < this.allMentors.length; i++) {
          if (result1.source !== this.allMentors[i].source) {
            mentorsTempData.push(this.allMentors[i]);
            console.log('temparary data', mentorsTempData);
          }
        }

        this.allMentors = mentorsTempData;
        this.allMentors.forEach(item => {
          item["fullName"] = item["firstName"] + " " + item["lastName"];
          console.log("sri data:", item["fullName"]);
        });




        this.filteredMentors = this.mentorsCtrl.valueChanges.pipe(
          startWith(null),
          map(mentor => this.filterOnValueChange(mentor))
        );
      }
    );
  }

  addMentor(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      // Add our mentor
      const value = event.value;
      if ((value || '').trim()) {
        this.selectMentorByName(value.trim());
      }

      this.resetInputs();
      // this.programFormGroup.get("mentorsAllocated").updateValueAndValidity();
    } else {
      return;
    }
  }

  removeMentor(mentor: any): void {
    const index = this.mentors.indexOf(mentor);

    if (index >= 0) {
      this.mentors.splice(index, 1);
      this.resetInputs();
    }

    // this.programFormGroup.get("mentorsAllocated").updateValueAndValidity();
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectMentorByName(event.option.value);
    this.resetInputs();
  }

  private resetInputs() {
    // clear input element
  
    this.mentorInput.nativeElement.value = '';
    // clear control value and trigger programFormGroup.get("mentorsAllocated").valueChanges event

    this.mentorsCtrl.setValue(null);
    // this.programFormGroup.get("mentorsAllocated").setValue(this.mentors);
    // this.programFormGroup.get("mentorsAllocated").updateValueAndValidity();
  }

  private filterOnValueChange(mentorName: any | null): any[] {
    let result: any[] = [];

    let allMentorsListSelected = this.allMentors.filter(mentor => this.mentors.indexOf(mentor) < 0);
    if (mentorName) {
      result = this.filterMentor(allMentorsListSelected, mentorName);
    } else {
      result = allMentorsListSelected.map(mentor => mentor.fullName);
    }
    return result;
  }

  private filterMentor(mentorList: any[], mentorName: any): any[] {
    let filteredMentorList: any[] = [];
    const filterValue = mentorName.toLowerCase();
    let mentorsMatchingMentorName = mentorList.filter(mentor => mentor.fullName.toLowerCase().indexOf(filterValue) === 0);
    if (mentorsMatchingMentorName.length) {

      filteredMentorList = mentorsMatchingMentorName;
      return filteredMentorList.map(mentor => mentor.fullName);
    } else {

      filteredMentorList = mentorList;
      return;
    }

    // return filteredMentorList.map(mentor => mentor.fullName);
  }

  private selectMentorByName(mentorName) {

    let foundMentor = this.allMentors.filter(mentor => mentor.fullName == mentorName);
    if (foundMentor.length) {
      this.mentors.push(foundMentor[0]);
    }
  }

  onSubmit(values) {
    console.log("Manage Program Form Values:", values);

    values["imgPath"] = this.imgPath;
    values["bannerImgPath"] = this.bannerImgPath;

    this.mentors.forEach(item => {
      this.selectedMentorsId.push(item["id"]);
    });

    values["mentors"] = this.selectedMentorsId;
    this.dialogRef.close(values);
  }

  cancel() {
    this.dialogRef.close();
  }

  private onProgramImgSelected(file) {
    this.attachment = file;
    this.imgPath = "/uploads/" + this.attachment.container + "/" + this.attachment.name;
  }

  private onAdImgSelected(file) {
    this.attachment = file;
    this.bannerImgPath =
      "/uploads/" + this.attachment.container + "/" + this.attachment.name;
  }

  getImgUrl(imgPath) {
    return environment.baseurl + imgPath;
  }
}

export interface DialogData {
  title: string;
  formStatusId: number;
  data: any;
  readOnly: boolean;
}
