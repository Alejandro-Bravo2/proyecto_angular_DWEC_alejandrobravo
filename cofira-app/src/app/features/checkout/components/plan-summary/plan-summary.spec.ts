import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PlanSummary } from './plan-summary';
import { PlanInfo } from '../../models/checkout.model';

describe('PlanSummary', () => {
  let component: PlanSummary;
  let fixture: ComponentFixture<PlanSummary>;

  const mockPlanInfoMensual: PlanInfo = {
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

  const mockPlanInfoIndividual: PlanInfo = {
    tipo: 'INDIVIDUAL',
    nombre: 'Individual',
    subtitulo: 'Para empezar',
    precio: 9,
    periodo: 'mes',
    features: [
      'Acceso basico a rutinas',
      'Seguimiento de nutricion',
      'Soporte por email',
      'App movil',
    ],
  };

  const mockPlanInfoAnual: PlanInfo = {
    tipo: 'ANUAL',
    nombre: 'Anual',
    subtitulo: 'Mejor valor',
    precio: 199,
    periodo: 'ano',
    features: [
      'Todo lo del plan mensual',
      'Sesiones 1 a 1 con coach',
      'Acceso anticipado',
      'Descuentos exclusivos',
      '2 meses gratis',
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanSummary],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanSummary);
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
  });

  describe('input bindings', () => {
    it('should accept planInfo input', () => {
      component.planInfo = mockPlanInfoMensual;
      fixture.detectChanges();

      expect(component.planInfo).toEqual(mockPlanInfoMensual);
    });

    it('should accept INDIVIDUAL plan', () => {
      component.planInfo = mockPlanInfoIndividual;
      fixture.detectChanges();

      expect(component.planInfo.tipo).toBe('INDIVIDUAL');
      expect(component.planInfo.precio).toBe(9);
    });

    it('should accept ANUAL plan', () => {
      component.planInfo = mockPlanInfoAnual;
      fixture.detectChanges();

      expect(component.planInfo.tipo).toBe('ANUAL');
      expect(component.planInfo.precio).toBe(199);
    });
  });

  describe('onContinuar', () => {
    it('should emit continuar event', () => {
      spyOn(component.continuar, 'emit');

      component.onContinuar();

      expect(component.continuar.emit).toHaveBeenCalled();
    });
  });

  describe('DOM rendering', () => {
    describe('with planInfo', () => {
      beforeEach(() => {
        component.planInfo = mockPlanInfoMensual;
        fixture.detectChanges();
      });

      it('should render plan name', () => {
        const planName = fixture.nativeElement.querySelector(
          '.plan-summary__plan-name'
        );

        expect(planName.textContent).toContain('Mensual');
      });

      it('should render plan subtitle', () => {
        const planSubtitle = fixture.nativeElement.querySelector(
          '.plan-summary__plan-subtitle'
        );

        expect(planSubtitle.textContent).toContain('Mas popular');
      });

      it('should render price amount', () => {
        const priceAmount = fixture.nativeElement.querySelector(
          '.plan-summary__price-amount'
        );

        expect(priceAmount.textContent).toContain('19');
      });

      it('should render price period', () => {
        const pricePeriod = fixture.nativeElement.querySelector(
          '.plan-summary__price-period'
        );

        expect(pricePeriod.textContent).toContain('mes');
      });

      it('should render all features', () => {
        const features = fixture.nativeElement.querySelectorAll(
          '.plan-summary__feature'
        );

        expect(features.length).toBe(5);
      });

      it('should render recommended badge when destacado is true', () => {
        const badge = fixture.nativeElement.querySelector(
          '.plan-summary__badge'
        );

        expect(badge).toBeTruthy();
        expect(badge.textContent).toContain('Recomendado');
      });

      it('should render subtotal', () => {
        const totalRows = fixture.nativeElement.querySelectorAll(
          '.plan-summary__total-row'
        );

        expect(totalRows[0].textContent).toContain('Subtotal');
        expect(totalRows[0].textContent).toContain('19');
      });

      it('should render taxes as included', () => {
        const totalRows = fixture.nativeElement.querySelectorAll(
          '.plan-summary__total-row'
        );

        expect(totalRows[1].textContent).toContain('Impuestos');
        expect(totalRows[1].textContent).toContain('Incluidos');
      });

      it('should render total amount', () => {
        const totalAmount = fixture.nativeElement.querySelector(
          '.plan-summary__total-amount'
        );

        expect(totalAmount.textContent).toContain('19');
      });

      it('should render continue button', () => {
        const continueButton = fixture.nativeElement.querySelector(
          '.boton--primario'
        );

        expect(continueButton).toBeTruthy();
        expect(continueButton.textContent).toContain('Continuar al pago');
      });

      it('should render change plan link', () => {
        const changeLink = fixture.nativeElement.querySelector(
          '.plan-summary__change-link'
        );

        expect(changeLink).toBeTruthy();
        expect(changeLink.textContent).toContain('Cambiar plan');
      });
    });

    describe('without destacado', () => {
      beforeEach(() => {
        component.planInfo = mockPlanInfoIndividual;
        fixture.detectChanges();
      });

      it('should not render recommended badge', () => {
        const badge = fixture.nativeElement.querySelector(
          '.plan-summary__badge'
        );

        expect(badge).toBeFalsy();
      });
    });

    describe('without planInfo', () => {
      beforeEach(() => {
        component.planInfo = null;
        fixture.detectChanges();
      });

      it('should not render plan summary', () => {
        const planSummary = fixture.nativeElement.querySelector(
          '.plan-summary'
        );

        expect(planSummary).toBeFalsy();
      });
    });

    describe('user interactions', () => {
      beforeEach(() => {
        component.planInfo = mockPlanInfoMensual;
        fixture.detectChanges();
      });

      it('should call onContinuar when continue button clicked', () => {
        spyOn(component, 'onContinuar');
        const continueButton = fixture.nativeElement.querySelector(
          '.boton--primario'
        );

        continueButton.click();

        expect(component.onContinuar).toHaveBeenCalled();
      });

      it('should emit continuar event when continue button clicked', () => {
        spyOn(component.continuar, 'emit');
        const continueButton = fixture.nativeElement.querySelector(
          '.boton--primario'
        );

        continueButton.click();

        expect(component.continuar.emit).toHaveBeenCalled();
      });
    });

    describe('with ANUAL plan', () => {
      beforeEach(() => {
        component.planInfo = mockPlanInfoAnual;
        fixture.detectChanges();
      });

      it('should render anual price', () => {
        const priceAmount = fixture.nativeElement.querySelector(
          '.plan-summary__price-amount'
        );

        expect(priceAmount.textContent).toContain('199');
      });

      it('should render ano as period', () => {
        const pricePeriod = fixture.nativeElement.querySelector(
          '.plan-summary__price-period'
        );

        expect(pricePeriod.textContent).toContain('ano');
      });
    });
  });

  describe('feature rendering', () => {
    it('should render correct number of features for INDIVIDUAL plan', () => {
      component.planInfo = mockPlanInfoIndividual;
      fixture.detectChanges();

      const features = fixture.nativeElement.querySelectorAll(
        '.plan-summary__feature'
      );

      expect(features.length).toBe(4);
    });

    it('should render correct number of features for MENSUAL plan', () => {
      component.planInfo = mockPlanInfoMensual;
      fixture.detectChanges();

      const features = fixture.nativeElement.querySelectorAll(
        '.plan-summary__feature'
      );

      expect(features.length).toBe(5);
    });

    it('should render correct number of features for ANUAL plan', () => {
      component.planInfo = mockPlanInfoAnual;
      fixture.detectChanges();

      const features = fixture.nativeElement.querySelectorAll(
        '.plan-summary__feature'
      );

      expect(features.length).toBe(5);
    });

    it('should render feature icons', () => {
      component.planInfo = mockPlanInfoMensual;
      fixture.detectChanges();

      const featureIcons = fixture.nativeElement.querySelectorAll(
        '.plan-summary__feature-icon'
      );

      expect(featureIcons.length).toBe(5);
    });
  });
});
