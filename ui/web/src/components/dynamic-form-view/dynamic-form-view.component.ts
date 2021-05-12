import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";

import { FormBase } from "../dynamic-form/form-base";

@Component({
  selector: "tt-dynamic-form-view",
  templateUrl: "./dynamic-form-view.component.html"
})
export class DynamicFormQuestionComponent {
  @Input() field: FormBase<any>;
  @Input() form: FormGroup;

  get isValid() {
    return this.form.controls[this.field.key].valid;
  }
}
