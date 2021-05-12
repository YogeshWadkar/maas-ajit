import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "tt-feed-card",
  templateUrl: "./feed-card.component.html",
  styleUrls: ["./feed-card.component.css"]
})
export class FeedCardComponent implements OnInit {
  @Input() feeds: any;

  constructor() {}

  ngOnInit() {}

  openLinkInBrowser(link) {
    window.open(link); //this.feed.link
  }
}
