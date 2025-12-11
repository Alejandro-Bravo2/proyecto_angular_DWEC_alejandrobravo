import { Component, signal, inject, OnInit } from '@angular/core';
import { DailyMenu } from './components/daily-menu/daily-menu';
import { NutritionService, DailyNutrition } from './services/nutrition.service';

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [DailyMenu],
  templateUrl: './nutrition.html',
  styleUrl: './nutrition.scss',
})
export class Nutrition implements OnInit {
  private nutritionService = inject(NutritionService);

  // Reactive state using signals
  currentDate = signal(new Date().toISOString().split('T')[0]);
  dailyNutrition = signal<DailyNutrition | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadNutritionData();
  }

  onDateChanged(newDate: string): void {
    this.currentDate.set(newDate);
    this.loadNutritionData();
  }

  private loadNutritionData(): void {
    const userId = this.getUserId();
    if (!userId) {
      this.error.set('Usuario no autenticado');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.nutritionService.getDailyNutrition(userId, this.currentDate()).subscribe({
      next: (data) => {
        this.dailyNutrition.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading nutrition data:', err);
        this.error.set('Error al cargar los datos de nutrición');
        this.isLoading.set(false);
      },
    });
  }

  private getUserId(): string | null {
    // Get user ID from localStorage or auth service
    const user = localStorage.getItem('currentUser');
    if (user) {
      return JSON.parse(user).id;
    }
    return null;
  }
}
