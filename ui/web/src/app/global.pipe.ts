import { Pipe, PipeTransform } from "@angular/core";
import * as moment from "moment";

@Pipe({
  name: "ttgenericdate"
})
export class TTGenericDatePipe implements PipeTransform {
  transform(value: any[], args: any): any {
    if (!value) {
      return "";
    }
    var m = moment(value).format(args);
    return m;
  }
}

@Pipe({
  name: "ttdateago"
})
export class TTDateAgoPipe implements PipeTransform {
  transform(value: any[], args: any): any {
    if (!value) {
      return "";
    }
    var m = moment(value);
    return m.fromNow();
  }
}

@Pipe({
  name: "ttdateformat"
})
export class TTDateFormatPipe implements PipeTransform {
  transform(value: any[], args: any): any {
    if (!value) {
      return "";
    }
    var m = moment(value);
    return m.format("MM/DD/YYYY hh:mm:ss A");
  }
}

@Pipe({
  name: "tttimeformat"
})

export class TTDTimeFormatPipe implements PipeTransform {
  transform(value: any[], args: any): any {
      if (!value) {
          return '';
      }
      var m = moment(value);
      return m.format('hh:mm A');
  }
}


@Pipe({
  name: "ttboolformat"
})
export class TTBoolFormatPipe implements PipeTransform {
  transform(value: any[], args: any): any {
    return value ? "Yes" : "No";
  }
}

@Pipe({
  name: "tttextlengthnormalellipsis"
})
export class TTTextLengthNormalEllipsis implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    const maxLength = 10;
    return value.length > maxLength
      ? value.substring(0, maxLength).concat("...")
      : value;
  }
}

@Pipe({
  name: "tttextlengthlargeellipsis"
})
export class TTTextLengthLargeEllipsis implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    const maxLength = 50; // 5 Times than normal text length
    return value.length > maxLength
      ? value.substring(0, maxLength).concat("...")
      : value;
  }
}
