import { Component, input, output, computed, signal, inject } from '@angular/core';
import { MacroChart, MacroData } from '../macro-chart/macro-chart';
import { PhotoAnalyzer } from '../photo-analyzer/photo-analyzer';
import { FoodAnalysis } from '../../services/nutrition-ai.service';
import { DailyNutrition } from '../../services/nutrition.service';

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

@Component({
  selector: 'app-nutrition-dashboard',
  standalone: true,
  imports: [MacroChart, PhotoAnalyzer],
  template: `
    <div class="dashboard" role="region" aria-label="Panel de nutrición">
      <!-- Calories Ring - Main Focus -->
      <section
        class="dashboard__calories"
        aria-label="Calorías del día"
        role="figure"
        tabindex="0"
      >
        <div class="dashboard__calories-ring" aria-hidden="true">
          <svg viewBox="0 0 120 120" class="dashboard__ring-svg" role="img" aria-label="Gráfico circular de calorías">
            <circle
              class="dashboard__ring-bg"
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke-width="8"
            />
            <circle
              class="dashboard__ring-progress"
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke-width="8"
              [style.stroke-dasharray]="caloriesCircumference"
              [style.stroke-dashoffset]="caloriesOffset()"
              stroke-linecap="round"
            />
          </svg>
          <div class="dashboard__calories-center">
            <span class="dashboard__calories-value">{{ currentCalories() }}</span>
            <span class="dashboard__calories-label">kcal</span>
          </div>
        </div>
        <div class="dashboard__calories-info">
          <p class="dashboard__calories-remaining" role="status" aria-live="polite">
            @if (remainingCalories() > 0) {
              <span class="dashboard__remaining-value">{{ remainingCalories() }}</span>
              <span class="dashboard__remaining-text">kcal restantes</span>
            } @else {
              <span class="dashboard__remaining-exceeded">Meta alcanzada</span>
            }
          </p>
          <p class="dashboard__calories-goal">Objetivo: {{ goals().calories }} kcal</p>
        </div>
        <span class="sr-only">
          Has consumido {{ currentCalories() }} de {{ goals().calories }} calorías hoy.
          Te quedan {{ remainingCalories() }} calorías.
        </span>
      </section>

      <!-- Macros Grid -->
      <section class="dashboard__macros" aria-label="Macronutrientes">
        <h2 class="dashboard__section-title">Macros</h2>
        <div class="dashboard__macros-grid">
          <app-macro-chart
            label="Proteína"
            [data]="proteinData()"
            color="#2563eb"
          />
          <app-macro-chart
            label="Carbohidratos"
            [data]="carbsData()"
            color="#f59e0b"
          />
          <app-macro-chart
            label="Grasas"
            [data]="fatData()"
            color="#10b981"
          />
          @if (showFiber()) {
            <app-macro-chart
              label="Fibra"
              [data]="fiberData()"
              color="#8b5cf6"
            />
          }
        </div>
      </section>

      <!-- Quick Stats -->
      <section class="dashboard__stats" aria-label="Estadísticas rápidas" role="list">
        <div
          class="dashboard__stat"
          role="listitem"
          tabindex="0"
          aria-label="{{ mealsCount() }} comidas registradas hoy"
        >
          <span class="dashboard__stat-value" aria-hidden="true">{{ mealsCount() }}</span>
          <span class="dashboard__stat-label">comidas</span>
        </div>
        <div
          class="dashboard__stat"
          role="listitem"
          tabindex="0"
          aria-label="{{ waterGlasses() }} vasos de agua consumidos"
        >
          <span class="dashboard__stat-value" aria-hidden="true">{{ waterGlasses() }}</span>
          <span class="dashboard__stat-label">vasos agua</span>
        </div>
        <div
          class="dashboard__stat"
          role="listitem"
          tabindex="0"
          aria-label="{{ currentStreak() }} días de racha actual"
        >
          <span class="dashboard__stat-value" aria-hidden="true">{{ currentStreak() }}</span>
          <span class="dashboard__stat-label">días racha</span>
        </div>
      </section>

      <!-- Photo Analyzer -->
      <section class="dashboard__analyzer" aria-label="Analizar comida con IA">
        <h2 class="dashboard__section-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
            <circle cx="12" cy="13" r="3"/>
          </svg>
          Analizar con IA
        </h2>
        <app-photo-analyzer
          (foodAnalyzed)="onFoodAnalyzed($event)"
          (foodConfirmed)="onFoodConfirmed($event)"
        />
      </section>

      <!-- Macro Distribution -->
      <section class="dashboard__distribution" aria-label="Distribución de macros">
        <h2 class="dashboard__section-title">Distribución</h2>
        <div class="dashboard__distribution-bar">
          <div
            class="dashboard__distribution-segment dashboard__distribution-segment--protein"
            [style.width.%]="proteinPercentage()"
            aria-label="Proteína {{ proteinPercentage() }}%"
          ></div>
          <div
            class="dashboard__distribution-segment dashboard__distribution-segment--carbs"
            [style.width.%]="carbsPercentage()"
            aria-label="Carbohidratos {{ carbsPercentage() }}%"
          ></div>
          <div
            class="dashboard__distribution-segment dashboard__distribution-segment--fat"
            [style.width.%]="fatPercentage()"
            aria-label="Grasas {{ fatPercentage() }}%"
          ></div>
        </div>
        <div class="dashboard__distribution-legend">
          <span class="dashboard__legend-item dashboard__legend-item--protein">
            <span class="dashboard__legend-dot"></span>
            Proteína {{ proteinPercentage() }}%
          </span>
          <span class="dashboard__legend-item dashboard__legend-item--carbs">
            <span class="dashboard__legend-dot"></span>
            Carbos {{ carbsPercentage() }}%
          </span>
          <span class="dashboard__legend-item dashboard__legend-item--fat">
            <span class="dashboard__legend-dot"></span>
            Grasas {{ fatPercentage() }}%
          </span>
        </div>
      </section>
    </div>
  `,
  styleUrl: './nutrition-dashboard.scss',
})
export class NutritionDashboard {
  readonly dailyNutrition = input<DailyNutrition | null>(null);
  readonly goals = input.required<NutritionGoals>();
  readonly showFiber = input<boolean>(true);
  readonly waterGlasses = input<number>(0);
  readonly currentStreak = input<number>(0);

