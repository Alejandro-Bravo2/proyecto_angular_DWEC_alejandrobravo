import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentRef } from '@angular/core';

import { DailyMenu } from './daily-menu';
import { Meal } from '../../services/nutrition.service';

describe('DailyMenu', () => {
  let component: DailyMenu;
  let componentRef: ComponentRef<DailyMenu>;
  let fixture: ComponentFixture<DailyMenu>;

  const mockMeals: Meal[] = [
    {
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
    },
    {
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
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyMenu],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DailyMenu);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('inputs', () => {
    it('should accept meals input', () => {
      componentRef.setInput('meals', mockMeals);
      fixture.detectChanges();

      expect(component.meals()).toEqual(mockMeals);
    });

    it('should accept selectedDay input', () => {
      componentRef.setInput('selectedDay', 'LUNES');
      fixture.detectChanges();

      expect(component.selectedDay()).toBe('LUNES');
    });

    it('should have empty meals by default', () => {
      expect(component.meals()).toEqual([]);
    });

    it('should have empty selectedDay by default', () => {
      expect(component.selectedDay()).toBe('');
    });
  });

  describe('computed: displayMeals', () => {
    it('should return meals', () => {
      componentRef.setInput('meals', mockMeals);
      fixture.detectChanges();

      expect(component.displayMeals()).toEqual(mockMeals);
    });

    it('should return empty array when no meals', () => {
      expect(component.displayMeals()).toEqual([]);
    });
  });

  describe('computed: hasMealsToShow', () => {
    it('should return true when meals exist', () => {
      componentRef.setInput('meals', mockMeals);
      fixture.detectChanges();

      expect(component.hasMealsToShow()).toBeTrue();
    });

    it('should return false when no meals', () => {
      expect(component.hasMealsToShow()).toBeFalse();
    });

    it('should return false with empty meals array', () => {
      componentRef.setInput('meals', []);
      fixture.detectChanges();

      expect(component.hasMealsToShow()).toBeFalse();
    });
  });

  describe('getMealLabel', () => {
    it('should return correct label for breakfast', () => {
      expect(component.getMealLabel('breakfast')).toBe('Desayuno');
    });

    it('should return correct label for lunch', () => {
      expect(component.getMealLabel('lunch')).toBe('Almuerzo');
    });

    it('should return correct label for dinner', () => {
      expect(component.getMealLabel('dinner')).toBe('Cena');
    });

    it('should return correct label for snack', () => {
      expect(component.getMealLabel('snack')).toBe('Merienda');
    });

    it('should return original type for unknown meal type', () => {
      expect(component.getMealLabel('unknown')).toBe('unknown');
    });
  });

  describe('trackByMealId', () => {
    it('should return meal id', () => {
      const meal = mockMeals[0];
      const result = component.trackByMealId(0, meal);

      expect(result).toBe('1');
    });

    it('should work for different meals', () => {
      expect(component.trackByMealId(0, mockMeals[0])).toBe('1');
      expect(component.trackByMealId(1, mockMeals[1])).toBe('2');
    });
  });

  describe('rendering', () => {
    it('should not show meals when empty', () => {
      const compiled = fixture.nativeElement as HTMLElement;

      expect(component.hasMealsToShow()).toBeFalse();
    });

    it('should show meals when provided', () => {
      componentRef.setInput('meals', mockMeals);
      fixture.detectChanges();

      expect(component.hasMealsToShow()).toBeTrue();
      expect(component.displayMeals().length).toBe(2);
    });
  });
});
