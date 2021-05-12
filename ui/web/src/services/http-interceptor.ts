import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse
} from "@angular/common/http";

import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { tap, finalize } from "rxjs/operators";

import { MessageService } from "../services/message.service";
import { LoaderService } from "./loader.service";

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private msgService: MessageService,
    private loaderService: LoaderService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const started = Date.now();
    let ok: string;

    this.loaderService.show();

    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<any>) => {
          ok = event instanceof HttpResponse ? "succeeded" : "";
        },
        (err: any) => {
          ok = "failed";
          // if (err instanceof HttpErrorResponse) {
          console.log("======>", err, err.error.error);

          var errMsg = "";
          if (err.status == 0) {
            errMsg = err.status + ": Could not connect to the server";
          }

          if (err.error.error) {
            if (err.error.error.code === "AUTHORIZATION_REQUIRED") {
              this.router.navigateByUrl("/");
            }

            errMsg = err.status + ": " + err.error.error.message;
          }
          this.msgService.showError(errMsg);
          // }
        }
      ),
      finalize(() => {
        const elapsed = Date.now() - started;
        const msg = `${request.method} "${request.urlWithParams}"
             ${ok} in ${elapsed} ms.`;
        console.log(msg);
        this.loaderService.hide();
      })
    );
  }
}
