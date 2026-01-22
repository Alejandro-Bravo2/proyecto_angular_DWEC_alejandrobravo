import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserProfileService, NutritionTargets } from './user-profile.service';
import { environment } from '../../../environments/environment';

describe('UserProfileService', () => {
  let service: UserProfileService;
  let httpMock: HttpTestingController;

  const mockNutritionTargets: NutritionTargets = {
    calculatedBMR: 1800,
    calculatedTDEE: 2500,
    dailyCalories: 2000,
    proteinGrams: 150,
    carbsGrams: 200,
    fatGrams: 70,
    fiberGrams: 30,
  };

  const apiUrl = `${environment.apiUrl}/onboarding`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserProfileService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(UserProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getNutritionTargets', () => {
    it('should fetch nutrition targets from API', (done) => {
      service.getNutritionTargets().subscribe((targets) => {
        expect(targets).toEqual(mockNutritionTargets);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/nutrition-targets`);
      expect(req.request.method).toBe('GET');
      req.flush(mockNutritionTargets);
    });

    it('should cache the result with shareReplay', (done) => {
      // Primera llamada
      service.getNutritionTargets().subscribe();

      const req = httpMock.expectOne(`${apiUrl}/nutrition-targets`);
      req.flush(mockNutritionTargets);

      // Segunda llamada - deberia usar cache
      service.getNutritionTargets().subscribe((targets) => {
        expect(targets).toEqual(mockNutritionTargets);
        done();
      });

      // No deberia hacer otra peticion HTTP
      httpMock.expectNone(`${apiUrl}/nutrition-targets`);
    });

    it('should return same observable instance when called multiple times', () => {
      const observable1 = service.getNutritionTargets();
      const observable2 = service.getNutritionTargets();

      expect(observable1).toBe(observable2);

      // Suscribirse para activar la peticion HTTP
      observable1.subscribe();

      // Limpiar la peticion pendiente
      const req = httpMock.expectOne(`${apiUrl}/nutrition-targets`);
      req.flush(mockNutritionTargets);
    });
  });

  describe('refreshNutritionTargets', () => {
    it('should clear cache and fetch fresh data', (done) => {
      // Primera llamada
      service.getNutritionTargets().subscribe();
      const req1 = httpMock.expectOne(`${apiUrl}/nutrition-targets`);
      req1.flush(mockNutritionTargets);

      // Refresh
      const updatedTargets: NutritionTargets = {
        ...mockNutritionTargets,
        dailyCalories: 2200,
      };

      service.refreshNutritionTargets().subscribe((targets) => {
        expect(targets.dailyCalories).toBe(2200);
        done();
      });

      // Deberia hacer una nueva peticion
      const req2 = httpMock.expectOne(`${apiUrl}/nutrition-targets`);
      req2.flush(updatedTargets);
    });
  });

  describe('getOnboardingStatus', () => {
    it('should fetch onboarding status', (done) => {
      service.getOnboardingStatus().subscribe((status) => {
        expect(status).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/status`);
      expect(req.request.method).toBe('GET');
      req.flush(true);
    });

    it('should return false when user has not completed onboarding', (done) => {
      service.getOnboardingStatus().subscribe((status) => {
        expect(status).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/status`);
      req.flush(false);
    });
  });

  describe('clearCache', () => {
    it('should clear the nutrition targets cache', (done) => {
      // Primera llamada
      service.getNutritionTargets().subscribe();
      const req1 = httpMock.expectOne(`${apiUrl}/nutrition-targets`);
      req1.flush(mockNutritionTargets);

      // Limpiar cache
      service.clearCache();

      // Siguiente llamada deberia hacer nueva peticion
      service.getNutritionTargets().subscribe((targets) => {
        expect(targets).toEqual(mockNutritionTargets);
        done();
      });

      const req2 = httpMock.expectOne(`${apiUrl}/nutrition-targets`);
      req2.flush(mockNutritionTargets);
    });
  });
});
