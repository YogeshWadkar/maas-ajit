import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { LoaderService } from "../../services/loader.service";
import { MessageService } from "../../services/message.service";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";

@Component({
  selector: "tt-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"]
})
export class SignupComponent implements OnInit {
  hasSignedup: boolean = false;
  usedEmail: any = "";
  isCodeValid: boolean = false;
  isCodeValidated: boolean = false;
  validationMsg: string[] = [
    "Invalid Referral Code",
    "Entered Referral Code is valid"
  ];
  adminInvitee = false;
  subscriptions: any[] = [];

  referralCodeSource = new Subject<any>();
  referralCodeValue$ = this.referralCodeSource.asObservable();

  constructor(
    private authService: AuthService,
    private globalCfgService: GlobalCfgService,
    private msgService: MessageService,
    private route: ActivatedRoute
  ) {}

  signupFormGroup = new FormGroup({
    firstName: new FormControl(),
    lastName: new FormControl(),
    email: new FormControl(),
    mobileNo: new FormControl(),
    password: new FormControl(),
    confirmPassword: new FormControl(),
    signupAs: new FormControl(),
    iAccept: new FormControl(),
    referralCode: new FormControl()
  });

  ngOnInit() {
    this.subscriptions.push(
      this.referralCodeValue$.subscribe(code => {
        if (code && code.length > 0) {
          this.authService.signUpVisitedWithCode(code).subscribe((res: any) => {
            console.log("Sign Up visited with code");
            if (res.result.signUpVisited) {
              this.validateCode(code);
              this.signupFormGroup.controls.referralCode.setValue(code);
              if (res.result.invitorRole == "admin") {
                this.adminInvitee = true;
              }
            }
          });
        }
      })
    );

    this.subscriptions.push(
      this.route.url.subscribe(url => {
        console.log(
          "URL: ",
          this.route,
          this.route.params,
          this.route.queryParamMap
        );

        this.route.queryParamMap.subscribe(val => {
          this.referralCodeSource.next(val.get("ref_code"));
        });
      })
    );
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onSubmit(values) {
    if (values["password"] != values["confirmPassword"]) {
      this.msgService.showError(
        "Passwords do not match. Please correct and try again."
      );
      return;
    }

    if (this.isCodeValidated && !this.isCodeValid) {
      this.msgService.showError(
        "Invalid Referral Code. Please correct and try again."
      );
      return;
    }

    this.authService.signup(values).subscribe(
      response => {
        this.globalCfgService.setLoggedInUser(response, values.keepMeSignedIn);
        console.log("Signup successful!!");

        this.usedEmail = this.signupFormGroup.get("email").value;

        this.signupFormGroup.reset();
        this.hasSignedup = true;
      },
      error => {
        console.log(error);
        console.log("Signup failed!");
        this.hasSignedup = false;
      }
    );
  }

  validateCode(value) {
    this.isCodeValidated = false;

    var val = value;

    if (val.length == 0) {
      this.isCodeValidated = false;
      return;
    }

    if (val.length == 6) {
      this.authService.validateReferralCode(val).subscribe((res: any) => {
        this.isCodeValid = res.result;
        this.isCodeValidated = true;
      });
    } else {
      this.isCodeValidated = true;
      this.isCodeValid = false;
    }
  }
}
