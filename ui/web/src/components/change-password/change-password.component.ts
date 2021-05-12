import { Component, OnInit } from "@angular/core";
import {
  FormArray,
  FormControl,
  FormGroup,
  FormGroupName,
  Validators
} from "@angular/forms";

import { Router } from "@angular/router";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { MessageService } from "../../services/message.service";
import { UserService } from "../../services/user.service";

@Component({
  selector: "tt-change-password",
  templateUrl: "./change-password.component.html",
  styleUrls: ["./change-password.component.css"]
})
export class ChangePasswordComponent implements OnInit {
  changePwdFormGroup = new FormGroup({
    oldPassword: new FormControl(),
    newPassword: new FormControl(),
    confirmPassword: new FormControl()
  });

  dashboardLink = "";
  user: object;

  constructor(
    private router: Router,
    private globalCfgService: GlobalCfgService,
    private msgService: MessageService,
    private userService: UserService
  ) {
    //do nothing
  }

  ngOnInit() {
    //keep the original object to restore values
    this.user = this.globalCfgService.getFullUserObj();

    this.dashboardLink = "/" + this.user["role"]["name"];
  }

  changePassword() {
    console.log("changePassword...");
    var values = this.changePwdFormGroup.value;

    if (values.oldPassword == values.newPassword) {
      this.msgService.showError(
        "New password must be different from old password"
      );
      return;
    }

    if (values.newPassword != values.confirmPassword) {
      this.msgService.showError(
        "New passwords do not match. Please correct and try again"
      );
      return;
    }

    this.userService.changePwd(values).subscribe(() => {
      this.msgService.showSuccess("Your new password has been updated");
      this.changePwdFormGroup.reset();
    });
  }
}
