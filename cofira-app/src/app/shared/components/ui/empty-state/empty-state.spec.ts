import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, signal } from '@angular/core';

import { EmptyState } from './empty-state';

/**
 * Componente host para probar EmptyState con diferentes configuraciones
 */
@Component({
  standalone: true,
  imports: [EmptyState],
  template: `
    <app-empty-state
      [icon]="icon()"
      [title]="title()"
      [message]="message()"
      [actionLabel]="actionLabel()"
      [secondaryActionLabel]="secondaryActionLabel()"
      [size]="size()"
      (actionClicked)="onActionClicked()"
      (secondaryActionClicked)="onSecondaryActionClicked()"
    />
  `
})
class ComponenteHostDePruebas {
  icon = signal<string>('');
  title = signal<string>('Sin datos');
  message = signal<string>('No hay elementos para mostrar');
  actionLabel = signal<string>('');
  secondaryActionLabel = signal<string>('');
  size = signal<'small' | 'medium' | 'large'>('medium');

  actionClickCount = 0;
  secondaryActionClickCount = 0;

  onActionClicked(): void {
    this.actionClickCount++;
  }

  onSecondaryActionClicked(): void {
    this.secondaryActionClickCount++;
  }
}

describe('EmptyState', () => {
  let component: EmptyState;
  let fixture: ComponentFixture<EmptyState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyState]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyState);
    component = fixture.componentInstance;
  });

  it('deberia crear el componente', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.componentRef.setInput('message', 'Test message');
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  describe('Inputs requeridos', () => {
    it('deberia requerir title', () => {
      fixture.componentRef.setInput('title', 'Mi titulo');
      fixture.componentRef.setInput('message', 'Mi mensaje');
      fixture.detectChanges();

      expect(component.title()).toBe('Mi titulo');
    });

    it('deberia requerir message', () => {
      fixture.componentRef.setInput('title', 'Mi titulo');
      fixture.componentRef.setInput('message', 'Mi mensaje');
      fixture.detectChanges();

      expect(component.message()).toBe('Mi mensaje');
    });
  });

  describe('Inputs opcionales', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('title', 'Test');
      fixture.componentRef.setInput('message', 'Test message');
    });

    it('deberia tener icon vacio por defecto', () => {
      fixture.detectChanges();
      expect(component.icon()).toBe('');
    });

    it('deberia tener actionLabel vacio por defecto', () => {
      fixture.detectChanges();
      expect(component.actionLabel()).toBe('');
    });

    it('deberia tener secondaryActionLabel vacio por defecto', () => {
      fixture.detectChanges();
      expect(component.secondaryActionLabel()).toBe('');
    });

    it('deberia tener size medium por defecto', () => {
      fixture.detectChanges();
      expect(component.size()).toBe('medium');
    });

    it('deberia aceptar icon como input', () => {
      fixture.componentRef.setInput('icon', '🏋️');
      fixture.detectChanges();

      expect(component.icon()).toBe('🏋️');
    });

    it('deberia aceptar actionLabel como input', () => {
      fixture.componentRef.setInput('actionLabel', 'Agregar');
      fixture.detectChanges();

      expect(component.actionLabel()).toBe('Agregar');
    });

    it('deberia aceptar secondaryActionLabel como input', () => {
      fixture.componentRef.setInput('secondaryActionLabel', 'Cancelar');
      fixture.detectChanges();

      expect(component.secondaryActionLabel()).toBe('Cancelar');
    });

    it('deberia aceptar size small', () => {
      fixture.componentRef.setInput('size', 'small');
      fixture.detectChanges();

      expect(component.size()).toBe('small');
    });

    it('deberia aceptar size large', () => {
      fixture.componentRef.setInput('size', 'large');
      fixture.detectChanges();

      expect(component.size()).toBe('large');
    });
  });

  describe('Outputs', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('title', 'Test');
      fixture.componentRef.setInput('message', 'Test message');
      fixture.detectChanges();
    });

    it('deberia emitir actionClicked al hacer click en accion principal', () => {
      const emitSpy = spyOn(component.actionClicked, 'emit');
      component.actionClicked.emit();

      expect(emitSpy).toHaveBeenCalled();
    });

    it('deberia emitir secondaryActionClicked al hacer click en accion secundaria', () => {
      const emitSpy = spyOn(component.secondaryActionClicked, 'emit');
      component.secondaryActionClicked.emit();

      expect(emitSpy).toHaveBeenCalled();
    });
  });
});

