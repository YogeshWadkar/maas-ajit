import { Component, Input, Output, EventEmitter } from "@angular/core";

import { OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Utils } from "../../services/utils";

@Component({ 
  selector: "tt-social-sharing",
  templateUrl: "./social-sharing.component.html",
  styleUrls: ["./social-sharing.component.css"]
})
export class SocialSharingComponent implements OnInit {
  @Input() repoUrl: any;  //fb, linkedin, twitter
  @Input() text: string;  //twitter
  @Input() imageUrl: any; //pinterest
  @Input() dec: any;      //pinterest

  page: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private utils: Utils
  ) {}

  ngOnInit() {
    }

  private onPageChanged(page) {
    this.page = page;
  }
}
