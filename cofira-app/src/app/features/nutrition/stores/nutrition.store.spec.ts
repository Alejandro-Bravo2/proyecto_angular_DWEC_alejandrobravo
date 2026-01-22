import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NutritionStore } from './nutrition.store';
import { NutritionService, Meal, DailyNutrition } from '../services/nutrition.service';
import { ToastService } from '../../../core/services/toast.service';
import { of, throwError, Subject } from 'rxjs';

describe('NutritionStore', () => {
  let store: NutritionStore;
  let nutritionServiceSpy: jasmine.SpyObj<NutritionService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  const mockMeal: Meal = {
    id: '1',
    userId: 'user-123',
    date: '2024-01-15',
    mealType: 'breakfast',
    foods: [
      {
        icon: '🍳',
        quantity: '2 piezas',
        name: 'Huevos revueltos',
        calories: 150,
        protein: 12,
        carbs: 2,
        fat: 10,
        fiber: 0,
      },
    ],
    totalCalories: 150,
    totalProtein: 12,
    totalCarbs: 2,
    totalFat: 10,
    totalFiber: 0,
  };

  const mockMeal2: Meal = {
    id: '2',
    userId: 'user-123',
    date: '2024-01-15',
    mealType: 'lunch',
    foods: [
      {
        icon: '🥗',
        quantity: '1 plato',
        name: 'Ensalada cesar',
        calories: 350,
        protein: 25,
        carbs: 15,
        fat: 20,
        fiber: 5,
      },
    ],
    totalCalories: 350,
    totalProtein: 25,
    totalCarbs: 15,
    totalFat: 20,
    totalFiber: 5,
  };

  const mockDailyNutrition: DailyNutrition = {
    date: '2024-01-15',
    meals: [mockMeal, mockMeal2],
    totalCalories: 500,
    totalProtein: 37,
    totalCarbs: 17,
    totalFat: 30,
    totalFiber: 5,
    waterIntake: 2000,
    calorieGoal: 2200,
  };

  const mockDays = ['LUNES', 'MIERCOLES', 'VIERNES'];

  beforeEach(() => {
    const nutritionSpy = jasmine.createSpyObj('NutritionService', [
      'getAvailableMealDays',
      'getMealsByDay',
      'getDailyNutrition',
    ]);
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    TestBed.configureTestingModule({
      providers: [
        NutritionStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NutritionService, useValue: nutritionSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    });

    nutritionServiceSpy = TestBed.inject(NutritionService) as jasmine.SpyObj<NutritionService>;
    toastServiceSpy = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    store = TestBed.inject(NutritionStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty meals', () => {
      expect(store.meals()).toEqual([]);
    });

    it('should have null dailyNutrition', () => {
      expect(store.dailyNutrition()).toBeNull();
    });

    it('should have loading as false', () => {
      expect(store.loading()).toBeFalse();
    });

    it('should have error as null', () => {
      expect(store.error()).toBeNull();
    });

    it('should have empty searchTerm', () => {
      expect(store.searchTerm()).toBe('');
    });

    it('should have currentPage as 1', () => {
      expect(store.currentPage()).toBe(1);
    });

    it('should have viewMode as pagination', () => {
      expect(store.viewMode()).toBe('pagination');
    });
  });

  describe('computed: mealCount', () => {
    it('should return 0 for empty meals', () => {
      expect(store.mealCount()).toBe(0);
    });
  });

  describe('computed: totalCalories', () => {
    it('should return 0 when no meals', () => {
      expect(store.totalCalories()).toBe(0);
    });

    it('should sum calories from all meals', () => {
      store.add(mockMeal);
      store.add(mockMeal2);

      expect(store.totalCalories()).toBe(500);
    });
  });

  describe('computed: totalProtein', () => {
    it('should sum protein from all meals', () => {
      store.add(mockMeal);
      store.add(mockMeal2);

      expect(store.totalProtein()).toBe(37);
    });
  });

  describe('computed: totalCarbs', () => {
    it('should sum carbs from all meals', () => {
      store.add(mockMeal);
      store.add(mockMeal2);

      expect(store.totalCarbs()).toBe(17);
    });
  });

  describe('computed: totalFat', () => {
    it('should sum fat from all meals', () => {
      store.add(mockMeal);
      store.add(mockMeal2);

      expect(store.totalFat()).toBe(30);
    });
  });

  describe('computed: isEmpty', () => {
    it('should return true when no meals and not loading', () => {
      expect(store.isEmpty()).toBeTrue();
    });
  });

  describe('computed: hasMealsToday', () => {
    it('should return false when no meals', () => {
      expect(store.hasMealsToday()).toBeFalse();
    });

    it('should return true when meals exist', () => {
      store.add(mockMeal);

      expect(store.hasMealsToday()).toBeTrue();
    });
  });

  describe('add', () => {
    it('should add meal to list', () => {
      store.add(mockMeal);

      expect(store.meals().length).toBe(1);
      expect(store.meals()[0]).toEqual(mockMeal);
      expect(toastServiceSpy.success).toHaveBeenCalledWith('Comida agregada');
    });

    it('should add multiple meals', () => {
      store.add(mockMeal);
      store.add(mockMeal2);

      expect(store.meals().length).toBe(2);
    });
  });

  describe('update', () => {
    it('should update existing meal', () => {
      store.add(mockMeal);

      const updatedMeal = { ...mockMeal, totalCalories: 200 };
      store.update(updatedMeal);

      expect(store.meals()[0].totalCalories).toBe(200);
    });

    it('should not modify other meals', () => {
      store.add(mockMeal);
      store.add(mockMeal2);

      const updatedMeal = { ...mockMeal, totalCalories: 200 };
      store.update(updatedMeal);

      expect(store.meals()[1]).toEqual(mockMeal2);
    });
  });

  describe('remove', () => {
    it('should remove meal by id', () => {
      store.add(mockMeal);
      store.add(mockMeal2);

      store.remove('1');

      expect(store.meals().length).toBe(1);
      expect(store.meals()[0].id).toBe('2');
      expect(toastServiceSpy.success).toHaveBeenCalledWith('Comida eliminada');
    });
  });

  describe('search and filter', () => {
    beforeEach(() => {
      store.add(mockMeal);
      store.add(mockMeal2);
    });

    it('should set search term', () => {
      store.setSearchTerm('huevos');

      expect(store.searchTerm()).toBe('huevos');
      expect(store.currentPage()).toBe(1);
    });

    it('should filter meals by food name', () => {
      store.setSearchTerm('huevos');

      expect(store.filteredMeals().length).toBe(1);
      expect(store.filteredMeals()[0].foods[0].name).toContain('Huevos');
    });

    it('should filter meals by meal type', () => {
      store.setSearchTerm('breakfast');

      expect(store.filteredMeals().length).toBe(1);
    });

    it('should clear search', () => {
      store.setSearchTerm('huevos');
      store.clearSearch();

      expect(store.searchTerm()).toBe('');
      expect(store.filteredMeals().length).toBe(2);
    });
  });

  describe('pagination', () => {
    it('should go to next page', () => {
      for (let i = 0; i < 15; i++) {
        store.add({ ...mockMeal, id: `meal-${i}` });
      }

      store.nextPage();

      expect(store.currentPage()).toBe(2);
    });

    it('should not go past last page', () => {
      store.add(mockMeal);

      store.nextPage();

      expect(store.currentPage()).toBe(1);
    });

    it('should go to previous page', () => {
      for (let i = 0; i < 15; i++) {
        store.add({ ...mockMeal, id: `meal-${i}` });
      }
      store.nextPage();

      store.previousPage();

      expect(store.currentPage()).toBe(1);
    });

    it('should not go below page 1', () => {
      store.previousPage();

      expect(store.currentPage()).toBe(1);
    });

    it('should go to specific page', () => {
      for (let i = 0; i < 25; i++) {
        store.add({ ...mockMeal, id: `meal-${i}` });
      }

      store.goToPage(3);

      expect(store.currentPage()).toBe(3);
    });

    it('should not go to invalid page', () => {
      store.add(mockMeal);

      store.goToPage(10);

      expect(store.currentPage()).toBe(1);
    });
  });

  describe('date navigation', () => {
    it('should set date', () => {
      store.setDate('2024-02-01');

      expect(store.currentDate()).toBe('2024-02-01');
    });
  });

  describe('load', () => {
    it('should load available days and meals', fakeAsync(() => {
      const mockDiaAlimentacion = {
        id: 1,
        diaSemana: 'LUNES',
        desayuno: { id: 1, alimentos: ['Tostadas', 'Cafe'] },
        almuerzo: null,
        comida: { id: 2, alimentos: ['Pollo', 'Arroz'] },
        merienda: null,
        cena: null,
      };

      nutritionServiceSpy.getAvailableMealDays.and.returnValue(of(mockDays));
      nutritionServiceSpy.getMealsByDay.and.returnValue(of(mockDiaAlimentacion));

      store.load('user-123');
      tick();

      expect(store.availableDays()).toEqual(mockDays);
      expect(store.hasMealPlan()).toBeTrue();
    }));

    it('should handle error loading days', fakeAsync(() => {
      nutritionServiceSpy.getAvailableMealDays.and.returnValue(throwError(() => new Error('Error')));

      store.load('user-123');
      tick();

      expect(store.availableDays()).toEqual([]);
      expect(store.hasMealPlan()).toBeFalse();
    }));
  });

  describe('day navigation', () => {
    beforeEach(fakeAsync(() => {
      const mockDiaAlimentacion = {
        id: 1,
        diaSemana: 'LUNES',
        desayuno: { id: 1, alimentos: ['Tostadas'] },
        almuerzo: null,
        comida: null,
        merienda: null,
        cena: null,
      };

      nutritionServiceSpy.getAvailableMealDays.and.returnValue(of(mockDays));
      nutritionServiceSpy.getMealsByDay.and.returnValue(of(mockDiaAlimentacion));

      store.load('user-123');
      tick();
    }));

    it('should select a specific day', fakeAsync(() => {
      store.selectDay('MIERCOLES');
      tick();

      expect(store.selectedDay()).toBe('MIERCOLES');
    }));

    it('should compute canGoPreviousDay correctly', fakeAsync(() => {
      store.selectDay('LUNES');
      tick();

      expect(store.canGoPreviousDay()).toBeFalse();

      store.selectDay('MIERCOLES');
      tick();

      expect(store.canGoPreviousDay()).toBeTrue();
    }));

    it('should compute canGoNextDay correctly', fakeAsync(() => {
      store.selectDay('VIERNES');
      tick();

      expect(store.canGoNextDay()).toBeFalse();

      store.selectDay('LUNES');
      tick();

      expect(store.canGoNextDay()).toBeTrue();
    }));
  });

  describe('loadByDate', () => {
    it('should load nutrition by date', fakeAsync(() => {
      nutritionServiceSpy.getDailyNutrition.and.returnValue(of(mockDailyNutrition));

      store.loadByDate('user-123', '2024-01-15');
      tick();

      expect(store.currentDate()).toBe('2024-01-15');
      expect(store.dailyNutrition()).toEqual(mockDailyNutrition);
      expect(store.meals().length).toBe(2);
    }));

    it('should handle error and return empty nutrition', fakeAsync(() => {
      nutritionServiceSpy.getDailyNutrition.and.returnValue(throwError(() => new Error('Error')));

      store.loadByDate('user-123', '2024-01-15');
      tick();

      expect(store.error()).toBe('Error al cargar los datos de nutricion');
      expect(store.meals()).toEqual([]);
    }));
  });

  describe('clear', () => {
    it('should clear all state', () => {
      store.add(mockMeal);
      store.setSearchTerm('test');

      store.clear();

      expect(store.meals()).toEqual([]);
      expect(store.dailyNutrition()).toBeNull();
      expect(store.loading()).toBeFalse();
      expect(store.searchTerm()).toBe('');
      expect(store.currentPage()).toBe(1);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      store.clearError();

      expect(store.error()).toBeNull();
    });
  });

  describe('view mode', () => {
    it('should have default pagination mode', () => {
      expect(store.viewMode()).toBe('pagination');
    });

    it('should change to infinite scroll mode', fakeAsync(() => {
      store.add(mockMeal);

      store.setViewMode('infinite');
      tick(500);

      expect(store.viewMode()).toBe('infinite');
    }));
  });

  describe('computed: hasResults', () => {
    it('should return true when there are results', () => {
      store.add(mockMeal);

      expect(store.hasResults()).toBeTrue();
    });

    it('should return false when no results after filter', () => {
      store.add(mockMeal);
      store.setSearchTerm('nonexistent');

      expect(store.hasResults()).toBeFalse();
    });
  });

  describe('formattedDayName', () => {
    beforeEach(fakeAsync(() => {
      nutritionServiceSpy.getAvailableMealDays.and.returnValue(of(['LUNES', 'MIERCOLES']));
      nutritionServiceSpy.getMealsByDay.and.returnValue(
        of({ id: 1, diaSemana: 'LUNES', desayuno: null, almuerzo: null, comida: null, merienda: null, cena: null })
      );

      store.load('user-123');
      tick();
    }));

    it('should format day name correctly', fakeAsync(() => {
      store.selectDay('LUNES');
      tick();

      expect(store.formattedDayName()).toBe('Lunes');
    }));

    it('should handle all day names correctly', () => {
      const dayMap = [
        { day: 'LUNES', formatted: 'Lunes' },
        { day: 'MARTES', formatted: 'Martes' },
        { day: 'MIERCOLES', formatted: 'Miércoles' },
        { day: 'JUEVES', formatted: 'Jueves' },
        { day: 'VIERNES', formatted: 'Viernes' },
        { day: 'SABADO', formatted: 'Sábado' },
        { day: 'DOMINGO', formatted: 'Domingo' }
      ];

      dayMap.forEach(({ day, formatted }) => {
        const mockDia = {
          id: 1,
          diaSemana: day,
          desayuno: null,
          almuerzo: null,
          comida: null,
          merienda: null,
          cena: null
        };

        nutritionServiceSpy.getMealsByDay.and.returnValue(of(mockDia));
        store.selectDay(day);
        expect(store.formattedDayName()).toBe(formatted);
      });
    });
  });

  describe('refresh', () => {
    it('should reload data for user', fakeAsync(() => {
      const mockDia = {
        id: 1,
        diaSemana: 'LUNES',
        desayuno: { id: 1, alimentos: ['Pan'] },
        almuerzo: null,
        comida: null,
        merienda: null,
        cena: null
      };

      nutritionServiceSpy.getAvailableMealDays.and.returnValue(of(['LUNES']));
      nutritionServiceSpy.getMealsByDay.and.returnValue(of(mockDia));

      store.refresh('user-123');
      tick();

      expect(nutritionServiceSpy.getAvailableMealDays).toHaveBeenCalled();
    }));
  });

  describe('previousDay and nextDay', () => {
    it('should go to previous day', fakeAsync(() => {
      nutritionServiceSpy.getDailyNutrition.and.returnValue(of(mockDailyNutrition));

      store.setDate('2024-01-15');
      store.previousDay('user-123');
      tick();

      expect(store.currentDate()).toBe('2024-01-14');
    }));

    it('should go to next day', fakeAsync(() => {
      nutritionServiceSpy.getDailyNutrition.and.returnValue(of(mockDailyNutrition));

      store.setDate('2024-01-15');
      store.nextDay('user-123');
      tick();

      expect(store.currentDate()).toBe('2024-01-16');
    }));
  });

  describe('previousMealDay and nextMealDay', () => {
    beforeEach(fakeAsync(() => {
      const mockDia = {
        id: 1,
        diaSemana: 'LUNES',
        desayuno: { id: 1, alimentos: ['Pan'] },
        almuerzo: null,
        comida: null,
        merienda: null,
        cena: null
      };

      nutritionServiceSpy.getAvailableMealDays.and.returnValue(of(mockDays));
      nutritionServiceSpy.getMealsByDay.and.returnValue(of(mockDia));

      store.load('user-123');
      tick();
    }));

    it('should navigate to previous meal day', fakeAsync(() => {
      store.selectDay('MIERCOLES');
      tick();

      store.previousMealDay();
      tick();

      expect(store.selectedDay()).toBe('LUNES');
    }));

    it('should navigate to next meal day', fakeAsync(() => {
      store.selectDay('LUNES');
      tick();

      store.nextMealDay();
      tick();

      expect(store.selectedDay()).toBe('MIERCOLES');
    }));

    it('should not navigate past first day', fakeAsync(() => {
      store.selectDay('LUNES');
      tick();

      store.previousMealDay();
      tick();

      expect(store.selectedDay()).toBe('LUNES');
    }));

    it('should not navigate past last day', fakeAsync(() => {
      store.selectDay('VIERNES');
      tick();

      store.nextMealDay();
      tick();

      expect(store.selectedDay()).toBe('VIERNES');
    }));
  });

  describe('loadByDate with default date', () => {
    it('should use current date when no date provided', fakeAsync(() => {
      const today = new Date().toISOString().split('T')[0];
      nutritionServiceSpy.getDailyNutrition.and.returnValue(of(mockDailyNutrition));

      store.loadByDate('user-123');
      tick();

      expect(store.currentDate()).toBe(today);
    }));
  });

  describe('transformDiaToMeals', () => {
    it('should transform all meal types correctly', fakeAsync(() => {
      const mockDiaCompleto = {
        id: 1,
        diaSemana: 'LUNES',
        desayuno: { id: 1, alimentos: ['Tostadas', 'Cafe'] },
        almuerzo: { id: 2, alimentos: ['Fruta'] },
        comida: { id: 3, alimentos: ['Pollo', 'Arroz'] },
        merienda: { id: 4, alimentos: ['Yogur'] },
        cena: { id: 5, alimentos: ['Ensalada'] }
      };

      nutritionServiceSpy.getAvailableMealDays.and.returnValue(of(['LUNES']));
      nutritionServiceSpy.getMealsByDay.and.returnValue(of(mockDiaCompleto));

      store.load('user-123');
      tick();

      expect(store.meals().length).toBe(5);
      expect(store.meals().some(m => m.mealType === 'breakfast')).toBeTrue();
      expect(store.meals().some(m => m.mealType === 'lunch')).toBeTrue();
      expect(store.meals().some(m => m.mealType === 'dinner')).toBeTrue();
      expect(store.meals().some(m => m.mealType === 'snack')).toBeTrue();
    }));

    it('should skip meal types with no alimentos', fakeAsync(() => {
      const mockDiaIncompleto = {
        id: 1,
        diaSemana: 'LUNES',
        desayuno: { id: 1, alimentos: ['Tostadas'] },
        almuerzo: null,
        comida: { id: 2, alimentos: [] },
        merienda: null,
        cena: null
      };

      nutritionServiceSpy.getAvailableMealDays.and.returnValue(of(['LUNES']));
      nutritionServiceSpy.getMealsByDay.and.returnValue(of(mockDiaIncompleto));

      store.load('user-123');
      tick();

      expect(store.meals().length).toBe(1);
    }));
  });

  describe('infinite scroll', () => {
    beforeEach(() => {
      for (let i = 0; i < 25; i++) {
        store.add({ ...mockMeal, id: `meal-${i}`, mealType: i % 2 === 0 ? 'breakfast' : 'lunch' });
      }
    });

    it('should load more items when loadMore is called', fakeAsync(() => {
      store.setViewMode('infinite');
      tick(500);

      const initialCount = store.infiniteScrollItems().length;

      store.loadMore();
      tick(500);

      expect(store.infiniteScrollItems().length).toBeGreaterThan(initialCount);
    }));

    it('should not load more when already loading', fakeAsync(() => {
      store.setViewMode('infinite');
      tick(500);

      store.loadMore();
      const countDuringLoad = store.infiniteScrollItems().length;

      store.loadMore();

      expect(store.infiniteScrollItems().length).toBe(countDuringLoad);
      tick(500);
    }));

    it('should not load more when hasMore is false', fakeAsync(() => {
      store.clear();
      for (let i = 0; i < 3; i++) {
        store.add({ ...mockMeal, id: `small-${i}` });
      }

      store.setViewMode('infinite');
      tick(500);

      const finalCount = store.infiniteScrollItems().length;

      store.loadMore();
      tick(500);

      expect(store.infiniteScrollItems().length).toBe(finalCount);
    }));

    it('should not load more when in pagination mode', fakeAsync(() => {
      store.setViewMode('pagination');

      store.loadMore();
      tick(500);

      expect(store.infiniteScrollItems().length).toBe(0);
    }));

    it('should filter infinite scroll items by food name', fakeAsync(() => {
      store.setViewMode('infinite');
      tick(500);

      store.setSearchTerm('Huevos');

      const filteredItems = store.infiniteScrollItems();
      expect(filteredItems.every(item =>
        item.foods.some(f => f.name.toLowerCase().includes('huevos'))
      )).toBeTrue();
    }));
  });

  describe('load with no available days', () => {
    it('should handle empty days list', fakeAsync(() => {
      nutritionServiceSpy.getAvailableMealDays.and.returnValue(of([]));

      store.load('user-123');
      tick();

      expect(store.availableDays()).toEqual([]);
      expect(store.hasMealPlan()).toBeFalse();
      expect(store.meals()).toEqual([]);
    }));
  });

  describe('load with day not in available days', () => {
    it('should select first available day when current day not available', fakeAsync(() => {
      const mockDia = {
        id: 1,
        diaSemana: 'LUNES',
        desayuno: { id: 1, alimentos: ['Pan'] },
        almuerzo: null,
        comida: null,
        merienda: null,
        cena: null
      };

      nutritionServiceSpy.getAvailableMealDays.and.returnValue(of(['LUNES']));
      nutritionServiceSpy.getMealsByDay.and.returnValue(of(mockDia));

      // El store podría tener un día diferente seleccionado inicialmente
      store.load('user-123');
      tick();

      expect(store.availableDays()).toContain(store.selectedDay());
    }));
  });

  describe('error state in load', () => {
    it('should set error when loading meals fails', fakeAsync(() => {
      nutritionServiceSpy.getAvailableMealDays.and.returnValue(of(['LUNES']));
      nutritionServiceSpy.getMealsByDay.and.returnValue(throwError(() => new Error('Error de red')));

      store.load('user-123');
      tick();

      expect(store.error()).toBe('Error al cargar las comidas');
    }));

    it('should return null when loadMealsForDay fails', fakeAsync(() => {
      nutritionServiceSpy.getAvailableMealDays.and.returnValue(of(['LUNES']));
      nutritionServiceSpy.getMealsByDay.and.returnValue(of(null));

      store.load('user-123');
      tick();

      expect(store.meals()).toEqual([]);
    }));
  });

  describe('computed: totalPages with empty meals', () => {
    it('should return 0 when no meals', () => {
      expect(store.totalPages()).toBe(0);
    });
  });

  describe('computed: infiniteScrollItems', () => {
    it('should return empty array initially', () => {
      expect(store.infiniteScrollItems()).toEqual([]);
    });
  });

  describe('public readonly signals', () => {
    it('should expose all readonly signals', () => {
      expect(store.meals()).toBeDefined();
      expect(store.dailyNutrition()).toBeDefined();
      expect(store.loading()).toBeDefined();
      expect(store.error()).toBeDefined();
      expect(store.searchTerm()).toBeDefined();
      expect(store.currentPage()).toBeDefined();
      expect(store.currentDate()).toBeDefined();
      expect(store.selectedDay()).toBeDefined();
      expect(store.availableDays()).toBeDefined();
      expect(store.hasMealPlan()).toBeDefined();
      expect(store.viewMode()).toBeDefined();
      expect(store.hasMore()).toBeDefined();
      expect(store.isLoadingMore()).toBeDefined();
    });

    it('should have correct pageSize', () => {
      expect(store.pageSize).toBe(5);
    });
  });

  describe('computed: paginatedMeals', () => {
    it('should return paginated meals based on currentPage', () => {
      for (let i = 0; i < 12; i++) {
        store.add({ ...mockMeal, id: `meal-${i}` });
      }

      const paginatedMeals = store.paginatedMeals();

      expect(paginatedMeals.length).toBe(5);
      expect(paginatedMeals[0].id).toBe('meal-0');
    });

    it('should return correct meals for page 2', () => {
      for (let i = 0; i < 12; i++) {
        store.add({ ...mockMeal, id: `meal-${i}` });
      }

      store.goToPage(2);
      const paginatedMeals = store.paginatedMeals();

      expect(paginatedMeals.length).toBe(5);
      expect(paginatedMeals[0].id).toBe('meal-5');
    });

    it('should return remaining meals on last page', () => {
      for (let i = 0; i < 12; i++) {
        store.add({ ...mockMeal, id: `meal-${i}` });
      }

      store.goToPage(3);
      const paginatedMeals = store.paginatedMeals();

      expect(paginatedMeals.length).toBe(2);
      expect(paginatedMeals[0].id).toBe('meal-10');
    });
  });
});
