import { FormBase } from "./form-base";

export class TextboxClass extends FormBase<string> {
  controlType = "textbox";
  options: { key: string; value: string }[] = [];
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options["type"] || "";
    this.options = options["options"] || [];
  }
}
