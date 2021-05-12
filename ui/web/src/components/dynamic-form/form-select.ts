import { FormBase } from "./form-base";

export class DropdownClass extends FormBase<string> {
  controlType = "dropdown";
  options: { key: string; value: string }[] = [];
  defaultValue: string;

  constructor(options: {} = {}) {
    super(options);
    this.options = options["options"] || [];
  }
}
