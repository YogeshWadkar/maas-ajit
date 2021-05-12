import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { FlexLayoutModule } from "@angular/flex-layout";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { MatBadgeModule } from "@angular/material/badge";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatTabsModule } from "@angular/material/tabs";
import { MatCardModule } from "@angular/material/card";
import { MatDatepickerModule } from "@angular/material/datepicker";
import {
  MatNativeDateModule,
  MAT_SNACK_BAR_DEFAULT_OPTIONS
} from "@angular/material";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatSortModule } from "@angular/material/sort";
import { MatDividerModule } from "@angular/material/divider";
import { MatDialogModule } from "@angular/material/dialog";
import { MatListModule } from "@angular/material/list";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatChipsModule } from "@angular/material/chips";
import { MatAutocompleteModule } from "@angular/material/autocomplete";

import { SignupComponent } from "../pages/signup/signup.component";
import { SigninComponent } from "../pages/signin/signin.component";
import { CareerSeekerComponent } from "../pages/career-seeker/career-seeker.component";
import { PageNotFoundComponent } from "../pages/404/404.component";
import { IndustryGuruComponent } from "../pages/industry-guru/industry-guru.component";
import { AdminComponent } from "../pages/admin/admin.component";

import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { FormsModule } from "@angular/forms";

import { DynamicTableComponent } from "../components/dynamic-table/dynamic-table.component";
import { HeaderComponent } from "../components/header/header.component";
import { SelfAssessmentComponent } from "../components/self-assessment/self-assessment.component";
import { OverallAssessmentComponent } from "../components/overall-assessment/overall-assessment.component";
import { CareerSeekerDashboardComponent } from "../components/career-seeker-dashboard/career-seeker-dashboard.component";
import { SearchGuruComponent } from "../components/search-guru/search-guru.component";
import { EndorsementsComponent } from "../components/endorsements/endorsements.component";
import { AssessmentHistoryComponent } from "../components/assessment-history/assessment-history.component";
import { BookScheduleComponent } from "../components/book-schedule/book-schedule.component";
import { StarRatingComponent } from "../components/star-rating/star-rating.component";
import { IGDashboardComponent } from "../components/ig-dashboard/ig-dashboard.component";
import { ReviewMeetingsComponent } from "../components/review-meetings/review-meetings.component";
import { UpcomingMeetingsComponent } from "../components/upcoming-meetings/upcoming-meetings.component";
import { CompletedMeetingsComponent } from "../components/completed-meetings/completed-meetings.component";
import { ActionsTrackerComponent } from "../components/actions-tracker/actions-tracker.component";
//calender menu option
import { AvailableWeekdaySlotsComponent } from "../components/available-weekday-slots/available-weekday-slots.component";
import { PublishedSlotsComponent } from "../components/published-slots/published-slots.component";
import { HolidaysLeavesComponent } from "../components/holidays-leaves/holidays-leaves.component";
import { SpecialDaySlotsComponent } from "../components/special-day-slots/special-day-slots.component";
// clander end
import { PendingIGApprovalComponent } from "../components/pending-ig-approval/pending-ig-approval.component";
import { SystemConfigurationComponent } from "../components/system-configuration/system-configuration.component";
import { ChangePasswordComponent } from "../components/change-password/change-password.component";
import { ForgotPasswordComponent } from "../components/forgot-password/forgot-password.component";
import { ResetPasswordComponent } from "../components/reset-password/reset-password.component";
import { ReactiveFormsModule } from "@angular/forms";
import { UserVerifiedComponent } from "../components/user-verified/user-verified.component";
import { AdminDashboardComponent } from "../components/admin-dashboard/admin-dashboard.component";
import { SkillCategoryComponent } from "../components/skill-category/skill-category.component";

