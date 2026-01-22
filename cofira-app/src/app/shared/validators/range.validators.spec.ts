import { FormControl } from '@angular/forms';
import {
  rangeValidator,
  positiveNumberValidator,
  integerValidator,
  percentageValidator,
  maxDecimalsValidator,
} from './range.validators';

describe('Range Validators', () => {
  describe('rangeValidator', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      const validator = rangeValidator(0, 100);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for null value', () => {
      const control = new FormControl(null);
      const validator = rangeValidator(0, 100);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for undefined value', () => {
      const control = new FormControl(undefined);
      const validator = rangeValidator(0, 100);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for value within range', () => {
      const control = new FormControl(50);
      const validator = rangeValidator(0, 100);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for value at min boundary', () => {
      const control = new FormControl(0);
      const validator = rangeValidator(0, 100);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for value at max boundary', () => {
      const control = new FormControl(100);
      const validator = rangeValidator(0, 100);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return error for value below min', () => {
      const control = new FormControl(-5);
      const validator = rangeValidator(0, 100);

      const result = validator(control);

      expect(result).toEqual({
        range: { min: 0, max: 100, actual: -5 },
      });
    });

    it('should return error for value above max', () => {
      const control = new FormControl(150);
      const validator = rangeValidator(0, 100);

      const result = validator(control);

      expect(result).toEqual({
        range: { min: 0, max: 100, actual: 150 },
      });
    });

    it('should return error for non-numeric value', () => {
      const control = new FormControl('abc');
      const validator = rangeValidator(0, 100);

      const result = validator(control);

      expect(result).toEqual({ notANumber: true });
    });

    it('should work with negative ranges', () => {
      const control = new FormControl(-50);
      const validator = rangeValidator(-100, -10);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should work with string numbers', () => {
      const control = new FormControl('50');
      const validator = rangeValidator(0, 100);

      const result = validator(control);

      expect(result).toBeNull();
    });
  });

  describe('positiveNumberValidator', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      const validator = positiveNumberValidator();

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for positive number', () => {
      const control = new FormControl(5);
      const validator = positiveNumberValidator();

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return error for zero', () => {
      const control = new FormControl(0);
      const validator = positiveNumberValidator();

      const result = validator(control);

      expect(result).toEqual({ positiveNumber: true });
    });

    it('should return error for negative number', () => {
      const control = new FormControl(-5);
      const validator = positiveNumberValidator();

      const result = validator(control);

      expect(result).toEqual({ positiveNumber: true });
    });

    it('should return error for non-numeric value', () => {
      const control = new FormControl('abc');
      const validator = positiveNumberValidator();

      const result = validator(control);

      expect(result).toEqual({ notANumber: true });
    });

    it('should work with decimal positive numbers', () => {
      const control = new FormControl(0.5);
      const validator = positiveNumberValidator();

      const result = validator(control);

      expect(result).toBeNull();
    });
  });

  describe('integerValidator', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      const validator = integerValidator();

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for integer', () => {
      const control = new FormControl(10);
      const validator = integerValidator();

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for zero', () => {
      const control = new FormControl(0);
      const validator = integerValidator();

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for negative integer', () => {
      const control = new FormControl(-5);
      const validator = integerValidator();

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return error for decimal number', () => {
      const control = new FormControl(5.5);
      const validator = integerValidator();

      const result = validator(control);

      expect(result).toEqual({ integer: true });
    });

    it('should return error for non-numeric value', () => {
      const control = new FormControl('abc');
      const validator = integerValidator();

      const result = validator(control);

      expect(result).toEqual({ notANumber: true });
    });
  });

  describe('percentageValidator', () => {
    it('should return null for valid percentage', () => {
      const control = new FormControl(50);
      const validator = percentageValidator();

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for 0', () => {
      const control = new FormControl(0);
      const validator = percentageValidator();

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for 100', () => {
      const control = new FormControl(100);
      const validator = percentageValidator();

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return error for negative percentage', () => {
      const control = new FormControl(-10);
      const validator = percentageValidator();

      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result!['range']).toBeDefined();
    });

    it('should return error for percentage above 100', () => {
      const control = new FormControl(150);
      const validator = percentageValidator();

      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result!['range']).toBeDefined();
    });
  });

  describe('maxDecimalsValidator', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      const validator = maxDecimalsValidator(2);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for integer', () => {
      const control = new FormControl('10');
      const validator = maxDecimalsValidator(2);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for valid decimals', () => {
      const control = new FormControl('10.55');
      const validator = maxDecimalsValidator(2);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for fewer decimals than max', () => {
      const control = new FormControl('10.5');
      const validator = maxDecimalsValidator(2);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return error for too many decimals', () => {
      const control = new FormControl('10.555');
      const validator = maxDecimalsValidator(2);

      const result = validator(control);

      expect(result).toEqual({
        maxDecimals: { required: 2, actual: 3 },
      });
    });

    it('should work with zero max decimals', () => {
      const control = new FormControl('10.5');
      const validator = maxDecimalsValidator(0);

      const result = validator(control);

      expect(result).toEqual({
        maxDecimals: { required: 0, actual: 1 },
      });
    });
  });
});
