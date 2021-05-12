import { Component, Input, SimpleChange } from "@angular/core";

@Component({
  selector: "tt-star-rating",
  templateUrl: "./star-rating.component.html",
  styleUrls: ["./star-rating.component.css"]
})
export class StarRatingComponent {
  private _rating: number = 0;

  @Input()
  set rating(rating: number) {
    this._rating = rating;
    // console.log('rating: ', rating);
  }

  get rating(): number {
    return this._rating;
  }
}
