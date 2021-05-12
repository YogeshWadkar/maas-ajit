import { ValidatorFn, AbstractControl } from "@angular/forms";

export function customValidator(validationType): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    let customValidation: boolean;
    const mobilePattern = /^[(]{0,1}[+0-9]{1,4}[)]{0,1}[0-9]{10}$/;
    const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;

    switch (validationType) {
      case "email":
        customValidation = emailPattern.test(control.value);
        break;
      case "mobileNo":
        customValidation =
          mobilePattern.test(control.value) && control.value.length >= 10;
        break;
    }
    return !customValidation
      ? { ValidationError: { ms: "Enter valid input" } }
      : null;
  };
}
