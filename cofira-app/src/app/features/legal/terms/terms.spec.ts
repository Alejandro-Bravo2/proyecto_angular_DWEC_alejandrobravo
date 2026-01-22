import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';

import { Terms } from './terms';

describe('Terms', () => {
  let component: Terms;
  let fixture: ComponentFixture<Terms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Terms],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Terms);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Page structure', () => {
    it('should have a legal-page article container', () => {
      const article = fixture.debugElement.query(By.css('.legal-page'));
      expect(article).toBeTruthy();
    });

    it('should have a header with back link', () => {
      const header = fixture.debugElement.query(By.css('.legal-page__header'));
      expect(header).toBeTruthy();

      const backLink = fixture.debugElement.query(By.css('.legal-page__back'));
      expect(backLink).toBeTruthy();
    });

    it('should have a main content section', () => {
      const main = fixture.debugElement.query(By.css('.legal-page__content'));
      expect(main).toBeTruthy();
    });

    it('should have a footer with link to privacy', () => {
      const footer = fixture.debugElement.query(By.css('.legal-page__footer'));
      expect(footer).toBeTruthy();
    });
  });

  describe('Header content', () => {
    it('should display the page title', () => {
      const title = fixture.debugElement.query(By.css('.legal-page__title'));
      expect(title).toBeTruthy();
      expect(title.nativeElement.textContent).toContain('Terminos de Servicio');
    });

    it('should display the last updated date', () => {
      const updated = fixture.debugElement.query(By.css('.legal-page__updated'));
      expect(updated).toBeTruthy();
      expect(updated.nativeElement.textContent).toContain('Ultima actualizacion');
    });

    it('should have back link pointing to home', () => {
      const backLink = fixture.debugElement.query(By.css('.legal-page__back'));
      expect(backLink.attributes['routerLink']).toBe('/');
    });

    it('should have back link text', () => {
      const backLink = fixture.debugElement.query(By.css('.legal-page__back'));
      expect(backLink.nativeElement.textContent).toContain('Volver al inicio');
    });

    it('should have an SVG icon in back link', () => {
      const svg = fixture.debugElement.query(By.css('.legal-page__back svg'));
      expect(svg).toBeTruthy();
    });
  });

  describe('Content sections', () => {
    it('should have multiple sections', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section'));
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should have section about terms acceptance', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Aceptacion de los Terminos'))).toBeTrue();
    });

    it('should have section about service description', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Descripcion del Servicio'))).toBeTrue();
    });

    it('should have section about usage requirements', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Requisitos de Uso'))).toBeTrue();
    });

    it('should have section about medical disclaimer', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Aviso Medico'))).toBeTrue();
    });

    it('should have section about user account', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Cuenta de Usuario'))).toBeTrue();
    });

    it('should have section about intellectual property', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Propiedad Intelectual'))).toBeTrue();
    });

    it('should have section about liability limitation', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Limitacion de Responsabilidad'))).toBeTrue();
    });

    it('should have section about service modifications', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Modificaciones del Servicio'))).toBeTrue();
    });

    it('should have section about terms changes', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Cambios en los Terminos'))).toBeTrue();
    });

    it('should have contact section', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Contacto'))).toBeTrue();
    });
  });

  describe('Content details', () => {
    it('should describe COFIRA services', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('COFIRA');
      expect(content).toContain('entrenamiento');
      expect(content).toContain('nutricion');
    });

    it('should mention minimum age requirement', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('16');
    });

    it('should include medical disclaimer', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('no proporciona asesoramiento medico');
    });

    it('should include contact email', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('cofira.com');
    });

    it('should list service features', () => {
      const lists = fixture.debugElement.queryAll(By.css('.legal-page__section ul'));
      expect(lists.length).toBeGreaterThan(0);
    });

    it('should mention training plans feature', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Planes de entrenamiento');
    });

    it('should mention nutritional recommendations feature', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Recomendaciones nutricionales');
    });

    it('should mention progress tracking feature', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Seguimiento de progreso');
    });
  });

  describe('Footer navigation', () => {
    it('should have link to privacy policy', () => {
      const privacyLink = fixture.debugElement.query(By.css('.legal-page__footer .legal-page__link'));
      expect(privacyLink).toBeTruthy();
      expect(privacyLink.attributes['routerLink']).toBe('/privacy');
    });

    it('should display privacy link text', () => {
      const privacyLink = fixture.debugElement.query(By.css('.legal-page__footer .legal-page__link'));
      expect(privacyLink.nativeElement.textContent).toContain('Ver Politica de Privacidad');
    });
  });

  describe('Accessibility', () => {
    it('should use semantic HTML with article element', () => {
      const article = fixture.debugElement.query(By.css('article'));
      expect(article).toBeTruthy();
    });

    it('should use header element', () => {
      const header = fixture.debugElement.query(By.css('header'));
      expect(header).toBeTruthy();
    });

    it('should use main element', () => {
      const main = fixture.debugElement.query(By.css('main'));
      expect(main).toBeTruthy();
    });

    it('should use footer element', () => {
      const footer = fixture.debugElement.query(By.css('footer'));
      expect(footer).toBeTruthy();
    });

    it('should use section elements for content', () => {
      const sections = fixture.debugElement.queryAll(By.css('section'));
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should have h1 title', () => {
      const h1 = fixture.debugElement.query(By.css('h1'));
      expect(h1).toBeTruthy();
    });

    it('should have h2 headings for sections', () => {
      const h2Elements = fixture.debugElement.queryAll(By.css('h2'));
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it('should have numbered sections in order', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);

      // Check that sections start with numbers in order
      expect(sectionTitles[0]).toContain('1.');
      expect(sectionTitles[1]).toContain('2.');
      expect(sectionTitles[2]).toContain('3.');
    });
  });

  describe('Router integration', () => {
    it('should have routerLink directive on back link', () => {
      const backLink = fixture.debugElement.query(By.css('.legal-page__back'));
      expect(backLink.attributes['routerLink']).toBeDefined();
    });

    it('should have routerLink directive on footer link', () => {
      const footerLink = fixture.debugElement.query(By.css('.legal-page__footer .legal-page__link'));
      expect(footerLink.attributes['routerLink']).toBeDefined();
    });

    it('should have internal link to home in contact section', () => {
      const contactSection = fixture.debugElement.queryAll(By.css('.legal-page__section')).pop();
      const homeLink = contactSection?.query(By.css('a[routerLink="/"]'));
      expect(homeLink).toBeTruthy();
    });
  });

  describe('Legal disclaimer emphasis', () => {
    it('should emphasize that COFIRA does not provide medical advice', () => {
      const strongElements = fixture.debugElement.queryAll(By.css('strong'));
      const strongTexts = strongElements.map(el => el.nativeElement.textContent);
      expect(strongTexts.some((text: string) => text.includes('no proporciona asesoramiento medico'))).toBeTrue();
    });
  });

  describe('Service features list', () => {
    it('should list training and nutrition features', () => {
      const featuresList = fixture.debugElement.queryAll(By.css('.legal-page__section ul li'));
      const featureTexts = featuresList.map(el => el.nativeElement.textContent);

      const hasTrainingFeature = featureTexts.some((text: string) =>
        text.toLowerCase().includes('entrenamiento') || text.toLowerCase().includes('ejercicio')
      );
      const hasNutritionFeature = featureTexts.some((text: string) =>
        text.toLowerCase().includes('nutricional') || text.toLowerCase().includes('calorias')
      );

      expect(hasTrainingFeature).toBeTrue();
      expect(hasNutritionFeature).toBeTrue();
    });
  });
});
