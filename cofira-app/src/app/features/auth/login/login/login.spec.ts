import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Login } from './login';
import { AuthService } from '../../../../core/auth/auth.service';

describe('Login', () => {
  let componente: Login;
  let fixture: ComponentFixture<Login>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    // Crear mock de AuthService
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'login',
      'isLoggedIn',
      'needsOnboarding'
    ]);

    // Crear mock de Router
    mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl', 'createUrlTree', 'serializeUrl']);
    mockRouter.createUrlTree.and.returnValue({} as any);
    mockRouter.serializeUrl.and.returnValue('/login');
    (mockRouter as any).events = of();

    // Crear mock de ActivatedRoute
    mockActivatedRoute = {
      snapshot: {
        queryParamMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    componente = fixture.componentInstance;
  });

  describe('Creacion e inicializacion del componente', () => {
    it('deberia crear el componente correctamente', () => {
      expect(componente).toBeTruthy();
    });

    it('deberia inicializar el formulario con controles vacios', () => {
      expect(componente.loginForm).toBeDefined();
      expect(componente.loginForm.get('username')?.value).toBe('');
      expect(componente.loginForm.get('password')?.value).toBe('');
    });

    it('deberia establecer returnUrl por defecto como "/"', () => {
      mockAuthService.isLoggedIn.and.returnValue(false);
      fixture.detectChanges();

      expect((componente as any).returnUrl).toBe('/');
    });

    it('deberia leer returnUrl desde queryParams si existe', () => {
      const returnUrlEsperada = '/entrenamiento';
      mockActivatedRoute.snapshot.queryParamMap.get.and.returnValue(returnUrlEsperada);
      mockAuthService.isLoggedIn.and.returnValue(false);

      fixture.detectChanges();

      expect((componente as any).returnUrl).toBe(returnUrlEsperada);
    });

    it('deberia redirigir si el usuario ya esta logueado', () => {
      const returnUrlEsperada = '/dashboard';
      mockActivatedRoute.snapshot.queryParamMap.get.and.returnValue(returnUrlEsperada);
      mockAuthService.isLoggedIn.and.returnValue(true);

      fixture.detectChanges();

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(returnUrlEsperada);
    });
  });

  describe('Controles del formulario', () => {
    beforeEach(() => {
      mockAuthService.isLoggedIn.and.returnValue(false);
      fixture.detectChanges();
    });

    it('deberia tener control username', () => {
      const controlUsername = componente.loginForm.get('username');
      expect(controlUsername).toBeDefined();
    });

    it('deberia tener control password', () => {
      const controlPassword = componente.loginForm.get('password');
      expect(controlPassword).toBeDefined();
    });

    it('deberia actualizar el valor de username correctamente', () => {
      const controlUsername = componente.loginForm.get('username');
      const valorEsperado = 'usuario_prueba';

      controlUsername?.setValue(valorEsperado);

      expect(controlUsername?.value).toBe(valorEsperado);
    });

    it('deberia actualizar el valor de password correctamente', () => {
      const controlPassword = componente.loginForm.get('password');
      const valorEsperado = 'password123';

      controlPassword?.setValue(valorEsperado);

      expect(controlPassword?.value).toBe(valorEsperado);
    });
  });

  describe('Validacion del formulario', () => {
    beforeEach(() => {
      mockAuthService.isLoggedIn.and.returnValue(false);
      fixture.detectChanges();
    });

    it('deberia ser invalido cuando esta vacio', () => {
      expect(componente.loginForm.valid).toBeFalse();
    });

    it('deberia requerir username', () => {
      const controlUsername = componente.loginForm.get('username');
      expect(controlUsername?.hasError('required')).toBeTrue();
    });

    it('deberia requerir password', () => {
      const controlPassword = componente.loginForm.get('password');
      expect(controlPassword?.hasError('required')).toBeTrue();
    });

    it('deberia ser valido cuando ambos campos estan completos', () => {
      componente.loginForm.patchValue({
        username: 'usuario_prueba',
        password: 'password123'
      });

      expect(componente.loginForm.valid).toBeTrue();
    });

    it('deberia ser invalido si solo username esta completo', () => {
      componente.loginForm.patchValue({
        username: 'usuario_prueba',
        password: ''
      });

      expect(componente.loginForm.valid).toBeFalse();
    });

    it('deberia ser invalido si solo password esta completo', () => {
      componente.loginForm.patchValue({
        username: '',
        password: 'password123'
      });

      expect(componente.loginForm.valid).toBeFalse();
    });
  });

  describe('Envio del formulario - Casos exitosos', () => {
    beforeEach(() => {
      mockAuthService.isLoggedIn.and.returnValue(false);
      fixture.detectChanges();
    });

    it('deberia llamar a authService.login con las credenciales correctas', () => {
      const credenciales = {
        username: 'usuario_prueba',
        password: 'password123'
      };
      const respuestaAuth = {
        token: 'token-jwt-falso',
        type: 'Bearer',
        id: 1,
        username: 'usuario_prueba',
        email: 'usuario@test.com',
        rol: 'USER',
        isOnboarded: true
      };

      mockAuthService.login.and.returnValue(of(respuestaAuth));
      mockAuthService.needsOnboarding.and.returnValue(false);

      componente.loginForm.patchValue(credenciales);
      componente.onSubmit();

      expect(mockAuthService.login).toHaveBeenCalledWith(
        credenciales.username,
        credenciales.password
      );
    });

    it('deberia navegar a returnUrl despues de login exitoso si usuario no necesita onboarding', () => {
      const returnUrlEsperada = '/dashboard';
      (componente as any).returnUrl = returnUrlEsperada;
      const respuestaAuth = {
        token: 'token-jwt-falso',
        type: 'Bearer',
        id: 1,
        username: 'usuario_prueba',
        email: 'usuario@test.com',
        rol: 'USER',
        isOnboarded: true
      };

      mockAuthService.login.and.returnValue(of(respuestaAuth));
      mockAuthService.needsOnboarding.and.returnValue(false);

      componente.loginForm.patchValue({
        username: 'usuario_prueba',
        password: 'password123'
      });
      componente.onSubmit();

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(returnUrlEsperada);
    });

    it('deberia navegar a /onboarding si el usuario necesita completar onboarding', () => {
      const respuestaAuth = {
        token: 'token-jwt-falso',
        type: 'Bearer',
        id: 1,
        username: 'usuario_prueba',
        email: 'usuario@test.com',
        rol: 'USER',
        isOnboarded: false
      };

      mockAuthService.login.and.returnValue(of(respuestaAuth));
      mockAuthService.needsOnboarding.and.returnValue(true);

      componente.loginForm.patchValue({
        username: 'usuario_prueba',
        password: 'password123'
      });
      componente.onSubmit();

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/onboarding');
    });

    it('deberia navegar a "/" por defecto si no hay returnUrl especifica', () => {
      const respuestaAuth = {
        token: 'token-jwt-falso',
        type: 'Bearer',
        id: 1,
        username: 'usuario_prueba',
        email: 'usuario@test.com',
        rol: 'USER',
        isOnboarded: true
      };

      mockAuthService.login.and.returnValue(of(respuestaAuth));
      mockAuthService.needsOnboarding.and.returnValue(false);

      componente.loginForm.patchValue({
        username: 'usuario_prueba',
        password: 'password123'
      });
      componente.onSubmit();

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
    });
  });

  describe('Envio del formulario - Casos de error', () => {
    beforeEach(() => {
      mockAuthService.isLoggedIn.and.returnValue(false);
      fixture.detectChanges();
    });

    it('no deberia llamar a authService.login si el formulario es invalido', () => {
      componente.loginForm.patchValue({
        username: '',
        password: ''
      });
      componente.onSubmit();

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('deberia marcar todos los campos como touched si el formulario es invalido', () => {
      spyOn(componente.loginForm, 'markAllAsTouched');

      componente.loginForm.patchValue({
        username: '',
        password: ''
      });
      componente.onSubmit();

      expect(componente.loginForm.markAllAsTouched).toHaveBeenCalled();
    });

    it('deberia manejar error de autenticacion correctamente', () => {
      const errorRespuesta = { status: 401, message: 'Credenciales invalidas' };
      mockAuthService.login.and.returnValue(throwError(() => errorRespuesta));

      spyOn(console, 'error');

      componente.loginForm.patchValue({
        username: 'usuario_prueba',
        password: 'password_incorrecta'
      });
      componente.onSubmit();

      expect(console.error).toHaveBeenCalledWith('Login failed', errorRespuesta);
    });

    it('no deberia navegar si hay error de autenticacion', () => {
      const errorRespuesta = { status: 401, message: 'Credenciales invalidas' };
      mockAuthService.login.and.returnValue(throwError(() => errorRespuesta));

      componente.loginForm.patchValue({
        username: 'usuario_prueba',
        password: 'password_incorrecta'
      });
      componente.onSubmit();

      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });

    it('no deberia llamar a authService.login si username es null', () => {
      componente.loginForm.patchValue({
        username: null,
        password: 'password123'
      });
      componente.onSubmit();

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('no deberia llamar a authService.login si password es null', () => {
      componente.loginForm.patchValue({
        username: 'usuario_prueba',
        password: null
      });
      componente.onSubmit();

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });
  });

  describe('Integracion con servicios', () => {
    beforeEach(() => {
      mockAuthService.isLoggedIn.and.returnValue(false);
      fixture.detectChanges();
    });

    it('deberia usar AuthService desde el injector', () => {
      expect((componente as any).authService).toBeDefined();
    });

    it('deberia usar Router desde el injector', () => {
      expect((componente as any).router).toBeDefined();
    });

    it('deberia usar ActivatedRoute desde el injector', () => {
      expect((componente as any).route).toBeDefined();
    });
  });

  describe('Logs de consola', () => {
    beforeEach(() => {
      mockAuthService.isLoggedIn.and.returnValue(false);
      fixture.detectChanges();
    });

    it('deberia registrar mensaje de exito en consola cuando login es exitoso', () => {
      const respuestaAuth = {
        token: 'token-jwt-falso',
        type: 'Bearer',
        id: 1,
        username: 'usuario_prueba',
        email: 'usuario@test.com',
        rol: 'USER',
        isOnboarded: true
      };

      mockAuthService.login.and.returnValue(of(respuestaAuth));
      mockAuthService.needsOnboarding.and.returnValue(false);
      spyOn(console, 'log');

      componente.loginForm.patchValue({
        username: 'usuario_prueba',
        password: 'password123'
      });
      componente.onSubmit();

      expect(console.log).toHaveBeenCalledWith('Login successful', respuestaAuth);
    });

    it('deberia registrar mensaje en consola cuando formulario es invalido', () => {
      spyOn(console, 'log');

      componente.loginForm.patchValue({
        username: '',
        password: ''
      });
      componente.onSubmit();

      expect(console.log).toHaveBeenCalledWith('Form is invalid');
    });
  });
});
