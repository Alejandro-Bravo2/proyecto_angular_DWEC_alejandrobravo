import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';

import { Privacy } from './privacy';

describe('Privacy', () => {
  let component: Privacy;
  let fixture: ComponentFixture<Privacy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Privacy],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Privacy);
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

    it('should have a footer with link to terms', () => {
      const footer = fixture.debugElement.query(By.css('.legal-page__footer'));
      expect(footer).toBeTruthy();
    });
  });

  describe('Header content', () => {
    it('should display the page title', () => {
      const title = fixture.debugElement.query(By.css('.legal-page__title'));
      expect(title).toBeTruthy();
      expect(title.nativeElement.textContent).toContain('Politica de Privacidad');
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

    it('should have section about information collected', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Informacion que Recopilamos'))).toBeTrue();
    });

    it('should have section about how information is used', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Como Utilizamos tu Informacion'))).toBeTrue();
    });

    it('should have section about sensitive health data', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Datos de Salud Sensibles'))).toBeTrue();
    });

    it('should have section about storage and security', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Almacenamiento y Seguridad'))).toBeTrue();
    });

    it('should have section about data sharing', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Comparticion de Datos'))).toBeTrue();
    });

    it('should have section about user rights', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Tus Derechos'))).toBeTrue();
    });

    it('should have section about cookies', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Cookies'))).toBeTrue();
    });

    it('should have section about minors', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Menores de Edad'))).toBeTrue();
    });

    it('should have section about data retention', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Retencion de Datos'))).toBeTrue();
    });

    it('should have section about policy changes', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Cambios en esta Politica'))).toBeTrue();
    });

    it('should have contact section', () => {
      const sections = fixture.debugElement.queryAll(By.css('.legal-page__section h2'));
      const sectionTitles = sections.map(s => s.nativeElement.textContent);
      expect(sectionTitles.some((title: string) => title.includes('Contacto'))).toBeTrue();
    });
  });

  describe('Content details', () => {
    it('should list types of data collected', () => {
      const lists = fixture.debugElement.queryAll(By.css('.legal-page__section ul'));
      expect(lists.length).toBeGreaterThan(0);

      const firstSectionList = lists[0];
      const items = firstSectionList.queryAll(By.css('li'));
      expect(items.length).toBeGreaterThan(0);
    });

    it('should mention COFIRA brand in content', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('COFIRA');
    });

    it('should mention minimum age requirement', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('16');
    });

    it('should include contact email', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('cofira.com');
    });
  });

  describe('Footer navigation', () => {
    it('should have link to terms of service', () => {
      const termsLink = fixture.debugElement.query(By.css('.legal-page__footer .legal-page__link'));
      expect(termsLink).toBeTruthy();
      expect(termsLink.attributes['routerLink']).toBe('/terms');
    });

    it('should display terms link text', () => {
      const termsLink = fixture.debugElement.query(By.css('.legal-page__footer .legal-page__link'));
      expect(termsLink.nativeElement.textContent).toContain('Ver Terminos de Servicio');
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
  });
});
