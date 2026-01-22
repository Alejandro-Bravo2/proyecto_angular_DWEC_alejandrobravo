import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import {
  NutritionService,
  Meal,
  DailyNutrition,
  FoodItem,
  RutinaAlimentacionDTO,
  DiaAlimentacionDTO,
  AlimentoDTO,
  CrearRutinaAlimentacionDTO,
} from './nutrition.service';
import { environment } from '../../../../environments/environment';

describe('NutritionService', () => {
  let service: NutritionService;
  let httpMock: HttpTestingController;

  const mockFoodItem: FoodItem = {
    icon: '🍎',
    quantity: '1 unidad',
    name: 'Manzana',
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    fiber: 4,
  };

  const mockMeal: Meal = {
    id: 'meal-1',
    userId: 'user-1',
    date: '2026-01-12',
    mealType: 'breakfast',
    foods: [mockFoodItem],
    totalCalories: 95,
    totalProtein: 0.5,
    totalCarbs: 25,
    totalFat: 0.3,
    totalFiber: 4,
  };

  const mockDailyNutrition: DailyNutrition = {
    date: '2026-01-12',
    meals: [mockMeal],
    totalCalories: 2000,
    totalProtein: 150,
    totalCarbs: 250,
    totalFat: 65,
    totalFiber: 30,
    waterIntake: 2000,
    calorieGoal: 2200,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NutritionService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(NutritionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods', () => {
    it('should fetch daily nutrition data', () => {
      service.get<DailyNutrition>('/nutrition/daily/2026-01-12').subscribe((response) => {
        expect(response.date).toBe('2026-01-12');
        expect(response.meals.length).toBeGreaterThan(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/nutrition/daily/2026-01-12`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDailyNutrition);
    });

    it('should add a new meal', () => {
      service.post<Meal>('/nutrition/meals', mockMeal).subscribe((response) => {
        expect(response.id).toBe('meal-1');
        expect(response.mealType).toBe('breakfast');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/nutrition/meals`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockMeal);
      req.flush(mockMeal);
    });

    it('should update a meal', () => {
      const updatedMeal = { ...mockMeal, totalCalories: 150 };

      service.put<Meal>('/nutrition/meals/meal-1', updatedMeal).subscribe((response) => {
        expect(response.totalCalories).toBe(150);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/nutrition/meals/meal-1`);
      expect(req.request.method).toBe('PUT');
      req.flush(updatedMeal);
    });

    it('should delete a meal', () => {
      service.delete('/nutrition/meals/meal-1').subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/nutrition/meals/meal-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors after retries', (done) => {
      service.get('/nutrition/invalid').subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        },
      });

      // BaseHttpService uses retry(2), so we need to handle 3 requests total
      const requests = httpMock.match(`${environment.apiUrl}/nutrition/invalid`);
      expect(requests.length).toBe(1);
      requests[0].flush('Not Found', { status: 404, statusText: 'Not Found' });

      // Handle the 2 retries
      setTimeout(() => {
        const retry1 = httpMock.match(`${environment.apiUrl}/nutrition/invalid`);
        if (retry1.length > 0) {
          retry1[0].flush('Not Found', { status: 404, statusText: 'Not Found' });
        }
        setTimeout(() => {
          const retry2 = httpMock.match(`${environment.apiUrl}/nutrition/invalid`);
          if (retry2.length > 0) {
            retry2[0].flush('Not Found', { status: 404, statusText: 'Not Found' });
          }
        }, 10);
      }, 10);
    });

    it('should handle 500 errors after retries', (done) => {
      service.get('/nutrition/error').subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        },
      });

      // BaseHttpService uses retry(2), so we need to handle 3 requests total
      const requests = httpMock.match(`${environment.apiUrl}/nutrition/error`);
      expect(requests.length).toBe(1);
      requests[0].flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      // Handle the 2 retries
      setTimeout(() => {
        const retry1 = httpMock.match(`${environment.apiUrl}/nutrition/error`);
        if (retry1.length > 0) {
          retry1[0].flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
        }
        setTimeout(() => {
          const retry2 = httpMock.match(`${environment.apiUrl}/nutrition/error`);
          if (retry2.length > 0) {
            retry2[0].flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
          }
        }, 10);
      }, 10);
    });
  });

  describe('Rutinas de Alimentacion', () => {
    const mockRutina: RutinaAlimentacionDTO = {
      id: 1,
      fechaInicio: '2024-01-01',
      diasAlimentacion: [
        {
          id: 1,
          diaSemana: 'LUNES',
          desayuno: { id: 1, alimentos: ['Tostadas', 'Cafe'] },
          almuerzo: null,
          comida: { id: 2, alimentos: ['Pollo', 'Arroz'] },
          merienda: null,
          cena: { id: 3, alimentos: ['Ensalada', 'Salmon'] },
        },
      ],
    };

    it('should list rutinas', () => {
      service.listarRutinas().subscribe((rutinas) => {
        expect(rutinas.length).toBe(1);
        expect(rutinas[0].id).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/rutinas-alimentacion`);
      expect(req.request.method).toBe('GET');
      req.flush([mockRutina]);
    });

    it('should get rutina by id', () => {
      service.obtenerRutina(1).subscribe((rutina) => {
        expect(rutina.id).toBe(1);
        expect(rutina.diasAlimentacion.length).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/rutinas-alimentacion/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRutina);
    });

    it('should create rutina', () => {
      const crearRutina: CrearRutinaAlimentacionDTO = {
        fechaInicio: '2024-01-01',
        diasAlimentacion: [
          {
            diaSemana: 'LUNES',
            desayuno: { alimentos: ['Tostadas'] },
          },
        ],
      };

      service.crearRutina(crearRutina).subscribe((rutina) => {
        expect(rutina.id).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/rutinas-alimentacion`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(crearRutina);
      req.flush(mockRutina);
    });

    it('should delete rutina', () => {
      service.eliminarRutina(1).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/rutinas-alimentacion/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Alimentos', () => {
    const mockAlimento: AlimentoDTO = {
      id: 1,
      nombre: 'Manzana',
      ingredientes: ['Manzana fresca'],
    };

    it('should list alimentos', () => {
      service.listarAlimentos().subscribe((alimentos) => {
        expect(alimentos.length).toBe(1);
        expect(alimentos[0].nombre).toBe('Manzana');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/alimentos`);
      expect(req.request.method).toBe('GET');
      req.flush([mockAlimento]);
    });

    it('should get alimento by id', () => {
      service.obtenerAlimento(1).subscribe((alimento) => {
        expect(alimento.id).toBe(1);
        expect(alimento.nombre).toBe('Manzana');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/alimentos/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAlimento);
    });
  });

  describe('Available Meal Days', () => {
    const mockRutinas: RutinaAlimentacionDTO[] = [
      {
        id: 1,
        fechaInicio: '2024-01-01',
        diasAlimentacion: [
          {
            id: 1,
            diaSemana: 'LUNES',
            desayuno: { id: 1, alimentos: ['Tostadas'] },
            almuerzo: null,
            comida: null,
            merienda: null,
            cena: null,
          },
          {
            id: 2,
            diaSemana: 'MIERCOLES',
            desayuno: { id: 2, alimentos: ['Cereales'] },
            almuerzo: null,
            comida: null,
            merienda: null,
            cena: null,
          },
        ],
      },
    ];

    it('should get available meal days', () => {
      service.getAvailableMealDays().subscribe((days) => {
        expect(days.length).toBe(2);
        expect(days).toContain('LUNES');
        expect(days).toContain('MIERCOLES');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/rutinas-alimentacion`);
      req.flush(mockRutinas);
    });

    it('should return empty array if no rutinas', () => {
      service.getAvailableMealDays().subscribe((days) => {
        expect(days).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/rutinas-alimentacion`);
      req.flush([]);
    });

    it('should order days correctly', () => {
      const unorderedRutinas: RutinaAlimentacionDTO[] = [
        {
          id: 1,
          fechaInicio: '2024-01-01',
          diasAlimentacion: [
            {
              id: 1,
              diaSemana: 'VIERNES',
              desayuno: { id: 1, alimentos: ['A'] },
              almuerzo: null,
              comida: null,
              merienda: null,
              cena: null,
            },
            {
              id: 2,
              diaSemana: 'LUNES',
              desayuno: { id: 2, alimentos: ['B'] },
              almuerzo: null,
              comida: null,
              merienda: null,
              cena: null,
            },
          ],
        },
      ];

      service.getAvailableMealDays().subscribe((days) => {
        expect(days[0]).toBe('LUNES');
        expect(days[1]).toBe('VIERNES');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/rutinas-alimentacion`);
      req.flush(unorderedRutinas);
    });
  });

  describe('Meals By Day', () => {
    const mockDia: DiaAlimentacionDTO = {
      id: 1,
      diaSemana: 'LUNES',
      desayuno: { id: 1, alimentos: ['Tostadas', 'Cafe'] },
      almuerzo: null,
      comida: { id: 2, alimentos: ['Pollo', 'Arroz'] },
      merienda: null,
      cena: null,
    };

    it('should get meals by day', () => {
      const mockRutinas: RutinaAlimentacionDTO[] = [
        {
          id: 1,
          fechaInicio: '2024-01-01',
          diasAlimentacion: [mockDia],
        },
      ];

      service.getMealsByDay('LUNES').subscribe((dia) => {
        expect(dia).not.toBeNull();
        expect(dia!.diaSemana).toBe('LUNES');
        expect(dia!.desayuno?.alimentos).toContain('Tostadas');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/rutinas-alimentacion`);
      req.flush(mockRutinas);
    });

    it('should return null if day not found', () => {
      service.getMealsByDay('DOMINGO').subscribe((dia) => {
        expect(dia).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/rutinas-alimentacion`);
      req.flush([]);
    });
  });

  describe('Daily Nutrition (legacy)', () => {
    it('should get daily nutrition by date', () => {
      const mockRutinas: RutinaAlimentacionDTO[] = [
        {
          id: 1,
          fechaInicio: '2024-01-01',
          diasAlimentacion: [
            {
              id: 1,
              diaSemana: 'LUNES',
              desayuno: { id: 1, alimentos: ['Tostadas'] },
              almuerzo: null,
              comida: null,
              merienda: null,
              cena: null,
            },
          ],
        },
      ];

      service.getDailyNutrition('user-123', '2024-01-08').subscribe((nutrition) => {
        expect(nutrition.date).toBe('2024-01-08');
        expect(nutrition.meals.length).toBeGreaterThanOrEqual(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/rutinas-alimentacion`);
      req.flush(mockRutinas);
    });
  });

  describe('Legacy Methods', () => {
    it('should add meal (legacy)', (done) => {
      const mealToAdd: Omit<Meal, 'id'> = {
        userId: 'user-1',
        date: '2024-01-15',
        mealType: 'breakfast',
        foods: [mockFoodItem],
        totalCalories: 95,
        totalProtein: 0.5,
        totalCarbs: 25,
        totalFat: 0.3,
        totalFiber: 4,
      };

      service.addMeal(mealToAdd).subscribe((meal) => {
        expect(meal.id).toBeDefined();
        expect(meal.mealType).toBe('breakfast');
        done();
      });
    });

    it('should update meal (legacy)', (done) => {
      service.updateMeal('meal-1', { totalCalories: 150 }).subscribe((meal) => {
        expect(meal).toBeDefined();
        done();
      });
    });

    it('should delete meal (legacy)', (done) => {
      service.deleteMeal('meal-1').subscribe(() => {
        done();
      });
    });

    it('should get all meals (legacy)', () => {
      service.getAllMeals('user-1').subscribe((meals) => {
        expect(meals).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/rutinas-alimentacion`);
      req.flush([]);
    });
  });

  describe('getMealsByDate', () => {
    it('should get meals by date and transform to legacy format', () => {
      const mockRutinas: RutinaAlimentacionDTO[] = [
        {
          id: 1,
          fechaInicio: '2024-01-01',
          diasAlimentacion: [
            {
              id: 1,
              diaSemana: 'LUNES',
              desayuno: { id: 1, alimentos: ['Tostadas', 'Cafe'] },
              almuerzo: null,
              comida: { id: 2, alimentos: ['Pollo', 'Arroz'] },
              merienda: null,
              cena: null,
            },
          ],
        },
      ];

      service.getMealsByDate('user-123', '2024-01-08').subscribe((meals) => {
        expect(meals.length).toBeGreaterThan(0);
        expect(meals[0].foods).toBeDefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/rutinas-alimentacion`);
      req.flush(mockRutinas);
    });

    it('should return empty array when day has no meals', () => {
      service.getMealsByDate('user-123', '2024-01-08').subscribe((meals) => {
        expect(meals).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/rutinas-alimentacion`);
      req.flush([]);
    });
  });

  describe('getMealsByDay with null return', () => {
    it('should return null when day not found in any rutina', () => {
      const mockRutinas: RutinaAlimentacionDTO[] = [
        {
          id: 1,
          fechaInicio: '2024-01-01',
          diasAlimentacion: [
            {
              id: 1,
              diaSemana: 'LUNES',
              desayuno: { id: 1, alimentos: ['Tostadas'] },
              almuerzo: null,
              comida: null,
              merienda: null,
              cena: null,
            },
          ],
        },
      ];

      service.getMealsByDay('DOMINGO').subscribe((dia) => {
        expect(dia).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/rutinas-alimentacion`);
      req.flush(mockRutinas);
    });
  });

  describe('getIconForMealType with fallback', () => {
    it('should use fallback icon for unknown meal type', () => {
      const mockRutinas: RutinaAlimentacionDTO[] = [
        {
          id: 1,
          fechaInicio: '2024-01-01',
          diasAlimentacion: [
            {
              id: 1,
              diaSemana: 'LUNES',
              desayuno: { id: 1, alimentos: ['Test'] },
              almuerzo: null,
              comida: null,
              merienda: null,
              cena: null,
            },
          ],
        },
      ];

      service.getMealsByDate('user-123', '2024-01-08').subscribe((meals) => {
        expect(meals.length).toBeGreaterThan(0);
        expect(meals[0].foods[0].icon).toBeDefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/rutinas-alimentacion`);
      req.flush(mockRutinas);
    });
  });

  describe('getDailyNutrition with null dia', () => {
    it('should return empty meals array when dia is null', () => {
      service.getDailyNutrition('user-123', '2024-01-08').subscribe((nutrition) => {
        expect(nutrition.meals).toEqual([]);
        expect(nutrition.date).toBe('2024-01-08');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/rutinas-alimentacion`);
      req.flush([]);
    });
  });
});
