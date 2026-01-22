import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { OnboardingNutrition } from './onboarding-nutrition';
import { OnboardingService } from '../../../services/onboarding.service';

describe('OnboardingNutrition', () => {
  let component: OnboardingNutrition;
  let fixture: ComponentFixture<OnboardingNutrition>;
  let onboardingService: OnboardingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingNutrition],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingNutrition);
    component = fixture.componentInstance;
    onboardingService = TestBed.inject(OnboardingService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onSubmit', () => {
    it('deberia actualizar onboardingData cuando el formulario es valido', () => {
      const updateSpy = spyOn(onboardingService.onboardingData, 'update');
      const consoleSpy = spyOn(console, 'log');

      component.nutritionForm.setValue({
        variety: 'mucho',
      });

      component.onSubmit();

      expect(updateSpy).toHaveBeenCalled();

      const updateCall = updateSpy.calls.mostRecent().args[0] as (data: any) => any;
      const datosBase = { gender: 'masculino', height: 180, age: 25 };
      const resultadoActualizacion = updateCall(datosBase);

      expect(resultadoActualizacion.variety).toBe('mucho');
      expect(consoleSpy).toHaveBeenCalledWith('Onboarding Nutrition form submitted:', { variety: 'mucho' });
      expect(consoleSpy).toHaveBeenCalledWith('Navigating to next onboarding step...');
    });

    it('deberia marcar todos los campos como touched cuando el formulario es invalido', () => {
      const markAllAsTouchedSpy = spyOn(component.nutritionForm, 'markAllAsTouched');
      const consoleSpy = spyOn(console, 'log');

      component.onSubmit();

      expect(markAllAsTouchedSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Form is invalid');
    });

    it('deberia actualizar con la opcion frecuente', () => {
      const updateSpy = spyOn(onboardingService.onboardingData, 'update');

      component.nutritionForm.setValue({
        variety: 'frecuente',
      });

      component.onSubmit();

      const updateCall = updateSpy.calls.mostRecent().args[0] as (data: any) => any;
      const datosBase = { gender: 'femenino', height: 165, age: 30 };
      const resultadoActualizacion = updateCall(datosBase);

      expect(resultadoActualizacion.variety).toBe('frecuente');
    });
  });

  describe('selectVariety', () => {
    it('deberia actualizar el valor del campo variety', () => {
      component.selectVariety('mucho');

      expect(component.nutritionForm.get('variety')?.value).toBe('mucho');
    });

    it('deberia actualizar con la opcion poco', () => {
      component.selectVariety('poco');

      expect(component.nutritionForm.get('variety')?.value).toBe('poco');
    });
  });

  describe('varietyOptions', () => {
    it('deberia tener 3 opciones de variedad', () => {
      expect(component.varietyOptions.length).toBe(3);
      expect(component.varietyOptions[0].value).toBe('mucho');
      expect(component.varietyOptions[1].value).toBe('frecuente');
      expect(component.varietyOptions[2].value).toBe('poco');
    });
  });
});
