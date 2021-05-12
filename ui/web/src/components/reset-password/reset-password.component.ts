import { Component, OnInit } from "@angular/core";
import {
  FormArray,
  FormControl,
  FormGroup,
  FormGroupName,
  Validators
} from "@angular/forms";

import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { LoaderService } from "../../services/loader.service";
import { MessageService } from "../../services/message.service";

@Component({
  selector: "tt-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.css"]
})
export class ResetPasswordComponent implements OnInit {
  resetPwdFormGroup = new FormGroup({
    newPassword: new FormControl(),
    confirmation: new FormControl()
  });

  message: string;
  tempAccessToken: string;
  accessToken: string;
  resetDone: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private loaderService: LoaderService,
    private msgService: MessageService
  ) {}

  ngOnInit() {
    this.route.url.subscribe(url => {
      console.log(
        "URL: ",
        this.route,
        this.route.params,
        this.route.queryParamMap
      );

      this.route.queryParamMap.subscribe(val => {
        if (val) {
          this.accessToken = val.get("access_token");
        }
      });
    });
  }

  resetPassword() {
    // console.log(arguments);
    // console.log(this.resetPwdFormGroup);

    var values = this.resetPwdFormGroup.value;

    if (values["newPassword"] != values["confirmation"]) {
      this.msgService.showError(
        "Passwords do not match. Please correct and try again."
      );
      return;
    }

    // this.loaderService.show();

    this.authService
      .resetPassword(values["newPassword"], this.accessToken)
      .subscribe(
        response => {
          // this.loaderService.hide();
          this.resetDone = true;
        },
        error => {
          // this.loaderService.hide();
          this.resetDone = false;
        }
      );
  }

  gotoSignIn() {
    this.router.navigateByUrl("/signin");
  }
}
