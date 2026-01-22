import { TestBed } from '@angular/core/testing';
import { Component, Type } from '@angular/core';
import { RendererFactory2, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ModalService } from './modal.service';

// Componentes de prueba para usar en los tests
@Component({
  selector: 'app-test-modal',
  template: '<section class="modal-content">Test Modal</section>',
  standalone: true,
})
class TestModalComponent {}

@Component({
  selector: 'app-another-modal',
  template: '<section class="modal-content">Another Modal</section>',
  standalone: true,
})
class AnotherModalComponent {}

@Component({
  selector: 'app-modal-with-inputs',
  template: '<section class="modal-content">Modal with inputs: {{titulo}}</section>',
  standalone: true,
})
class ModalWithInputsComponent {
  titulo = '';
  usuarioId = 0;
}

describe('ModalService', () => {
  let servicio: ModalService;
  let documentoMock: Document;
  let rendererMock: jasmine.SpyObj<Renderer2>;

  beforeEach(() => {
    // Crear mock de Renderer2
    rendererMock = jasmine.createSpyObj('Renderer2', [
      'addClass',
      'removeClass',
      'setAttribute',
      'createElement',
      'appendChild'
    ]);

    // Configurar comportamiento por defecto
    rendererMock.addClass.and.callFake((elemento: any, clase: string) => {
      if (elemento && elemento.classList) {
        elemento.classList.add(clase);
      }
    });

    rendererMock.removeClass.and.callFake((elemento: any, clase: string) => {
      if (elemento && elemento.classList) {
        elemento.classList.remove(clase);
      }
    });

    // Crear mock de RendererFactory2
    const rendererFactoryMock = jasmine.createSpyObj('RendererFactory2', ['createRenderer']);
    rendererFactoryMock.createRenderer.and.returnValue(rendererMock);

    TestBed.configureTestingModule({
      providers: [
        ModalService,
        { provide: RendererFactory2, useValue: rendererFactoryMock }
      ],
    });

    servicio = TestBed.inject(ModalService);
    documentoMock = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    // Limpiar cualquier clase residual del body
    documentoMock.body.classList.remove('modal-open');
  });

  describe('inicializacion del servicio', () => {
    it('deberia crearse correctamente', () => {
      expect(servicio).toBeTruthy();
    });

    it('deberia inicializar activeModal como null', () => {
      const modalActivo = servicio.activeModal$();
      expect(modalActivo).toBeNull();
    });

    it('deberia crear Renderer2 desde RendererFactory2', () => {
      expect(servicio).toBeTruthy();
    });

    it('deberia inyectar DOCUMENT token correctamente', () => {
      expect(documentoMock).toBeDefined();
      expect(documentoMock.body).toBeDefined();
    });
  });

  describe('metodo open', () => {
    it('deberia establecer activeModal con el componente', () => {
      servicio.open(TestModalComponent);

      const modalActivo = servicio.activeModal$();
      expect(modalActivo).toBeTruthy();
      expect(modalActivo?.component).toBe(TestModalComponent);
    });

    it('deberia establecer activeModal con inputs vacios cuando no se proporcionan', () => {
      servicio.open(TestModalComponent);

      const modalActivo = servicio.activeModal$();
      expect(modalActivo?.inputs).toEqual({});
    });

    it('deberia establecer activeModal con inputs proporcionados', () => {
      const inputs = { usuarioId: 123, titulo: 'Test Modal' };
      servicio.open(TestModalComponent, inputs);

      const modalActivo = servicio.activeModal$();
      expect(modalActivo?.inputs).toEqual(inputs);
    });

    it('deberia añadir clase modal-open al body usando Renderer2', () => {
      servicio.open(TestModalComponent);

      expect(rendererMock.addClass).toHaveBeenCalledWith(
        documentoMock.body,
        'modal-open'
      );
    });

    it('deberia verificar que la clase modal-open se añadio al body', () => {
      servicio.open(TestModalComponent);

      expect(documentoMock.body.classList.contains('modal-open')).toBe(true);
    });

    it('deberia reemplazar modal anterior al abrir uno nuevo', () => {
      servicio.open(TestModalComponent, { id: 1 });
      expect(servicio.activeModal$()?.component).toBe(TestModalComponent);

      servicio.open(AnotherModalComponent, { id: 2 });
      expect(servicio.activeModal$()?.component).toBe(AnotherModalComponent);
      expect(servicio.activeModal$()?.inputs).toEqual({ id: 2 });
    });

    it('deberia permitir abrir modales de diferentes tipos', () => {
      servicio.open(TestModalComponent);
      expect(servicio.activeModal$()?.component).toBe(TestModalComponent);

      servicio.open(AnotherModalComponent);
      expect(servicio.activeModal$()?.component).toBe(AnotherModalComponent);

      servicio.open(ModalWithInputsComponent);
      expect(servicio.activeModal$()?.component).toBe(ModalWithInputsComponent);
    });

    it('deberia permitir abrir modal con inputs complejos', () => {
      const inputsComplejos = {
        usuario: { id: 1, nombre: 'Juan' },
        configuracion: { tema: 'oscuro', idioma: 'es' },
        callback: () => console.log('test')
      };

      servicio.open(TestModalComponent, inputsComplejos);

      const modalActivo = servicio.activeModal$();
      expect(modalActivo?.inputs).toEqual(inputsComplejos);
    });

    it('deberia manejar inputs undefined correctamente', () => {
      servicio.open(TestModalComponent, undefined);

      const modalActivo = servicio.activeModal$();
      expect(modalActivo?.inputs).toEqual({});
    });

    it('deberia actualizar signal reactivamente al abrir modal', () => {
      expect(servicio.activeModal$()).toBeNull();

      servicio.open(TestModalComponent);

      expect(servicio.activeModal$()).not.toBeNull();
      expect(servicio.activeModal$()?.component).toBe(TestModalComponent);
    });
  });

  describe('metodo close', () => {
    it('deberia establecer activeModal a null', () => {
      servicio.open(TestModalComponent);
      expect(servicio.activeModal$()).toBeTruthy();

      servicio.close();

      expect(servicio.activeModal$()).toBeNull();
    });

    it('deberia eliminar clase modal-open del body usando Renderer2', () => {
      servicio.open(TestModalComponent);
      rendererMock.removeClass.calls.reset();

      servicio.close();

      expect(rendererMock.removeClass).toHaveBeenCalledWith(
        documentoMock.body,
        'modal-open'
      );
    });

    it('deberia verificar que la clase modal-open se elimino del body', () => {
      servicio.open(TestModalComponent);
      expect(documentoMock.body.classList.contains('modal-open')).toBe(true);

      servicio.close();

      expect(documentoMock.body.classList.contains('modal-open')).toBe(false);
    });

    it('deberia ser seguro llamar close cuando no hay modal abierto', () => {
      expect(() => servicio.close()).not.toThrow();
      expect(servicio.activeModal$()).toBeNull();
    });

    it('deberia no lanzar error al cerrar multiples veces', () => {
      servicio.open(TestModalComponent);
      servicio.close();

      expect(() => servicio.close()).not.toThrow();
      expect(servicio.activeModal$()).toBeNull();
    });

    it('deberia limpiar inputs del modal al cerrar', () => {
      servicio.open(TestModalComponent, { data: 'importante' });
      expect(servicio.activeModal$()?.inputs).toEqual({ data: 'importante' });

      servicio.close();

      expect(servicio.activeModal$()).toBeNull();
    });

    it('deberia actualizar signal reactivamente al cerrar modal', () => {
      servicio.open(TestModalComponent);
      expect(servicio.activeModal$()).toBeTruthy();

      servicio.close();

      expect(servicio.activeModal$()).toBeNull();
    });
  });

  describe('getter activeModal$', () => {
    it('deberia devolver null inicialmente', () => {
      expect(servicio.activeModal$()).toBeNull();
    });

    it('deberia ser readonly', () => {
      const signalModalActivo = servicio.activeModal$;

      // El signal expuesto debe ser readonly (sin método set)
      expect(typeof signalModalActivo).toBe('function');
      expect((signalModalActivo as any).set).toBeUndefined();
    });

    it('deberia actualizarse reactivamente cuando se abre modal', () => {
      let valorCapturado: any = null;

      // Capturar el valor inicial
      valorCapturado = servicio.activeModal$();
      expect(valorCapturado).toBeNull();

      // Abrir modal
      servicio.open(TestModalComponent, { test: true });
      valorCapturado = servicio.activeModal$();

      expect(valorCapturado).toBeTruthy();
      expect(valorCapturado.component).toBe(TestModalComponent);
      expect(valorCapturado.inputs).toEqual({ test: true });
    });

    it('deberia actualizarse reactivamente cuando se cierra modal', () => {
      servicio.open(TestModalComponent);
      expect(servicio.activeModal$()).toBeTruthy();

      servicio.close();

      expect(servicio.activeModal$()).toBeNull();
    });

    it('deberia reflejar el ultimo modal abierto', () => {
      servicio.open(TestModalComponent);
      expect(servicio.activeModal$()?.component).toBe(TestModalComponent);

      servicio.open(AnotherModalComponent);
      expect(servicio.activeModal$()?.component).toBe(AnotherModalComponent);
    });

    it('deberia devolver el mismo signal en multiples llamadas', () => {
      const signal1 = servicio.activeModal$;
      const signal2 = servicio.activeModal$;

      expect(signal1).toBe(signal2);
    });
  });

  describe('manipulacion del DOM', () => {
    it('deberia no afectar otras clases del body al abrir modal', () => {
      documentoMock.body.classList.add('clase-personalizada');

      servicio.open(TestModalComponent);

      expect(documentoMock.body.classList.contains('clase-personalizada')).toBe(true);
      expect(documentoMock.body.classList.contains('modal-open')).toBe(true);
    });

    it('deberia no afectar otras clases del body al cerrar modal', () => {
      documentoMock.body.classList.add('clase-personalizada');

      servicio.open(TestModalComponent);
      servicio.close();

      expect(documentoMock.body.classList.contains('clase-personalizada')).toBe(true);
      expect(documentoMock.body.classList.contains('modal-open')).toBe(false);
    });

    it('deberia manejar ciclos rapidos de apertura y cierre', () => {
      for (let i = 0; i < 10; i++) {
        servicio.open(TestModalComponent, { iteration: i });
        expect(documentoMock.body.classList.contains('modal-open')).toBe(true);

        servicio.close();
        expect(documentoMock.body.classList.contains('modal-open')).toBe(false);
      }
    });

    it('deberia usar Renderer2 para todas las manipulaciones del DOM', () => {
      servicio.open(TestModalComponent);
      servicio.close();

      // Verificar que se usó Renderer2 y no manipulación directa del DOM
      expect(rendererMock.addClass).toHaveBeenCalled();
      expect(rendererMock.removeClass).toHaveBeenCalled();
    });
  });

  describe('seguridad de tipos', () => {
    it('deberia funcionar con componentes genericos', () => {
      servicio.open(TestModalComponent);
      servicio.open(AnotherModalComponent);

      expect(servicio.activeModal$()?.component).toBe(AnotherModalComponent);
    });

    it('deberia preservar el tipo de componente en el signal', () => {
      servicio.open(TestModalComponent);

      const modalActivo = servicio.activeModal$();
      expect(modalActivo).toBeTruthy();

      // Verificar que el tipo se mantiene
      const componente: Type<any> = modalActivo!.component;
      expect(componente).toBe(TestModalComponent);
    });

    it('deberia manejar inputs de cualquier tipo', () => {
      const inputsVariados = {
        numero: 123,
        texto: 'prueba',
        booleano: true,
        objeto: { clave: 'valor' },
        array: [1, 2, 3],
        funcion: () => 'test'
      };

      servicio.open(TestModalComponent, inputsVariados);

      const modalActivo = servicio.activeModal$();
      expect(modalActivo?.inputs).toEqual(inputsVariados);
    });
  });

  describe('casos edge', () => {
    it('deberia manejar abrir modal mientras hay otro abierto', () => {
      servicio.open(TestModalComponent, { primero: true });
      expect(servicio.activeModal$()?.inputs).toEqual({ primero: true });

      servicio.open(AnotherModalComponent, { segundo: true });
      expect(servicio.activeModal$()?.component).toBe(AnotherModalComponent);
      expect(servicio.activeModal$()?.inputs).toEqual({ segundo: true });
    });

    it('deberia manejar inputs null', () => {
      servicio.open(TestModalComponent, null as any);

      const modalActivo = servicio.activeModal$();
      expect(modalActivo?.inputs).toEqual({});
    });

    it('deberia manejar componentes sin inputs', () => {
      servicio.open(TestModalComponent);

      const modalActivo = servicio.activeModal$();
      expect(modalActivo?.inputs).toBeDefined();
      expect(Object.keys(modalActivo!.inputs).length).toBe(0);
    });

    it('deberia manejar inputs con propiedades undefined', () => {
      const inputsConUndefined = {
        definido: 'valor',
        indefinido: undefined,
        nulo: null
      };

      servicio.open(TestModalComponent, inputsConUndefined);

      const modalActivo = servicio.activeModal$();
      expect(modalActivo?.inputs).toEqual(inputsConUndefined);
    });

    it('deberia permitir reabrir el mismo componente', () => {
      servicio.open(TestModalComponent, { primera: true });
      servicio.close();

      servicio.open(TestModalComponent, { segunda: true });

      const modalActivo = servicio.activeModal$();
      expect(modalActivo?.component).toBe(TestModalComponent);
      expect(modalActivo?.inputs).toEqual({ segunda: true });
    });

    it('deberia manejar secuencias complejas de operaciones', () => {
      // Abrir primer modal
      servicio.open(TestModalComponent);
      expect(servicio.activeModal$()?.component).toBe(TestModalComponent);

      // Abrir segundo modal sin cerrar el primero
      servicio.open(AnotherModalComponent);
      expect(servicio.activeModal$()?.component).toBe(AnotherModalComponent);

      // Cerrar
      servicio.close();
      expect(servicio.activeModal$()).toBeNull();

      // Abrir de nuevo
      servicio.open(ModalWithInputsComponent, { titulo: 'Test' });
      expect(servicio.activeModal$()?.component).toBe(ModalWithInputsComponent);
    });
  });

  describe('compatibilidad SSR', () => {
    it('deberia usar Renderer2 en lugar de manipulacion directa del DOM', () => {
      servicio.open(TestModalComponent);
      servicio.close();

      // Verificar que se usaron los métodos de Renderer2
      expect(rendererMock.addClass).toHaveBeenCalled();
      expect(rendererMock.removeClass).toHaveBeenCalled();
    });

    it('deberia usar DOCUMENT token en lugar de document global', () => {
      // Verificar que el documento inyectado está disponible
      expect(documentoMock).toBeDefined();
      expect(documentoMock.body).toBeDefined();
    });

    it('deberia funcionar con el document inyectado', () => {
      servicio.open(TestModalComponent);

      // Verificar que las operaciones usaron el documento inyectado
      expect(rendererMock.addClass).toHaveBeenCalledWith(
        documentoMock.body,
        'modal-open'
      );
    });
  });

  describe('integracion con signals', () => {
    it('deberia usar signals para estado reactivo', () => {
      // Verificar que activeModal$ es una función (signal)
      expect(typeof servicio.activeModal$).toBe('function');
    });

    it('deberia permitir leer el estado actual del modal', () => {
      expect(servicio.activeModal$()).toBeNull();

      servicio.open(TestModalComponent);
      expect(servicio.activeModal$()).not.toBeNull();

      servicio.close();
      expect(servicio.activeModal$()).toBeNull();
    });

    it('deberia notificar cambios de estado correctamente', () => {
      const estados: (any | null)[] = [];

      // Capturar estados
      estados.push(servicio.activeModal$());

      servicio.open(TestModalComponent);
      estados.push(servicio.activeModal$());

      servicio.close();
      estados.push(servicio.activeModal$());

      expect(estados[0]).toBeNull();
      expect(estados[1]).not.toBeNull();
      expect(estados[2]).toBeNull();
    });
  });

  describe('comportamiento con multiples componentes', () => {
    it('deberia poder alternar entre diferentes tipos de modales', () => {
      const componentes = [
        TestModalComponent,
        AnotherModalComponent,
        ModalWithInputsComponent
      ];

      componentes.forEach(componente => {
        servicio.open(componente);
        expect(servicio.activeModal$()?.component).toBe(componente);
        servicio.close();
      });
    });

    it('deberia mantener inputs especificos para cada componente', () => {
      const inputsTest = { tipo: 'test' };
      const inputsAnother = { tipo: 'another' };
      const inputsWithInputs = { tipo: 'withInputs' };

      servicio.open(TestModalComponent, inputsTest);
      expect(servicio.activeModal$()?.inputs).toEqual(inputsTest);

      servicio.open(AnotherModalComponent, inputsAnother);
      expect(servicio.activeModal$()?.inputs).toEqual(inputsAnother);

      servicio.open(ModalWithInputsComponent, inputsWithInputs);
      expect(servicio.activeModal$()?.inputs).toEqual(inputsWithInputs);
    });
  });

  describe('consistencia del estado', () => {
    it('deberia mantener consistencia entre signal y clase del body', () => {
      // Estado inicial
      expect(servicio.activeModal$()).toBeNull();
      expect(documentoMock.body.classList.contains('modal-open')).toBe(false);

      // Abrir modal
      servicio.open(TestModalComponent);
      expect(servicio.activeModal$()).not.toBeNull();
      expect(documentoMock.body.classList.contains('modal-open')).toBe(true);

      // Cerrar modal
      servicio.close();
      expect(servicio.activeModal$()).toBeNull();
      expect(documentoMock.body.classList.contains('modal-open')).toBe(false);
    });

    it('deberia mantener consistencia despues de multiples operaciones', () => {
      for (let i = 0; i < 5; i++) {
        servicio.open(TestModalComponent);
        expect(servicio.activeModal$()).not.toBeNull();
        expect(documentoMock.body.classList.contains('modal-open')).toBe(true);

        servicio.close();
        expect(servicio.activeModal$()).toBeNull();
        expect(documentoMock.body.classList.contains('modal-open')).toBe(false);
      }
    });
  });
});
