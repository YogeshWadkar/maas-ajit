import { Component, OnInit, Inject, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import {
  MatAutocompleteSelectedEvent,
  MatAutocomplete
} from "@angular/material/autocomplete";
import { MatChipInputEvent } from "@angular/material/chips";
import { Observable, Subject } from 'rxjs';
import { map, startWith, filter } from "rxjs/operators";
import { SkillService } from 'src/services/skill.service';

@Component({
  selector: 'app-manage-profiles-dialog',
  templateUrl: './manage-profiles-dialog.component.html',
  styleUrls: ['./manage-profiles-dialog.component.css'],
  encapsulation : ViewEncapsulation.None,
})
export class ManageProfilesDialogComponent implements OnInit {
  skills: any[] = [];

  // skillsCtrl = new FormControl(this.skills, Validators.required);

  careerProfilesFormGroup = new FormGroup({
    name: new FormControl(),
    altName: new FormControl(),
    description: new FormControl(),
    // tools: new FormControl(),
    skills: new FormControl()
  });

  // get profileSkills() { return this.careerProfilesFormGroup.get('skills'); }

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredSkills: Observable<any[]>;
  allSkills: any[] = [];
  
  @ViewChild("skillInput", { static: false }) skillInput: ElementRef<HTMLInputElement>;
  @ViewChild("auto", { static: false }) matAutocomplete: MatAutocomplete;

  selectedSkillsId: any[] = [];

  public skillsSource = new Subject<any>();
  public skillsFetchedValue$ = this.skillsSource.asObservable();
  
  constructor(
    public dialogRef: MatDialogRef<ManageProfilesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private skillService: SkillService,
  ) { }

  ngOnInit() {
    this.loadSkills();
    if (this.data.data) {
      this.careerProfilesFormGroup.setValue(this.data.data);
      this.skills = this.data.data.skills;
    }
  }

  private loadSkills() {
    this.skillService.getPageWiseSkills().subscribe(
      response => {
        this.allSkills = response["data"];
        console.log("skills in profiles dialog", this.allSkills);

        this.filteredSkills = this.careerProfilesFormGroup.get("skills").valueChanges.pipe(
          startWith(null),
          map(skill => this.filterOnValueChange(skill))
        );
      },
      error => {
        console.log(error);
        console.log("Service calls failed!");
      }
    );
  }

  addSkill(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      // Add our skill
      const value = event.value;
      if ((value || '').trim()) {
        this.selectSkillByName(value.trim());
      }

      this.resetInputs();
    } else {
      return;
    }
  }

  removeSkill(skill: any): void {
    const index = this.skills.indexOf(skill);

    if (index >= 0) {
      this.skills.splice(index, 1);
      this.resetInputs();
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectSkillByName(event.option.value);
    this.resetInputs();
  }

  private resetInputs() {
    // clear input element
    this.skillInput.nativeElement.value = '';
    this.careerProfilesFormGroup.get("skills").setValue(null);
  }

  private filterOnValueChange(skillName: any | null): any[] {
    let result: any[] = [];

    let allSkillsListSelected = this.allSkills.filter(skill => this.skills.indexOf(skill) < 0);
    if (skillName) {
      result = this.filterSkill(allSkillsListSelected, skillName);
    } else {
      result = allSkillsListSelected.map(skill => skill.name);
    }
    return result;
  }

  private filterSkill(skillList: any[], skillName: any): any[] {
    let filteredSkillList: any[] = [];
    const filterValue = skillName.toLowerCase();
    let skillsMatchingSkillName = skillList.filter(skill => skill.name.toLowerCase().indexOf(filterValue) === 0);
    if (skillsMatchingSkillName.length) {

      filteredSkillList = skillsMatchingSkillName;
      return filteredSkillList.map(skill => skill.name);
    } else {

      filteredSkillList = skillList;
      return;
    }
  }

  private selectSkillByName(skillName) {
    let foundSkill = this.allSkills.filter(skill => skill.name == skillName);
    if (foundSkill.length) {
      this.skills.push(foundSkill[0]);
    }
  }

  onSubmit(values) {

    this.skills.forEach(item => {
      this.selectedSkillsId.push(item["id"]);
    });

    values["skills"] = this.selectedSkillsId;
    this.dialogRef.close(values);
  }

  cancel() {
    this.dialogRef.close();
  }
}

export interface DialogData {
  title: string;
  data: any;
}
