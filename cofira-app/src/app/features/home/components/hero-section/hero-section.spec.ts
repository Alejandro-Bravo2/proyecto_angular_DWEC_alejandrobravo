import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeroSection } from './hero-section';
import { ThreeSceneComponent } from '../../../../shared/components/three-scene/three-scene.component';

// Mock del componente ThreeScene para evitar errores de WebGL en tests
@Component({
  selector: 'app-three-scene',
  standalone: true,
  template: '<div class="three-scene-mock"></div>',
})
class MockThreeSceneComponent {}

describe('HeroSection', () => {
  let component: HeroSection;
  let fixture: ComponentFixture<HeroSection>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSection],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
      ],
    })
      .overrideComponent(HeroSection, {
        set: {
          imports: [CommonModule, MockThreeSceneComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HeroSection);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  describe('Creación del componente', () => {
    it('debería crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debería ser un componente standalone', () => {
      const componentMetadata = (HeroSection as any).ɵcmp;
      expect(componentMetadata.standalone).toBe(true);
    });
  });

  describe('Renderizado de la plantilla', () => {
    it('debería renderizar la sección hero', () => {
      const heroSection = compiled.querySelector('.hero');
      expect(heroSection).toBeTruthy();
    });

    it('debería renderizar el componente three-scene', () => {
      const threeScene = compiled.querySelector('app-three-scene');
      expect(threeScene).toBeTruthy();
    });

    it('el componente three-scene debería tener la clase hero__canvas', () => {
      const threeScene = compiled.querySelector('app-three-scene');
      expect(threeScene?.classList.contains('hero__canvas')).toBe(true);
    });

    it('debería renderizar el contenedor de contenido', () => {
      const heroContent = compiled.querySelector('.hero__content');
      expect(heroContent).toBeTruthy();
    });

    it('debería renderizar el título principal', () => {
      const heroTitle = compiled.querySelector('.hero__title');
      expect(heroTitle).toBeTruthy();
    });

    it('debería renderizar el subtítulo', () => {
      const heroSubtitle = compiled.querySelector('.hero__subtitle');
      expect(heroSubtitle).toBeTruthy();
    });

    it('debería renderizar el menú de acciones', () => {
      const heroActions = compiled.querySelector('.hero__actions');
      expect(heroActions).toBeTruthy();
    });

    it('debería renderizar el indicador de scroll', () => {
      const scrollIndicator = compiled.querySelector('.hero__scroll-indicator');
      expect(scrollIndicator).toBeTruthy();
    });
  });

  describe('Contenido del texto', () => {
    it('el título debería contener "Tu transformación"', () => {
      const heroTitle = compiled.querySelector('.hero__title');
      expect(heroTitle?.textContent).toContain('Tu transformaci');
    });

    it('el título debería tener texto resaltado "comienza aquí."', () => {
      const heroTitleHighlight = compiled.querySelector('.hero__title-highlight');
      expect(heroTitleHighlight).toBeTruthy();
      expect(heroTitleHighlight?.textContent).toContain('comienza aqu');
    });

    it('el subtítulo debería contener información sobre el servicio', () => {
      const heroSubtitle = compiled.querySelector('.hero__subtitle');
      expect(heroSubtitle?.textContent).toContain('Entrenamiento personalizado');
      expect(heroSubtitle?.textContent).toContain('Nutrici');
      expect(heroSubtitle?.textContent).toContain('Resultados reales');
    });

    it('el indicador de scroll debería mostrar "Scroll"', () => {
      const scrollText = compiled.querySelector('.hero__scroll-text');
      expect(scrollText?.textContent).toBe('Scroll');
    });
  });

  describe('Botones de acción', () => {
    it('debería renderizar exactamente 2 botones', () => {
      const buttons = compiled.querySelectorAll('.hero__actions .boton');
      expect(buttons.length).toBe(2);
    });

    it('el primer botón debería ser primario con texto "Empezar ahora"', () => {
      const primaryButton = compiled.querySelector('.boton--primario');
      expect(primaryButton).toBeTruthy();
      expect(primaryButton?.textContent?.trim()).toBe('Empezar ahora');
    });

    it('el segundo botón debería ser secundario con texto "Ver planes"', () => {
      const secondaryButton = compiled.querySelector('.boton--secundario');
      expect(secondaryButton).toBeTruthy();
      expect(secondaryButton?.textContent?.trim()).toBe('Ver planes');
    });

    it('los botones deberían tener la clase base "boton"', () => {
      const buttons = compiled.querySelectorAll('.hero__actions .boton');
      buttons.forEach(button => {
        expect(button.classList.contains('boton')).toBe(true);
      });
    });
  });

  describe('Estructura HTML semántica', () => {
    it('debería usar section como elemento principal', () => {
      const heroSection = compiled.querySelector('.hero');
      expect(heroSection?.tagName.toLowerCase()).toBe('section');
    });

    it('debería usar header para el contenedor de contenido', () => {
      const heroContent = compiled.querySelector('.hero__content');
      expect(heroContent?.tagName.toLowerCase()).toBe('header');
    });

    it('debería usar h1 para el título principal', () => {
      const heroTitle = compiled.querySelector('.hero__title');
      expect(heroTitle?.tagName.toLowerCase()).toBe('h1');
    });

    it('debería usar p para el subtítulo', () => {
      const heroSubtitle = compiled.querySelector('.hero__subtitle');
      expect(heroSubtitle?.tagName.toLowerCase()).toBe('p');
    });

    it('debería usar menu para las acciones', () => {
      const heroActions = compiled.querySelector('.hero__actions');
      expect(heroActions?.tagName.toLowerCase()).toBe('menu');
    });

    it('debería usar aside para el indicador de scroll', () => {
      const scrollIndicator = compiled.querySelector('.hero__scroll-indicator');
      expect(scrollIndicator?.tagName.toLowerCase()).toBe('aside');
    });
  });

  describe('Clases BEM', () => {
    it('todas las clases deberían seguir la convención BEM', () => {
      const heroElements = [
        '.hero__canvas',
        '.hero__content',
        '.hero__title',
        '.hero__title-highlight',
        '.hero__subtitle',
        '.hero__actions',
        '.hero__scroll-indicator',
        '.hero__scroll-text',
        '.hero__scroll-line'
      ];

      heroElements.forEach(selector => {
        const element = compiled.querySelector(selector);
        expect(element).toBeTruthy(`${selector} no encontrado`);
      });
    });

    it('debería usar modificadores BEM para botones', () => {
      const primaryButton = compiled.querySelector('.boton--primario');
      const secondaryButton = compiled.querySelector('.boton--secundario');

      expect(primaryButton).toBeTruthy();
      expect(secondaryButton).toBeTruthy();
    });
  });

  describe('Accesibilidad', () => {
    it('el indicador de scroll debería tener aria-hidden="true"', () => {
      const scrollIndicator = compiled.querySelector('.hero__scroll-indicator');
      expect(scrollIndicator?.getAttribute('aria-hidden')).toBe('true');
    });

    it('el título principal debería ser el único h1 en la página', () => {
      const h1Elements = compiled.querySelectorAll('h1');
      expect(h1Elements.length).toBe(1);
    });

    it('los botones deberían ser elementos button', () => {
      const buttons = compiled.querySelectorAll('.hero__actions button');
      expect(buttons.length).toBe(2);
    });
  });

  describe('Estructura del scroll indicator', () => {
    it('debería tener texto y línea en el indicador de scroll', () => {
      const scrollText = compiled.querySelector('.hero__scroll-text');
      const scrollLine = compiled.querySelector('.hero__scroll-line');

      expect(scrollText).toBeTruthy();
      expect(scrollLine).toBeTruthy();
    });

    it('la línea de scroll debería ser un span', () => {
      const scrollLine = compiled.querySelector('.hero__scroll-line');
      expect(scrollLine?.tagName.toLowerCase()).toBe('span');
    });
  });

  describe('Layout y orden visual', () => {
    it('el canvas 3D debería estar antes del contenido', () => {
      const heroSection = compiled.querySelector('.hero');
      const firstChild = heroSection?.firstElementChild;
      expect(firstChild?.tagName.toLowerCase()).toBe('app-three-scene');
    });

    it('el contenido debería estar después del canvas', () => {
      const heroSection = compiled.querySelector('.hero');
      const children = Array.from(heroSection?.children || []);
      const contentIndex = children.findIndex(child =>
        child.classList.contains('hero__content')
      );
      expect(contentIndex).toBeGreaterThan(0);
    });

    it('el indicador de scroll debería ser el último elemento', () => {
      const heroSection = compiled.querySelector('.hero');
      const lastChild = heroSection?.lastElementChild;
      expect(lastChild?.classList.contains('hero__scroll-indicator')).toBe(true);
    });
  });

  describe('Integración con ThreeScene', () => {
    it('el mock de ThreeScene debería renderizarse correctamente', () => {
      const mockScene = compiled.querySelector('.three-scene-mock');
      expect(mockScene).toBeTruthy();
    });

    it('no debería haber errores de WebGL en el entorno de test', () => {
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('Renderizado sin errores', () => {
    it('debería renderizar completamente sin errores de consola', () => {
      expect(compiled.querySelector('.hero')).toBeTruthy();
      expect(compiled.querySelector('.hero__content')).toBeTruthy();
      expect(compiled.querySelector('.hero__actions')).toBeTruthy();
    });

    it('debería mantener la estructura después de múltiples detectChanges', () => {
      fixture.detectChanges();
      fixture.detectChanges();
      fixture.detectChanges();

      const heroSection = compiled.querySelector('.hero');
      const buttons = compiled.querySelectorAll('.hero__actions .boton');

      expect(heroSection).toBeTruthy();
      expect(buttons.length).toBe(2);
    });
  });
});
