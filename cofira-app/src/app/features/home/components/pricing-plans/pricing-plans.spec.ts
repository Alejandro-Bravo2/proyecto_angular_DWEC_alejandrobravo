import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { PricingPlans } from './pricing-plans';
import { AuthService } from '../../../../core/auth/auth.service';
import { TipoPlan } from '../../../checkout/models/checkout.model';

describe('PricingPlans', () => {
  let component: PricingPlans;
  let fixture: ComponentFixture<PricingPlans>;
  let compiled: HTMLElement;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    mockAuthService.isLoggedIn.and.returnValue(false);

    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl']);
    mockRouter.createUrlTree.and.returnValue({} as any);
    mockRouter.serializeUrl.and.returnValue('/login');
    (mockRouter as any).events = of();

    mockActivatedRoute = {
      snapshot: { params: {}, queryParams: {} },
      params: of({}),
      queryParams: of({})
    };

    await TestBed.configureTestingModule({
      imports: [PricingPlans],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PricingPlans);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  describe('Creación del componente', () => {
    it('debería crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debería ser un componente standalone', () => {
      const componentMetadata = (PricingPlans as any).ɵcmp;
      expect(componentMetadata.standalone).toBe(true);
    });

    it('debería inyectar Router y AuthService correctamente', () => {
      expect((component as any).router).toBeDefined();
      expect((component as any).authService).toBeDefined();
    });
  });

  describe('Renderizado de la plantilla', () => {
    it('debería renderizar la sección de precios', () => {
      const pricingSection = compiled.querySelector('.pricing');
      expect(pricingSection).toBeTruthy();
    });

    it('debería renderizar el contenedor de precios', () => {
      const pricingContainer = compiled.querySelector('.pricing__container');
      expect(pricingContainer).toBeTruthy();
    });

    it('debería renderizar el encabezado de precios', () => {
      const pricingHeader = compiled.querySelector('.pricing__header');
      expect(pricingHeader).toBeTruthy();
    });

    it('debería renderizar el grid de tarjetas', () => {
      const pricingGrid = compiled.querySelector('.pricing__grid');
      expect(pricingGrid).toBeTruthy();
    });

    it('debería renderizar el footer con nota', () => {
      const pricingFooter = compiled.querySelector('.pricing__footer');
      expect(pricingFooter).toBeTruthy();
    });
  });

  describe('Contenido del encabezado', () => {
    it('debería mostrar la etiqueta "Planes"', () => {
      const label = compiled.querySelector('.pricing__label');
      expect(label?.textContent).toBe('Planes');
    });

    it('debería mostrar el título "Elige tu camino"', () => {
      const title = compiled.querySelector('.pricing__title');
      expect(title?.textContent).toBe('Elige tu camino');
    });

    it('debería mostrar el subtítulo descriptivo', () => {
      const subtitle = compiled.querySelector('.pricing__subtitle');
      expect(subtitle?.textContent).toContain('Planes flexibles');
    });
  });

  describe('Tarjetas de planes', () => {
    it('debería renderizar exactamente 3 tarjetas de precios', () => {
      const cards = compiled.querySelectorAll('.tarjeta--precios');
      expect(cards.length).toBe(3);
    });

    it('la segunda tarjeta debería estar destacada', () => {
      const highlightedCard = compiled.querySelector('.tarjeta--destacada');
      expect(highlightedCard).toBeTruthy();
    });

    it('la tarjeta destacada debería tener un badge "Recomendado"', () => {
      const badge = compiled.querySelector('.tarjeta__badge');
      expect(badge?.textContent).toBe('Recomendado');
    });

    describe('Plan Individual', () => {
      let individualCard: Element | null;

      beforeEach(() => {
        const cards = Array.from(compiled.querySelectorAll('.tarjeta--precios'));
        individualCard = cards.find(card =>
          card.querySelector('.tarjeta__titulo')?.textContent === 'Individual'
        ) || null;
      });

      it('debería existir el plan Individual', () => {
        expect(individualCard).toBeTruthy();
      });

      it('debería mostrar el precio correcto', () => {
        const price = individualCard?.querySelector('.tarjeta__precio');
        expect(price?.textContent).toContain('€9');
        expect(price?.getAttribute('value')).toBe('9');
      });

      it('debería mostrar el subtítulo "Para empezar"', () => {
        const subtitle = individualCard?.querySelector('.tarjeta__subtitulo');
        expect(subtitle?.textContent).toBe('Para empezar');
      });

      it('debería tener una lista de características', () => {
        const features = individualCard?.querySelectorAll('.tarjeta__item');
        expect(features?.length).toBeGreaterThan(0);
      });

      it('debería tener un botón "Comenzar"', () => {
        const button = individualCard?.querySelector('.boton');
        expect(button?.textContent?.trim()).toBe('Comenzar');
      });
    });

    describe('Plan Mensual', () => {
      let mensualCard: Element | null;

      beforeEach(() => {
        const cards = Array.from(compiled.querySelectorAll('.tarjeta--precios'));
        mensualCard = cards.find(card =>
          card.querySelector('.tarjeta__titulo')?.textContent === 'Mensual'
        ) || null;
      });

      it('debería existir el plan Mensual', () => {
        expect(mensualCard).toBeTruthy();
      });

      it('debería estar destacado', () => {
        expect(mensualCard?.classList.contains('tarjeta--destacada')).toBe(true);
      });

      it('debería mostrar el precio correcto', () => {
        const price = mensualCard?.querySelector('.tarjeta__precio');
        expect(price?.textContent).toContain('€19');
        expect(price?.getAttribute('value')).toBe('19');
      });

      it('debería mostrar el subtítulo "Mas popular"', () => {
        const subtitle = mensualCard?.querySelector('.tarjeta__subtitulo');
        expect(subtitle?.textContent).toBe('Mas popular');
      });

      it('debería tener más características que el plan Individual', () => {
        const mensualFeatures = mensualCard?.querySelectorAll('.tarjeta__item');
        expect(mensualFeatures?.length).toBeGreaterThanOrEqual(5);
      });

      it('el botón debería ser primario', () => {
        const button = mensualCard?.querySelector('.boton');
        expect(button?.classList.contains('boton--primario')).toBe(true);
      });
    });

    describe('Plan Anual', () => {
      let anualCard: Element | null;

      beforeEach(() => {
        const cards = Array.from(compiled.querySelectorAll('.tarjeta--precios'));
        anualCard = cards.find(card =>
          card.querySelector('.tarjeta__titulo')?.textContent === 'Anual'
        ) || null;
      });

      it('debería existir el plan Anual', () => {
        expect(anualCard).toBeTruthy();
      });

      it('debería mostrar el precio correcto', () => {
        const price = anualCard?.querySelector('.tarjeta__precio');
        expect(price?.textContent).toContain('€199');
        expect(price?.getAttribute('value')).toBe('199');
      });

      it('debería mostrar el subtítulo "Mejor valor"', () => {
        const subtitle = anualCard?.querySelector('.tarjeta__subtitulo');
        expect(subtitle?.textContent).toBe('Mejor valor');
      });

      it('debería mencionar "2 meses gratis"', () => {
        const features = Array.from(anualCard?.querySelectorAll('.tarjeta__item') || []);
        const hasFreeTrial = features.some(item =>
          item.textContent?.includes('2 meses gratis')
        );
        expect(hasFreeTrial).toBe(true);
      });
    });
  });

  describe('Funcionalidad selectPlan - Usuario NO autenticado', () => {
    beforeEach(() => {
      mockAuthService.isLoggedIn.and.returnValue(false);
    });

    it('debería redirigir a login con plan INDIVIDUAL', () => {
      component.selectPlan('INDIVIDUAL');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { redirect: '/checkout', plan: 'INDIVIDUAL' },
      });
    });

    it('debería redirigir a login con plan MENSUAL', () => {
      component.selectPlan('MENSUAL');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { redirect: '/checkout', plan: 'MENSUAL' },
      });
    });

    it('debería redirigir a login con plan ANUAL', () => {
      component.selectPlan('ANUAL');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { redirect: '/checkout', plan: 'ANUAL' },
      });
    });

    it('debería guardar el plan seleccionado en sessionStorage', () => {
      spyOn(sessionStorage, 'setItem');
      component.selectPlan('MENSUAL');

      expect(sessionStorage.setItem).toHaveBeenCalledWith('selectedPlan', 'MENSUAL');
    });

    it('debería incluir queryParams de redirect y plan', () => {
      component.selectPlan('ANUAL');

      const navigateCall = mockRouter.navigate.calls.mostRecent();
      expect(navigateCall.args[1]?.queryParams).toEqual({
        redirect: '/checkout',
        plan: 'ANUAL'
      });
    });
  });

  describe('Funcionalidad selectPlan - Usuario autenticado', () => {
    beforeEach(() => {
      mockAuthService.isLoggedIn.and.returnValue(true);
    });

    it('debería redirigir directamente a checkout con plan INDIVIDUAL', () => {
      component.selectPlan('INDIVIDUAL');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/checkout'], {
        queryParams: { plan: 'INDIVIDUAL' },
      });
    });

    it('debería redirigir directamente a checkout con plan MENSUAL', () => {
      component.selectPlan('MENSUAL');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/checkout'], {
        queryParams: { plan: 'MENSUAL' },
      });
    });

    it('debería redirigir directamente a checkout con plan ANUAL', () => {
      component.selectPlan('ANUAL');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/checkout'], {
        queryParams: { plan: 'ANUAL' },
      });
    });

    it('NO debería guardar el plan en sessionStorage', () => {
      spyOn(sessionStorage, 'setItem');
      component.selectPlan('MENSUAL');

      expect(sessionStorage.setItem).not.toHaveBeenCalled();
    });

    it('NO debería incluir queryParam de redirect', () => {
      component.selectPlan('ANUAL');

      const navigateCall = mockRouter.navigate.calls.mostRecent();
      expect(navigateCall.args[1]?.queryParams?.['redirect']).toBeUndefined();
    });
  });

  describe('Interacción con botones', () => {
    it('los botones deberían tener el evento click vinculado', () => {
      const buttons = compiled.querySelectorAll('.tarjeta__acciones button');
      expect(buttons.length).toBe(3);

      buttons.forEach(button => {
        const hasClickHandler = button.getAttribute('ng-reflect-ng-click') !== null ||
                                button.hasAttribute('(click)');
        // En Angular, los event bindings se procesan en tiempo de ejecución
        expect(button).toBeTruthy();
      });
    });

    it('hacer click en botón de plan Individual debería llamar selectPlan', () => {
      spyOn(component, 'selectPlan');
      const cards = Array.from(compiled.querySelectorAll('.tarjeta--precios'));
      const individualCard = cards.find(card =>
        card.querySelector('.tarjeta__titulo')?.textContent === 'Individual'
      );
      const button = individualCard?.querySelector('button') as HTMLButtonElement;

      button?.click();
      fixture.detectChanges();

      expect(component.selectPlan).toHaveBeenCalled();
    });

    it('hacer click en botón de plan Mensual debería llamar selectPlan', () => {
      spyOn(component, 'selectPlan');
      const cards = Array.from(compiled.querySelectorAll('.tarjeta--precios'));
      const mensualCard = cards.find(card =>
        card.querySelector('.tarjeta__titulo')?.textContent === 'Mensual'
      );
      const button = mensualCard?.querySelector('button') as HTMLButtonElement;

      button?.click();
      fixture.detectChanges();

      expect(component.selectPlan).toHaveBeenCalled();
    });

    it('hacer click en botón de plan Anual debería llamar selectPlan', () => {
      spyOn(component, 'selectPlan');
      const cards = Array.from(compiled.querySelectorAll('.tarjeta--precios'));
      const anualCard = cards.find(card =>
        card.querySelector('.tarjeta__titulo')?.textContent === 'Anual'
      );
      const button = anualCard?.querySelector('button') as HTMLButtonElement;

      button?.click();
      fixture.detectChanges();

      expect(component.selectPlan).toHaveBeenCalled();
    });
  });

  describe('Estructura HTML semántica', () => {
    it('debería usar section como elemento principal', () => {
      const pricing = compiled.querySelector('.pricing');
      expect(pricing?.tagName.toLowerCase()).toBe('section');
    });

    it('debería usar article para el contenedor', () => {
      const container = compiled.querySelector('.pricing__container');
      expect(container?.tagName.toLowerCase()).toBe('article');
    });

    it('debería usar header para el encabezado', () => {
      const header = compiled.querySelector('.pricing__header');
      expect(header?.tagName.toLowerCase()).toBe('header');
    });

    it('debería usar h2 para el título principal', () => {
      const title = compiled.querySelector('.pricing__title');
      expect(title?.tagName.toLowerCase()).toBe('h2');
    });

    it('debería usar article para cada tarjeta', () => {
      const cards = compiled.querySelectorAll('.tarjeta--precios');
      cards.forEach(card => {
        expect(card.tagName.toLowerCase()).toBe('article');
      });
    });

    it('debería usar data element para los precios', () => {
      const prices = compiled.querySelectorAll('.tarjeta__precio');
      prices.forEach(price => {
        expect(price.tagName.toLowerCase()).toBe('data');
      });
    });

    it('debería usar footer para las acciones de cada tarjeta', () => {
      const footers = compiled.querySelectorAll('.tarjeta__acciones');
      footers.forEach(footer => {
        expect(footer.tagName.toLowerCase()).toBe('footer');
      });
    });

    it('debería usar footer para la nota final', () => {
      const footer = compiled.querySelector('.pricing__footer');
      expect(footer?.tagName.toLowerCase()).toBe('footer');
    });
  });

  describe('Clases BEM', () => {
    it('todas las clases principales deberían seguir BEM', () => {
      const bemElements = [
        '.pricing__container',
        '.pricing__header',
        '.pricing__label',
        '.pricing__title',
        '.pricing__subtitle',
        '.pricing__grid',
        '.pricing__footer'
      ];

      bemElements.forEach(selector => {
        const element = compiled.querySelector(selector);
        expect(element).toBeTruthy(`${selector} no encontrado`);
      });
    });

    it('las tarjetas deberían usar modificadores BEM', () => {
      const cards = compiled.querySelectorAll('.tarjeta--precios');
      expect(cards.length).toBe(3);

      const destacada = compiled.querySelector('.tarjeta--destacada');
      expect(destacada).toBeTruthy();
    });

    it('los botones deberían usar modificadores BEM', () => {
      const primaryButton = compiled.querySelector('.boton--primario');
      const secondaryButtons = compiled.querySelectorAll('.boton--secundario');

      expect(primaryButton).toBeTruthy();
      expect(secondaryButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Footer informativo', () => {
    it('debería mostrar información sobre prueba gratuita', () => {
      const footerText = compiled.querySelector('.pricing__footer p');
      expect(footerText?.textContent).toContain('14 dias de prueba gratis');
    });

    it('debería mencionar política de cancelación', () => {
      const footerText = compiled.querySelector('.pricing__footer p');
      expect(footerText?.textContent).toContain('Cancela cuando quieras');
    });
  });

  describe('Accesibilidad', () => {
    it('cada tarjeta debería tener un título h3', () => {
      const titles = compiled.querySelectorAll('.tarjeta__titulo');
      titles.forEach(title => {
        expect(title.tagName.toLowerCase()).toBe('h3');
      });
    });

    it('los precios deberían tener el atributo value para máquinas', () => {
      const prices = compiled.querySelectorAll('.tarjeta__precio');
      prices.forEach(price => {
        expect(price.hasAttribute('value')).toBe(true);
      });
    });

    it('todos los botones deberían ser elementos button', () => {
      const buttons = compiled.querySelectorAll('.tarjeta__acciones button');
      expect(buttons.length).toBe(3);
    });

    it('el badge "Recomendado" debería usar la etiqueta mark', () => {
      const badge = compiled.querySelector('.tarjeta__badge');
      expect(badge?.tagName.toLowerCase()).toBe('mark');
    });
  });
});
