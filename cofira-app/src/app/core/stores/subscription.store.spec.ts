import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { SubscriptionStore } from './subscription.store';
import { CheckoutService } from '../../features/checkout/services/checkout.service';
import { AuthService } from '../auth/auth.service';
import { SubscripcionEstado } from '../../features/checkout/models/checkout.model';
import { of, throwError, Subject } from 'rxjs';
import { signal } from '@angular/core';

describe('SubscriptionStore', () => {
  let store: SubscriptionStore;
  let checkoutServiceSpy: jasmine.SpyObj<CheckoutService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockEstadoActivo: SubscripcionEstado = {
    activa: true,
    tipoPlan: 'MENSUAL',
    nombrePlan: 'Plan Mensual',
    precio: 19,
    fechaInicio: '2024-01-01',
    fechaFin: '2024-02-01',
    diasRestantes: 15,
    metodoPago: 'TARJETA',
    ultimosDigitosTarjeta: '1234',
  };

  const mockEstadoInactivo: SubscripcionEstado = {
    activa: false,
  };

  beforeEach(() => {
    const checkoutSpy = jasmine.createSpyObj('CheckoutService', ['obtenerEstadoSubscripcion']);
    const authSpy = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated: signal(false),
    });

    TestBed.configureTestingModule({
      providers: [
        SubscriptionStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CheckoutService, useValue: checkoutSpy },
        { provide: AuthService, useValue: authSpy },
      ],
    });

    checkoutServiceSpy = TestBed.inject(CheckoutService) as jasmine.SpyObj<CheckoutService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    store = TestBed.inject(SubscriptionStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have subscripcionActiva as false', () => {
      expect(store.subscripcionActiva()).toBeFalse();
    });

    it('should have tipoPlan as null', () => {
      expect(store.tipoPlan()).toBeNull();
    });

    it('should have loading as false', () => {
      expect(store.loading()).toBeFalse();
    });

    it('should have error as null', () => {
      expect(store.error()).toBeNull();
    });

    it('should have isPremium as false', () => {
      expect(store.isPremium()).toBeFalse();
    });

    it('should have badgeText as null', () => {
      expect(store.badgeText()).toBeNull();
    });
  });

  describe('cargarEstado', () => {
    it('should load subscription state successfully', fakeAsync(() => {
      checkoutServiceSpy.obtenerEstadoSubscripcion.and.returnValue(of(mockEstadoActivo));

      store.cargarEstado();
      tick();

      expect(store.subscripcionActiva()).toBeTrue();
      expect(store.tipoPlan()).toBe('MENSUAL');
      expect(store.nombrePlan()).toBe('Plan Mensual');
      expect(store.precio()).toBe(19);
      expect(store.diasRestantes()).toBe(15);
      expect(store.loading()).toBeFalse();
    }));

    it('should handle inactive subscription', fakeAsync(() => {
      checkoutServiceSpy.obtenerEstadoSubscripcion.and.returnValue(of(mockEstadoInactivo));

      store.cargarEstado();
      tick();

      expect(store.subscripcionActiva()).toBeFalse();
      expect(store.tipoPlan()).toBeNull();
    }));

    it('should set error on failure', fakeAsync(() => {
      checkoutServiceSpy.obtenerEstadoSubscripcion.and.returnValue(
        throwError(() => new Error('Network error'))
      );

      store.cargarEstado();
      tick();

      expect(store.error()).toBe('Error al cargar estado de subscripcion');
      expect(store.loading()).toBeFalse();
    }));

    it('should set loading to true while loading', fakeAsync(() => {
      // Use Subject to control when the observable emits
      const subject = new Subject<SubscripcionEstado>();
      checkoutServiceSpy.obtenerEstadoSubscripcion.and.returnValue(subject.asObservable());

      store.cargarEstado();

      // At this point, observable hasn't emitted yet
      expect(store.loading()).toBeTrue();

      // Complete the observable
      subject.next(mockEstadoActivo);
      subject.complete();
      tick();

      expect(store.loading()).toBeFalse();
    }));
  });

  describe('actualizarEstado', () => {
    it('should update state from response', () => {
      store.actualizarEstado(mockEstadoActivo);

      expect(store.subscripcionActiva()).toBeTrue();
      expect(store.tipoPlan()).toBe('MENSUAL');
      expect(store.precio()).toBe(19);
      expect(store.metodoPago()).toBe('TARJETA');
      expect(store.ultimosDigitosTarjeta()).toBe('1234');
    });

    it('should handle partial state', () => {
      const partialEstado: SubscripcionEstado = {
        activa: true,
        tipoPlan: 'ANUAL',
      };

      store.actualizarEstado(partialEstado);

      expect(store.subscripcionActiva()).toBeTrue();
      expect(store.tipoPlan()).toBe('ANUAL');
      expect(store.precio()).toBeNull();
    });

    it('should handle estado with activa as false explicitly', () => {
      const estadoConActivaFalse: SubscripcionEstado = {
        activa: false,
        tipoPlan: 'MENSUAL',
      };

      store.actualizarEstado(estadoConActivaFalse);

      // Debería establecerse en false
      expect(store.subscripcionActiva()).toBeFalse();
      expect(store.tipoPlan()).toBe('MENSUAL');
    });
  });

  describe('limpiar', () => {
    it('should clear all state', () => {
      store.actualizarEstado(mockEstadoActivo);

      store.limpiar();

      expect(store.subscripcionActiva()).toBeFalse();
      expect(store.tipoPlan()).toBeNull();
      expect(store.nombrePlan()).toBeNull();
      expect(store.precio()).toBeNull();
      expect(store.fechaInicio()).toBeNull();
      expect(store.fechaFin()).toBeNull();
      expect(store.diasRestantes()).toBe(0);
      expect(store.metodoPago()).toBeNull();
      expect(store.ultimosDigitosTarjeta()).toBeNull();
      expect(store.error()).toBeNull();
    });
  });

  describe('computed: estado', () => {
    it('should return complete estado object', () => {
      store.actualizarEstado(mockEstadoActivo);

      const estado = store.estado();

      expect(estado.activa).toBeTrue();
      expect(estado.tipoPlan).toBe('MENSUAL');
      expect(estado.nombrePlan).toBe('Plan Mensual');
      expect(estado.precio).toBe(19);
    });

    it('should return estado with undefined values when inactive', () => {
      const estado = store.estado();

      expect(estado.activa).toBeFalse();
      expect(estado.tipoPlan).toBeUndefined();
    });
  });

  describe('computed: isPremium', () => {
    it('should return true when subscripcion is active', () => {
      store.actualizarEstado(mockEstadoActivo);

      expect(store.isPremium()).toBeTrue();
    });

    it('should return false when subscripcion is inactive', () => {
      store.actualizarEstado(mockEstadoInactivo);

      expect(store.isPremium()).toBeFalse();
    });
  });

  describe('computed: badgeText', () => {
    it('should return null when not subscribed', () => {
      expect(store.badgeText()).toBeNull();
    });

    it('should return PRO for annual plan', () => {
      const anualEstado: SubscripcionEstado = {
        activa: true,
        tipoPlan: 'ANUAL',
      };

      store.actualizarEstado(anualEstado);

      expect(store.badgeText()).toBe('PRO');
    });

    it('should return PREMIUM for monthly plan', () => {
      store.actualizarEstado(mockEstadoActivo);

      expect(store.badgeText()).toBe('PREMIUM');
    });
  });

  describe('authentication effect', () => {
    it('should call cargarEstado when user is authenticated', fakeAsync(() => {
      // Configurar authService para devolver true
      const authenticatedSignal = signal(true);
      Object.defineProperty(authServiceSpy, 'isAuthenticated', {
        value: authenticatedSignal,
        writable: true
      });

      // Mock del servicio de checkout
      checkoutServiceSpy.obtenerEstadoSubscripcion.and.returnValue(of(mockEstadoActivo));

      // Recrear el store con el authService actualizado
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          SubscriptionStore,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: CheckoutService, useValue: checkoutServiceSpy },
          { provide: AuthService, useValue: authServiceSpy },
        ],
      });

      const nuevoStore = TestBed.inject(SubscriptionStore);
      tick();

      // Debería haber cargado el estado
      expect(checkoutServiceSpy.obtenerEstadoSubscripcion).toHaveBeenCalled();
    }));

    it('should call limpiar when user is not authenticated', fakeAsync(() => {
      // Primero cargar datos
      store.actualizarEstado(mockEstadoActivo);
      expect(store.subscripcionActiva()).toBeTrue();

      // Cambiar a no autenticado
      const unauthenticatedSignal = signal(false);
      Object.defineProperty(authServiceSpy, 'isAuthenticated', {
        value: unauthenticatedSignal,
        writable: true
      });

      // Recrear el store con el authService actualizado
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          SubscriptionStore,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: CheckoutService, useValue: checkoutServiceSpy },
          { provide: AuthService, useValue: authServiceSpy },
        ],
      });

      const nuevoStore = TestBed.inject(SubscriptionStore);
      tick();

      // Debería haber limpiado el estado
      expect(nuevoStore.subscripcionActiva()).toBeFalse();
      expect(nuevoStore.tipoPlan()).toBeNull();
    }));
  });
});
