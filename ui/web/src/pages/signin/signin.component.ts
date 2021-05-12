import { Component } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { UserService } from "../../services/user.service";

@Component({
  selector: "tt-signin",
  templateUrl: "./signin.component.html",
  styleUrls: ["./signin.component.css"]
})
export class SigninComponent {
  signinFormGroup = new FormGroup({
    email: new FormControl(),
    password: new FormControl(),
    keepMeSignedIn: new FormControl()
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private globalCfgService: GlobalCfgService
  ) {}

  onSubmit(values) {
    this.authService.login(values).subscribe(
      response => {
        this.globalCfgService.setLoggedInUser(response, values.keepMeSignedIn);

        this.userService.getUserDetail(response["userId"]).subscribe(result => {
          var res = result['data'];
          console.log("SignIn: Setting user: ", res);
          this.globalCfgService.setFullUserObj(res[0]);
          this.router.navigateByUrl("/" + res[0]["role"]["name"]);
        });
      },
      error => {
        console.log(error);
        console.log("Login failed!");
      }
    );
  }
}
