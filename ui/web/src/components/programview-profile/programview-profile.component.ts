import {
  Component,
  Inject
} from "@angular/core";

import { OnInit } from "@angular/core";
import { MiscService } from "../../services/misc.service";
//import { UserService } from "../../services/user.service";
import { ProgramService } from "../../services/program.service";
import { GlobalCfgService } from "../../services/globalcfg.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Subject } from "rxjs";


@Component({
  selector: "tt-programview-profile",
  templateUrl: "./programview-profile.component.html",
  styleUrls: ["./programview-profile.component.css"]
})
export class ProgramViewProfileComponent implements OnInit {
  user: object;

  location: string = "";

  userSource: any;
  //private userFetchedValue$ = this.userSource.asObservable();

  subscriptions: any = [];
  userdata1: any;
  userrole: any;
  constructor(
    private miscService: MiscService,
    private programService: ProgramService,
    private globalCfgService: GlobalCfgService,
    private dialogRef: MatDialogRef<ProgramViewProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit() {

    this.user = this.globalCfgService.getFullUserObj();
    this.userdata1 = this.user['signupAs'];

    if (this.data.userId) {
      console.log("Loading detail for user: ", this.data.userId);
      this.programService.getProgramDetail(this.data.userId).subscribe(
        users => {
          this.userSource = users;
        },
        error => {
          console.log("Service error: ", error);
        }
      );
    }

  }


  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}

export interface DialogData {
  userId: number;
}
