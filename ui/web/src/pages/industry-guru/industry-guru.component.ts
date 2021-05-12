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

import { IGDashboardComponent } from "../../components/ig-dashboard/ig-dashboard.component";
import { ReviewMeetingsComponent } from "../../components/review-meetings/review-meetings.component";
import { UpcomingMeetingsComponent } from "../../components/upcoming-meetings/upcoming-meetings.component";
import { CompletedMeetingsComponent } from "../../components/completed-meetings/completed-meetings.component";
import { AvailableWeekdaySlotsComponent } from "../../components/available-weekday-slots/available-weekday-slots.component";
import { PublishedSlotsComponent } from "../../components/published-slots/published-slots.component";
import { HolidaysLeavesComponent } from "../../components/holidays-leaves/holidays-leaves.component";
import { SpecialDaySlotsComponent } from "../../components/special-day-slots/special-day-slots.component";
import { AuthService } from "../../services/auth.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { AssignTaskComponent } from "../../components/assign-task/assign-task.component";
import { ActionsTrackerComponent } from "../../components/actions-tracker/actions-tracker.component";
import { SelfAssessmentComponent } from "../../components/self-assessment/self-assessment.component";
import { CSAssessmentComponent } from "../../components/cs-assessment/cs-assessment.component";
import { ReferralDetailsComponent } from "../../components/referral-details/referral-details.component";
import { EventBusService } from "../../services/event-bus.service";
import { StartupService } from "../../services/startup.service";
import { UserService } from "../../services/user.service";
import { ExpiredMeetingsComponent } from '../../components/expired-meetings/expired-meetings.component';
import { ProgramsRequestsComponent } from '../../components/program-requests/program-requests.component';
import { FreeBusySettingComponent } from '../../components/freebusy-setting/freebusy-setting.component';
import { AssessmentRequestsComponent } from 'src/components/assessment-requests/assessment-requests.component';

@Component({
  selector: "tt-industry-guru",
  templateUrl: "./industry-guru.component.html",
  styleUrls: ["./industry-guru.component.css"]
})
export class IndustryGuruComponent {
  constructor(
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private globalCfgService: GlobalCfgService,
    private ebService: EventBusService,
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
      "review-meetings": ReviewMeetingsComponent,
      "upcoming-meetings": UpcomingMeetingsComponent,
      "completed-meetings": CompletedMeetingsComponent,
      "assign-task": AssignTaskComponent,
      "actions-tracker": ActionsTrackerComponent,
      "available-weekday-slots": AvailableWeekdaySlotsComponent,
      "published-slots": PublishedSlotsComponent,
      "holidays-leaves": HolidaysLeavesComponent,
      "special-day-slots": SpecialDaySlotsComponent,
      // 'help': CareerSeekerHelpComponent,
      "self-assessment": SelfAssessmentComponent,
      "assess-seeker": CSAssessmentComponent,
      "referral-details": ReferralDetailsComponent,
      "expired-meetings": ExpiredMeetingsComponent,
      "program-requests": ProgramsRequestsComponent,
      'setting-freebusy': FreeBusySettingComponent,
      "assessment-requests": AssessmentRequestsComponent
    };

    // console.log('URL: ', router, route);
    // console.log(this.route.paramMap);

    var type = this.route.data["value"]["type"];

    let componentFactory;

    if (!type) {
      componentFactory = this.componentFactoryResolver.resolveComponentFactory(
        IGDashboardComponent
      );
    } else {
      componentFactory = this.componentFactoryResolver.resolveComponentFactory(
        cmpMap[type]
      );
    }

    let componentRef = viewContainerRef.createComponent(componentFactory);
  }
}
