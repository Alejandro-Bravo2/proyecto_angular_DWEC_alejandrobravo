import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef, Renderer2 } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Header } from './header';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SubscriptionStore } from '../../../core/stores/subscription.store';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockSubscriptionStore: jasmine.SpyObj<SubscriptionStore>;
  let renderer: Renderer2;
  let router: Router;

  beforeEach(async () => {
    // Crear mocks de servicios
    mockThemeService = jasmine.createSpyObj('ThemeService', ['toggleTheme', 'isDark']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout', 'isLoggedIn']);
    mockSubscriptionStore = jasmine.createSpyObj('SubscriptionStore', [
      'isPremium',
      'badgeText',
    ]);

    // Configurar valores por defecto de los mocks
    mockThemeService.isDark.and.returnValue(false);
    mockAuthService.isLoggedIn.and.returnValue(false);
    mockAuthService.logout.and.returnValue(of(void 0));
    mockSubscriptionStore.isPremium.and.returnValue(false);
    mockSubscriptionStore.badgeText.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        { provide: ThemeService, useValue: mockThemeService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: SubscriptionStore, useValue: mockSubscriptionStore },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Obtener el Renderer2 real del componente y espiarlo
    renderer = component['renderer'];
    spyOn(renderer, 'addClass').and.callThrough();
    spyOn(renderer, 'removeClass').and.callThrough();
  });

  describe('Creacion del componente', () => {
    it('debe crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debe inicializar el estado del menu movil como cerrado', () => {
      expect(component.isMobileMenuOpen()).toBe(false);
    });

    it('debe inyectar ThemeService correctamente', () => {
      expect(component.themeService).toBe(mockThemeService);
    });

    it('debe inyectar SubscriptionStore correctamente', () => {
      expect(component.subscriptionStore).toBe(mockSubscriptionStore);
    });
  });

  describe('ngAfterViewInit', () => {
    it('debe verificar la inicializacion de ViewChild menuToggle', () => {
      spyOn(console, 'warn');
      component.menuToggle = undefined as any;

      component.ngAfterViewInit();

      expect(console.warn).toHaveBeenCalledWith(
        'Header: menuToggle ViewChild no inicializado'
      );
    });

    it('no debe mostrar advertencia si menuToggle esta inicializado', () => {
      spyOn(console, 'warn');

      component.ngAfterViewInit();

      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('toggleMobileMenu', () => {
    it('debe alternar el estado del menu de cerrado a abierto', () => {
      component.isMobileMenuOpen.set(false);

      component.toggleMobileMenu();

      expect(component.isMobileMenuOpen()).toBe(true);
    });

    it('debe alternar el estado del menu de abierto a cerrado', () => {
      component.isMobileMenuOpen.set(true);

      component.toggleMobileMenu();

      expect(component.isMobileMenuOpen()).toBe(false);
    });

    it('debe agregar clase menu-open al body cuando se abre el menu', () => {
      component.isMobileMenuOpen.set(false);

      component.toggleMobileMenu();

      expect(renderer.addClass).toHaveBeenCalledWith(document.body, 'menu-open');
    });

    it('debe remover clase menu-open del body cuando se cierra el menu', () => {
      component.isMobileMenuOpen.set(true);

      component.toggleMobileMenu();

      expect(renderer.removeClass).toHaveBeenCalledWith(
        document.body,
        'menu-open'
      );
    });
  });

  describe('closeMobileMenu', () => {
    it('debe cerrar el menu cuando esta abierto', () => {
      component.isMobileMenuOpen.set(true);

      component.closeMobileMenu();

      expect(component.isMobileMenuOpen()).toBe(false);
    });

    it('debe remover clase menu-open del body cuando cierra el menu', () => {
      component.isMobileMenuOpen.set(true);

      component.closeMobileMenu();

      expect(renderer.removeClass).toHaveBeenCalledWith(
        document.body,
        'menu-open'
      );
    });

    it('no debe hacer nada si el menu ya esta cerrado', () => {
      component.isMobileMenuOpen.set(false);
      (renderer.removeClass as jasmine.Spy).calls.reset();

      component.closeMobileMenu();

      expect(renderer.removeClass).not.toHaveBeenCalled();
    });
  });

  describe('@HostListener document:keydown.escape', () => {
    it('debe cerrar el menu cuando se presiona Escape', () => {
      component.isMobileMenuOpen.set(true);
      spyOn(component.menuToggle.nativeElement, 'focus');

      component.onEscapeKey();

      expect(component.isMobileMenuOpen()).toBe(false);
    });

    it('debe devolver el foco al boton hamburguesa tras cerrar con Escape', () => {
      component.isMobileMenuOpen.set(true);
      spyOn(component.menuToggle.nativeElement, 'focus');

      component.onEscapeKey();

      expect(component.menuToggle.nativeElement.focus).toHaveBeenCalled();
    });

    it('no debe hacer nada si el menu ya esta cerrado', () => {
      component.isMobileMenuOpen.set(false);
      spyOn(component, 'closeMobileMenu');

      component.onEscapeKey();

      expect(component.closeMobileMenu).not.toHaveBeenCalled();
    });

    it('no debe fallar si menuToggle no esta inicializado', () => {
      component.isMobileMenuOpen.set(true);
      component.menuToggle = undefined as any;

      expect(() => component.onEscapeKey()).not.toThrow();
    });
  });

  describe('@HostListener document:click', () => {
    it('debe cerrar el menu cuando se hace click fuera del menu y del boton', () => {
      component.isMobileMenuOpen.set(true);
      const elementoExterno = document.createElement('div');
      const mockEvent = { target: elementoExterno } as unknown as MouseEvent;

      component.onDocumentClick(mockEvent);

      expect(component.isMobileMenuOpen()).toBe(false);
    });

    it('no debe cerrar el menu cuando se hace click dentro del menu', () => {
      component.isMobileMenuOpen.set(true);
      fixture.detectChanges();

      // Obtener el elemento mobileNav del componente (después de que ViewChild esté inicializado)
      const mobileNavElement = component.mobileNav.nativeElement;
      const elementoDentroDelMenu = document.createElement('a');
      mobileNavElement.appendChild(elementoDentroDelMenu);

      const mockEvent = { target: elementoDentroDelMenu } as unknown as MouseEvent;

      component.onDocumentClick(mockEvent);

      expect(component.isMobileMenuOpen()).toBe(true);
    });

    it('no debe cerrar el menu cuando se hace click en el boton hamburguesa', () => {
      component.isMobileMenuOpen.set(true);
      const mockEvent = {
        target: component.menuToggle.nativeElement,
      } as unknown as MouseEvent;

      component.onDocumentClick(mockEvent);

      expect(component.isMobileMenuOpen()).toBe(true);
    });

    it('no debe hacer nada si el menu esta cerrado', () => {
      component.isMobileMenuOpen.set(false);
      const elementoExterno = document.createElement('div');
      const mockEvent = { target: elementoExterno } as unknown as MouseEvent;

      component.onDocumentClick(mockEvent);

      // No deberia cambiar el estado
      expect(component.isMobileMenuOpen()).toBe(false);
    });

    it('no debe fallar si el target es null', () => {
      component.isMobileMenuOpen.set(true);
      const mockEvent = { target: null } as any;

      expect(() => component.onDocumentClick(mockEvent)).not.toThrow();
    });

    it('no debe fallar si menuToggle no esta inicializado', () => {
      component.isMobileMenuOpen.set(true);
      component.menuToggle = undefined as any;
      const mockEvent = { target: document.createElement('div') } as unknown as MouseEvent;

      expect(() => component.onDocumentClick(mockEvent)).not.toThrow();
    });

    it('no debe fallar si mobileNav no esta inicializado', () => {
      component.isMobileMenuOpen.set(true);
      component.mobileNav = undefined as any;
      const mockEvent = { target: document.createElement('div') } as unknown as MouseEvent;

      expect(() => component.onDocumentClick(mockEvent)).not.toThrow();
    });
  });

  describe('@HostListener window:resize', () => {
    let originalInnerWidth: number;

    beforeEach(() => {
      originalInnerWidth = window.innerWidth;
    });

    afterEach(() => {
      // Restaurar el valor original
      Object.defineProperty(window, 'innerWidth', {
        value: originalInnerWidth,
        writable: true,
        configurable: true
      });
    });

    it('debe cerrar el menu cuando se redimensiona a desktop (>= 768px)', () => {
      component.isMobileMenuOpen.set(true);
      Object.defineProperty(window, 'innerWidth', { value: 768, writable: true, configurable: true });

      component.onWindowResize();

      expect(component.isMobileMenuOpen()).toBe(false);
    });

    it('debe cerrar el menu cuando se redimensiona a desktop (> 768px)', () => {
      component.isMobileMenuOpen.set(true);
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });

      component.onWindowResize();

      expect(component.isMobileMenuOpen()).toBe(false);
    });

    it('no debe cerrar el menu cuando se redimensiona en mobile (< 768px)', () => {
      component.isMobileMenuOpen.set(true);
      Object.defineProperty(window, 'innerWidth', { value: 767, writable: true, configurable: true });

      component.onWindowResize();

      expect(component.isMobileMenuOpen()).toBe(true);
    });

    it('no debe hacer nada si el menu ya esta cerrado en desktop', () => {
      component.isMobileMenuOpen.set(false);
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
      (renderer.removeClass as jasmine.Spy).calls.reset();

      component.onWindowResize();

      // No deberia llamar a removeClass si ya esta cerrado
      expect(renderer.removeClass).not.toHaveBeenCalled();
    });
  });

  describe('toggleTheme', () => {
    it('debe llamar a themeService.toggleTheme', () => {
      component.toggleTheme();

      expect(mockThemeService.toggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout', () => {
    it('debe llamar a authService.logout cuando se cierra sesion', () => {
      component.logout();

      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
    });

    it('debe navegar a la pagina principal tras cerrar sesion exitosamente', () => {
      component.logout();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('debe cerrar el menu movil tras cerrar sesion exitosamente', () => {
      component.isMobileMenuOpen.set(true);

      component.logout();

      expect(component.isMobileMenuOpen()).toBe(false);
    });

    it('debe manejar errores al cerrar sesion y navegar igualmente', () => {
      const mockError = new Error('Error de red');
      mockAuthService.logout.and.returnValue(throwError(() => mockError));
      spyOn(console, 'error');

      component.logout();

      expect(console.error).toHaveBeenCalledWith('Error during logout', mockError);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('debe limpiar localStorage manualmente en caso de error al cerrar sesion', () => {
      const mockError = new Error('Error de red');
      mockAuthService.logout.and.returnValue(throwError(() => mockError));
      spyOn(localStorage, 'removeItem');

      component.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('currentUser');
    });

    it('debe cerrar el menu movil incluso si hay error al cerrar sesion', () => {
      component.isMobileMenuOpen.set(true);
      const mockError = new Error('Error de red');
      mockAuthService.logout.and.returnValue(throwError(() => mockError));

      component.logout();

      expect(component.isMobileMenuOpen()).toBe(false);
    });
  });

  describe('isLoggedIn getter', () => {
    it('debe devolver true cuando el usuario esta autenticado', () => {
      mockAuthService.isLoggedIn.and.returnValue(true);

      const resultado = component.isLoggedIn;

      expect(resultado).toBe(true);
    });

    it('debe devolver false cuando el usuario no esta autenticado', () => {
      mockAuthService.isLoggedIn.and.returnValue(false);

      const resultado = component.isLoggedIn;

      expect(resultado).toBe(false);
    });
  });

  describe('Computed signals desde SubscriptionStore', () => {
    it('isPremium debe devolver true cuando el usuario es premium', () => {
      mockSubscriptionStore.isPremium.and.returnValue(true);

      const resultado = component.isPremium();

      expect(resultado).toBe(true);
    });

    it('isPremium debe devolver false cuando el usuario no es premium', () => {
      mockSubscriptionStore.isPremium.and.returnValue(false);

      const resultado = component.isPremium();

      expect(resultado).toBe(false);
    });

    it('badgeText debe devolver null para usuario sin subscripcion', () => {
      mockSubscriptionStore.badgeText.and.returnValue(null);

      const resultado = component.badgeText();

      expect(resultado).toBe(null);
    });

    it('badgeText debe devolver PRO para usuario con plan anual', () => {
      mockSubscriptionStore.badgeText.and.returnValue('PRO');

      const resultado = component.badgeText();

      expect(resultado).toBe('PRO');
    });

    it('badgeText debe devolver PREMIUM para usuario con plan mensual', () => {
      mockSubscriptionStore.badgeText.and.returnValue('PREMIUM');

      const resultado = component.badgeText();

      expect(resultado).toBe('PREMIUM');
    });
  });

  describe('focusMenuToggle (metodo privado)', () => {
    it('debe devolver el foco al boton hamburguesa cuando se llama desde onEscapeKey', () => {
      component.isMobileMenuOpen.set(true);
      spyOn(component.menuToggle.nativeElement, 'focus');

      component.onEscapeKey();

      expect(component.menuToggle.nativeElement.focus).toHaveBeenCalled();
    });

    it('no debe fallar si menuToggle.nativeElement es null al devolver foco', () => {
      component.isMobileMenuOpen.set(true);
      component.menuToggle = {
        nativeElement: null as any,
      } as ElementRef<HTMLButtonElement>;

      expect(() => component.onEscapeKey()).not.toThrow();
    });
  });
});
