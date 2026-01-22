import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  let component: Checkbox;
  let fixture: ComponentFixture<Checkbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Checkbox, ReactiveFormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Checkbox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deberia crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Propiedades de entrada (@Input)', () => {
    it('deberia tener label vacio por defecto', () => {
      expect(component.label).toBe('');
    });

    it('deberia tener id vacio por defecto', () => {
      expect(component.id).toBe('');
    });

    it('deberia aceptar label personalizado', () => {
      component.label = 'Aceptar terminos';
      expect(component.label).toBe('Aceptar terminos');
    });

    it('deberia aceptar id personalizado', () => {
      component.id = 'checkbox-1';
      expect(component.id).toBe('checkbox-1');
    });

    it('deberia aceptar un FormControl', () => {
      const formControl = new FormControl(false);
      component.control = formControl;
      expect(component.control).toBe(formControl);
    });
  });

  describe('Getter y Setter de value', () => {
    it('deberia retornar valor inicial false', () => {
      expect(component.value).toBe(false);
    });

    it('deberia actualizar el valor interno', () => {
      component.value = true;
      expect(component._value).toBe(true);
    });

    it('deberia llamar a onChange cuando se actualiza el valor', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component._onChange = onChangeSpy;

      component.value = true;

      expect(onChangeSpy).toHaveBeenCalledWith(true);
    });

    it('no deberia llamar a onChange si el valor no cambia', () => {
      component._value = true;
      const onChangeSpy = jasmine.createSpy('onChange');
      component._onChange = onChangeSpy;

      component.value = true;

      expect(onChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('ControlValueAccessor - writeValue', () => {
    it('deberia actualizar el valor interno con writeValue', () => {
      component.writeValue(true);
      expect(component.value).toBe(true);
    });

    it('deberia aceptar false como valor', () => {
      component.writeValue(false);
      expect(component.value).toBe(false);
    });

    it('deberia aceptar null como valor', () => {
      component.writeValue(null);
      expect(component.value).toBe(null);
    });

    it('deberia aceptar undefined como valor', () => {
      component.writeValue(undefined);
      expect(component.value).toBe(undefined);
    });
  });

  describe('ControlValueAccessor - registerOnChange', () => {
    it('deberia registrar la funcion onChange', () => {
      const onChangeFn = jasmine.createSpy('onChange function');
      component.registerOnChange(onChangeFn);
      expect(component._onChange).toBe(onChangeFn);
    });

    it('deberia llamar a la funcion registrada cuando cambia el valor', () => {
      const onChangeFn = jasmine.createSpy('onChange function');
      component.registerOnChange(onChangeFn);

      component.value = true;

      expect(onChangeFn).toHaveBeenCalledWith(true);
    });
  });

  describe('ControlValueAccessor - registerOnTouched', () => {
    it('deberia registrar la funcion onTouched', () => {
      const onTouchedFn = jasmine.createSpy('onTouched function');
      component.registerOnTouched(onTouchedFn);
      expect(component._onTouched).toBe(onTouchedFn);
    });

    it('deberia llamar a onTouched cuando se llama a onBlur', () => {
      const onTouchedFn = jasmine.createSpy('onTouched function');
      component.registerOnTouched(onTouchedFn);

      component.onBlur();

      expect(onTouchedFn).toHaveBeenCalled();
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

  describe('Metodo onBlur', () => {
    it('deberia llamar a la funcion onTouched registrada', () => {
      const onTouchedFn = jasmine.createSpy('onTouched function');
      component._onTouched = onTouchedFn;

      component.onBlur();

      expect(onTouchedFn).toHaveBeenCalled();
    });

    it('no deberia fallar si onTouched no esta registrado', () => {
      expect(() => component.onBlur()).not.toThrow();
    });
  });

  describe('Metodo onToggle', () => {
    it('deberia cambiar el valor cuando se hace toggle', () => {
      const mockEvent = {
        target: { checked: true } as HTMLInputElement
      } as unknown as Event;

      component.onToggle(mockEvent);

      expect(component.value).toBe(true);
    });

    it('deberia actualizar a false cuando se desmarca', () => {
      component.value = true;

      const mockEvent = {
        target: { checked: false } as HTMLInputElement
      } as unknown as Event;

      component.onToggle(mockEvent);

      expect(component.value).toBe(false);
    });

    it('deberia llamar a onChange cuando se hace toggle', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component._onChange = onChangeSpy;

      const mockEvent = {
        target: { checked: true } as HTMLInputElement
      } as unknown as Event;

      component.onToggle(mockEvent);

      expect(onChangeSpy).toHaveBeenCalledWith(true);
    });
  });

  describe('Renderizado en el DOM', () => {
    it('deberia renderizar un input de tipo checkbox', () => {
      const checkboxElement = fixture.nativeElement.querySelector('input[type="checkbox"]');
      expect(checkboxElement).toBeTruthy();
    });

    it('deberia mostrar el label si se proporciona', () => {
      component.label = 'Aceptar';
      fixture.detectChanges();

      const labelElement = fixture.nativeElement.querySelector('label');
      expect(labelElement?.textContent).toContain('Aceptar');
    });

    it('deberia aplicar el id correcto al checkbox', () => {
      component.id = 'mi-checkbox';
      fixture.detectChanges();

      const checkboxElement = fixture.nativeElement.querySelector('input');
      expect(checkboxElement?.id).toBe('mi-checkbox');
    });

    it('deberia aplicar atributo disabled cuando _isDisabled es true', () => {
      component.setDisabledState(true);
      component.control.disable(); // También deshabilitar el FormControl
      fixture.detectChanges();

      const checkboxElement = fixture.nativeElement.querySelector('input');
      expect(checkboxElement?.disabled).toBe(true);
    });

    it('no deberia tener atributo disabled cuando _isDisabled es false', () => {
      component.setDisabledState(false);
      fixture.detectChanges();

      const checkboxElement = fixture.nativeElement.querySelector('input');
      expect(checkboxElement?.disabled).toBe(false);
    });

    it('deberia marcar el checkbox cuando value es true', () => {
      component.value = true;
      fixture.detectChanges();

      const checkboxElement = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(checkboxElement?.checked).toBe(true);
    });

    it('no deberia marcar el checkbox cuando value es false', () => {
      component.value = false;
      fixture.detectChanges();

      const checkboxElement = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(checkboxElement?.checked).toBe(false);
    });
  });

  describe('Integracion con FormControl', () => {
    it('deberia sincronizar valor con FormControl', () => {
      const formControl = new FormControl(true);
      component.control = formControl;
      component.writeValue(true);

      expect(component.value).toBe(true);
    });

    it('deberia actualizar FormControl cuando cambia el valor', () => {
      const formControl = new FormControl(false);
      component.control = formControl;

      const onChangeFn = (value: any) => formControl.setValue(value);
      component.registerOnChange(onChangeFn);

      component.value = true;

      expect(formControl.value).toBe(true);
    });

    it('deberia respetar estado disabled del FormControl', () => {
      const formControl = new FormControl({ value: false, disabled: true });
      component.setDisabledState(true);

      expect(component._isDisabled).toBe(true);
    });
  });
});
