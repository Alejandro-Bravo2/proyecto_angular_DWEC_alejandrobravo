import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { NgZone, PLATFORM_ID } from '@angular/core';
import { ThreeSceneComponent } from './three-scene.component';
import { ThemeService } from '../../../core/services/theme.service';
import { signal } from '@angular/core';

describe('ThreeSceneComponent', () => {
  let componenteDeEscenaTres: ThreeSceneComponent;
  let fixture: ComponentFixture<ThreeSceneComponent>;
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
      imports: [ThreeSceneComponent],
      providers: [
        { provide: ThemeService, useValue: servicioMockDeTema },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    // Mock de funciones globales
    spyOn(window, 'requestAnimationFrame').and.callFake(requestAnimationFrameMock as any);
    spyOn(window, 'cancelAnimationFrame').and.callFake(cancelAnimationFrameMock);
    (window as any).ResizeObserver = ResizeObserverMock;

    fixture = TestBed.createComponent(ThreeSceneComponent);
    componenteDeEscenaTres = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Creación del componente', () => {
    it('debería crear el componente correctamente', () => {
      expect(componenteDeEscenaTres).toBeTruthy();
    });

    it('debería tener la referencia al canvas', () => {
      expect(componenteDeEscenaTres.canvasRef).toBeDefined();
      expect(componenteDeEscenaTres.canvasRef.nativeElement).toBeInstanceOf(HTMLCanvasElement);
    });
  });

  describe('Constructor y effect del tema', () => {
    it('debería configurar el effect para cambios de tema', () => {
      expect(servicioMockDeTema.currentTheme).toBeDefined();
    });

    it('debería NO actualizar colores si no está inicializado', () => {
      spyOn<any>(componenteDeEscenaTres, 'updateColors');
      signalDeTemaSimulado.set('dark');
      fixture.detectChanges();
      expect(componenteDeEscenaTres['updateColors']).not.toHaveBeenCalled();
    });
  });

  describe('ngAfterViewInit', () => {
    it('debería retornar early si el canvas no está disponible', async () => {
      componenteDeEscenaTres.canvasRef = null as any;
      spyOn(console, 'error');

      await componenteDeEscenaTres.ngAfterViewInit();

      expect(console.error).toHaveBeenCalledWith('ThreeSceneComponent: Canvas element not found');
    });

    it('debería intentar cargar módulos cuando el canvas está disponible', async () => {
      // Este test verifica que ngAfterViewInit intenta cargar Three.js
      // En ambiente de test, WebGL puede no estar disponible
      try {
        await componenteDeEscenaTres.ngAfterViewInit();
        // Si llega aquí, Three.js se cargó correctamente (posible en algunos ambientes)
        expect(componenteDeEscenaTres.canvasRef).toBeDefined();
      } catch (error: any) {
        // En Chrome Headless, WebGL no está disponible y esto es esperado
        expect(error.message).toContain('WebGL');
      }
    });
  });

  describe('ngOnDestroy', () => {
    it('debería cancelar el frame de animación cuando existe', () => {
      componenteDeEscenaTres['frameId'] = 123;

      componenteDeEscenaTres.ngOnDestroy();

      expect(window.cancelAnimationFrame).toHaveBeenCalledWith(123);
    });

    it('debería NO cancelar frame si frameId es 0', () => {
      componenteDeEscenaTres['frameId'] = 0;
      (window.cancelAnimationFrame as jasmine.Spy).calls.reset();

      componenteDeEscenaTres.ngOnDestroy();

      expect(window.cancelAnimationFrame).not.toHaveBeenCalled();
    });

    it('debería remover event listeners', () => {
      spyOn(window, 'removeEventListener');

      componenteDeEscenaTres.ngOnDestroy();

      expect(window.removeEventListener).toHaveBeenCalledWith('resize', componenteDeEscenaTres['boundOnWindowResize']);
      expect(window.removeEventListener).toHaveBeenCalledWith('mousemove', componenteDeEscenaTres['boundOnMouseMove']);
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

      componenteDeEscenaTres['gsap'] = mockGsap;
      componenteDeEscenaTres['mainGroup'] = mockMainGroup;

      componenteDeEscenaTres.ngOnDestroy();

      expect(mockGsap.killTweensOf).toHaveBeenCalledWith(mockMainGroup.position);
      expect(mockGsap.killTweensOf).toHaveBeenCalledWith(mockMainGroup.rotation);
      expect(mockGsap.killTweensOf).toHaveBeenCalledWith(mockMainGroup.scale);
    });

    it('no debería fallar si gsap es null', () => {
      componenteDeEscenaTres['gsap'] = null;

      expect(() => componenteDeEscenaTres.ngOnDestroy()).not.toThrow();
    });

    it('debería llamar a disposeScene', () => {
      spyOn<any>(componenteDeEscenaTres, 'disposeScene');

      componenteDeEscenaTres.ngOnDestroy();

      expect(componenteDeEscenaTres['disposeScene']).toHaveBeenCalled();
    });
  });

  describe('disposeScene', () => {
    it('debería retornar early si THREE no está definido', () => {
      componenteDeEscenaTres['THREE'] = null as any;
      const mockScene = { traverse: jasmine.createSpy('traverse') };
      componenteDeEscenaTres['scene'] = mockScene;

      componenteDeEscenaTres['disposeScene']();

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

      componenteDeEscenaTres['THREE'] = mockTHREE;
      componenteDeEscenaTres['renderer'] = mockRenderer;
      componenteDeEscenaTres['scene'] = null;

      componenteDeEscenaTres['disposeScene']();

      expect(mockRenderer.dispose).toHaveBeenCalled();
    });
  });

  describe('getColors', () => {
    it('debería retornar colores dark cuando el tema es dark', () => {
      signalDeTemaSimulado.set('dark');

      const coloresObtenidos = componenteDeEscenaTres['getColors']();

      expect(coloresObtenidos).toEqual(componenteDeEscenaTres['colors'].dark);
    });

    it('debería retornar colores light cuando el tema es light', () => {
      signalDeTemaSimulado.set('light');

      const coloresObtenidos = componenteDeEscenaTres['getColors']();

      expect(coloresObtenidos).toEqual(componenteDeEscenaTres['colors'].light);
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

      componenteDeEscenaTres['camera'] = mockCamera;
      componenteDeEscenaTres['renderer'] = mockRenderer;

      componenteDeEscenaTres['onWindowResize']();

      expect(mockCamera.updateProjectionMatrix).toHaveBeenCalled();
      expect(mockRenderer.setSize).toHaveBeenCalled();
    });
  });

  describe('onMouseMove', () => {
    it('debería actualizar mouseX y mouseY correctamente', () => {
      const eventoSimuladoDeMouse = new MouseEvent('mousemove', {
        clientX: 500,
        clientY: 300
      });

      Object.defineProperty(window, 'innerWidth', { value: 1000, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });

      componenteDeEscenaTres['onMouseMove'](eventoSimuladoDeMouse);

      // mouseX = (500 / 1000) * 2 - 1 = 0
      // mouseY = (300 / 600) * 2 - 1 = 0
      expect(componenteDeEscenaTres['mouseX']).toBe(0);
      expect(componenteDeEscenaTres['mouseY']).toBe(0);
    });

    it('debería calcular valores negativos para coordenadas pequeñas', () => {
      const eventoSimuladoDeMouse = new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 100
      });

      Object.defineProperty(window, 'innerWidth', { value: 1000, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });

      componenteDeEscenaTres['onMouseMove'](eventoSimuladoDeMouse);

      expect(componenteDeEscenaTres['mouseX']).toBeLessThan(0);
      expect(componenteDeEscenaTres['mouseY']).toBeLessThan(0);
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

      componenteDeEscenaTres['clock'] = mockClock;
      componenteDeEscenaTres['renderer'] = mockRenderer;
      componenteDeEscenaTres['scene'] = mockScene;
      componenteDeEscenaTres['camera'] = mockCamera;

      componenteDeEscenaTres['animate']();

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

      componenteDeEscenaTres['mainGroup'] = mockMainGroup;
      componenteDeEscenaTres['mouseX'] = 0.5;
      componenteDeEscenaTres['mouseY'] = 0.3;
      componenteDeEscenaTres['clock'] = mockClock;
      componenteDeEscenaTres['renderer'] = mockRenderer;
      componenteDeEscenaTres['scene'] = {};
      componenteDeEscenaTres['camera'] = {};

      componenteDeEscenaTres['animate']();

      expect(mockMainGroup.rotation.y).not.toBe(0);
    });

    it('debería manejar centralSphere si existe', () => {
      const mockCentralSphere = {
        rotation: { x: 0, y: 0, z: 0 }
      };
      const mockClock = {
        getElapsedTime: jasmine.createSpy('getElapsedTime').and.returnValue(1.5)
      };
      const mockRenderer = {
        render: jasmine.createSpy('render')
      };

      componenteDeEscenaTres['centralSphere'] = mockCentralSphere;
      componenteDeEscenaTres['clock'] = mockClock;
      componenteDeEscenaTres['renderer'] = mockRenderer;
      componenteDeEscenaTres['scene'] = {};
      componenteDeEscenaTres['camera'] = {};

      const rotacionInicialY = mockCentralSphere.rotation.y;

      componenteDeEscenaTres['animate']();

      expect(mockCentralSphere.rotation.y).toBeGreaterThan(rotacionInicialY);
    });

    it('debería animar orbitingObjects si existen', () => {
      const objetoOrbitante = {
        userData: {
          orbitRadius: 3,
          orbitSpeed: 0.5,
          orbitAngle: 0,
          yOffset: 0,
          orbitTilt: 0.15
        },
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0 }
      };

      const mockClock = {
        getElapsedTime: jasmine.createSpy('getElapsedTime').and.returnValue(1.5)
      };
      const mockRenderer = {
        render: jasmine.createSpy('render')
      };

      componenteDeEscenaTres['orbitingObjects'] = [objetoOrbitante];
      componenteDeEscenaTres['clock'] = mockClock;
      componenteDeEscenaTres['renderer'] = mockRenderer;
      componenteDeEscenaTres['scene'] = {};
      componenteDeEscenaTres['camera'] = {};

      const anguloInicial = objetoOrbitante.userData.orbitAngle;

      componenteDeEscenaTres['animate']();

      expect(objetoOrbitante.userData.orbitAngle).not.toBe(anguloInicial);
      expect(objetoOrbitante.rotation.x).toBeGreaterThan(0);
      expect(objetoOrbitante.rotation.y).toBeGreaterThan(0);
    });

    it('debería animar particles si existen', () => {
      const mockParticles = {
        rotation: { x: 0, y: 0 }
      };
      const mockClock = {
        getElapsedTime: jasmine.createSpy('getElapsedTime').and.returnValue(1.5)
      };
      const mockRenderer = {
        render: jasmine.createSpy('render')
      };

      componenteDeEscenaTres['particles'] = mockParticles;
      componenteDeEscenaTres['clock'] = mockClock;
      componenteDeEscenaTres['renderer'] = mockRenderer;
      componenteDeEscenaTres['scene'] = {};
      componenteDeEscenaTres['camera'] = {};

      componenteDeEscenaTres['animate']();

      expect(mockParticles.rotation.y).toBeGreaterThan(0);
    });

    it('debería animar connectionLines si existen', () => {
      const mockConnectionLines = {
        rotation: { y: 0 }
      };
      const mockClock = {
        getElapsedTime: jasmine.createSpy('getElapsedTime').and.returnValue(1.5)
      };
      const mockRenderer = {
        render: jasmine.createSpy('render')
      };

      componenteDeEscenaTres['connectionLines'] = mockConnectionLines;
      componenteDeEscenaTres['clock'] = mockClock;
      componenteDeEscenaTres['renderer'] = mockRenderer;
      componenteDeEscenaTres['scene'] = {};
      componenteDeEscenaTres['camera'] = {};

      componenteDeEscenaTres['animate']();

      expect(mockConnectionLines.rotation.y).toBeGreaterThan(0);
    });
  });

  describe('addEventListeners', () => {
    it('debería agregar event listeners a window', () => {
      spyOn(window, 'addEventListener');

      componenteDeEscenaTres['addEventListeners']();

      expect(window.addEventListener).toHaveBeenCalledWith('resize', componenteDeEscenaTres['boundOnWindowResize']);
      expect(window.addEventListener).toHaveBeenCalledWith('mousemove', componenteDeEscenaTres['boundOnMouseMove']);
    });
  });

  describe('Integración con ThemeService', () => {
    it('debería actualizar colores cuando el tema cambia después de inicializar', () => {
      componenteDeEscenaTres['isInitialized'] = true;

      // Mock mínimo de updateColors
      spyOn<any>(componenteDeEscenaTres, 'updateColors');

      signalDeTemaSimulado.set('dark');
      fixture.detectChanges();

      expect(componenteDeEscenaTres['updateColors']).toHaveBeenCalledWith(true);
    });

    it('debería actualizar a light cuando se cambia el tema', () => {
      componenteDeEscenaTres['isInitialized'] = true;
      spyOn<any>(componenteDeEscenaTres, 'updateColors');

      signalDeTemaSimulado.set('light');
      fixture.detectChanges();

      expect(componenteDeEscenaTres['updateColors']).toHaveBeenCalledWith(false);
    });
  });

  describe('Propiedades privadas', () => {
    it('debería tener colores definidos para light y dark', () => {
      expect(componenteDeEscenaTres['colors'].light).toBeDefined();
      expect(componenteDeEscenaTres['colors'].dark).toBeDefined();
      expect(componenteDeEscenaTres['colors'].light.primary).toBe('#000000');
      expect(componenteDeEscenaTres['colors'].dark.primary).toBe('#ffffff');
    });

    it('debería inicializar con isInitialized en false', () => {
      expect(componenteDeEscenaTres['isInitialized']).toBe(false);
    });

    it('debería inicializar arrays vacíos para orbitingObjects', () => {
      expect(componenteDeEscenaTres['orbitingObjects']).toEqual([]);
    });

    it('debería tener funciones bound creadas', () => {
      expect(componenteDeEscenaTres['boundOnWindowResize']).toBeDefined();
      expect(componenteDeEscenaTres['boundOnMouseMove']).toBeDefined();
      expect(typeof componenteDeEscenaTres['boundOnWindowResize']).toBe('function');
      expect(typeof componenteDeEscenaTres['boundOnMouseMove']).toBe('function');
    });
  });

  describe('initThree', () => {
    let mockTHREE: any;
    let mockWebGLRenderer: any;
    let mockScene: any;
    let mockPerspectiveCamera: any;
    let mockGroup: any;

    beforeEach(() => {
      mockScene = {
        add: jasmine.createSpy('add'),
        traverse: jasmine.createSpy('traverse')
      };
      mockWebGLRenderer = {
        setSize: jasmine.createSpy('setSize'),
        setPixelRatio: jasmine.createSpy('setPixelRatio'),
        setClearColor: jasmine.createSpy('setClearColor'),
        dispose: jasmine.createSpy('dispose')
      };
      mockPerspectiveCamera = {
        position: { z: 0, y: 0 }
      };
      mockGroup = {};

      mockTHREE = {
        WebGLRenderer: jasmine.createSpy('WebGLRenderer').and.returnValue(mockWebGLRenderer),
        Scene: jasmine.createSpy('Scene').and.returnValue(mockScene),
        PerspectiveCamera: jasmine.createSpy('PerspectiveCamera').and.returnValue(mockPerspectiveCamera),
        Group: jasmine.createSpy('Group').and.returnValue(mockGroup)
      };

      componenteDeEscenaTres['THREE'] = mockTHREE;

      // Agregar parentElement mock al canvas
      const canvasElement = componenteDeEscenaTres.canvasRef.nativeElement;
      Object.defineProperty(canvasElement, 'parentElement', {
        value: { clientWidth: 800, clientHeight: 600 },
        configurable: true
      });
    });

    it('debería crear el renderer, scene y camera', () => {
      componenteDeEscenaTres['initThree']();

      expect(mockTHREE.WebGLRenderer).toHaveBeenCalled();
      expect(mockTHREE.Scene).toHaveBeenCalled();
      expect(mockTHREE.PerspectiveCamera).toHaveBeenCalled();
    });

    it('debería configurar el renderer correctamente', () => {
      componenteDeEscenaTres['initThree']();

      expect(mockWebGLRenderer.setSize).toHaveBeenCalled();
      expect(mockWebGLRenderer.setPixelRatio).toHaveBeenCalled();
      expect(mockWebGLRenderer.setClearColor).toHaveBeenCalledWith(0x000000, 0);
    });

    it('debería crear el mainGroup y agregarlo a la escena', () => {
      componenteDeEscenaTres['initThree']();

      expect(mockTHREE.Group).toHaveBeenCalled();
      expect(mockScene.add).toHaveBeenCalledWith(mockGroup);
    });

    it('debería posicionar la cámara correctamente', () => {
      componenteDeEscenaTres['initThree']();

      expect(mockPerspectiveCamera.position.z).toBe(8);
      expect(mockPerspectiveCamera.position.y).toBe(1);
    });
  });

  describe('createCentralStructure', () => {
    let mockTHREE: any;
    let mockMainGroup: any;
    let mockCentralSphere: any;

    beforeEach(() => {
      mockMainGroup = {
        add: jasmine.createSpy('add')
      };
      mockCentralSphere = {
        add: jasmine.createSpy('add'),
        scale: { set: jasmine.createSpy('set') }
      };

      const mockGeometry = {};
      const mockEdgesGeometry = {};
      const mockMaterial = { clone: () => ({}) };
      const mockLineSegments = { rotation: { z: 0 }, position: { x: 0 } };

      mockTHREE = {
        Group: jasmine.createSpy('Group').and.returnValue(mockCentralSphere),
        CylinderGeometry: jasmine.createSpy('CylinderGeometry').and.returnValue(mockGeometry),
        EdgesGeometry: jasmine.createSpy('EdgesGeometry').and.returnValue(mockEdgesGeometry),
        LineBasicMaterial: jasmine.createSpy('LineBasicMaterial').and.returnValue(mockMaterial),
        LineSegments: jasmine.createSpy('LineSegments').and.returnValue(mockLineSegments),
        TorusGeometry: jasmine.createSpy('TorusGeometry').and.returnValue(mockGeometry),
        Color: jasmine.createSpy('Color').and.returnValue({ r: 0, g: 0, b: 0 })
      };

      componenteDeEscenaTres['THREE'] = mockTHREE;
      componenteDeEscenaTres['mainGroup'] = mockMainGroup;
    });

    it('debería crear el grupo de centralSphere', () => {
      componenteDeEscenaTres['createCentralStructure']();

      expect(mockTHREE.Group).toHaveBeenCalled();
    });

    it('debería crear geometrías para la barra y los discos', () => {
      componenteDeEscenaTres['createCentralStructure']();

      expect(mockTHREE.CylinderGeometry).toHaveBeenCalled();
      expect(mockTHREE.EdgesGeometry).toHaveBeenCalled();
    });

    it('debería agregar la estructura central al mainGroup', () => {
      componenteDeEscenaTres['createCentralStructure']();

      expect(mockMainGroup.add).toHaveBeenCalled();
    });

    it('debería crear los agarres de la barra', () => {
      componenteDeEscenaTres['createCentralStructure']();

      expect(mockTHREE.TorusGeometry).toHaveBeenCalled();
    });

    it('debería configurar la escala inicial', () => {
      componenteDeEscenaTres['createCentralStructure']();

      expect(mockCentralSphere.scale.set).toHaveBeenCalledWith(1, 1, 1);
    });
  });

  describe('createOrbitingElements', () => {
    let mockTHREE: any;
    let mockScene: any;

    beforeEach(() => {
      mockScene = {
        add: jasmine.createSpy('add'),
        traverse: jasmine.createSpy('traverse')
      };

      const mockVector3 = function(x: number, y: number, z: number) {
        return { x, y, z };
      };
      const mockGeometry: any = { setFromPoints: jasmine.createSpy('setFromPoints') };
      mockGeometry.setFromPoints.and.returnValue(mockGeometry);
      const mockEdgesGeometry = {};
      const mockMaterial = {};
      const mockLine = { rotation: { x: 0 } };
      const mockGroup = {
        add: jasmine.createSpy('add'),
        position: { x: 0, y: 0, z: 0 },
        userData: {}
      };
      const mockLineSegments = {
        rotation: { x: 0, y: 0, z: 0 }
      };

      mockTHREE = {
        Vector3: mockVector3,
        BufferGeometry: jasmine.createSpy('BufferGeometry').and.returnValue(mockGeometry),
        LineBasicMaterial: jasmine.createSpy('LineBasicMaterial').and.returnValue(mockMaterial),
        Line: jasmine.createSpy('Line').and.returnValue(mockLine),
        Group: jasmine.createSpy('Group').and.returnValue(mockGroup),
        CylinderGeometry: jasmine.createSpy('CylinderGeometry').and.returnValue({}),
        EdgesGeometry: jasmine.createSpy('EdgesGeometry').and.returnValue(mockEdgesGeometry),
        LineSegments: jasmine.createSpy('LineSegments').and.returnValue(mockLineSegments),
        TorusGeometry: jasmine.createSpy('TorusGeometry').and.returnValue({}),
        Color: jasmine.createSpy('Color').and.returnValue({ r: 0, g: 0, b: 0 })
      };

      componenteDeEscenaTres['THREE'] = mockTHREE;
      componenteDeEscenaTres['scene'] = mockScene;
      componenteDeEscenaTres['orbitingObjects'] = [];
      componenteDeEscenaTres['renderer'] = { dispose: jasmine.createSpy('dispose') };
    });

    it('debería crear elementos orbitantes', () => {
      componenteDeEscenaTres['createOrbitingElements']();

      expect(mockTHREE.Group).toHaveBeenCalled();
    });

    it('debería crear anillos de órbita visibles', () => {
      componenteDeEscenaTres['createOrbitingElements']();

      expect(mockTHREE.BufferGeometry).toHaveBeenCalled();
      expect(mockTHREE.Line).toHaveBeenCalled();
    });

    it('debería agregar los elementos a la escena', () => {
      componenteDeEscenaTres['createOrbitingElements']();

      expect(mockScene.add).toHaveBeenCalled();
    });

    it('debería agregar elementos al array orbitingObjects', () => {
      componenteDeEscenaTres['createOrbitingElements']();

      expect(componenteDeEscenaTres['orbitingObjects'].length).toBeGreaterThan(0);
    });
  });

  describe('createParticleField', () => {
    let mockTHREE: any;
    let mockScene: any;
    let mockParticles: any;

    beforeEach(() => {
      mockScene = {
        add: jasmine.createSpy('add'),
        traverse: jasmine.createSpy('traverse')
      };
      mockParticles = {};

      const mockGeometry = {
        setAttribute: jasmine.createSpy('setAttribute')
      };

      mockTHREE = {
        BufferGeometry: jasmine.createSpy('BufferGeometry').and.returnValue(mockGeometry),
        BufferAttribute: jasmine.createSpy('BufferAttribute').and.returnValue({}),
        PointsMaterial: jasmine.createSpy('PointsMaterial').and.returnValue({}),
        Points: jasmine.createSpy('Points').and.returnValue(mockParticles),
        Color: jasmine.createSpy('Color').and.returnValue({ r: 0, g: 0, b: 0 })
      };

      componenteDeEscenaTres['THREE'] = mockTHREE;
      componenteDeEscenaTres['scene'] = mockScene;
    });

    it('debería crear el campo de partículas', () => {
      componenteDeEscenaTres['createParticleField']();

      expect(mockTHREE.BufferGeometry).toHaveBeenCalled();
      expect(mockTHREE.PointsMaterial).toHaveBeenCalled();
      expect(mockTHREE.Points).toHaveBeenCalled();
    });

    it('debería configurar posiciones de partículas', () => {
      componenteDeEscenaTres['createParticleField']();

      expect(mockTHREE.BufferAttribute).toHaveBeenCalled();
    });

    it('debería agregar las partículas a la escena', () => {
      componenteDeEscenaTres['createParticleField']();

      expect(mockScene.add).toHaveBeenCalledWith(mockParticles);
    });

    it('debería guardar la referencia a particles', () => {
      componenteDeEscenaTres['createParticleField']();

      expect(componenteDeEscenaTres['particles']).toBe(mockParticles);
    });
  });

  describe('createConnectionLines', () => {
    let mockTHREE: any;
    let mockMainGroup: any;
    let mockConnectionLines: any;

    beforeEach(() => {
      mockMainGroup = {
        add: jasmine.createSpy('add')
      };
      mockConnectionLines = {};

      const mockGeometry = {
        setAttribute: jasmine.createSpy('setAttribute')
      };

      mockTHREE = {
        BufferGeometry: jasmine.createSpy('BufferGeometry').and.returnValue(mockGeometry),
        Float32BufferAttribute: jasmine.createSpy('Float32BufferAttribute').and.returnValue({}),
        LineBasicMaterial: jasmine.createSpy('LineBasicMaterial').and.returnValue({}),
        LineSegments: jasmine.createSpy('LineSegments').and.returnValue(mockConnectionLines),
        Color: jasmine.createSpy('Color').and.returnValue({ r: 0, g: 0, b: 0 })
      };

      componenteDeEscenaTres['THREE'] = mockTHREE;
      componenteDeEscenaTres['mainGroup'] = mockMainGroup;
    });

    it('debería crear las líneas de conexión', () => {
      componenteDeEscenaTres['createConnectionLines']();

      expect(mockTHREE.BufferGeometry).toHaveBeenCalled();
      expect(mockTHREE.LineBasicMaterial).toHaveBeenCalled();
      expect(mockTHREE.LineSegments).toHaveBeenCalled();
    });

    it('debería agregar las líneas al mainGroup', () => {
      componenteDeEscenaTres['createConnectionLines']();

      expect(mockMainGroup.add).toHaveBeenCalledWith(mockConnectionLines);
    });

    it('debería guardar la referencia a connectionLines', () => {
      componenteDeEscenaTres['createConnectionLines']();

      expect(componenteDeEscenaTres['connectionLines']).toBe(mockConnectionLines);
    });
  });

  describe('playIntroAnimation', () => {
    let mockGsap: any;
    let mockCentralSphere: any;
    let mockParticles: any;
    let mockConnectionLines: any;
    let mockTHREE: any;

    beforeEach(() => {
      mockGsap = {
        fromTo: jasmine.createSpy('fromTo'),
        to: jasmine.createSpy('to'),
        killTweensOf: jasmine.createSpy('killTweensOf')
      };
      mockCentralSphere = {
        scale: { x: 1, y: 1, z: 1 },
        rotation: { y: 0 }
      };
      mockParticles = {
        material: { opacity: 0 }
      };
      mockConnectionLines = {
        material: { opacity: 0 }
      };

      mockTHREE = {
        PointsMaterial: class {},
        LineBasicMaterial: class {}
      };

      // Configurar instanceof checks
      Object.setPrototypeOf(mockParticles.material, mockTHREE.PointsMaterial.prototype);
      Object.setPrototypeOf(mockConnectionLines.material, mockTHREE.LineBasicMaterial.prototype);

      componenteDeEscenaTres['gsap'] = mockGsap;
      componenteDeEscenaTres['THREE'] = mockTHREE;
      componenteDeEscenaTres['centralSphere'] = mockCentralSphere;
      componenteDeEscenaTres['particles'] = mockParticles;
      componenteDeEscenaTres['connectionLines'] = mockConnectionLines;
      componenteDeEscenaTres['orbitingObjects'] = [];
    });

    it('debería animar la escala de centralSphere', () => {
      componenteDeEscenaTres['playIntroAnimation']();

      expect(mockGsap.fromTo).toHaveBeenCalled();
    });

    it('debería animar la rotación de centralSphere', () => {
      componenteDeEscenaTres['playIntroAnimation']();

      expect(mockGsap.to).toHaveBeenCalledWith(
        mockCentralSphere.rotation,
        jasmine.objectContaining({ y: Math.PI * 2 })
      );
    });

    it('debería animar los elementos orbitantes', () => {
      const objetoOrbitante = {
        scale: { x: 0, y: 0, z: 0 }
      };
      componenteDeEscenaTres['orbitingObjects'] = [objetoOrbitante, objetoOrbitante];

      componenteDeEscenaTres['playIntroAnimation']();

      // Se llama fromTo múltiples veces (centralSphere + orbitingObjects)
      expect(mockGsap.fromTo.calls.count()).toBeGreaterThan(1);
    });

    it('debería hacer fade in de las partículas', () => {
      componenteDeEscenaTres['playIntroAnimation']();

      expect(mockGsap.fromTo).toHaveBeenCalledWith(
        mockParticles.material,
        jasmine.objectContaining({ opacity: 0 }),
        jasmine.objectContaining({ opacity: 0.6 })
      );
    });

    it('debería hacer fade in de las líneas de conexión', () => {
      componenteDeEscenaTres['playIntroAnimation']();

      expect(mockGsap.fromTo).toHaveBeenCalledWith(
        mockConnectionLines.material,
        jasmine.objectContaining({ opacity: 0 }),
        jasmine.objectContaining({ opacity: 0.25 })
      );
    });
  });

  describe('updateColors', () => {
    let mockGsap: any;
    let mockTHREE: any;
    let mockCentralSphere: any;
    let mockParticles: any;
    let mockConnectionLines: any;

    beforeEach(() => {
      mockGsap = {
        to: jasmine.createSpy('to'),
        killTweensOf: jasmine.createSpy('killTweensOf')
      };

      mockTHREE = {
        LineSegments: class {},
        PointsMaterial: class {},
        LineBasicMaterial: class {},
        Color: jasmine.createSpy('Color').and.returnValue({ r: 1, g: 1, b: 1 })
      };

      const mockChild = {
        material: { opacity: 1, color: { r: 0, g: 0, b: 0 } }
      };
      Object.setPrototypeOf(mockChild, mockTHREE.LineSegments.prototype);

      mockCentralSphere = {
        children: [mockChild]
      };

      mockParticles = {
        material: { color: { r: 0, g: 0, b: 0 } }
      };
      Object.setPrototypeOf(mockParticles.material, mockTHREE.PointsMaterial.prototype);

      mockConnectionLines = {
        material: { color: { r: 0, g: 0, b: 0 } }
      };
      Object.setPrototypeOf(mockConnectionLines.material, mockTHREE.LineBasicMaterial.prototype);

      componenteDeEscenaTres['gsap'] = mockGsap;
      componenteDeEscenaTres['THREE'] = mockTHREE;
      componenteDeEscenaTres['centralSphere'] = mockCentralSphere;
      componenteDeEscenaTres['particles'] = mockParticles;
      componenteDeEscenaTres['connectionLines'] = mockConnectionLines;
      componenteDeEscenaTres['orbitingObjects'] = [];
    });

    it('debería retornar early si THREE no está definido', () => {
      componenteDeEscenaTres['THREE'] = null as any;

      componenteDeEscenaTres['updateColors'](true);

      expect(mockGsap.to).not.toHaveBeenCalled();
    });

    it('debería retornar early si gsap no está definido', () => {
      componenteDeEscenaTres['gsap'] = null;

      componenteDeEscenaTres['updateColors'](true);

      expect(mockGsap.to).not.toHaveBeenCalled();
    });

    it('debería actualizar colores de la estructura central', () => {
      componenteDeEscenaTres['updateColors'](true);

      expect(mockGsap.to).toHaveBeenCalled();
    });

    it('debería actualizar colores de las partículas', () => {
      componenteDeEscenaTres['updateColors'](true);

      expect(mockGsap.to).toHaveBeenCalledWith(
        mockParticles.material.color,
        jasmine.any(Object)
      );
    });

    it('debería actualizar colores de las líneas de conexión', () => {
      componenteDeEscenaTres['updateColors'](true);

      expect(mockGsap.to).toHaveBeenCalledWith(
        mockConnectionLines.material.color,
        jasmine.any(Object)
      );
    });

    it('debería actualizar elementos orbitantes', () => {
      const mockOrbitChild = {
        material: { color: { r: 0, g: 0, b: 0 } }
      };
      Object.setPrototypeOf(mockOrbitChild, mockTHREE.LineSegments.prototype);

      const objetoOrbitante = {
        children: [mockOrbitChild]
      };
      componenteDeEscenaTres['orbitingObjects'] = [objetoOrbitante];

      componenteDeEscenaTres['updateColors'](true);

      expect(mockGsap.to).toHaveBeenCalled();
    });

    it('debería usar colores light cuando isDark es false', () => {
      componenteDeEscenaTres['updateColors'](false);

      expect(mockTHREE.Color).toHaveBeenCalled();
    });

    it('debería manejar children con diferente opacidad', () => {
      const mockChildSecondary = {
        material: { opacity: 0.7, color: { r: 0, g: 0, b: 0 } }
      };
      Object.setPrototypeOf(mockChildSecondary, mockTHREE.LineSegments.prototype);

      const mockChildAccent = {
        material: { opacity: 0.5, color: { r: 0, g: 0, b: 0 } }
      };
      Object.setPrototypeOf(mockChildAccent, mockTHREE.LineSegments.prototype);

      mockCentralSphere.children = [mockChildSecondary, mockChildAccent];

      componenteDeEscenaTres['updateColors'](true);

      expect(mockGsap.to).toHaveBeenCalled();
    });
  });

  describe('disposeScene con traverse', () => {
    it('debería disponer geometrías y materiales de Mesh', () => {
      const mockGeometry = { dispose: jasmine.createSpy('dispose') };
      const mockMaterial = { dispose: jasmine.createSpy('dispose') };

      class MockMesh {
        geometry = mockGeometry;
        material = mockMaterial;
      }

      const mockTHREE: any = {
        Mesh: MockMesh,
        Line: class {},
        Points: class {},
        LineSegments: class {}
      };

      const meshChild = new MockMesh();
      const mockScene = {
        traverse: (callback: Function) => {
          callback(meshChild);
        }
      };

      componenteDeEscenaTres['THREE'] = mockTHREE;
      componenteDeEscenaTres['scene'] = mockScene;
      componenteDeEscenaTres['renderer'] = { dispose: jasmine.createSpy('dispose') };

      componenteDeEscenaTres['disposeScene']();

      expect(mockGeometry.dispose).toHaveBeenCalled();
      expect(mockMaterial.dispose).toHaveBeenCalled();
    });

    it('debería disponer array de materiales', () => {
      const mockGeometry = { dispose: jasmine.createSpy('dispose') };
      const mockMaterial1 = { dispose: jasmine.createSpy('dispose1') };
      const mockMaterial2 = { dispose: jasmine.createSpy('dispose2') };

      class MockMesh {
        geometry = mockGeometry;
        material = [mockMaterial1, mockMaterial2];
      }

      const mockTHREE: any = {
        Mesh: MockMesh,
        Line: class {},
        Points: class {},
        LineSegments: class {}
      };

      const meshChild = new MockMesh();
      const mockScene = {
        traverse: (callback: Function) => {
          callback(meshChild);
        }
      };

      componenteDeEscenaTres['THREE'] = mockTHREE;
      componenteDeEscenaTres['scene'] = mockScene;
      componenteDeEscenaTres['renderer'] = { dispose: jasmine.createSpy('dispose') };

      componenteDeEscenaTres['disposeScene']();

      expect(mockMaterial1.dispose).toHaveBeenCalled();
      expect(mockMaterial2.dispose).toHaveBeenCalled();
    });

    it('debería disponer Line, Points y LineSegments', () => {
      const mockGeometry = { dispose: jasmine.createSpy('dispose') };
      const mockMaterial = { dispose: jasmine.createSpy('dispose') };

      class MockLine {
        geometry = mockGeometry;
        material = mockMaterial;
      }

      class MockPoints {
        geometry = { dispose: jasmine.createSpy('disposePoints') };
        material = { dispose: jasmine.createSpy('disposeMaterialPoints') };
      }

      class MockLineSegments {
        geometry = { dispose: jasmine.createSpy('disposeLineSegments') };
        material = { dispose: jasmine.createSpy('disposeMaterialLineSegments') };
      }

      const mockTHREE: any = {
        Mesh: class {},
        Line: MockLine,
        Points: MockPoints,
        LineSegments: MockLineSegments
      };

      const lineChild = new MockLine();
      const pointsChild = new MockPoints();
      const lineSegmentsChild = new MockLineSegments();

      const mockScene = {
        traverse: (callback: Function) => {
          callback(lineChild);
          callback(pointsChild);
          callback(lineSegmentsChild);
        }
      };

      componenteDeEscenaTres['THREE'] = mockTHREE;
      componenteDeEscenaTres['scene'] = mockScene;
      componenteDeEscenaTres['renderer'] = { dispose: jasmine.createSpy('dispose') };

      componenteDeEscenaTres['disposeScene']();

      expect(mockGeometry.dispose).toHaveBeenCalled();
      expect(mockMaterial.dispose).toHaveBeenCalled();
      expect(pointsChild.geometry.dispose).toHaveBeenCalled();
      expect(lineSegmentsChild.geometry.dispose).toHaveBeenCalled();
    });

    it('debería manejar geometrías y materiales null', () => {
      class MockMesh {
        geometry = null;
        material = null;
      }

      const mockTHREE: any = {
        Mesh: MockMesh,
        Line: class {},
        Points: class {},
        LineSegments: class {}
      };

      const meshChild = new MockMesh();
      const mockScene = {
        traverse: (callback: Function) => {
          callback(meshChild);
        }
      };

      componenteDeEscenaTres['THREE'] = mockTHREE;
      componenteDeEscenaTres['scene'] = mockScene;
      componenteDeEscenaTres['renderer'] = { dispose: jasmine.createSpy('dispose') };

      expect(() => componenteDeEscenaTres['disposeScene']()).not.toThrow();
    });
  });

  describe('onWindowResize con parentElement null', () => {
    it('debería usar window dimensions cuando parentElement es null', () => {
      const mockCamera = {
        aspect: 1,
        updateProjectionMatrix: jasmine.createSpy('updateProjectionMatrix')
      };
      const mockRenderer = {
        setSize: jasmine.createSpy('setSize')
      };

      // Crear canvas sin parentElement
      const mockCanvas = document.createElement('canvas');
      Object.defineProperty(mockCanvas, 'parentElement', { value: null });

      componenteDeEscenaTres['camera'] = mockCamera;
      componenteDeEscenaTres['renderer'] = mockRenderer;
      componenteDeEscenaTres.canvasRef = { nativeElement: mockCanvas } as any;

      Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1080, configurable: true });

      componenteDeEscenaTres['onWindowResize']();

      expect(mockRenderer.setSize).toHaveBeenCalledWith(1920, 1080);
    });
  });

  describe('Bounds de onMouseMove', () => {
    it('debería calcular valores positivos para coordenadas grandes', () => {
      const eventoSimuladoDeMouse = new MouseEvent('mousemove', {
        clientX: 900,
        clientY: 500
      });

      Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true });

      componenteDeEscenaTres['onMouseMove'](eventoSimuladoDeMouse);

      expect(componenteDeEscenaTres['mouseX']).toBeGreaterThan(0);
      expect(componenteDeEscenaTres['mouseY']).toBeGreaterThan(0);
    });

    it('debería manejar coordenadas en el borde de la ventana', () => {
      const eventoSimuladoDeMouse = new MouseEvent('mousemove', {
        clientX: 1000,
        clientY: 600
      });

      Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true });

      componenteDeEscenaTres['onMouseMove'](eventoSimuladoDeMouse);

      expect(componenteDeEscenaTres['mouseX']).toBe(1);
      expect(componenteDeEscenaTres['mouseY']).toBe(1);
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

      const mockGsap = {
        fromTo: jasmine.createSpy('fromTo'),
        to: jasmine.createSpy('to'),
        killTweensOf: jasmine.createSpy('killTweensOf')
      };

      const mockClock = {
        getElapsedTime: jasmine.createSpy('getElapsedTime').and.returnValue(0)
      };

      class MockGroup {
        add = jasmine.createSpy('add');
        position = { set: jasmine.createSpy('set'), x: 0, y: 0, z: 0 };
        scale = { set: jasmine.createSpy('set'), x: 1, y: 1, z: 1 };
        rotation = { x: 0, y: 0, z: 0 };
        userData: any = {};
        traverse = jasmine.createSpy('traverse');
      }

      // Espiar los métodos privados
      spyOn<any>(componenteDeEscenaTres, 'initThree').and.callFake(() => {
        componenteDeEscenaTres['renderer'] = mockRenderer;
        componenteDeEscenaTres['scene'] = mockScene;
        componenteDeEscenaTres['camera'] = mockCamera;
        componenteDeEscenaTres['mainGroup'] = new MockGroup();
      });
      spyOn<any>(componenteDeEscenaTres, 'createCentralStructure');
      spyOn<any>(componenteDeEscenaTres, 'createOrbitingElements');
      spyOn<any>(componenteDeEscenaTres, 'createParticleField');
      spyOn<any>(componenteDeEscenaTres, 'createConnectionLines');
      spyOn<any>(componenteDeEscenaTres, 'addEventListeners');
      spyOn<any>(componenteDeEscenaTres, 'playIntroAnimation');
      spyOn<any>(componenteDeEscenaTres, 'animate');

      // Mockear las importaciones dinámicas
      const mockThreeModule = { Clock: jasmine.createSpy('Clock').and.returnValue(mockClock) };
      const mockGsapModule = { default: mockGsap };

      spyOn(Promise, 'all').and.returnValue(Promise.resolve([mockThreeModule, mockGsapModule]));

      // Ejecutar ngAfterViewInit
      await componenteDeEscenaTres.ngAfterViewInit();

      // Verificar que todos los métodos fueron llamados
      expect(componenteDeEscenaTres['initThree']).toHaveBeenCalled();
      expect(componenteDeEscenaTres['createCentralStructure']).toHaveBeenCalled();
      expect(componenteDeEscenaTres['createOrbitingElements']).toHaveBeenCalled();
      expect(componenteDeEscenaTres['createParticleField']).toHaveBeenCalled();
      expect(componenteDeEscenaTres['createConnectionLines']).toHaveBeenCalled();
      expect(componenteDeEscenaTres['addEventListeners']).toHaveBeenCalled();
      expect(componenteDeEscenaTres['playIntroAnimation']).toHaveBeenCalled();
      expect(componenteDeEscenaTres['isInitialized']).toBe(true);
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

      componenteDeEscenaTres['clock'] = mockClock;
      componenteDeEscenaTres['renderer'] = mockRenderer;
      componenteDeEscenaTres['scene'] = mockScene;
      componenteDeEscenaTres['camera'] = mockCamera;

      // Capturar el callback pasado a requestAnimationFrame
      let capturedCallback: FrameRequestCallback | null = null;
      (window.requestAnimationFrame as jasmine.Spy).and.callFake((cb: FrameRequestCallback) => {
        capturedCallback = cb;
        return 1;
      });

      componenteDeEscenaTres['animate']();

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
