import { FormBase } from "./form-base";

export class DateClass extends FormBase<string> {
  controlType = "date";
  options: { key: string; value: string }[] = [];
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options["type"] || "";
    this.options = options["options"] || [];
  }
}
