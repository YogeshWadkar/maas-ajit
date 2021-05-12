import { Component, OnInit, OnDestroy } from "@angular/core";
import { LoaderService } from "../../services/loader.service";
import { LoaderState } from "./loader";
import { Subscription } from "rxjs";
@Component({
  selector: "tt-loader",
  templateUrl: "loader.component.html",
  styleUrls: ["loader.component.css"]
})
export class LoaderComponent implements OnInit {
  show = false;
  private subscription: Subscription;
  constructor(private loaderService: LoaderService) {}
  ngOnInit() {
    this.subscription = this.loaderService.loaderState.subscribe(
      (state: LoaderState) => {
        // console.log('Loader status: ', state.show);
        this.show = state.show;
      }
    );
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
