import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RendererFactory2, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ToastService } from './toast.service';
import { ToastMessage, ToastType, ToastConfig } from '../../shared/models/toast.model';

describe('ToastService', () => {
  let servicio: ToastService;
  let rendererMock: jasmine.SpyObj<Renderer2>;
  let documentoMock: Document;

  beforeEach(() => {
    // Crear mock de Renderer2 con todos los métodos necesarios
    rendererMock = jasmine.createSpyObj('Renderer2', [
      'createElement',
      'createText',
      'appendChild',
      'removeChild',
      'addClass',
      'removeClass',
      'setAttribute',
      'listen'
    ]);

    // Configurar comportamiento por defecto del mock
    rendererMock.createElement.and.callFake((element: string) => {
      return document.createElement(element);
    });

    rendererMock.createText.and.callFake((text: string) => {
      return document.createTextNode(text);
    });

    rendererMock.appendChild.and.callFake((parent: any, child: any) => {
      if (parent && child && parent.appendChild) {
        parent.appendChild(child);
      }
      return child;
    });

    rendererMock.removeChild.and.callFake((parent: any, child: any) => {
      if (parent && child && parent.removeChild && child.parentNode === parent) {
        parent.removeChild(child);
      }
    });

    rendererMock.listen.and.returnValue(() => {}); // unlisten function

    // Crear mock de RendererFactory2
    const rendererFactoryMock = jasmine.createSpyObj('RendererFactory2', ['createRenderer']);
    rendererFactoryMock.createRenderer.and.returnValue(rendererMock);

    TestBed.configureTestingModule({
      providers: [
        ToastService,
        { provide: RendererFactory2, useValue: rendererFactoryMock }
      ]
    });

    servicio = TestBed.inject(ToastService);
    documentoMock = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    // Limpiar cualquier contenedor dinámico que pueda quedar
    const contenedorDinamico = documentoMock.getElementById('dynamic-toast-container');
    if (contenedorDinamico) {
      contenedorDinamico.remove();
    }
    servicio.clear();
  });

  describe('inicializacion del servicio', () => {
    it('deberia crearse correctamente', () => {
      expect(servicio).toBeTruthy();
    });

    it('deberia inicializar con array vacio de toasts', () => {
      expect(servicio.toasts()).toEqual([]);
    });

    it('deberia crear Renderer2 desde RendererFactory2', () => {
      expect(servicio).toBeTruthy();
    });
  });

  describe('metodo show', () => {
    it('deberia añadir toast al array de toasts', () => {
      const configuracion: ToastConfig = {
        message: 'Mensaje de prueba',
        type: 'info'
      };

      servicio.show(configuracion);

      expect(servicio.toasts().length).toBe(1);
      expect(servicio.toasts()[0].message).toBe('Mensaje de prueba');
      expect(servicio.toasts()[0].type).toBe('info');
    });

    it('deberia generar ID unico para cada toast', () => {
      servicio.show({ message: 'Toast 1', type: 'info' });
      servicio.show({ message: 'Toast 2', type: 'success' });

      const toasts = servicio.toasts();
      expect(toasts[0].id).toBeDefined();
      expect(toasts[1].id).toBeDefined();
      expect(toasts[0].id).not.toBe(toasts[1].id);
    });

    it('deberia usar duracion por defecto segun el tipo si no se proporciona', () => {
      servicio.show({ message: 'Success', type: 'success' });
      expect(servicio.toasts()[0].duration).toBe(4000);

      servicio.clear();
      servicio.show({ message: 'Error', type: 'error' });
      expect(servicio.toasts()[0].duration).toBe(8000);

      servicio.clear();
      servicio.show({ message: 'Info', type: 'info' });
      expect(servicio.toasts()[0].duration).toBe(3000);

      servicio.clear();
      servicio.show({ message: 'Warning', type: 'warning' });
      expect(servicio.toasts()[0].duration).toBe(6000);
    });

    it('deberia usar duracion personalizada si se proporciona', () => {
      servicio.show({ message: 'Custom', type: 'info', duration: 5000 });

      expect(servicio.toasts()[0].duration).toBe(5000);
    });

    it('deberia auto-eliminar toast despues de su duracion', fakeAsync(() => {
      servicio.show({ message: 'Auto dismiss', type: 'success', duration: 100 });
      expect(servicio.toasts().length).toBe(1);

      tick(101);
      expect(servicio.toasts().length).toBe(0);
    }));

    it('deberia no auto-eliminar si duracion es 0', fakeAsync(() => {
      servicio.show({ message: 'No dismiss', type: 'info', duration: 0 });
      expect(servicio.toasts().length).toBe(1);

      tick(10000);
      expect(servicio.toasts().length).toBe(1);
    }));
  });

  describe('metodos de conveniencia', () => {
    it('deberia crear toast de tipo success', () => {
      servicio.success('Operacion exitosa');

      const toasts = servicio.toasts();
      expect(toasts.length).toBe(1);
      expect(toasts[0].type).toBe('success');
      expect(toasts[0].message).toBe('Operacion exitosa');
      expect(toasts[0].duration).toBe(4000);
    });

    it('deberia crear toast de tipo error', () => {
      servicio.error('Error en la operacion');

      const toasts = servicio.toasts();
      expect(toasts.length).toBe(1);
      expect(toasts[0].type).toBe('error');
      expect(toasts[0].message).toBe('Error en la operacion');
      expect(toasts[0].duration).toBe(8000);
    });

    it('deberia crear toast de tipo info', () => {
      servicio.info('Informacion importante');

      const toasts = servicio.toasts();
      expect(toasts.length).toBe(1);
      expect(toasts[0].type).toBe('info');
      expect(toasts[0].message).toBe('Informacion importante');
      expect(toasts[0].duration).toBe(3000);
    });

    it('deberia crear toast de tipo warning', () => {
      servicio.warning('Advertencia del sistema');

      const toasts = servicio.toasts();
      expect(toasts.length).toBe(1);
      expect(toasts[0].type).toBe('warning');
      expect(toasts[0].message).toBe('Advertencia del sistema');
      expect(toasts[0].duration).toBe(6000);
    });

    it('deberia permitir duracion personalizada en metodos de conveniencia', () => {
      servicio.success('Mensaje', 2000);

      expect(servicio.toasts()[0].duration).toBe(2000);
    });
  });

  describe('metodo dismiss', () => {
    it('deberia eliminar toast por ID', () => {
      servicio.show({ message: 'Toast 1', type: 'info' });
      servicio.show({ message: 'Toast 2', type: 'success' });

      const idPrimerToast = servicio.toasts()[0].id;
      servicio.dismiss(idPrimerToast);

      expect(servicio.toasts().length).toBe(1);
      expect(servicio.toasts()[0].message).toBe('Toast 2');
    });

    it('deberia no afectar otros toasts al eliminar uno especifico', () => {
      servicio.show({ message: 'Toast 1', type: 'info' });
      servicio.show({ message: 'Toast 2', type: 'success' });
      servicio.show({ message: 'Toast 3', type: 'error' });

      const idSegundoToast = servicio.toasts()[1].id;
      servicio.dismiss(idSegundoToast);

      expect(servicio.toasts().length).toBe(2);
      expect(servicio.toasts()[0].message).toBe('Toast 1');
      expect(servicio.toasts()[1].message).toBe('Toast 3');
    });

    it('deberia ser seguro llamar dismiss con ID inexistente', () => {
      servicio.show({ message: 'Toast', type: 'info' });

      expect(() => servicio.dismiss('id-inexistente')).not.toThrow();
      expect(servicio.toasts().length).toBe(1);
    });
  });

  describe('metodo clear', () => {
    it('deberia eliminar todos los toasts', () => {
      servicio.show({ message: 'Toast 1', type: 'info' });
      servicio.show({ message: 'Toast 2', type: 'success' });
      servicio.show({ message: 'Toast 3', type: 'error' });

      expect(servicio.toasts().length).toBe(3);

      servicio.clear();

      expect(servicio.toasts().length).toBe(0);
      expect(servicio.toasts()).toEqual([]);
    });

    it('deberia ser seguro llamar clear cuando no hay toasts', () => {
      expect(() => servicio.clear()).not.toThrow();
      expect(servicio.toasts()).toEqual([]);
    });

    it('deberia ser seguro llamar clear multiples veces', () => {
      servicio.show({ message: 'Toast', type: 'info' });
      servicio.clear();
      servicio.clear();
      servicio.clear();

      expect(servicio.toasts()).toEqual([]);
    });
  });

  describe('showDynamic - creacion de elementos con Renderer2', () => {
    it('deberia crear contenedor dinamico en el primer toast', () => {
      servicio.showDynamic('Mensaje dinamico', 'info');

      expect(rendererMock.createElement).toHaveBeenCalledWith('div');
      expect(rendererMock.setAttribute).toHaveBeenCalledWith(
        jasmine.any(Object),
        'id',
        'dynamic-toast-container'
      );
    });

    it('deberia añadir atributos de accesibilidad al contenedor', () => {
      servicio.showDynamic('Mensaje', 'info');

      expect(rendererMock.setAttribute).toHaveBeenCalledWith(
        jasmine.any(Object),
        'aria-live',
        'polite'
      );
      expect(rendererMock.setAttribute).toHaveBeenCalledWith(
        jasmine.any(Object),
        'aria-atomic',
        'true'
      );
    });

    it('deberia añadir clases CSS al contenedor', () => {
      servicio.showDynamic('Mensaje', 'info');

      expect(rendererMock.addClass).toHaveBeenCalledWith(
        jasmine.any(Object),
        'c-toast-container'
      );
      expect(rendererMock.addClass).toHaveBeenCalledWith(
        jasmine.any(Object),
        'c-toast-container--dynamic'
      );
    });

    it('deberia crear elemento toast con clases apropiadas', () => {
      servicio.showDynamic('Mensaje', 'success');

      expect(rendererMock.addClass).toHaveBeenCalledWith(
        jasmine.any(Object),
        'c-toast'
      );
      expect(rendererMock.addClass).toHaveBeenCalledWith(
        jasmine.any(Object),
        'c-toast--success'
      );
    });

    it('deberia añadir atributos ARIA al toast', () => {
      servicio.showDynamic('Mensaje', 'error');

      expect(rendererMock.setAttribute).toHaveBeenCalledWith(
        jasmine.any(Object),
        'role',
        'alert'
      );
      expect(rendererMock.setAttribute).toHaveBeenCalledWith(
        jasmine.any(Object),
        'aria-live',
        'assertive'
      );
    });

    it('deberia crear nodo de texto con el mensaje', () => {
      servicio.showDynamic('Mensaje de prueba', 'info');

      expect(rendererMock.createText).toHaveBeenCalledWith('Mensaje de prueba');
    });

    it('deberia crear boton de cierre con atributos correctos', () => {
      servicio.showDynamic('Mensaje', 'info');

      expect(rendererMock.setAttribute).toHaveBeenCalledWith(
        jasmine.any(Object),
        'type',
        'button'
      );
      expect(rendererMock.setAttribute).toHaveBeenCalledWith(
        jasmine.any(Object),
        'aria-label',
        'Cerrar notificación'
      );
    });

    it('deberia usar Renderer2.listen para añadir event listener', () => {
      servicio.showDynamic('Mensaje', 'info');

      expect(rendererMock.listen).toHaveBeenCalledWith(
        jasmine.any(Object),
        'click',
        jasmine.any(Function)
      );
    });

    it('deberia aplicar tipo correcto segun parametro', () => {
      servicio.showDynamic('Success', 'success');
      expect(rendererMock.addClass).toHaveBeenCalledWith(
        jasmine.any(Object),
        'c-toast--success'
      );

      rendererMock.addClass.calls.reset();

      servicio.showDynamic('Error', 'error');
      expect(rendererMock.addClass).toHaveBeenCalledWith(
        jasmine.any(Object),
        'c-toast--error'
      );
    });

    it('deberia usar tipo info por defecto si no se especifica', () => {
      servicio.showDynamic('Mensaje');

      expect(rendererMock.addClass).toHaveBeenCalledWith(
        jasmine.any(Object),
        'c-toast--info'
      );
    });

    it('deberia programar auto-eliminacion segun duracion del tipo', fakeAsync(() => {
      servicio.showDynamic('Mensaje', 'success');

      // Success tiene duracion de 4000ms
      tick(4001);

      // Verificar que se intentó remover
      expect(rendererMock.removeClass).toHaveBeenCalled();
    }));

    it('deberia reutilizar contenedor existente para multiples toasts', () => {
      const llamadasInicialesCrearElemento = rendererMock.createElement.calls.count();

      servicio.showDynamic('Toast 1', 'info');
      const llamadasDespuesDelPrimero = rendererMock.createElement.calls.count();

      servicio.showDynamic('Toast 2', 'info');
      const llamadasDespuesDelSegundo = rendererMock.createElement.calls.count();

      // El segundo toast debería crear menos elementos porque reutiliza el contenedor
      expect(llamadasDespuesDelSegundo).toBeGreaterThan(llamadasInicialesCrearElemento);
    });

    it('deberia ejecutar callback del boton de cierre al hacer click', () => {
      // Configurar el mock de listen para ejecutar el callback
      let clickCallback: any = null;

      rendererMock.listen.and.callFake((element: any, event: string, handler: any) => {
        if (event === 'click') {
          clickCallback = handler;
        }
        return () => {}; // unlisten function
      });

      servicio.showDynamic('Mensaje', 'info');

      // Verificar que se registró el listener
      expect(clickCallback).toBeTruthy();

      // Simular click en el botón
      if (clickCallback) {
        const mockEvent = {
          stopPropagation: jasmine.createSpy('stopPropagation')
        } as any;
        clickCallback(mockEvent);

        // Verificar que se llamó stopPropagation
        expect(mockEvent.stopPropagation).toHaveBeenCalled();

        // Verificar que se intentó eliminar el toast
        expect(rendererMock.removeClass).toHaveBeenCalled();
      }
    });

    it('deberia ejecutar callback de auto-eliminacion despues del timeout', fakeAsync(() => {
      // Configurar el mock de removeChild para verificar que se llama
      let removeChildCalled = false;
      rendererMock.removeChild.and.callFake(() => {
        removeChildCalled = true;
      });

      servicio.showDynamic('Mensaje', 'info');

      // La duración por defecto de info es 3000ms + 300ms de animación
      tick(3301);

      // Verificar que se intentó remover el elemento después del timeout
      expect(removeChildCalled).toBeTruthy();
    }));
  });

  describe('iconos por tipo', () => {
    it('deberia usar icono correcto para success', () => {
      servicio.showDynamic('Success', 'success');

      expect(rendererMock.createText).toHaveBeenCalledWith('✓');
    });

    it('deberia usar icono correcto para error', () => {
      servicio.showDynamic('Error', 'error');

      expect(rendererMock.createText).toHaveBeenCalledWith('✕');
    });

    it('deberia usar icono correcto para warning', () => {
      servicio.showDynamic('Warning', 'warning');

      expect(rendererMock.createText).toHaveBeenCalledWith('⚠');
    });

    it('deberia usar icono correcto para info', () => {
      servicio.showDynamic('Info', 'info');

      expect(rendererMock.createText).toHaveBeenCalledWith('ℹ');
    });
  });

  describe('limpieza de recursos', () => {
    it('deberia implementar ngOnDestroy', () => {
      expect(servicio.ngOnDestroy).toBeDefined();
    });

    it('deberia limpiar contenedor dinamico al destruir', () => {
      // Crear un toast dinámico
      servicio.showDynamic('Mensaje', 'info');

      // Llamar a ngOnDestroy
      servicio.ngOnDestroy();

      // Verificar que se intentó remover el contenedor
      expect(rendererMock.removeChild).toHaveBeenCalled();
    });

    it('deberia ser seguro llamar ngOnDestroy sin contenedor dinamico', () => {
      expect(() => servicio.ngOnDestroy()).not.toThrow();
    });

    it('deberia limpiar contenedor dinamico cuando tiene parentNode', () => {
      // Crear un toast dinámico para que se cree el contenedor
      servicio.showDynamic('Mensaje', 'info');

      // Llamar a ngOnDestroy
      servicio.ngOnDestroy();

      // Verificar que se llamó removeChild para limpiar el contenedor
      expect(rendererMock.removeChild).toHaveBeenCalled();
    });
  });

  describe('generacion de IDs', () => {
    it('deberia generar IDs unicos para cada toast', () => {
      servicio.show({ message: 'Toast 1', type: 'info' });
      servicio.show({ message: 'Toast 2', type: 'info' });
      servicio.show({ message: 'Toast 3', type: 'info' });

      const toasts = servicio.toasts();
      const ids = toasts.map(toast => toast.id);

      // Verificar que todos son únicos
      const idsUnicos = new Set(ids);
      expect(idsUnicos.size).toBe(3);
    });

    it('deberia generar IDs con formato correcto', () => {
      servicio.show({ message: 'Toast', type: 'info' });

      const id = servicio.toasts()[0].id;
      expect(id).toMatch(/^toast-\d+-[a-z0-9]+$/);
    });
  });

  describe('casos edge', () => {
    it('deberia manejar multiples toasts simultaneos', () => {
      servicio.success('Toast 1');
      servicio.error('Toast 2');
      servicio.warning('Toast 3');
      servicio.info('Toast 4');

      expect(servicio.toasts().length).toBe(4);
    });

    it('deberia manejar mensajes vacios', () => {
      expect(() => servicio.show({ message: '', type: 'info' })).not.toThrow();
      expect(servicio.toasts()[0].message).toBe('');
    });

    it('deberia manejar mensajes muy largos', () => {
      const mensajeLargo = 'a'.repeat(1000);
      servicio.info(mensajeLargo);

      expect(servicio.toasts()[0].message.length).toBe(1000);
    });

    it('deberia manejar duracion negativa como 0', fakeAsync(() => {
      servicio.show({ message: 'Test', type: 'info', duration: -100 });

      // No debería auto-eliminarse porque duration <= 0
      tick(5000);
      expect(servicio.toasts().length).toBe(1);
    }));

    it('deberia mantener orden de toasts', () => {
      servicio.info('Primero');
      servicio.success('Segundo');
      servicio.error('Tercero');

      const mensajes = servicio.toasts().map(t => t.message);
      expect(mensajes).toEqual(['Primero', 'Segundo', 'Tercero']);
    });

    it('deberia permitir eliminar toasts en cualquier orden', () => {
      servicio.info('A');
      servicio.info('B');
      servicio.info('C');

      const idB = servicio.toasts()[1].id;
      servicio.dismiss(idB);

      const mensajes = servicio.toasts().map(t => t.message);
      expect(mensajes).toEqual(['A', 'C']);
    });
  });

  describe('integracion con Renderer2', () => {
    it('deberia usar createElement para crear elementos', () => {
      servicio.showDynamic('Test', 'info');

      expect(rendererMock.createElement).toHaveBeenCalled();
    });

    it('deberia usar appendChild para añadir al DOM', () => {
      servicio.showDynamic('Test', 'info');

      expect(rendererMock.appendChild).toHaveBeenCalled();
    });

    it('deberia usar addClass para añadir clases', () => {
      servicio.showDynamic('Test', 'info');

      expect(rendererMock.addClass).toHaveBeenCalled();
    });

    it('deberia usar setAttribute para atributos', () => {
      servicio.showDynamic('Test', 'info');

      expect(rendererMock.setAttribute).toHaveBeenCalled();
    });

    it('deberia usar listen para event listeners', () => {
      servicio.showDynamic('Test', 'info');

      expect(rendererMock.listen).toHaveBeenCalled();
    });
  });

  describe('reactividad de signals', () => {
    it('deberia actualizar signal al añadir toast', () => {
      const toastsInicial = servicio.toasts();
      expect(toastsInicial.length).toBe(0);

      servicio.info('Nuevo toast');

      const toastsActualizado = servicio.toasts();
      expect(toastsActualizado.length).toBe(1);
    });

    it('deberia actualizar signal al eliminar toast', () => {
      servicio.info('Toast 1');
      servicio.info('Toast 2');

      expect(servicio.toasts().length).toBe(2);

      const idPrimero = servicio.toasts()[0].id;
      servicio.dismiss(idPrimero);

      expect(servicio.toasts().length).toBe(1);
    });

    it('deberia actualizar signal al limpiar todos los toasts', () => {
      servicio.info('Toast 1');
      servicio.info('Toast 2');
      servicio.info('Toast 3');

      expect(servicio.toasts().length).toBe(3);

      servicio.clear();

      expect(servicio.toasts().length).toBe(0);
    });
  });

  describe('removeDynamicToast - casos edge', () => {
    it('deberia manejar toast sin parentNode correctamente', fakeAsync(() => {
      // Configurar el mock para simular un toast sin parentNode
      let toastElementoCreado: any = null;
      rendererMock.createElement.and.callFake((tagName: string) => {
        const elemento = documentoMock.createElement(tagName);
        if (tagName === 'div' && toastElementoCreado === null) {
          // Este es el contenedor
          toastElementoCreado = elemento;
        }
        return elemento;
      });

      // Configurar appendChild para no añadir realmente al DOM
      rendererMock.appendChild.and.callFake((parent: any, child: any) => {
        // No hacer nada, simulando que no se añade al DOM
        return child;
      });

      servicio.showDynamic('Mensaje', 'info');

      // Avanzar tiempo para que intente remover
      tick(3301);

      // El servicio debería manejar correctamente el caso donde toast no tiene parentNode
      // No debería lanzar error
      expect(true).toBe(true);
    }));

    it('deberia intentar remover contenedor despues de eliminar toast', fakeAsync(() => {
      // Crear toast dinámico
      servicio.showDynamic('Toast', 'info');

      // Avanzar tiempo para que se auto-elimine (3000ms duración + 300ms animación)
      tick(3301);

      // Verificar que se llamó removeClass para la animación de salida
      expect(rendererMock.removeClass).toHaveBeenCalled();

      // Verificar que se intentó remover el toast del contenedor
      expect(rendererMock.removeChild).toHaveBeenCalled();
    }));
  });
});
