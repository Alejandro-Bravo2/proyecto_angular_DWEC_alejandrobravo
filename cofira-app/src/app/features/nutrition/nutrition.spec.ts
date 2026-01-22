import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { Nutrition } from './nutrition';
import { UserProfileService } from '../../core/services/user-profile.service';
import { ToastService } from '../../core/services/toast.service';
import { NutritionStore } from './stores/nutrition.store';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll.directive';
import { DailyNutrition, Meal, NutritionService } from './services/nutrition.service';
import { NutritionGoals } from './components/nutrition-dashboard/nutrition-dashboard';
import { WeeklyData } from './components/weekly-progress/weekly-progress';
import { FoodAnalysis } from './services/nutrition-ai.service';

// Mock del componente NutritionScene para evitar errores de WebGL en tests
@Component({
  selector: 'app-nutrition-scene',
  standalone: true,
  template: '<div class="nutrition-scene-mock"></div>',
})
class MockNutritionSceneComponent {
  readonly compact = input(false);
}

// Mock del DailyMenu con los mismos inputs que el componente real
@Component({
  selector: 'app-daily-menu',
  standalone: true,
  template: '<div class="daily-menu-mock"></div>',
})
class MockDailyMenuComponent {
  readonly meals = input<Meal[]>([]);
  readonly selectedDay = input<string>('');
}

// Mock del NutritionDashboard con los mismos inputs que el componente real
@Component({
  selector: 'app-nutrition-dashboard',
  standalone: true,
  template: '<div class="nutrition-dashboard-mock"></div>',
})
class MockNutritionDashboardComponent {
  readonly dailyNutrition = input<DailyNutrition | null>(null);
  readonly goals = input.required<NutritionGoals>();
  readonly showFiber = input<boolean>(true);
  readonly waterGlasses = input<number>(0);
  readonly currentStreak = input<number>(0);
  readonly foodAdded = output<FoodAnalysis>();
}

// Mock del WeeklyProgress con los mismos inputs que el componente real
@Component({
  selector: 'app-weekly-progress',
  standalone: true,
  template: '<div class="weekly-progress-mock"></div>',
})
class MockWeeklyProgressComponent {
  readonly weeklyData = input.required<WeeklyData[]>();
  readonly calorieGoal = input<number>(2000);
  readonly activeTab = input<'calories' | 'protein' | 'carbs' | 'fat'>('calories');
}

