import {
  Component,
  ViewContainerRef,
  ComponentFactoryResolver
} from "@angular/core";
import {
  Router,
  NavigationEnd,
  ActivatedRoute,
  ParamMap
} from "@angular/router";

import { PendingIGApprovalComponent } from "../../components/pending-ig-approval/pending-ig-approval.component";
import { SystemConfigurationComponent } from "../../components/system-configuration/system-configuration.component";
import { AdminDashboardComponent } from "../../components/admin-dashboard/admin-dashboard.component";
import { SkillCategoryComponent } from "../../components/skill-category/skill-category.component";
import { SkillComponent } from "../../components/skill/skill.component";
import { ReviewMeetingsComponent } from "../../components/review-meetings/review-meetings.component";
import { UpcomingMeetingsComponent } from "../../components/upcoming-meetings/upcoming-meetings.component";
import { CompletedMeetingsComponent } from "../../components/completed-meetings/completed-meetings.component";
import { SearchGuruComponent } from "../../components/search-guru/search-guru.component";
import { ActionsTrackerComponent } from "../../components/actions-tracker/actions-tracker.component";
import { ReferralDetailsComponent } from "../../components/referral-details/referral-details.component";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { StartupService } from "../../services/startup.service";
import { UserService } from "../../services/user.service";
import { CompanyComponent } from "../../components/company/company.component";
import { ManageSponsorComponent } from "../../components/manage-sponsor/manage-sponsor.component";
import { ExpiredMeetingsComponent } from '../../components/expired-meetings/expired-meetings.component';
import { ProgramsRequestsComponent } from '../../components/program-requests/program-requests.component';
import { ManageProgramsComponent } from '../../components/manage-programs/manage-programs.component';
import { ManageProfilesComponent } from 'src/components/manage-profiles/manage-profiles.component';
import { AssessmentRequestsComponent } from 'src/components/assessment-requests/assessment-requests.component';

@Component({
  selector: "tt-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.css"]
})
export class AdminComponent {
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
        this.globalCfgService.setFullUserObj(response['data'][0]);
      });
    }

    var cmpMap = {
      dashboard: AdminDashboardComponent,
      "review-meetings": ReviewMeetingsComponent,
      "upcoming-meetings": UpcomingMeetingsComponent,
      "completed-meetings": CompletedMeetingsComponent,
      "pending-ig-approval": PendingIGApprovalComponent,
      "view-all-mentor": SearchGuruComponent,
      "skill-category": SkillCategoryComponent,
      "skill": SkillComponent,
      "system-configuration": SystemConfigurationComponent,
      // 'system-tracker': SystemTrackerComponent,
      // 'question-bank': QuestionBankComponent,
      // 'pending-tasks': PendingTasksComponent,
      // 'completed-tasks': CompletedTasksComponent,
      "actions-tracker": ActionsTrackerComponent,
      "company": CompanyComponent,
      "sponsor": ManageSponsorComponent,
      "referral-details": ReferralDetailsComponent,
      "expired-meetings": ExpiredMeetingsComponent,
      "program-requests": ProgramsRequestsComponent,
      "manage-programs": ManageProgramsComponent,
      "manage-profiles": ManageProfilesComponent,
      "assessment-requests": AssessmentRequestsComponent
    };

    // console.log('URL: ', router, route);
    // console.log(this.route.paramMap);

    var type = this.route.data["value"]["type"];

    let componentFactory;

    if (!type) {
      componentFactory = this.componentFactoryResolver.resolveComponentFactory(
        AdminDashboardComponent
      );
    } else {
      componentFactory = this.componentFactoryResolver.resolveComponentFactory(
        cmpMap[type]
      );
    }

    let componentRef = viewContainerRef.createComponent(componentFactory);
  }
}
