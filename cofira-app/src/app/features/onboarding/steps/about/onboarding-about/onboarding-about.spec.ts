import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { OnboardingAbout } from './onboarding-about';
import { OnboardingService } from '../../../services/onboarding.service';

describe('OnboardingAbout', () => {
  let component: OnboardingAbout;
  let fixture: ComponentFixture<OnboardingAbout>;
  let onboardingService: OnboardingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingAbout],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingAbout);
    component = fixture.componentInstance;
    onboardingService = TestBed.inject(OnboardingService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onSubmit', () => {
    it('deberia actualizar datos del onboarding cuando el formulario es valido', () => {
      const updateSpy = spyOn(onboardingService, 'updateAboutData');
      const consoleSpy = spyOn(console, 'log');

      component.aboutForm.setValue({
        gender: 'masculino',
        height: '180',
        age: '25',
      });

      component.onSubmit();

      expect(updateSpy).toHaveBeenCalledWith({
        gender: 'masculino',
        height: 180,
        age: 25,
      });
      expect(consoleSpy).toHaveBeenCalledWith('Navigating to next onboarding step...');
    });

    it('deberia marcar todos los campos como touched cuando el formulario es invalido', () => {
      const markAllAsTouchedSpy = spyOn(component.aboutForm, 'markAllAsTouched');
      const consoleSpy = spyOn(console, 'log');

      component.onSubmit();

      expect(markAllAsTouchedSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Form is invalid');
    });

    it('deberia convertir height y age a numeros', () => {
      const updateSpy = spyOn(onboardingService, 'updateAboutData');

      component.aboutForm.setValue({
        gender: 'femenino',
        height: '165',
        age: '30',
      });

      component.onSubmit();

      const datosLlamada = updateSpy.calls.mostRecent().args[0];

      expect(typeof datosLlamada.height).toBe('number');
      expect(typeof datosLlamada.age).toBe('number');
      expect(datosLlamada.height).toBe(165);
      expect(datosLlamada.age).toBe(30);
    });
  });

  describe('selectGender', () => {
    it('deberia actualizar el valor del campo gender', () => {
      component.selectGender('masculino');

      expect(component.aboutForm.get('gender')?.value).toBe('masculino');
    });

    it('deberia actualizar el valor cuando se llama con otro genero', () => {
      component.selectGender('femenino');

      expect(component.aboutForm.get('gender')?.value).toBe('femenino');
    });
  });

  describe('heightOptions', () => {
    it('deberia tener opciones de altura desde 150 hasta 200 en incrementos de 5', () => {
      expect(component.heightOptions.length).toBe(11);
      expect(component.heightOptions[0]).toBe(150);
      expect(component.heightOptions[10]).toBe(200);
      expect(component.heightOptions[1]).toBe(155);
    });
  });

  describe('ageOptions', () => {
    it('deberia tener opciones de edad desde 18 hasta 100', () => {
      expect(component.ageOptions.length).toBe(83);
      expect(component.ageOptions[0]).toBe(18);
      expect(component.ageOptions[82]).toBe(100);
    });
  });
});
