import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { FormControl } from '@angular/forms';

import { OnboardingMuscles } from './onboarding-muscles';
import { OnboardingService } from '../../../services/onboarding.service';

describe('OnboardingMuscles', () => {
  let component: OnboardingMuscles;
  let fixture: ComponentFixture<OnboardingMuscles>;
  let onboardingService: OnboardingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingMuscles],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingMuscles);
    component = fixture.componentInstance;
    onboardingService = TestBed.inject(OnboardingService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('constructor', () => {
    it('deberia inicializar FormArray con 6 controles en false', () => {
      const musclesArray = component.musclesForm.controls.muscles;

      expect(musclesArray.length).toBe(6);
      expect(musclesArray.controls.every(control => control.value === false)).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('deberia actualizar onboardingData cuando hay musculos seleccionados', () => {
      const updateSpy = spyOn(onboardingService.onboardingData, 'update');
      const consoleSpy = spyOn(console, 'log');

      component.musclesForm.controls.muscles.controls[0].setValue(true);
      component.musclesForm.controls.muscles.controls[2].setValue(true);

      component.onSubmit();

      expect(updateSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Onboarding Muscles form submitted:', ['pecho', 'brazos']);
      expect(consoleSpy).toHaveBeenCalledWith('Onboarding complete! Navigating to dashboard...');
    });

    it('deberia mostrar mensaje de error cuando no hay musculos seleccionados', () => {
      const consoleSpy = spyOn(console, 'log');
      const updateSpy = spyOn(onboardingService.onboardingData, 'update');

      component.onSubmit();

      expect(updateSpy).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Form is invalid: No muscles selected');
    });

    it('deberia filtrar correctamente los musculos no seleccionados', () => {
      const updateSpy = spyOn(onboardingService.onboardingData, 'update');

      component.musclesForm.controls.muscles.controls[1].setValue(true);
      component.musclesForm.controls.muscles.controls[3].setValue(true);
      component.musclesForm.controls.muscles.controls[5].setValue(true);

      component.onSubmit();

      const updateCall = updateSpy.calls.mostRecent().args[0] as (data: any) => any;
      const datosBase = { gender: 'masculino', height: 180, age: 25 };
      const resultadoActualizacion = updateCall(datosBase);

      expect(resultadoActualizacion.muscles).toEqual(['espalda', 'pierna', 'abdominales']);
    });
  });

  describe('musclesFormArray', () => {
    it('deberia devolver el FormArray de muscles', () => {
      const formArray = component.musclesFormArray;

      expect(formArray).toBe(component.musclesForm.controls.muscles);
    });
  });

  describe('hasSelectedMuscles', () => {
    it('deberia devolver true cuando al menos un musculo esta seleccionado', () => {
      component.musclesForm.controls.muscles.controls[0].setValue(true);

      expect(component.hasSelectedMuscles).toBe(true);
    });

    it('deberia devolver false cuando ningun musculo esta seleccionado', () => {
      expect(component.hasSelectedMuscles).toBe(false);
    });

    it('deberia devolver false cuando todos los musculos son false', () => {
      component.musclesForm.controls.muscles.controls.forEach(control => {
        control.setValue(false);
      });

      expect(component.hasSelectedMuscles).toBe(false);
    });
  });
});
