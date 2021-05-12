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

import { SelfAssessmentComponent } from "../../components/self-assessment/self-assessment.component";
import { OverallAssessmentComponent } from "../../components/overall-assessment/overall-assessment.component";
import { CareerSeekerDashboardComponent } from "../../components/career-seeker-dashboard/career-seeker-dashboard.component";
import { SearchGuruComponent } from "../../components/search-guru/search-guru.component";
import { EndorsementsComponent } from "../../components/endorsements/endorsements.component";
import { AssessmentHistoryComponent } from "../../components/assessment-history/assessment-history.component";
import { BookScheduleComponent } from "../../components/book-schedule/book-schedule.component";
import { UpcomingMeetingsComponent } from "../../components/upcoming-meetings/upcoming-meetings.component";
import { CompletedMeetingsComponent } from "../../components/completed-meetings/completed-meetings.component";
import { ActionsTrackerComponent } from "../../components/actions-tracker/actions-tracker.component";
import { ReviewMeetingsComponent } from "../../components/review-meetings/review-meetings.component";
import { ReferralDetailsComponent } from "src/components/referral-details/referral-details.component";
import { StartupService } from "../../services/startup.service";
import { UserService } from "../../services/user.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { ExpiredMeetingsComponent } from "../../components/expired-meetings/expired-meetings.component";
import { ProgramsRequestsComponent } from "../../components/program-requests/program-requests.component";
import { ManageProfilesComponent } from "src/components/manage-profiles/manage-profiles.component";
import { AssessmentRequestsComponent } from "src/components/assessment-requests/assessment-requests.component";

@Component({
  selector: "tt-career-seeker",
  templateUrl: "./career-seeker.component.html",
  styleUrls: ["./career-seeker.component.css"]
})
export class CareerSeekerComponent {
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
      "self-assessment": SelfAssessmentComponent,
      "overall-assessment": OverallAssessmentComponent,
      "search-mentor": SearchGuruComponent,
      "upcoming-meetings": UpcomingMeetingsComponent,
      "completed-meetings": CompletedMeetingsComponent,
      "pending-meetings": ReviewMeetingsComponent,
      "actions-tracker": ActionsTrackerComponent,
      endorsements: EndorsementsComponent,
      "assessment-history": AssessmentHistoryComponent,
      "book-schedule": BookScheduleComponent,
      // 'help': CareerSeekerHelpComponent,
      "referral-details": ReferralDetailsComponent,
      "expired-meetings": ExpiredMeetingsComponent,
      "program-requests": ProgramsRequestsComponent,
      "manage-profiles": ManageProfilesComponent,
      "assessment-requests": AssessmentRequestsComponent
    
    };

    // console.log('URL: ', router, route);
    // console.log(this.route.paramMap);

    var type = this.route.data["value"]["type"];

    let componentFactory;

    if (!type) {
      componentFactory = this.componentFactoryResolver.resolveComponentFactory(
        CareerSeekerDashboardComponent
      );
    } else {
      componentFactory = this.componentFactoryResolver.resolveComponentFactory(
        cmpMap[type]
      );
    }

    let componentRef = viewContainerRef.createComponent(componentFactory);
  }
}
