import { Component, signal, inject, OnInit } from '@angular/core';
import { NutrientCounter } from './components/nutrient-counter/nutrient-counter';
import { StrengthGainChart } from './components/strength-gain-chart/strength-gain-chart';
import { ProgressService, NutrientData, ProgressEntry } from './services/progress.service';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [NutrientCounter, StrengthGainChart],
  templateUrl: './progress.html',
  styleUrl: './progress.scss',
})
export class Progress implements OnInit {
  private progressService = inject(ProgressService);

  // Reactive state using signals
  currentDate = signal(new Date().toISOString().split('T')[0]);
  nutrientData = signal<NutrientData | null>(null);
  progressEntries = signal<ProgressEntry[]>([]);
  exercises = signal<string[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProgressData();
  }

  private loadProgressData(): void {
    const userId = this.getUserId();
    if (!userId) {
      this.error.set('Usuario no autenticado');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    // Load nutrient data
    this.progressService.getNutrientDataByDate(userId, this.currentDate()).subscribe({
      next: (data) => {
        this.nutrientData.set(data);
      },
      error: (err) => {
        console.error('Error loading nutrient data:', err);
        this.error.set('Error al cargar los datos de nutrientes');
      }
    });

    // Load progress entries
    this.progressService.getProgressEntries(userId).subscribe({
      next: (entries) => {
        this.progressEntries.set(entries);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading progress entries:', err);
        this.error.set('Error al cargar el progreso');
        this.isLoading.set(false);
      }
    });

    // Load user exercises
    this.progressService.getUserExercises(userId).subscribe({
      next: (exercises) => {
        this.exercises.set(exercises);
      },
      error: (err) => {
        console.error('Error loading exercises:', err);
      }
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
