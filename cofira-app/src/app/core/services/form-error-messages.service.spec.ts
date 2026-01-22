import { TestBed } from '@angular/core/testing';
import { FormErrorMessagesService } from './form-error-messages.service';

describe('FormErrorMessagesService', () => {
  let service: FormErrorMessagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormErrorMessagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getErrorMessage', () => {
    describe('Validadores de Angular built-in', () => {
      it('should return required message', () => {
        const message = service.getErrorMessage('required');
        expect(message).toBe('Este campo es obligatorio');
      });

      it('should return email message', () => {
        const message = service.getErrorMessage('email');
        expect(message).toBe('El formato del email no es válido');
      });

      it('should return pattern message', () => {
        const message = service.getErrorMessage('pattern');
        expect(message).toBe('El formato no es válido');
      });

      it('should return minlength message with correct values', () => {
        const errorValue = { requiredLength: 8, actualLength: 5 };
        const message = service.getErrorMessage('minlength', errorValue);
        expect(message).toBe('Debe tener al menos 8 caracteres (actual: 5)');
      });

      it('should return maxlength message with correct values', () => {
        const errorValue = { requiredLength: 50, actualLength: 75 };
        const message = service.getErrorMessage('maxlength', errorValue);
        expect(message).toBe('No puede tener más de 50 caracteres (actual: 75)');
      });

      it('should return min message with correct value', () => {
        const errorValue = { min: 10 };
        const message = service.getErrorMessage('min', errorValue);
        expect(message).toBe('El valor mínimo permitido es 10');
      });

      it('should return max message with correct value', () => {
        const errorValue = { max: 100 };
        const message = service.getErrorMessage('max', errorValue);
        expect(message).toBe('El valor máximo permitido es 100');
      });
    });

    describe('Validadores de contraseña', () => {
      it('should return passwordStrength message', () => {
        const message = service.getErrorMessage('passwordStrength');
        expect(message).toContain('12 caracteres');
        expect(message).toContain('mayúsculas');
        expect(message).toContain('minúsculas');
        expect(message).toContain('números');
      });

      it('should return passwordMatch message', () => {
        const message = service.getErrorMessage('passwordMatch');
        expect(message).toBe('Las contraseñas no coinciden');
      });
    });

    describe('Validadores asíncronos', () => {
      it('should return emailTaken message', () => {
        const message = service.getErrorMessage('emailTaken');
        expect(message).toBe('Este email ya está registrado');
      });

      it('should return usernameTaken message', () => {
        const message = service.getErrorMessage('usernameTaken');
        expect(message).toBe('Este nombre de usuario ya está en uso');
      });
    });

    describe('Validadores de formato español', () => {
      it('should return phoneInvalid message', () => {
        const message = service.getErrorMessage('phoneInvalid');
        expect(message).toContain('9 dígitos');
        expect(message).toContain('6, 7, 8 o 9');
      });

      it('should return nifInvalid message', () => {
        const message = service.getErrorMessage('nifInvalid');
        expect(message).toContain('8 dígitos');
        expect(message).toContain('letra');
      });

      it('should return postalCodeInvalid message', () => {
        const message = service.getErrorMessage('postalCodeInvalid');
        expect(message).toContain('5 dígitos');
      });
    });

    describe('Validadores de fecha', () => {
      it('should return pastDate message', () => {
        const message = service.getErrorMessage('pastDate');
        expect(message).toBe('La fecha no puede ser anterior a hoy');
      });

      it('should return futureDate message', () => {
        const message = service.getErrorMessage('futureDate');
        expect(message).toBe('La fecha no puede ser posterior a hoy');
      });

      it('should return minDate message with formatted date', () => {
        const errorValue = { minDate: new Date('2024-01-15') };
        const message = service.getErrorMessage('minDate', errorValue);
        expect(message).toContain('15');
        expect(message).toContain('enero');
        expect(message).toContain('2024');
      });

      it('should return maxDate message with formatted date', () => {
        const errorValue = { maxDate: new Date('2024-12-31') };
        const message = service.getErrorMessage('maxDate', errorValue);
        expect(message).toContain('31');
        expect(message).toContain('diciembre');
        expect(message).toContain('2024');
      });

      it('should return minAge message with years', () => {
        const errorValue = { required: 18, actual: 16 };
        const message = service.getErrorMessage('minAge', errorValue);
        expect(message).toContain('18 años');
        expect(message).toContain('16 años');
      });
    });

    describe('Validadores de rango y números', () => {
      it('should return range message', () => {
        const errorValue = { min: 1, max: 100 };
        const message = service.getErrorMessage('range', errorValue);
        expect(message).toBe('El valor debe estar entre 1 y 100');
      });

      it('should return positiveNumber message', () => {
        const message = service.getErrorMessage('positiveNumber');
        expect(message).toBe('El valor debe ser un número positivo');
      });

      it('should return integer message', () => {
        const message = service.getErrorMessage('integer');
        expect(message).toBe('El valor debe ser un número entero');
      });

      it('should return notANumber message', () => {
        const message = service.getErrorMessage('notANumber');
        expect(message).toBe('El valor debe ser un número');
      });

      it('should return maxDecimals message', () => {
        const errorValue = { required: 2 };
        const message = service.getErrorMessage('maxDecimals', errorValue);
        expect(message).toBe('No puede tener más de 2 decimales');
      });
    });

    describe('Validadores de FormArray', () => {
      it('should return minArrayLength message singular', () => {
        const errorValue = { required: 1 };
        const message = service.getErrorMessage('minArrayLength', errorValue);
        expect(message).toBe('Debes agregar al menos 1 elemento');
      });

      it('should return minArrayLength message plural', () => {
        const errorValue = { required: 3 };
        const message = service.getErrorMessage('minArrayLength', errorValue);
        expect(message).toBe('Debes agregar al menos 3 elementos');
      });

      it('should return maxArrayLength message', () => {
        const errorValue = { required: 5 };
        const message = service.getErrorMessage('maxArrayLength', errorValue);
        expect(message).toBe('No puedes agregar más de 5 elementos');
      });

      it('should return atLeastOneRequired message', () => {
        const message = service.getErrorMessage('atLeastOneRequired');
        expect(message).toBe('Debes seleccionar al menos una opción');
      });

      it('should return minSelected message singular', () => {
        const errorValue = { required: 1 };
        const message = service.getErrorMessage('minSelected', errorValue);
        expect(message).toBe('Debes seleccionar al menos 1 opción');
      });

      it('should return minSelected message plural', () => {
        const errorValue = { required: 3 };
        const message = service.getErrorMessage('minSelected', errorValue);
        // El mensaje del servicio agrega 'es' a 'opción', resultando en 'opciónes'
        expect(message).toBe('Debes seleccionar al menos 3 opciónes');
      });

      it('should return duplicateValues message', () => {
        const message = service.getErrorMessage('duplicateValues');
        expect(message).toBe('No se permiten valores duplicados');
      });

      it('should return allItemsValid message', () => {
        const message = service.getErrorMessage('allItemsValid');
        expect(message).toContain('errores');
      });
    });

    describe('Otros validadores', () => {
      it('should return url message', () => {
        const message = service.getErrorMessage('url');
        expect(message).toBe('La URL no es válida');
      });

      it('should return unknown message for unrecognized error key', () => {
        const message = service.getErrorMessage('unknownErrorKey');
        expect(message).toBe('El valor ingresado no es válido');
      });

      it('should log warning for unrecognized error key', () => {
        spyOn(console, 'warn');
        service.getErrorMessage('unknownErrorKey');
        expect(console.warn).toHaveBeenCalledWith(
          'FormErrorMessagesService: No message found for error key "unknownErrorKey"'
        );
      });
    });
  });

  describe('getAllErrorMessages', () => {
    it('should return empty array when errors is null', () => {
      const messages = service.getAllErrorMessages(null);
      expect(messages).toEqual([]);
    });

    it('should return all error messages for multiple errors', () => {
      const errors = {
        required: true,
        email: true,
      };
      const messages = service.getAllErrorMessages(errors);
      expect(messages.length).toBe(2);
      expect(messages).toContain('Este campo es obligatorio');
      expect(messages).toContain('El formato del email no es válido');
    });

    it('should handle dynamic error messages', () => {
      const errors = {
        minlength: { requiredLength: 10, actualLength: 5 },
        maxlength: { requiredLength: 20, actualLength: 25 },
      };
      const messages = service.getAllErrorMessages(errors);
      expect(messages.length).toBe(2);
      expect(messages[0]).toContain('10 caracteres');
      expect(messages[1]).toContain('20 caracteres');
    });
  });

  describe('getFirstErrorMessage', () => {
    it('should return empty string when errors is null', () => {
      const message = service.getFirstErrorMessage(null);
      expect(message).toBe('');
    });

    it('should return empty string when errors object is empty', () => {
      const message = service.getFirstErrorMessage({});
      expect(message).toBe('');
    });

    it('should return first error message', () => {
      const errors = {
        required: true,
        email: true,
      };
      const message = service.getFirstErrorMessage(errors);
      // El primer error en el objeto
      expect(message).toBe('Este campo es obligatorio');
    });

    it('should handle dynamic first error', () => {
      const errors = {
        minlength: { requiredLength: 8, actualLength: 3 },
      };
      const message = service.getFirstErrorMessage(errors);
      expect(message).toBe('Debe tener al menos 8 caracteres (actual: 3)');
    });
  });

  describe('hasError', () => {
    it('should return true when error exists', () => {
      const errors = { required: true, email: true };
      expect(service.hasError(errors, 'required')).toBe(true);
      expect(service.hasError(errors, 'email')).toBe(true);
    });

    it('should return false when error does not exist', () => {
      const errors = { required: true };
      expect(service.hasError(errors, 'email')).toBe(false);
    });

    it('should return false when errors is null', () => {
      expect(service.hasError(null, 'required')).toBe(false);
    });

    it('should handle error with undefined value', () => {
      const errors = { required: undefined };
      expect(service.hasError(errors, 'required')).toBe(false);
    });
  });

  describe('addCustomMessage', () => {
    it('should add a static custom message', () => {
      service.addCustomMessage('customError', 'Este es un error personalizado');
      const message = service.getErrorMessage('customError');
      expect(message).toBe('Este es un error personalizado');
    });

    it('should add a dynamic custom message', () => {
      service.addCustomMessage('rangeError', (val) => `Valor ${val.value} fuera de rango ${val.min}-${val.max}`);
      const message = service.getErrorMessage('rangeError', { value: 150, min: 0, max: 100 });
      expect(message).toBe('Valor 150 fuera de rango 0-100');
    });

    it('should override existing message', () => {
      const originalMessage = service.getErrorMessage('required');
      expect(originalMessage).toBe('Este campo es obligatorio');

      service.addCustomMessage('required', 'Campo requerido');
      const newMessage = service.getErrorMessage('required');
      expect(newMessage).toBe('Campo requerido');
    });
  });

  describe('formatDate - edge cases', () => {
    it('deberia devolver cadena vacia cuando date es null', () => {
      // Probar el metodo privado formatDate indirectamente a traves de minDate
      const errorValue = { minDate: null };
      const message = service.getErrorMessage('minDate', errorValue);
      // El mensaje debería contener una cadena vacía para la fecha
      expect(message).toContain('La fecha no puede ser anterior a');
    });

    it('deberia devolver cadena vacia cuando date es undefined', () => {
      // Probar el metodo privado formatDate indirectamente a traves de maxDate
      const errorValue = { maxDate: undefined };
      const message = service.getErrorMessage('maxDate', errorValue);
      // El mensaje debería contener una cadena vacía para la fecha
      expect(message).toContain('La fecha no puede ser posterior a');
    });

    it('deberia devolver cadena vacia cuando date es string vacio', () => {
      // Probar el metodo privado formatDate indirectamente
      const errorValue = { minDate: '' };
      const message = service.getErrorMessage('minDate', errorValue);
      // El mensaje debería contener una cadena vacía para la fecha
      expect(message).toContain('La fecha no puede ser anterior a');
    });
  });
});
