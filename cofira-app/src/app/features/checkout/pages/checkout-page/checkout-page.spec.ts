import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { CheckoutPage } from './checkout-page';
import { CheckoutStore, CheckoutStep } from '../../stores/checkout.store';
import { PlanInfo, CheckoutResponse, PLANES_INFO } from '../../models/checkout.model';

describe('CheckoutPage', () => {
  let component: CheckoutPage;
  let fixture: ComponentFixture<CheckoutPage>;
  let router: Router;

  const mockPlanInfo: PlanInfo = PLANES_INFO['MENSUAL'];

  const mockResponse: CheckoutResponse = {
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

  const createMockActivatedRoute = (planQueryParam: string | null) => {
    return {
      snapshot: {
        queryParams: planQueryParam ? { plan: planQueryParam } : {},
      },
    };
  };

  // Writable signals for testing
  let currentStepSignal: WritableSignal<CheckoutStep>;
  let planInfoSignal: WritableSignal<PlanInfo | null>;
  let responseSignal: WritableSignal<CheckoutResponse | null>;

  const createMockStore = () => {
    currentStepSignal = signal<CheckoutStep>('summary');
    planInfoSignal = signal<PlanInfo | null>(mockPlanInfo);
    responseSignal = signal<CheckoutResponse | null>(null);

    return {
      selectPlan: jasmine.createSpy('selectPlan'),
      proceedToPayment: jasmine.createSpy('proceedToPayment'),
      goToStep: jasmine.createSpy('goToStep'),
      goToDashboard: jasmine.createSpy('goToDashboard'),
      selectPaymentMethod: jasmine.createSpy('selectPaymentMethod'),
      processPayment: jasmine.createSpy('processPayment'),
      currentStep: currentStepSignal,
      planInfo: planInfoSignal,
      response: responseSignal,
      // Additional signals needed by PaymentForm component
      error: signal<string | null>(null),
      processing: signal(false),
      canProcessPayment: signal(true),
    };
  };

  let mockStore: ReturnType<typeof createMockStore>;

  beforeEach(async () => {
    mockStore = createMockStore();

    await TestBed.configureTestingModule({
      imports: [CheckoutPage],
      providers: [
        provideRouter([
          { path: '', component: class {} as any },
          { path: 'entrenamiento', component: class {} as any },
        ]),
        { provide: CheckoutStore, useValue: mockStore },
        { provide: ActivatedRoute, useValue: createMockActivatedRoute('MENSUAL') },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(CheckoutPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should select plan from query params', () => {
      fixture.detectChanges();

      expect(mockStore.selectPlan).toHaveBeenCalledWith('MENSUAL');
    });

    it('should select INDIVIDUAL plan from query params', async () => {
      TestBed.resetTestingModule();
      const newMockStore = createMockStore();

      await TestBed.configureTestingModule({
        imports: [CheckoutPage],
        providers: [
          provideRouter([]),
          { provide: CheckoutStore, useValue: newMockStore },
          { provide: ActivatedRoute, useValue: createMockActivatedRoute('INDIVIDUAL') },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(CheckoutPage);
      newFixture.detectChanges();

      expect(newMockStore.selectPlan).toHaveBeenCalledWith('INDIVIDUAL');
    });

    it('should select ANUAL plan from query params', async () => {
      TestBed.resetTestingModule();
      const newMockStore = createMockStore();

      await TestBed.configureTestingModule({
        imports: [CheckoutPage],
        providers: [
          provideRouter([]),
          { provide: CheckoutStore, useValue: newMockStore },
          { provide: ActivatedRoute, useValue: createMockActivatedRoute('ANUAL') },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(CheckoutPage);
      newFixture.detectChanges();

      expect(newMockStore.selectPlan).toHaveBeenCalledWith('ANUAL');
    });

    it('should redirect to home if no valid plan', async () => {
      TestBed.resetTestingModule();
      const newMockStore = createMockStore();

      await TestBed.configureTestingModule({
        imports: [CheckoutPage],
        providers: [
          provideRouter([{ path: '', component: class {} as any }]),
          { provide: CheckoutStore, useValue: newMockStore },
          { provide: ActivatedRoute, useValue: createMockActivatedRoute(null) },
        ],
      }).compileComponents();

      const newRouter = TestBed.inject(Router);
      spyOn(newRouter, 'navigate');

      const newFixture = TestBed.createComponent(CheckoutPage);
      newFixture.detectChanges();

      expect(newRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should redirect to home if invalid plan type', async () => {
      TestBed.resetTestingModule();
      const newMockStore = createMockStore();

      await TestBed.configureTestingModule({
        imports: [CheckoutPage],
        providers: [
          provideRouter([{ path: '', component: class {} as any }]),
          { provide: CheckoutStore, useValue: newMockStore },
          { provide: ActivatedRoute, useValue: createMockActivatedRoute('INVALIDO') },
        ],
      }).compileComponents();

      const newRouter = TestBed.inject(Router);
      spyOn(newRouter, 'navigate');

      const newFixture = TestBed.createComponent(CheckoutPage);
      newFixture.detectChanges();

      expect(newRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('onProceedToPayment', () => {
    it('should call store.proceedToPayment', () => {
      component.onProceedToPayment();

      expect(mockStore.proceedToPayment).toHaveBeenCalled();
    });
  });

  describe('onBackToSummary', () => {
    it('should call store.goToStep with summary', () => {
      component.onBackToSummary();

      expect(mockStore.goToStep).toHaveBeenCalledWith('summary');
    });
  });

  describe('onPaymentComplete', () => {
    it('should not throw error', () => {
      expect(() => component.onPaymentComplete()).not.toThrow();
    });
  });

  describe('onGoToDashboard', () => {
    it('should call store.goToDashboard', () => {
      component.onGoToDashboard();

      expect(mockStore.goToDashboard).toHaveBeenCalled();
    });
  });

  describe('DOM rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render checkout container', () => {
      const container = fixture.nativeElement.querySelector(
        '.checkout__container'
      );

      expect(container).toBeTruthy();
    });

    it('should render checkout title', () => {
      const title = fixture.nativeElement.querySelector('.checkout__title');

      expect(title.textContent).toContain('Finalizar compra');
    });

    it('should render step navigation', () => {
      const steps = fixture.nativeElement.querySelectorAll('.checkout__step');

      expect(steps.length).toBe(3);
    });

    it('should render step 1 as Resumen', () => {
      const steps = fixture.nativeElement.querySelectorAll('.checkout__step');

      expect(steps[0].textContent).toContain('Resumen');
    });

    it('should render step 2 as Pago', () => {
      const steps = fixture.nativeElement.querySelectorAll('.checkout__step');

      expect(steps[1].textContent).toContain('Pago');
    });

    it('should render step 3 as Confirmacion', () => {
      const steps = fixture.nativeElement.querySelectorAll('.checkout__step');

      expect(steps[2].textContent).toContain('Confirmacion');
    });

    it('should render security badge', () => {
      const security = fixture.nativeElement.querySelector('.checkout__security');

      expect(security).toBeTruthy();
    });

    it('should render security text', () => {
      const securityText = fixture.nativeElement.querySelector(
        '.checkout__security-text'
      );

      expect(securityText.textContent).toContain('Conexion segura SSL');
    });
  });

  describe('step rendering', () => {
    describe('summary step', () => {
      beforeEach(() => {
        currentStepSignal.set('summary');
        fixture.detectChanges();
      });

      it('should render plan-summary component', () => {
        const planSummary = fixture.nativeElement.querySelector(
          'app-plan-summary'
        );

        expect(planSummary).toBeTruthy();
      });

      it('should mark step 1 as active', () => {
        const steps = fixture.nativeElement.querySelectorAll('.checkout__step');

        expect(steps[0].classList.contains('checkout__step--active')).toBeTrue();
      });
    });

    describe('payment step', () => {
      beforeEach(() => {
        currentStepSignal.set('payment');
        fixture.detectChanges();
      });

      it('should render payment-form component', () => {
        const paymentForm = fixture.nativeElement.querySelector(
          'app-payment-form'
        );

        expect(paymentForm).toBeTruthy();
      });

      it('should mark step 2 as active', () => {
        const steps = fixture.nativeElement.querySelectorAll('.checkout__step');

        expect(steps[1].classList.contains('checkout__step--active')).toBeTrue();
      });

      it('should mark step 1 as completed', () => {
        const steps = fixture.nativeElement.querySelectorAll('.checkout__step');

        expect(
          steps[0].classList.contains('checkout__step--completed')
        ).toBeTrue();
      });
    });

    describe('success step', () => {
      beforeEach(() => {
        currentStepSignal.set('success');
        responseSignal.set(mockResponse);
        fixture.detectChanges();
      });

      it('should render payment-success component', () => {
        const paymentSuccess = fixture.nativeElement.querySelector(
          'app-payment-success'
        );

        expect(paymentSuccess).toBeTruthy();
      });

      it('should mark step 3 as active', () => {
        const steps = fixture.nativeElement.querySelectorAll('.checkout__step');

        expect(steps[2].classList.contains('checkout__step--active')).toBeTrue();
      });

      it('should mark step 1 as completed', () => {
        const steps = fixture.nativeElement.querySelectorAll('.checkout__step');

        expect(
          steps[0].classList.contains('checkout__step--completed')
        ).toBeTrue();
      });

      it('should mark step 2 as completed', () => {
        const steps = fixture.nativeElement.querySelectorAll('.checkout__step');

        expect(
          steps[1].classList.contains('checkout__step--completed')
        ).toBeTrue();
      });
    });
  });

  describe('store injection', () => {
    it('should have store injected', () => {
      expect(component.store).toBeTruthy();
    });

    it('should be able to access currentStep', () => {
      expect(component.store.currentStep()).toBe('summary');
    });

    it('should be able to access planInfo', () => {
      expect(component.store.planInfo()).toEqual(mockPlanInfo);
    });
  });

  describe('step indicators', () => {
    it('should have step dividers', () => {
      fixture.detectChanges();
      const dividers = fixture.nativeElement.querySelectorAll(
        '.checkout__step-divider'
      );

      expect(dividers.length).toBe(2);
    });
  });
});
