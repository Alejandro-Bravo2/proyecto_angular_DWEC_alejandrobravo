import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { CheckoutStore, CheckoutStep } from './checkout.store';
import { CheckoutService } from '../services/checkout.service';
import { SubscriptionStore } from '../../../core/stores/subscription.store';
import { ToastService } from '../../../core/services/toast.service';
import {
  TipoPlan,
  MetodoPago,
  CheckoutResponse,
  PLANES_INFO,
} from '../models/checkout.model';
import { of, throwError, Subject } from 'rxjs';

describe('CheckoutStore', () => {
  let store: CheckoutStore;
  let checkoutServiceSpy: jasmine.SpyObj<CheckoutService>;
  let subscriptionStoreSpy: jasmine.SpyObj<SubscriptionStore>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let router: Router;

  const mockSuccessResponse: CheckoutResponse = {
    planId: 1,
    tipoPlan: 'MENSUAL',
    precio: 19,
    metodoPago: 'TARJETA',
    fechaInicio: '2024-01-15',
    fechaFin: '2024-02-15',
    exitoso: true,
    mensaje: 'Pago procesado correctamente',
    transaccionId: 'TXN-123456',
  };

  const mockErrorResponse: CheckoutResponse = {
    planId: 0,
    tipoPlan: 'MENSUAL',
    precio: 19,
    metodoPago: 'TARJETA',
    fechaInicio: '',
    fechaFin: '',
    exitoso: false,
    mensaje: 'Error al procesar el pago',
    transaccionId: '',
  };

  beforeEach(() => {
    const checkoutSpy = jasmine.createSpyObj('CheckoutService', ['procesarPago']);
    const subscriptionSpy = jasmine.createSpyObj('SubscriptionStore', ['cargarEstado']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    TestBed.configureTestingModule({
      providers: [
        CheckoutStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'entrenamiento', component: class {} as any },
        ]),
        { provide: CheckoutService, useValue: checkoutSpy },
        { provide: SubscriptionStore, useValue: subscriptionSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    });

    checkoutServiceSpy = TestBed.inject(CheckoutService) as jasmine.SpyObj<CheckoutService>;
    subscriptionStoreSpy = TestBed.inject(SubscriptionStore) as jasmine.SpyObj<SubscriptionStore>;
    toastServiceSpy = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router);
    store = TestBed.inject(CheckoutStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have selectedPlan as null', () => {
      expect(store.selectedPlan()).toBeNull();
    });

    it('should have selectedPaymentMethod as null', () => {
      expect(store.selectedPaymentMethod()).toBeNull();
    });

    it('should have currentStep as summary', () => {
      expect(store.currentStep()).toBe('summary');
    });

    it('should have processing as false', () => {
      expect(store.processing()).toBeFalse();
    });

    it('should have error as null', () => {
      expect(store.error()).toBeNull();
    });

    it('should have response as null', () => {
      expect(store.response()).toBeNull();
    });
  });

  describe('selectPlan', () => {
    it('should set selected plan', () => {
      store.selectPlan('MENSUAL');

      expect(store.selectedPlan()).toBe('MENSUAL');
    });

    it('should clear error when selecting plan', () => {
      store.selectPlan('MENSUAL');

      expect(store.error()).toBeNull();
    });
  });

  describe('selectPaymentMethod', () => {
    it('should set selected payment method', () => {
      store.selectPaymentMethod('TARJETA');

      expect(store.selectedPaymentMethod()).toBe('TARJETA');
    });

    it('should clear error when selecting payment method', () => {
      store.selectPaymentMethod('TARJETA');

      expect(store.error()).toBeNull();
    });
  });

  describe('goToStep', () => {
    it('should change current step', () => {
      store.goToStep('payment');

      expect(store.currentStep()).toBe('payment');
    });
  });

  describe('computed: planInfo', () => {
    it('should return null when no plan selected', () => {
      expect(store.planInfo()).toBeNull();
    });

    it('should return plan info when plan selected', () => {
      store.selectPlan('MENSUAL');

      expect(store.planInfo()).toEqual(PLANES_INFO['MENSUAL']);
    });

    it('should return correct info for ANUAL plan', () => {
      store.selectPlan('ANUAL');

      expect(store.planInfo()?.precio).toBe(199);
      expect(store.planInfo()?.nombre).toBe('Anual');
    });
  });

  describe('computed: canProceedToPayment', () => {
    it('should return false when no plan selected', () => {
      expect(store.canProceedToPayment()).toBeFalse();
    });

    it('should return true when plan selected and not processing', () => {
      store.selectPlan('MENSUAL');

      expect(store.canProceedToPayment()).toBeTrue();
    });
  });

  describe('computed: canProcessPayment', () => {
    it('should return false when no plan selected', () => {
      expect(store.canProcessPayment()).toBeFalse();
    });

    it('should return false when no payment method selected', () => {
      store.selectPlan('MENSUAL');

      expect(store.canProcessPayment()).toBeFalse();
    });

    it('should return true when plan and payment method selected', () => {
      store.selectPlan('MENSUAL');
      store.selectPaymentMethod('TARJETA');

      expect(store.canProcessPayment()).toBeTrue();
    });
  });

  describe('computed: isComplete', () => {
    it('should return false when not on success step', () => {
      expect(store.isComplete()).toBeFalse();
    });
  });

  describe('proceedToPayment', () => {
    it('should go to payment step when can proceed', () => {
      store.selectPlan('MENSUAL');

      store.proceedToPayment();

      expect(store.currentStep()).toBe('payment');
    });

    it('should not change step when cannot proceed', () => {
      store.proceedToPayment();

      expect(store.currentStep()).toBe('summary');
    });
  });

  describe('processPayment', () => {
    it('should set error when no plan selected', () => {
      store.processPayment({});

      expect(store.error()).toBe('Selecciona un plan y metodo de pago');
    });

    it('should set error when no payment method selected', () => {
      store.selectPlan('MENSUAL');

      store.processPayment({});

      expect(store.error()).toBe('Selecciona un plan y metodo de pago');
    });

    it('should process payment successfully', fakeAsync(() => {
      checkoutServiceSpy.procesarPago.and.returnValue(of(mockSuccessResponse));

      store.selectPlan('MENSUAL');
      store.selectPaymentMethod('TARJETA');
      store.processPayment({ nombreTitular: 'Test User' });
      tick();

      expect(store.currentStep()).toBe('success');
      expect(store.response()).toEqual(mockSuccessResponse);
      expect(toastServiceSpy.success).toHaveBeenCalledWith('Pago procesado correctamente');
      expect(subscriptionStoreSpy.cargarEstado).toHaveBeenCalled();
    }));

    it('should handle failed payment response', fakeAsync(() => {
      checkoutServiceSpy.procesarPago.and.returnValue(of(mockErrorResponse));

      store.selectPlan('MENSUAL');
      store.selectPaymentMethod('TARJETA');
      store.processPayment({});
      tick();

      expect(store.error()).toBe('Error al procesar el pago');
      expect(toastServiceSpy.error).toHaveBeenCalledWith('Error al procesar el pago');
    }));

    it('should handle network error', fakeAsync(() => {
      checkoutServiceSpy.procesarPago.and.returnValue(
        throwError(() => ({ error: { mensaje: 'Error de red' } }))
      );

      store.selectPlan('MENSUAL');
      store.selectPaymentMethod('TARJETA');
      store.processPayment({});
      tick();

      expect(store.error()).toBe('Error de red');
      expect(toastServiceSpy.error).toHaveBeenCalledWith('Error de red');
    }));

    it('should set processing to true while processing', fakeAsync(() => {
      const subject = new Subject<CheckoutResponse>();
      checkoutServiceSpy.procesarPago.and.returnValue(subject.asObservable());

      store.selectPlan('MENSUAL');
      store.selectPaymentMethod('TARJETA');
      store.processPayment({});

      expect(store.processing()).toBeTrue();

      subject.next(mockSuccessResponse);
      subject.complete();
      tick();

      expect(store.processing()).toBeFalse();
    }));
  });

  describe('goToDashboard', () => {
    it('should reset store and navigate to entrenamiento', fakeAsync(() => {
      spyOn(router, 'navigate');

      store.selectPlan('MENSUAL');
      store.selectPaymentMethod('TARJETA');

      store.goToDashboard();
      tick();

      expect(store.selectedPlan()).toBeNull();
      expect(store.selectedPaymentMethod()).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/entrenamiento']);
    }));
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      store.selectPlan('MENSUAL');
      store.selectPaymentMethod('TARJETA');
      store.goToStep('payment');

      store.reset();

      expect(store.selectedPlan()).toBeNull();
      expect(store.selectedPaymentMethod()).toBeNull();
      expect(store.currentStep()).toBe('summary');
      expect(store.processing()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.response()).toBeNull();
    });
  });

  describe('payment methods', () => {
    it('should work with PAYPAL payment method', () => {
      store.selectPaymentMethod('PAYPAL');

      expect(store.selectedPaymentMethod()).toBe('PAYPAL');
    });

    it('should work with BIZUM payment method', () => {
      store.selectPaymentMethod('BIZUM');

      expect(store.selectedPaymentMethod()).toBe('BIZUM');
    });
  });

  describe('plan types', () => {
    it('should work with INDIVIDUAL plan', () => {
      store.selectPlan('INDIVIDUAL');

      expect(store.selectedPlan()).toBe('INDIVIDUAL');
      expect(store.planInfo()?.precio).toBe(9);
    });

    it('should work with ANUAL plan', () => {
      store.selectPlan('ANUAL');

      expect(store.selectedPlan()).toBe('ANUAL');
      expect(store.planInfo()?.precio).toBe(199);
    });
  });
});
