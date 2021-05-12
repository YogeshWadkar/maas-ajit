import { Component, Input, ViewChild } from "@angular/core";
import { OnInit } from "@angular/core";

@Component({
  selector: "tt-progress-bar",
  templateUrl: "./progress-bar.component.html",
  styleUrls: ["./progress-bar.component.css"]
})
export class ProgressBarComponent implements OnInit {
  private _progress: any = 0;

  get progress() {
    return this._progress;
  }

  @Input()
  set progress(val: any) {
    console.log("Progress updated: ", this.bar, val);
    this._progress = val;
    this.bar.nativeElement.style.width = val + "%";
  }

  @ViewChild("bar", { static: true }) bar;

  ngOnInit() {}
}
