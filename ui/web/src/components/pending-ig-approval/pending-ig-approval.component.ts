import { Component, OnInit } from "@angular/core";
import { UserService } from "../../services/user.service";
import { MessageService } from "../../services/message.service";
import { EventBusService } from "../../services/event-bus.service";
import { StartupService } from "../../services/startup.service";

@Component({
  selector: "tt-pending-ig-approval",
  templateUrl: "./pending-ig-approval.component.html",
  styleUrls: ["./pending-ig-approval.component.css"]
})
export class PendingIGApprovalComponent implements OnInit {
  private mentorRoleId: number;
  private mentors: any[];

  private columns = [
    { name: "fullName", displayName: "Mentor Name" },
    { name: "mobileNo", displayName: "Mobile Number" },
    { name: "email", displayName: "Email" },
    { name: "emailVerified", displayName: "Email Verified?", type: "boolean" },
    { name: "actions", displayName: "Actions" }
  ];
  subscriptions: any = [];

  constructor(
    private userService: UserService,
    private msgService: MessageService,
    private ebService: EventBusService,
    private startupService: StartupService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.ebService.roleFetchedValue$.subscribe(roles => {
        roles.forEach(role => {
          if (role.name == "mentor") {
            this.mentorRoleId = role.id;
            this.ebService.roleNameSource.next(role.name);
          }
        });
      })
    );

    this.subscriptions.push(
      this.ebService.roleNameFetchedValue$.subscribe(roleName => {
        this.loadMentors(this.mentorRoleId);
      })
    );

    this.startupService.loadRoles();
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private loadMentors(roleId, isActive = false) {
    this.userService.getUsersByRole(roleId, isActive).subscribe(
      (response: any[]) => {
        this.mentors = response['data'];

        this.mentors.forEach(item => {
          item["fullName"] = item["firstName"] + " " + item["lastName"];
          if (item && item.emailVerified) {
            item["actions"] = [{ name: "done", tip: "Approve" }];
          }
        });
      },
      error => {
        console.log("Service error:", error);
      }
    );
  }

  onActionClicked(event) {
    console.log("onActionClicked:", event);
    switch (event.actionName.name) {
      case "done":
        var rec = event.record;
        console.log("marking user as approved...");
        this.userService.updateUserStatus(rec.id, true).subscribe(
          (response: any[]) => {
            console.log("Record updated.");
            this.msgService.showSuccess("User has been marked as active");
            this.loadMentors(this.mentorRoleId);
          },
          error => {
            console.log("Service error:", error);
          }
        );
        break;
    }
  }
}
