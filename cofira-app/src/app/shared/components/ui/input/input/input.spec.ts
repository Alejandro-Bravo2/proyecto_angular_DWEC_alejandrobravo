import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { InputComponent } from './input';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
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

    it('deberia tener type text por defecto', () => {
      expect(component.type).toBe('text');
    });

    it('deberia tener placeholder vacio por defecto', () => {
      expect(component.placeholder).toBe('');
    });

    it('deberia tener errorMessage vacio por defecto', () => {
      expect(component.errorMessage).toBe('');
    });

    it('deberia aceptar label personalizado', () => {
      component.label = 'Nombre de usuario';
      expect(component.label).toBe('Nombre de usuario');
    });

    it('deberia aceptar type personalizado', () => {
      component.type = 'email';
      expect(component.type).toBe('email');
    });

    it('deberia aceptar placeholder personalizado', () => {
      component.placeholder = 'Ingrese su nombre';
      expect(component.placeholder).toBe('Ingrese su nombre');
    });

    it('deberia aceptar errorMessage personalizado', () => {
      component.errorMessage = 'Campo requerido';
      expect(component.errorMessage).toBe('Campo requerido');
    });

    it('deberia aceptar un FormControl', () => {
      const formControl = new FormControl('');
      component.control = formControl;
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
      component.writeValue(123);
      expect(component.value).toBe(123);
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

  describe('Renderizado en el DOM', () => {
    it('deberia renderizar un input HTML', () => {
      const inputElement = fixture.nativeElement.querySelector('input');
      expect(inputElement).toBeTruthy();
    });

    it('deberia mostrar el label si se proporciona', () => {
      component.label = 'Mi etiqueta';
      fixture.detectChanges();

      const labelElement = fixture.nativeElement.querySelector('label');
      expect(labelElement?.textContent).toContain('Mi etiqueta');
    });

    it('deberia aplicar el type correcto al input', () => {
      component.type = 'password';
      fixture.detectChanges();

      const inputElement = fixture.nativeElement.querySelector('input');
      expect(inputElement?.type).toBe('password');
    });

    it('deberia aplicar el placeholder correcto', () => {
      component.placeholder = 'Escribe aqui';
      fixture.detectChanges();

      const inputElement = fixture.nativeElement.querySelector('input');
      expect(inputElement?.placeholder).toBe('Escribe aqui');
    });

    it('deberia aplicar atributo disabled cuando _isDisabled es true', () => {
      component.setDisabledState(true);
      component.control.disable(); // También deshabilitar el FormControl
      fixture.detectChanges();

      const inputElement = fixture.nativeElement.querySelector('input');
      expect(inputElement?.disabled).toBe(true);
    });

    it('no deberia tener atributo disabled cuando _isDisabled es false', () => {
      component.setDisabledState(false);
      fixture.detectChanges();

      const inputElement = fixture.nativeElement.querySelector('input');
      expect(inputElement?.disabled).toBe(false);
    });

    it('deberia mostrar mensaje de error si se proporciona', () => {
      component.errorMessage = 'Error de validacion';
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('.error-message');
      if (errorElement) {
        expect(errorElement.textContent).toContain('Error de validacion');
      }
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

  describe('Tipos de input soportados', () => {
    const tiposDeInput = ['text', 'password', 'email', 'number', 'tel', 'url'];

    tiposDeInput.forEach(tipo => {
      it(`deberia soportar type ${tipo}`, () => {
        component.type = tipo;
        fixture.detectChanges();

        const inputElement = fixture.nativeElement.querySelector('input');
        expect(inputElement?.type).toBe(tipo);
      });
    });
  });
});
