import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { OnboardingComponent } from './onboarding.component';
import { AuthService } from '../../../core/auth/auth.service';

describe('OnboardingComponent', () => {
  let component: OnboardingComponent;
  let fixture: ComponentFixture<OnboardingComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['completeOnboarding']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [OnboardingComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingComponent);
    component = fixture.componentInstance;
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

    it('should calculate max birth date as 16 years ago', () => {
      const expectedYear = new Date().getFullYear() - 16;
      const maxDate = new Date(component.maxBirthDate);
      expect(maxDate.getFullYear()).toBe(expectedYear);
    });
  });

  describe('Computed properties', () => {
    it('should calculate total steps correctly', () => {
      const steps = component.steps();
      expect(component.totalSteps()).toBe(steps.length);
    });

    it('should return current step correctly', () => {
      const currentStep = component.currentStep();
      expect(currentStep.id).toBe('gender');
    });

    it('should be first step when currentStepIndex is 0', () => {
      component.currentStepIndex.set(0);
      expect(component.isFirstStep()).toBeTrue();
    });

    it('should not be first step when currentStepIndex is greater than 0', () => {
      component.currentStepIndex.set(1);
      expect(component.isFirstStep()).toBeFalse();
    });

    it('should be last step when currentStepIndex equals totalSteps - 1', () => {
      const lastIndex = component.totalSteps() - 1;
      component.currentStepIndex.set(lastIndex);
      expect(component.isLastStep()).toBeTrue();
    });

    it('should calculate progress correctly', () => {
      component.currentStepIndex.set(0);
      const totalSteps = component.totalSteps();
      const expectedProgress = (1 / totalSteps) * 100;
      expect(component.progress()).toBe(expectedProgress);
    });

    it('should filter steps based on conditions', () => {
      // Initially no gender selected, so reproductiveStatus step should not appear
      const steps = component.steps();
      const reproductiveStep = steps.find(s => s.id === 'reproductiveStatus');
      expect(reproductiveStep).toBeUndefined();
    });

    it('should show reproductiveStatus step when gender is FEMALE', () => {
      component.formData.set({ ...component.formData(), gender: 'FEMALE' });
      const steps = component.steps();
      const reproductiveStep = steps.find(s => s.id === 'reproductiveStatus');
      expect(reproductiveStep).toBeDefined();
    });

    it('should hide targetWeightKg step when primaryGoal is MAINTAIN', () => {
      component.formData.set({ ...component.formData(), primaryGoal: 'MAINTAIN' });
      const steps = component.steps();
      const targetWeightStep = steps.find(s => s.id === 'targetWeightKg');
      expect(targetWeightStep).toBeUndefined();
    });

    it('should show targetWeightKg step when primaryGoal is LOSE_WEIGHT', () => {
      component.formData.set({ ...component.formData(), primaryGoal: 'LOSE_WEIGHT' });
      const steps = component.steps();
      const targetWeightStep = steps.find(s => s.id === 'targetWeightKg');
      expect(targetWeightStep).toBeDefined();
    });
  });

  describe('selectOption method', () => {
    it('should set single option value', () => {
      component.selectOption('gender', 'MALE', false);
      expect(component.formData()['gender']).toBe('MALE');
    });

    it('should overwrite previous single option value', () => {
      component.selectOption('gender', 'MALE', false);
      component.selectOption('gender', 'FEMALE', false);
      expect(component.formData()['gender']).toBe('FEMALE');
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

    it('should handle empty initial array for multiple selection', () => {
      component.selectOption('injuries', 'BACK', true);
      const injuries = component.formData()['injuries'] as unknown[];
      expect(injuries).toContain('BACK');
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

    it('should return false for undefined field', () => {
      expect(component.isSelected('nonExistentField', 'value')).toBeFalse();
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

    it('should parse float values correctly', () => {
      const mockEvent = {
        target: { value: '7.5' }
      } as unknown as Event;
      component.updateSliderValue('sleepHoursAverage', mockEvent);
      expect(component.formData()['sleepHoursAverage']).toBe(7.5);
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

    it('should handle empty string', () => {
      const mockEvent = {
        target: { value: '' }
      } as unknown as Event;
      component.updateTextValue('medications', mockEvent);
      expect(component.formData()['medications']).toBe('');
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

  describe('Navigation - nextStep', () => {
    it('should advance to next step when canProceed is true', () => {
      component.selectOption('gender', 'MALE', false);
      component.nextStep();
      expect(component.currentStepIndex()).toBe(1);
    });

    it('should not advance if canProceed is false', () => {
      // First step requires gender selection
      component.nextStep();
      expect(component.currentStepIndex()).toBe(0);
    });

    it('should call submit when on last step', fakeAsync(() => {
      // Fill all required fields and navigate to last step
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

      const lastIndex = component.steps().length - 1;
      component.currentStepIndex.set(lastIndex);

      mockAuthService.completeOnboarding.and.returnValue(Promise.resolve({
        userId: 1,
        message: 'Success',
        isOnboarded: true,
        onboardingCompletedAt: '2025-01-21',
        nutritionTargets: {
          calculatedBMR: 1800,
          calculatedTDEE: 2500,
          dailyCalories: 2000,
          proteinGrams: 150,
          carbsGrams: 200,
          fatGrams: 70,
          fiberGrams: 30
        }
      }));

      component.nextStep();
      tick();

      expect(mockAuthService.completeOnboarding).toHaveBeenCalled();
    }));
  });

  describe('Navigation - previousStep', () => {
    it('should go back to previous step', () => {
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

    it('should return false if required multiple field is empty array', () => {
      // Navigate to equipment step which requires at least one selection
      component.formData.set({
        ...component.formData(),
        gender: 'MALE',
        birthDate: '2000-01-15',
        primaryGoal: 'LOSE_WEIGHT',
        activityLevel: 'MODERATELY_ACTIVE',
        workType: 'OFFICE_DESK',
        fitnessLevel: 'INTERMEDIATE',
        trainingDaysPerWeek: 4
      });

      // Find equipment step index
      const steps = component.steps();
      const equipmentIndex = steps.findIndex(s => s.id === 'equipment');
      component.currentStepIndex.set(equipmentIndex);

      expect(component.canProceed()).toBeFalse();
    });

    it('should return true for required multiple field with at least one selection', () => {
      component.formData.set({
        ...component.formData(),
        gender: 'MALE',
        birthDate: '2000-01-15',
        primaryGoal: 'LOSE_WEIGHT',
        activityLevel: 'MODERATELY_ACTIVE',
        workType: 'OFFICE_DESK',
        fitnessLevel: 'INTERMEDIATE',
        trainingDaysPerWeek: 4,
        equipment: ['GYM']
      });

      const steps = component.steps();
      const equipmentIndex = steps.findIndex(s => s.id === 'equipment');
      component.currentStepIndex.set(equipmentIndex);

      expect(component.canProceed()).toBeTrue();
    });

    it('should return true for non-required steps without value', () => {
      component.formData.set({
        ...component.formData(),
        gender: 'MALE',
        birthDate: '2000-01-15'
      });

      // Find sleepHoursAverage step which is not required
      const steps = component.steps();
      const sleepIndex = steps.findIndex(s => s.id === 'sleepHoursAverage');
      component.currentStepIndex.set(sleepIndex);

      expect(component.canProceed()).toBeTrue();
    });
  });

  describe('Submit', () => {
    beforeEach(() => {
      // Fill all required fields
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
    });

    it('should set isSubmitting to true during submission', fakeAsync(() => {
      mockAuthService.completeOnboarding.and.returnValue(
        new Promise(resolve => setTimeout(() => resolve({
          userId: 1,
          message: 'Success',
          isOnboarded: true,
          onboardingCompletedAt: '2025-01-21',
          nutritionTargets: {
            calculatedBMR: 1800,
            calculatedTDEE: 2500,
            dailyCalories: 2000,
            proteinGrams: 150,
            carbsGrams: 200,
            fatGrams: 70,
            fiberGrams: 30
          }
        }), 100))
      );

      component.submit();
      expect(component.isSubmitting()).toBeTrue();
      tick(100);
      expect(component.isSubmitting()).toBeFalse();
    }));

    it('should call authService.completeOnboarding with correct payload', fakeAsync(() => {
      mockAuthService.completeOnboarding.and.returnValue(Promise.resolve({
        userId: 1,
        message: 'Success',
        isOnboarded: true,
        onboardingCompletedAt: '2025-01-21',
        nutritionTargets: {
          calculatedBMR: 1800,
          calculatedTDEE: 2500,
          dailyCalories: 2000,
          proteinGrams: 150,
          carbsGrams: 200,
          fatGrams: 70,
          fiberGrams: 30
        }
      }));

      component.submit();
      tick();

      expect(mockAuthService.completeOnboarding).toHaveBeenCalled();
      const callArgs = mockAuthService.completeOnboarding.calls.first().args[0];
      expect(callArgs.gender).toBe('MALE');
      expect(callArgs.birthDate).toBe('2000-01-15');
      expect(callArgs.heightCm).toBe(175);
      expect(callArgs.currentWeightKg).toBe(75);
    }));

    it('should navigate to home on successful submission', fakeAsync(() => {
      mockAuthService.completeOnboarding.and.returnValue(Promise.resolve({
        userId: 1,
        message: 'Success',
        isOnboarded: true,
        onboardingCompletedAt: '2025-01-21',
        nutritionTargets: {
          calculatedBMR: 1800,
          calculatedTDEE: 2500,
          dailyCalories: 2000,
          proteinGrams: 150,
          carbsGrams: 200,
          fatGrams: 70,
          fiberGrams: 30
        }
      }));

      component.submit();
      tick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('should set error on submission failure', fakeAsync(() => {
      mockAuthService.completeOnboarding.and.returnValue(Promise.reject(new Error('Server error')));

      component.submit();
      tick();

      expect(component.error()).toBe('Server error');
      expect(component.isSubmitting()).toBeFalse();
    }));

    it('should handle non-Error rejection', fakeAsync(() => {
      mockAuthService.completeOnboarding.and.returnValue(Promise.reject('Some string error'));

      component.submit();
      tick();

      expect(component.error()).toBe('Error al guardar los datos');
    }));

    it('should clear error before submission', fakeAsync(() => {
      component.error.set('Previous error');

      mockAuthService.completeOnboarding.and.returnValue(Promise.resolve({
        userId: 1,
        message: 'Success',
        isOnboarded: true,
        onboardingCompletedAt: '2025-01-21',
        nutritionTargets: {
          calculatedBMR: 1800,
          calculatedTDEE: 2500,
          dailyCalories: 2000,
          proteinGrams: 150,
          carbsGrams: 200,
          fatGrams: 70,
          fiberGrams: 30
        }
      }));

      component.submit();
      expect(component.error()).toBeNull();
      tick();
    }));
  });

  describe('Submit with reproductive status', () => {
    it('should set isPregnant to true when reproductiveStatus is PREGNANT', fakeAsync(() => {
      component.formData.set({
        gender: 'FEMALE',
        birthDate: '2000-01-15',
        heightCm: 165,
        currentWeightKg: 60,
        targetWeightKg: 60,
        primaryGoal: 'MAINTAIN',
        activityLevel: 'LIGHTLY_ACTIVE',
        workType: 'OFFICE_DESK',
        sleepHoursAverage: 8,
        fitnessLevel: 'BEGINNER',
        trainingDaysPerWeek: 3,
        sessionDurationMinutes: 45,
        preferredTrainingTime: 'MORNING',
        equipment: ['HOME'],
        injuries: [],
        dietType: 'OMNIVORE',
        mealsPerDay: 4,
        allergies: [],
        medicalConditions: [],
        medications: '',
        previousSurgeries: [],
        reproductiveStatus: 'PREGNANT'
      });

      mockAuthService.completeOnboarding.and.returnValue(Promise.resolve({
        userId: 1,
        message: 'Success',
        isOnboarded: true,
        onboardingCompletedAt: '2025-01-21',
        nutritionTargets: {
          calculatedBMR: 1500,
          calculatedTDEE: 2100,
          dailyCalories: 2300,
          proteinGrams: 120,
          carbsGrams: 250,
          fatGrams: 80,
          fiberGrams: 25
        }
      }));

      component.submit();
      tick();

      const callArgs = mockAuthService.completeOnboarding.calls.first().args[0];
      expect(callArgs.isPregnant).toBeTrue();
      expect(callArgs.isBreastfeeding).toBeFalse();
    }));

    it('should set isBreastfeeding to true when reproductiveStatus is BREASTFEEDING', fakeAsync(() => {
      component.formData.set({
        gender: 'FEMALE',
        birthDate: '2000-01-15',
        heightCm: 165,
        currentWeightKg: 60,
        targetWeightKg: 55,
        primaryGoal: 'LOSE_WEIGHT',
        activityLevel: 'LIGHTLY_ACTIVE',
        workType: 'OFFICE_DESK',
        sleepHoursAverage: 6,
        fitnessLevel: 'BEGINNER',
        trainingDaysPerWeek: 3,
        sessionDurationMinutes: 30,
        preferredTrainingTime: 'AFTERNOON',
        equipment: ['MINIMAL'],
        injuries: [],
        dietType: 'OMNIVORE',
        mealsPerDay: 5,
        allergies: [],
        medicalConditions: [],
        medications: '',
        previousSurgeries: [],
        reproductiveStatus: 'BREASTFEEDING'
      });

      mockAuthService.completeOnboarding.and.returnValue(Promise.resolve({
        userId: 1,
        message: 'Success',
        isOnboarded: true,
        onboardingCompletedAt: '2025-01-21',
        nutritionTargets: {
          calculatedBMR: 1500,
          calculatedTDEE: 2100,
          dailyCalories: 1900,
          proteinGrams: 130,
          carbsGrams: 200,
          fatGrams: 60,
          fiberGrams: 25
        }
      }));

      component.submit();
      tick();

      const callArgs = mockAuthService.completeOnboarding.calls.first().args[0];
      expect(callArgs.isPregnant).toBeFalse();
      expect(callArgs.isBreastfeeding).toBeTrue();
    }));
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

    it('should convert values to strings', () => {
      const result = (component as any).normalizeArray([1, 2, 3]);
      expect(result).toEqual(['1', '2', '3']);
    });

    it('should return empty array for non-array value', () => {
      const result = (component as any).normalizeArray('string');
      expect(result).toEqual([]);
    });
  });
});
