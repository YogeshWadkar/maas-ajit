import { Component, OnInit, Input } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { Router } from "@angular/router";
import { EventBusService } from "../../services/event-bus.service";
import { MiscService } from "../../services/misc.service";
import { SQSService } from "../../services/sqs.service";
import { FormDialogComponent } from "../form-dialog/form-dialog.component";
import { FieldGeneratorService } from "../../services/field-generator.service";
import { MatDialog } from "@angular/material";
import { UserService } from "../../services/user.service";
import { MessageService } from "../../services/message.service";
import { ChatDialogService } from '../../services/chat-dialog.service';

@Component({
  selector: "tt-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent implements OnInit {
  @Input()
  hideActions: boolean = false;

  @Input()
  hideUserAction: boolean = false;

  user: object;
  userSubscription: any;
  activityNotifications: any[] = [];
  meetingNotifications: any[] = [];
  subscriptions: any = [];
  showInvite: boolean = false;
  inviteResponse: any;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    private globalCfgService: GlobalCfgService,
    private busService: EventBusService,
    private miscService: MiscService,
    private sqsService: SQSService,
    private fgService: FieldGeneratorService,
    private userService: UserService,
    private msgService: MessageService,
    private chatDialogService: ChatDialogService
    ) {
    if (this.hideActions) {
      return;
    }

    this.subscriptions.push(
      this.busService.userNameFetchedValue$.subscribe(name => {
        this.user["firstName"] = name.firstName;
        this.user["lastName"] = name.lastName;
      })
    );

    let u = this.globalCfgService.getFullUserObj();
    if (!u) {
      this.userSubscription = this.globalCfgService.userFetchedValue$.subscribe(
        user => {
          // console.log('Got user: ', user);
          if (user) {
            this.user = user;
          }

          var role = this.globalCfgService.getFullUserObj().role;
          if (role.name != "admin" && role.name != "sponsor") {
            this.loadAndListenForNotifications();
            this.showInvite = true;
          }
        }
      );
      this.subscriptions.push(this.userSubscription);
    } else {
      this.user = u;

      var role = this.globalCfgService.getFullUserObj().role;
      if (role.name != "admin" && role.name != "sponsor") {
        this.loadAndListenForNotifications();
        this.showInvite = true;
      }
    }

    this.subscriptions.push(
      this.busService.profilepicFetchedValue$.subscribe(userDetail => {
        this.user["userDetail"]["avatarUrl"] = userDetail["avatarUrl"];
      })
    );
  }

  loadAndListenForNotifications() {
    this.loadActivityNotifications();
    this.loadMeetingNotifications();
    console.log("Waiting for notification...");
    var me = this;
    // this.sqsService.receiveMessage(this.globalCfgService.getUserId(), function() {
    //   console.log('Received notification...');
    //   me.loadActivityNotifications();
    //   me.loadMeetingNotifications();
    // });
  }

  ngOnInit() {}

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  logout() {
    this.chatDialogService.closeAll();
    this.authService.logout().subscribe(
      response => {
        console.log("User logout successful!");
        this.globalCfgService.setLoggedInUser(null, null);
        this.router.navigateByUrl("/");
      },
      error => {
        console.log(error);
        this.globalCfgService.setLoggedInUser(null, null);
      }
    );
  }

  markActivitiesAsRead() {
    this.miscService
      .markNotificationAsRead("activityupdate")
      .subscribe(response => {
        this.loadActivityNotifications();
      });
  }

  markMeetingsAsRead() {
    this.miscService
      .markNotificationAsRead("meetingnotification")
      .subscribe(response => {
        this.loadActivityNotifications();
      });
  }

  loadActivityNotifications() {
    this.miscService
      .getActivityNotifications(this.globalCfgService.getUserId())
      .subscribe(
        (response: any[]) => {
          this.activityNotifications = response["data"];
        },
        error => {
          console.log("Service error: ", error);
        }
      );
  }

  loadMeetingNotifications() {
    this.miscService
      .getMeetingNotifications(this.globalCfgService.getUserId())
      .subscribe(
        (response: any[]) => {
          this.meetingNotifications = response["data"];
        },
        error => {
          console.log("Service error: ", error);
        }
      );
  }

  invite() {
    var fields = this.fgService.getFields(
      [
        {
          name: "emails",
          displayName: "Emails (comma separated)",
          type: "longstring",
          required: true,
          pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/
        }
      ],
      {}
    );
    const dialogRef = this.dialog.open(FormDialogComponent, {
      width: "450px",
      data: {
        title: "Invite",
        note:
          "You will receive reward tokens in your wallet when your invitee joins.",
        saveBtnTxt: "Send Invite",
        fields: fields
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed", result);
      if (!result) {
        return;
      }
      
      this.userService.invite(result.emails).subscribe(
        success => {
          this.msgService.showSuccess("Invitations have been sent!");
          console.log("success message", success);
        },
        error => {
          this.msgService.showError("Failed to send invitations!");
        }
      );
    });
  }
}