import { GlobalCfgService } from "../services/globalcfg.service";
import { AuthService } from "../services/auth.service";
import { SkillService } from "../services/skill.service";
import { FormGroupControlService } from "../services/formgroup-control.service";
import { DynamicFormComponent } from "../components/dynamic-form/dynamic-form.component";
import { DynamicFormQuestionComponent } from "../components/dynamic-form-view/dynamic-form-view.component";
import { FieldGeneratorService } from "../services/field-generator.service";
import { FormDialogComponent } from "../components/form-dialog/form-dialog.component";
import { SkillComponent } from "../components/skill/skill.component";
import { FeedCardComponent } from "../components/feed-card/feed-card.component";
import { FeedService } from "../services/feed.service";
import { CalendarService } from "../services/calendar.service";
import { MeetingService } from "../services/meeting.service";
import { TaskService } from "../services/task.service";
import { UserService } from "../services/user.service";
import { AssessmentService } from "../services/assessment.service";
import { ConfirmationDialogComponent } from "../components/confirm-dialog/confirm-dialog.component";
import { SettingService } from "../services/setting.service";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MiscService } from "../services/misc.service";
import { EditProfileComponent } from "../components/edit-profile/edit-profile.component";
import { CeiboShare } from "../pages/social-sharing/ng2-social-share";
import { SocialSharingComponent } from "../components/social-sharing/social-sharing.component";
import { ViewOnlyProfileComponent } from "../components/viewonly-profile/viewonly-profile.component";
import { RateDialogComponent } from "../components/rate-dialog/rate-dialog.component";
import { AssignTaskComponent } from "../components/assign-task/assign-task.component";
import { RequestInterceptor } from "../services/http-interceptor";
import { SponsorComponent } from "../pages/sponsor/sponsor.component";
import { SponsorDashboardComponent } from "../components/sponsor-dashboard/sponsor-dashboard.component";
import { CSAssessmentComponent } from "../components/cs-assessment/cs-assessment.component";
import { EventBusService } from "../services/event-bus.service";
import { ImportMentorComponent } from "../components/import-mentor-dialog/import-mentor-dialog.component";

import { FileUploadModule } from "ng2-file-upload";
import { FileUploadService } from "../services/file-upload.service";
import { Utils } from "../services/utils";
import { ContributionReportComponent } from "../components/contribution-report/contribution-report.component";
import { UtilizationReportComponent } from "../components/utilization-report/utilization-report.component";
import { ProgressBarComponent } from "../components/progress-bar/progress-bar.component";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { SnackBarComponent } from "../components/snack-bar/snack-bar.component";
import { MessageService } from "../services/message.service";

import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { LoaderComponent } from "../components/loader/loader.component";
import { LoaderService } from "../services/loader.service";

import { StartupService } from "../services/startup.service";

