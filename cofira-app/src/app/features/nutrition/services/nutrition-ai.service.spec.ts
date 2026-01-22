import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  NutritionAIService,
  FoodAnalysis,
  AnalysisResponse,
  Meal,
  DailyNutrition,
} from './nutrition-ai.service';
import { environment } from '../../../../environments/environment';

describe('NutritionAIService', () => {
  let service: NutritionAIService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/nutrition`;

  const mockAnalysis: FoodAnalysis = {
    name: 'Ensalada Cesar',
    description: 'Ensalada fresca con pollo',
    calories: 450,
    protein: 35,
    carbs: 18,
    fat: 28,
    fiber: 4,
    sugar: 3,
    confidence: 92,
    ingredients: ['Lechuga', 'Pollo', 'Parmesano'],
    suggestions: ['Anadir mas verduras'],
  };

  const mockMeal: Meal = {
    id: '1',
    name: 'Ensalada Cesar',
    description: 'Ensalada fresca',
    imageUrl: 'http://example.com/image.jpg',
    calories: 450,
    protein: 35,
    carbs: 18,
    fat: 28,
    fiber: 4,
    ingredients: ['Lechuga', 'Pollo'],
    confidence: 92,
    mealType: 'LUNCH',
    date: '2024-01-15',
    isManual: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NutritionAIService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(NutritionAIService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should initialize isAnalyzing as false', () => {
      expect(service.isAnalyzing()).toBeFalse();
    });

    it('should initialize lastAnalysis as null', () => {
      expect(service.lastAnalysis()).toBeNull();
    });

    it('should initialize dailyNutrition as null', () => {
      expect(service.dailyNutrition()).toBeNull();
    });
  });

  describe('analyzeFood', () => {
    it('should analyze food image successfully', (done) => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse: AnalysisResponse = {
        analysis: mockAnalysis,
        imageUrl: 'http://example.com/image.jpg',
      };

      service.analyzeFood(mockFile).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(service.lastAnalysis()).toEqual(mockAnalysis);
        expect(service.isAnalyzing()).toBeFalse();
        done();
      });

      expect(service.isAnalyzing()).toBeTrue();

      const req = httpMock.expectOne(`${apiUrl}/analyze`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should return mock analysis on error', fakeAsync(() => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      let result: AnalysisResponse | undefined;

      service.analyzeFood(mockFile).subscribe((response) => {
        result = response;
      });

      const req = httpMock.expectOne(`${apiUrl}/analyze`);
      req.error(new ProgressEvent('error'));

      tick(1500); // Wait for mock delay

      expect(result).toBeTruthy();
      expect(result!.analysis.name).toBe('Ensalada César con Pollo');
      expect(service.isAnalyzing()).toBeFalse();
    }));
  });

  describe('saveMeal', () => {
    it('should save analyzed meal', (done) => {
      const mockResponse = { meal: mockMeal };

      service.saveMeal(mockAnalysis, 'http://example.com/img.jpg', 'LUNCH').subscribe((response) => {
        expect(response.meal).toEqual(mockMeal);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/meals/from-analysis`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.analysis).toEqual(mockAnalysis);
      expect(req.request.body.mealType).toBe('LUNCH');
      req.flush(mockResponse);
    });
  });

  describe('getMeals', () => {
    it('should get meals without date filter', (done) => {
      const mockResponse = {
        meals: [mockMeal],
        pagination: { total: 1 },
      };

      service.getMeals().subscribe((response) => {
        expect(response.meals.length).toBe(1);
        expect(response.pagination.total).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/meals`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should get meals with date filter', (done) => {
      const mockResponse = {
        meals: [mockMeal],
        pagination: { total: 1 },
      };

      service.getMeals('2024-01-15').subscribe((response) => {
        expect(response.meals).toEqual([mockMeal]);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/meals?date=2024-01-15`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getDailyNutrition', () => {
    const mockDailyNutrition: DailyNutrition = {
      date: '2024-01-15',
      meals: [mockMeal],
      totals: {
        calories: 450,
        protein: 35,
        carbs: 18,
        fat: 28,
        fiber: 4,
      },
      goals: {
        calories: 2000,
        protein: 150,
        carbs: 200,
        fat: 70,
        fiber: 30,
      },
      mealCount: 1,
    };

    it('should get daily nutrition without date', (done) => {
      service.getDailyNutrition().subscribe((data) => {
        expect(data).toEqual(mockDailyNutrition);
        expect(service.dailyNutrition()).toEqual(mockDailyNutrition);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/daily`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDailyNutrition);
    });

    it('should get daily nutrition with date', (done) => {
      service.getDailyNutrition('2024-01-15').subscribe((data) => {
        expect(data.date).toBe('2024-01-15');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/daily?date=2024-01-15`);
      req.flush(mockDailyNutrition);
    });
  });

  describe('deleteMeal', () => {
    it('should delete a meal', (done) => {
      const mockResponse = { message: 'Comida eliminada' };

      service.deleteMeal('1').subscribe((response) => {
        expect(response.message).toBe('Comida eliminada');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/meals/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('createManualMeal', () => {
    it('should create a manual meal', (done) => {
      const manualMeal: Partial<Meal> = {
        name: 'Pollo a la plancha',
        calories: 300,
        protein: 40,
        carbs: 0,
        fat: 15,
        mealType: 'DINNER',
        isManual: true,
      };

      const mockResponse = {
        meal: { ...mockMeal, ...manualMeal, id: '2' },
      };

      service.createManualMeal(manualMeal).subscribe((response) => {
        expect(response.meal.name).toBe('Pollo a la plancha');
        expect(response.meal.isManual).toBeTrue();
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/meals`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(manualMeal);
      req.flush(mockResponse);
    });
  });

  describe('getSuggestedServings', () => {
    it('should return suggested serving sizes', (done) => {
      service.getSuggestedServings().subscribe((servings) => {
        expect(servings.length).toBeGreaterThan(0);
        expect(servings).toContain('100g');
        expect(servings).toContain('200g');
        done();
      });
    });
  });

  describe('adjustForServingSize', () => {
    it('should adjust nutritional values for larger serving', () => {
      const adjusted = service.adjustForServingSize(mockAnalysis, 200, 100);

      expect(adjusted.calories).toBe(900); // 450 * 2
      expect(adjusted.protein).toBe(70); // 35 * 2
      expect(adjusted.carbs).toBe(36); // 18 * 2
      expect(adjusted.fat).toBe(56); // 28 * 2
    });

    it('should adjust nutritional values for smaller serving', () => {
      const adjusted = service.adjustForServingSize(mockAnalysis, 50, 100);

      expect(adjusted.calories).toBe(225); // 450 / 2
      expect(adjusted.protein).toBe(17.5); // 35 / 2
    });

    it('should handle optional fields', () => {
      const analysisWithoutOptional: FoodAnalysis = {
        ...mockAnalysis,
        fiber: undefined,
        sugar: undefined,
      };

      const adjusted = service.adjustForServingSize(analysisWithoutOptional, 200, 100);

      expect(adjusted.fiber).toBeUndefined();
      expect(adjusted.sugar).toBeUndefined();
    });

    it('should preserve other properties', () => {
      const adjusted = service.adjustForServingSize(mockAnalysis, 150, 100);

      expect(adjusted.name).toBe(mockAnalysis.name);
      expect(adjusted.confidence).toBe(mockAnalysis.confidence);
      expect(adjusted.ingredients).toEqual(mockAnalysis.ingredients);
    });
  });
});
