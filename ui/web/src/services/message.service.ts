import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SnackBarComponent } from "../components/snack-bar/snack-bar.component";

import { GlobalCfgService } from "./globalcfg.service";

@Injectable()
export class MessageService {
  constructor(
    private snackBar: MatSnackBar,
    private globalCfgService: GlobalCfgService
  ) { }
  public showSuccess(msg) {
    this.snackBar.openFromComponent(SnackBarComponent, {
      data: { error: false, msg: msg }
    });
  }

  public showError(msg) {
    this.snackBar.openFromComponent(SnackBarComponent, {
      data: { error: true, msg: msg }
    });
  }
}
