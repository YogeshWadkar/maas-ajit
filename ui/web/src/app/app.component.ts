import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { GlobalCfgService } from "../services/globalcfg.service";
import { UserService } from "../services/user.service";
import { SettingService } from "../services/setting.service";
import { EventBusService } from "../services/event-bus.service";
import { StartupService } from "../services/startup.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  title = "MaaS";

  constructor() {}

  ngOnInit() {}
}
