import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentSuccess } from './payment-success';
import { CheckoutResponse, PlanInfo } from '../../models/checkout.model';

describe('PaymentSuccess', () => {
  let component: PaymentSuccess;
  let fixture: ComponentFixture<PaymentSuccess>;

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
      'Acceso a comunidad',
      'Analisis de progreso',
    ],
    destacado: true,
  };

  const mockResponsePaypal: CheckoutResponse = {
    planId: 2,
    tipoPlan: 'ANUAL',
    precio: 199,
    metodoPago: 'PAYPAL',
    fechaInicio: '2024-01-15',
    fechaFin: '2025-01-15',
    exitoso: true,
    mensaje: 'Pago procesado correctamente',
    transaccionId: 'TXN-789012',
  };

  const mockResponseBizum: CheckoutResponse = {
    planId: 3,
    tipoPlan: 'INDIVIDUAL',
    precio: 9,
    metodoPago: 'BIZUM',
    fechaInicio: '2024-01-15',
    fechaFin: '2024-02-15',
    exitoso: true,
    mensaje: 'Pago procesado correctamente',
    transaccionId: 'TXN-345678',
  };

  const mockFailedResponse: CheckoutResponse = {
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentSuccess],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentSuccess);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should have response as null by default', () => {
      expect(component.response).toBeNull();
    });

    it('should have planInfo as null by default', () => {
      expect(component.planInfo).toBeNull();
    });
  });

  describe('input bindings', () => {
    it('should accept response input', () => {
      component.response = mockResponse;
      fixture.detectChanges();

      expect(component.response).toEqual(mockResponse);
    });

    it('should accept planInfo input', () => {
      component.planInfo = mockPlanInfo;
      fixture.detectChanges();

      expect(component.planInfo).toEqual(mockPlanInfo);
    });

    it('should accept both inputs', () => {
      component.response = mockResponse;
      component.planInfo = mockPlanInfo;
      fixture.detectChanges();

      expect(component.response).toEqual(mockResponse);
      expect(component.planInfo).toEqual(mockPlanInfo);
    });
  });

  describe('onIrAlDashboard', () => {
    it('should emit irAlDashboard event', () => {
      spyOn(component.irAlDashboard, 'emit');

      component.onIrAlDashboard();

      expect(component.irAlDashboard.emit).toHaveBeenCalled();
    });
  });

  describe('DOM rendering', () => {
    describe('with successful response', () => {
      beforeEach(() => {
        component.response = mockResponse;
        component.planInfo = mockPlanInfo;
        fixture.detectChanges();
      });

      it('should render success article', () => {
        const successArticle = fixture.nativeElement.querySelector(
          '.payment-success'
        );

        expect(successArticle).toBeTruthy();
      });

      it('should render success icon', () => {
        const successIcon = fixture.nativeElement.querySelector(
          '.payment-success__icon'
        );

        expect(successIcon).toBeTruthy();
      });

      it('should render success title', () => {
        const title = fixture.nativeElement.querySelector(
          '.payment-success__title'
        );

        expect(title.textContent).toContain('Pago completado');
      });

      it('should render plan name in subtitle', () => {
        const subtitle = fixture.nativeElement.querySelector(
          '.payment-success__subtitle'
        );

        expect(subtitle.textContent).toContain('Mensual');
      });

      it('should render transaction ID', () => {
        const detailsList = fixture.nativeElement.querySelector(
          '.payment-success__details-list'
        );

        expect(detailsList.textContent).toContain('TXN-123456');
      });

      it('should render plan name in details', () => {
        const detailsList = fixture.nativeElement.querySelector(
          '.payment-success__details-list'
        );

        expect(detailsList.textContent).toContain('Mensual');
      });

      it('should render price', () => {
        const detailsList = fixture.nativeElement.querySelector(
          '.payment-success__details-list'
        );

        expect(detailsList.textContent).toContain('19');
      });

      it('should render payment method', () => {
        const detailsList = fixture.nativeElement.querySelector(
          '.payment-success__details-list'
        );

        expect(detailsList.textContent).toContain('TARJETA');
      });

      it('should render all features', () => {
        const benefits = fixture.nativeElement.querySelectorAll(
          '.payment-success__benefit'
        );

        expect(benefits.length).toBe(5);
      });

      it('should render dashboard button', () => {
        const dashboardButton = fixture.nativeElement.querySelector(
          '.boton--primario'
        );

        expect(dashboardButton).toBeTruthy();
        expect(dashboardButton.textContent).toContain('Ir al Dashboard');
      });

      it('should render receipt note', () => {
        const note = fixture.nativeElement.querySelector(
          '.payment-success__note'
        );

        expect(note.textContent).toContain('Hemos enviado un recibo');
      });
    });

    describe('with PayPal response', () => {
      beforeEach(() => {
        component.response = mockResponsePaypal;
        component.planInfo = {
          ...mockPlanInfo,
          tipo: 'ANUAL',
          nombre: 'Anual',
          precio: 199,
        };
        fixture.detectChanges();
      });

      it('should render PAYPAL as payment method', () => {
        const detailsList = fixture.nativeElement.querySelector(
          '.payment-success__details-list'
        );

        expect(detailsList.textContent).toContain('PAYPAL');
      });

      it('should render 199 as price', () => {
        const detailsList = fixture.nativeElement.querySelector(
          '.payment-success__details-list'
        );

        expect(detailsList.textContent).toContain('199');
      });
    });

    describe('with Bizum response', () => {
      beforeEach(() => {
        component.response = mockResponseBizum;
        component.planInfo = {
          ...mockPlanInfo,
          tipo: 'INDIVIDUAL',
          nombre: 'Individual',
          precio: 9,
        };
        fixture.detectChanges();
      });

      it('should render BIZUM as payment method', () => {
        const detailsList = fixture.nativeElement.querySelector(
          '.payment-success__details-list'
        );

        expect(detailsList.textContent).toContain('BIZUM');
      });

      it('should render 9 as price', () => {
        const detailsList = fixture.nativeElement.querySelector(
          '.payment-success__details-list'
        );

        expect(detailsList.textContent).toContain('9');
      });
    });

    describe('without successful response', () => {
      beforeEach(() => {
        component.response = mockFailedResponse;
        component.planInfo = mockPlanInfo;
        fixture.detectChanges();
      });

      it('should not render success article when exitoso is false', () => {
        const successArticle = fixture.nativeElement.querySelector(
          '.payment-success'
        );

        expect(successArticle).toBeFalsy();
      });
    });

    describe('without response', () => {
      beforeEach(() => {
        component.response = null;
        component.planInfo = mockPlanInfo;
        fixture.detectChanges();
      });

      it('should not render success article', () => {
        const successArticle = fixture.nativeElement.querySelector(
          '.payment-success'
        );

        expect(successArticle).toBeFalsy();
      });
    });

    describe('user interactions', () => {
      beforeEach(() => {
        component.response = mockResponse;
        component.planInfo = mockPlanInfo;
        fixture.detectChanges();
      });

      it('should call onIrAlDashboard when dashboard button clicked', () => {
        spyOn(component, 'onIrAlDashboard');
        const dashboardButton = fixture.nativeElement.querySelector(
          '.boton--primario'
        );

        dashboardButton.click();

        expect(component.onIrAlDashboard).toHaveBeenCalled();
      });

      it('should emit irAlDashboard event when dashboard button clicked', () => {
        spyOn(component.irAlDashboard, 'emit');
        const dashboardButton = fixture.nativeElement.querySelector(
          '.boton--primario'
        );

        dashboardButton.click();

        expect(component.irAlDashboard.emit).toHaveBeenCalled();
      });
    });
  });

  describe('date formatting', () => {
    beforeEach(() => {
      component.response = mockResponse;
      component.planInfo = mockPlanInfo;
      fixture.detectChanges();
    });

    it('should render start date', () => {
      const detailsList = fixture.nativeElement.querySelector(
        '.payment-success__details-list'
      );

      expect(detailsList.textContent).toContain('Fecha de inicio');
    });

    it('should render end date', () => {
      const detailsList = fixture.nativeElement.querySelector(
        '.payment-success__details-list'
      );

      expect(detailsList.textContent).toContain('Fecha de fin');
    });
  });

  describe('benefits section', () => {
    beforeEach(() => {
      component.response = mockResponse;
      component.planInfo = mockPlanInfo;
      fixture.detectChanges();
    });

    it('should render benefits title', () => {
      const benefitsTitle = fixture.nativeElement.querySelector(
        '.payment-success__benefits-title'
      );

      expect(benefitsTitle.textContent).toContain('Ahora tienes acceso a:');
    });

    it('should render benefit icons', () => {
      const benefitIcons = fixture.nativeElement.querySelectorAll(
        '.payment-success__benefit-icon'
      );

      expect(benefitIcons.length).toBe(5);
    });

    it('should render each feature text', () => {
      const benefits = fixture.nativeElement.querySelectorAll(
        '.payment-success__benefit'
      );

      expect(benefits[0].textContent).toContain('Todas las rutinas premium');
      expect(benefits[1].textContent).toContain('Plan nutricional avanzado');
      expect(benefits[2].textContent).toContain('Soporte prioritario');
      expect(benefits[3].textContent).toContain('Acceso a comunidad');
      expect(benefits[4].textContent).toContain('Analisis de progreso');
    });
  });

  describe('transaction details', () => {
    beforeEach(() => {
      component.response = mockResponse;
      component.planInfo = mockPlanInfo;
      fixture.detectChanges();
    });

    it('should render details section title', () => {
      const detailsTitle = fixture.nativeElement.querySelector(
        '.payment-success__details-title'
      );

      expect(detailsTitle.textContent).toContain('Detalles de la transaccion');
    });

    it('should render 6 detail items', () => {
      const detailItems = fixture.nativeElement.querySelectorAll(
        '.payment-success__details-item'
      );

      expect(detailItems.length).toBe(6);
    });
  });
});
