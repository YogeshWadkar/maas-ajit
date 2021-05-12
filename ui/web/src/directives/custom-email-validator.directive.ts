import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, Validator, ValidatorFn } from '@angular/forms';

@Directive({
  selector: '[customEmailsValidator]',
  providers: [{ provide: NG_VALIDATORS, useExisting: CustomEmailValidatorDirective, multi: true }]
})
export class CustomEmailValidatorDirective implements Validator{

  @Input('customEmailsValidator') emailPattern: string;

  validate(control: AbstractControl): { [key: string]: any } | null {
    return this.emailPattern ? this.multipleEmailValidator(new RegExp(this.emailPattern, 'i'))(control)
      : null;
  }

  multipleEmailValidator(emailRegExp: RegExp): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const emailsWithoutSpace = control.value.replace(/\s/g, "");
      const emailArray = emailsWithoutSpace.split(",");
      let invEmails = "";
      let isInvalid = false;
      for (let i = 0; i <= (emailArray.length - 1); i++) {
        if (this.checkEmail(emailArray[i], emailRegExp)) {
          //Do what you want with the email.
        } else {
          invEmails += emailArray[i] + "\n";
        }
      }
      if (invEmails != "") {
        console.log("Invalid emails:\n" + invEmails);
        isInvalid = true;
      }
      return isInvalid ? { invalidEmails: {ms: "Enter valid input"}} : null;
    };
  }

  checkEmail(email, regExp) {
    return regExp.test(email);
  }
}
