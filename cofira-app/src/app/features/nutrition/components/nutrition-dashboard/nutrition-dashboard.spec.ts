import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NutritionDashboard, NutritionGoals } from './nutrition-dashboard';
import { DailyNutrition, Meal, FoodItem } from '../../services/nutrition.service';
import { FoodAnalysis } from '../../services/nutrition-ai.service';
import { Component, input } from '@angular/core';

// Mock de MacroChart
@Component({
  selector: 'app-macro-chart',
  standalone: true,
  template: '<div class="mock-macro-chart"></div>'
})
class MockMacroChart {
  label = input.required<string>();
  data = input.required<{ current: number; goal: number; unit: string }>();
  color = input<string>('#000000');
}

// Mock de PhotoAnalyzer
@Component({
  selector: 'app-photo-analyzer',
  standalone: true,
  template: '<div class="mock-photo-analyzer"></div>'
})
class MockPhotoAnalyzer {}

describe('NutritionDashboard', () => {
  let component: NutritionDashboard;
  let fixture: ComponentFixture<NutritionDashboard>;

  const mockGoals: NutritionGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 70,
    fiber: 30
  };

  const mockFoodItem: FoodItem = {
    icon: '🍳',
    quantity: '2 unidades',
    name: 'Huevos revueltos',
    calories: 180,
    protein: 14,
    carbs: 2,
    fat: 12,
    fiber: 0
  };

  const mockMeal: Meal = {
    id: '1',
    userId: 'user1',
    date: '2024-01-15',
    mealType: 'breakfast',
    foods: [mockFoodItem],
    totalCalories: 180,
    totalProtein: 14,
    totalCarbs: 2,
    totalFat: 12,
    totalFiber: 0
  };

  const mockDailyNutrition: DailyNutrition = {
    date: '2024-01-15',
    meals: [mockMeal],
    totalCalories: 180,
    totalProtein: 14,
    totalCarbs: 2,
    totalFat: 12,
    totalFiber: 0,
    waterIntake: 6,
    calorieGoal: 2000
  };

  const mockFoodAnalysis: FoodAnalysis = {
    name: 'Ensalada Cesar',
    calories: 350,
    protein: 25,
    carbs: 15,
    fat: 20,
    confidence: 90,
    ingredients: ['Lechuga', 'Pollo', 'Parmesano']
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NutritionDashboard]
    })
    .overrideComponent(NutritionDashboard, {
      set: {
        imports: [MockMacroChart, MockPhotoAnalyzer]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutritionDashboard);
    component = fixture.componentInstance;
  });

  it('deberia crear el componente', () => {
    fixture.componentRef.setInput('goals', mockGoals);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('goals', mockGoals);
      fixture.detectChanges();
    });

    it('deberia establecer goals correctamente', () => {
      expect(component.goals()).toEqual(mockGoals);
    });

    it('deberia tener dailyNutrition como null por defecto', () => {
      expect(component.dailyNutrition()).toBeNull();
    });

    it('deberia establecer dailyNutrition cuando se proporciona', () => {
      fixture.componentRef.setInput('dailyNutrition', mockDailyNutrition);
      fixture.detectChanges();
      expect(component.dailyNutrition()).toEqual(mockDailyNutrition);
    });

    it('deberia tener showFiber como true por defecto', () => {
      expect(component.showFiber()).toBeTrue();
    });

    it('deberia tener waterGlasses como 0 por defecto', () => {
      expect(component.waterGlasses()).toBe(0);
    });

    it('deberia tener currentStreak como 0 por defecto', () => {
      expect(component.currentStreak()).toBe(0);
    });
  });

  describe('Circunferencia de calorias', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('goals', mockGoals);
      fixture.detectChanges();
    });

    it('deberia calcular la circunferencia correctamente', () => {
      const expectedCircumference = 2 * Math.PI * 52;
      expect(component.caloriesCircumference).toBeCloseTo(expectedCircumference, 2);
    });
  });

  describe('Computed: currentCalories', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('goals', mockGoals);
      fixture.detectChanges();
    });

    it('deberia devolver 0 si no hay dailyNutrition', () => {
      expect(component.currentCalories()).toBe(0);
    });

    it('deberia calcular las calorias totales de todas las comidas', () => {
      fixture.componentRef.setInput('dailyNutrition', mockDailyNutrition);
      fixture.detectChanges();
      expect(component.currentCalories()).toBe(180);
    });

    it('deberia sumar calorias de multiples comidas', () => {
      const multipleMeals: DailyNutrition = {
        ...mockDailyNutrition,
        meals: [
          mockMeal,
          { ...mockMeal, id: '2', foods: [{ ...mockFoodItem, calories: 320 }] }
        ]
      };
      fixture.componentRef.setInput('dailyNutrition', multipleMeals);
      fixture.detectChanges();
      expect(component.currentCalories()).toBe(500);
    });
  });

  describe('Computed: remainingCalories', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('goals', mockGoals);
      fixture.detectChanges();
    });

    it('deberia calcular calorias restantes correctamente', () => {
      fixture.componentRef.setInput('dailyNutrition', mockDailyNutrition);
      fixture.detectChanges();
      expect(component.remainingCalories()).toBe(1820);
    });

    it('deberia devolver 0 si se excede el objetivo', () => {
      const overGoal: DailyNutrition = {
        ...mockDailyNutrition,
        meals: [{ ...mockMeal, foods: [{ ...mockFoodItem, calories: 2500 }] }]
      };
      fixture.componentRef.setInput('dailyNutrition', overGoal);
      fixture.detectChanges();
      expect(component.remainingCalories()).toBe(0);
    });
  });

  describe('Computed: caloriesOffset', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('goals', mockGoals);
      fixture.detectChanges();
    });

    it('deberia calcular el offset del circulo de progreso', () => {
      fixture.componentRef.setInput('dailyNutrition', mockDailyNutrition);
      fixture.detectChanges();
      const percentage = 180 / 2000;
      const expectedOffset = component.caloriesCircumference * (1 - percentage);
      expect(component.caloriesOffset()).toBeCloseTo(expectedOffset, 2);
    });

    it('deberia limitar el porcentaje a 1 maximo', () => {
      const overGoal: DailyNutrition = {
        ...mockDailyNutrition,
        meals: [{ ...mockMeal, foods: [{ ...mockFoodItem, calories: 3000 }] }]
      };
      fixture.componentRef.setInput('dailyNutrition', overGoal);
      fixture.detectChanges();
      expect(component.caloriesOffset()).toBe(0);
    });
  });

  describe('Computed: macros actuales', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('goals', mockGoals);
      fixture.componentRef.setInput('dailyNutrition', mockDailyNutrition);
      fixture.detectChanges();
    });

    it('deberia calcular currentProtein correctamente', () => {
      expect(component.currentProtein()).toBe(14);
    });

    it('deberia calcular currentCarbs correctamente', () => {
      expect(component.currentCarbs()).toBe(2);
    });

    it('deberia calcular currentFat correctamente', () => {
      expect(component.currentFat()).toBe(12);
    });

    it('deberia calcular currentFiber correctamente', () => {
      expect(component.currentFiber()).toBe(0);
    });

    it('deberia devolver 0 para macros si no hay dailyNutrition', () => {
      fixture.componentRef.setInput('dailyNutrition', null);
      fixture.detectChanges();
      expect(component.currentProtein()).toBe(0);
      expect(component.currentCarbs()).toBe(0);
      expect(component.currentFat()).toBe(0);
      expect(component.currentFiber()).toBe(0);
    });
  });

  describe('Computed: MacroData para graficos', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('goals', mockGoals);
      fixture.componentRef.setInput('dailyNutrition', mockDailyNutrition);
      fixture.detectChanges();
    });

    it('deberia generar proteinData correctamente', () => {
      const proteinData = component.proteinData();
      expect(proteinData.current).toBe(14);
      expect(proteinData.goal).toBe(150);
      expect(proteinData.unit).toBe('g');
    });

    it('deberia generar carbsData correctamente', () => {
      const carbsData = component.carbsData();
      expect(carbsData.current).toBe(2);
      expect(carbsData.goal).toBe(250);
      expect(carbsData.unit).toBe('g');
    });

    it('deberia generar fatData correctamente', () => {
      const fatData = component.fatData();
      expect(fatData.current).toBe(12);
      expect(fatData.goal).toBe(70);
      expect(fatData.unit).toBe('g');
    });

    it('deberia generar fiberData con valor por defecto de 25 si no se especifica fiber en goals', () => {
      const goalsWithoutFiber: NutritionGoals = {
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 70
      };
      fixture.componentRef.setInput('goals', goalsWithoutFiber);
      fixture.detectChanges();
      const fiberData = component.fiberData();
      expect(fiberData.goal).toBe(25);
    });
  });

  describe('Computed: distribucion de porcentajes', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('goals', mockGoals);
      fixture.detectChanges();
    });

    it('deberia calcular totalMacroCalories correctamente', () => {
      fixture.componentRef.setInput('dailyNutrition', mockDailyNutrition);
      fixture.detectChanges();
      // (14 * 4) + (2 * 4) + (12 * 9) = 56 + 8 + 108 = 172
      expect(component.totalMacroCalories()).toBe(172);
    });

    it('deberia devolver porcentajes por defecto si totalMacroCalories es 0', () => {
      expect(component.proteinPercentage()).toBe(33);
      expect(component.carbsPercentage()).toBe(34);
      expect(component.fatPercentage()).toBe(33);
    });

    it('deberia calcular porcentajes basados en calorias de macros', () => {
      fixture.componentRef.setInput('dailyNutrition', mockDailyNutrition);
      fixture.detectChanges();
      // Total: 172 calorias
      // Proteina: (14 * 4) / 172 * 100 = 32.55... -> 33
      // Carbs: (2 * 4) / 172 * 100 = 4.65... -> 5
      // Fat: (12 * 9) / 172 * 100 = 62.79... -> 63
      expect(component.proteinPercentage()).toBe(33);
      expect(component.carbsPercentage()).toBe(5);
      expect(component.fatPercentage()).toBe(63);
    });
  });

  describe('Computed: mealsCount', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('goals', mockGoals);
      fixture.detectChanges();
    });

    it('deberia devolver 0 si no hay dailyNutrition', () => {
      expect(component.mealsCount()).toBe(0);
    });

    it('deberia contar las comidas correctamente', () => {
      fixture.componentRef.setInput('dailyNutrition', mockDailyNutrition);
      fixture.detectChanges();
      expect(component.mealsCount()).toBe(1);
    });

    it('deberia contar multiples comidas', () => {
      const multipleMeals: DailyNutrition = {
        ...mockDailyNutrition,
        meals: [mockMeal, { ...mockMeal, id: '2' }, { ...mockMeal, id: '3' }]
      };
      fixture.componentRef.setInput('dailyNutrition', multipleMeals);
      fixture.detectChanges();
      expect(component.mealsCount()).toBe(3);
    });
  });

  describe('Metodos de eventos', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('goals', mockGoals);
      fixture.detectChanges();
    });

    it('deberia registrar en consola cuando se analiza comida', () => {
      spyOn(console, 'log');
      component.onFoodAnalyzed(mockFoodAnalysis);
      expect(console.log).toHaveBeenCalledWith('Food analyzed:', mockFoodAnalysis);
    });

    it('deberia emitir foodAdded cuando se confirma comida', () => {
      const emittedFood: FoodAnalysis[] = [];
      component.foodAdded.subscribe((food) => {
        emittedFood.push(food);
      });

      component.onFoodConfirmed(mockFoodAnalysis);

      expect(emittedFood).toContain(mockFoodAnalysis);
    });
  });

  describe('Calculos con multiples alimentos por comida', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('goals', mockGoals);
      fixture.detectChanges();
    });

    it('deberia sumar calorias de todos los alimentos en una comida', () => {
      const mealWithMultipleFoods: Meal = {
        ...mockMeal,
        foods: [
          { ...mockFoodItem, calories: 100 },
          { ...mockFoodItem, calories: 200 },
          { ...mockFoodItem, calories: 150 }
        ]
      };
      const nutrition: DailyNutrition = {
        ...mockDailyNutrition,
        meals: [mealWithMultipleFoods]
      };
      fixture.componentRef.setInput('dailyNutrition', nutrition);
      fixture.detectChanges();
      expect(component.currentCalories()).toBe(450);
    });

    it('deberia sumar proteinas de todos los alimentos', () => {
      const mealWithMultipleFoods: Meal = {
        ...mockMeal,
        foods: [
          { ...mockFoodItem, protein: 10 },
          { ...mockFoodItem, protein: 20 },
          { ...mockFoodItem, protein: 15 }
        ]
      };
      const nutrition: DailyNutrition = {
        ...mockDailyNutrition,
        meals: [mealWithMultipleFoods]
      };
      fixture.componentRef.setInput('dailyNutrition', nutrition);
      fixture.detectChanges();
      expect(component.currentProtein()).toBe(45);
    });
  });
});
