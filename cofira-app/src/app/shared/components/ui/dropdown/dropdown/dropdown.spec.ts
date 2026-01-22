import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Dropdown } from './dropdown';

describe('Dropdown', () => {
  let component: Dropdown;
  let fixture: ComponentFixture<Dropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dropdown, ReactiveFormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dropdown);
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

    it('deberia tener options vacio por defecto', () => {
      expect(component.options).toEqual([]);
    });

    it('deberia tener placeholder por defecto', () => {
      expect(component.placeholder).toBe('Seleccione una opción');
    });

    it('deberia aceptar label personalizado', () => {
      component.label = 'Mi etiqueta';
      fixture.detectChanges();

      expect(component.label).toBe('Mi etiqueta');
    });

    it('deberia aceptar options personalizadas', () => {
      const opciones = [
        { value: 1, label: 'Opcion 1' },
        { value: 2, label: 'Opcion 2' }
      ];
      component.options = opciones;
      fixture.detectChanges();

      expect(component.options).toEqual(opciones);
    });

    it('deberia aceptar placeholder personalizado', () => {
      component.placeholder = 'Seleccione algo';
      fixture.detectChanges();

      expect(component.placeholder).toBe('Seleccione algo');
    });

    it('deberia aceptar un FormControl', () => {
      const formControl = new FormControl('valor1');
      component.control = formControl;
      fixture.detectChanges();

      expect(component.control).toBe(formControl);
    });
  });

  describe('Getter y Setter de value', () => {
    it('deberia retornar valor inicial vacio', () => {
      expect(component.value).toBe('');
    });

    it('deberia actualizar el valor interno', () => {
      component.value = 'nuevo-valor';

      expect(component._value).toBe('nuevo-valor');
    });

    it('deberia llamar a onChange cuando se actualiza el valor', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component._onChange = onChangeSpy;

      component.value = 'test-value';

      expect(onChangeSpy).toHaveBeenCalledWith('test-value');
    });

    it('no deberia llamar a onChange si el valor no cambia', () => {
      component._value = 'mismo-valor';
      const onChangeSpy = jasmine.createSpy('onChange');
      component._onChange = onChangeSpy;

      component.value = 'mismo-valor';

      expect(onChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('ControlValueAccessor - writeValue', () => {
    it('deberia actualizar el valor interno con writeValue', () => {
      component.writeValue('valor-escrito');

      expect(component.value).toBe('valor-escrito');
      expect(component._value).toBe('valor-escrito');
    });

    it('deberia aceptar null como valor', () => {
      component.writeValue(null);

      expect(component.value).toBe(null);
    });

    it('deberia aceptar undefined como valor', () => {
      component.writeValue(undefined);

      expect(component.value).toBe(undefined);
    });

    it('deberia aceptar valores numericos', () => {
      component.writeValue(42);

      expect(component.value).toBe(42);
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

      component.value = 'nuevo-valor';

      expect(onChangeFn).toHaveBeenCalledWith('nuevo-valor');
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

  describe('Integracion con FormControl', () => {
    it('deberia sincronizar valor con FormControl', () => {
      const formControl = new FormControl('valor-inicial');
      component.control = formControl;

      component.writeValue('valor-inicial');

      expect(component.value).toBe('valor-inicial');
    });

    it('deberia actualizar FormControl cuando cambia el valor', () => {
      const formControl = new FormControl('');
      component.control = formControl;

      const onChangeFn = (value: any) => formControl.setValue(value);
      component.registerOnChange(onChangeFn);

      component.value = 'nuevo-valor';

      expect(formControl.value).toBe('nuevo-valor');
    });

    it('deberia respetar estado disabled del FormControl', () => {
      const formControl = new FormControl({ value: '', disabled: true });

      component.setDisabledState(true);

      expect(component._isDisabled).toBe(true);
    });
  });

  describe('Renderizado en el DOM', () => {
    it('deberia renderizar un select HTML', () => {
      const selectElement = fixture.nativeElement.querySelector('select');

      expect(selectElement).toBeTruthy();
    });

    it('deberia mostrar el label si se proporciona', () => {
      component.label = 'Mi etiqueta';
      fixture.detectChanges();

      const labelElement = fixture.nativeElement.querySelector('label');
      expect(labelElement?.textContent).toContain('Mi etiqueta');
    });

    it('deberia renderizar las opciones correctamente', () => {
      component.options = [
        { value: 1, label: 'Opcion 1' },
        { value: 2, label: 'Opcion 2' }
      ];
      fixture.detectChanges();

      const optionElements = fixture.nativeElement.querySelectorAll('option');
      // +1 por la opcion placeholder
      expect(optionElements.length).toBe(3);
    });

    it('deberia mostrar placeholder como primera opcion', () => {
      component.placeholder = 'Seleccione algo';
      fixture.detectChanges();

      const firstOption = fixture.nativeElement.querySelector('option');
      expect(firstOption?.textContent).toContain('Seleccione algo');
    });

    it('deberia aplicar atributo disabled cuando _isDisabled es true', () => {
      component.setDisabledState(true);
      component.control.disable(); // También deshabilitar el FormControl
      fixture.detectChanges();

      const selectElement = fixture.nativeElement.querySelector('select');
      expect(selectElement?.disabled).toBe(true);
    });

    it('no deberia tener atributo disabled cuando _isDisabled es false', () => {
      component.setDisabledState(false);
      fixture.detectChanges();

      const selectElement = fixture.nativeElement.querySelector('select');
      expect(selectElement?.disabled).toBe(false);
    });
  });

  describe('Casos de uso completos', () => {
    it('deberia manejar seleccion de opcion correctamente', () => {
      component.options = [
        { value: 'opt1', label: 'Opcion 1' },
        { value: 'opt2', label: 'Opcion 2' }
      ];
      fixture.detectChanges();

      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);

      component.value = 'opt1';

      expect(onChangeSpy).toHaveBeenCalledWith('opt1');
    });

    it('deberia manejar cambios multiples de valor', () => {
      const valores = ['val1', 'val2', 'val3'];
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);

      valores.forEach(valor => {
        component.value = valor;
      });

      expect(onChangeSpy).toHaveBeenCalledTimes(3);
    });
  });
});
