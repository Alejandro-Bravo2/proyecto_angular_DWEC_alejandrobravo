import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { DynamicFormArrayExample } from './dynamic-form-array-example';

describe('DynamicFormArrayExample', () => {
  let component: DynamicFormArrayExample;
  let fixture: ComponentFixture<DynamicFormArrayExample>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFormArrayExample, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicFormArrayExample);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Creacion del componente', () => {
    it('deberia crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('deberia inicializar el formulario con un control de telefono', () => {
      expect(component.parentForm).toBeTruthy();
      expect(component.phoneNumbers.length).toBe(1);
    });
  });

  describe('phoneNumbers getter', () => {
    it('deberia devolver el FormArray de numeros de telefono', () => {
      const formArray = component.phoneNumbers;
      expect(formArray).toBeTruthy();
      expect(formArray.length).toBeGreaterThan(0);
    });
  });

  describe('createPhoneNumberControl', () => {
    it('deberia crear un FormControl con valor vacio', () => {
      const control = component.createPhoneNumberControl();
      expect(control.value).toBe('');
    });

    it('deberia crear un FormControl con validador required', () => {
      const control = component.createPhoneNumberControl();
      control.setValue('');
      control.markAsTouched();
      expect(control.hasError('required')).toBe(true);
    });

    it('deberia crear un FormControl con validador de telefono', () => {
      const control = component.createPhoneNumberControl();
      control.setValue('123'); // Numero invalido
      expect(control.invalid).toBe(true);
    });
  });

  describe('addPhoneNumber', () => {
    it('deberia agregar un nuevo control al FormArray', () => {
      const longitudInicial = component.phoneNumbers.length;

      component.addPhoneNumber();

      expect(component.phoneNumbers.length).toBe(longitudInicial + 1);
    });

    it('deberia poder agregar multiples controles', () => {
      const longitudInicial = component.phoneNumbers.length;

      component.addPhoneNumber();
      component.addPhoneNumber();
      component.addPhoneNumber();

      expect(component.phoneNumbers.length).toBe(longitudInicial + 3);
    });
  });

  describe('removePhoneNumber', () => {
    it('deberia eliminar un control cuando hay mas de uno', () => {
      component.addPhoneNumber(); // Ahora hay 2
      const longitudAntes = component.phoneNumbers.length;

      component.removePhoneNumber(0);

      expect(component.phoneNumbers.length).toBe(longitudAntes - 1);
    });

    it('no deberia eliminar el ultimo control', () => {
      // Solo hay 1 control por defecto
      expect(component.phoneNumbers.length).toBe(1);

      component.removePhoneNumber(0);

      expect(component.phoneNumbers.length).toBe(1);
    });

    it('deberia eliminar el control en el indice correcto', () => {
      component.addPhoneNumber();
      component.addPhoneNumber();
      // Hay 3 controles

      component.phoneNumbers.at(0).setValue('111111111');
      component.phoneNumbers.at(1).setValue('222222222');
      component.phoneNumbers.at(2).setValue('333333333');

      component.removePhoneNumber(1); // Elimina el del medio

      expect(component.phoneNumbers.length).toBe(2);
      expect(component.phoneNumbers.at(0).value).toBe('111111111');
      expect(component.phoneNumbers.at(1).value).toBe('333333333');
    });
  });

  describe('onSubmit', () => {
    it('deberia loguear valores cuando el formulario es valido', () => {
      spyOn(console, 'log');
      // Establecer un valor valido de telefono espanol
      component.phoneNumbers.at(0).setValue('612345678');

      component.onSubmit();

      expect(console.log).toHaveBeenCalledWith('Submitted Phone Numbers:', jasmine.any(Object));
    });

    it('deberia marcar todos los campos como touched cuando el formulario es invalido', () => {
      spyOn(console, 'log');
      spyOn(component.parentForm, 'markAllAsTouched');
      // Dejar el campo vacio para que sea invalido
      component.phoneNumbers.at(0).setValue('');

      component.onSubmit();

      expect(component.parentForm.markAllAsTouched).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Form is invalid');
    });

    it('deberia loguear mensaje de invalido cuando hay error de validacion', () => {
      spyOn(console, 'log');
      component.phoneNumbers.at(0).setValue('123'); // Numero invalido

      component.onSubmit();

      expect(console.log).toHaveBeenCalledWith('Form is invalid');
    });
  });

  describe('Renderizado en el DOM', () => {
    it('deberia renderizar el formulario', () => {
      const formElement = fixture.nativeElement.querySelector('form');
      expect(formElement).toBeTruthy();
    });

    it('deberia renderizar al menos un campo de input', () => {
      const inputElements = fixture.nativeElement.querySelectorAll('input');
      expect(inputElements.length).toBeGreaterThan(0);
    });
  });
});
