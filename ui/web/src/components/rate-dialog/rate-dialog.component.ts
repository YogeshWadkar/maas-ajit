import { Component, Input, Inject } from "@angular/core";

import { OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  selector: "tt-rate-dialog",
  templateUrl: "./rate-dialog.component.html",
  styleUrls: ["./rate-dialog.component.css"]
})
export class RateDialogComponent implements OnInit {
  rating: any;

  constructor(
    private dialogRef: MatDialogRef<RateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RateDialogData
  ) {}

  ngOnInit() {}

  cancel() {
    this.dialogRef.close({ action: "no" });
  }

  confirm() {
    this.dialogRef.close({ action: "yes", rating: this.rating });
  }

  captureRating(rating) {
    this.rating = rating;
  }
}

export interface RateDialogData {
  userBeingRated: any;
  message: string;
}