import { MatRadioModule } from "@angular/material/radio";
import { DashboardService } from "../services/dashboard.service";
import { SQSService } from "../services/sqs.service";
import { GlobalPipesModule } from "./globalpipe.module";
import { BasicHeaderComponent } from "../components/basic-header/basic-header.component";
import { CompanyComponent } from "../components/company/company.component";
import { CompanyService } from "../services/company.service";
import { UploadFileDialogComponent } from "../components/upload-file-dialog/upload-file-dialog.component";
import { ReferralDetailsComponent } from "../components/referral-details/referral-details.component";
import { CustomEmailValidatorDirective } from "../directives/custom-email-validator.directive";
import { ManageSponsorComponent } from "../components/manage-sponsor/manage-sponsor.component";
import { ExpiredMeetingsComponent } from "../components/expired-meetings/expired-meetings.component";
import { ChatDialogComponent } from "../components/chat-dialog/chat-dialog.component";
import { ChatService } from "../services/chat.service";
import { ChatDialogService } from "../services/chat-dialog.service";
import { ChatDialogContainerComponent } from "../components/chat-dialog-ct/chat-dialog-ct.component";
import { MatCarouselModule } from "@ngmodule/material-carousel";
import { AdBannerComponent } from "../components/ad-banner/ad-banner.component";
import { ManageProgramsComponent } from "../components/manage-programs/manage-programs.component";
import { AddProgramDialogComponent } from "../components/add-program-dialog/add-program-dialog.component";
import { ProgramService } from "../services/program.service";
import { DndModule } from "ngx-drag-drop";
import { SweetAlert2Module } from "@toverux/ngx-sweetalert2";
import { RequestFormComponent } from "../components/request-form/request-form.component";
import { ProgramsRequestsComponent } from "../components/program-requests/program-requests.component";
import { ManageFormComponent } from '../components/manage-form/manage-form.component';
import { RequestFormService } from '../services/request-form.service';
import { EnrolDialogComponent } from '../components/enrol-dialog/enrol-dialog.component';
import { RequestInputFormComponent } from '../components/request-input-form/request-input-form.component';
import { ProgramPerformanceComponent } from '../components/program-performance/program-performance.component';
import { UploadFileComponent } from '../components/upload-file/upload-file.component';
import { FreeBusySettingComponent } from '../components/freebusy-setting/freebusy-setting.component';
import { ProgramViewProfileComponent } from '../components/programview-profile/programview-profile.component';
import { ManageProfilesComponent } from '../components/manage-profiles/manage-profiles.component';
import { AssessmentRequestsComponent } from '../components/assessment-requests/assessment-requests.component';
import { ManageProfilesDialogComponent } from '../components/manage-profiles-dialog/manage-profiles-dialog.component';
import { CareerProfileService } from 'src/services/career-profile.service';
import { ViewCareerProfileComponent } from '../components/view-career-profile/view-career-profile.component';
import { SearchGuruDialogComponent } from '../components/search-guru-dialog/search-guru-dialog.component';
import { ApproveAssessmentRequestsDialogComponent } from '../components/approve-assessment-requests-dialog/approve-assessment-requests-dialog.component';
import { SelfAssessmentProgressComponent } from '../components/self-assessment-progress/self-assessment-progress.component';
import { ProgressPieComponent } from '../components/progress-pie/progress-pie.component';
import { AssessmentRequestsDialogComponent } from '../components/assessment-requests-dialog/assessment-requests-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    DynamicTableComponent,
    HeaderComponent,
    SignupComponent,
    SigninComponent,
    CareerSeekerComponent,
    SelfAssessmentComponent,
    OverallAssessmentComponent,
    CareerSeekerDashboardComponent,
    SearchGuruComponent,
    EndorsementsComponent,
    AssessmentHistoryComponent,
    BookScheduleComponent,
    StarRatingComponent,
    IGDashboardComponent,
    IndustryGuruComponent,
    ReviewMeetingsComponent,
    UpcomingMeetingsComponent,
    CompletedMeetingsComponent,
    ActionsTrackerComponent,
    AvailableWeekdaySlotsComponent,
    PublishedSlotsComponent,
    HolidaysLeavesComponent,
    SpecialDaySlotsComponent,
    AdminComponent,
    PendingIGApprovalComponent,
    SystemConfigurationComponent,
    ChangePasswordComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    UserVerifiedComponent,
    AdminDashboardComponent,
    SkillCategoryComponent,
    PageNotFoundComponent,
    DynamicFormComponent,
    DynamicFormQuestionComponent,
    FormDialogComponent,
    SkillComponent,
    FeedCardComponent,
    ConfirmationDialogComponent,
    EditProfileComponent,
    CeiboShare,
    SocialSharingComponent,
    ViewOnlyProfileComponent,
    RateDialogComponent,
    AssignTaskComponent,
    SponsorComponent,
    SponsorDashboardComponent,
    CSAssessmentComponent,
    ImportMentorComponent,
    ContributionReportComponent,
    UtilizationReportComponent,
    ProgressBarComponent,
    SnackBarComponent,
    LoaderComponent,
    BasicHeaderComponent,
    CompanyComponent,
    UploadFileDialogComponent,
    ReferralDetailsComponent,
    CustomEmailValidatorDirective,
    ManageSponsorComponent,
    ExpiredMeetingsComponent,
    ChatDialogComponent,
    ChatDialogContainerComponent,
    AdBannerComponent,
    ManageProgramsComponent,
    AddProgramDialogComponent,
    RequestFormComponent,
    ProgramsRequestsComponent,
    ManageFormComponent,
    EnrolDialogComponent,
    RequestInputFormComponent,
    ProgramPerformanceComponent,
    UploadFileComponent,
    FreeBusySettingComponent,
    ProgramViewProfileComponent,
    ManageProfilesComponent,
    AssessmentRequestsComponent,
    ManageProfilesDialogComponent,
    ViewCareerProfileComponent,
    SearchGuruDialogComponent,
    ApproveAssessmentRequestsDialogComponent,
    SelfAssessmentProgressComponent,
    ProgressPieComponent,
    AssessmentRequestsDialogComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatBadgeModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatSortModule,
    MatDividerModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatListModule,
    MatTooltipModule,
    FileUploadModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    GlobalPipesModule,
    MatSlideToggleModule,
    MatCarouselModule.forRoot(),
    MatChipsModule,
    MatAutocompleteModule,
    DndModule,
    SweetAlert2Module.forRoot()

  ],
  providers: [
    MatNativeDateModule,
    GlobalCfgService,
    AuthService,
    SkillService,
    FormGroupControlService,
    FieldGeneratorService,
    FeedService,
    CalendarService,
    MeetingService,
    TaskService,
    UserService,
    AssessmentService,
    SettingService,
    MiscService,
    EventBusService,
    FileUploadService,
    Utils,
    MessageService,
    LoaderService,
    StartupService,
    DashboardService,
    CompanyService,
    SQSService,
    ChatService,
    ChatDialogService,
    ProgramService,
    RequestFormService,
    CareerProfileService,
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 3000 } }
  ],
  bootstrap: [
    AppComponent,
    SelfAssessmentComponent,
    OverallAssessmentComponent,
    CareerSeekerDashboardComponent,
    SearchGuruComponent,
    EndorsementsComponent,
    AssessmentHistoryComponent,
    BookScheduleComponent,
    IGDashboardComponent,
    ReviewMeetingsComponent,
    UpcomingMeetingsComponent,
    CompletedMeetingsComponent,
    ActionsTrackerComponent,
    AvailableWeekdaySlotsComponent,
    PublishedSlotsComponent,
    HolidaysLeavesComponent,
    SpecialDaySlotsComponent,
    PendingIGApprovalComponent,
    SystemConfigurationComponent,
    AdminDashboardComponent,
    SkillCategoryComponent,
    FormDialogComponent,
    ConfirmationDialogComponent,
    SkillComponent,
    EditProfileComponent,
    ViewOnlyProfileComponent,
    RateDialogComponent,
    AssignTaskComponent,
    SponsorComponent,
    SponsorDashboardComponent,
    CSAssessmentComponent,
    ImportMentorComponent,
    ContributionReportComponent,
    UtilizationReportComponent,
    SnackBarComponent,
    CompanyComponent,
    ManageSponsorComponent,
    UploadFileDialogComponent,
    ReferralDetailsComponent,
    ExpiredMeetingsComponent,
    ChatDialogComponent,
    ChatDialogContainerComponent,
    ManageProgramsComponent,
    AddProgramDialogComponent,
    ProgramsRequestsComponent,
    RequestFormComponent,
    ManageFormComponent,
    EnrolDialogComponent,
    RequestInputFormComponent,
    ProgramPerformanceComponent,
    UploadFileComponent,
    FreeBusySettingComponent,
    ProgramViewProfileComponent,
    ManageProfilesComponent,
    AssessmentRequestsComponent,
    ManageProfilesDialogComponent,
    ViewCareerProfileComponent,
    SearchGuruDialogComponent,
    ApproveAssessmentRequestsDialogComponent,
    SelfAssessmentProgressComponent,
    ProgressPieComponent,
    AssessmentRequestsDialogComponent
  ]
})
export class AppModule { }