  readonly foodAdded = output<FoodAnalysis>();

  // Calories calculations
  readonly caloriesCircumference = 2 * Math.PI * 52;

  readonly currentCalories = computed(() => {
    const nutrition = this.dailyNutrition();
    if (!nutrition) return 0;
    return nutrition.meals.reduce((sum, meal) =>
      sum + meal.foods.reduce((mealSum, food) => mealSum + food.calories, 0), 0
    );
  });

  readonly remainingCalories = computed(() => {
    return Math.max(this.goals().calories - this.currentCalories(), 0);
  });

  readonly caloriesOffset = computed(() => {
    const percentage = Math.min(this.currentCalories() / this.goals().calories, 1);
    return this.caloriesCircumference * (1 - percentage);
  });

  // Macro calculations
  readonly currentProtein = computed(() => {
    const nutrition = this.dailyNutrition();
    if (!nutrition) return 0;
    return nutrition.meals.reduce((sum, meal) =>
      sum + meal.foods.reduce((mealSum, food) => mealSum + food.protein, 0), 0
    );
  });

  readonly currentCarbs = computed(() => {
    const nutrition = this.dailyNutrition();
    if (!nutrition) return 0;
    return nutrition.meals.reduce((sum, meal) =>
      sum + meal.foods.reduce((mealSum, food) => mealSum + food.carbs, 0), 0
    );
  });

  readonly currentFat = computed(() => {
    const nutrition = this.dailyNutrition();
    if (!nutrition) return 0;
    return nutrition.meals.reduce((sum, meal) =>
      sum + meal.foods.reduce((mealSum, food) => mealSum + food.fat, 0), 0
    );
  });

  readonly currentFiber = computed(() => {
    const nutrition = this.dailyNutrition();
    if (!nutrition) return 0;
    return nutrition.meals.reduce((sum, meal) =>
      sum + meal.foods.reduce((mealSum, food) => mealSum + (food.fiber || 0), 0), 0
    );
  });

  // MacroData for charts
  readonly proteinData = computed<MacroData>(() => ({
    current: this.currentProtein(),
    goal: this.goals().protein,
    unit: 'g',
  }));

  readonly carbsData = computed<MacroData>(() => ({
    current: this.currentCarbs(),
    goal: this.goals().carbs,
    unit: 'g',
  }));

  readonly fatData = computed<MacroData>(() => ({
    current: this.currentFat(),
    goal: this.goals().fat,
    unit: 'g',
  }));

  readonly fiberData = computed<MacroData>(() => ({
    current: this.currentFiber(),
    goal: this.goals().fiber || 25,
    unit: 'g',
  }));

  // Distribution percentages
  readonly totalMacroCalories = computed(() => {
    return (this.currentProtein() * 4) + (this.currentCarbs() * 4) + (this.currentFat() * 9);
  });

  readonly proteinPercentage = computed(() => {
    const total = this.totalMacroCalories();
    if (total === 0) return 33;
    return Math.round((this.currentProtein() * 4 / total) * 100);
  });

  readonly carbsPercentage = computed(() => {
    const total = this.totalMacroCalories();
    if (total === 0) return 34;
    return Math.round((this.currentCarbs() * 4 / total) * 100);
  });

  readonly fatPercentage = computed(() => {
    const total = this.totalMacroCalories();
    if (total === 0) return 33;
    return Math.round((this.currentFat() * 9 / total) * 100);
  });

  // Stats
  readonly mealsCount = computed(() => {
    const nutrition = this.dailyNutrition();
    return nutrition?.meals.length || 0;
  });

  onFoodAnalyzed(analysis: FoodAnalysis): void {
    // Handle analyzed food preview
    console.log('Food analyzed:', analysis);
  }

  onFoodConfirmed(analysis: FoodAnalysis): void {
    // Emit to parent to add to daily nutrition
    this.foodAdded.emit(analysis);
  }
}
