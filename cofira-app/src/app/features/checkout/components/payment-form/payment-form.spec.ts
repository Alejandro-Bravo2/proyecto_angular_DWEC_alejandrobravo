import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import { PaymentForm } from './payment-form';
import { CheckoutStore } from '../../stores/checkout.store';
import {
  PlanInfo,
  METODOS_PAGO,
  MetodoPago,
} from '../../models/checkout.model';

describe('PaymentForm', () => {
  let component: PaymentForm;
  let fixture: ComponentFixture<PaymentForm>;
  let storeSpy: jasmine.SpyObj<CheckoutStore>;

  const mockPlanInfo: PlanInfo = {
    tipo: 'MENSUAL',
    nombre: 'Mensual',
    subtitulo: 'Mas popular',
    precio: 19,
    periodo: 'mes',
    features: [
      'Todas las rutinas premium',
      'Plan nutricional avanzado',
      'Soporte prioritario',
    ],
    destacado: true,
  };

  beforeEach(async () => {
    storeSpy = jasmine.createSpyObj(
      'CheckoutStore',
      ['selectPaymentMethod', 'processPayment'],
      {
        error: signal<string | null>(null),
        processing: signal(false),
        canProcessPayment: signal(true),
      }
    );

    await TestBed.configureTestingModule({
      imports: [PaymentForm, ReactiveFormsModule],
      providers: [{ provide: CheckoutStore, useValue: storeSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentForm);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should have planInfo as null by default', () => {
      expect(component.planInfo).toBeNull();
    });

    it('should have selectedMethod as null by default', () => {
      expect(component.selectedMethod()).toBeNull();
    });

    it('should have metodosPago available', () => {
      expect(component.metodosPago).toEqual(METODOS_PAGO);
      expect(component.metodosPago.length).toBe(3);
    });

    it('should have cardForm initialized', () => {
      expect(component.cardForm).toBeDefined();
      expect(component.cardForm.get('nombreTitular')).toBeDefined();
      expect(component.cardForm.get('numeroTarjeta')).toBeDefined();
      expect(component.cardForm.get('fechaExpiracion')).toBeDefined();
      expect(component.cardForm.get('cvv')).toBeDefined();
    });

    it('should have paypalForm initialized', () => {
      expect(component.paypalForm).toBeDefined();
      expect(component.paypalForm.get('emailPaypal')).toBeDefined();
    });

    it('should have bizumForm initialized', () => {
      expect(component.bizumForm).toBeDefined();
      expect(component.bizumForm.get('telefonoBizum')).toBeDefined();
    });
  });

  describe('input bindings', () => {
    it('should accept planInfo input', () => {
      component.planInfo = mockPlanInfo;
      fixture.detectChanges();

      expect(component.planInfo).toEqual(mockPlanInfo);
    });
  });

  describe('selectMethod', () => {
    it('should select TARJETA method', () => {
      component.selectMethod('TARJETA');

      expect(component.selectedMethod()).toBe('TARJETA');
      expect(storeSpy.selectPaymentMethod).toHaveBeenCalledWith('TARJETA');
    });

    it('should select PAYPAL method', () => {
      component.selectMethod('PAYPAL');

      expect(component.selectedMethod()).toBe('PAYPAL');
      expect(storeSpy.selectPaymentMethod).toHaveBeenCalledWith('PAYPAL');
    });

    it('should select BIZUM method', () => {
      component.selectMethod('BIZUM');

      expect(component.selectedMethod()).toBe('BIZUM');
      expect(storeSpy.selectPaymentMethod).toHaveBeenCalledWith('BIZUM');
    });
  });

  describe('formatCardNumber', () => {
    it('should format card number with spaces', () => {
      const event = {
        target: { value: '4111111111111111' },
      } as unknown as Event;

      component.formatCardNumber(event);

      expect(component.cardForm.get('numeroTarjeta')?.value).toBe(
        '4111 1111 1111 1111'
      );
    });

    it('should remove non-digit characters', () => {
      const event = {
        target: { value: '4111-1111-1111-1111' },
      } as unknown as Event;

      component.formatCardNumber(event);

      expect(component.cardForm.get('numeroTarjeta')?.value).toBe(
        '4111 1111 1111 1111'
      );
    });

    it('should limit to 16 digits', () => {
      const event = {
        target: { value: '41111111111111112222' },
      } as unknown as Event;

      component.formatCardNumber(event);

      expect(component.cardForm.get('numeroTarjeta')?.value).toBe(
        '4111 1111 1111 1111'
      );
    });

    it('should handle partial card numbers', () => {
      const event = {
        target: { value: '4111' },
      } as unknown as Event;

      component.formatCardNumber(event);

      expect(component.cardForm.get('numeroTarjeta')?.value).toBe('4111');
    });

    it('should handle empty value', () => {
      const event = {
        target: { value: '' },
      } as unknown as Event;

      component.formatCardNumber(event);

      expect(component.cardForm.get('numeroTarjeta')?.value).toBe('');
    });
  });

  describe('formatExpiryDate', () => {
    it('should format expiry date with slash', () => {
      const event = {
        target: { value: '1225' },
      } as unknown as Event;

      component.formatExpiryDate(event);

      expect(component.cardForm.get('fechaExpiracion')?.value).toBe('12/25');
    });

    it('should handle partial input', () => {
      const event = {
        target: { value: '12' },
      } as unknown as Event;

      component.formatExpiryDate(event);

      expect(component.cardForm.get('fechaExpiracion')?.value).toBe('12/');
    });

    it('should remove non-digit characters', () => {
      const event = {
        target: { value: '12/25' },
      } as unknown as Event;

      component.formatExpiryDate(event);

      expect(component.cardForm.get('fechaExpiracion')?.value).toBe('12/25');
    });
  });

  describe('onVolver', () => {
    it('should emit volver event', () => {
      spyOn(component.volver, 'emit');

      component.onVolver();

      expect(component.volver.emit).toHaveBeenCalled();
    });
  });

  describe('processPayment', () => {
    it('should not process if no method selected', () => {
      component.processPayment();

      expect(storeSpy.processPayment).not.toHaveBeenCalled();
    });

    describe('with TARJETA method', () => {
      beforeEach(() => {
        component.selectMethod('TARJETA');
      });

      it('should mark form as touched if invalid', () => {
        spyOn(component.cardForm, 'markAllAsTouched');

        component.processPayment();

        expect(component.cardForm.markAllAsTouched).toHaveBeenCalled();
        expect(storeSpy.processPayment).not.toHaveBeenCalled();
      });

      it('should process payment with valid card data', () => {
        component.cardForm.patchValue({
          nombreTitular: 'Juan Perez',
          numeroTarjeta: '4111 1111 1111 1111',
          fechaExpiracion: '12/25',
          cvv: '123',
        });

        component.processPayment();

        expect(storeSpy.processPayment).toHaveBeenCalledWith({
          nombreTitular: 'Juan Perez',
          numeroTarjeta: '4111111111111111',
          fechaExpiracion: '12/25',
          cvv: '123',
        });
      });

      it('should remove spaces from card number', () => {
        component.cardForm.patchValue({
          nombreTitular: 'Test User',
          numeroTarjeta: '4111 1111 1111 1111',
          fechaExpiracion: '12/25',
          cvv: '123',
        });

        component.processPayment();

        const callArgs = storeSpy.processPayment.calls.mostRecent().args[0];
        expect(callArgs.numeroTarjeta).toBe('4111111111111111');
      });
    });

    describe('with PAYPAL method', () => {
      beforeEach(() => {
        component.selectMethod('PAYPAL');
      });

      it('should mark form as touched if invalid', () => {
        spyOn(component.paypalForm, 'markAllAsTouched');

        component.processPayment();

        expect(component.paypalForm.markAllAsTouched).toHaveBeenCalled();
        expect(storeSpy.processPayment).not.toHaveBeenCalled();
      });

      it('should process payment with valid email', () => {
        component.paypalForm.patchValue({
          emailPaypal: 'test@example.com',
        });

        component.processPayment();

        expect(storeSpy.processPayment).toHaveBeenCalledWith({
          emailPaypal: 'test@example.com',
        });
      });
    });

    describe('with BIZUM method', () => {
      beforeEach(() => {
        component.selectMethod('BIZUM');
      });

      it('should mark form as touched if invalid', () => {
        spyOn(component.bizumForm, 'markAllAsTouched');

        component.processPayment();

        expect(component.bizumForm.markAllAsTouched).toHaveBeenCalled();
        expect(storeSpy.processPayment).not.toHaveBeenCalled();
      });

      it('should process payment with valid phone', () => {
        component.bizumForm.patchValue({
          telefonoBizum: '612345678',
        });

        component.processPayment();

        expect(storeSpy.processPayment).toHaveBeenCalledWith({
          telefonoBizum: '612345678',
        });
      });
    });
  });

  describe('getIcon', () => {
    it('should return path for credit-card', () => {
      const path = component.getIcon('credit-card');

      expect(path).toContain('M3 5');
    });

    it('should return path for paypal', () => {
      const path = component.getIcon('paypal');

      expect(path).toContain('M7.5 21');
    });

    it('should return path for smartphone', () => {
      const path = component.getIcon('smartphone');

      expect(path).toContain('M17 2');
    });

    it('should return empty string for unknown icon', () => {
      const path = component.getIcon('unknown');

      expect(path).toBe('');
    });
  });

  describe('form validations', () => {
    describe('cardForm', () => {
      it('should require nombreTitular', () => {
        const control = component.cardForm.get('nombreTitular');
        control?.setValue('');

        expect(control?.hasError('required')).toBeTrue();
      });

      it('should validate numeroTarjeta pattern', () => {
        const control = component.cardForm.get('numeroTarjeta');
        control?.setValue('123');

        expect(control?.hasError('pattern')).toBeTrue();
      });

      it('should accept valid numeroTarjeta', () => {
        const control = component.cardForm.get('numeroTarjeta');
        control?.setValue('4111 1111 1111 1111');

        expect(control?.valid).toBeTrue();
      });

      it('should validate fechaExpiracion pattern', () => {
        const control = component.cardForm.get('fechaExpiracion');
        control?.setValue('1325');

        expect(control?.hasError('pattern')).toBeTrue();
      });

      it('should accept valid fechaExpiracion', () => {
        const control = component.cardForm.get('fechaExpiracion');
        control?.setValue('12/25');

        expect(control?.valid).toBeTrue();
      });

      it('should validate cvv pattern', () => {
        const control = component.cardForm.get('cvv');
        control?.setValue('12');

        expect(control?.hasError('pattern')).toBeTrue();
      });

      it('should accept valid 3-digit cvv', () => {
        const control = component.cardForm.get('cvv');
        control?.setValue('123');

        expect(control?.valid).toBeTrue();
      });

      it('should accept valid 4-digit cvv', () => {
        const control = component.cardForm.get('cvv');
        control?.setValue('1234');

        expect(control?.valid).toBeTrue();
      });
    });

    describe('paypalForm', () => {
      it('should require emailPaypal', () => {
        const control = component.paypalForm.get('emailPaypal');
        control?.setValue('');

        expect(control?.hasError('required')).toBeTrue();
      });

      it('should validate email format', () => {
        const control = component.paypalForm.get('emailPaypal');
        control?.setValue('invalid-email');

        expect(control?.hasError('email')).toBeTrue();
      });

      it('should accept valid email', () => {
        const control = component.paypalForm.get('emailPaypal');
        control?.setValue('test@example.com');

        expect(control?.valid).toBeTrue();
      });
    });

    describe('bizumForm', () => {
      it('should require telefonoBizum', () => {
        const control = component.bizumForm.get('telefonoBizum');
        control?.setValue('');

        expect(control?.hasError('required')).toBeTrue();
      });

      it('should validate phone pattern', () => {
        const control = component.bizumForm.get('telefonoBizum');
        control?.setValue('123456789');

        expect(control?.hasError('pattern')).toBeTrue();
      });

      it('should accept valid phone starting with 6', () => {
        const control = component.bizumForm.get('telefonoBizum');
        control?.setValue('612345678');

        expect(control?.valid).toBeTrue();
      });

      it('should accept valid phone starting with 7', () => {
        const control = component.bizumForm.get('telefonoBizum');
        control?.setValue('712345678');

        expect(control?.valid).toBeTrue();
      });
    });
  });

  describe('DOM rendering', () => {
    beforeEach(() => {
      component.planInfo = mockPlanInfo;
      fixture.detectChanges();
    });

    it('should render payment methods', () => {
      const methods = fixture.nativeElement.querySelectorAll(
        '.payment-form__method'
      );

      expect(methods.length).toBe(3);
    });

    it('should show card form when TARJETA selected', () => {
      component.selectMethod('TARJETA');
      fixture.detectChanges();

      const cardInputs = fixture.nativeElement.querySelectorAll(
        '#nombreTitular, #numeroTarjeta, #fechaExpiracion, #cvv'
      );

      expect(cardInputs.length).toBe(4);
    });

    it('should show paypal form when PAYPAL selected', () => {
      component.selectMethod('PAYPAL');
      fixture.detectChanges();

      const paypalInput = fixture.nativeElement.querySelector('#emailPaypal');

      expect(paypalInput).toBeTruthy();
    });

    it('should show bizum form when BIZUM selected', () => {
      component.selectMethod('BIZUM');
      fixture.detectChanges();

      const bizumInput = fixture.nativeElement.querySelector('#telefonoBizum');

      expect(bizumInput).toBeTruthy();
    });

    it('should call onVolver when back button clicked', () => {
      spyOn(component, 'onVolver');
      const backButton = fixture.nativeElement.querySelector(
        '.payment-form__back-btn'
      );

      backButton.click();

      expect(component.onVolver).toHaveBeenCalled();
    });
  });
});
