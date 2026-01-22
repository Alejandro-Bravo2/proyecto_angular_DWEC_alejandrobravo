import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { NotFound } from './not-found';

describe('NotFound', () => {
  let component: NotFound;
  let fixture: ComponentFixture<NotFound>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideRouter([])],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(NotFound);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Creacion del componente', () => {
    it('deberia crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('currentUrl', () => {
    it('deberia contener la URL actual del router', () => {
      expect(component.currentUrl).toBeDefined();
      expect(typeof component.currentUrl).toBe('string');
    });
  });

  describe('suggestions', () => {
    it('deberia tener 4 sugerencias de navegacion', () => {
      expect(component.suggestions.length).toBe(4);
    });

    it('deberia incluir sugerencia de Inicio', () => {
      const sugerenciaInicio = component.suggestions.find(s => s.label === 'Inicio');
      expect(sugerenciaInicio).toBeDefined();
      expect(sugerenciaInicio?.path).toBe('/');
      expect(sugerenciaInicio?.icon).toBe('home');
    });

    it('deberia incluir sugerencia de Entrenamiento', () => {
      const sugerenciaEntrenamiento = component.suggestions.find(s => s.label === 'Entrenamiento');
      expect(sugerenciaEntrenamiento).toBeDefined();
      expect(sugerenciaEntrenamiento?.path).toBe('/entrenamiento');
      expect(sugerenciaEntrenamiento?.icon).toBe('fitness');
    });

    it('deberia incluir sugerencia de Alimentacion', () => {
      const sugerenciaAlimentacion = component.suggestions.find(s => s.label === 'Alimentacion');
      expect(sugerenciaAlimentacion).toBeDefined();
      expect(sugerenciaAlimentacion?.path).toBe('/alimentacion');
      expect(sugerenciaAlimentacion?.icon).toBe('nutrition');
    });

    it('deberia incluir sugerencia de Seguimiento', () => {
      const sugerenciaSeguimiento = component.suggestions.find(s => s.label === 'Seguimiento');
      expect(sugerenciaSeguimiento).toBeDefined();
      expect(sugerenciaSeguimiento?.path).toBe('/seguimiento');
      expect(sugerenciaSeguimiento?.icon).toBe('progress');
    });

    it('todas las sugerencias deberian tener path, label e icon', () => {
      component.suggestions.forEach(suggestion => {
        expect(suggestion.path).toBeDefined();
        expect(suggestion.label).toBeDefined();
        expect(suggestion.icon).toBeDefined();
      });
    });
  });

  describe('goBack', () => {
    it('deberia llamar a window.history.back', () => {
      spyOn(window.history, 'back');

      component.goBack();

      expect(window.history.back).toHaveBeenCalled();
    });
  });

  describe('goHome', () => {
    it('deberia navegar a la pagina de inicio', () => {
      component.goHome();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('Renderizado en el DOM', () => {
    it('deberia renderizar el componente', () => {
      const elemento = fixture.nativeElement;
      expect(elemento).toBeTruthy();
    });
  });
});
