import { FormControl } from '@angular/forms';
import {
  futureDateValidator,
  dateRangeValidator,
  pastDateValidator,
  minAgeValidator,
} from './date.validators';

describe('Date Validators', () => {
  describe('futureDateValidator', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      const validator = futureDateValidator();

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for future date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const control = new FormControl(tomorrow.toISOString().split('T')[0]);
      const validator = futureDateValidator();

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for today', () => {
      const today = new Date();
      const control = new FormControl(today.toISOString().split('T')[0]);
      const validator = futureDateValidator();

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return error for past date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const control = new FormControl(yesterday.toISOString().split('T')[0]);
      const validator = futureDateValidator();

      const result = validator(control);

      expect(result).toEqual({ pastDate: true });
    });
  });

  describe('pastDateValidator', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      const validator = pastDateValidator();

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for past date', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 5);
      const control = new FormControl(pastDate.toISOString().split('T')[0]);
      const validator = pastDateValidator();

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for today', () => {
      const today = new Date();
      const control = new FormControl(today.toISOString().split('T')[0]);
      const validator = pastDateValidator();

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return error for future date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const control = new FormControl(tomorrow.toISOString().split('T')[0]);
      const validator = pastDateValidator();

      const result = validator(control);

      expect(result).toEqual({ futureDate: true });
    });
  });

  describe('dateRangeValidator', () => {
    it('should return null for empty value', () => {
      const min = new Date('2024-01-01');
      const max = new Date('2024-12-31');
      const control = new FormControl('');
      const validator = dateRangeValidator(min, max);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for date within range', () => {
      const min = new Date('2024-01-01');
      const max = new Date('2024-12-31');
      const control = new FormControl('2024-06-15');
      const validator = dateRangeValidator(min, max);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for date on min boundary', () => {
      const min = new Date('2024-01-01');
      const max = new Date('2024-12-31');
      const control = new FormControl('2024-01-01');
      const validator = dateRangeValidator(min, max);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for date on max boundary', () => {
      const min = new Date('2024-01-01');
      const max = new Date('2024-12-31');
      const control = new FormControl('2024-12-31');
      const validator = dateRangeValidator(min, max);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return error for date before min', () => {
      const min = new Date('2024-01-01');
      const max = new Date('2024-12-31');
      const control = new FormControl('2023-06-15');
      const validator = dateRangeValidator(min, max);

      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result!['minDate']).toBeDefined();
      expect(result!['minDate'].actual).toBe('2023-06-15');
    });

    it('should return error for date after max', () => {
      const min = new Date('2024-01-01');
      const max = new Date('2024-12-31');
      const control = new FormControl('2025-06-15');
      const validator = dateRangeValidator(min, max);

      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result!['maxDate']).toBeDefined();
      expect(result!['maxDate'].actual).toBe('2025-06-15');
    });

    it('should work with only minDate', () => {
      const min = new Date('2024-01-01');
      const control = new FormControl('2024-06-15');
      const validator = dateRangeValidator(min);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should work with only maxDate', () => {
      const max = new Date('2024-12-31');
      const control = new FormControl('2024-06-15');
      const validator = dateRangeValidator(undefined, max);

      const result = validator(control);

      expect(result).toBeNull();
    });
  });

  describe('minAgeValidator', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      const validator = minAgeValidator(18);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for age meeting minimum', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 25);
      const control = new FormControl(birthDate.toISOString().split('T')[0]);
      const validator = minAgeValidator(18);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for age exactly at minimum', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 18);
      const control = new FormControl(birthDate.toISOString().split('T')[0]);
      const validator = minAgeValidator(18);

      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return error for age below minimum', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 15);
      const control = new FormControl(birthDate.toISOString().split('T')[0]);
      const validator = minAgeValidator(18);

      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result!['minAge']).toBeDefined();
      expect(result!['minAge'].required).toBe(18);
      expect(result!['minAge'].actual).toBeLessThan(18);
    });

    it('should handle birthday not yet occurred this year', () => {
      const birthDate = new Date();
      // Establecer fecha de nacimiento para que el cumpleanios no haya ocurrido este anio
      birthDate.setFullYear(birthDate.getFullYear() - 18);
      birthDate.setMonth(birthDate.getMonth() + 1); // Un mes en el futuro

      const control = new FormControl(birthDate.toISOString().split('T')[0]);
      const validator = minAgeValidator(18);

      const result = validator(control);

      // Deberia tener error porque aun no ha cumplido 18
      expect(result).not.toBeNull();
      expect(result!['minAge']).toBeDefined();
    });
  });
});
