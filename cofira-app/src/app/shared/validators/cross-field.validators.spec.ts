import { FormControl, FormGroup } from '@angular/forms';
import { passwordMatchValidator } from './cross-field.validators';

describe('passwordMatchValidator', () => {
  it('should return null if passwords match', () => {
    const formGroup = new FormGroup({
      password: new FormControl('password123'),
      confirmPassword: new FormControl('password123'),
    });
    expect(passwordMatchValidator('password', 'confirmPassword')(formGroup)).toBeNull();
  });

  it('should return passwordMatch error if passwords do not match', () => {
    const formGroup = new FormGroup({
      password: new FormControl('password123'),
      confirmPassword: new FormControl('different'),
    });
    const validator = passwordMatchValidator('password', 'confirmPassword')(formGroup);
    expect(validator).toEqual({ passwordMatch: true });
    expect(formGroup.get('confirmPassword')?.errors).toEqual({ passwordMatch: true });
  });

  it('should return null if control or matchingControl are not found', () => {
    const formGroup = new FormGroup({
      password: new FormControl('password123'),
    });
    expect(passwordMatchValidator('password', 'nonExistent')(formGroup)).toBeNull();
  });

  it('should clear error if passwords become matching', () => {
    const formGroup = new FormGroup({
      password: new FormControl('password123'),
      confirmPassword: new FormControl('different'),
    });
    const validator = passwordMatchValidator('password', 'confirmPassword');
    formGroup.setValidators(validator);
    formGroup.get('confirmPassword')?.setValue('password123');
    expect(formGroup.get('confirmPassword')?.errors).toBeNull();
  });
});
