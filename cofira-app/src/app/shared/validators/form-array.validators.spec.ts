import { FormArray, FormControl, Validators } from '@angular/forms';
import {
  minArrayLengthValidator,
  maxArrayLengthValidator,
  atLeastOneSelectedValidator,
  minSelectedValidator,
  uniqueArrayValuesValidator,
  allItemsValidValidator,
} from './form-array.validators';

describe('Form Array Validators', () => {
  describe('minArrayLengthValidator', () => {
    it('should return null for non-FormArray control', () => {
      const control = new FormControl('test');
      const validator = minArrayLengthValidator(1);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null when array meets minimum length', () => {
      const array = new FormArray([new FormControl('a'), new FormControl('b')]);
      const validator = minArrayLengthValidator(2);

      const result = validator(array);

      expect(result).toBeNull();
    });

    it('should return null when array exceeds minimum length', () => {
      const array = new FormArray([
        new FormControl('a'),
        new FormControl('b'),
        new FormControl('c'),
      ]);
      const validator = minArrayLengthValidator(2);

      const result = validator(array);

      expect(result).toBeNull();
    });

    it('should return error when array is below minimum length', () => {
      const array = new FormArray([new FormControl('a')]);
      const validator = minArrayLengthValidator(3);

      const result = validator(array);

      expect(result).not.toBeNull();
      expect(result!['minArrayLength']).toBeDefined();
      expect(result!['minArrayLength'].required).toBe(3);
      expect(result!['minArrayLength'].actual).toBe(1);
    });

    it('should return error for empty array when minimum is 1', () => {
      const array = new FormArray([]);
      const validator = minArrayLengthValidator(1);

      const result = validator(array);

      expect(result).not.toBeNull();
      expect(result!['minArrayLength'].actual).toBe(0);
    });
  });

  describe('maxArrayLengthValidator', () => {
    it('should return null for non-FormArray control', () => {
      const control = new FormControl('test');
      const validator = maxArrayLengthValidator(5);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null when array is at maximum length', () => {
      const array = new FormArray([new FormControl('a'), new FormControl('b')]);
      const validator = maxArrayLengthValidator(2);

      const result = validator(array);

      expect(result).toBeNull();
    });

    it('should return null when array is below maximum length', () => {
      const array = new FormArray([new FormControl('a')]);
      const validator = maxArrayLengthValidator(5);

      const result = validator(array);

      expect(result).toBeNull();
    });

    it('should return error when array exceeds maximum length', () => {
      const array = new FormArray([
        new FormControl('a'),
        new FormControl('b'),
        new FormControl('c'),
        new FormControl('d'),
      ]);
      const validator = maxArrayLengthValidator(3);

      const result = validator(array);

      expect(result).not.toBeNull();
      expect(result!['maxArrayLength']).toBeDefined();
      expect(result!['maxArrayLength'].required).toBe(3);
      expect(result!['maxArrayLength'].actual).toBe(4);
    });
  });

  describe('atLeastOneSelectedValidator', () => {
    it('should return null for non-FormArray control', () => {
      const control = new FormControl(true);
      const validator = atLeastOneSelectedValidator();

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null when at least one checkbox is selected', () => {
      const array = new FormArray([
        new FormControl(false),
        new FormControl(true),
        new FormControl(false),
      ]);
      const validator = atLeastOneSelectedValidator();

      const result = validator(array);

      expect(result).toBeNull();
    });

    it('should return null when multiple checkboxes are selected', () => {
      const array = new FormArray([
        new FormControl(true),
        new FormControl(true),
        new FormControl(false),
      ]);
      const validator = atLeastOneSelectedValidator();

      const result = validator(array);

      expect(result).toBeNull();
    });

    it('should return error when no checkbox is selected', () => {
      const array = new FormArray([
        new FormControl(false),
        new FormControl(false),
        new FormControl(false),
      ]);
      const validator = atLeastOneSelectedValidator();

      const result = validator(array);

      expect(result).toEqual({ atLeastOneRequired: true });
    });

    it('should return error for empty array', () => {
      const array = new FormArray([]);
      const validator = atLeastOneSelectedValidator();

      const result = validator(array);

      expect(result).toEqual({ atLeastOneRequired: true });
    });
  });

  describe('minSelectedValidator', () => {
    it('should return null for non-FormArray control', () => {
      const control = new FormControl(true);
      const validator = minSelectedValidator(2);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null when minimum selections are met', () => {
      const array = new FormArray([
        new FormControl(true),
        new FormControl(true),
        new FormControl(false),
      ]);
      const validator = minSelectedValidator(2);

      const result = validator(array);

      expect(result).toBeNull();
    });

    it('should return null when selections exceed minimum', () => {
      const array = new FormArray([
        new FormControl(true),
        new FormControl(true),
        new FormControl(true),
      ]);
      const validator = minSelectedValidator(2);

      const result = validator(array);

      expect(result).toBeNull();
    });

    it('should return error when selections are below minimum', () => {
      const array = new FormArray([
        new FormControl(true),
        new FormControl(false),
        new FormControl(false),
      ]);
      const validator = minSelectedValidator(2);

      const result = validator(array);

      expect(result).not.toBeNull();
      expect(result!['minSelected']).toBeDefined();
      expect(result!['minSelected'].required).toBe(2);
      expect(result!['minSelected'].actual).toBe(1);
    });
  });

  describe('uniqueArrayValuesValidator', () => {
    it('should return null for non-FormArray control', () => {
      const control = new FormControl('test');
      const validator = uniqueArrayValuesValidator();

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for unique values', () => {
      const array = new FormArray([
        new FormControl('a'),
        new FormControl('b'),
        new FormControl('c'),
      ]);
      const validator = uniqueArrayValuesValidator();

      const result = validator(array);

      expect(result).toBeNull();
    });

    it('should return error for duplicate values', () => {
      const array = new FormArray([
        new FormControl('a'),
        new FormControl('b'),
        new FormControl('a'),
      ]);
      const validator = uniqueArrayValuesValidator();

      const result = validator(array);

      expect(result).toEqual({ duplicateValues: true });
    });

    it('should ignore null, undefined and empty string values', () => {
      const array = new FormArray([
        new FormControl(null),
        new FormControl(null),
        new FormControl(''),
        new FormControl(''),
        new FormControl(undefined),
      ]);
      const validator = uniqueArrayValuesValidator();

      const result = validator(array);

      expect(result).toBeNull();
    });

    it('should compare by key for objects', () => {
      const array = new FormArray([
        new FormControl({ email: 'a@test.com', name: 'A' }),
        new FormControl({ email: 'b@test.com', name: 'B' }),
      ]);
      const validator = uniqueArrayValuesValidator('email');

      const result = validator(array);

      expect(result).toBeNull();
    });

    it('should detect duplicates by key for objects', () => {
      const array = new FormArray([
        new FormControl({ email: 'a@test.com', name: 'A' }),
        new FormControl({ email: 'a@test.com', name: 'B' }),
      ]);
      const validator = uniqueArrayValuesValidator('email');

      const result = validator(array);

      expect(result).toEqual({ duplicateValues: true });
    });
  });

  describe('allItemsValidValidator', () => {
    it('should return null for non-FormArray control', () => {
      const control = new FormControl('test');
      const validator = allItemsValidValidator();

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null when all items are valid', () => {
      const array = new FormArray([
        new FormControl('valid1'),
        new FormControl('valid2'),
      ]);
      const validator = allItemsValidValidator();

      const result = validator(array);

      expect(result).toBeNull();
    });

    it('should return null for empty array', () => {
      const array = new FormArray([]);
      const validator = allItemsValidValidator();

      const result = validator(array);

      expect(result).toBeNull();
    });

    it('should return error when some items are invalid', () => {
      const array = new FormArray([
        new FormControl('valid', Validators.required),
        new FormControl('', Validators.required),
      ]);
      const validator = allItemsValidValidator();

      const result = validator(array);

      expect(result).toEqual({ allItemsValid: false });
    });

    it('should return error when all items are invalid', () => {
      const array = new FormArray([
        new FormControl('', Validators.required),
        new FormControl('', Validators.required),
      ]);
      const validator = allItemsValidValidator();

      const result = validator(array);

      expect(result).toEqual({ allItemsValid: false });
    });
  });
});
