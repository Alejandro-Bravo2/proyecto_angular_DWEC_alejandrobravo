import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError, timer } from 'rxjs';
import { Register } from './register';
import { AsyncValidatorsService } from '../../../../shared/validators/async-validators.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { ToastService } from '../../../../core/services/toast.service';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let mockAsyncValidatorsService: jasmine.SpyObj<AsyncValidatorsService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  beforeEach(async () => {
    // Crear mocks de los servicios
    mockAsyncValidatorsService = jasmine.createSpyObj('AsyncValidatorsService', [
      'usernameUnique',
      'emailUnique',
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', ['register']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl']);
    mockRouter.createUrlTree.and.returnValue({} as any);
    mockRouter.serializeUrl.and.returnValue('/login');
    (mockRouter as any).events = of();
    mockLoadingService = jasmine.createSpyObj('LoadingService', ['show', 'hide']);
    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);

    // Mock de ActivatedRoute para RouterLink
    mockActivatedRoute = {
      snapshot: { params: {}, queryParams: {} } as any,
      params: of({}),
      queryParams: of({}),
    };

    // Configurar validadores asíncronos para retornar validators que resuelven inmediatamente
    mockAsyncValidatorsService.usernameUnique.and.returnValue(() => of(null));
    mockAsyncValidatorsService.emailUnique.and.returnValue(() => of(null));

    await TestBed.configureTestingModule({
      imports: [Register, ReactiveFormsModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AsyncValidatorsService, useValue: mockAsyncValidatorsService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: LoadingService, useValue: mockLoadingService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TESTS DE CREACIÓN E INICIALIZACIÓN
  // ══════════════════════════════════════════════════════════════════════════

  it('debería crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario con todos los controles', () => {
    const formularioDeRegistro = component.registerForm;

    expect(formularioDeRegistro).toBeDefined();
    expect(formularioDeRegistro.get('name')).toBeDefined();
    expect(formularioDeRegistro.get('username')).toBeDefined();
    expect(formularioDeRegistro.get('email')).toBeDefined();
    expect(formularioDeRegistro.get('password')).toBeDefined();
    expect(formularioDeRegistro.get('confirmPassword')).toBeDefined();
  });

  it('debería inicializar todos los campos vacíos', () => {
    const formularioDeRegistro = component.registerForm;

    expect(formularioDeRegistro.get('name')?.value).toBe('');
    expect(formularioDeRegistro.get('username')?.value).toBe('');
    expect(formularioDeRegistro.get('email')?.value).toBe('');
    expect(formularioDeRegistro.get('password')?.value).toBe('');
    expect(formularioDeRegistro.get('confirmPassword')?.value).toBe('');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TESTS DE VALIDACIÓN REQUERIDA
  // ══════════════════════════════════════════════════════════════════════════

  it('debería marcar el campo name como inválido cuando está vacío', () => {
    const controlDeNombre = component.registerForm.get('name');

    controlDeNombre?.setValue('');
    controlDeNombre?.markAsTouched();

    expect(controlDeNombre?.hasError('required')).toBe(true);
    expect(controlDeNombre?.valid).toBe(false);
  });

  it('debería marcar el campo username como inválido cuando está vacío', () => {
    const controlDeUsuario = component.registerForm.get('username');

    controlDeUsuario?.setValue('');
    controlDeUsuario?.markAsTouched();

    expect(controlDeUsuario?.hasError('required')).toBe(true);
    expect(controlDeUsuario?.valid).toBe(false);
  });

  it('debería marcar el campo email como inválido cuando está vacío', () => {
    const controlDeEmail = component.registerForm.get('email');

    controlDeEmail?.setValue('');
    controlDeEmail?.markAsTouched();

    expect(controlDeEmail?.hasError('required')).toBe(true);
    expect(controlDeEmail?.valid).toBe(false);
  });

  it('debería marcar el campo password como inválido cuando está vacío', () => {
    const controlDePassword = component.registerForm.get('password');

    controlDePassword?.setValue('');
    controlDePassword?.markAsTouched();

    expect(controlDePassword?.hasError('required')).toBe(true);
    expect(controlDePassword?.valid).toBe(false);
  });

  it('debería marcar el campo confirmPassword como inválido cuando está vacío', () => {
    const controlDeConfirmacion = component.registerForm.get('confirmPassword');

    controlDeConfirmacion?.setValue('');
    controlDeConfirmacion?.markAsTouched();

    expect(controlDeConfirmacion?.hasError('required')).toBe(true);
    expect(controlDeConfirmacion?.valid).toBe(false);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TESTS DE VALIDACIÓN DE FORMATO
  // ══════════════════════════════════════════════════════════════════════════

  it('debería marcar el email como inválido cuando el formato es incorrecto', () => {
    const controlDeEmail = component.registerForm.get('email');

    controlDeEmail?.setValue('correo-invalido');
    controlDeEmail?.markAsTouched();

    expect(controlDeEmail?.hasError('email')).toBe(true);
    expect(controlDeEmail?.valid).toBe(false);
  });

  it('debería marcar el email como válido cuando el formato es correcto', fakeAsync(() => {
    const controlDeEmail = component.registerForm.get('email');

    controlDeEmail?.setValue('usuario@ejemplo.com');
    controlDeEmail?.markAsTouched();
    controlDeEmail?.updateValueAndValidity();

    // Esperar debounce del validador asíncrono
    tick(600);

    expect(controlDeEmail?.hasError('email')).toBe(false);
  }));

  it('debería marcar el username como inválido cuando tiene menos de 3 caracteres', () => {
    const controlDeUsuario = component.registerForm.get('username');

    controlDeUsuario?.setValue('ab');
    controlDeUsuario?.markAsTouched();

    expect(controlDeUsuario?.hasError('minlength')).toBe(true);
    expect(controlDeUsuario?.valid).toBe(false);
  });

  it('debería marcar el username como válido cuando tiene 3 o más caracteres', fakeAsync(() => {
    const controlDeUsuario = component.registerForm.get('username');

    controlDeUsuario?.setValue('usuario123');
    controlDeUsuario?.markAsTouched();
    controlDeUsuario?.updateValueAndValidity();

    // Esperar debounce del validador asíncrono
    tick(600);

    expect(controlDeUsuario?.hasError('minlength')).toBe(false);
  }));

  // ══════════════════════════════════════════════════════════════════════════
  // TESTS DE VALIDACIÓN DE PASSWORD STRENGTH
  // ══════════════════════════════════════════════════════════════════════════

  it('debería marcar el password como inválido cuando no cumple con los requisitos de fortaleza', () => {
    const controlDePassword = component.registerForm.get('password');

    // Password débil: sin mayúsculas, especiales o suficiente longitud
    controlDePassword?.setValue('password123');
    controlDePassword?.markAsTouched();

    expect(controlDePassword?.hasError('passwordStrength')).toBe(true);
    expect(controlDePassword?.valid).toBe(false);
  });

  it('debería marcar el password como válido cuando cumple todos los requisitos', () => {
    const controlDePassword = component.registerForm.get('password');

    // Password fuerte: 12+ chars, mayúsculas, minúsculas, números, especiales
    controlDePassword?.setValue('Password123!@#');
    controlDePassword?.markAsTouched();

    expect(controlDePassword?.hasError('passwordStrength')).toBe(false);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TESTS DE VALIDACIÓN CROSS-FIELD (PASSWORD MATCH)
  // ══════════════════════════════════════════════════════════════════════════

  it('debería marcar el formulario como inválido cuando los passwords no coinciden', () => {
    const formularioDeRegistro = component.registerForm;

    formularioDeRegistro.get('password')?.setValue('Password123!@#');
    formularioDeRegistro.get('confirmPassword')?.setValue('Password456!@#');
    formularioDeRegistro.updateValueAndValidity();

    expect(formularioDeRegistro.hasError('passwordMatch')).toBe(true);
    expect(formularioDeRegistro.valid).toBe(false);
  });

  it('debería marcar el formulario como válido cuando los passwords coinciden', fakeAsync(() => {
    const formularioDeRegistro = component.registerForm;

    // Configurar todos los campos con valores válidos
    formularioDeRegistro.get('name')?.setValue('Usuario Test');
    formularioDeRegistro.get('username')?.setValue('usuario123');
    formularioDeRegistro.get('email')?.setValue('test@ejemplo.com');
    formularioDeRegistro.get('password')?.setValue('Password123!@#');
    formularioDeRegistro.get('confirmPassword')?.setValue('Password123!@#');

    // Marcar como touched para activar validadores
    formularioDeRegistro.markAllAsTouched();
    formularioDeRegistro.updateValueAndValidity();

    // Esperar validadores asíncronos
    tick(600);

    expect(formularioDeRegistro.hasError('passwordMatch')).toBe(false);
  }));

  // ══════════════════════════════════════════════════════════════════════════
  // TESTS DE VALIDADORES ASÍNCRONOS
  // ══════════════════════════════════════════════════════════════════════════

  it('debería llamar al validador asíncrono de username', fakeAsync(() => {
    const controlDeUsuario = component.registerForm.get('username');

    // Configurar el validador para retornar error
    mockAsyncValidatorsService.usernameUnique.and.returnValue(() =>
      timer(500).pipe(() => of({ usernameTaken: true }))
    );

    controlDeUsuario?.setValue('usuarioExistente');
    controlDeUsuario?.markAsTouched();
    controlDeUsuario?.updateValueAndValidity();

    tick(600);

    expect(mockAsyncValidatorsService.usernameUnique).toHaveBeenCalled();
  }));

  it('debería llamar al validador asíncrono de email', fakeAsync(() => {
    const controlDeEmail = component.registerForm.get('email');

    // Configurar el validador para retornar error
    mockAsyncValidatorsService.emailUnique.and.returnValue(() =>
      timer(500).pipe(() => of({ emailTaken: true }))
    );

    controlDeEmail?.setValue('email@existente.com');
    controlDeEmail?.markAsTouched();
    controlDeEmail?.updateValueAndValidity();

    tick(600);

    expect(mockAsyncValidatorsService.emailUnique).toHaveBeenCalled();
  }));

  // ══════════════════════════════════════════════════════════════════════════
  // TESTS DE SUBMIT - ESCENARIO EXITOSO
  // ══════════════════════════════════════════════════════════════════════════

  it('debería registrar el usuario correctamente cuando el formulario es válido', fakeAsync(() => {
    const formularioDeRegistro = component.registerForm;
    const respuestaSimulada = {
      token: 'token-simulado-jwt',
      type: 'Bearer',
      id: 1,
      username: 'usuario123',
      email: 'test@ejemplo.com',
      rol: 'USER',
      isOnboarded: false,
    };

    mockAuthService.register.and.returnValue(of(respuestaSimulada));

    // Llenar formulario con datos válidos
    formularioDeRegistro.get('name')?.setValue('Usuario Test');
    formularioDeRegistro.get('username')?.setValue('usuario123');
    formularioDeRegistro.get('email')?.setValue('test@ejemplo.com');
    formularioDeRegistro.get('password')?.setValue('Password123!@#');
    formularioDeRegistro.get('confirmPassword')?.setValue('Password123!@#');

    formularioDeRegistro.markAllAsTouched();
    formularioDeRegistro.updateValueAndValidity();

    tick(600);

    // Ejecutar submit
    component.onSubmit();

    // Verificar llamadas a servicios
    expect(mockLoadingService.show).toHaveBeenCalled();
    expect(mockAuthService.register).toHaveBeenCalledWith(
      'Usuario Test',
      'usuario123',
      'test@ejemplo.com',
      'Password123!@#'
    );
    expect(mockLoadingService.hide).toHaveBeenCalled();
    expect(mockToastService.success).toHaveBeenCalledWith('Registro exitoso. ¡Bienvenido!');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/onboarding']);
  }));

  it('debería mostrar el loading durante el proceso de registro', fakeAsync(() => {
    const formularioDeRegistro = component.registerForm;
    const respuestaSimulada = {
      token: 'token-simulado-jwt',
      type: 'Bearer',
      id: 1,
      username: 'usuario123',
      email: 'test@ejemplo.com',
      rol: 'USER',
      isOnboarded: false,
    };

    mockAuthService.register.and.returnValue(of(respuestaSimulada));

    // Llenar formulario
    formularioDeRegistro.patchValue({
      name: 'Usuario Test',
      username: 'usuario123',
      email: 'test@ejemplo.com',
      password: 'Password123!@#',
      confirmPassword: 'Password123!@#',
    });

    tick(600);

    component.onSubmit();

    // Verificar que show se llamó antes que hide
    expect(mockLoadingService.show).toHaveBeenCalledBefore(mockLoadingService.hide);
  }));

  // ══════════════════════════════════════════════════════════════════════════
  // TESTS DE SUBMIT - ESCENARIO DE ERROR
  // ══════════════════════════════════════════════════════════════════════════

  it('debería manejar errores de registro correctamente', fakeAsync(() => {
    const formularioDeRegistro = component.registerForm;
    const errorSimulado = {
      message: 'El email ya está registrado',
      status: 400,
    };

    mockAuthService.register.and.returnValue(throwError(() => errorSimulado));

    // Llenar formulario con datos válidos
    formularioDeRegistro.patchValue({
      name: 'Usuario Test',
      username: 'usuario123',
      email: 'test@ejemplo.com',
      password: 'Password123!@#',
      confirmPassword: 'Password123!@#',
    });

    tick(600);

    // Ejecutar submit
    component.onSubmit();

    // Verificar manejo de error
    expect(mockLoadingService.show).toHaveBeenCalled();
    expect(mockLoadingService.hide).toHaveBeenCalled();
    expect(mockToastService.error).toHaveBeenCalledWith(
      'Error en el registro: El email ya está registrado'
    );
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  }));

  it('debería mostrar mensaje de error genérico cuando no hay mensaje específico', fakeAsync(() => {
    const formularioDeRegistro = component.registerForm;
    const errorSimulado = {
      status: 500,
    };

    mockAuthService.register.and.returnValue(throwError(() => errorSimulado));

    formularioDeRegistro.patchValue({
      name: 'Usuario Test',
      username: 'usuario123',
      email: 'test@ejemplo.com',
      password: 'Password123!@#',
      confirmPassword: 'Password123!@#',
    });

    tick(600);

    component.onSubmit();

    expect(mockToastService.error).toHaveBeenCalledWith(
      'Error en el registro: Inténtalo de nuevo.'
    );
  }));

  // ══════════════════════════════════════════════════════════════════════════
  // TESTS DE SUBMIT - FORMULARIO INVÁLIDO
  // ══════════════════════════════════════════════════════════════════════════

  it('debería marcar todos los campos como touched cuando el formulario es inválido', () => {
    const formularioDeRegistro = component.registerForm;

    // Dejar todos los campos vacíos (inválido)
    formularioDeRegistro.reset();

    // Spy para verificar que se llama markAllAsTouched
    spyOn(formularioDeRegistro, 'markAllAsTouched');

    component.onSubmit();

    // No debería llamar al servicio de registro
    expect(mockAuthService.register).not.toHaveBeenCalled();
    expect(formularioDeRegistro.markAllAsTouched).toHaveBeenCalled();
  });

  it('no debería procesar el submit cuando falta el campo name', () => {
    const formularioDeRegistro = component.registerForm;

    formularioDeRegistro.patchValue({
      name: '', // Campo faltante
      username: 'usuario123',
      email: 'test@ejemplo.com',
      password: 'Password123!@#',
      confirmPassword: 'Password123!@#',
    });

    component.onSubmit();

    expect(mockAuthService.register).not.toHaveBeenCalled();
    expect(mockLoadingService.show).not.toHaveBeenCalled();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TESTS DE CAN DEACTIVATE
  // ══════════════════════════════════════════════════════════════════════════

  it('debería retornar true en canDeactivate cuando el formulario está limpio', () => {
    const formularioDeRegistro = component.registerForm;

    // Formulario sin cambios
    expect(formularioDeRegistro.dirty).toBe(false);

    const resultadoCanDeactivate = component.canDeactivate();

    expect(resultadoCanDeactivate).toBe(true);
  });

  it('debería retornar true en canDeactivate cuando el formulario está dirty pero tiene email', () => {
    const formularioDeRegistro = component.registerForm;

    // Modificar el formulario y añadir email
    formularioDeRegistro.get('email')?.setValue('test@ejemplo.com');
    formularioDeRegistro.markAsDirty();

    const resultadoCanDeactivate = component.canDeactivate();

    expect(resultadoCanDeactivate).toBe(true);
  });

  it('debería solicitar confirmación en canDeactivate cuando el formulario está dirty sin email', () => {
    const formularioDeRegistro = component.registerForm;

    // Modificar el formulario sin añadir email
    formularioDeRegistro.get('name')?.setValue('Usuario Test');
    formularioDeRegistro.markAsDirty();

    // Simular que el usuario confirma salir
    spyOn(window, 'confirm').and.returnValue(true);

    const resultadoCanDeactivate = component.canDeactivate();

    expect(window.confirm).toHaveBeenCalledWith(
      '¿Estás seguro de que quieres salir?\n\nTienes cambios sin guardar en el formulario de registro.'
    );
    expect(resultadoCanDeactivate).toBe(true);
  });

  it('debería retornar false en canDeactivate cuando el usuario cancela la confirmación', () => {
    const formularioDeRegistro = component.registerForm;

    // Modificar el formulario sin añadir email
    formularioDeRegistro.get('username')?.setValue('usuario123');
    formularioDeRegistro.markAsDirty();

    // Simular que el usuario cancela la salida
    spyOn(window, 'confirm').and.returnValue(false);

    const resultadoCanDeactivate = component.canDeactivate();

    expect(window.confirm).toHaveBeenCalled();
    expect(resultadoCanDeactivate).toBe(false);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TESTS DE INTEGRACIÓN DE SERVICIOS
  // ══════════════════════════════════════════════════════════════════════════

  it('debería integrar correctamente LoadingService con el flujo de registro', fakeAsync(() => {
    const respuestaSimulada = {
      token: 'token-jwt',
      type: 'Bearer',
      id: 1,
      username: 'test',
      email: 'test@test.com',
      rol: 'USER',
      isOnboarded: false,
    };

    mockAuthService.register.and.returnValue(of(respuestaSimulada));

    component.registerForm.patchValue({
      name: 'Test User',
      username: 'testuser',
      email: 'test@test.com',
      password: 'Password123!@#',
      confirmPassword: 'Password123!@#',
    });

    tick(600);

    component.onSubmit();

    // Verificar secuencia de llamadas
    expect(mockLoadingService.show).toHaveBeenCalledTimes(1);
    expect(mockLoadingService.hide).toHaveBeenCalledTimes(1);
  }));

  it('debería integrar correctamente ToastService en flujo exitoso', fakeAsync(() => {
    const respuestaSimulada = {
      token: 'token-jwt',
      type: 'Bearer',
      id: 1,
      username: 'test',
      email: 'test@test.com',
      rol: 'USER',
      isOnboarded: false,
    };

    mockAuthService.register.and.returnValue(of(respuestaSimulada));

    component.registerForm.patchValue({
      name: 'Test User',
      username: 'testuser',
      email: 'test@test.com',
      password: 'Password123!@#',
      confirmPassword: 'Password123!@#',
    });

    tick(600);

    component.onSubmit();

    expect(mockToastService.success).toHaveBeenCalledWith('Registro exitoso. ¡Bienvenido!');
    expect(mockToastService.error).not.toHaveBeenCalled();
  }));

  it('debería integrar correctamente Router después de registro exitoso', fakeAsync(() => {
    const respuestaSimulada = {
      token: 'token-jwt',
      type: 'Bearer',
      id: 1,
      username: 'test',
      email: 'test@test.com',
      rol: 'USER',
      isOnboarded: false,
    };

    mockAuthService.register.and.returnValue(of(respuestaSimulada));

    component.registerForm.patchValue({
      name: 'Test User',
      username: 'testuser',
      email: 'test@test.com',
      password: 'Password123!@#',
      confirmPassword: 'Password123!@#',
    });

    tick(600);

    component.onSubmit();

    // Verificar navegación a onboarding
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/onboarding']);
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
  }));
});