describe('Nutrition', () => {
  let component: Nutrition;
  let fixture: ComponentFixture<Nutrition>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockNutritionStore: jasmine.SpyObj<NutritionStore>;
  let mockNutritionService: jasmine.SpyObj<NutritionService>;

  const mockMeal: Meal = {
    id: 'meal-1',
    userId: 'user-123',
    date: '2024-01-15',
    mealType: 'breakfast',
    foods: [
      {
        icon: '🍳',
        quantity: '1 porción',
        name: 'Huevos revueltos',
        calories: 155,
        protein: 13,
        carbs: 1,
        fat: 11,
        fiber: 0,
      },
    ],
    totalCalories: 155,
    totalProtein: 13,
    totalCarbs: 1,
    totalFat: 11,
    totalFiber: 0,
  };

  const mockUserProfileService = {
    getNutritionTargets: jasmine.createSpy('getNutritionTargets').and.returnValue(
      of({
        calculatedBMR: 1800,
        calculatedTDEE: 2200,
        dailyCalories: 2000,
        proteinGrams: 150,
        carbsGrams: 200,
        fatGrams: 70,
        fiberGrams: 30,
      })
    ),
  };

  const mockDailyNutrition: DailyNutrition = {
    date: '2024-02-01',
    meals: [mockMeal],
    totalCalories: 155,
    totalProtein: 13,
    totalCarbs: 1,
    totalFat: 11,
    totalFiber: 0,
    waterIntake: 1500,
    calorieGoal: 2000,
  };

  beforeEach(async () => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
    localStorage.setItem('currentUser', JSON.stringify({ id: 'user-123' }));

    // Create spies for services
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl']);
    mockRouter.createUrlTree.and.returnValue({} as any);
    mockRouter.serializeUrl.and.returnValue('/');
    (mockRouter as any).events = of();

    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);

    mockNutritionStore = jasmine.createSpyObj('NutritionStore', [
      'load',
      'setSearchTerm',
      'clearSearch',
      'previousPage',
      'nextPage',
      'previousMealDay',
      'nextMealDay',
      'setViewMode',
      'loadMore',
    ]);

    mockNutritionService = jasmine.createSpyObj('NutritionService', ['getDailyNutrition']);
    mockNutritionService.getDailyNutrition.and.returnValue(of(mockDailyNutrition));

    await TestBed.configureTestingModule({
      imports: [Nutrition],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
        { provide: UserProfileService, useValue: mockUserProfileService },
        { provide: Router, useValue: mockRouter },
        { provide: ToastService, useValue: mockToastService },
        { provide: NutritionStore, useValue: mockNutritionStore },
        { provide: NutritionService, useValue: mockNutritionService },
      ],
    })
      .overrideComponent(Nutrition, {
        set: {
          imports: [
            MockDailyMenuComponent,
            MockNutritionSceneComponent,
            MockNutritionDashboardComponent,
            MockWeeklyProgressComponent,
            ReactiveFormsModule,
            InfiniteScrollDirective,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Nutrition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with dashboard view', () => {
    expect(component.activeView()).toBe('dashboard');
  });

  it('should initialize with current date', () => {
    expect(component.currentDate()).toBeTruthy();
    expect(typeof component.currentDate()).toBe('string');
  });

  it('should start with no daily nutrition data', () => {
    expect(component.dailyNutrition()).toBeNull();
  });

  it('should have loading state initially false', () => {
    expect(component.isLoading()).toBeFalse();
  });

  it('should have no error initially', () => {
    expect(component.error()).toBeNull();
  });

  it('should have isEmpty computed correctly', () => {
    // When no data and not loading
    expect(component.isEmpty()).toBeTrue();
  });

  it('should have hasMeals computed correctly', () => {
    // With no nutrition data
    expect(component.hasMeals()).toBeFalsy();
  });

  it('should switch between views', () => {
    component.activeView.set('meals');
    expect(component.activeView()).toBe('meals');

    component.activeView.set('dashboard');
    expect(component.activeView()).toBe('dashboard');
  });

  describe('ngOnInit', () => {
    it('should load nutrition goals on init', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(mockUserProfileService.getNutritionTargets).toHaveBeenCalled();
      expect(component.isLoadingGoals()).toBeFalse();
    }));

    it('should load nutrition data from store on init', () => {
      component.ngOnInit();

      expect(mockNutritionStore.load).toHaveBeenCalledWith('user-123');
    });

    it('should handle null user gracefully', () => {
      localStorage.removeItem('currentUser');

      component.ngOnInit();

      expect(component.dailyNutrition()).toBeNull();
    });

    it('should handle goals loading error', fakeAsync(() => {
      mockUserProfileService.getNutritionTargets.and.returnValue(
        throwError(() => new Error('Error'))
      );

      component.ngOnInit();
      tick();

      expect(component.isLoadingGoals()).toBeFalse();
    }));
  });

  describe('search functionality', () => {
    it('should update search term with debounce', fakeAsync(() => {
      component.searchControl.setValue('test');
      tick(300);

      expect(mockNutritionStore.setSearchTerm).toHaveBeenCalledWith('test');
    }));

    it('should not call setSearchTerm before debounce', fakeAsync(() => {
      component.searchControl.setValue('test');
      tick(100);

      expect(mockNutritionStore.setSearchTerm).not.toHaveBeenCalled();
    }));

    it('should clear search', () => {
      component.clearSearch();

      expect(component.searchControl.value).toBe('');
      expect(mockNutritionStore.clearSearch).toHaveBeenCalled();
    });

    it('should filter distinct values', fakeAsync(() => {
      component.searchControl.setValue('test');
      tick(300);
      mockNutritionStore.setSearchTerm.calls.reset();

      component.searchControl.setValue('test');
      tick(300);

      expect(mockNutritionStore.setSearchTerm).not.toHaveBeenCalled();
    }));
  });

  describe('meal day navigation', () => {
    it('should navigate to previous meal day', () => {
      component.onPreviousMealDay();

      expect(mockNutritionStore.previousMealDay).toHaveBeenCalled();
    });

    it('should navigate to next meal day', () => {
      component.onNextMealDay();

      expect(mockNutritionStore.nextMealDay).toHaveBeenCalled();
    });
  });

  describe('page navigation', () => {
    it('should go to previous page', () => {
      component.previousPage();

      expect(mockNutritionStore.previousPage).toHaveBeenCalled();
    });

    it('should go to next page', () => {
      component.nextPage();

      expect(mockNutritionStore.nextPage).toHaveBeenCalled();
    });
  });

  describe('view mode', () => {
    it('should set view mode', () => {
      component.setViewMode('infinite');

      expect(mockNutritionStore.setViewMode).toHaveBeenCalledWith('infinite');
    });

    it('should set view mode to pagination', () => {
      component.setViewMode('pagination');

      expect(mockNutritionStore.setViewMode).toHaveBeenCalledWith('pagination');
    });
  });

  describe('infinite scroll', () => {
    it('should load more items', () => {
      component.loadMore();

      expect(mockNutritionStore.loadMore).toHaveBeenCalled();
    });
  });

  describe('food added', () => {
    it('should show toast and reload on food added', fakeAsync(() => {
      const mockFood: FoodAnalysis = {
        name: 'Manzana',
        calories: 95,
        protein: 0.5,
        carbs: 25,
        fat: 0.3,
        confidence: 90,
        ingredients: ['Manzana'],
      };

      component.onFoodAdded(mockFood);
      tick();

      expect(mockToastService.success).toHaveBeenCalledWith('Manzana añadido al diario');
    }));
  });

  describe('add meal navigation', () => {
    it('should navigate to add meal page with current date', () => {
      const currentDate = component.currentDate();

      component.addMeal();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/nutrition/add'], {
        queryParams: { date: currentDate }
      });
    });
  });

  describe('active view', () => {
    it('should set active view to meals', () => {
      component.setActiveView('meals');

      expect(component.activeView()).toBe('meals');
    });

    it('should set active view to dashboard', () => {
      component.setActiveView('dashboard');

      expect(component.activeView()).toBe('dashboard');
    });
  });

  describe('date change', () => {
    it('should not reload if date is same', () => {
      const currentDate = component.currentDate();

      component.onDateChanged(currentDate);

      expect(component.currentDate()).toBe(currentDate);
    });

    it('should update date if different', fakeAsync(() => {
      const newDate = '2024-02-01';

      component.onDateChanged(newDate);
      tick();

      expect(component.currentDate()).toBe(newDate);
    }));

    it('should handle date change when user is not logged in', fakeAsync(() => {
      localStorage.removeItem('currentUser');
      const newDate = '2024-02-01';

      component.onDateChanged(newDate);
      tick();

      expect(component.dailyNutrition()).toBeNull();
    }));

    it('should load nutrition data when date changes with logged in user', fakeAsync(() => {
      const newDate = '2024-02-01';

      component.onDateChanged(newDate);
      tick();

      expect(mockNutritionService.getDailyNutrition).toHaveBeenCalledWith('user-123', newDate);
      expect(component.dailyNutrition()).toBeTruthy();
    }));

    it('should handle error when loading nutrition data', fakeAsync(() => {
      mockNutritionService.getDailyNutrition.and.returnValue(throwError(() => new Error('Network error')));
      const newDate = '2024-02-01';

      component.onDateChanged(newDate);
      tick(3000);

      expect(component.dailyNutrition()).toBeTruthy();
      expect(component.dailyNutrition()?.meals).toEqual([]);
    }));
  });

  describe('retry load', () => {
    it('should reload data from store', () => {
      component.retryLoad();

      expect(mockNutritionStore.load).toHaveBeenCalledWith('user-123');
    });
  });

  describe('hasMeals computed', () => {
    it('should return false when nutrition is null', () => {
      component.dailyNutrition.set(null);
      expect(component.hasMeals()).toBeFalsy();
    });

    it('should return true when nutrition has meals', () => {
      const mockDailyNutrition: DailyNutrition = {
        date: '2024-01-15',
        meals: [mockMeal],
        totalCalories: 2000,
        totalProtein: 150,
        totalCarbs: 250,
        totalFat: 65,
        totalFiber: 30,
        waterIntake: 2000,
        calorieGoal: 2200,
      };
      component.dailyNutrition.set(mockDailyNutrition);
      expect(component.hasMeals()).toBeTrue();
    });

    it('should return false when nutrition has empty meals array', () => {
      const mockDailyNutrition: DailyNutrition = {
        date: '2024-01-15',
        meals: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        waterIntake: 0,
        calorieGoal: 2200,
      };
      component.dailyNutrition.set(mockDailyNutrition);
      expect(component.hasMeals()).toBeFalsy();
    });
  });

  describe('search with null handling', () => {
    it('should handle null search term', fakeAsync(() => {
      component.searchControl.setValue(null);
      tick(300);

      expect(mockNutritionStore.setSearchTerm).toHaveBeenCalledWith('');
    }));
  });

  describe('getUserId error handling', () => {
    it('should handle JSON parse error', () => {
      localStorage.setItem('currentUser', 'invalid-json{');

      component.ngOnInit();

      expect(component.dailyNutrition()).toBeNull();
    });
  });
});
