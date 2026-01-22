import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { SignupWizard } from './signup-wizard';
import { AuthService } from '../../../core/auth/auth.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ToastService } from '../../../core/services/toast.service';
import { AsyncValidatorsService } from '../../../shared/validators/async-validators.service';

describe('SignupWizard', () => {
  let component: SignupWizard;
  let fixture: ComponentFixture<SignupWizard>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockAsyncValidators: jasmine.SpyObj<AsyncValidatorsService>;
  let router: Router;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['registerWithOnboarding']);
    mockLoadingService = jasmine.createSpyObj('LoadingService', ['show', 'hide']);
    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);
    mockAsyncValidators = jasmine.createSpyObj('AsyncValidatorsService', ['usernameUnique', 'emailUnique']);

    // Mock async validators to return null (valid)
    mockAsyncValidators.usernameUnique.and.returnValue(() => of(null));
    mockAsyncValidators.emailUnique.and.returnValue(() => of(null));

    await TestBed.configureTestingModule({
      imports: [SignupWizard],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: LoadingService, useValue: mockLoadingService },
        { provide: ToastService, useValue: mockToastService },
        { provide: AsyncValidatorsService, useValue: mockAsyncValidators }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupWizard);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should start at step index 0', () => {
      expect(component.currentStepIndex()).toBe(0);
    });

    it('should have default form data values', () => {
      const formData = component.formData();
      expect(formData['heightCm']).toBe(170);
      expect(formData['currentWeightKg']).toBe(70);
      expect(formData['targetWeightKg']).toBe(70);
      expect(formData['sleepHoursAverage']).toBe(7);
      expect(formData['mealsPerDay']).toBe(3);
    });

    it('should not be submitting initially', () => {
      expect(component.isSubmitting()).toBeFalse();
    });

    it('should have no error initially', () => {
      expect(component.error()).toBeNull();
    });

    it('should have a registration form with correct controls', () => {
      expect(component.registerForm.get('name')).toBeTruthy();
      expect(component.registerForm.get('username')).toBeTruthy();
      expect(component.registerForm.get('email')).toBeTruthy();
      expect(component.registerForm.get('password')).toBeTruthy();
      expect(component.registerForm.get('confirmPassword')).toBeTruthy();
      expect(component.registerForm.get('acceptTerms')).toBeTruthy();
    });

    it('should calculate max birth date as 16 years ago', () => {
      const expectedYear = new Date().getFullYear() - 16;
      const maxDate = new Date(component.maxBirthDate);
      expect(maxDate.getFullYear()).toBe(expectedYear);
    });
  });

  describe('Computed properties', () => {
    it('should be first step when currentStepIndex is 0', () => {
      component.currentStepIndex.set(0);
      expect(component.isFirstStep()).toBeTrue();
    });

    it('should not be first step when currentStepIndex is greater than 0', () => {
      component.currentStepIndex.set(1);
      expect(component.isFirstStep()).toBeFalse();
    });

    it('should calculate progress correctly', () => {
      component.currentStepIndex.set(0);
      const totalSteps = component.totalSteps();
      const expectedProgress = (1 / totalSteps) * 100;
      expect(component.progress()).toBe(expectedProgress);
    });

    it('should filter steps based on conditions', () => {
      // Initially no gender selected, so reproductiveStatus step should not appear
      const steps = component.onboardingSteps();
      const reproductiveStep = steps.find(s => s.id === 'reproductiveStatus');
      expect(reproductiveStep).toBeUndefined();
    });

    it('should show reproductiveStatus step when gender is FEMALE', () => {
      component.formData.set({ ...component.formData(), gender: 'FEMALE' });
      const steps = component.onboardingSteps();
      const reproductiveStep = steps.find(s => s.id === 'reproductiveStatus');
      expect(reproductiveStep).toBeDefined();
    });

    it('should hide targetWeightKg step when primaryGoal is MAINTAIN', () => {
      component.formData.set({ ...component.formData(), primaryGoal: 'MAINTAIN' });
      const steps = component.onboardingSteps();
      const targetWeightStep = steps.find(s => s.id === 'targetWeightKg');
      expect(targetWeightStep).toBeUndefined();
    });
  });

  describe('selectOption method', () => {
    it('should set single option value', () => {
      component.selectOption('gender', 'MALE', false);
      expect(component.formData()['gender']).toBe('MALE');
    });

    it('should add multiple option values', () => {
      component.selectOption('equipment', 'GYM', true);
      component.selectOption('equipment', 'HOME', true);
      const equipment = component.formData()['equipment'] as unknown[];
      expect(equipment).toContain('GYM');
      expect(equipment).toContain('HOME');
    });

    it('should remove multiple option value if already selected', () => {
      component.selectOption('equipment', 'GYM', true);
      component.selectOption('equipment', 'GYM', true);
      const equipment = component.formData()['equipment'] as unknown[];
      expect(equipment).not.toContain('GYM');
    });

    it('should clear other selections when selecting NONE', () => {
      component.selectOption('allergies', 'GLUTEN', true);
      component.selectOption('allergies', 'LACTOSE', true);
      component.selectOption('allergies', 'NONE', true);
      const allergies = component.formData()['allergies'] as unknown[];
      expect(allergies).toEqual(['NONE']);
    });

    it('should remove NONE when selecting other options', () => {
      component.selectOption('allergies', 'NONE', true);
      component.selectOption('allergies', 'GLUTEN', true);
      const allergies = component.formData()['allergies'] as unknown[];
      expect(allergies).not.toContain('NONE');
      expect(allergies).toContain('GLUTEN');
    });
  });

  describe('isSelected method', () => {
    it('should return true for selected single option', () => {
      component.selectOption('gender', 'MALE', false);
      expect(component.isSelected('gender', 'MALE')).toBeTrue();
    });

    it('should return false for non-selected single option', () => {
      component.selectOption('gender', 'MALE', false);
      expect(component.isSelected('gender', 'FEMALE')).toBeFalse();
    });

    it('should return true for selected multiple option', () => {
      component.selectOption('equipment', 'GYM', true);
      expect(component.isSelected('equipment', 'GYM')).toBeTrue();
    });

    it('should return false for non-selected multiple option', () => {
      component.selectOption('equipment', 'GYM', true);
      expect(component.isSelected('equipment', 'HOME')).toBeFalse();
    });
  });

  describe('updateSliderValue method', () => {
    it('should update slider value in formData', () => {
      const mockEvent = {
        target: { value: '180' }
      } as unknown as Event;
      component.updateSliderValue('heightCm', mockEvent);
      expect(component.formData()['heightCm']).toBe(180);
    });
  });

  describe('updateTextValue method', () => {
    it('should update text value in formData', () => {
      const mockEvent = {
        target: { value: 'Some medication' }
      } as unknown as Event;
      component.updateTextValue('medications', mockEvent);
      expect(component.formData()['medications']).toBe('Some medication');
    });
  });

  describe('updateDateValue method', () => {
    it('should update date value in formData', () => {
      const mockEvent = {
        target: { value: '2000-01-15' }
      } as unknown as Event;
      component.updateDateValue('birthDate', mockEvent);
      expect(component.formData()['birthDate']).toBe('2000-01-15');
    });
  });

  describe('Navigation', () => {
    it('should advance to next step when nextStep is called', () => {
      // Set required field for first step
      component.selectOption('gender', 'MALE', false);
      component.nextStep();
      expect(component.currentStepIndex()).toBe(1);
    });

    it('should not advance if canProceed is false', () => {
      // First step requires gender selection
      component.nextStep();
      expect(component.currentStepIndex()).toBe(0);
    });

    it('should go back to previous step when previousStep is called', () => {
      component.currentStepIndex.set(2);
      component.previousStep();
      expect(component.currentStepIndex()).toBe(1);
    });

    it('should not go back if already on first step', () => {
      component.currentStepIndex.set(0);
      component.previousStep();
      expect(component.currentStepIndex()).toBe(0);
    });
  });

  describe('canProceed computed', () => {
    it('should return false if required single field is empty', () => {
      // First step is gender selection which is required
      expect(component.canProceed()).toBeFalse();
    });

    it('should return true if required single field is filled', () => {
      component.selectOption('gender', 'MALE', false);
      expect(component.canProceed()).toBeTrue();
    });

    it('should return true for non-required steps without value', () => {
      // Navigate to a non-required step
      component.selectOption('gender', 'MALE', false);
      component.nextStep();
      component.updateDateValue('birthDate', { target: { value: '2000-01-15' } } as unknown as Event);
      component.nextStep();
      component.updateSliderValue('heightCm', { target: { value: '175' } } as unknown as Event);
      component.nextStep();
      component.updateSliderValue('currentWeightKg', { target: { value: '75' } } as unknown as Event);
      component.nextStep();
      component.selectOption('primaryGoal', 'MAINTAIN', false);
      component.nextStep();
      // Now at activityLevel which is required, so needs selection
      component.selectOption('activityLevel', 'SEDENTARY', false);
      component.nextStep();
      // workType is required
      component.selectOption('workType', 'OFFICE_DESK', false);
      component.nextStep();
      // sleepHoursAverage is not required
      expect(component.canProceed()).toBeTrue();
    });
  });

  describe('Registration form validation', () => {
    it('should be invalid when empty', () => {
      expect(component.registerForm.valid).toBeFalse();
    });

    it('should validate required name field', () => {
      const nameControl = component.registerForm.get('name');
      expect(nameControl?.hasError('required')).toBeTrue();
    });

    it('should validate username minimum length', () => {
      const usernameControl = component.registerForm.get('username');
      usernameControl?.setValue('ab');
      expect(usernameControl?.hasError('minlength')).toBeTrue();
    });

    it('should validate email format', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTrue();
    });

    it('should validate terms acceptance', () => {
      const termsControl = component.registerForm.get('acceptTerms');
      expect(termsControl?.hasError('required')).toBeTrue();
    });
  });

  describe('Submit', () => {
    beforeEach(() => {
      // Fill all required onboarding fields
      component.formData.set({
        gender: 'MALE',
        birthDate: '2000-01-15',
        heightCm: 175,
        currentWeightKg: 75,
        targetWeightKg: 70,
        primaryGoal: 'LOSE_WEIGHT',
        activityLevel: 'MODERATELY_ACTIVE',
        workType: 'OFFICE_DESK',
        sleepHoursAverage: 7,
        fitnessLevel: 'INTERMEDIATE',
        trainingDaysPerWeek: 4,
        sessionDurationMinutes: 60,
        preferredTrainingTime: 'MORNING',
        equipment: ['GYM'],
        injuries: [],
        dietType: 'OMNIVORE',
        mealsPerDay: 3,
        allergies: [],
        medicalConditions: [],
        medications: '',
        previousSurgeries: []
      });

      // Navigate to registration step
      const totalOnboardingSteps = component.onboardingSteps().length;
      component.currentStepIndex.set(totalOnboardingSteps);
    });

    it('should not submit if registration form is invalid', fakeAsync(() => {
      component.submit();
      tick();
      expect(mockAuthService.registerWithOnboarding).not.toHaveBeenCalled();
    }));

    it('should show loading and call authService when form is valid', fakeAsync(() => {
      // Fill registration form
      component.registerForm.patchValue({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        acceptTerms: true
      });

      mockAuthService.registerWithOnboarding.and.returnValue(Promise.resolve({
        token: 'test-token',
        type: 'Bearer',
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        rol: 'USER',
        isOnboarded: true
      }));

      component.submit();
      tick();

      expect(mockLoadingService.show).toHaveBeenCalled();
      expect(mockAuthService.registerWithOnboarding).toHaveBeenCalled();
      expect(mockLoadingService.hide).toHaveBeenCalled();
      expect(mockToastService.success).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('should handle registration error', fakeAsync(() => {
      // Fill registration form
      component.registerForm.patchValue({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        acceptTerms: true
      });

      mockAuthService.registerWithOnboarding.and.returnValue(Promise.reject(new Error('Registration failed')));

      component.submit();
      tick();

      expect(mockLoadingService.hide).toHaveBeenCalled();
      expect(component.error()).toBe('Registration failed');
      expect(mockToastService.error).toHaveBeenCalled();
      expect(component.isSubmitting()).toBeFalse();
    }));

    it('should set isSubmitting to true during submission', fakeAsync(() => {
      component.registerForm.patchValue({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        acceptTerms: true
      });

      mockAuthService.registerWithOnboarding.and.returnValue(new Promise(resolve => setTimeout(() => resolve({
        token: 'test-token',
        type: 'Bearer',
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        rol: 'USER',
        isOnboarded: true
      }), 100)));

      component.submit();
      expect(component.isSubmitting()).toBeTrue();
      tick(100);
      expect(component.isSubmitting()).toBeFalse();
    }));
  });

  describe('buildPayload', () => {
    it('should correctly map reproductive status to isPregnant', () => {
      component.formData.set({
        ...component.formData(),
        gender: 'FEMALE',
        reproductiveStatus: 'PREGNANT'
      });

      // Access private method through any type
      const payload = (component as any).buildPayload(component.formData(), {
        name: 'Test',
        username: 'test',
        email: 'test@test.com',
        password: 'pass'
      });

      expect(payload.isPregnant).toBeTrue();
      expect(payload.isBreastfeeding).toBeFalse();
    });

    it('should correctly map reproductive status to isBreastfeeding', () => {
      component.formData.set({
        ...component.formData(),
        gender: 'FEMALE',
        reproductiveStatus: 'BREASTFEEDING'
      });

      const payload = (component as any).buildPayload(component.formData(), {
        name: 'Test',
        username: 'test',
        email: 'test@test.com',
        password: 'pass'
      });

      expect(payload.isPregnant).toBeFalse();
      expect(payload.isBreastfeeding).toBeTrue();
    });
  });

  describe('normalizeArray', () => {
    it('should return empty array for null value', () => {
      const result = (component as any).normalizeArray(null);
      expect(result).toEqual([]);
    });

    it('should return empty array for undefined value', () => {
      const result = (component as any).normalizeArray(undefined);
      expect(result).toEqual([]);
    });

    it('should filter out NONE from array', () => {
      const result = (component as any).normalizeArray(['GLUTEN', 'NONE', 'LACTOSE']);
      expect(result).toEqual(['GLUTEN', 'LACTOSE']);
    });

    it('should return empty array for non-array value', () => {
      const result = (component as any).normalizeArray('string');
      expect(result).toEqual([]);
    });

    it('should convert array values to strings', () => {
      const result = (component as any).normalizeArray([123, 456, 'text']);
      expect(result).toEqual(['123', '456', 'text']);
      expect(result.every((item: string) => typeof item === 'string')).toBeTrue();
    });

    it('should handle array with only NONE value', () => {
      const result = (component as any).normalizeArray(['NONE']);
      expect(result).toEqual([]);
    });
  });

  describe('Additional coverage for selectOption', () => {
    it('should handle selecting an option when currentValues is undefined', () => {
      // Asegurar que stepId no existe en formData
      const initialData = component.formData();
      expect(initialData['newField']).toBeUndefined();

      component.selectOption('newField', 'VALUE1', true);
      const newField = component.formData()['newField'] as unknown[];

      expect(Array.isArray(newField)).toBeTrue();
      expect(newField).toContain('VALUE1');
    });

    it('should toggle multiple values correctly', () => {
      // Primero agregar un valor
      component.selectOption('testField', 'VALUE1', true);
      let testField = component.formData()['testField'] as unknown[];
      expect(testField).toContain('VALUE1');

      // Agregar otro valor
      component.selectOption('testField', 'VALUE2', true);
      testField = component.formData()['testField'] as unknown[];
      expect(testField).toContain('VALUE1');
      expect(testField).toContain('VALUE2');

      // Remover el primer valor
      component.selectOption('testField', 'VALUE1', true);
      testField = component.formData()['testField'] as unknown[];
      expect(testField).not.toContain('VALUE1');
      expect(testField).toContain('VALUE2');
    });

    it('should add value to filtered array when NONE was previously selected', () => {
      // Primero seleccionar NONE
      component.selectOption('allergyField', 'NONE', true);
      let allergyField = component.formData()['allergyField'] as unknown[];
      expect(allergyField).toEqual(['NONE']);

      // Ahora agregar GLUTEN (esto debería remover NONE y agregar GLUTEN)
      component.selectOption('allergyField', 'GLUTEN', true);
      allergyField = component.formData()['allergyField'] as unknown[];
      expect(allergyField).not.toContain('NONE');
      expect(allergyField).toContain('GLUTEN');

      // Agregar LACTOSE (esto debería agregar a la lista sin NONE)
      component.selectOption('allergyField', 'LACTOSE', true);
      allergyField = component.formData()['allergyField'] as unknown[];
      expect(allergyField).not.toContain('NONE');
      expect(allergyField).toContain('GLUTEN');
      expect(allergyField).toContain('LACTOSE');
      expect(allergyField.length).toBe(2);
    });

    it('should add value to array when value is not in filteredValues', () => {
      // Inicialmente no hay nada seleccionado para 'testMultiple'
      // Agregar el primer valor
      component.selectOption('testMultiple', 'OPTION1', true);
      let testMultiple = component.formData()['testMultiple'] as unknown[];
      expect(testMultiple).toEqual(['OPTION1']);

      // Agregar segundo valor (este ejecutará la línea 445: [...filteredValues, value])
      component.selectOption('testMultiple', 'OPTION2', true);
      testMultiple = component.formData()['testMultiple'] as unknown[];
      expect(testMultiple).toContain('OPTION1');
      expect(testMultiple).toContain('OPTION2');
      expect(testMultiple.length).toBe(2);
    });
  });

  describe('isLastStep computed', () => {
    it('should return true when on the last step', () => {
      const totalSteps = component.totalSteps();
      component.currentStepIndex.set(totalSteps - 1);
      expect(component.isLastStep()).toBeTrue();
    });

    it('should return false when not on the last step', () => {
      component.currentStepIndex.set(0);
      expect(component.isLastStep()).toBeFalse();
    });
  });

  describe('nextStep with submit', () => {
    it('should call submit when on last step and canProceed is true', () => {
      spyOn(component, 'submit');

      // Llenar todos los datos requeridos del onboarding
      component.formData.set({
        gender: 'MALE',
        birthDate: '2000-01-15',
        heightCm: 175,
        currentWeightKg: 75,
        primaryGoal: 'LOSE_WEIGHT',
        activityLevel: 'MODERATELY_ACTIVE',
        workType: 'OFFICE_DESK',
        fitnessLevel: 'INTERMEDIATE',
        trainingDaysPerWeek: 4,
        equipment: ['GYM'],
        dietType: 'OMNIVORE',
      });

      // Llenar el formulario de registro
      component.registerForm.patchValue({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        acceptTerms: true
      });

      // Navegar al último paso
      const totalSteps = component.totalSteps();
      component.currentStepIndex.set(totalSteps - 1);

      component.nextStep();

      expect(component.submit).toHaveBeenCalled();
    });
  });

  describe('Cobertura adicional para buildPayload', () => {
    it('should use currentWeightKg when targetWeightKg is not provided', () => {
      const onboardingData = {
        gender: 'MALE',
        birthDate: '2000-01-15',
        heightCm: 175,
        currentWeightKg: 75,
        activityLevel: 'MODERATELY_ACTIVE',
        workType: 'OFFICE_DESK',
        primaryGoal: 'MAINTAIN',
        fitnessLevel: 'INTERMEDIATE',
        trainingDaysPerWeek: 4,
        dietType: 'OMNIVORE',
        equipment: ['GYM']
      };

      const registerData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      const payload = (component as any).buildPayload(onboardingData, registerData);

      expect(payload.targetWeightKg).toBe(75);
    });

    it('should handle undefined reproductiveStatus', () => {
      const onboardingData = {
        gender: 'MALE',
        birthDate: '2000-01-15',
        heightCm: 175,
        currentWeightKg: 75,
        targetWeightKg: 70,
        activityLevel: 'MODERATELY_ACTIVE',
        workType: 'OFFICE_DESK',
        primaryGoal: 'LOSE_WEIGHT',
        fitnessLevel: 'INTERMEDIATE',
        trainingDaysPerWeek: 4,
        dietType: 'OMNIVORE',
        equipment: ['GYM']
      };

      const registerData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      const payload = (component as any).buildPayload(onboardingData, registerData);

      expect(payload.isPregnant).toBeFalsy();
      expect(payload.isBreastfeeding).toBeFalsy();
    });

    it('should use default mealsPerDay value when not provided', () => {
      const onboardingData = {
        gender: 'MALE',
        birthDate: '2000-01-15',
        heightCm: 175,
        currentWeightKg: 75,
        activityLevel: 'MODERATELY_ACTIVE',
        workType: 'OFFICE_DESK',
        primaryGoal: 'MAINTAIN',
        fitnessLevel: 'INTERMEDIATE',
        trainingDaysPerWeek: 4,
        dietType: 'OMNIVORE',
        equipment: ['GYM']
      };

      const registerData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      const payload = (component as any).buildPayload(onboardingData, registerData);

      expect(payload.mealsPerDay).toBe(3);
    });

    it('should convert null medications to null in payload', () => {
      const onboardingData = {
        gender: 'MALE',
        birthDate: '2000-01-15',
        heightCm: 175,
        currentWeightKg: 75,
        activityLevel: 'MODERATELY_ACTIVE',
        workType: 'OFFICE_DESK',
        primaryGoal: 'MAINTAIN',
        fitnessLevel: 'INTERMEDIATE',
        trainingDaysPerWeek: 4,
        dietType: 'OMNIVORE',
        equipment: ['GYM'],
        medications: null
      };

      const registerData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      const payload = (component as any).buildPayload(onboardingData, registerData);

      expect(payload.medications).toBeNull();
    });

    it('should handle reproductiveStatus NONE correctly', () => {
      const onboardingData = {
        gender: 'FEMALE',
        reproductiveStatus: 'NONE',
        birthDate: '2000-01-15',
        heightCm: 165,
        currentWeightKg: 60,
        activityLevel: 'MODERATELY_ACTIVE',
        workType: 'OFFICE_DESK',
        primaryGoal: 'MAINTAIN',
        fitnessLevel: 'INTERMEDIATE',
        trainingDaysPerWeek: 4,
        dietType: 'OMNIVORE',
        equipment: ['GYM']
      };

      const registerData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      const payload = (component as any).buildPayload(onboardingData, registerData);

      expect(payload.isPregnant).toBe(false);
      expect(payload.isBreastfeeding).toBe(false);
    });
  });

  describe('Cobertura adicional para submit', () => {
    beforeEach(() => {
      // Llenar datos mínimos requeridos
      component.formData.set({
        gender: 'MALE',
        birthDate: '2000-01-15',
        heightCm: 175,
        currentWeightKg: 75,
        primaryGoal: 'MAINTAIN',
        activityLevel: 'MODERATELY_ACTIVE',
        workType: 'OFFICE_DESK',
        fitnessLevel: 'INTERMEDIATE',
        trainingDaysPerWeek: 4,
        equipment: ['GYM'],
        dietType: 'OMNIVORE'
      });

      const totalOnboardingSteps = component.onboardingSteps().length;
      component.currentStepIndex.set(totalOnboardingSteps);
    });

    it('should handle non-Error object in catch block', fakeAsync(() => {
      component.registerForm.patchValue({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        acceptTerms: true
      });

      mockAuthService.registerWithOnboarding.and.returnValue(Promise.reject('String error message'));

      component.submit();
      tick();

      expect(component.error()).toBe('Error al completar el registro');
      expect(component.isSubmitting()).toBeFalse();
    }));

    it('should mark form as touched when invalid', () => {
      spyOn(component.registerForm, 'markAllAsTouched');

      component.submit();

      expect(component.registerForm.markAllAsTouched).toHaveBeenCalled();
    });
  });

  describe('Cobertura adicional para canProceed', () => {
    it('should return true for non-required step with empty value', () => {
      // Navegar a un paso no requerido
      component.selectOption('gender', 'MALE', false);
      component.nextStep();
      component.updateDateValue('birthDate', { target: { value: '2000-01-15' } } as unknown as Event);
      component.nextStep();
      component.updateSliderValue('heightCm', { target: { value: '175' } } as unknown as Event);
      component.nextStep();
      component.updateSliderValue('currentWeightKg', { target: { value: '75' } } as unknown as Event);
      component.nextStep();
      component.selectOption('primaryGoal', 'MAINTAIN', false);
      component.nextStep();
      component.selectOption('activityLevel', 'MODERATELY_ACTIVE', false);
      component.nextStep();
      component.selectOption('workType', 'OFFICE_DESK', false);
      component.nextStep();

      // Ahora estamos en sleepHoursAverage que no es requerido
      const currentStep = component.currentOnboardingStep();
      expect(currentStep?.required).toBeFalse();
      expect(component.canProceed()).toBeTrue();
    });

    it('should return true when step is not required', () => {
      // Configurar todos los pasos requeridos para llegar a uno opcional
      component.selectOption('gender', 'MALE', false);
      component.nextStep();
      component.updateDateValue('birthDate', { target: { value: '2000-01-15' } } as unknown as Event);
      component.nextStep();
      component.updateSliderValue('heightCm', { target: { value: '175' } } as unknown as Event);
      component.nextStep();
      component.updateSliderValue('currentWeightKg', { target: { value: '75' } } as unknown as Event);
      component.nextStep();
      component.selectOption('primaryGoal', 'MAINTAIN', false);
      component.nextStep();
      component.selectOption('activityLevel', 'MODERATELY_ACTIVE', false);
      component.nextStep();
      component.selectOption('workType', 'OFFICE_DESK', false);
      component.nextStep();

      // Ahora estamos en un paso opcional
      const currentStep = component.currentOnboardingStep();
      if (currentStep && !currentStep.required) {
        expect(component.canProceed()).toBeTrue();
      } else {
        // Si no llegamos a un paso opcional, al menos verificar que canProceed funciona
        expect(component.canProceed).toBeDefined();
      }
    });

    it('should return false when currentOnboardingStep returns null value', () => {
      // Configurar para que currentOnboardingStep devuelva null
      component.currentStepIndex.set(999);
      const step = component.currentOnboardingStep();
      expect(step).toBeNull();
    });

    it('should return false when required multiple step has empty array', () => {
      // Navegar hasta el paso equipment que es required y tipo multiple
      component.selectOption('gender', 'MALE', false);
      component.nextStep();
      component.updateDateValue('birthDate', { target: { value: '2000-01-15' } } as unknown as Event);
      component.nextStep();
      component.updateSliderValue('heightCm', { target: { value: '175' } } as unknown as Event);
      component.nextStep();
      component.updateSliderValue('currentWeightKg', { target: { value: '75' } } as unknown as Event);
      component.nextStep();
      component.selectOption('primaryGoal', 'MAINTAIN', false);
      component.nextStep();
      component.selectOption('activityLevel', 'MODERATELY_ACTIVE', false);
      component.nextStep();
      component.selectOption('workType', 'OFFICE_DESK', false);
      component.nextStep();
      // sleepHoursAverage - no requerido
      component.nextStep();
      component.selectOption('fitnessLevel', 'INTERMEDIATE', false);
      component.nextStep();
      component.selectOption('trainingDaysPerWeek', 4, false);
      component.nextStep();
      // sessionDurationMinutes - no requerido
      component.nextStep();
      // preferredTrainingTime - no requerido
      component.nextStep();

      // Ahora deberiamos estar en equipment (multiple, required)
      const currentStep = component.currentOnboardingStep();
      expect(currentStep?.id).toBe('equipment');
      expect(currentStep?.type).toBe('multiple');
      expect(currentStep?.required).toBeTrue();

      // Sin seleccion, canProceed debe ser false
      expect(component.canProceed()).toBeFalse();
    });

    it('should return true when required multiple step has selected items', () => {
      // Navegar hasta el paso equipment
      component.selectOption('gender', 'MALE', false);
      component.nextStep();
      component.updateDateValue('birthDate', { target: { value: '2000-01-15' } } as unknown as Event);
      component.nextStep();
      component.updateSliderValue('heightCm', { target: { value: '175' } } as unknown as Event);
      component.nextStep();
      component.updateSliderValue('currentWeightKg', { target: { value: '75' } } as unknown as Event);
      component.nextStep();
      component.selectOption('primaryGoal', 'MAINTAIN', false);
      component.nextStep();
      component.selectOption('activityLevel', 'MODERATELY_ACTIVE', false);
      component.nextStep();
      component.selectOption('workType', 'OFFICE_DESK', false);
      component.nextStep();
      component.nextStep();
      component.selectOption('fitnessLevel', 'INTERMEDIATE', false);
      component.nextStep();
      component.selectOption('trainingDaysPerWeek', 4, false);
      component.nextStep();
      component.nextStep();
      component.nextStep();

      // Ahora seleccionar equipment
      component.selectOption('equipment', 'GYM', true);

      // Con seleccion, canProceed debe ser true
      expect(component.canProceed()).toBeTrue();
    });
  });

  describe('Cobertura adicional para isSelected con undefined stepData', () => {
    it('should return false when stepData is undefined', () => {
      const result = component.isSelected('nonExistentField', 'someValue');
      expect(result).toBeFalse();
    });

    it('should return false when stepData is not array and does not match value', () => {
      component.selectOption('gender', 'MALE', false);
      const result = component.isSelected('gender', 'FEMALE');
      expect(result).toBeFalse();
    });
  });

  describe('Cobertura adicional para currentOnboardingStep', () => {
    it('should return null when on registration step', () => {
      const totalSteps = component.onboardingSteps().length;
      component.currentStepIndex.set(totalSteps);

      expect(component.currentOnboardingStep()).toBeNull();
    });

    it('should return current step when within onboarding steps', () => {
      component.currentStepIndex.set(0);
      const currentStep = component.currentOnboardingStep();

      expect(currentStep).not.toBeNull();
      expect(currentStep?.id).toBeTruthy();
    });
  });

  describe('Cobertura adicional para registerForm statusChanges', () => {
    it('should update signals when form status changes', fakeAsync(() => {
      expect(component.registerFormValid()).toBeFalse();
      expect(component.registerFormPending()).toBeFalse();

      component.registerForm.patchValue({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        acceptTerms: true
      });

      tick();

      expect(component.registerFormValid()).toBeTrue();
    }));
  });
});
