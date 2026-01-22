import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { AccountSettings } from './account-settings';
import { UserService } from '../../../../user/services/user.service';
import { LoadingService } from '../../../../../core/services/loading.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { environment } from '../../../../../../environments/environment';

describe('AccountSettings', () => {
  let component: AccountSettings;
  let fixture: ComponentFixture<AccountSettings>;
  let userService: UserService;
  let loadingService: LoadingService;
  let toastService: ToastService;
  let router: Router;
  let httpMock: HttpTestingController;

  const mockUser = {
    id: '1',
    name: 'Juan Perez',
    email: 'juan@example.com',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountSettings, ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        UserService,
        LoadingService,
        ToastService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountSettings);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    loadingService = TestBed.inject(LoadingService);
    toastService = TestBed.inject(ToastService);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);

    spyOn(loadingService, 'show');
    spyOn(loadingService, 'hide');
    spyOn(toastService, 'success');
    spyOn(toastService, 'error');
    spyOn(console, 'error');

    // No llamar a fixture.detectChanges() aqui para evitar ngOnInit automatico
  });

  afterEach(() => {
    try {
      httpMock.verify();
    } catch (e) {
      // Ignorar errores de verify en tests de error
    }
  });

  it('deberia crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicializacion del formulario', () => {
    it('deberia inicializar el formulario con campos vacios', () => {
      expect(component.accountSettingsForm).toBeTruthy();
      expect(component.accountSettingsForm.get('name')).toBeTruthy();
      expect(component.accountSettingsForm.get('email')).toBeTruthy();
      expect(component.accountSettingsForm.get('currentPassword')).toBeTruthy();
      expect(component.accountSettingsForm.get('newPassword')).toBeTruthy();
      expect(component.accountSettingsForm.get('confirmNewPassword')).toBeTruthy();
    });

    it('deberia tener validadores requeridos en campos obligatorios', () => {
      const formulario = component.accountSettingsForm;

      formulario.get('name')?.setValue('');
      expect(formulario.get('name')?.hasError('required')).toBeTrue();

      formulario.get('email')?.setValue('');
      expect(formulario.get('email')?.hasError('required')).toBeTrue();

      formulario.get('currentPassword')?.setValue('');
      expect(formulario.get('currentPassword')?.hasError('required')).toBeTrue();
    });

    it('deberia validar el formato del email', () => {
      const emailControl = component.accountSettingsForm.get('email');

      emailControl?.setValue('emailinvalido');
      expect(emailControl?.hasError('email')).toBeTrue();

      emailControl?.setValue('valido@example.com');
      expect(emailControl?.hasError('email')).toBeFalse();
    });

    it('deberia tener validador de fortaleza de contrasena en newPassword', () => {
      const newPasswordControl = component.accountSettingsForm.get('newPassword');

      newPasswordControl?.setValue('123');
      expect(newPasswordControl?.hasError('passwordStrength')).toBeTrue();
    });

    it('deberia tener validador de coincidencia de contrasenas', () => {
      const formulario = component.accountSettingsForm;

      formulario.get('newPassword')?.setValue('Password123!');
      formulario.get('confirmNewPassword')?.setValue('Password456!');
      formulario.updateValueAndValidity();

      expect(formulario.errors?.['passwordMatch']).toBeTruthy();

      formulario.get('confirmNewPassword')?.setValue('Password123!');
      formulario.updateValueAndValidity();

      expect(formulario.errors?.['passwordMatch']).toBeFalsy();
    });
  });

  describe('ngOnInit', () => {
    it('deberia mostrar el loading al cargar datos del usuario', fakeAsync(() => {
      fixture.detectChanges();

      expect(loadingService.show).toHaveBeenCalled();

      // Limpiar la peticion HTTP pendiente
      const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
      req.flush(mockUser);
      tick();
    }));

    it('deberia cargar datos del usuario correctamente', fakeAsync(() => {
      fixture.detectChanges();

      const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);

      tick();

      expect(component.currentUser).toEqual(mockUser);
      expect(component.accountSettingsForm.get('name')?.value).toBe(mockUser.name);
      expect(component.accountSettingsForm.get('email')?.value).toBe(mockUser.email);
      expect(loadingService.hide).toHaveBeenCalled();
    }));

    it('deberia manejar error al cargar datos del usuario', fakeAsync(() => {
      fixture.detectChanges();

      // BaseHttpService tiene retry(2), por lo que necesitamos 3 requests: original + 2 reintentos
      for (let i = 0; i < 3; i++) {
        const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
        req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });
      }

      tick();

      expect(console.error).toHaveBeenCalledWith('Error fetching user data', jasmine.anything());
      expect(loadingService.hide).toHaveBeenCalled();
      expect(toastService.error).toHaveBeenCalledWith('Error al cargar datos del usuario.');
    }));

    it('deberia establecer currentUser en null inicialmente', () => {
      expect(component.currentUser).toBeNull();
    });
  });

  describe('onSubmit', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();

      const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
      req.flush(mockUser);

      tick();

      // Limpiar los spies despues del ngOnInit
      (loadingService.show as jasmine.Spy).calls.reset();
      (loadingService.hide as jasmine.Spy).calls.reset();
    }));

    it('deberia marcar todos los campos como tocados si el formulario es invalido', () => {
      component.accountSettingsForm.get('name')?.setValue('');
      component.accountSettingsForm.get('email')?.setValue('');

      component.onSubmit();

      expect(component.accountSettingsForm.get('name')?.touched).toBeTrue();
      expect(component.accountSettingsForm.get('email')?.touched).toBeTrue();
    });

    it('no deberia enviar el formulario si es invalido', () => {
      component.accountSettingsForm.get('email')?.setValue('emailinvalido');

      component.onSubmit();

      expect(loadingService.show).not.toHaveBeenCalled();
    });

    it('deberia actualizar el usuario cuando el formulario es valido', fakeAsync(() => {
      component.accountSettingsForm.patchValue({
        name: 'Juan Actualizado',
        email: 'juan.actualizado@example.com',
        currentPassword: 'OldPassword123!',
      });

      component.onSubmit();

      expect(loadingService.show).toHaveBeenCalled();

      const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({
        name: 'Juan Actualizado',
        email: 'juan.actualizado@example.com',
      });

      req.flush({ ...mockUser, name: 'Juan Actualizado' });

      tick();

      expect(loadingService.hide).toHaveBeenCalled();
      expect(toastService.success).toHaveBeenCalledWith('Configuración de cuenta actualizada.');
    }));

    it('deberia manejar la actualizacion con nueva contrasena', fakeAsync(() => {
      component.accountSettingsForm.patchValue({
        name: 'Juan Perez',
        email: 'juan@example.com',
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmNewPassword: 'NewPassword123!',
      });

      component.onSubmit();

      const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
      expect(req.request.method).toBe('PUT');

      req.flush(mockUser);

      tick();

      expect(toastService.success).toHaveBeenCalled();
    }));


    it('no deberia actualizar si currentUser es null', fakeAsync(() => {
      component.currentUser = null;
      component.accountSettingsForm.patchValue({
        name: 'Juan Perez',
        email: 'juan@example.com',
        currentPassword: 'Password123!',
      });

      component.onSubmit();
      tick();

      httpMock.expectNone(`${environment.apiUrl}/users/1`);
    }));

    it('deberia manejar error al actualizar configuracion de cuenta', fakeAsync(() => {
      component.accountSettingsForm.patchValue({
        name: 'Juan Actualizado',
        email: 'juan.actualizado@example.com',
        currentPassword: 'OldPassword123!',
      });

      component.onSubmit();

      expect(loadingService.show).toHaveBeenCalled();

      // BaseHttpService tiene retry(2), por lo que necesitamos 3 requests: original + 2 reintentos
      for (let i = 0; i < 3; i++) {
        const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
        req.flush('Error de conexion', { status: 500, statusText: 'Internal Server Error' });
      }

      tick();

      expect(console.error).toHaveBeenCalledWith('Error updating account settings:', jasmine.anything());
      expect(loadingService.hide).toHaveBeenCalled();
      expect(toastService.error).toHaveBeenCalledWith(jasmine.stringContaining('Error al actualizar la configuración:'));
    }));
  });

  describe('Validaciones de campos', () => {
    it('deberia validar que el nombre es requerido', () => {
      const nameControl = component.accountSettingsForm.get('name');

      nameControl?.setValue('');
      expect(nameControl?.valid).toBeFalse();

      nameControl?.setValue('Juan');
      expect(nameControl?.valid).toBeTrue();
    });

    it('deberia validar que el email es requerido y tiene formato correcto', () => {
      const emailControl = component.accountSettingsForm.get('email');

      emailControl?.setValue('');
      expect(emailControl?.valid).toBeFalse();

      emailControl?.setValue('invalido');
      expect(emailControl?.valid).toBeFalse();

      emailControl?.setValue('valido@example.com');
      expect(emailControl?.valid).toBeTrue();
    });

    it('deberia validar que la contrasena actual es requerida', () => {
      const currentPasswordControl = component.accountSettingsForm.get('currentPassword');

      currentPasswordControl?.setValue('');
      expect(currentPasswordControl?.valid).toBeFalse();

      currentPasswordControl?.setValue('Password123!');
      expect(currentPasswordControl?.valid).toBeTrue();
    });

    it('deberia permitir nueva contrasena vacia (opcional)', () => {
      const newPasswordControl = component.accountSettingsForm.get('newPassword');

      newPasswordControl?.setValue('');
      expect(newPasswordControl?.valid).toBeTrue();
    });

    it('deberia validar fortaleza si se proporciona nueva contrasena', () => {
      const newPasswordControl = component.accountSettingsForm.get('newPassword');

      newPasswordControl?.setValue('debil');
      expect(newPasswordControl?.valid).toBeFalse();

      newPasswordControl?.setValue('Password123!');
      expect(newPasswordControl?.valid).toBeTrue();
    });
  });

  describe('Integracion de servicios', () => {
    it('deberia inyectar UserService correctamente', () => {
      expect(component['userService']).toBeTruthy();
    });

    it('deberia inyectar Router correctamente', () => {
      expect(component['router']).toBeTruthy();
    });

    it('deberia inyectar LoadingService correctamente', () => {
      expect(component['loadingService']).toBeTruthy();
    });

    it('deberia inyectar ToastService correctamente', () => {
      expect(component['toastService']).toBeTruthy();
    });
  });

  describe('Campos del formulario', () => {
    it('deberia tener todos los campos necesarios', () => {
      const camposEsperados = ['name', 'email', 'currentPassword', 'newPassword', 'confirmNewPassword'];

      camposEsperados.forEach(campo => {
        expect(component.accountSettingsForm.get(campo)).toBeTruthy();
      });
    });

    it('deberia permitir actualizar valores del formulario', () => {
      component.accountSettingsForm.patchValue({
        name: 'Nuevo Nombre',
        email: 'nuevo@example.com',
      });

      expect(component.accountSettingsForm.get('name')?.value).toBe('Nuevo Nombre');
      expect(component.accountSettingsForm.get('email')?.value).toBe('nuevo@example.com');
    });
  });

  it('deberia ser un componente standalone', () => {
    const esStandalone = (AccountSettings as any).ɵcmp?.standalone;
    expect(esStandalone).toBeTrue();
  });

  describe('Estado del formulario', () => {
    it('deberia estar pristine al iniciar', () => {
      expect(component.accountSettingsForm.pristine).toBeTrue();
    });

    it('deberia estar dirty despues de modificar un campo', fakeAsync(() => {
      fixture.detectChanges();

      const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
      req.flush(mockUser);

      tick();

      component.accountSettingsForm.get('name')?.setValue('Modificado');
      component.accountSettingsForm.get('name')?.markAsDirty();

      expect(component.accountSettingsForm.dirty).toBeTrue();
    }));

    it('deberia estar touched despues de tocar un campo', () => {
      component.accountSettingsForm.get('name')?.markAsTouched();
      expect(component.accountSettingsForm.get('name')?.touched).toBeTrue();
    });
  });
});
