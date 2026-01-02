import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { ExerciseRow } from '../exercise-row/exercise-row';
import { Exercise } from '../../services/training.service';

@Component({
  selector: 'app-weekly-table',
  standalone: true,
  imports: [ExerciseRow],
  templateUrl: './weekly-table.html',
  styleUrl: './weekly-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyTable {
  // Input signal for exercises
  exercises = input<Exercise[]>([]);
}