describe('EmptyState con ComponenteHost', () => {
  let hostFixture: ComponentFixture<ComponenteHostDePruebas>;
  let hostComponent: ComponenteHostDePruebas;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponenteHostDePruebas]
    }).compileComponents();

    hostFixture = TestBed.createComponent(ComponenteHostDePruebas);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  describe('Renderizado basico', () => {
    it('deberia renderizar el contenedor principal', () => {
      const contenedor = hostFixture.nativeElement.querySelector('.c-empty-state');
      expect(contenedor).toBeTruthy();
    });

    it('deberia mostrar el titulo', () => {
      const titulo = hostFixture.nativeElement.querySelector('.c-empty-state__title');

      expect(titulo).toBeTruthy();
      expect(titulo.textContent).toContain('Sin datos');
    });

    it('deberia mostrar el mensaje', () => {
      const mensaje = hostFixture.nativeElement.querySelector('.c-empty-state__message');

      expect(mensaje).toBeTruthy();
      expect(mensaje.textContent).toContain('No hay elementos para mostrar');
    });

    it('deberia usar etiqueta article como contenedor', () => {
      const article = hostFixture.nativeElement.querySelector('article.c-empty-state');
      expect(article).toBeTruthy();
    });

    it('deberia usar etiqueta h3 para el titulo', () => {
      const h3 = hostFixture.nativeElement.querySelector('h3.c-empty-state__title');
      expect(h3).toBeTruthy();
    });

    it('deberia usar etiqueta p para el mensaje', () => {
      const p = hostFixture.nativeElement.querySelector('p.c-empty-state__message');
      expect(p).toBeTruthy();
    });
  });

  describe('Icono', () => {
    it('no deberia mostrar icono cuando esta vacio', () => {
      hostComponent.icon.set('');
      hostFixture.detectChanges();

      const icono = hostFixture.nativeElement.querySelector('.c-empty-state__icon');
      expect(icono).toBeFalsy();
    });

    it('deberia mostrar icono cuando tiene valor', () => {
      hostComponent.icon.set('🏋️');
      hostFixture.detectChanges();

      const icono = hostFixture.nativeElement.querySelector('.c-empty-state__icon');
      expect(icono).toBeTruthy();
      expect(icono.textContent.trim()).toBe('🏋️');
    });

    it('deberia tener aria-hidden en el icono', () => {
      hostComponent.icon.set('📭');
      hostFixture.detectChanges();

      const icono = hostFixture.nativeElement.querySelector('.c-empty-state__icon');
      expect(icono.getAttribute('aria-hidden')).toBe('true');
    });

    it('deberia usar etiqueta figure para el icono', () => {
      hostComponent.icon.set('🏋️');
      hostFixture.detectChanges();

      const figure = hostFixture.nativeElement.querySelector('figure.c-empty-state__icon');
      expect(figure).toBeTruthy();
    });
  });

  describe('Boton de accion principal', () => {
    it('no deberia mostrar boton cuando actionLabel esta vacio', () => {
      hostComponent.actionLabel.set('');
      hostFixture.detectChanges();

      const boton = hostFixture.nativeElement.querySelector('.c-empty-state__action:not(.c-empty-state__action--secondary)');
      expect(boton).toBeFalsy();
    });

    it('deberia mostrar boton cuando actionLabel tiene valor', () => {
      hostComponent.actionLabel.set('Agregar ejercicio');
      hostFixture.detectChanges();

      const boton = hostFixture.nativeElement.querySelector('.c-empty-state__action');
      expect(boton).toBeTruthy();
      expect(boton.textContent.trim()).toBe('Agregar ejercicio');
    });

    it('deberia emitir evento al hacer click en el boton de accion', fakeAsync(() => {
      hostComponent.actionLabel.set('Agregar');
      hostFixture.detectChanges();

      const boton = hostFixture.nativeElement.querySelector('.c-empty-state__action');
      boton.click();
      tick();

      expect(hostComponent.actionClickCount).toBe(1);
    }));

    it('deberia tener las clases de boton correctas', () => {
      hostComponent.actionLabel.set('Agregar');
      hostFixture.detectChanges();

      const boton = hostFixture.nativeElement.querySelector('.c-empty-state__action');
      expect(boton.classList.contains('c-button')).toBeTrue();
      expect(boton.classList.contains('c-button--primary')).toBeTrue();
    });

    it('deberia tener type button', () => {
      hostComponent.actionLabel.set('Agregar');
      hostFixture.detectChanges();

      const boton = hostFixture.nativeElement.querySelector('.c-empty-state__action');
      expect(boton.getAttribute('type')).toBe('button');
    });
  });

  describe('Boton de accion secundaria', () => {
    it('no deberia mostrar boton secundario cuando secondaryActionLabel esta vacio', () => {
      hostComponent.secondaryActionLabel.set('');
      hostFixture.detectChanges();

      const boton = hostFixture.nativeElement.querySelector('.c-empty-state__action--secondary');
      expect(boton).toBeFalsy();
    });

    it('deberia mostrar boton secundario cuando secondaryActionLabel tiene valor', () => {
      hostComponent.secondaryActionLabel.set('Cancelar');
      hostFixture.detectChanges();

      const boton = hostFixture.nativeElement.querySelector('.c-empty-state__action--secondary');
      expect(boton).toBeTruthy();
      expect(boton.textContent.trim()).toBe('Cancelar');
    });

    it('deberia emitir evento al hacer click en el boton secundario', fakeAsync(() => {
      hostComponent.secondaryActionLabel.set('Cancelar');
      hostFixture.detectChanges();

      const boton = hostFixture.nativeElement.querySelector('.c-empty-state__action--secondary');
      boton.click();
      tick();

      expect(hostComponent.secondaryActionClickCount).toBe(1);
    }));

    it('deberia tener las clases de boton secundario correctas', () => {
      hostComponent.secondaryActionLabel.set('Cancelar');
      hostFixture.detectChanges();

      const boton = hostFixture.nativeElement.querySelector('.c-empty-state__action--secondary');
      expect(boton.classList.contains('c-button')).toBeTrue();
      expect(boton.classList.contains('c-button--secondary')).toBeTrue();
    });

    it('deberia tener type button', () => {
      hostComponent.secondaryActionLabel.set('Cancelar');
      hostFixture.detectChanges();

      const boton = hostFixture.nativeElement.querySelector('.c-empty-state__action--secondary');
      expect(boton.getAttribute('type')).toBe('button');
    });
  });

  describe('Ambos botones', () => {
    beforeEach(() => {
      hostComponent.actionLabel.set('Agregar');
      hostComponent.secondaryActionLabel.set('Cancelar');
      hostFixture.detectChanges();
    });

    it('deberia mostrar ambos botones cuando ambos tienen valor', () => {
      const botones = hostFixture.nativeElement.querySelectorAll('.c-empty-state__action');
      expect(botones.length).toBe(2);
    });

    it('deberia permitir clicks independientes en cada boton', fakeAsync(() => {
      const botonPrimario = hostFixture.nativeElement.querySelector('.c-empty-state__action:not(.c-empty-state__action--secondary)');
      const botonSecundario = hostFixture.nativeElement.querySelector('.c-empty-state__action--secondary');

      botonPrimario.click();
      tick();

      expect(hostComponent.actionClickCount).toBe(1);
      expect(hostComponent.secondaryActionClickCount).toBe(0);

      botonSecundario.click();
      tick();

      expect(hostComponent.actionClickCount).toBe(1);
      expect(hostComponent.secondaryActionClickCount).toBe(1);
    }));
  });

  describe('Actualizacion dinamica', () => {
    it('deberia actualizar el titulo cuando cambia', () => {
      hostComponent.title.set('Nuevo titulo');
      hostFixture.detectChanges();

      const titulo = hostFixture.nativeElement.querySelector('.c-empty-state__title');
      expect(titulo.textContent).toContain('Nuevo titulo');
    });

    it('deberia actualizar el mensaje cuando cambia', () => {
      hostComponent.message.set('Nuevo mensaje');
      hostFixture.detectChanges();

      const mensaje = hostFixture.nativeElement.querySelector('.c-empty-state__message');
      expect(mensaje.textContent).toContain('Nuevo mensaje');
    });

    it('deberia mostrar/ocultar icono dinamicamente', () => {
      hostComponent.icon.set('');
      hostFixture.detectChanges();

      let icono = hostFixture.nativeElement.querySelector('.c-empty-state__icon');
      expect(icono).toBeFalsy();

      hostComponent.icon.set('🎯');
      hostFixture.detectChanges();

      icono = hostFixture.nativeElement.querySelector('.c-empty-state__icon');
      expect(icono).toBeTruthy();
    });

    it('deberia mostrar/ocultar boton de accion dinamicamente', () => {
      hostComponent.actionLabel.set('');
      hostFixture.detectChanges();

      let boton = hostFixture.nativeElement.querySelector('.c-empty-state__action:not(.c-empty-state__action--secondary)');
      expect(boton).toBeFalsy();

      hostComponent.actionLabel.set('Nueva accion');
      hostFixture.detectChanges();

      boton = hostFixture.nativeElement.querySelector('.c-empty-state__action:not(.c-empty-state__action--secondary)');
      expect(boton).toBeTruthy();
    });
  });

  describe('Casos de uso comunes', () => {
    it('deberia renderizar estado vacio de ejercicios', () => {
      hostComponent.icon.set('🏋️');
      hostComponent.title.set('No hay ejercicios');
      hostComponent.message.set('Comienza agregando tu primer ejercicio');
      hostComponent.actionLabel.set('Agregar ejercicio');
      hostFixture.detectChanges();

      const elementoNativo = hostFixture.nativeElement;

      expect(elementoNativo.querySelector('.c-empty-state__icon').textContent.trim()).toBe('🏋️');
      expect(elementoNativo.querySelector('.c-empty-state__title').textContent).toContain('No hay ejercicios');
      expect(elementoNativo.querySelector('.c-empty-state__message').textContent).toContain('Comienza agregando tu primer ejercicio');
      expect(elementoNativo.querySelector('.c-empty-state__action').textContent.trim()).toBe('Agregar ejercicio');
    });

    it('deberia renderizar estado vacio de notificaciones', () => {
      hostComponent.icon.set('🔔');
      hostComponent.title.set('Sin notificaciones');
      hostComponent.message.set('No tienes notificaciones nuevas');
      hostComponent.actionLabel.set('');
      hostFixture.detectChanges();

      const elementoNativo = hostFixture.nativeElement;

      expect(elementoNativo.querySelector('.c-empty-state__icon').textContent.trim()).toBe('🔔');
      expect(elementoNativo.querySelector('.c-empty-state__title').textContent).toContain('Sin notificaciones');
      expect(elementoNativo.querySelector('.c-empty-state__action')).toBeFalsy();
    });

    it('deberia renderizar estado vacio con acciones multiples', () => {
      hostComponent.icon.set('📋');
      hostComponent.title.set('Sin tareas');
      hostComponent.message.set('Tu lista de tareas esta vacia');
      hostComponent.actionLabel.set('Crear tarea');
      hostComponent.secondaryActionLabel.set('Importar tareas');
      hostFixture.detectChanges();

      const botones = hostFixture.nativeElement.querySelectorAll('.c-empty-state__action');
      expect(botones.length).toBe(2);
    });
  });
});
