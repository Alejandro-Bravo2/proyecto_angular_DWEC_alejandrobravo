import { Component, signal, inject, OnInit } from '@angular/core';
import { WeeklyTable } from './components/weekly-table/weekly-table';
import { FeedbackForm } from './components/feedback-form/feedback-form';
import { ProgressCard } from './components/progress-card/progress-card';
import { TrainingService, Exercise, WorkoutProgress } from './services/training.service';
import { EmptyState } from '../../shared/components/ui/empty-state/empty-state';

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [WeeklyTable, FeedbackForm, ProgressCard, EmptyState],
  templateUrl: './training.html',
  styleUrl: './training.scss',
})
export class Training implements OnInit {
  private trainingService = inject(TrainingService);

  // Reactive state using signals
  currentDate = signal(new Date().toISOString().split('T')[0]);
  exercises = signal<Exercise[]>([]);
  workoutProgress = signal<WorkoutProgress | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadTrainingData();
  }

  private loadTrainingData(): void {
    const userId = this.getUserId();
    if (!userId) {
      this.error.set('Usuario no autenticado');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    // Load exercises
    this.trainingService.getExercises(userId, this.currentDate()).subscribe({
      next: (exercises) => {
        this.exercises.set(exercises);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading exercises:', err);
        this.error.set('Error al cargar los ejercicios');
        this.isLoading.set(false);
      },
    });

    // Load workout progress
    this.trainingService.getWorkoutProgress(userId).subscribe({
      next: (progress) => {
        this.workoutProgress.set(progress);
      },
      error: (err) => {
        console.error('Error loading workout progress:', err);
      },
    });
  }

  private getUserId(): string | null {
    const user = localStorage.getItem('currentUser');
    if (user) {
      return JSON.parse(user).id;
    }
    return null;
  }

  /**
   * Método llamado desde el EmptyState para crear una nueva rutina
   */
  createRoutine(): void {
    console.log('Crear nueva rutina de entrenamiento');
    // TODO: Implementar lógica para abrir modal o navegar a formulario de creación de rutina
  }
}
