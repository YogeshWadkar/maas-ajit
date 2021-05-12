import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "limitTo"
})
export class TextLengthPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    const maxLength = 44;
    return value.length > maxLength ? value.substring(0, maxLength).concat("...") : value;
  }
}

// @Pipe({
//   name: "tttextlengthlargeellipsis"
// })
// export class TTTextLengthLargeEllipsis implements PipeTransform {
//   transform(value: string): string {
//     if (!value) return value;
//     const maxLength = 50; // 5 Times than normal text length
//     return value.length > maxLength
//       ? value.substring(0, maxLength).concat("...")
//       : value;
//   }
// }
