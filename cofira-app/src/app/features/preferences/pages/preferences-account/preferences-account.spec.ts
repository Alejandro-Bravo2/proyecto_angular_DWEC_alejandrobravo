import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

import { PreferencesAccount } from './preferences-account';
import { CheckoutService } from '../../../checkout/services/checkout.service';
import { ToastService } from '../../../../core/services/toast.service';
import { SubscriptionStore } from '../../../../core/stores/subscription.store';
import { TipoPlan, MetodoPago } from '../../../checkout/models/checkout.model';

describe('PreferencesAccount', () => {
  let component: PreferencesAccount;
  let fixture: ComponentFixture<PreferencesAccount>;
  let router: Router;
  let mockCheckoutService: jasmine.SpyObj<CheckoutService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockSubscriptionStore: Partial<SubscriptionStore>;

  beforeEach(async () => {
    mockCheckoutService = jasmine.createSpyObj('CheckoutService', ['cancelarSubscripcion']);
    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);

    const subscripcionActivaSignal = signal(true);
    const tipoPlanSignal = signal<TipoPlan | null>('MENSUAL');
    const nombrePlanSignal = signal<string | null>('Premium');
    const precioSignal = signal<number | null>(9.99);
    const fechaInicioSignal = signal<string | null>('2024-01-01');
    const fechaFinSignal = signal<string | null>('2024-02-01');
    const diasRestantesSignal = signal(15);
    const metodoPagoSignal = signal<MetodoPago | null>('TARJETA');
    const ultimosDigitosTarjetaSignal = signal<string | null>('1234');
    const loadingSignal = signal(false);

    mockSubscriptionStore = {
      subscripcionActiva: subscripcionActivaSignal.asReadonly(),
      tipoPlan: tipoPlanSignal.asReadonly(),
      nombrePlan: nombrePlanSignal.asReadonly(),
      precio: precioSignal.asReadonly(),
      fechaInicio: fechaInicioSignal.asReadonly(),
      fechaFin: fechaFinSignal.asReadonly(),
      diasRestantes: diasRestantesSignal.asReadonly(),
      metodoPago: metodoPagoSignal.asReadonly(),
      ultimosDigitosTarjeta: ultimosDigitosTarjetaSignal.asReadonly(),
      loading: loadingSignal.asReadonly(),
      cargarEstado: jasmine.createSpy('cargarEstado'),
    };

    await TestBed.configureTestingModule({
      imports: [PreferencesAccount],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: CheckoutService, useValue: mockCheckoutService },
        { provide: ToastService, useValue: mockToastService },
        { provide: SubscriptionStore, useValue: mockSubscriptionStore },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(PreferencesAccount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deberia crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Estado inicial', () => {
    it('deberia iniciar con isEditing en false', () => {
      expect(component.isEditing()).toBeFalse();
    });

    it('deberia iniciar con isSaving en false', () => {
      expect(component.isSaving()).toBeFalse();
    });

    it('deberia iniciar con isCancellingSubscription en false', () => {
      expect(component.isCancellingSubscription()).toBeFalse();
    });

    it('deberia tener el formulario con valores por defecto', () => {
      expect(component.accountForm.get('name')?.value).toBe('Usuario COFIRA');
      expect(component.accountForm.get('email')?.value).toBe('usuario@cofira.com');
      expect(component.accountForm.get('phone')?.value).toBe('');
    });

    it('deberia tener configuraciones de privacidad por defecto', () => {
      const privacidad = component.privacySettings();
      expect(privacidad.publicProfile).toBeTrue();
      expect(privacidad.showProgress).toBeTrue();
      expect(privacidad.shareStats).toBeFalse();
    });
  });

  describe('Validacion del formulario', () => {
    it('deberia requerir el nombre', () => {
      component.accountForm.get('name')?.setValue('');
      expect(component.accountForm.get('name')?.valid).toBeFalse();
    });

    it('deberia requerir el email', () => {
      component.accountForm.get('email')?.setValue('');
      expect(component.accountForm.get('email')?.valid).toBeFalse();
    });

    it('deberia validar el formato del email', () => {
      component.accountForm.get('email')?.setValue('emailinvalido');
      expect(component.accountForm.get('email')?.valid).toBeFalse();

      component.accountForm.get('email')?.setValue('valido@ejemplo.com');
      expect(component.accountForm.get('email')?.valid).toBeTrue();
    });

    it('deberia permitir telefono vacio', () => {
      component.accountForm.get('phone')?.setValue('');
      expect(component.accountForm.get('phone')?.valid).toBeTrue();
    });
  });

  describe('toggleEdit', () => {
    it('deberia alternar el estado de edicion', () => {
      expect(component.isEditing()).toBeFalse();

      component.toggleEdit();
      expect(component.isEditing()).toBeTrue();

      component.toggleEdit();
      expect(component.isEditing()).toBeFalse();
    });
  });

  describe('saveChanges', () => {
    it('deberia establecer isSaving en true al guardar', fakeAsync(() => {
      component.isEditing.set(true);
      component.accountForm.markAsDirty();

      component.saveChanges();
      expect(component.isSaving()).toBeTrue();

      tick(1000);
      expect(component.isSaving()).toBeFalse();
    }));

    it('deberia desactivar el modo edicion despues de guardar', fakeAsync(() => {
      component.isEditing.set(true);
      component.accountForm.markAsDirty();

      component.saveChanges();
      tick(1000);

      expect(component.isEditing()).toBeFalse();
    }));

    it('deberia marcar el formulario como pristine despues de guardar', fakeAsync(() => {
      component.accountForm.markAsDirty();

      component.saveChanges();
      tick(1000);

      expect(component.accountForm.pristine).toBeTrue();
    }));

    it('no deberia guardar si el formulario es invalido', fakeAsync(() => {
      component.accountForm.get('email')?.setValue('');

      component.saveChanges();
      tick(1000);

      expect(component.isSaving()).toBeFalse();
    }));
  });

  describe('cancelEdit', () => {
    it('deberia restaurar los valores originales del formulario', () => {
      component.accountForm.get('name')?.setValue('Nuevo Nombre');
      component.accountForm.get('email')?.setValue('nuevo@email.com');
      component.isEditing.set(true);

      component.cancelEdit();

      expect(component.accountForm.get('name')?.value).toBe('Usuario COFIRA');
      expect(component.accountForm.get('email')?.value).toBe('usuario@cofira.com');
    });

    it('deberia desactivar el modo edicion', () => {
      component.isEditing.set(true);

      component.cancelEdit();

      expect(component.isEditing()).toBeFalse();
    });
  });

  describe('updatePrivacy', () => {
    it('deberia alternar publicProfile', () => {
      const estadoInicial = component.privacySettings().publicProfile;

      component.updatePrivacy('publicProfile');

      expect(component.privacySettings().publicProfile).toBe(!estadoInicial);
    });

    it('deberia alternar showProgress', () => {
      const estadoInicial = component.privacySettings().showProgress;

      component.updatePrivacy('showProgress');

      expect(component.privacySettings().showProgress).toBe(!estadoInicial);
    });

    it('deberia alternar shareStats', () => {
      const estadoInicial = component.privacySettings().shareStats;

      component.updatePrivacy('shareStats');

      expect(component.privacySettings().shareStats).toBe(!estadoInicial);
    });

    it('no deberia afectar otras configuraciones al alternar una', () => {
      const publicProfileInicial = component.privacySettings().publicProfile;
      const showProgressInicial = component.privacySettings().showProgress;

      component.updatePrivacy('shareStats');

      expect(component.privacySettings().publicProfile).toBe(publicProfileInicial);
      expect(component.privacySettings().showProgress).toBe(showProgressInicial);
    });
  });

  describe('cancelarSubscripcion', () => {
    beforeEach(() => {
      spyOn(window, 'confirm').and.returnValue(true);
    });

    it('deberia mostrar dialogo de confirmacion', () => {
      mockCheckoutService.cancelarSubscripcion.and.returnValue(
        of({ mensaje: 'Cancelada', estado: 'CANCELADA' })
      );

      component.cancelarSubscripcion();

      expect(window.confirm).toHaveBeenCalled();
    });

    it('no deberia cancelar si el usuario no confirma', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);

      component.cancelarSubscripcion();

      expect(mockCheckoutService.cancelarSubscripcion).not.toHaveBeenCalled();
    });

    it('deberia llamar al servicio de checkout cuando se confirma', () => {
      mockCheckoutService.cancelarSubscripcion.and.returnValue(
        of({ mensaje: 'Cancelada', estado: 'CANCELADA' })
      );

      component.cancelarSubscripcion();

      expect(mockCheckoutService.cancelarSubscripcion).toHaveBeenCalled();
    });

    it('deberia mostrar toast de exito cuando la cancelacion es exitosa', () => {
      mockCheckoutService.cancelarSubscripcion.and.returnValue(
        of({ mensaje: 'Cancelada', estado: 'CANCELADA' })
      );

      component.cancelarSubscripcion();

      expect(mockToastService.success).toHaveBeenCalledWith(
        'Subscripcion cancelada correctamente'
      );
    });

    it('deberia cargar el estado del store despues de cancelar', () => {
      mockCheckoutService.cancelarSubscripcion.and.returnValue(
        of({ mensaje: 'Cancelada', estado: 'CANCELADA' })
      );

      component.cancelarSubscripcion();

      expect(mockSubscriptionStore.cargarEstado).toHaveBeenCalled();
    });

    it('deberia establecer isCancellingSubscription en false al terminar', () => {
      mockCheckoutService.cancelarSubscripcion.and.returnValue(
        of({ mensaje: 'Cancelada', estado: 'CANCELADA' })
      );

      component.cancelarSubscripcion();

      expect(component.isCancellingSubscription()).toBeFalse();
    });

    it('deberia mostrar toast de error cuando falla la cancelacion', () => {
      mockCheckoutService.cancelarSubscripcion.and.returnValue(
        throwError(() => new Error('Error de red'))
      );

      component.cancelarSubscripcion();

      expect(mockToastService.error).toHaveBeenCalledWith(
        'Error al cancelar la subscripcion'
      );
    });

    it('deberia establecer isCancellingSubscription en false cuando hay error', () => {
      mockCheckoutService.cancelarSubscripcion.and.returnValue(
        throwError(() => new Error('Error de red'))
      );

      component.cancelarSubscripcion();

      expect(component.isCancellingSubscription()).toBeFalse();
    });
  });

  describe('canDeactivate', () => {
    it('deberia retornar true si el formulario no tiene cambios', () => {
      component.accountForm.markAsPristine();

      const resultado = component.canDeactivate();

      expect(resultado).toBeTrue();
    });

    it('deberia mostrar confirmacion si el formulario tiene cambios sin guardar', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.accountForm.markAsDirty();

      component.canDeactivate();

      expect(window.confirm).toHaveBeenCalled();
    });

    it('deberia retornar true si el usuario confirma salir', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.accountForm.markAsDirty();

      const resultado = component.canDeactivate();

      expect(resultado).toBeTrue();
    });

    it('deberia retornar false si el usuario cancela salir', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.accountForm.markAsDirty();

      const resultado = component.canDeactivate();

      expect(resultado).toBeFalse();
    });
  });

  describe('changePassword', () => {
    it('deberia navegar con queryParams y fragment', () => {
      component.changePassword();

      expect(router.navigate).toHaveBeenCalledWith(['/preferencias/cuenta'], {
        queryParams: { action: 'change-password' },
        fragment: 'security',
      });
    });
  });

  describe('SubscriptionStore', () => {
    it('deberia tener acceso al subscriptionStore', () => {
      expect(component.subscriptionStore).toBeTruthy();
    });
  });

  it('deberia ser un componente standalone', () => {
    const esStandalone = (PreferencesAccount as any).ɵcmp?.standalone;
    expect(esStandalone).toBeTrue();
  });

  it('deberia implementar CanComponentDeactivate', () => {
    expect(typeof component.canDeactivate).toBe('function');
  });
});
