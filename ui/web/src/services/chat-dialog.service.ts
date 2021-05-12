import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { GlobalCfgService } from "./globalcfg.service";
import { environment } from "../environments/environment";
import { Subject } from 'rxjs';

@Injectable()
export class ChatDialogService {

    chatDialogs: any[] = [];

    public chatSource = new Subject<any>();
    public chatFetchedValue$ = this.chatSource.asObservable();

    public closeAllSource = new Subject<any>();
    public closeAllFetchedValue$ = this.closeAllSource.asObservable();

  constructor(
    private globalCfgService: GlobalCfgService
  ) {}

  add(ctx) {
    this.chatDialogs.push(ctx);
    this.chatSource.next(ctx);
  }

  closeAll() {
    this.closeAllSource.next();
  }
}
