import { Component, OnInit } from "@angular/core";
import {
  FormArray,
  FormControl,
  FormGroup,
  FormGroupName,
  Validators
} from "@angular/forms";

import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "tt-user-verified",
  templateUrl: "./user-verified.component.html",
  styleUrls: ["./user-verified.component.css"]
})
export class UserVerifiedComponent implements OnInit {
  resetPwdFormGroup = new FormGroup({
    newPassword: new FormControl(),
    confirmation: new FormControl()
  });

  message: string;
  tempAccessToken: string;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {}

  resetPassword() {
    // console.log(arguments);
    // console.log(this.resetPwdFormGroup);

    var values = this.resetPwdFormGroup.value;
    var me = this;
  }

  gotoSignIn() {
    this.router.navigateByUrl("/signin");
  }
}
