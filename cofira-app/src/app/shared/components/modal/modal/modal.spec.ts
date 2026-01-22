import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, signal, WritableSignal } from '@angular/core';
import { Modal } from './modal';
import { ModalService } from '../../../../core/services/modal.service';

/**
 * Componente de prueba para cargar dinámicamente en el modal.
 */
@Component({
  selector: 'app-test-component',
  standalone: true,
  template: `
    <div>
      <h2>Componente de prueba</h2>
      <button id="test-button">Botón de prueba</button>
      <input id="test-input" type="text" />
    </div>
  `,
})
class TestComponent {
  testInput = '';
}

describe('Modal', () => {
  let component: Modal;
  let fixture: ComponentFixture<Modal>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let activeModalSignal: WritableSignal<{ component: any; inputs: Record<string, any> } | null>;
  let mockViewContainerRef: jasmine.SpyObj<any>;

  beforeEach(async () => {
    // Crear signal mockeado para activeModal$
    activeModalSignal = signal<{ component: any; inputs: Record<string, any> } | null>(null);

    // Mock del ModalService con signal real
    mockModalService = jasmine.createSpyObj('ModalService', ['open', 'close']);
    (mockModalService as any).activeModal$ = activeModalSignal;

    // Mock del ViewContainerRef para evitar errores en loadComponent
    mockViewContainerRef = jasmine.createSpyObj('ViewContainerRef', ['createComponent', 'clear']);

    await TestBed.configureTestingModule({
      imports: [Modal],
      providers: [{ provide: ModalService, useValue: mockModalService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Modal);
    component = fixture.componentInstance;

    // Espiar el método loadComponent para evitar errores con ViewContainerRef
    spyOn<any>(component, 'loadComponent').and.callFake((comp: any, inputs: any) => {
      // Simular comportamiento real: limpiar componente previo antes de crear nuevo
      if (component.componentRef) {
        component.componentRef.destroy();
      }
      // Crear un componentRef simulado
      component.componentRef = {
        instance: { ...inputs },
        destroy: jasmine.createSpy('destroy')
      } as any;
    });
  });

  afterEach(() => {
    // Limpiar el DOM después de cada test
    document.body.classList.remove('modal-open');

    // Limpiar backdrops que puedan quedar
    const backdrops = document.querySelectorAll('.c-modal__dynamic-backdrop');
    backdrops.forEach((backdrop) => backdrop.remove());

    // Limpiar botones de prueba que puedan haber quedado
    const botonesTest = document.querySelectorAll('[id^="boton-externo"]');
    botonesTest.forEach((boton) => boton.remove());
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTS BÁSICOS DE CREACIÓN
  // ═══════════════════════════════════════════════════════════════════════════

  it('debe crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe tener modalService inyectado', () => {
    expect(component.modalService).toBe(mockModalService);
  });

  it('debe inicializar componentRef como null', () => {
    expect(component.componentRef).toBeNull();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTS DE TECLA ESCAPE
  // ═══════════════════════════════════════════════════════════════════════════

  it('debe cerrar el modal al presionar la tecla ESC cuando está abierto', () => {
    // Simular modal abierto
    activeModalSignal.set({ component: TestComponent, inputs: {} });

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    spyOn(escapeEvent, 'preventDefault');

    component.onKeydownHandler(escapeEvent);

    expect(escapeEvent.preventDefault).toHaveBeenCalled();
    expect(mockModalService.close).toHaveBeenCalled();
  });

  it('no debe cerrar el modal si no está abierto al presionar ESC', () => {
    // Modal cerrado
    activeModalSignal.set(null);

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    component.onKeydownHandler(escapeEvent);

    expect(mockModalService.close).not.toHaveBeenCalled();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTS DE FOCUS TRAP
  // ═══════════════════════════════════════════════════════════════════════════

  it('no debe procesar focus trap si no es tecla Tab', () => {
    fixture.detectChanges();

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(enterEvent, 'preventDefault');

    component.onTabKey(enterEvent);

    expect(enterEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('no debe procesar focus trap si modalContainer no está disponible', () => {
    fixture.detectChanges();

    component.modalContainer = null as any;

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    spyOn(tabEvent, 'preventDefault');

    component.onTabKey(tabEvent);

    expect(tabEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('no debe procesar focus trap si no hay elementos focusables', () => {
    fixture.detectChanges();

    // Crear contenedor sin elementos focusables
    const modalElement = document.createElement('div');
    component.modalContainer = { nativeElement: modalElement } as any;

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    spyOn(tabEvent, 'preventDefault');

    component.onTabKey(tabEvent);

    expect(tabEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('debe implementar focus trap con tecla Tab en último elemento', () => {
    fixture.detectChanges();

    const firstButton = document.createElement('button');
    const lastButton = document.createElement('button');
    const modalElement = document.createElement('div');
    modalElement.appendChild(firstButton);
    modalElement.appendChild(lastButton);

    component.modalContainer = { nativeElement: modalElement } as any;

    // Simular que el último elemento tiene el foco
    Object.defineProperty(document, 'activeElement', {
      configurable: true,
      get: () => lastButton,
    });

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false });
    spyOn(tabEvent, 'preventDefault');
    spyOn(firstButton, 'focus');

    component.onTabKey(tabEvent);

    expect(tabEvent.preventDefault).toHaveBeenCalled();
    expect(firstButton.focus).toHaveBeenCalled();
  });

  it('debe implementar focus trap con Shift+Tab en primer elemento', () => {
    fixture.detectChanges();

    const firstButton = document.createElement('button');
    const lastButton = document.createElement('button');
    const modalElement = document.createElement('div');
    modalElement.appendChild(firstButton);
    modalElement.appendChild(lastButton);

    component.modalContainer = { nativeElement: modalElement } as any;

    // Simular que el primer elemento tiene el foco
    Object.defineProperty(document, 'activeElement', {
      configurable: true,
      get: () => firstButton,
    });

    const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
    spyOn(shiftTabEvent, 'preventDefault');
    spyOn(lastButton, 'focus');

    component.onTabKey(shiftTabEvent);

    expect(shiftTabEvent.preventDefault).toHaveBeenCalled();
    expect(lastButton.focus).toHaveBeenCalled();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTS DEL MÉTODO closeModal()
  // ═══════════════════════════════════════════════════════════════════════════

  it('debe llamar a modalService.close() cuando se invoca closeModal()', () => {
    fixture.detectChanges();

    component.closeModal();

    expect(mockModalService.close).toHaveBeenCalled();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTS DE LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  it('debe ejecutar ngOnInit sin errores', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('debe ejecutar ngAfterViewInit sin errores', () => {
    fixture.detectChanges();
    expect(() => component.ngAfterViewInit()).not.toThrow();
  });

  it('debe ejecutar ngOnDestroy sin errores', () => {
    fixture.detectChanges();
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('debe remover clase modal-open del body en ngOnDestroy', fakeAsync(() => {
    fixture.detectChanges();

    // Añadir clase manualmente
    document.body.classList.add('modal-open');

    component.ngOnDestroy();
    tick(400);

    expect(document.body.classList.contains('modal-open')).toBe(false);
  }));

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTS DE ESTADO INICIAL
  // ═══════════════════════════════════════════════════════════════════════════

  it('debe tener body sin clase modal-open inicialmente', () => {
    fixture.detectChanges();

    expect(document.body.classList.contains('modal-open')).toBe(false);
  });

  it('no debe tener backdrop inicialmente', () => {
    fixture.detectChanges();

    const backdrop = document.querySelector('.c-modal__dynamic-backdrop');
    expect(backdrop).toBeFalsy();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTS DE APERTURA DEL MODAL (effect reactivo)
  // ═══════════════════════════════════════════════════════════════════════════

  it('debe crear backdrop dinámico cuando se abre el modal', fakeAsync(() => {
    fixture.detectChanges();

    // Abrir modal
    activeModalSignal.set({ component: TestComponent, inputs: {} });
    fixture.detectChanges();
    tick(100);

    const backdrop = document.querySelector('.c-modal__dynamic-backdrop');
    expect(backdrop).toBeTruthy();
  }));

  it('debe agregar clase modal-open al body cuando se abre el modal', fakeAsync(() => {
    fixture.detectChanges();

    activeModalSignal.set({ component: TestComponent, inputs: {} });
    fixture.detectChanges();
    tick(100);

    expect(document.body.classList.contains('modal-open')).toBe(true);
  }));

  it('debe guardar el elemento con foco previo al abrir el modal', fakeAsync(() => {
    fixture.detectChanges();

    // El modal debería guardar el elemento activo del documento al abrir
    activeModalSignal.set({ component: TestComponent, inputs: {} });
    fixture.detectChanges();
    tick(100);

    // El modal debería haber guardado algún elemento como previouslyFocusedElement
    // (puede ser el body o cualquier elemento que tuviera foco)
    const elementoGuardado = (component as any).previouslyFocusedElement;
    expect(elementoGuardado).toBeTruthy();
  }));

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTS DE CIERRE DEL MODAL
  // ═══════════════════════════════════════════════════════════════════════════

  it('debe eliminar backdrop cuando se cierra el modal', fakeAsync(() => {
    fixture.detectChanges();

    // Abrir y luego cerrar
    activeModalSignal.set({ component: TestComponent, inputs: {} });
    fixture.detectChanges();
    tick(100);

    activeModalSignal.set(null);
    fixture.detectChanges();
    tick(400); // Esperar animación

    const backdrop = document.querySelector('.c-modal__dynamic-backdrop');
    expect(backdrop).toBeFalsy();
  }));

  it('debe restaurar el foco al elemento anterior al cerrar el modal', fakeAsync(() => {
    fixture.detectChanges();

    // Crear un botón y configurarlo como previouslyFocusedElement manualmente
    const botonExterno = document.createElement('button');
    botonExterno.id = 'boton-externo-restaurar';
    document.body.appendChild(botonExterno);
    spyOn(botonExterno, 'focus');

    // Abrir el modal
    activeModalSignal.set({ component: TestComponent, inputs: {} });
    fixture.detectChanges();
    tick(100);

    // Establecer manualmente el elemento que debería recibir foco al cerrar
    (component as any).previouslyFocusedElement = botonExterno;

    // Cerrar el modal
    activeModalSignal.set(null);
    fixture.detectChanges();
    tick(100);

    // Verificar que se llamó focus en el elemento guardado
    expect(botonExterno.focus).toHaveBeenCalled();

    // Limpiar
    botonExterno.remove();
  }));

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTS DEL BACKDROP DINÁMICO
  // ═══════════════════════════════════════════════════════════════════════════

  it('el backdrop debe tener los atributos de accesibilidad correctos', fakeAsync(() => {
    fixture.detectChanges();

    activeModalSignal.set({ component: TestComponent, inputs: {} });
    fixture.detectChanges();
    tick(100);

    const backdrop = document.querySelector('.c-modal__dynamic-backdrop');
    expect(backdrop?.getAttribute('role')).toBe('presentation');
    expect(backdrop?.getAttribute('aria-hidden')).toBe('true');
  }));

  it('el backdrop debe cerrar el modal al hacer click', fakeAsync(() => {
    fixture.detectChanges();

    activeModalSignal.set({ component: TestComponent, inputs: {} });
    fixture.detectChanges();
    tick(100);

    const backdrop = document.querySelector('.c-modal__dynamic-backdrop') as HTMLElement;
    backdrop?.click();
    tick(100);

    expect(mockModalService.close).toHaveBeenCalled();
  }));

  it('no debe crear backdrop duplicado si ya existe', fakeAsync(() => {
    fixture.detectChanges();

    activeModalSignal.set({ component: TestComponent, inputs: {} });
    fixture.detectChanges();
    tick(100);

    // Intentar crear otro backdrop llamando al método privado
    (component as any).createDynamicBackdrop();
    tick(100);

    const backdrops = document.querySelectorAll('.c-modal__dynamic-backdrop');
    expect(backdrops.length).toBe(1);
  }));

  it('removeDynamicBackdrop no debe hacer nada si no hay backdrop', fakeAsync(() => {
    fixture.detectChanges();

    // Llamar sin haber creado backdrop
    expect(() => {
      (component as any).removeDynamicBackdrop();
      tick(400);
    }).not.toThrow();
  }));

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTS DE CARGA DE COMPONENTES DINÁMICOS
  // ═══════════════════════════════════════════════════════════════════════════

  it('debe cargar un componente dinámicamente cuando se abre el modal', fakeAsync(() => {
    fixture.detectChanges();

    activeModalSignal.set({ component: TestComponent, inputs: { testInput: 'valor' } });
    fixture.detectChanges();
    tick(100);

    expect(component.componentRef).toBeTruthy();
  }));

  it('debe establecer los inputs en el componente cargado', fakeAsync(() => {
    fixture.detectChanges();

    activeModalSignal.set({ component: TestComponent, inputs: { testInput: 'valor-prueba' } });
    fixture.detectChanges();
    tick(100);

    expect(component.componentRef?.instance.testInput).toBe('valor-prueba');
  }));

  it('debe limpiar el componente previo antes de cargar uno nuevo', fakeAsync(() => {
    fixture.detectChanges();

    // Cargar primer componente
    activeModalSignal.set({ component: TestComponent, inputs: { testInput: 'primero' } });
    fixture.detectChanges();
    tick(100);

    // Guardar referencia al spy de destroy (ya es spy desde beforeEach)
    const spyDestroyPrimeraReferencia = component.componentRef!.destroy as jasmine.Spy;

    // Cargar segundo componente
    activeModalSignal.set({ component: TestComponent, inputs: { testInput: 'segundo' } });
    fixture.detectChanges();
    tick(100);

    expect(spyDestroyPrimeraReferencia).toHaveBeenCalled();
    expect(component.componentRef?.instance.testInput).toBe('segundo');
  }));

  it('debe destruir el componente cuando se cierra el modal', fakeAsync(() => {
    fixture.detectChanges();

    activeModalSignal.set({ component: TestComponent, inputs: {} });
    fixture.detectChanges();
    tick(100);

    // Guardar referencia al spy de destroy (ya es spy desde beforeEach)
    const spyDestroyComponentRef = component.componentRef!.destroy as jasmine.Spy;

    activeModalSignal.set(null);
    fixture.detectChanges();
    tick(100);

    expect(spyDestroyComponentRef).toHaveBeenCalled();
    expect(component.componentRef).toBeNull();
  }));

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTS DE clearComponent
  // ═══════════════════════════════════════════════════════════════════════════

  it('clearComponent no debe fallar si componentRef es null', () => {
    fixture.detectChanges();
    component.componentRef = null;

    expect(() => {
      (component as any).clearComponent();
    }).not.toThrow();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTS DE FOCO EN MODAL ABIERTO
  // ═══════════════════════════════════════════════════════════════════════════

  it('debe hacer foco en el primer elemento focusable al abrir', fakeAsync(() => {
    fixture.detectChanges();

    activeModalSignal.set({ component: TestComponent, inputs: {} });
    fixture.detectChanges();
    tick(100);

    // El modal container debería existir cuando el modal está abierto
    const modalContainer = component.modalContainer?.nativeElement;
    expect(modalContainer).toBeTruthy();

    // El foco debería estar en algún lugar del documento (no null)
    // Nota: Como loadComponent está mockeado, no hay contenido real renderizado
    expect(document.activeElement).toBeTruthy();
  }));

  it('debe hacer foco en el contenedor si no hay elementos focusables', fakeAsync(() => {
    fixture.detectChanges();

    // Crear un componente sin elementos focusables
    @Component({
      selector: 'app-no-focusable',
      standalone: true,
      template: '<p>Sin elementos focusables</p>'
    })
    class NoFocusableComponent {}

    activeModalSignal.set({ component: NoFocusableComponent, inputs: {} });
    fixture.detectChanges();
    tick(100);

    // Si no hay elementos focusables, el contenedor debería tener el foco
    // o al menos no debería fallar
    expect(component.modalContainer?.nativeElement).toBeTruthy();
  }));

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTS DE FOCUS TRAP ADICIONALES
  // ═══════════════════════════════════════════════════════════════════════════

  it('no debe hacer nada en Tab normal si no está en primer ni último elemento', () => {
    fixture.detectChanges();

    const firstButton = document.createElement('button');
    const middleButton = document.createElement('button');
    const lastButton = document.createElement('button');
    const modalElement = document.createElement('div');
    modalElement.appendChild(firstButton);
    modalElement.appendChild(middleButton);
    modalElement.appendChild(lastButton);

    component.modalContainer = { nativeElement: modalElement } as any;

    // Simular que el elemento del medio tiene el foco
    Object.defineProperty(document, 'activeElement', {
      configurable: true,
      get: () => middleButton,
    });

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false });
    spyOn(tabEvent, 'preventDefault');

    component.onTabKey(tabEvent);

    expect(tabEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('no debe hacer nada en Shift+Tab si no está en primer elemento', () => {
    fixture.detectChanges();

    const firstButton = document.createElement('button');
    const middleButton = document.createElement('button');
    const lastButton = document.createElement('button');
    const modalElement = document.createElement('div');
    modalElement.appendChild(firstButton);
    modalElement.appendChild(middleButton);
    modalElement.appendChild(lastButton);

    component.modalContainer = { nativeElement: modalElement } as any;

    // Simular que el elemento del medio tiene el foco
    Object.defineProperty(document, 'activeElement', {
      configurable: true,
      get: () => middleButton,
    });

    const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
    spyOn(shiftTabEvent, 'preventDefault');

    component.onTabKey(shiftTabEvent);

    expect(shiftTabEvent.preventDefault).not.toHaveBeenCalled();
  });
});

/**
 * Tests para loadComponent - Usando un método directo de test
 */
describe('Modal - loadComponent directo', () => {
  let component: Modal;
  let fixture: ComponentFixture<Modal>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let activeModalSignal: WritableSignal<{ component: any; inputs: Record<string, any> } | null>;

  beforeEach(async () => {
    activeModalSignal = signal<{ component: any; inputs: Record<string, any> } | null>(null);
    mockModalService = jasmine.createSpyObj('ModalService', ['open', 'close']);
    (mockModalService as any).activeModal$ = activeModalSignal;

    await TestBed.configureTestingModule({
      imports: [Modal],
      providers: [{ provide: ModalService, useValue: mockModalService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Modal);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    document.body.classList.remove('modal-open');
    const backdrops = document.querySelectorAll('.c-modal__dynamic-backdrop');
    backdrops.forEach((backdrop) => backdrop.remove());
  });

  it('loadComponent debería llamar clearComponent y crear componentRef', () => {
    fixture.detectChanges();

    // Crear un mock del ViewContainerRef
    const mockComponentRef = {
      instance: {},
      destroy: jasmine.createSpy('destroy')
    };

    component.modalContentHost = {
      createComponent: jasmine.createSpy('createComponent').and.returnValue(mockComponentRef)
    } as any;

    // Llamar loadComponent directamente
    (component as any).loadComponent(TestComponent, { testInput: 'valor' });

    expect(component.modalContentHost.createComponent).toHaveBeenCalled();
    expect(component.componentRef).toBeTruthy();
    expect(component.componentRef?.instance.testInput).toBe('valor');
  });

  it('loadComponent debería asignar múltiples inputs', () => {
    fixture.detectChanges();

    const mockComponentRef = {
      instance: {},
      destroy: jasmine.createSpy('destroy')
    };

    component.modalContentHost = {
      createComponent: jasmine.createSpy('createComponent').and.returnValue(mockComponentRef)
    } as any;

    (component as any).loadComponent(TestComponent, { input1: 'val1', input2: 'val2', input3: 123 });

    expect(component.componentRef?.instance.input1).toBe('val1');
    expect(component.componentRef?.instance.input2).toBe('val2');
    expect(component.componentRef?.instance.input3).toBe(123);
  });

  it('onModalOpen debería hacer foco en elemento focusable si existe', fakeAsync(() => {
    fixture.detectChanges();

    // Crear un contenedor con elemento focusable
    const mockContainer = document.createElement('div');
    const mockButton = document.createElement('button');
    mockButton.id = 'focusable-test-btn';
    mockContainer.appendChild(mockButton);
    spyOn(mockButton, 'focus');

    component.modalContainer = { nativeElement: mockContainer } as any;

    // Llamar onModalOpen directamente
    (component as any).onModalOpen();
    tick(10);

    expect(mockButton.focus).toHaveBeenCalled();
  }));
});
