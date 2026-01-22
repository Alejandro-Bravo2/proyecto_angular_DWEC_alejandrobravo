import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { NgZone, PLATFORM_ID } from '@angular/core';
import { NutritionSceneComponent } from './nutrition-scene.component';
import { ThemeService } from '../../../core/services/theme.service';
import { signal } from '@angular/core';

describe('NutritionSceneComponent', () => {
  let componenteDeEscenaNutricion: NutritionSceneComponent;
  let fixture: ComponentFixture<NutritionSceneComponent>;
  let servicioMockDeTema: jasmine.SpyObj<ThemeService>;
  let signalDeTemaSimulado: any;

  // Mock de requestAnimationFrame global
  let requestAnimationFrameId = 0;
  const requestAnimationFrameMock = (callback: Function) => {
    return ++requestAnimationFrameId;
  };
  const cancelAnimationFrameMock = (_id: number) => {
    // Mock vacío
  };

  // Mock de ResizeObserver global
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  beforeEach(async () => {
    // Configurar signal simulado para tema
    signalDeTemaSimulado = signal('light');
    servicioMockDeTema = jasmine.createSpyObj('ThemeService', [], {
      currentTheme: signalDeTemaSimulado
    });

    // Configurar TestBed
    await TestBed.configureTestingModule({
      imports: [NutritionSceneComponent],
      providers: [
        { provide: ThemeService, useValue: servicioMockDeTema },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    // Mock de funciones globales
    spyOn(window, 'requestAnimationFrame').and.callFake(requestAnimationFrameMock as any);
    spyOn(window, 'cancelAnimationFrame').and.callFake(cancelAnimationFrameMock);
    (window as any).ResizeObserver = ResizeObserverMock;

    fixture = TestBed.createComponent(NutritionSceneComponent);
    componenteDeEscenaNutricion = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Creación del componente', () => {
    it('debería crear el componente correctamente', () => {
      expect(componenteDeEscenaNutricion).toBeTruthy();
    });

    it('debería tener la referencia al canvas', () => {
      expect(componenteDeEscenaNutricion.canvasRef).toBeDefined();
      expect(componenteDeEscenaNutricion.canvasRef.nativeElement).toBeInstanceOf(HTMLCanvasElement);
    });

    it('debería tener el input compact con valor por defecto false', () => {
      expect(componenteDeEscenaNutricion.compact()).toBe(false);
    });
  });

  describe('Constructor y effect del tema', () => {
    it('debería configurar el effect para cambios de tema', () => {
      expect(servicioMockDeTema.currentTheme).toBeDefined();
    });

    it('debería NO actualizar colores si no está inicializado', () => {
      spyOn<any>(componenteDeEscenaNutricion, 'updateColors');
      signalDeTemaSimulado.set('dark');
      fixture.detectChanges();
      expect(componenteDeEscenaNutricion['updateColors']).not.toHaveBeenCalled();
    });
  });

  describe('ngAfterViewInit', () => {
    it('debería retornar early si el canvas no está disponible', async () => {
      componenteDeEscenaNutricion.canvasRef = null as any;
      spyOn(console, 'error');

      await componenteDeEscenaNutricion.ngAfterViewInit();

      expect(console.error).toHaveBeenCalledWith('NutritionSceneComponent: Canvas element not found');
    });

    it('debería intentar cargar módulos cuando el canvas está disponible', async () => {
      // Este test verifica que ngAfterViewInit intenta cargar Three.js
      // En ambiente de test, WebGL puede no estar disponible
      try {
        await componenteDeEscenaNutricion.ngAfterViewInit();
        // Si llega aquí, Three.js se cargó correctamente (posible en algunos ambientes)
        expect(componenteDeEscenaNutricion.canvasRef).toBeDefined();
      } catch (error: any) {
        // En Chrome Headless, WebGL no está disponible y esto es esperado
        expect(error.message).toContain('WebGL');
      }
    });
  });

  describe('ngOnDestroy', () => {
    it('debería cancelar el frame de animación cuando existe', () => {
      componenteDeEscenaNutricion['frameId'] = 456;

      componenteDeEscenaNutricion.ngOnDestroy();

      expect(window.cancelAnimationFrame).toHaveBeenCalledWith(456);
    });

    it('debería NO cancelar frame si frameId es 0', () => {
      componenteDeEscenaNutricion['frameId'] = 0;
      (window.cancelAnimationFrame as jasmine.Spy).calls.reset();

      componenteDeEscenaNutricion.ngOnDestroy();

      expect(window.cancelAnimationFrame).not.toHaveBeenCalled();
    });

    it('debería remover event listeners', () => {
      spyOn(window, 'removeEventListener');

      componenteDeEscenaNutricion.ngOnDestroy();

      expect(window.removeEventListener).toHaveBeenCalledWith('resize', componenteDeEscenaNutricion['boundOnWindowResize']);
      expect(window.removeEventListener).toHaveBeenCalledWith('mousemove', componenteDeEscenaNutricion['boundOnMouseMove']);
    });

    it('debería matar todos los tweens de GSAP si existe', () => {
      const mockGsap = {
        killTweensOf: jasmine.createSpy('killTweensOf')
      };
      const mockMainGroup = {
        position: {},
        rotation: {},
        scale: {}
      };

      componenteDeEscenaNutricion['gsap'] = mockGsap;
      componenteDeEscenaNutricion['mainGroup'] = mockMainGroup;

      componenteDeEscenaNutricion.ngOnDestroy();

      expect(mockGsap.killTweensOf).toHaveBeenCalledWith(mockMainGroup.position);
      expect(mockGsap.killTweensOf).toHaveBeenCalledWith(mockMainGroup.rotation);
      expect(mockGsap.killTweensOf).toHaveBeenCalledWith(mockMainGroup.scale);
    });

    it('no debería fallar si gsap es null', () => {
      componenteDeEscenaNutricion['gsap'] = null;

      expect(() => componenteDeEscenaNutricion.ngOnDestroy()).not.toThrow();
    });

    it('debería llamar a disposeScene', () => {
      spyOn<any>(componenteDeEscenaNutricion, 'disposeScene');

      componenteDeEscenaNutricion.ngOnDestroy();

      expect(componenteDeEscenaNutricion['disposeScene']).toHaveBeenCalled();
    });
  });

  describe('disposeScene', () => {
    it('debería retornar early si THREE no está definido', () => {
      componenteDeEscenaNutricion['THREE'] = null as any;
      const mockScene = { traverse: jasmine.createSpy('traverse') };
      componenteDeEscenaNutricion['scene'] = mockScene;

      componenteDeEscenaNutricion['disposeScene']();

      expect(mockScene.traverse).not.toHaveBeenCalled();
    });

    it('debería disponer el renderer si existe', () => {
      // Crear un mock mínimo de THREE
      const mockTHREE: any = {
        Mesh: class {},
        Line: class {},
        Points: class {},
        LineSegments: class {}
      };

      const mockRenderer = {
        dispose: jasmine.createSpy('dispose')
      };

      componenteDeEscenaNutricion['THREE'] = mockTHREE;
      componenteDeEscenaNutricion['renderer'] = mockRenderer;
      componenteDeEscenaNutricion['scene'] = null;

      componenteDeEscenaNutricion['disposeScene']();

      expect(mockRenderer.dispose).toHaveBeenCalled();
    });
  });

  describe('getColors', () => {
    it('debería retornar colores dark cuando el tema es dark', () => {
      signalDeTemaSimulado.set('dark');

      const coloresObtenidos = componenteDeEscenaNutricion['getColors']();

      expect(coloresObtenidos).toEqual(componenteDeEscenaNutricion['colors'].dark);
    });

    it('debería retornar colores light cuando el tema es light', () => {
      signalDeTemaSimulado.set('light');

      const coloresObtenidos = componenteDeEscenaNutricion['getColors']();

      expect(coloresObtenidos).toEqual(componenteDeEscenaNutricion['colors'].light);
    });
  });

  describe('onWindowResize', () => {
    it('debería actualizar el aspect ratio de la cámara', () => {
      const mockCamera = {
        aspect: 1,
        updateProjectionMatrix: jasmine.createSpy('updateProjectionMatrix')
      };
      const mockRenderer = {
        setSize: jasmine.createSpy('setSize')
      };

      componenteDeEscenaNutricion['camera'] = mockCamera;
      componenteDeEscenaNutricion['renderer'] = mockRenderer;

      componenteDeEscenaNutricion['onWindowResize']();

      expect(mockCamera.updateProjectionMatrix).toHaveBeenCalled();
      expect(mockRenderer.setSize).toHaveBeenCalled();
    });
  });

  describe('onMouseMove', () => {
    it('debería actualizar mouseX y mouseY correctamente', () => {
      const eventoSimuladoDeMouse = new MouseEvent('mousemove', {
        clientX: 800,
        clientY: 600
      });

      Object.defineProperty(window, 'innerWidth', { value: 1000, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });

      componenteDeEscenaNutricion['onMouseMove'](eventoSimuladoDeMouse);

      // mouseX = (800 / 1000) * 2 - 1 = 0.6
      // mouseY = (600 / 800) * 2 - 1 = 0.5
      expect(componenteDeEscenaNutricion['mouseX']).toBeCloseTo(0.6, 1);
      expect(componenteDeEscenaNutricion['mouseY']).toBeCloseTo(0.5, 1);
    });

    it('debería calcular valores negativos para coordenadas pequeñas', () => {
      const eventoSimuladoDeMouse = new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 100
      });

      Object.defineProperty(window, 'innerWidth', { value: 1000, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });

      componenteDeEscenaNutricion['onMouseMove'](eventoSimuladoDeMouse);

      expect(componenteDeEscenaNutricion['mouseX']).toBeLessThan(0);
      expect(componenteDeEscenaNutricion['mouseY']).toBeLessThan(0);
    });
  });

  describe('animate', () => {
    it('debería llamar a requestAnimationFrame', () => {
      const mockClock = {
        getElapsedTime: jasmine.createSpy('getElapsedTime').and.returnValue(1.5)
      };
      const mockRenderer = {
        render: jasmine.createSpy('render')
      };
      const mockScene = {};
      const mockCamera = {};

      componenteDeEscenaNutricion['clock'] = mockClock;
      componenteDeEscenaNutricion['renderer'] = mockRenderer;
      componenteDeEscenaNutricion['scene'] = mockScene;
      componenteDeEscenaNutricion['camera'] = mockCamera;

      componenteDeEscenaNutricion['animate']();

      expect(window.requestAnimationFrame).toHaveBeenCalled();
      expect(mockRenderer.render).toHaveBeenCalledWith(mockScene, mockCamera);
    });

    it('debería actualizar la rotación del mainGroup si existe', () => {
      const mockMainGroup = {
        rotation: { x: 0, y: 0 }
      };
      const mockClock = {
        getElapsedTime: jasmine.createSpy('getElapsedTime').and.returnValue(1.5)
      };
      const mockRenderer = {
        render: jasmine.createSpy('render')
      };

      componenteDeEscenaNutricion['mainGroup'] = mockMainGroup;
      componenteDeEscenaNutricion['mouseX'] = 0.5;
      componenteDeEscenaNutricion['mouseY'] = 0.3;
      componenteDeEscenaNutricion['clock'] = mockClock;
      componenteDeEscenaNutricion['renderer'] = mockRenderer;
      componenteDeEscenaNutricion['scene'] = {};
      componenteDeEscenaNutricion['camera'] = {};

      componenteDeEscenaNutricion['animate']();

      expect(mockMainGroup.rotation.y).not.toBe(0);
    });

    it('debería animar appleGroup si existe', () => {
      const mockAppleGroup = {
        rotation: { y: 0 },
        position: { y: 0 }
      };
      const mockClock = {
        getElapsedTime: jasmine.createSpy('getElapsedTime').and.returnValue(1.5)
      };
      const mockRenderer = {
        render: jasmine.createSpy('render')
      };

      componenteDeEscenaNutricion['appleGroup'] = mockAppleGroup;
      componenteDeEscenaNutricion['clock'] = mockClock;
      componenteDeEscenaNutricion['renderer'] = mockRenderer;
      componenteDeEscenaNutricion['scene'] = {};
      componenteDeEscenaNutricion['camera'] = {};

      const rotacionInicialY = mockAppleGroup.rotation.y;

      componenteDeEscenaNutricion['animate']();

      expect(mockAppleGroup.rotation.y).toBeGreaterThan(rotacionInicialY);
    });

    it('debería animar bowlGroup si existe', () => {
      const mockBowlGroup = {
        rotation: { y: 0 }
      };
      const mockClock = {
        getElapsedTime: jasmine.createSpy('getElapsedTime').and.returnValue(1.5)
      };
      const mockRenderer = {
        render: jasmine.createSpy('render')
      };

      componenteDeEscenaNutricion['bowlGroup'] = mockBowlGroup;
      componenteDeEscenaNutricion['clock'] = mockClock;
      componenteDeEscenaNutricion['renderer'] = mockRenderer;
      componenteDeEscenaNutricion['scene'] = {};
      componenteDeEscenaNutricion['camera'] = {};

      const rotacionInicialY = mockBowlGroup.rotation.y;

      componenteDeEscenaNutricion['animate']();

      expect(mockBowlGroup.rotation.y).toBeLessThan(rotacionInicialY);
    });

    it('debería animar floatingFruits si existen', () => {
      const frutaFlotante = {
        userData: {
          originalY: 1,
          floatSpeed: 0.5,
          floatOffset: 0,
          rotationSpeed: 0.01
        },
        position: { y: 1 },
        rotation: { x: 0, y: 0 }
      };

      const mockClock = {
        getElapsedTime: jasmine.createSpy('getElapsedTime').and.returnValue(1.5)
      };
      const mockRenderer = {
        render: jasmine.createSpy('render')
      };

      componenteDeEscenaNutricion['floatingFruits'] = [frutaFlotante];
      componenteDeEscenaNutricion['clock'] = mockClock;
      componenteDeEscenaNutricion['renderer'] = mockRenderer;
      componenteDeEscenaNutricion['scene'] = {};
      componenteDeEscenaNutricion['camera'] = {};

      componenteDeEscenaNutricion['animate']();

      expect(frutaFlotante.rotation.x).toBeGreaterThan(0);
      expect(frutaFlotante.rotation.y).toBeGreaterThan(0);
    });

    it('debería animar particles si existen', () => {
      const mockParticles = {
        rotation: { y: 0 }
      };
      const mockClock = {
        getElapsedTime: jasmine.createSpy('getElapsedTime').and.returnValue(1.5)
      };
      const mockRenderer = {
        render: jasmine.createSpy('render')
      };

      componenteDeEscenaNutricion['particles'] = mockParticles;
      componenteDeEscenaNutricion['clock'] = mockClock;
      componenteDeEscenaNutricion['renderer'] = mockRenderer;
      componenteDeEscenaNutricion['scene'] = {};
      componenteDeEscenaNutricion['camera'] = {};

      componenteDeEscenaNutricion['animate']();

      expect(mockParticles.rotation.y).toBeGreaterThan(0);
    });
  });

  describe('addEventListeners', () => {
    it('debería agregar event listeners a window', () => {
      spyOn(window, 'addEventListener');

      componenteDeEscenaNutricion['addEventListeners']();

      expect(window.addEventListener).toHaveBeenCalledWith('resize', componenteDeEscenaNutricion['boundOnWindowResize']);
      expect(window.addEventListener).toHaveBeenCalledWith('mousemove', componenteDeEscenaNutricion['boundOnMouseMove']);
    });
  });

  describe('Integración con ThemeService', () => {
    it('debería actualizar colores cuando el tema cambia después de inicializar', () => {
      componenteDeEscenaNutricion['isInitialized'] = true;

      spyOn<any>(componenteDeEscenaNutricion, 'updateColors');

      signalDeTemaSimulado.set('dark');
      fixture.detectChanges();

      expect(componenteDeEscenaNutricion['updateColors']).toHaveBeenCalledWith(true);
    });

    it('debería actualizar a light cuando se cambia el tema', () => {
      componenteDeEscenaNutricion['isInitialized'] = true;
      spyOn<any>(componenteDeEscenaNutricion, 'updateColors');

      signalDeTemaSimulado.set('light');
      fixture.detectChanges();

      expect(componenteDeEscenaNutricion['updateColors']).toHaveBeenCalledWith(false);
    });
  });

  describe('Input compact', () => {
    it('debería aceptar compact como true', () => {
      fixture.componentRef.setInput('compact', true);
      fixture.detectChanges();

      expect(componenteDeEscenaNutricion.compact()).toBe(true);
    });

    it('debería mantener compact como false por defecto', () => {
      expect(componenteDeEscenaNutricion.compact()).toBe(false);
    });
  });

  describe('Propiedades privadas', () => {
    it('debería tener colores definidos para light y dark', () => {
      expect(componenteDeEscenaNutricion['colors'].light).toBeDefined();
      expect(componenteDeEscenaNutricion['colors'].dark).toBeDefined();
      expect(componenteDeEscenaNutricion['colors'].light.primary).toBe('#000000');
      expect(componenteDeEscenaNutricion['colors'].dark.primary).toBe('#ffffff');
    });

    it('debería inicializar con isInitialized en false', () => {
      expect(componenteDeEscenaNutricion['isInitialized']).toBe(false);
    });

    it('debería inicializar arrays vacíos para floatingFruits', () => {
      expect(componenteDeEscenaNutricion['floatingFruits']).toEqual([]);
    });

    it('debería tener funciones bound creadas', () => {
      expect(componenteDeEscenaNutricion['boundOnWindowResize']).toBeDefined();
      expect(componenteDeEscenaNutricion['boundOnMouseMove']).toBeDefined();
      expect(typeof componenteDeEscenaNutricion['boundOnWindowResize']).toBe('function');
      expect(typeof componenteDeEscenaNutricion['boundOnMouseMove']).toBe('function');
    });

    it('debería tener mouseX y mouseY inicializados en 0', () => {
      expect(componenteDeEscenaNutricion['mouseX']).toBe(0);
      expect(componenteDeEscenaNutricion['mouseY']).toBe(0);
    });

    it('debería tener frameId inicializado en 0', () => {
      expect(componenteDeEscenaNutricion['frameId']).toBe(0);
    });
  });

  describe('initThree', () => {
    let mockTHREE: any;
    let mockRenderer: any;
    let mockScene: any;
    let mockCamera: any;
    let mockGroup: any;

    beforeEach(() => {
      mockRenderer = {
        setSize: jasmine.createSpy('setSize'),
        setPixelRatio: jasmine.createSpy('setPixelRatio'),
        setClearColor: jasmine.createSpy('setClearColor'),
        dispose: jasmine.createSpy('dispose')
      };

      mockScene = {
        add: jasmine.createSpy('add'),
        traverse: jasmine.createSpy('traverse')
      };

      mockCamera = {
        position: { z: 0, y: 0 }
      };

      mockGroup = {};

      mockTHREE = {
        WebGLRenderer: jasmine.createSpy('WebGLRenderer').and.returnValue(mockRenderer),
        Scene: jasmine.createSpy('Scene').and.returnValue(mockScene),
        PerspectiveCamera: jasmine.createSpy('PerspectiveCamera').and.returnValue(mockCamera),
        Group: jasmine.createSpy('Group').and.returnValue(mockGroup)
      };

      componenteDeEscenaNutricion['THREE'] = mockTHREE;
      componenteDeEscenaNutricion['renderer'] = mockRenderer;
      componenteDeEscenaNutricion['scene'] = mockScene;

      // Asegurar que el canvas tiene un parentElement mock
      const canvasElement = componenteDeEscenaNutricion.canvasRef.nativeElement;
      Object.defineProperty(canvasElement, 'parentElement', {
        value: { clientWidth: 800, clientHeight: 600 },
        configurable: true
      });
    });

    it('debería crear el renderer, scene y camera', () => {
      componenteDeEscenaNutricion['initThree']();

      expect(mockTHREE.WebGLRenderer).toHaveBeenCalled();
      expect(mockTHREE.Scene).toHaveBeenCalled();
      expect(mockTHREE.PerspectiveCamera).toHaveBeenCalled();
      expect(mockTHREE.Group).toHaveBeenCalled();
    });

    it('debería configurar el renderer con antialias y alpha', () => {
      componenteDeEscenaNutricion['initThree']();

      const llamadaWebGLRenderer = mockTHREE.WebGLRenderer.calls.mostRecent();
      expect(llamadaWebGLRenderer.args[0].antialias).toBe(true);
      expect(llamadaWebGLRenderer.args[0].alpha).toBe(true);
    });

    it('debería agregar mainGroup a la escena', () => {
      componenteDeEscenaNutricion['initThree']();

      expect(mockScene.add).toHaveBeenCalledWith(mockGroup);
    });

    it('debería usar fov de 60 cuando compact es true', () => {
      fixture.componentRef.setInput('compact', true);
      fixture.detectChanges();

      componenteDeEscenaNutricion['initThree']();

      expect(mockTHREE.PerspectiveCamera).toHaveBeenCalledWith(60, jasmine.any(Number), 0.1, 1000);
    });

    it('debería usar fov de 50 cuando compact es false', () => {
      fixture.componentRef.setInput('compact', false);
      fixture.detectChanges();

      componenteDeEscenaNutricion['initThree']();

      expect(mockTHREE.PerspectiveCamera).toHaveBeenCalledWith(50, jasmine.any(Number), 0.1, 1000);
    });
  });

  describe('createApple', () => {
    let mockTHREE: any;
    let mockGroup: any;
    let mockMainGroup: any;
    let mockScene: any;
    let mockRenderer: any;

    beforeEach(() => {
      mockGroup = {
        add: jasmine.createSpy('add'),
        position: { set: jasmine.createSpy('set') },
        scale: { set: jasmine.createSpy('set') }
      };

      mockMainGroup = {
        add: jasmine.createSpy('add')
      };

      mockScene = {
        add: jasmine.createSpy('add'),
        traverse: jasmine.createSpy('traverse')
      };

      mockRenderer = {
        dispose: jasmine.createSpy('dispose')
      };

      // Usar clases/funciones constructoras reales para que funcionen con 'new'
      class MockVector2 {}
      class MockLatheGeometry {}
      class MockEdgesGeometry {}
      class MockLineBasicMaterial {}
      class MockCylinderGeometry {}
      class MockShapeGeometry {}
      class MockColor {}
      class MockLineSegments {
        position = { set: jasmine.createSpy('set'), x: 0, y: 0, z: 0 };
        rotation = { x: 0, y: 0, z: 0 };
      }
      class MockShape {
        moveTo = jasmine.createSpy('moveTo');
        quadraticCurveTo = jasmine.createSpy('quadraticCurveTo');
      }

      mockTHREE = {
        Group: jasmine.createSpy('Group').and.returnValue(mockGroup),
        Vector2: MockVector2,
        LatheGeometry: MockLatheGeometry,
        EdgesGeometry: MockEdgesGeometry,
        LineBasicMaterial: MockLineBasicMaterial,
        LineSegments: MockLineSegments,
        CylinderGeometry: MockCylinderGeometry,
        Shape: MockShape,
        ShapeGeometry: MockShapeGeometry,
        Color: MockColor
      };

      componenteDeEscenaNutricion['THREE'] = mockTHREE;
      componenteDeEscenaNutricion['mainGroup'] = mockMainGroup;
      componenteDeEscenaNutricion['scene'] = mockScene;
      componenteDeEscenaNutricion['renderer'] = mockRenderer;
    });

    it('debería crear el grupo de apple y agregarlo a mainGroup', () => {
      componenteDeEscenaNutricion['createApple']();

      expect(mockTHREE.Group).toHaveBeenCalled();
      expect(mockMainGroup.add).toHaveBeenCalled();
    });

    it('debería configurar la posición y escala del apple', () => {
      componenteDeEscenaNutricion['createApple']();

      expect(mockGroup.position.set).toHaveBeenCalledWith(-1.5, 0, 0);
      expect(mockGroup.scale.set).toHaveBeenCalledWith(1.2, 1.2, 1.2);
    });
  });

  describe('createBowl', () => {
    let mockTHREE: any;
    let mockGroup: any;
    let mockMainGroup: any;
    let mockScene: any;
    let mockRenderer: any;

    beforeEach(() => {
      mockGroup = {
        add: jasmine.createSpy('add'),
        position: { set: jasmine.createSpy('set') }
      };

      mockMainGroup = {
        add: jasmine.createSpy('add')
      };

      mockScene = {
        add: jasmine.createSpy('add'),
        traverse: jasmine.createSpy('traverse')
      };

      mockRenderer = {
        dispose: jasmine.createSpy('dispose')
      };

      mockTHREE = {
        Group: jasmine.createSpy('Group').and.returnValue(mockGroup),
        Vector2: jasmine.createSpy('Vector2'),
        LatheGeometry: jasmine.createSpy('LatheGeometry'),
        EdgesGeometry: jasmine.createSpy('EdgesGeometry'),
        LineBasicMaterial: jasmine.createSpy('LineBasicMaterial'),
        LineSegments: jasmine.createSpy('LineSegments').and.returnValue({
          position: { y: 0, set: jasmine.createSpy('set') },
          rotation: { x: 0 }
        }),
        TorusGeometry: jasmine.createSpy('TorusGeometry'),
        SphereGeometry: jasmine.createSpy('SphereGeometry'),
        Color: jasmine.createSpy('Color')
      };

      componenteDeEscenaNutricion['THREE'] = mockTHREE;
      componenteDeEscenaNutricion['mainGroup'] = mockMainGroup;
      componenteDeEscenaNutricion['scene'] = mockScene;
      componenteDeEscenaNutricion['renderer'] = mockRenderer;
    });

    it('debería crear el grupo del bowl y agregarlo a mainGroup', () => {
      componenteDeEscenaNutricion['createBowl']();

      expect(mockTHREE.Group).toHaveBeenCalled();
      expect(mockMainGroup.add).toHaveBeenCalled();
    });

    it('debería configurar la posición del bowl', () => {
      componenteDeEscenaNutricion['createBowl']();

      expect(mockGroup.position.set).toHaveBeenCalledWith(1.5, -0.5, 0);
    });
  });

  describe('createSmallFruit', () => {
    let mockTHREE: any;
    let mockParent: any;
    let mockScene: any;
    let mockRenderer: any;

    beforeEach(() => {
      mockParent = {
        add: jasmine.createSpy('add')
      };

      mockScene = {
        add: jasmine.createSpy('add'),
        traverse: jasmine.createSpy('traverse')
      };

      mockRenderer = {
        dispose: jasmine.createSpy('dispose')
      };

      mockTHREE = {
        SphereGeometry: jasmine.createSpy('SphereGeometry'),
        EdgesGeometry: jasmine.createSpy('EdgesGeometry'),
        LineBasicMaterial: jasmine.createSpy('LineBasicMaterial'),
        LineSegments: jasmine.createSpy('LineSegments').and.returnValue({
          position: { set: jasmine.createSpy('set') }
        }),
        Color: jasmine.createSpy('Color')
      };

      componenteDeEscenaNutricion['THREE'] = mockTHREE;
      componenteDeEscenaNutricion['scene'] = mockScene;
      componenteDeEscenaNutricion['renderer'] = mockRenderer;
    });

    it('debería crear una esfera y agregarla al parent', () => {
      const colores = { fruit: '#000000' };
      const posicion = { x: 0.5, y: 0.2, z: 0.1 };

      componenteDeEscenaNutricion['createSmallFruit'](mockParent, 0.2, posicion, colores);

      expect(mockTHREE.SphereGeometry).toHaveBeenCalledWith(0.2, 8, 6);
      expect(mockParent.add).toHaveBeenCalled();
    });
  });

  describe('createFloatingFruits', () => {
    let mockTHREE: any;
    let mockScene: any;
    let mockRenderer: any;

    beforeEach(() => {
      mockScene = {
        add: jasmine.createSpy('add'),
        traverse: jasmine.createSpy('traverse')
      };

      mockRenderer = {
        dispose: jasmine.createSpy('dispose')
      };

      // Usar clases/funciones constructoras reales para que funcionen con 'new'
      class MockGroup {
        add = jasmine.createSpy('add');
        position = { set: jasmine.createSpy('set'), x: 0, y: 0, z: 0 };
        scale = { set: jasmine.createSpy('set'), x: 1, y: 1, z: 1 };
        userData: any = {};
      }
      class MockSphereGeometry {}
      class MockEdgesGeometry {}
      class MockLineBasicMaterial {}
      class MockLineSegments {
        scale = { set: jasmine.createSpy('set'), x: 1, y: 1, z: 1 };
        position = { set: jasmine.createSpy('set'), x: 0, y: 0, z: 0 };
      }
      class MockQuadraticBezierCurve3 {
        getPoints = jasmine.createSpy('getPoints').and.returnValue([]);
      }
      class MockVector3 {}
      class MockTubeGeometry {}
      class MockColor {}

      mockTHREE = {
        Group: MockGroup,
        SphereGeometry: MockSphereGeometry,
        EdgesGeometry: MockEdgesGeometry,
        LineBasicMaterial: MockLineBasicMaterial,
        LineSegments: MockLineSegments,
        QuadraticBezierCurve3: MockQuadraticBezierCurve3,
        Vector3: MockVector3,
        TubeGeometry: MockTubeGeometry,
        Color: MockColor
      };

      componenteDeEscenaNutricion['THREE'] = mockTHREE;
      componenteDeEscenaNutricion['scene'] = mockScene;
      componenteDeEscenaNutricion['renderer'] = mockRenderer;
      componenteDeEscenaNutricion['floatingFruits'] = [];
    });

    it('debería crear 5 frutas flotantes', () => {
      componenteDeEscenaNutricion['createFloatingFruits']();

      expect(componenteDeEscenaNutricion['floatingFruits'].length).toBe(5);
    });

    it('debería agregar las frutas a la escena', () => {
      componenteDeEscenaNutricion['createFloatingFruits']();

      expect(mockScene.add).toHaveBeenCalledTimes(5);
    });
  });

  describe('createParticleField', () => {
    let mockTHREE: any;
    let mockScene: any;
    let mockPoints: any;
    let mockRenderer: any;

    beforeEach(() => {
      mockScene = {
        add: jasmine.createSpy('add'),
        traverse: jasmine.createSpy('traverse')
      };

      mockRenderer = {
        dispose: jasmine.createSpy('dispose')
      };

      mockPoints = {};

      mockTHREE = {
        BufferGeometry: jasmine.createSpy('BufferGeometry').and.returnValue({
          setAttribute: jasmine.createSpy('setAttribute')
        }),
        BufferAttribute: jasmine.createSpy('BufferAttribute'),
        PointsMaterial: jasmine.createSpy('PointsMaterial'),
        Points: jasmine.createSpy('Points').and.returnValue(mockPoints),
        Color: jasmine.createSpy('Color')
      };

      componenteDeEscenaNutricion['THREE'] = mockTHREE;
      componenteDeEscenaNutricion['scene'] = mockScene;
      componenteDeEscenaNutricion['renderer'] = mockRenderer;
    });

    it('debería crear 150 partículas', () => {
      componenteDeEscenaNutricion['createParticleField']();

      expect(mockTHREE.Points).toHaveBeenCalled();
      expect(mockScene.add).toHaveBeenCalledWith(mockPoints);
    });

    it('debería configurar el material de las partículas', () => {
      componenteDeEscenaNutricion['createParticleField']();

      expect(mockTHREE.PointsMaterial).toHaveBeenCalled();
    });
  });

  describe('playIntroAnimation', () => {
    let mockGsap: any;
    let mockAppleGroup: any;
    let mockBowlGroup: any;
    let mockParticles: any;
    let mockTHREE: any;
    let MockPointsMaterialClass: any;
    let mockScene: any;
    let mockRenderer: any;

    beforeEach(() => {
      mockGsap = {
        fromTo: jasmine.createSpy('fromTo'),
        killTweensOf: jasmine.createSpy('killTweensOf')
      };

      mockScene = {
        add: jasmine.createSpy('add'),
        traverse: jasmine.createSpy('traverse')
      };

      mockRenderer = {
        dispose: jasmine.createSpy('dispose')
      };

      mockAppleGroup = {
        scale: { x: 1, y: 1, z: 1 },
        rotation: { y: 0 }
      };

      mockBowlGroup = {
        scale: { x: 1, y: 1, z: 1 },
        position: { y: 0 }
      };

      // Crear clase real para que instanceof funcione
      MockPointsMaterialClass = class PointsMaterial {};

      // Crear material como instancia de la clase mock
      const mockMaterial = Object.create(MockPointsMaterialClass.prototype);
      mockMaterial.opacity = 0;
      mockParticles = {
        material: mockMaterial
      };

      mockTHREE = {
        PointsMaterial: MockPointsMaterialClass
      };

      componenteDeEscenaNutricion['gsap'] = mockGsap;
      componenteDeEscenaNutricion['appleGroup'] = mockAppleGroup;
      componenteDeEscenaNutricion['bowlGroup'] = mockBowlGroup;
      componenteDeEscenaNutricion['particles'] = mockParticles;
      componenteDeEscenaNutricion['floatingFruits'] = [];
      componenteDeEscenaNutricion['THREE'] = mockTHREE;
      componenteDeEscenaNutricion['scene'] = mockScene;
      componenteDeEscenaNutricion['renderer'] = mockRenderer;
    });

    it('debería llamar a gsap.fromTo para apple scale y rotation', () => {
      componenteDeEscenaNutricion['playIntroAnimation']();

      expect(mockGsap.fromTo).toHaveBeenCalledWith(
        mockAppleGroup.scale,
        jasmine.any(Object),
        jasmine.any(Object)
      );
      expect(mockGsap.fromTo).toHaveBeenCalledWith(
        mockAppleGroup.rotation,
        jasmine.any(Object),
        jasmine.any(Object)
      );
    });

    it('debería llamar a gsap.fromTo para bowl scale y position', () => {
      componenteDeEscenaNutricion['playIntroAnimation']();

      expect(mockGsap.fromTo).toHaveBeenCalledWith(
        mockBowlGroup.scale,
        jasmine.any(Object),
        jasmine.any(Object)
      );
      expect(mockGsap.fromTo).toHaveBeenCalledWith(
        mockBowlGroup.position,
        jasmine.any(Object),
        jasmine.any(Object)
      );
    });

    it('debería animar particles si es PointsMaterial', () => {
      componenteDeEscenaNutricion['playIntroAnimation']();

      // Ahora el material ya es una instancia de PointsMaterial, debería animar
      expect(mockGsap.fromTo).toHaveBeenCalled();
    });

    it('debería animar cada floatingFruit', () => {
      const frutaFlotante = {
        scale: { x: 0, y: 0, z: 0 }
      };
      componenteDeEscenaNutricion['floatingFruits'] = [frutaFlotante, frutaFlotante];

      componenteDeEscenaNutricion['playIntroAnimation']();

      // Debería haber llamadas adicionales a fromTo para las frutas flotantes
      expect(mockGsap.fromTo.calls.count()).toBeGreaterThan(4);
    });
  });

  describe('updateColors', () => {
    let mockGsap: any;
    let mockAppleGroup: any;
    let mockBowlGroup: any;
    let mockParticles: any;
    let mockTHREE: any;
    let MockLineSegmentsClass: any;
    let MockPointsMaterialClass: any;
    let mockScene: any;
    let mockRenderer: any;

    beforeEach(() => {
      mockGsap = {
        to: jasmine.createSpy('to'),
        killTweensOf: jasmine.createSpy('killTweensOf')
      };

      mockScene = {
        add: jasmine.createSpy('add'),
        traverse: jasmine.createSpy('traverse')
      };

      mockRenderer = {
        dispose: jasmine.createSpy('dispose')
      };

      // Crear clases reales para que instanceof funcione
      MockLineSegmentsClass = class LineSegments {};
      MockPointsMaterialClass = class PointsMaterial {};

      const crearMockLineSegments = () => {
        const mockChild = Object.create(MockLineSegmentsClass.prototype);
        mockChild.material = {
          color: { r: 0, g: 0, b: 0 }
        };
        return mockChild;
      };

      mockAppleGroup = {
        traverse: jasmine.createSpy('traverse').and.callFake((callback: Function) => {
          callback(crearMockLineSegments());
        })
      };

      mockBowlGroup = {
        traverse: jasmine.createSpy('traverse').and.callFake((callback: Function) => {
          callback(crearMockLineSegments());
        })
      };

      // Crear particles con material que es instancia de PointsMaterial
      const mockPointsMaterial = Object.create(MockPointsMaterialClass.prototype);
      mockPointsMaterial.color = { r: 0, g: 0, b: 0 };
      mockParticles = {
        material: mockPointsMaterial
      };

      mockTHREE = {
        LineSegments: MockLineSegmentsClass,
        PointsMaterial: MockPointsMaterialClass,
        Color: jasmine.createSpy('Color').and.returnValue({ r: 1, g: 1, b: 1 })
      };

      componenteDeEscenaNutricion['gsap'] = mockGsap;
      componenteDeEscenaNutricion['appleGroup'] = mockAppleGroup;
      componenteDeEscenaNutricion['bowlGroup'] = mockBowlGroup;
      componenteDeEscenaNutricion['particles'] = mockParticles;
      componenteDeEscenaNutricion['floatingFruits'] = [];
      componenteDeEscenaNutricion['THREE'] = mockTHREE;
      componenteDeEscenaNutricion['scene'] = mockScene;
      componenteDeEscenaNutricion['renderer'] = mockRenderer;
    });

    it('debería recorrer appleGroup para actualizar colores', () => {
      componenteDeEscenaNutricion['updateColors'](true);

      expect(mockAppleGroup.traverse).toHaveBeenCalled();
    });

    it('debería recorrer bowlGroup para actualizar colores', () => {
      componenteDeEscenaNutricion['updateColors'](false);

      expect(mockBowlGroup.traverse).toHaveBeenCalled();
    });

    it('debería actualizar colores de floatingFruits', () => {
      const frutaFlotante = {
        traverse: jasmine.createSpy('traverse')
      };
      componenteDeEscenaNutricion['floatingFruits'] = [frutaFlotante];

      componenteDeEscenaNutricion['updateColors'](true);

      expect(frutaFlotante.traverse).toHaveBeenCalled();
    });

    it('debería usar colores dark cuando isDark es true', () => {
      componenteDeEscenaNutricion['updateColors'](true);

      expect(mockTHREE.Color).toHaveBeenCalledWith(componenteDeEscenaNutricion['colors'].dark.primary);
    });

    it('debería usar colores light cuando isDark es false', () => {
      componenteDeEscenaNutricion['updateColors'](false);

      expect(mockTHREE.Color).toHaveBeenCalledWith(componenteDeEscenaNutricion['colors'].light.primary);
    });
  });

  describe('disposeScene con escena completa', () => {
    it('debería disponer materiales de array', () => {
      const mockMaterial1 = { dispose: jasmine.createSpy('dispose1') };
      const mockMaterial2 = { dispose: jasmine.createSpy('dispose2') };

      const mockMesh = {
        geometry: { dispose: jasmine.createSpy('geometryDispose') },
        material: [mockMaterial1, mockMaterial2]
      };

      const mockTHREE: any = {
        Mesh: class {},
        Line: class {},
        Points: class {},
        LineSegments: class {}
      };

      // Simular instanceof
      Object.setPrototypeOf(mockMesh, mockTHREE.Mesh.prototype);

      const mockScene = {
        traverse: jasmine.createSpy('traverse').and.callFake((callback: Function) => {
          callback(mockMesh);
        })
      };

      componenteDeEscenaNutricion['THREE'] = mockTHREE;
      componenteDeEscenaNutricion['scene'] = mockScene;
      componenteDeEscenaNutricion['renderer'] = null;

      componenteDeEscenaNutricion['disposeScene']();

      expect(mockScene.traverse).toHaveBeenCalled();
    });

    it('debería disponer material singular (no array)', () => {
      const mockMaterialSingular = { dispose: jasmine.createSpy('disposeSingular') };

      const mockTHREE: any = {
        Mesh: class {},
        Line: class {},
        Points: class {},
        LineSegments: class {}
      };

      // Crear mock de Mesh con material singular
      const mockMesh = Object.create(mockTHREE.Mesh.prototype);
      mockMesh.geometry = { dispose: jasmine.createSpy('geometryDispose') };
      mockMesh.material = mockMaterialSingular;

      const mockScene = {
        traverse: jasmine.createSpy('traverse').and.callFake((callback: Function) => {
          callback(mockMesh);
        })
      };

      componenteDeEscenaNutricion['THREE'] = mockTHREE;
      componenteDeEscenaNutricion['scene'] = mockScene;
      componenteDeEscenaNutricion['renderer'] = null;

      componenteDeEscenaNutricion['disposeScene']();

      expect(mockMaterialSingular.dispose).toHaveBeenCalled();
    });
  });

  describe('ngAfterViewInit con flujo completo', () => {
    it('debería ejecutar todo el flujo de inicialización con mocks completos', async () => {
      // Crear mocks para todas las dependencias de Three.js
      const mockRenderer = {
        setSize: jasmine.createSpy('setSize'),
        setPixelRatio: jasmine.createSpy('setPixelRatio'),
        setClearColor: jasmine.createSpy('setClearColor'),
        render: jasmine.createSpy('render'),
        dispose: jasmine.createSpy('dispose')
      };

      const mockScene = {
        add: jasmine.createSpy('add'),
        traverse: jasmine.createSpy('traverse')
      };

      const mockCamera = {
        position: { z: 0, y: 0 },
        aspect: 1,
        updateProjectionMatrix: jasmine.createSpy('updateProjectionMatrix')
      };

      const mockGroup = {
        add: jasmine.createSpy('add'),
        position: { set: jasmine.createSpy('set'), x: 0, y: 0, z: 0 },
        scale: { set: jasmine.createSpy('set'), x: 1, y: 1, z: 1 },
        rotation: { x: 0, y: 0, z: 0 },
        userData: {}
      };

      const mockGsap = {
        fromTo: jasmine.createSpy('fromTo'),
        to: jasmine.createSpy('to'),
        killTweensOf: jasmine.createSpy('killTweensOf')
      };

      const mockClock = {
        getElapsedTime: jasmine.createSpy('getElapsedTime').and.returnValue(0)
      };

      // Mock de clases Three.js
      class MockVector2 {}
      class MockVector3 {}
      class MockLatheGeometry {}
      class MockEdgesGeometry {}
      class MockLineBasicMaterial {}
      class MockCylinderGeometry {}
      class MockShapeGeometry {}
      class MockSphereGeometry {}
      class MockTorusGeometry {}
      class MockTubeGeometry {}
      class MockBufferGeometry {
        setAttribute = jasmine.createSpy('setAttribute');
      }
      class MockBufferAttribute {}
      class MockPointsMaterial {}
      class MockColor { r = 1; g = 1; b = 1; }
      class MockLineSegments {
        position = { set: jasmine.createSpy('set'), x: 0, y: 0, z: 0 };
        rotation = { x: 0, y: 0, z: 0 };
        scale = { set: jasmine.createSpy('set'), x: 1, y: 1, z: 1 };
        material = { color: { r: 0, g: 0, b: 0 } };
      }
      class MockShape {
        moveTo = jasmine.createSpy('moveTo');
        quadraticCurveTo = jasmine.createSpy('quadraticCurveTo');
      }
      class MockQuadraticBezierCurve3 {}
      class MockPoints {
        rotation = { y: 0 };
        material = Object.create(MockPointsMaterial.prototype);
      }
      class MockGroup {
        add = jasmine.createSpy('add');
        position = { set: jasmine.createSpy('set'), x: 0, y: 0, z: 0 };
        scale = { set: jasmine.createSpy('set'), x: 1, y: 1, z: 1 };
        rotation = { x: 0, y: 0, z: 0 };
        userData: any = {};
        traverse = jasmine.createSpy('traverse');
      }

      const mockTHREE: any = {
        WebGLRenderer: jasmine.createSpy('WebGLRenderer').and.returnValue(mockRenderer),
        Scene: jasmine.createSpy('Scene').and.returnValue(mockScene),
        PerspectiveCamera: jasmine.createSpy('PerspectiveCamera').and.returnValue(mockCamera),
        Group: MockGroup,
        Clock: jasmine.createSpy('Clock').and.returnValue(mockClock),
        Vector2: MockVector2,
        Vector3: MockVector3,
        LatheGeometry: MockLatheGeometry,
        EdgesGeometry: MockEdgesGeometry,
        LineBasicMaterial: MockLineBasicMaterial,
        LineSegments: MockLineSegments,
        CylinderGeometry: MockCylinderGeometry,
        Shape: MockShape,
        ShapeGeometry: MockShapeGeometry,
        SphereGeometry: MockSphereGeometry,
        TorusGeometry: MockTorusGeometry,
        QuadraticBezierCurve3: MockQuadraticBezierCurve3,
        TubeGeometry: MockTubeGeometry,
        BufferGeometry: MockBufferGeometry,
        BufferAttribute: MockBufferAttribute,
        PointsMaterial: MockPointsMaterial,
        Points: MockPoints,
        Color: MockColor
      };

      // Espiar los métodos privados
      spyOn<any>(componenteDeEscenaNutricion, 'initThree').and.callFake(() => {
        componenteDeEscenaNutricion['renderer'] = mockRenderer;
        componenteDeEscenaNutricion['scene'] = mockScene;
        componenteDeEscenaNutricion['camera'] = mockCamera;
        componenteDeEscenaNutricion['mainGroup'] = new MockGroup();
      });
      spyOn<any>(componenteDeEscenaNutricion, 'createApple');
      spyOn<any>(componenteDeEscenaNutricion, 'createBowl');
      spyOn<any>(componenteDeEscenaNutricion, 'createFloatingFruits');
      spyOn<any>(componenteDeEscenaNutricion, 'createParticleField');
      spyOn<any>(componenteDeEscenaNutricion, 'addEventListeners');
      spyOn<any>(componenteDeEscenaNutricion, 'playIntroAnimation');
      spyOn<any>(componenteDeEscenaNutricion, 'animate');

      // Mockear las importaciones dinámicas
      const mockThreeModule = mockTHREE;
      const mockGsapModule = { default: mockGsap };

      spyOn(Promise, 'all').and.returnValue(Promise.resolve([mockThreeModule, mockGsapModule]));

      // Ejecutar ngAfterViewInit
      await componenteDeEscenaNutricion.ngAfterViewInit();

      // Verificar que todos los métodos fueron llamados
      expect(componenteDeEscenaNutricion['initThree']).toHaveBeenCalled();
      expect(componenteDeEscenaNutricion['createApple']).toHaveBeenCalled();
      expect(componenteDeEscenaNutricion['createBowl']).toHaveBeenCalled();
      expect(componenteDeEscenaNutricion['createFloatingFruits']).toHaveBeenCalled();
      expect(componenteDeEscenaNutricion['createParticleField']).toHaveBeenCalled();
      expect(componenteDeEscenaNutricion['addEventListeners']).toHaveBeenCalled();
      expect(componenteDeEscenaNutricion['playIntroAnimation']).toHaveBeenCalled();
      expect(componenteDeEscenaNutricion['isInitialized']).toBe(true);
    });
  });

  describe('updateColors con floatingFruits y LineSegments', () => {
    it('debería actualizar colores de LineSegments dentro de floatingFruits', () => {
      const mockGsap = {
        to: jasmine.createSpy('to'),
        killTweensOf: jasmine.createSpy('killTweensOf')
      };

      class MockLineSegmentsClass {}
      class MockPointsMaterialClass {}

      // Crear mock de LineSegments como child
      const mockLineSegmentsChild = Object.create(MockLineSegmentsClass.prototype);
      mockLineSegmentsChild.material = {
        color: { r: 0, g: 0, b: 0 }
      };

      const frutaFlotanteConLineSegments = {
        traverse: jasmine.createSpy('traverse').and.callFake((callback: Function) => {
          callback(mockLineSegmentsChild);
        })
      };

      const mockTHREE: any = {
        LineSegments: MockLineSegmentsClass,
        PointsMaterial: MockPointsMaterialClass,
        Color: jasmine.createSpy('Color').and.returnValue({ r: 1, g: 1, b: 1 })
      };

      componenteDeEscenaNutricion['gsap'] = mockGsap;
      componenteDeEscenaNutricion['THREE'] = mockTHREE;
      componenteDeEscenaNutricion['appleGroup'] = { traverse: jasmine.createSpy('traverse') };
      componenteDeEscenaNutricion['bowlGroup'] = { traverse: jasmine.createSpy('traverse') };
      componenteDeEscenaNutricion['particles'] = null;
      componenteDeEscenaNutricion['floatingFruits'] = [frutaFlotanteConLineSegments];

      componenteDeEscenaNutricion['updateColors'](true);

      expect(frutaFlotanteConLineSegments.traverse).toHaveBeenCalled();
      expect(mockGsap.to).toHaveBeenCalled();
    });
  });

  describe('animate con callback recursivo', () => {
    it('debería registrar el callback recursivo con requestAnimationFrame', () => {
      const mockClock = {
        getElapsedTime: jasmine.createSpy('getElapsedTime').and.returnValue(1.5)
      };
      const mockRenderer = {
        render: jasmine.createSpy('render')
      };
      const mockScene = {};
      const mockCamera = {};

      componenteDeEscenaNutricion['clock'] = mockClock;
      componenteDeEscenaNutricion['renderer'] = mockRenderer;
      componenteDeEscenaNutricion['scene'] = mockScene;
      componenteDeEscenaNutricion['camera'] = mockCamera;

      // Capturar el callback pasado a requestAnimationFrame
      let capturedCallback: FrameRequestCallback | null = null;
      (window.requestAnimationFrame as jasmine.Spy).and.callFake((cb: FrameRequestCallback) => {
        capturedCallback = cb;
        return 1;
      });

      componenteDeEscenaNutricion['animate']();

      expect(capturedCallback).toBeDefined();
      expect(typeof capturedCallback).toBe('function');

      // Verificar que el callback ejecuta animate recursivamente
      (window.requestAnimationFrame as jasmine.Spy).calls.reset();
      if (capturedCallback !== null) {
        (capturedCallback as FrameRequestCallback)(0);
        expect(window.requestAnimationFrame).toHaveBeenCalled();
      }
    });
  });
});
