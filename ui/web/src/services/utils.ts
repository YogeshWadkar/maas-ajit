import { Injectable } from "@angular/core";

@Injectable()
export class Utils {
  constructor() {}

  getObject(key, value, array) {
    let obj = null;
    if (array) {
      obj = array.find(item => {
        return item[key] == value;
      });
    }
    return obj;
  }

  getIdx(key, value, array) {
    let obj = null;
    if (array) {
      var ln = array.length;
      for (var i = 0; i < ln; i++) {
        if (array[i][key] == value) {
          return i;
        }
      }
    }
    return -1;
  }
}
