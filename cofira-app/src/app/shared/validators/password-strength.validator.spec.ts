import { FormControl, FormGroup } from '@angular/forms';
import { passwordStrengthValidator } from './password-strength.validator';

describe('passwordStrengthValidator', () => {
  it('should return null for a strong password', () => {
    const control = new FormControl('StrongP@ssw0rd');
    expect(passwordStrengthValidator()(control)).toBeNull();
  });

  it('should return passwordStrength error if password is too short', () => {
    const control = new FormControl('Short1!');
    expect(passwordStrengthValidator()(control)).toEqual({ passwordStrength: true });
  });

  it('should return passwordStrength error if password lacks uppercase', () => {
    const control = new FormControl('strongp@ssw0rd');
    expect(passwordStrengthValidator()(control)).toEqual({ passwordStrength: true });
  });

  it('should return passwordStrength error if password lacks lowercase', () => {
    const control = new FormControl('STRONGP@SSW0RD');
    expect(passwordStrengthValidator()(control)).toEqual({ passwordStrength: true });
  });

  it('should return passwordStrength error if password lacks numeric', () => {
    const control = new FormControl('StrongP@ssword');
    expect(passwordStrengthValidator()(control)).toEqual({ passwordStrength: true });
  });

  it('should return passwordStrength error if password lacks special character', () => {
    const control = new FormControl('StrongPassword123');
    expect(passwordStrengthValidator()(control)).toEqual({ passwordStrength: true });
  });

  it('should return null for empty value', () => {
    const control = new FormControl('');
    expect(passwordStrengthValidator()(control)).toBeNull();
  });
});
