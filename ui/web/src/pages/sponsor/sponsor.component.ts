import {
  Component,
  ViewContainerRef,
  ComponentFactoryResolver
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { SearchGuruComponent } from "../../components/search-guru/search-guru.component";
import { SponsorDashboardComponent } from "../../components/sponsor-dashboard/sponsor-dashboard.component";
import { ContributionReportComponent } from "../../components/contribution-report/contribution-report.component";
import { UtilizationReportComponent } from "../../components/utilization-report/utilization-report.component";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { StartupService } from "../../services/startup.service";
import { UserService } from "../../services/user.service";
import { ManageProgramsComponent } from "src/components/manage-programs/manage-programs.component";
import { ProgramsRequestsComponent } from "../../components/program-requests/program-requests.component";
import { ManageFormComponent } from '../../components/manage-form/manage-form.component';
import { ProgramPerformanceComponent } from 'src/components/program-performance/program-performance.component';

@Component({
  selector: "tt-sponsor",
  templateUrl: "./sponsor.component.html",
  styleUrls: ["./sponsor.component.css"]
})
export class SponsorComponent {
  constructor(
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private router: Router,
    private route: ActivatedRoute,
    private globalCfgService: GlobalCfgService,
    private startupService: StartupService,
    private userService: UserService
  ) {
    var user = this.globalCfgService.getLoggedInUser();

    if (!user || Object.keys(user).length == 0) {
      this.router.navigateByUrl("/");
    } else {
      this.startupService.loadSettings();
      this.startupService.loadRoles();

      this.userService.getUserDetail(user["userId"]).subscribe(response => {
        this.globalCfgService.setFullUserObj(response["data"][0]);
      });
    }

    var cmpMap = {
      dashboard: SponsorDashboardComponent,
      "manage-mentors": SearchGuruComponent,
      "contribution-report": ContributionReportComponent,
      "utilization-report": UtilizationReportComponent,
      "manage-programs": ManageProgramsComponent,
      "program-requests": ProgramsRequestsComponent,
      "manage-forms": ManageFormComponent,
      "program-performance": ProgramPerformanceComponent
    };

    // console.log('URL: ', router, route);
    // console.log(this.route.paramMap);

    var type = this.route.data["value"]["type"];
    let componentFactory;

    if (!type) {
      componentFactory = this.componentFactoryResolver.resolveComponentFactory(
        SponsorDashboardComponent
      );
    } else {
      componentFactory = this.componentFactoryResolver.resolveComponentFactory(
        cmpMap[type]
      );
    }

    let componentRef = viewContainerRef.createComponent(componentFactory);
  }
}
