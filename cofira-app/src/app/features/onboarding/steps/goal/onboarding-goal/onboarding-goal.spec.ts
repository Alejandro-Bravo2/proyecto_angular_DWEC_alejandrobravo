import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { OnboardingGoal } from './onboarding-goal';
import { OnboardingService } from '../../../services/onboarding.service';

describe('OnboardingGoal', () => {
  let component: OnboardingGoal;
  let fixture: ComponentFixture<OnboardingGoal>;
  let onboardingService: OnboardingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingGoal],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingGoal);
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

      component.goalForm.setValue({
        goal: 'masa_muscular',
      });

      component.onSubmit();

      expect(updateSpy).toHaveBeenCalled();

      const updateCall = updateSpy.calls.mostRecent().args[0] as (data: any) => any;
      const datosBase = { gender: 'masculino', height: 180, age: 25 };
      const resultadoActualizacion = updateCall(datosBase);

      expect(resultadoActualizacion.goal).toBe('masa_muscular');
      expect(consoleSpy).toHaveBeenCalledWith('Onboarding Goal form submitted:', { goal: 'masa_muscular' });
      expect(consoleSpy).toHaveBeenCalledWith('Navigating to next onboarding step...');
    });

    it('deberia marcar todos los campos como touched cuando el formulario es invalido', () => {
      const markAllAsTouchedSpy = spyOn(component.goalForm, 'markAllAsTouched');
      const consoleSpy = spyOn(console, 'log');

      component.onSubmit();

      expect(markAllAsTouchedSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Form is invalid');
    });

    it('deberia actualizar con el objetivo perder_grasa', () => {
      const updateSpy = spyOn(onboardingService.onboardingData, 'update');

      component.goalForm.setValue({
        goal: 'perder_grasa',
      });

      component.onSubmit();

      const updateCall = updateSpy.calls.mostRecent().args[0] as (data: any) => any;
      const datosBase = { gender: 'femenino', height: 165, age: 30 };
      const resultadoActualizacion = updateCall(datosBase);

      expect(resultadoActualizacion.goal).toBe('perder_grasa');
    });
  });

  describe('selectGoal', () => {
    it('deberia actualizar el valor del campo goal', () => {
      component.selectGoal('mantenerse');

      expect(component.goalForm.get('goal')?.value).toBe('mantenerse');
    });

    it('deberia actualizar con otro objetivo', () => {
      component.selectGoal('masa_muscular');

      expect(component.goalForm.get('goal')?.value).toBe('masa_muscular');
    });
  });

  describe('goalOptions', () => {
    it('deberia tener 3 opciones de objetivo', () => {
      expect(component.goalOptions.length).toBe(3);
      expect(component.goalOptions[0].value).toBe('masa_muscular');
      expect(component.goalOptions[1].value).toBe('perder_grasa');
      expect(component.goalOptions[2].value).toBe('mantenerse');
    });
  });
});
