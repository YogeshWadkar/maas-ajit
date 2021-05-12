import { Injectable } from "@angular/core";
import { LoaderState } from "../components/loader/loader";
import { Subject } from "rxjs";

@Injectable()
export class LoaderService {
  private loaderSubject = new Subject<LoaderState>();
  loaderState = this.loaderSubject.asObservable();
  constructor() {}
  show() {
    this.loaderSubject.next(<LoaderState>{ show: true });
  }
  hide() {
    this.loaderSubject.next(<LoaderState>{ show: false });
  }
}
