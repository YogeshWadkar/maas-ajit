import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CareerProfileService } from 'src/services/career-profile.service';
import { Subject } from "rxjs";


@Component({
  selector: 'app-view-career-profile',
  templateUrl: './view-career-profile.component.html',
  styleUrls: ['./view-career-profile.component.css']
})
export class ViewCareerProfileComponent implements OnInit {
  cProfileDetail: any;
   user: object;
   private userSource = new Subject<any>();
  private userFetchedValue$ = this.userSource.asObservable();
  
   myarray: Array<{name: string, photopath?: string}> = [
     {name: "python", photopath: "./assets/images/download.jpeg"},
     {name: "datascience", photopath: "./assets/images/download.jpeg"},
     {name: "machine learning", photopath: "./assets/images/download.jpeg"},
     {name: "Robotics", photopath: "./assets/images/download.jpeg"}];
  

  constructor(
    private dialogRef: MatDialogRef<ViewCareerProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private careerProfileService: CareerProfileService,
  ) { }

  ngOnInit() {
    this.loadCareerProfile();
  }

  private loadCareerProfile() {
    this.careerProfileService.getCareerProfileDetail(this.data["cProfileId"]).subscribe((response: any) => {
      this.cProfileDetail = response;
      console.log("view career profile data:", this.cProfileDetail);
    });
  }
}

export interface DialogData {
  cProfileId: number;
}
