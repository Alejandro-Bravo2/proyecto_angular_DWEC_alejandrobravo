import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { OnboardingPricing } from './onboarding-pricing';
import { OnboardingService } from '../../../services/onboarding.service';

describe('OnboardingPricing', () => {
  let component: OnboardingPricing;
  let fixture: ComponentFixture<OnboardingPricing>;
  let onboardingService: OnboardingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingPricing],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingPricing);
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

      component.pricingForm.setValue({
        priceRange: '10-15',
      });

      component.onSubmit();

      expect(updateSpy).toHaveBeenCalled();

      const updateCall = updateSpy.calls.mostRecent().args[0] as (data: any) => any;
      const datosBase = { gender: 'masculino', height: 180, age: 25 };
      const resultadoActualizacion = updateCall(datosBase);

      expect(resultadoActualizacion.priceRange).toBe('10-15');
      expect(consoleSpy).toHaveBeenCalledWith('Onboarding Pricing form submitted:', { priceRange: '10-15' });
      expect(consoleSpy).toHaveBeenCalledWith('Navigating to next onboarding step...');
    });

    it('deberia marcar todos los campos como touched cuando el formulario es invalido', () => {
      const markAllAsTouchedSpy = spyOn(component.pricingForm, 'markAllAsTouched');
      const consoleSpy = spyOn(console, 'log');

      component.onSubmit();

      expect(markAllAsTouchedSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Form is invalid');
    });

    it('deberia actualizar con el rango 0-10', () => {
      const updateSpy = spyOn(onboardingService.onboardingData, 'update');

      component.pricingForm.setValue({
        priceRange: '0-10',
      });

      component.onSubmit();

      const updateCall = updateSpy.calls.mostRecent().args[0] as (data: any) => any;
      const datosBase = { gender: 'femenino', height: 165, age: 30 };
      const resultadoActualizacion = updateCall(datosBase);

      expect(resultadoActualizacion.priceRange).toBe('0-10');
    });
  });

  describe('selectPriceRange', () => {
    it('deberia actualizar el valor del campo priceRange', () => {
      component.selectPriceRange('15-20');

      expect(component.pricingForm.get('priceRange')?.value).toBe('15-20');
    });

    it('deberia actualizar con otro rango de precios', () => {
      component.selectPriceRange('0-10');

      expect(component.pricingForm.get('priceRange')?.value).toBe('0-10');
    });
  });

  describe('priceRangeOptions', () => {
    it('deberia tener 3 opciones de rango de precios', () => {
      expect(component.priceRangeOptions.length).toBe(3);
      expect(component.priceRangeOptions[0].value).toBe('0-10');
      expect(component.priceRangeOptions[1].value).toBe('10-15');
      expect(component.priceRangeOptions[2].value).toBe('15-20');
    });
  });
});
