import { Injectable } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { FormBase } from "../components/dynamic-form/form-base";
import { customValidator } from "src/directives/validators";

@Injectable()
export class FormGroupControlService {
  constructor() {}

  toFormGroup(fields: FormBase<any>[], values) {
    let group: any = {};

    fields.forEach(field => {
      if (field.required && !field.validationType) {
        group[field.key] = new FormControl(
          { value: field.value || "", disabled: field.disabled },
          Validators.required
        );
      }
      if (field.required && field.validationType) {
        group[field.key] = new FormControl(
          { value: field.value || "", disabled: field.disabled },
          [Validators.required, customValidator(field.validationType)]
        );
      } else {
        group[field.key] = new FormControl({
          value: field.value || "",
          disabled: field.disabled
        });
      }
    });
    return new FormGroup(group);
  }
}
