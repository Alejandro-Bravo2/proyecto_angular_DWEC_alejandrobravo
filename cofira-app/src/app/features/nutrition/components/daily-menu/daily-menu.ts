import { Component, input, output, computed, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { MealSection } from '../meal-section/meal-section';
import { DailyNutrition } from '../../services/nutrition.service';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Merienda',
};

@Component({
  selector: 'app-daily-menu',
  standalone: true,
  imports: [MealSection],
  templateUrl: './daily-menu.html',
  styleUrl: './daily-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailyMenu {
  readonly dailyNutrition = input<DailyNutrition | null>(null);
  readonly currentDate = input<string>(this.getTodayDate());
  readonly dateChanged = output<string>();

  readonly formattedDate = computed(() => {
    const date = new Date(this.currentDate() + 'T12:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  });

  readonly isToday = computed(() => this.currentDate() === this.getTodayDate());

  readonly hasMeals = computed(() => {
    const nutrition = this.dailyNutrition();
    return nutrition && nutrition.meals.length > 0;
  });

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previousDay();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.nextDay();
    }
  }

  previousDay(): void {
    const date = new Date(this.currentDate() + 'T12:00:00');
    date.setDate(date.getDate() - 1);
    this.dateChanged.emit(this.formatDate(date));
  }

  nextDay(): void {
    const date = new Date(this.currentDate() + 'T12:00:00');
    date.setDate(date.getDate() + 1);
    this.dateChanged.emit(this.formatDate(date));
  }

  onDateInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.dateChanged.emit(input.value);
    }
  }

  goToToday(): void {
    this.dateChanged.emit(this.getTodayDate());
  }

  getMealLabel(type: string): string {
    return MEAL_LABELS[type as MealType] || type;
  }

  trackByMealId(_index: number, meal: { id: string }): string {
    return meal.id;
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
