import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { Button } from './button';

describe('Button', () => {
  let component: Button;
  let fixture: ComponentFixture<Button>;
  let botonElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Button);
    component = fixture.componentInstance;
    botonElement = fixture.debugElement.query(By.css('button'));
    fixture.detectChanges();
  });

  it('deberia crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Propiedades de entrada (@Input)', () => {
    it('deberia tener variant primario por defecto', () => {
      expect(component.variant).toBe('primario');
    });

    it('deberia tener size mediano por defecto', () => {
      expect(component.size).toBe('mediano');
    });

    it('deberia tener completo como false por defecto', () => {
      expect(component.completo).toBe(false);
    });

    it('deberia tener disabled como false por defecto', () => {
      expect(component.disabled).toBe(false);
    });

    it('deberia tener type button por defecto', () => {
      expect(component.type).toBe('button');
    });

    it('deberia aceptar variant secundario', () => {
      component.variant = 'secundario';
      fixture.detectChanges();

      expect(component.variant).toBe('secundario');
    });

    it('deberia aceptar variant fantasma', () => {
      component.variant = 'fantasma';
      fixture.detectChanges();

      expect(component.variant).toBe('fantasma');
    });

    it('deberia aceptar variant peligro', () => {
      component.variant = 'peligro';
      fixture.detectChanges();

      expect(component.variant).toBe('peligro');
    });

    it('deberia aceptar size pequeno', () => {
      component.size = 'pequeno';
      fixture.detectChanges();

      expect(component.size).toBe('pequeno');
    });

    it('deberia aceptar size grande', () => {
      component.size = 'grande';
      fixture.detectChanges();

      expect(component.size).toBe('grande');
    });

    it('deberia aceptar completo como true', () => {
      component.completo = true;
      fixture.detectChanges();

      expect(component.completo).toBe(true);
    });

    it('deberia aceptar disabled como true', () => {
      component.disabled = true;
      fixture.detectChanges();

      expect(component.disabled).toBe(true);
    });

    it('deberia aceptar type submit', () => {
      component.type = 'submit';
      fixture.detectChanges();

      expect(component.type).toBe('submit');
    });

    it('deberia aceptar type reset', () => {
      component.type = 'reset';
      fixture.detectChanges();

      expect(component.type).toBe('reset');
    });
  });

  describe('Evento de salida (@Output)', () => {
    it('deberia emitir clickEvent cuando se hace click en el boton', () => {
      // Espiar el evento emitido
      const clickSpy = jasmine.createSpy('clickEvent spy');
      component.clickEvent.subscribe(clickSpy);

      // Hacer click en el boton
      botonElement.nativeElement.click();

      // Verificar que el evento se emitio
      expect(clickSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('no deberia emitir clickEvent cuando el boton esta deshabilitado', () => {
      // Deshabilitar el boton
      component.disabled = true;
      fixture.detectChanges();

      // Espiar el evento emitido
      const clickSpy = jasmine.createSpy('clickEvent spy');
      component.clickEvent.subscribe(clickSpy);

      // Intentar hacer click en el boton
      botonElement.nativeElement.click();

      // Verificar que el evento NO se emitio
      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('deberia pasar el evento original al emitir clickEvent', () => {
      let eventoEmitido: Event | undefined;
      component.clickEvent.subscribe((evento: Event) => {
        eventoEmitido = evento;
      });

      // Crear un evento de click mock
      const eventoClick = new Event('click');
      component.onClick(eventoClick);

      // Verificar que el evento emitido es el mismo
      expect(eventoEmitido).toBe(eventoClick);
    });
  });

  describe('Metodo onClick', () => {
    it('deberia llamar a onClick cuando se hace click en el boton', () => {
      // Espiar el metodo onClick
      spyOn(component, 'onClick');

      // Hacer click en el boton
      botonElement.triggerEventHandler('click', new Event('click'));

      // Verificar que se llamo al metodo
      expect(component.onClick).toHaveBeenCalled();
    });

    it('deberia emitir evento cuando el boton no esta deshabilitado', () => {
      component.disabled = false;
      const evento = new Event('click');
      const clickSpy = jasmine.createSpy('clickEvent spy');
      component.clickEvent.subscribe(clickSpy);

      component.onClick(evento);

      expect(clickSpy).toHaveBeenCalledWith(evento);
    });

    it('no deberia emitir evento cuando el boton esta deshabilitado', () => {
      component.disabled = true;
      const evento = new Event('click');
      const clickSpy = jasmine.createSpy('clickEvent spy');
      component.clickEvent.subscribe(clickSpy);

      component.onClick(evento);

      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('Getter buttonClasses', () => {
    it('deberia retornar clase primario por defecto', () => {
      const clases = component.buttonClasses;

      expect(clases['boton--primario']).toBe(true);
      expect(clases['boton--secundario']).toBe(false);
      expect(clases['boton--fantasma']).toBe(false);
      expect(clases['boton--peligro']).toBe(false);
    });

    it('deberia retornar clase secundario cuando variant es secundario', () => {
      component.variant = 'secundario';
      const clases = component.buttonClasses;

      expect(clases['boton--primario']).toBe(false);
      expect(clases['boton--secundario']).toBe(true);
    });

    it('deberia retornar clase fantasma cuando variant es fantasma', () => {
      component.variant = 'fantasma';
      const clases = component.buttonClasses;

      expect(clases['boton--fantasma']).toBe(true);
    });

    it('deberia retornar clase peligro cuando variant es peligro', () => {
      component.variant = 'peligro';
      const clases = component.buttonClasses;

      expect(clases['boton--peligro']).toBe(true);
    });

    it('deberia retornar clase mediano por defecto', () => {
      const clases = component.buttonClasses;

      expect(clases['boton--pequeno']).toBe(false);
      expect(clases['boton--mediano']).toBe(true);
      expect(clases['boton--grande']).toBe(false);
    });

    it('deberia retornar clase pequeno cuando size es pequeno', () => {
      component.size = 'pequeno';
      const clases = component.buttonClasses;

      expect(clases['boton--pequeno']).toBe(true);
      expect(clases['boton--mediano']).toBe(false);
    });

    it('deberia retornar clase grande cuando size es grande', () => {
      component.size = 'grande';
      const clases = component.buttonClasses;

      expect(clases['boton--grande']).toBe(true);
      expect(clases['boton--mediano']).toBe(false);
    });

    it('deberia retornar clase completo cuando completo es true', () => {
      component.completo = false;
      let clases = component.buttonClasses;
      expect(clases['boton--completo']).toBe(false);

      component.completo = true;
      clases = component.buttonClasses;
      expect(clases['boton--completo']).toBe(true);
    });

    it('deberia combinar todas las clases correctamente', () => {
      component.variant = 'peligro';
      component.size = 'grande';
      component.completo = true;

      const clases = component.buttonClasses;

      expect(clases['boton--peligro']).toBe(true);
      expect(clases['boton--grande']).toBe(true);
      expect(clases['boton--completo']).toBe(true);
    });
  });

  describe('Renderizado en el DOM', () => {
    it('deberia renderizar un boton HTML', () => {
      expect(botonElement).toBeTruthy();
      expect(botonElement.nativeElement.tagName).toBe('BUTTON');
    });

    it('deberia aplicar el atributo disabled cuando disabled es true', () => {
      component.disabled = true;
      fixture.detectChanges();

      expect(botonElement.nativeElement.disabled).toBe(true);
    });

    it('no deberia tener el atributo disabled cuando disabled es false', () => {
      component.disabled = false;
      fixture.detectChanges();

      expect(botonElement.nativeElement.disabled).toBe(false);
    });

    it('deberia aplicar el tipo correcto al boton', () => {
      component.type = 'submit';
      fixture.detectChanges();

      expect(botonElement.nativeElement.type).toBe('submit');
    });

    it('deberia proyectar contenido usando ng-content', () => {
      // Crear un nuevo fixture con contenido proyectado
      const testFixture = TestBed.createComponent(Button);
      const testComponent = testFixture.componentInstance;

      // Angular proyecta automaticamente el contenido
      testFixture.detectChanges();

      const botonNativo = testFixture.nativeElement.querySelector('button');
      expect(botonNativo).toBeTruthy();
    });
  });
});
