import { Component, OnInit } from "@angular/core";
import {
  FormArray,
  FormControl,
  FormGroup,
  FormGroupName,
  Validators
} from "@angular/forms";

import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { LoaderService } from "../../services/loader.service";

@Component({
  selector: "tt-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.css"]
})
export class ForgotPasswordComponent implements OnInit {
  message: string;

  forgotPwdFormGroup = new FormGroup({
    email: new FormControl()
  });
  emailSent: boolean = false;

  constructor(
    private authService: AuthService,
    private loaderService: LoaderService
  ) {}

  ngOnInit() {}

  onSubmit() {
    // console.log(this.forgotPwdFormGroup);

    this.loaderService.show();

    this.authService
      .resetPwdWithEmail(this.forgotPwdFormGroup.get("email").value)
      .subscribe(
        response => {
          this.loaderService.hide();
          this.emailSent = true;
        },
        error => {
          this.loaderService.hide();
          this.emailSent = false;
        }
      );
  }
}
