import { Component, input, output, ChangeDetectionStrategy, computed, signal, inject } from '@angular/core';
import { Exercise } from '../../services/training.service';
import { TrainingStore } from '../../stores/training.store';

@Component({
  selector: 'app-weekly-table',
  standalone: true,
  imports: [],
  templateUrl: './weekly-table.html',
  styleUrl: './weekly-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyTable {
  private readonly store = inject(TrainingStore);

  // Input signals
  exercises = input<Exercise[]>([]);
  selectedDay = input<string>('LUNES');
  availableDays = input<string[]>([]);

  // Output events for navigation
  previousDayClicked = output<void>();
  nextDayClicked = output<void>();

  // Estado para controlar qué ejercicio tiene el desplegable abierto
  expandedExerciseId = signal<string | null>(null);

  // Computed values for navigation state
  canGoPrevious = computed(() => {
    const days = this.availableDays();
    const current = this.selectedDay();
    return days.indexOf(current) > 0;
  });

  canGoNext = computed(() => {
    const days = this.availableDays();
    const current = this.selectedDay();
    return days.indexOf(current) < days.length - 1;
  });

  // Computed: total y completados
  completedCount = computed(() => this.exercises().filter(e => e.completed).length);
  totalCount = computed(() => this.exercises().length);

  // Format day name for display
  formatDayName = computed(() => {
    const dayMap: Record<string, string> = {
      'LUNES': 'Lunes',
      'MARTES': 'Martes',
      'MIERCOLES': 'Miércoles',
      'JUEVES': 'Jueves',
      'VIERNES': 'Viernes',
      'SABADO': 'Sábado',
      'DOMINGO': 'Domingo'
    };
    return dayMap[this.selectedDay()] || this.selectedDay();
  });

  onPreviousDay(): void {
    this.previousDayClicked.emit();
  }

  onNextDay(): void {
    this.nextDayClicked.emit();
  }

  toggleExpanded(exerciseId: string): void {
    if (this.expandedExerciseId() === exerciseId) {
      this.expandedExerciseId.set(null);
    } else {
      this.expandedExerciseId.set(exerciseId);
    }
  }

  isExpanded(exerciseId: string): boolean {
    return this.expandedExerciseId() === exerciseId;
  }

  toggleComplete(exerciseId: string, event: Event): void {
    event.stopPropagation();
    this.store.toggleComplete(exerciseId);
  }

  formatRestTime(seconds: number): string {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    return `${seconds}s`;
  }
}
