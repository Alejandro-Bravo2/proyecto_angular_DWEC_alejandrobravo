import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { RadioButton } from './radio-button';

describe('RadioButton', () => {
  let component: RadioButton;
  let fixture: ComponentFixture<RadioButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioButton, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(RadioButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Creacion del componente', () => {
    it('deberia crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Propiedades de entrada (@Input)', () => {
    it('deberia tener label vacio por defecto', () => {
      expect(component.label).toBe('');
    });

    it('deberia tener id vacio por defecto', () => {
      expect(component.id).toBe('');
    });

    it('deberia tener name vacio por defecto', () => {
      expect(component.name).toBe('');
    });

    it('deberia aceptar label personalizado', () => {
      component.label = 'Mi etiqueta';
      expect(component.label).toBe('Mi etiqueta');
    });

    it('deberia aceptar id personalizado', () => {
      component.id = 'radio-1';
      expect(component.id).toBe('radio-1');
    });

    it('deberia aceptar name personalizado', () => {
      component.name = 'grupo-radios';
      expect(component.name).toBe('grupo-radios');
    });

    it('deberia aceptar value personalizado', () => {
      component.value = 'opcion1';
      expect(component.value).toBe('opcion1');
    });

    it('deberia aceptar un FormControl', () => {
      const formControl = new FormControl('');
      component.control = formControl;
      expect(component.control).toBe(formControl);
    });
  });

  describe('checked getter', () => {
    it('deberia devolver true cuando _internalValue coincide con value', () => {
      component.value = 'opcion1';
      component._internalValue = 'opcion1';

      expect(component.checked).toBe(true);
    });

    it('deberia devolver false cuando _internalValue no coincide con value', () => {
      component.value = 'opcion1';
      component._internalValue = 'opcion2';

      expect(component.checked).toBe(false);
    });

    it('deberia devolver false cuando _internalValue esta vacio', () => {
      component.value = 'opcion1';
      component._internalValue = '';

      expect(component.checked).toBe(false);
    });
  });

  describe('ControlValueAccessor - writeValue', () => {
    it('deberia actualizar _internalValue con writeValue', () => {
      component.writeValue('valor-escrito');
      expect(component._internalValue).toBe('valor-escrito');
    });

    it('deberia aceptar null como valor', () => {
      component.writeValue(null);
      expect(component._internalValue).toBe(null);
    });

    it('deberia aceptar undefined como valor', () => {
      component.writeValue(undefined);
      expect(component._internalValue).toBe(undefined);
    });

    it('deberia aceptar valores numericos', () => {
      component.writeValue(123);
      expect(component._internalValue).toBe(123);
    });
  });

  describe('ControlValueAccessor - registerOnChange', () => {
    it('deberia registrar la funcion onChange', () => {
      const onChangeFn = jasmine.createSpy('onChange function');
      component.registerOnChange(onChangeFn);
      expect(component._onChange).toBe(onChangeFn);
    });
  });

  describe('ControlValueAccessor - registerOnTouched', () => {
    it('deberia registrar la funcion onTouched', () => {
      const onTouchedFn = jasmine.createSpy('onTouched function');
      component.registerOnTouched(onTouchedFn);
      expect(component._onTouched).toBe(onTouchedFn);
    });
  });

  describe('ControlValueAccessor - setDisabledState', () => {
    it('deberia establecer el estado deshabilitado a true', () => {
      component.setDisabledState(true);
      expect(component._isDisabled).toBe(true);
    });

    it('deberia establecer el estado deshabilitado a false', () => {
      component._isDisabled = true;
      component.setDisabledState(false);
      expect(component._isDisabled).toBe(false);
    });
  });

  describe('onSelect', () => {
    it('deberia actualizar value con el valor del evento', () => {
      const mockEvent = { target: { value: 'nuevo-valor' } } as unknown as Event;
      const onChangeSpy = jasmine.createSpy('onChange');
      const onTouchedSpy = jasmine.createSpy('onTouched');
      component._onChange = onChangeSpy;
      component._onTouched = onTouchedSpy;

      component.onSelect(mockEvent);

      expect(component.value).toBe('nuevo-valor');
    });

    it('deberia llamar a _onChange con el valor seleccionado', () => {
      const mockEvent = { target: { value: 'opcion-seleccionada' } } as unknown as Event;
      const onChangeSpy = jasmine.createSpy('onChange');
      component._onChange = onChangeSpy;

      component.onSelect(mockEvent);

      expect(onChangeSpy).toHaveBeenCalledWith('opcion-seleccionada');
    });

    it('deberia llamar a _onTouched', () => {
      const mockEvent = { target: { value: 'cualquier-valor' } } as unknown as Event;
      const onTouchedSpy = jasmine.createSpy('onTouched');
      component._onTouched = onTouchedSpy;

      component.onSelect(mockEvent);

      expect(onTouchedSpy).toHaveBeenCalled();
    });
  });

  describe('onBlur', () => {
    it('deberia llamar a _onTouched cuando se pierde el foco', () => {
      const onTouchedSpy = jasmine.createSpy('onTouched');
      component._onTouched = onTouchedSpy;

      component.onBlur();

      expect(onTouchedSpy).toHaveBeenCalled();
    });

    it('no deberia fallar si _onTouched no esta registrado', () => {
      component._onTouched = () => {};
      expect(() => component.onBlur()).not.toThrow();
    });
  });

  describe('Renderizado en el DOM', () => {
    it('deberia renderizar un input de tipo radio', () => {
      const inputElement = fixture.nativeElement.querySelector('input[type="radio"]');
      expect(inputElement).toBeTruthy();
    });

    it('deberia mostrar el label si se proporciona', () => {
      component.label = 'Etiqueta del radio';
      fixture.detectChanges();

      const labelElement = fixture.nativeElement.querySelector('label');
      expect(labelElement?.textContent).toContain('Etiqueta del radio');
    });
  });
});
