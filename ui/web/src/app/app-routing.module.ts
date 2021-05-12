import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { SignupComponent } from "../pages/signup/signup.component";
import { SigninComponent } from "../pages/signin/signin.component";
import { CareerSeekerComponent } from "../pages/career-seeker/career-seeker.component";
import { PageNotFoundComponent } from "../pages/404/404.component";
import { IndustryGuruComponent } from "../pages/industry-guru/industry-guru.component";
import { AdminComponent } from "../pages/admin/admin.component";
import { ChangePasswordComponent } from "../components/change-password/change-password.component";
import { ForgotPasswordComponent } from "../components/forgot-password/forgot-password.component";
import { ResetPasswordComponent } from "../components/reset-password/reset-password.component";
import { UserVerifiedComponent } from "../components/user-verified/user-verified.component";
import { EditProfileComponent } from "../components/edit-profile/edit-profile.component";
import { SponsorComponent } from "../pages/sponsor/sponsor.component";

const routes: Routes = [
  { path: "", component: SigninComponent },
  { path: "signup", component: SignupComponent },
  { path: "signin", component: SigninComponent },
  {
    path: "career-seeker",
    component: CareerSeekerComponent
  },
  {
    path: "career-seeker/self-assessment",
    component: CareerSeekerComponent,
    data: {
      type: "self-assessment"
    }
  },
  {
    path: "career-seeker/system-assessment",
    component: CareerSeekerComponent,
    data: {
      type: "system-assessment"
    }
  },
  {
    path: "career-seeker/overall-assessment",
    component: CareerSeekerComponent,
    data: {
      type: "overall-assessment"
    }
  },
  {
    path: "career-seeker/search-mentor",
    component: CareerSeekerComponent,
    data: {
      type: "search-mentor"
    }
  },
  {
    path: "career-seeker/scheduled-meeting",
    component: CareerSeekerComponent,
    data: {
      type: "scheduled-meeting"
    }
  },
  {
    path: "career-seeker/pending-meetings",
    component: CareerSeekerComponent,
    data: {
      type: "pending-meetings"
    }
  },
  {
    path: "career-seeker/actions-tracker",
    component: CareerSeekerComponent,
    data: {
      type: "actions-tracker"
    }
  },
  {
    path: "career-seeker/referral-details",
    component: CareerSeekerComponent,
    data: {
      type: "referral-details"
    }
  },
  {
    path: "career-seeker/endorsements",
    component: CareerSeekerComponent,
    data: {
      type: "endorsements"
    }
  },
  {
    path: "career-seeker/career-zone",
    component: CareerSeekerComponent,
    data: {
      type: "career-zone"
    }
  },
  {
    path: "career-seeker/task-history",
    component: CareerSeekerComponent,
    data: {
      type: "task-history"
    }
  },
  {
    path: "career-seeker/assessment-history",
    component: CareerSeekerComponent,
    data: {
      type: "assessment-history"
    }
  },
  {
    path: "career-seeker/endorsement-history",
    component: CareerSeekerComponent,
    data: {
      type: "endorsement-history"
    }
  },
  {
    path: "career-seeker/careers-history",
    component: CareerSeekerComponent,
    data: {
      type: "careers-history"
    }
  },
  {
    path: "career-seeker/help",
    component: CareerSeekerComponent,
    data: {
      type: "help"
    }
  },
  {
    path: "career-seeker/book-schedule/:id",
    component: CareerSeekerComponent,
    data: {
      type: "book-schedule"
    }
  },
  {
    path: "career-seeker/upcoming-meetings",
    component: CareerSeekerComponent,
    data: {
      type: "upcoming-meetings"
    }
  },
  {
    path: "career-seeker/completed-meetings",
    component: CareerSeekerComponent,
    data: {
      type: "completed-meetings"
    }
  },
  {
    path: "career-seeker/expired-meetings",
    component: CareerSeekerComponent,
    data: {
      type: "expired-meetings"
    }
  },
  {
    path: "career-seeker/program-requests",
    component: CareerSeekerComponent,
    data: {
      type: "program-requests"
    }
  },
  {
    path: "career-seeker/manage-profiles",
    component: CareerSeekerComponent,
    data: {
      type: "manage-profiles"
    }
  },
  {
    path: "career-seeker/self-progress",
    component: CareerSeekerComponent,
    data: {
      type: "self-progress"
    }
  },
  {
    path: "career-seeker/assessment-requests",
    component: CareerSeekerComponent,
    data: {
      type: "assessment-requests"
    }
  },
  {
    path: "mentor",
    component: IndustryGuruComponent
  },
  {
    path: "mentor/review-meetings",
    component: IndustryGuruComponent,
    data: {
      type: "review-meetings"
    }
  },
  {
    path: "mentor/upcoming-meetings",
    component: IndustryGuruComponent,
    data: {
      type: "upcoming-meetings"
    }
  },
  {
    path: "mentor/completed-meetings",
    component: IndustryGuruComponent,
    data: {
      type: "completed-meetings"
    }
  },
  {
    path: "mentor/expired-meetings",
    component: IndustryGuruComponent,
    data: {
      type: "expired-meetings"
    }
  },
  {
    path: "mentor/actions-tracker",
    component: IndustryGuruComponent,
    data: {
      type: "actions-tracker"
    }
  },
  {
    path: "mentor/assign-task/:id",
    component: IndustryGuruComponent,
    data: {
      type: "assign-task"
    }
  },
  {
    path: "mentor/available-weekday-slots",
    component: IndustryGuruComponent,
    data: {
      type: "available-weekday-slots"
    }
  },
  {
    path: "mentor/published-slots",
    component: IndustryGuruComponent,
    data: {
      type: "published-slots"
    }
  },
  {
    path: "mentor/holidays-leaves",
    component: IndustryGuruComponent,
    data: {
      type: "holidays-leaves"
    }
  },
  {
    path: "mentor/special-day-slots",
    component: IndustryGuruComponent,
    data: {
      type: "special-day-slots"
    }
  },
  {
    path: "mentor/self-assessment",
    component: IndustryGuruComponent,
    data: {
      type: "self-assessment"
    }
  },
  {
    path: "mentor/assess-seeker",
    component: IndustryGuruComponent,
    data: {
      type: "assess-seeker"
    }
  },
  {
    path: "mentor/referral-details",
    component: IndustryGuruComponent,
    data: {
      type: "referral-details"
    }
  },
  {
    path: "mentor/program-requests",
    component: IndustryGuruComponent,
    data: {
      type: "program-requests"
    }
  },
  {
    path: "mentor/setting-freebusy",
    component: IndustryGuruComponent,
    data: {
      type: "setting-freebusy"
    }
  },
  {
    path: "mentor/assessment-requests",
    component: IndustryGuruComponent,
    data: {
      type: "assessment-requests"
    }
  },
  {
    path: "mentor/approve-assessment-requests",
    component: IndustryGuruComponent,
    data: {
      type: "approve-assessment-requests"
    }
  },
  {
    path: "mentor/help",
    component: IndustryGuruComponent,
    data: {
      type: "help"
    }
  },
  {
    path: "admin",
    component: AdminComponent,
    data: {
      type: "dashboard"
    }
  },
  {
    path: "admin/review-meetings",
    component: AdminComponent,
    data: {
      type: "review-meetings"
    }
  },
  {
    path: "admin/upcoming-meetings",
    component: AdminComponent,
    data: {
      type: "upcoming-meetings"
    }
  },
  {
    path: "admin/completed-meetings",
    component: AdminComponent,
    data: {
      type: "completed-meetings"
    }
  },
  {
    path: "admin/expired-meetings",
    component: AdminComponent,
    data: {
      type: "expired-meetings"
    }
  },
  // {
  //   path: 'admin/completed-tasks',
  //   component: AdminComponent,
  //   data: {
  //     type: 'completed-tasks'
  //   }
  // },
  // {
  //   path: 'admin/pending-tasks',
  //   component: AdminComponent,
  //   data: {
  //     type: 'pending-tasks'
  //   }
  // },
  {
    path: "admin/actions-tracker",
    component: AdminComponent,
    data: {
      type: "actions-tracker"
    }
  },
  {
    path: "admin/pending-ig-approval",
    component: AdminComponent,
    data: {
      type: "pending-ig-approval"
    }
  },
  {
    path: "admin/view-all-mentor",
    component: AdminComponent,
    data: {
      type: "view-all-mentor",
      title: "Mentors"
    }
  },
  {
    path: "admin/skill-category",
    component: AdminComponent,
    data: {
      type: "skill-category"
    }
  },
  {
    path: "admin/skill",
    component: AdminComponent,
    data: {
      type: "skill"
    }
  },
  {
    path: "admin/system-configuration",
    component: AdminComponent,
    data: {
      type: "system-configuration"
    }
  },
  {
    path: "admin/referral-details",
    component: AdminComponent,
    data: {
      type: "referral-details"
    }
  },
  {
    path: "admin/company",
    component: AdminComponent,
    data: {
      type: "company"
    }
  },
  {
    path: "admin/sponsor",
    component: AdminComponent,
    data: {
      type: "sponsor"
    }
  },
  {
    path: "admin/manage-programs",
    component: AdminComponent,
    data: {
      type: "manage-programs"
    }
  },
  {
    path: "admin/program-requests",
    component: AdminComponent,
    data: {
      type: "program-requests"
    }
  },
  {
    path: "admin/manage-profiles",
    component: AdminComponent,
    data: {
      type: "manage-profiles"
    }
  },
  {
    path: "admin/assessment-requests",
    component: AdminComponent,
    data: {
      type: "assessment-requests"
    }
  },
  {
    path: "admin/system-tracker",
    component: AdminComponent,
    data: {
      type: "system-tracker"
    }
  },
  {
    path: "admin/payment-setup",
    component: AdminComponent,
    data: {
      type: "payment-setup"
    }
  },
  {
    path: "admin/question-bank",
    component: AdminComponent,
    data: {
      type: "question-bank"
    }
  },
  {
    path: "sponsor",
    component: SponsorComponent
  },
  {
    path: "sponsor/manage-mentors",
    component: SponsorComponent,
    data: {
      type: "manage-mentors"
    }
  },
  {
    path: "sponsor/contribution-report",
    component: SponsorComponent,
    data: {
      type: "contribution-report"
    }
  },
  {
    path: "sponsor/utilization-report",
    component: SponsorComponent,
    data: {
      type: "utilization-report"
    }
  },
  {
    path: "sponsor/manage-programs",
    component: SponsorComponent,
    data: {
      type: "manage-programs"
    }
  },
  {
    path: "sponsor/program-requests",
    component: SponsorComponent,
    data: {
      type: "program-requests"
    }
  },
  {
    path: "sponsor/program-performance",
    component: SponsorComponent,
    data: {
      type: "program-performance"
    }
  },
  {
    path: "sponsor/manage-forms",
    component: SponsorComponent,
    data: {
      type: "manage-forms"
    }
  },
  {
    path: "profile",
    component: EditProfileComponent
  },
  {
    path: "change-password",
    component: ChangePasswordComponent
  },
  {
    path: "forgot-password",
    component: ForgotPasswordComponent,
    data: {
      static: true
    }
  },
  {
    path: "reset-password",
    component: ResetPasswordComponent,
    data: {
      static: true
    }
  },
  {
    path: "verified",
    component: UserVerifiedComponent,
    data: {
      static: true
    }
  },
  { path: "**", component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
