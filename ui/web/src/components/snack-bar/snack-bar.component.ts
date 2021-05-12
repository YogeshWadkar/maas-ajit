import { Component, Inject } from "@angular/core";
import { MAT_SNACK_BAR_DATA } from "@angular/material";

@Component({
  selector: "tt-snack-bar",
  templateUrl: "snack-bar.component.html",
  styleUrls: ["./snack-bar.component.css"]
})
export class SnackBarComponent {
  class: string = "success";

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {
    if (this.data.error) {
      this.class = "error";
    } else {
      this.class = "success";
    }
  }
}
