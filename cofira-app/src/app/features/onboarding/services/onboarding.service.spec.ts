import { TestBed } from '@angular/core/testing';
import { OnboardingService } from './onboarding.service';

describe('OnboardingService', () => {
  let service: OnboardingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OnboardingService],
    });

    service = TestBed.inject(OnboardingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('onboardingData signal', () => {
    it('should initialize with default values', () => {
      const initialData = service.onboardingData();

      expect(initialData.gender).toBe('');
      expect(initialData.height).toBe(0);
      expect(initialData.age).toBe(0);
    });
  });

  describe('updateAboutData', () => {
    it('should update gender', () => {
      service.updateAboutData({ gender: 'male', height: 0, age: 0 });

      expect(service.onboardingData().gender).toBe('male');
    });

    it('should update height', () => {
      service.updateAboutData({ gender: '', height: 180, age: 0 });

      expect(service.onboardingData().height).toBe(180);
    });

    it('should update age', () => {
      service.updateAboutData({ gender: '', height: 0, age: 25 });

      expect(service.onboardingData().age).toBe(25);
    });

    it('should update all fields at once', () => {
      service.updateAboutData({ gender: 'female', height: 165, age: 30 });

      const data = service.onboardingData();
      expect(data.gender).toBe('female');
      expect(data.height).toBe(165);
      expect(data.age).toBe(30);
    });

    it('should preserve existing data when updating partially', () => {
      // Primera actualizacion
      service.updateAboutData({ gender: 'male', height: 175, age: 28 });

      // Segunda actualizacion que solo cambia la edad
      service.updateAboutData({ gender: 'male', height: 175, age: 29 });

      const data = service.onboardingData();
      expect(data.gender).toBe('male');
      expect(data.height).toBe(175);
      expect(data.age).toBe(29);
    });

    it('should handle multiple sequential updates', () => {
      service.updateAboutData({ gender: 'male', height: 170, age: 20 });
      service.updateAboutData({ gender: 'male', height: 180, age: 25 });
      service.updateAboutData({ gender: 'female', height: 165, age: 30 });

      const finalData = service.onboardingData();
      expect(finalData.gender).toBe('female');
      expect(finalData.height).toBe(165);
      expect(finalData.age).toBe(30);
    });

    it('should log the update to console', () => {
      const consoleSpy = spyOn(console, 'log');

      service.updateAboutData({ gender: 'male', height: 175, age: 28 });

      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
