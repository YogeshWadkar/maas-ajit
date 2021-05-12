import { Component, OnInit } from "@angular/core";
import { DashboardService } from "../../services/dashboard.service";
import { GlobalCfgService } from "src/services/globalcfg.service";

@Component({
  selector: "tt-referral-details",
  templateUrl: "./referral-details.component.html",
  styleUrls: ["./referral-details.component.css"]
})
export class ReferralDetailsComponent implements OnInit {
  private columns = [
    { name: "invitesSent", displayName: "Invitations Sent" },
    { name: "signUpsOpened", displayName: "Sign Ups Opened" },
    { name: "hasSignedUp", displayName: "Signed Up" },
    { name: "hasConfirmed", displayName: "Confirmed" },
    { name: "tokensAllocated", displayName: "Tokens Allocated" }
  ];
  referralsData = [];
  constructor(
    private dashboardService: DashboardService,
    private globalCfgService: GlobalCfgService
  ) {}

  ngOnInit() {
    this.loadReferralDetails();
  }

  loadReferralDetails() {
    this.dashboardService
      .getReferralDetails(this.globalCfgService.getUserId())
      .subscribe(
        (response: any[]) => {
          this.referralsData = response["result"];
          console.log("this.referralsData", this.referralsData);
        },
        error => {
          console.log("Service error: ", error);
        }
      );
  }
}
