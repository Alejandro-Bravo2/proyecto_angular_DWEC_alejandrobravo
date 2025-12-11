import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MealSection } from '../meal-section/meal-section';
import { DailyNutrition, Meal } from '../../services/nutrition.service';

@Component({
  selector: 'app-daily-menu',
  standalone: true,
  imports: [CommonModule, MealSection],
  templateUrl: './daily-menu.html',
  styleUrl: './daily-menu.scss',
})
export class DailyMenu {
  // Input signal for daily nutrition data
  dailyNutrition = input<DailyNutrition | null>(null);
  currentDate = input<string>(new Date().toISOString().split('T')[0]);

  // Output signals for date navigation
  dateChanged = output<string>();

  // Computed signal for formatted date
  formattedDate = computed(() => {
    const date = new Date(this.currentDate());
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  previousDay(): void {
    const current = new Date(this.currentDate());
    current.setDate(current.setDate(current.getDate() - 1));
    const newDate = current.toISOString().split('T')[0];
    this.dateChanged.emit(newDate);
  }

  nextDay(): void {
    const current = new Date(this.currentDate());
    current.setDate(current.getDate() + 1);
    const newDate = current.toISOString().split('T')[0];
    this.dateChanged.emit(newDate);
  }

  onDateInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.dateChanged.emit(input.value);
    }
  }

  goToToday(): void {
    const today = new Date().toISOString().split('T')[0];
    this.dateChanged.emit(today);
  }
}
