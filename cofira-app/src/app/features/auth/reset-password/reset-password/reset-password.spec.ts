import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ResetPassword } from './reset-password';
import { AuthService } from '../../../../core/auth/auth.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { ToastService } from '../../../../core/services/toast.service';

describe('ResetPassword', () => {
  let component: ResetPassword;
  let fixture: ComponentFixture<ResetPassword>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;
  let loadingServiceMock: jasmine.SpyObj<LoadingService>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    // Crear mocks de los servicios
    authServiceMock = jasmine.createSpyObj('AuthService', [
      'requestPasswordResetCode',
      'resetPasswordWithCode',
    ]);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    loadingServiceMock = jasmine.createSpyObj('LoadingService', ['show', 'hide']);
    toastServiceMock = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [ResetPassword],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: LoadingService, useValue: loadingServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test 1: Creación del componente
  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  // Test 2: Inicialización del estado
  it('debería inicializar codeSent como false', () => {
    expect(component.codeSent).toBe(false);
  });

  // Test 3: Inicialización del emailForm
  it('debería inicializar emailForm con un control de email', () => {
    expect(component.emailForm).toBeDefined();
    expect(component.emailForm.get('email')).toBeDefined();
  });

  // Test 4: Inicialización del resetForm
  it('debería inicializar resetForm con controles code, newPassword y confirmNewPassword', () => {
    expect(component.resetForm).toBeDefined();
    expect(component.resetForm.get('code')).toBeDefined();
    expect(component.resetForm.get('newPassword')).toBeDefined();
    expect(component.resetForm.get('confirmNewPassword')).toBeDefined();
  });

  // Test 5: Validación de email vacío
  it('debería invalidar emailForm cuando el email está vacío', () => {
    const controlDeEmail = component.emailForm.get('email');
    controlDeEmail?.setValue('');
    expect(component.emailForm.valid).toBe(false);
    expect(controlDeEmail?.errors?.['required']).toBe(true);
  });

  // Test 6: Validación de email inválido
  it('debería invalidar emailForm cuando el email tiene formato inválido', () => {
    const controlDeEmail = component.emailForm.get('email');
    controlDeEmail?.setValue('email-invalido');
    expect(component.emailForm.valid).toBe(false);
    expect(controlDeEmail?.errors?.['email']).toBe(true);
  });

  // Test 7: Validación de email válido
  it('debería validar emailForm cuando el email es válido', () => {
    const controlDeEmail = component.emailForm.get('email');
    controlDeEmail?.setValue('usuario@example.com');
    expect(component.emailForm.valid).toBe(true);
  });

  // Test 8: Validación de código vacío
  it('debería invalidar resetForm cuando el código está vacío', () => {
    const controlDeCodigo = component.resetForm.get('code');
    controlDeCodigo?.setValue('');
    expect(controlDeCodigo?.errors?.['required']).toBe(true);
  });

  // Test 9: Validación de longitud mínima del código
  it('debería invalidar resetForm cuando el código tiene menos de 6 caracteres', () => {
    const controlDeCodigo = component.resetForm.get('code');
    controlDeCodigo?.setValue('12345');
    expect(controlDeCodigo?.errors?.['minlength']).toBeDefined();
  });

  // Test 10: Validación de código válido
  it('debería validar el código cuando tiene 6 o más caracteres', () => {
    const controlDeCodigo = component.resetForm.get('code');
    controlDeCodigo?.setValue('123456');
    expect(controlDeCodigo?.errors).toBeNull();
  });

  // Test 11: Validación de contraseña débil
  it('debería invalidar newPassword cuando no cumple con los requisitos de fortaleza', () => {
    const controlDePassword = component.resetForm.get('newPassword');
    controlDePassword?.setValue('debil');
    expect(controlDePassword?.errors?.['passwordStrength']).toBe(true);
  });

  // Test 12: Validación de contraseña fuerte
  it('debería validar newPassword cuando cumple todos los requisitos de fortaleza', () => {
    const controlDePassword = component.resetForm.get('newPassword');
    // Contraseña con mayúscula, minúscula, número, carácter especial y 12+ caracteres
    controlDePassword?.setValue('Password123!@#');
    expect(controlDePassword?.errors).toBeNull();
  });

  // Test 13: Validación de contraseñas que no coinciden
  it('debería invalidar resetForm cuando las contraseñas no coinciden', () => {
    component.resetForm.patchValue({
      code: '123456',
      newPassword: 'Password123!@#',
      confirmNewPassword: 'DiferentePassword123!@#',
    });
    expect(component.resetForm.errors?.['passwordMatch']).toBe(true);
  });

  // Test 14: Validación de contraseñas que coinciden
  it('debería validar resetForm cuando las contraseñas coinciden', () => {
    component.resetForm.patchValue({
      code: '123456',
      newPassword: 'Password123!@#',
      confirmNewPassword: 'Password123!@#',
    });
    expect(component.resetForm.errors).toBeNull();
  });

  // Test 15: requestResetCode con email inválido
  it('debería marcar todos los campos como touched cuando emailForm es inválido', () => {
    component.emailForm.get('email')?.setValue('');
    spyOn(component.emailForm, 'markAllAsTouched');

    component.requestResetCode();

    expect(component.emailForm.markAllAsTouched).toHaveBeenCalled();
    expect(authServiceMock.requestPasswordResetCode).not.toHaveBeenCalled();
  });

  // Test 16: requestResetCode con email válido - éxito
  it('debería solicitar código de restablecimiento con email válido y manejar respuesta exitosa', () => {
    const emailDeTest = 'usuario@example.com';
    const respuestaDeExito = { message: 'Código enviado' };

    component.emailForm.get('email')?.setValue(emailDeTest);
    authServiceMock.requestPasswordResetCode.and.returnValue(of(respuestaDeExito));

    component.requestResetCode();

    expect(loadingServiceMock.show).toHaveBeenCalled();
    expect(authServiceMock.requestPasswordResetCode).toHaveBeenCalledWith(emailDeTest);
    expect(loadingServiceMock.hide).toHaveBeenCalled();
    expect(toastServiceMock.success).toHaveBeenCalledWith('Código de restablecimiento enviado a tu email.');
    expect(component.codeSent).toBe(true);
  });

  // Test 17: requestResetCode con email válido - error
  it('debería solicitar código de restablecimiento y manejar errores', () => {
    const emailDeTest = 'usuario@example.com';
    const errorDeTest = { message: 'Email no encontrado' };

    component.emailForm.get('email')?.setValue(emailDeTest);
    authServiceMock.requestPasswordResetCode.and.returnValue(throwError(() => errorDeTest));

    component.requestResetCode();

    expect(loadingServiceMock.show).toHaveBeenCalled();
    expect(authServiceMock.requestPasswordResetCode).toHaveBeenCalledWith(emailDeTest);
    expect(loadingServiceMock.hide).toHaveBeenCalled();
    expect(toastServiceMock.error).toHaveBeenCalledWith('Error al enviar el código: Email no encontrado');
    expect(component.codeSent).toBe(false);
  });

  // Test 18: requestResetCode maneja error sin mensaje
  it('debería mostrar mensaje genérico cuando el error no tiene mensaje', () => {
    const emailDeTest = 'usuario@example.com';
    const errorSinMensaje = {};

    component.emailForm.get('email')?.setValue(emailDeTest);
    authServiceMock.requestPasswordResetCode.and.returnValue(throwError(() => errorSinMensaje));

    component.requestResetCode();

    expect(toastServiceMock.error).toHaveBeenCalledWith('Error al enviar el código: Inténtalo de nuevo.');
  });

  // Test 19: resetPassword con formulario inválido
  it('debería marcar todos los campos como touched cuando resetForm es inválido', () => {
    component.resetForm.patchValue({
      code: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    spyOn(component.resetForm, 'markAllAsTouched');

    component.resetPassword();

    expect(component.resetForm.markAllAsTouched).toHaveBeenCalled();
    expect(authServiceMock.resetPasswordWithCode).not.toHaveBeenCalled();
  });

  // Test 20: resetPassword con formulario válido - éxito
  it('debería restablecer la contraseña con datos válidos y manejar respuesta exitosa', () => {
    const emailDeTest = 'usuario@example.com';
    const codigoDeTest = '123456';
    const passwordDeTest = 'Password123!@#';
    const respuestaDeExito = { message: 'Contraseña restablecida' };

    component.emailForm.get('email')?.setValue(emailDeTest);
    component.resetForm.patchValue({
      code: codigoDeTest,
      newPassword: passwordDeTest,
      confirmNewPassword: passwordDeTest,
    });

    authServiceMock.resetPasswordWithCode.and.returnValue(of(respuestaDeExito));

    component.resetPassword();

    expect(loadingServiceMock.show).toHaveBeenCalled();
    expect(authServiceMock.resetPasswordWithCode).toHaveBeenCalledWith(
      emailDeTest,
      codigoDeTest,
      passwordDeTest
    );
    expect(loadingServiceMock.hide).toHaveBeenCalled();
    expect(toastServiceMock.success).toHaveBeenCalledWith('Contraseña restablecida con éxito.');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  // Test 21: resetPassword con formulario válido - error
  it('debería restablecer la contraseña y manejar errores', () => {
    const emailDeTest = 'usuario@example.com';
    const codigoDeTest = '123456';
    const passwordDeTest = 'Password123!@#';
    const errorDeTest = { message: 'Código inválido' };

    component.emailForm.get('email')?.setValue(emailDeTest);
    component.resetForm.patchValue({
      code: codigoDeTest,
      newPassword: passwordDeTest,
      confirmNewPassword: passwordDeTest,
    });

    authServiceMock.resetPasswordWithCode.and.returnValue(throwError(() => errorDeTest));

    component.resetPassword();

    expect(loadingServiceMock.show).toHaveBeenCalled();
    expect(authServiceMock.resetPasswordWithCode).toHaveBeenCalledWith(
      emailDeTest,
      codigoDeTest,
      passwordDeTest
    );
    expect(loadingServiceMock.hide).toHaveBeenCalled();
    expect(toastServiceMock.error).toHaveBeenCalledWith('Error al restablecer la contraseña: Código inválido');
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  // Test 22: resetPassword maneja error sin mensaje
  it('debería mostrar mensaje genérico cuando el error de resetPassword no tiene mensaje', () => {
    const emailDeTest = 'usuario@example.com';
    const codigoDeTest = '123456';
    const passwordDeTest = 'Password123!@#';
    const errorSinMensaje = {};

    component.emailForm.get('email')?.setValue(emailDeTest);
    component.resetForm.patchValue({
      code: codigoDeTest,
      newPassword: passwordDeTest,
      confirmNewPassword: passwordDeTest,
    });

    authServiceMock.resetPasswordWithCode.and.returnValue(throwError(() => errorSinMensaje));

    component.resetPassword();

    expect(toastServiceMock.error).toHaveBeenCalledWith('Error al restablecer la contraseña: Inténtalo de nuevo.');
  });

  // Test 23: Validación de contraseña sin mayúscula
  it('debería invalidar newPassword cuando falta una letra mayúscula', () => {
    const controlDePassword = component.resetForm.get('newPassword');
    controlDePassword?.setValue('password123!@#');
    expect(controlDePassword?.errors?.['passwordStrength']).toBe(true);
  });

  // Test 24: Validación de contraseña sin minúscula
  it('debería invalidar newPassword cuando falta una letra minúscula', () => {
    const controlDePassword = component.resetForm.get('newPassword');
    controlDePassword?.setValue('PASSWORD123!@#');
    expect(controlDePassword?.errors?.['passwordStrength']).toBe(true);
  });

  // Test 25: Validación de contraseña sin número
  it('debería invalidar newPassword cuando falta un número', () => {
    const controlDePassword = component.resetForm.get('newPassword');
    controlDePassword?.setValue('Password!@#$%');
    expect(controlDePassword?.errors?.['passwordStrength']).toBe(true);
  });

  // Test 26: Validación de contraseña sin carácter especial
  it('debería invalidar newPassword cuando falta un carácter especial', () => {
    const controlDePassword = component.resetForm.get('newPassword');
    controlDePassword?.setValue('Password1234567');
    expect(controlDePassword?.errors?.['passwordStrength']).toBe(true);
  });

  // Test 27: Validación de contraseña demasiado corta
  it('debería invalidar newPassword cuando tiene menos de 12 caracteres', () => {
    const controlDePassword = component.resetForm.get('newPassword');
    controlDePassword?.setValue('Pass123!@');
    expect(controlDePassword?.errors?.['passwordStrength']).toBe(true);
  });

  // Test 28: Flujo completo de dos pasos
  it('debería completar el flujo de dos pasos correctamente', () => {
    // Paso 1: Solicitar código
    const emailDeTest = 'usuario@example.com';
    component.emailForm.get('email')?.setValue(emailDeTest);
    authServiceMock.requestPasswordResetCode.and.returnValue(of({ message: 'Código enviado' }));

    component.requestResetCode();

    expect(component.codeSent).toBe(true);

    // Paso 2: Restablecer contraseña
    const codigoDeTest = '123456';
    const passwordDeTest = 'NuevaPassword123!@#';
    component.resetForm.patchValue({
      code: codigoDeTest,
      newPassword: passwordDeTest,
      confirmNewPassword: passwordDeTest,
    });

    authServiceMock.resetPasswordWithCode.and.returnValue(of({ message: 'Contraseña restablecida' }));

    component.resetPassword();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
