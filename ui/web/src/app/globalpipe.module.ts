import { NgModule } from "@angular/core";

import {
  TTDateFormatPipe,
  TTBoolFormatPipe,
  TTDateAgoPipe,
  TTTextLengthNormalEllipsis,
  TTTextLengthLargeEllipsis,
  TTDTimeFormatPipe,
  TTGenericDatePipe
} from "./global.pipe";

@NgModule({
  imports: [],
  exports: [
    TTDateFormatPipe,
    TTBoolFormatPipe,
    TTDateAgoPipe,
    TTTextLengthNormalEllipsis,
    TTTextLengthLargeEllipsis,
    TTDTimeFormatPipe,
    TTGenericDatePipe
  ],
  declarations: [
    TTDateFormatPipe,
    TTBoolFormatPipe,
    TTDateAgoPipe,
    TTTextLengthNormalEllipsis,
    TTTextLengthLargeEllipsis,
    TTDTimeFormatPipe,
    TTGenericDatePipe
  ],
  providers: [
    TTDateFormatPipe,
    TTBoolFormatPipe,
    TTDateAgoPipe,
    TTTextLengthNormalEllipsis,
    TTTextLengthLargeEllipsis,
    TTDTimeFormatPipe,
    TTGenericDatePipe
  ]
})
export class GlobalPipesModule {}
