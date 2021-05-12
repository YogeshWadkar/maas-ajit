import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { MatDialog } from "@angular/material";

@Component({
  selector: "tt-ad-banner",
  templateUrl: "./ad-banner.component.html",
  styleUrls: ["./ad-banner.component.css"]
})
export class AdBannerComponent implements OnInit {

  @Input()
  slides: any[] = [];

  @Output()
  selected: any = new EventEmitter();

  constructor(private dialog: MatDialog) {}

  ngOnInit() {}
  
  enrol(slide) {

    this.selected.emit(slide);

    // const dialogRef = this.dialog.open(EnrolDialogComponent, {
    //   width: this.dialogWidth,
    //   data: {
    //     title: "Join program",
    //     form_id: value
    //   }
    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   console.log("The dialog was closed", result);
    //   console.log("User has requested for enrolment");
    // });
  }
}
