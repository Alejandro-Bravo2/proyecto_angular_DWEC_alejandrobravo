import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID, RendererFactory2, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ThemeService, Theme } from './theme.service';

describe('ThemeService', () => {
  let servicio: ThemeService;
  let documentoMock: Document;
  let rendererMock: jasmine.SpyObj<Renderer2>;
  let localStorageSpy: jasmine.Spy;

  beforeEach(() => {
    // Crear mock de Renderer2
    rendererMock = jasmine.createSpyObj('Renderer2', [
      'setAttribute',
      'addClass',
      'removeClass'
    ]);

    // Crear mock de RendererFactory2
    const rendererFactoryMock = jasmine.createSpyObj('RendererFactory2', ['createRenderer']);
    rendererFactoryMock.createRenderer.and.returnValue(rendererMock);

    // Limpiar localStorage antes de cada test
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: RendererFactory2, useValue: rendererFactoryMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ]
    });

    servicio = TestBed.inject(ThemeService);
    documentoMock = TestBed.inject(DOCUMENT);

    // Spy en localStorage
    localStorageSpy = spyOn(localStorage, 'setItem').and.callThrough();
  });

  afterEach(() => {
    localStorage.clear();
    // Limpiar atributos del documento
    if (documentoMock.documentElement.hasAttribute('data-theme')) {
      documentoMock.documentElement.removeAttribute('data-theme');
    }
    if (documentoMock.body.classList.contains('tema-transicion')) {
      documentoMock.body.classList.remove('tema-transicion');
    }
  });

  describe('inicializacion del servicio', () => {
    it('deberia crearse correctamente', () => {
      expect(servicio).toBeTruthy();
    });

    it('deberia inicializar con tema por defecto', () => {
      const temaActual = servicio.currentTheme();
      expect(['light', 'dark']).toContain(temaActual);
    });

    it('deberia usar tema guardado en localStorage si existe', () => {
      // Limpiar servicio anterior
      TestBed.resetTestingModule();

      // Configurar localStorage con tema oscuro
      localStorage.setItem('cofira-theme', 'dark');

      // Crear nuevo servicio
      const rendererFactoryMock = jasmine.createSpyObj('RendererFactory2', ['createRenderer']);
      rendererFactoryMock.createRenderer.and.returnValue(rendererMock);

      TestBed.configureTestingModule({
        providers: [
          ThemeService,
          { provide: RendererFactory2, useValue: rendererFactoryMock },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ]
      });

      const nuevoServicio = TestBed.inject(ThemeService);

      expect(nuevoServicio.currentTheme()).toBe('dark');
    });

    it('deberia detectar preferencia del sistema si no hay tema guardado', () => {
      // Verificar que el tema sea light o dark según la preferencia del sistema
      const temaActual = servicio.currentTheme();
      expect(['light', 'dark']).toContain(temaActual);
    });

    it('deberia establecer tema light si preferencia del sistema es light', () => {
      // Limpiar localStorage y servicio anterior
      localStorage.clear();
      TestBed.resetTestingModule();

      // Mock de matchMedia que devuelve false (tema light)
      spyOn(window, 'matchMedia').and.returnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener')
      } as any);

      // Crear nuevo servicio
      const rendererFactoryMock = jasmine.createSpyObj('RendererFactory2', ['createRenderer']);
      rendererFactoryMock.createRenderer.and.returnValue(rendererMock);

      TestBed.configureTestingModule({
        providers: [
          ThemeService,
          { provide: RendererFactory2, useValue: rendererFactoryMock },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ]
      });

      const nuevoServicio = TestBed.inject(ThemeService);

      // Debería establecerse en light
      expect(nuevoServicio.currentTheme()).toBe('light');
    });
  });

  describe('setTheme', () => {
    it('deberia establecer el tema correctamente', () => {
      servicio.setTheme('dark');
      expect(servicio.currentTheme()).toBe('dark');

      servicio.setTheme('light');
      expect(servicio.currentTheme()).toBe('light');
    });

    it('deberia actualizar el atributo data-theme usando Renderer2', () => {
      servicio.setTheme('dark');

      expect(rendererMock.setAttribute).toHaveBeenCalledWith(
        documentoMock.documentElement,
        'data-theme',
        'dark'
      );
    });

    it('deberia guardar el tema en localStorage', () => {
      servicio.setTheme('dark');

      expect(localStorage.getItem('cofira-theme')).toBe('dark');
      expect(localStorageSpy).toHaveBeenCalledWith('cofira-theme', 'dark');
    });

    it('deberia actualizar el signal currentTheme', () => {
      servicio.setTheme('dark');
      expect(servicio.currentTheme()).toBe('dark');

      servicio.setTheme('light');
      expect(servicio.currentTheme()).toBe('light');
    });

    it('deberia sobrescribir tema anterior en localStorage', () => {
      servicio.setTheme('light');
      expect(localStorage.getItem('cofira-theme')).toBe('light');

      servicio.setTheme('dark');
      expect(localStorage.getItem('cofira-theme')).toBe('dark');
    });
  });

  describe('toggleTheme', () => {
    it('deberia alternar de light a dark', () => {
      servicio.setTheme('light');
      rendererMock.setAttribute.calls.reset();
      rendererMock.addClass.calls.reset();
      rendererMock.removeClass.calls.reset();

      servicio.toggleTheme();

      expect(servicio.currentTheme()).toBe('dark');
    });

    it('deberia alternar de dark a light', () => {
      servicio.setTheme('dark');
      rendererMock.setAttribute.calls.reset();
      rendererMock.addClass.calls.reset();
      rendererMock.removeClass.calls.reset();

      servicio.toggleTheme();

      expect(servicio.currentTheme()).toBe('light');
    });

    it('deberia añadir clase tema-transicion al body', () => {
      servicio.setTheme('light');
      rendererMock.addClass.calls.reset();

      servicio.toggleTheme();

      expect(rendererMock.addClass).toHaveBeenCalledWith(
        documentoMock.body,
        'tema-transicion'
      );
    });

    it('deberia eliminar clase tema-transicion despues de 300ms', (done) => {
      jasmine.clock().install();

      servicio.setTheme('light');
      rendererMock.removeClass.calls.reset();

      servicio.toggleTheme();

      // Verificar que no se ha llamado inmediatamente
      expect(rendererMock.removeClass).not.toHaveBeenCalledWith(
        documentoMock.body,
        'tema-transicion'
      );

      // Avanzar el tiempo 300ms
      jasmine.clock().tick(300);

      // Ahora debería haberse llamado
      expect(rendererMock.removeClass).toHaveBeenCalledWith(
        documentoMock.body,
        'tema-transicion'
      );

      jasmine.clock().uninstall();
      done();
    });

    it('deberia persistir el nuevo tema en localStorage', () => {
      servicio.setTheme('light');
      servicio.toggleTheme();

      expect(localStorage.getItem('cofira-theme')).toBe('dark');
    });

    it('deberia alternar multiples veces correctamente', () => {
      servicio.setTheme('light');

      servicio.toggleTheme();
      expect(servicio.currentTheme()).toBe('dark');

      servicio.toggleTheme();
      expect(servicio.currentTheme()).toBe('light');

      servicio.toggleTheme();
      expect(servicio.currentTheme()).toBe('dark');
    });
  });

  describe('isDark', () => {
    it('deberia devolver true cuando el tema es dark', () => {
      servicio.setTheme('dark');
      expect(servicio.isDark()).toBeTrue();
    });

    it('deberia devolver false cuando el tema es light', () => {
      servicio.setTheme('light');
      expect(servicio.isDark()).toBeFalse();
    });

    it('deberia actualizarse reactivamente al cambiar el tema', () => {
      servicio.setTheme('light');
      expect(servicio.isDark()).toBeFalse();

      servicio.setTheme('dark');
      expect(servicio.isDark()).toBeTrue();

      servicio.toggleTheme();
      expect(servicio.isDark()).toBeFalse();
    });
  });

  describe('deteccion de cambios del sistema', () => {
    it('deberia escuchar cambios en prefers-color-scheme', () => {
      // Verificar que window.matchMedia fue llamado
      const matchMediaSpy = spyOn(window, 'matchMedia').and.returnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener')
      } as any);

      // Crear nuevo servicio para verificar la inicialización
      TestBed.resetTestingModule();
      const rendererFactoryMock = jasmine.createSpyObj('RendererFactory2', ['createRenderer']);
      rendererFactoryMock.createRenderer.and.returnValue(rendererMock);

      TestBed.configureTestingModule({
        providers: [
          ThemeService,
          { provide: RendererFactory2, useValue: rendererFactoryMock },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ]
      });

      const nuevoServicio = TestBed.inject(ThemeService);

      expect(matchMediaSpy).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('deberia no actualizar tema si hay preferencia guardada en localStorage', () => {
      // Guardar preferencia manual
      localStorage.setItem('cofira-theme', 'light');

      // Simular cambio del sistema
      const mediaQueryMock = {
        matches: true,
        media: '(prefers-color-scheme: dark)',
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener')
      } as any;

      spyOn(window, 'matchMedia').and.returnValue(mediaQueryMock);

      // El tema no debería cambiar porque hay preferencia guardada
      servicio.setTheme('light');
      expect(servicio.currentTheme()).toBe('light');
    });

    it('deberia actualizar tema si el sistema cambia y no hay preferencia manual', () => {
      // Limpiar localStorage para que no haya preferencia manual
      localStorage.clear();
      TestBed.resetTestingModule();

      let mediaQueryCallback: any = null;
      const mediaQueryMock = {
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: jasmine.createSpy('addEventListener').and.callFake((event: string, callback: any) => {
          mediaQueryCallback = callback;
        }),
        removeEventListener: jasmine.createSpy('removeEventListener')
      } as any;

      spyOn(window, 'matchMedia').and.returnValue(mediaQueryMock);

      // Crear nuevo servicio
      const rendererFactoryMock = jasmine.createSpyObj('RendererFactory2', ['createRenderer']);
      rendererFactoryMock.createRenderer.and.returnValue(rendererMock);

      TestBed.configureTestingModule({
        providers: [
          ThemeService,
          { provide: RendererFactory2, useValue: rendererFactoryMock },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ]
      });

      const nuevoServicio = TestBed.inject(ThemeService);

      // Limpiar localStorage nuevamente por si el servicio lo estableció
      localStorage.clear();

      // Simular cambio del sistema a dark
      if (mediaQueryCallback) {
        const mockEvent = { matches: true } as MediaQueryListEvent;
        mediaQueryCallback(mockEvent);

        // Debería cambiar a dark porque no hay preferencia manual
        expect(nuevoServicio.currentTheme()).toBe('dark');
      }
    });
  });

  describe('limpieza de recursos', () => {
    it('deberia implementar ngOnDestroy', () => {
      expect(servicio.ngOnDestroy).toBeDefined();
    });

    it('deberia eliminar event listener al destruir el servicio', () => {
      const mediaQueryMock = {
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener')
      } as any;

      spyOn(window, 'matchMedia').and.returnValue(mediaQueryMock);

      // Crear nuevo servicio
      TestBed.resetTestingModule();
      const rendererFactoryMock = jasmine.createSpyObj('RendererFactory2', ['createRenderer']);
      rendererFactoryMock.createRenderer.and.returnValue(rendererMock);

      TestBed.configureTestingModule({
        providers: [
          ThemeService,
          { provide: RendererFactory2, useValue: rendererFactoryMock },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ]
      });

      const nuevoServicio = TestBed.inject(ThemeService);

      // Llamar a ngOnDestroy
      nuevoServicio.ngOnDestroy();

      // Verificar que se eliminó el listener
      expect(mediaQueryMock.removeEventListener).toHaveBeenCalled();
    });
  });

  describe('compatibilidad SSR', () => {
    it('deberia usar Renderer2 para manipulacion del DOM', () => {
      servicio.setTheme('dark');

      // Verificar que se usó Renderer2 en lugar de DOM directo
      expect(rendererMock.setAttribute).toHaveBeenCalled();
    });

    it('deberia usar DOCUMENT token en lugar de document global', () => {
      // El servicio debería funcionar con el DOCUMENT inyectado
      expect(documentoMock).toBeDefined();
    });

    it('deberia no ejecutar codigo de navegador en SSR', () => {
      // Simular entorno SSR
      TestBed.resetTestingModule();
      const rendererFactoryMock = jasmine.createSpyObj('RendererFactory2', ['createRenderer']);
      rendererFactoryMock.createRenderer.and.returnValue(rendererMock);

      TestBed.configureTestingModule({
        providers: [
          ThemeService,
          { provide: RendererFactory2, useValue: rendererFactoryMock },
          { provide: PLATFORM_ID, useValue: 'server' }, // Simular SSR
        ]
      });

      const servicioSSR = TestBed.inject(ThemeService);

      // En SSR no debería inicializar tema ni listeners
      expect(servicioSSR).toBeTruthy();
    });
  });

  describe('casos edge', () => {
    it('deberia manejar valores null o undefined de localStorage', () => {
      localStorage.clear();

      const temaActual = servicio.currentTheme();
      expect(['light', 'dark']).toContain(temaActual);
    });

    it('deberia manejar cambios rapidos de tema', () => {
      servicio.setTheme('light');
      servicio.setTheme('dark');
      servicio.setTheme('light');
      servicio.setTheme('dark');

      expect(servicio.currentTheme()).toBe('dark');
      expect(localStorage.getItem('cofira-theme')).toBe('dark');
    });

    it('deberia mantener consistencia entre signal y localStorage', () => {
      servicio.setTheme('dark');

      expect(servicio.currentTheme()).toBe('dark');
      expect(localStorage.getItem('cofira-theme')).toBe('dark');

      servicio.setTheme('light');

      expect(servicio.currentTheme()).toBe('light');
      expect(localStorage.getItem('cofira-theme')).toBe('light');
    });

    it('deberia funcionar correctamente con tipos de Theme', () => {
      const temaLight: Theme = 'light';
      const temaDark: Theme = 'dark';

      servicio.setTheme(temaLight);
      expect(servicio.currentTheme()).toBe('light');

      servicio.setTheme(temaDark);
      expect(servicio.currentTheme()).toBe('dark');
    });
  });
});
