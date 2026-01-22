import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { Badge } from './badge';

describe('Badge', () => {
  let component: Badge;
  let fixture: ComponentFixture<Badge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Badge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Badge);
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

    it('deberia tener color gray por defecto', () => {
      expect(component.color).toBe('gray');
    });

    it('deberia tener closable como false por defecto', () => {
      expect(component.closable).toBe(false);
    });

    it('deberia aceptar label personalizado', () => {
      component.label = 'Etiqueta de prueba';
      fixture.detectChanges();

      expect(component.label).toBe('Etiqueta de prueba');
    });

    it('deberia aceptar color red', () => {
      component.color = 'red';
      fixture.detectChanges();

      expect(component.color).toBe('red');
    });

    it('deberia aceptar color yellow', () => {
      component.color = 'yellow';
      fixture.detectChanges();

      expect(component.color).toBe('yellow');
    });

    it('deberia aceptar color blue', () => {
      component.color = 'blue';
      fixture.detectChanges();

      expect(component.color).toBe('blue');
    });

    it('deberia aceptar color green', () => {
      component.color = 'green';
      fixture.detectChanges();

      expect(component.color).toBe('green');
    });

    it('deberia aceptar closable como true', () => {
      component.closable = true;
      fixture.detectChanges();

      expect(component.closable).toBe(true);
    });
  });

  describe('Evento de salida (@Output)', () => {
    it('deberia emitir closed cuando closable es true y se hace click en cerrar', () => {
      component.closable = true;
      fixture.detectChanges();

      // Espiar el evento emitido
      const closedSpy = jasmine.createSpy('closed spy');
      component.closed.subscribe(closedSpy);

      // Llamar al metodo onClose
      component.onClose();

      // Verificar que el evento se emitio
      expect(closedSpy).toHaveBeenCalled();
      expect(closedSpy).toHaveBeenCalledTimes(1);
    });

    it('no deberia emitir closed cuando closable es false', () => {
      component.closable = false;
      fixture.detectChanges();

      // Espiar el evento emitido
      const closedSpy = jasmine.createSpy('closed spy');
      component.closed.subscribe(closedSpy);

      // Llamar al metodo onClose
      component.onClose();

      // Verificar que el evento NO se emitio
      expect(closedSpy).not.toHaveBeenCalled();
    });
  });

  describe('Metodo onClose', () => {
    it('deberia emitir evento closed cuando closable es true', () => {
      component.closable = true;
      const closedSpy = jasmine.createSpy('closed spy');
      component.closed.subscribe(closedSpy);

      component.onClose();

      expect(closedSpy).toHaveBeenCalled();
    });

    it('no deberia emitir evento closed cuando closable es false', () => {
      component.closable = false;
      const closedSpy = jasmine.createSpy('closed spy');
      component.closed.subscribe(closedSpy);

      component.onClose();

      expect(closedSpy).not.toHaveBeenCalled();
    });
  });

  describe('Getter badgeClasses', () => {
    it('deberia retornar clase gray por defecto', () => {
      const clases = component.badgeClasses;

      expect(clases['badge--gray']).toBe(true);
    });

    it('deberia retornar clase red cuando color es red', () => {
      component.color = 'red';
      const clases = component.badgeClasses;

      expect(clases['badge--red']).toBe(true);
    });

    it('deberia retornar clase yellow cuando color es yellow', () => {
      component.color = 'yellow';
      const clases = component.badgeClasses;

      expect(clases['badge--yellow']).toBe(true);
    });

    it('deberia retornar clase blue cuando color es blue', () => {
      component.color = 'blue';
      const clases = component.badgeClasses;

      expect(clases['badge--blue']).toBe(true);
    });

    it('deberia retornar clase green cuando color es green', () => {
      component.color = 'green';
      const clases = component.badgeClasses;

      expect(clases['badge--green']).toBe(true);
    });

    it('deberia actualizar las clases cuando cambia el color', () => {
      component.color = 'red';
      let clases = component.badgeClasses;
      expect(clases['badge--red']).toBe(true);

      component.color = 'blue';
      clases = component.badgeClasses;
      expect(clases['badge--blue']).toBe(true);
      expect(clases['badge--red']).toBeUndefined();
    });
  });

  describe('Renderizado en el DOM', () => {
    it('deberia renderizar el badge con el label correcto', () => {
      component.label = 'Test Badge';
      fixture.detectChanges();

      const badgeElement = fixture.nativeElement.querySelector('.badge');
      expect(badgeElement.textContent).toContain('Test Badge');
    });

    it('deberia aplicar la clase CSS correcta segun el color', () => {
      component.color = 'red';
      fixture.detectChanges();

      const badgeElement = fixture.nativeElement.querySelector('.badge');
      expect(badgeElement.classList.contains('badge--red')).toBe(true);
    });

    it('deberia mostrar boton de cerrar cuando closable es true', () => {
      component.closable = true;
      fixture.detectChanges();

      const closeButton = fixture.nativeElement.querySelector('.badge__close-button');
      expect(closeButton).toBeTruthy();
    });

    it('no deberia mostrar boton de cerrar cuando closable es false', () => {
      component.closable = false;
      fixture.detectChanges();

      const closeButton = fixture.nativeElement.querySelector('.badge__close-button');
      expect(closeButton).toBeFalsy();
    });

    it('deberia emitir evento closed al hacer click en el boton de cerrar', () => {
      component.closable = true;
      fixture.detectChanges();

      const closedSpy = jasmine.createSpy('closed spy');
      component.closed.subscribe(closedSpy);

      const closeButton = fixture.nativeElement.querySelector('.badge__close-button');
      closeButton.click();

      expect(closedSpy).toHaveBeenCalled();
    });
  });

  describe('Integracion completa', () => {
    it('deberia manejar todos los colores correctamente', () => {
      const colores: Array<'red' | 'yellow' | 'blue' | 'green' | 'gray'> = ['red', 'yellow', 'blue', 'green', 'gray'];

      colores.forEach(color => {
        component.color = color;
        fixture.detectChanges();

        const clases = component.badgeClasses;
        expect(clases[`badge--${color}`]).toBe(true);

        const badgeElement = fixture.nativeElement.querySelector('.badge');
        expect(badgeElement.classList.contains(`badge--${color}`)).toBe(true);
      });
    });

    it('deberia manejar cambio de closable dinamicamente', () => {
      // Inicialmente no closable
      component.closable = false;
      fixture.detectChanges();
      let closeButton = fixture.nativeElement.querySelector('.badge__close-button');
      expect(closeButton).toBeFalsy();

      // Cambiar a closable
      component.closable = true;
      fixture.detectChanges();
      closeButton = fixture.nativeElement.querySelector('.badge__close-button');
      expect(closeButton).toBeTruthy();

      // Cambiar de nuevo a no closable
      component.closable = false;
      fixture.detectChanges();
      closeButton = fixture.nativeElement.querySelector('.badge__close-button');
      expect(closeButton).toBeFalsy();
    });
  });
});
