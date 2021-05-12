import { FormBase } from "./form-base";

export class TextAreaClass extends FormBase<string> {
  controlType = "textarea";
  options: { key: string; value: string }[] = [];
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options["type"] || "";
    this.options = options["options"] || [];
  }
}
