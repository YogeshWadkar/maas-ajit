import { Injectable } from "@angular/core";
import { EventBusService } from "./event-bus.service";
import { UserService } from "./user.service";
import { SettingService } from "./setting.service";
import { GlobalCfgService } from "./globalcfg.service";

@Injectable()
export class StartupService {
  constructor(
    private ebService: EventBusService,
    private userService: UserService,
    private settingService: SettingService,
    private globalCfgService: GlobalCfgService
  ) {}

  loadRoles() {
    this.userService.getRoles().subscribe(
      (response: any[]) => {
        var data = response["data"];
        this.globalCfgService.setRoles(data);
        this.ebService.roleSource.next(data);
      },
      error => {}
    );
  }

  loadSettings() {
    var settings = {};
    this.settingService.getSettings({
      pageSize: 100,
      pageIndex: 0
    }).subscribe(
      (response: any[]) => {
        console.log("Got settings:", response["data"]);
        response["data"].forEach(element => {
          console.log("........", element.name);
          settings[element.name] = element.value;
        });
        this.globalCfgService.setSettings(settings);

        this.ebService.settingSource.next();
        console.log("SETTINGS: ", settings);
      },
      error => {
        console.log("Service error:", error);
      }
    );
  }
}
