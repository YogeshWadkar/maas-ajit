import { FormBase } from "./form-base";

export class CheckboxClass extends FormBase<string> {
  controlType: string;
  options: { key: string; value: string; checked: boolean }[] = [];
  checked: boolean = false;

  constructor(options: {} = {}) {
    super(options);

    this.controlType = "checkbox";
    this.options = options["options"] || [];
    this.checked = this.options[0].checked || false;
  }
}
