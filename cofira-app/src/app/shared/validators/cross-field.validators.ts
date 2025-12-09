import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

export function passwordMatchValidator(
  controlName: string,
  matchingControlName: string
): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (!control || !matchingControl) {
      return null;
    }

    // Return if another validator has already found an error on the matchingControl
    if (matchingControl.errors && !matchingControl.errors['passwordMatch']) {
      return null;
    }

    // Set error on matchingControl if validation fails
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ passwordMatch: true });
      return { passwordMatch: true };
    } else {
      matchingControl.setErrors(null);
      return null;
    }
  };
}
