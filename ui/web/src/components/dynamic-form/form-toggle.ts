import { FormBase } from "./form-base";

export class ToggleClass extends FormBase<string> {
  controlType = "toggle";
  options: { key: string; value: string }[] = [];
  checked: boolean = false;

  constructor(options: {} = {}) {
    super(options);
    this.options = options["options"] || [];
  }
}
