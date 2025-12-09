import { FormControl } from '@angular/forms';
import { nifValidator, phoneValidator, postalCodeValidator } from './spanish-formats.validator';

describe('nifValidator', () => {
  it('should return null for a valid NIF', () => {
    const control = new FormControl('12345678Z');
    expect(nifValidator()(control)).toBeNull();
  });

  it('should return nifInvalid error for an invalid NIF format', () => {
    const control = new FormControl('1234567Z'); // Too short
    expect(nifValidator()(control)).toEqual({ nifInvalid: true });
  });

  it('should return nifInvalid error for an invalid NIF letter', () => {
    const control = new FormControl('12345678A'); // Incorrect letter for 12345678
    expect(nifValidator()(control)).toEqual({ nifInvalid: true });
  });

  it('should return null for empty value', () => {
    const control = new FormControl('');
    expect(nifValidator()(control)).toBeNull();
  });
});

describe('phoneValidator', () => {
  it('should return null for a valid Spanish phone number', () => {
    const control = new FormControl('612345678');
    expect(phoneValidator()(control)).toBeNull();
  });

  it('should return phoneInvalid error for an invalid phone number format', () => {
    const control = new FormControl('123456789'); // Doesn't start with 6,7,8,9
    expect(phoneValidator()(control)).toEqual({ phoneInvalid: true });
  });

  it('should return phoneInvalid error for a phone number with incorrect length', () => {
    const control = new FormControl('61234567'); // Too short
    expect(phoneValidator()(control)).toEqual({ phoneInvalid: true });
  });

  it('should return null for empty value', () => {
    const control = new FormControl('');
    expect(phoneValidator()(control)).toBeNull();
  });
});

describe('postalCodeValidator', () => {
  it('should return null for a valid Spanish postal code', () => {
    const control = new FormControl('28001');
    expect(postalCodeValidator()(control)).toBeNull();
  });

  it('should return postalCodeInvalid error for an invalid postal code format', () => {
    const control = new FormControl('123'); // Too short
    expect(postalCodeValidator()(control)).toEqual({ postalCodeInvalid: true });
  });

  it('should return postalCodeInvalid error for a postal code outside Spanish range', () => {
    const control = new FormControl('00001'); // Invalid range
    expect(postalCodeValidator()(control)).toEqual({ postalCodeInvalid: true });
  });

  it('should return null for empty value', () => {
    const control = new FormControl('');
    expect(postalCodeValidator()(control)).toBeNull();
  });
});
