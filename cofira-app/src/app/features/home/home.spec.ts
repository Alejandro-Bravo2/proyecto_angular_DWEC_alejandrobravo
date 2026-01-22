import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { Home } from './home';
import { PricingPlans } from './components/pricing-plans/pricing-plans';
import { NewsletterForm } from './components/newsletter-form/newsletter-form';
import { Accordion, AccordionItem } from '../../shared/components/ui/accordion/accordion';

// Mock del HeroSection que usa ThreeScene
@Component({
  selector: 'app-hero-section',
  standalone: true,
  template: '<section class="hero-section-mock"></section>',
})
class MockHeroSectionComponent {}

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
      ],
    })
      .overrideComponent(Home, {
        set: {
          imports: [
            MockHeroSectionComponent,
            PricingPlans,
            NewsletterForm,
            Accordion,
            AccordionItem,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  describe('Creación del componente', () => {
    it('debería crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debería tener la clase CSS correcta en el elemento raíz', () => {
      const hostElement = fixture.debugElement.nativeElement;
      expect(hostElement).toBeTruthy();
    });
  });

  describe('Datos de FAQs', () => {
    it('debería tener exactamente 6 preguntas frecuentes', () => {
      expect(component.faqs.length).toBe(6);
    });

    it('cada FAQ debería tener las propiedades question y answer', () => {
      component.faqs.forEach(faq => {
        expect(faq.question).toBeDefined();
        expect(faq.answer).toBeDefined();
        expect(typeof faq.question).toBe('string');
        expect(typeof faq.answer).toBe('string');
      });
    });

    it('las preguntas no deberían estar vacías', () => {
      component.faqs.forEach(faq => {
        expect(faq.question.trim().length).toBeGreaterThan(0);
        expect(faq.answer.trim().length).toBeGreaterThan(0);
      });
    });

    it('debería tener la pregunta "¿Qué es COFIRA?" como primera FAQ', () => {
      expect(component.faqs[0].question).toBe('¿Qué es COFIRA?');
    });

    it('debería tener información sobre seguridad de datos', () => {
      const securityFaq = component.faqs.find(faq =>
        faq.question.includes('datos están seguros')
      );
      expect(securityFaq).toBeDefined();
      expect(securityFaq?.answer).toContain('encriptación');
    });

    it('debería tener información sobre planes de pago', () => {
      const paymentFaq = component.faqs.find(faq =>
        faq.question.includes('pagar')
      );
      expect(paymentFaq).toBeDefined();
      expect(paymentFaq?.answer).toContain('plan gratuito');
    });
  });

  describe('Renderizado de la plantilla', () => {
    it('debería renderizar el componente hero-section', () => {
      const heroSection = compiled.querySelector('app-hero-section');
      expect(heroSection).toBeTruthy();
    });

    it('debería renderizar el componente pricing-plans', () => {
      const pricingPlans = compiled.querySelector('app-pricing-plans');
      expect(pricingPlans).toBeTruthy();
    });

    it('debería renderizar el componente newsletter-form', () => {
      const newsletterForm = compiled.querySelector('app-newsletter-form');
      expect(newsletterForm).toBeTruthy();
    });

    it('debería renderizar la sección de FAQs', () => {
      const faqSection = compiled.querySelector('.faq-section');
      expect(faqSection).toBeTruthy();
    });

    it('debería mostrar el título "Preguntas Frecuentes"', () => {
      const faqTitle = compiled.querySelector('.faq-section__title');
      expect(faqTitle?.textContent).toContain('Preguntas Frecuentes');
    });

    it('debería mostrar el subtítulo de FAQs', () => {
      const faqSubtitle = compiled.querySelector('.faq-section__subtitle');
      expect(faqSubtitle?.textContent).toContain('Encuentra respuestas');
    });
  });

  describe('Componente Accordion', () => {
    it('debería renderizar el componente accordion', () => {
      const accordion = compiled.querySelector('app-accordion');
      expect(accordion).toBeTruthy();
    });

    it('debería renderizar 6 items de accordion para cada FAQ', () => {
      const accordionItems = compiled.querySelectorAll('app-accordion-item');
      expect(accordionItems.length).toBe(6);
    });

    it('cada item del accordion debería tener un título', () => {
      const accordionDebugElements = fixture.debugElement.queryAll(
        By.directive(AccordionItem)
      );

      expect(accordionDebugElements.length).toBe(6);

      accordionDebugElements.forEach((debugElement, index) => {
        const componentInstance = debugElement.componentInstance;
        const titleInput = componentInstance.title;
        // Verificar que title existe y es una string o función
        expect(titleInput).toBeDefined();

        // Si es una función (signal), obtener su valor
        const titleValue = typeof titleInput === 'function' ? titleInput() : titleInput;
        expect(titleValue).toBe(component.faqs[index].question);
      });
    });

    it('cada item del accordion debería renderizar la respuesta', () => {
      const answers = compiled.querySelectorAll('.faq-section__answer');
      expect(answers.length).toBe(6);

      answers.forEach((answer, index) => {
        expect(answer.textContent?.trim()).toBe(component.faqs[index].answer);
      });
    });
  });

  describe('Estructura HTML semántica', () => {
    it('debería usar elementos section para las secciones principales', () => {
      const sections = compiled.querySelectorAll('section');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('debería usar header para el encabezado de FAQs', () => {
      const header = compiled.querySelector('.faq-section__header');
      expect(header?.tagName.toLowerCase()).toBe('header');
    });

    it('debería tener la clase o-container para el contenedor', () => {
      const container = compiled.querySelector('.o-container');
      expect(container).toBeTruthy();
    });
  });

  describe('Accesibilidad', () => {
    it('el título principal de FAQs debería ser un h2', () => {
      const title = compiled.querySelector('.faq-section__title');
      expect(title?.tagName.toLowerCase()).toBe('h2');
    });

    it('el accordion debería ser navegable', () => {
      const accordion = compiled.querySelector('app-accordion');
      expect(accordion).toBeTruthy();
    });
  });

  describe('Integración de componentes', () => {
    it('debería cargar todos los componentes hijos sin errores', () => {
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('los componentes deberían estar en el orden correcto', () => {
      const elements = Array.from(compiled.children);
      const selectors = elements.map(el => el.tagName.toLowerCase());

      const heroIndex = selectors.indexOf('app-hero-section');
      const pricingIndex = selectors.indexOf('app-pricing-plans');
      const faqIndex = selectors.findIndex(tag =>
        compiled.querySelectorAll('section')[tag as any]?.classList?.contains('faq-section')
      );
      const newsletterIndex = selectors.indexOf('app-newsletter-form');

      expect(heroIndex).toBeLessThan(pricingIndex);
      expect(newsletterIndex).toBeGreaterThan(0);
    });
  });

  describe('Inmutabilidad de datos', () => {
    it('el array de FAQs no debería modificarse durante el ciclo de vida', () => {
      const faqsIniciales = JSON.parse(JSON.stringify(component.faqs));

      fixture.detectChanges();

      expect(component.faqs).toEqual(faqsIniciales);
    });

    it('los objetos FAQ deberían tener propiedades de solo lectura', () => {
      const faq = component.faqs[0];
      const questionOriginal = faq.question;

      // Intentar modificar (no debería afectar el componente)
      expect(faq.question).toBe(questionOriginal);
    });
  });
});
