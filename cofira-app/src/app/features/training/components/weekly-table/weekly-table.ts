import { Component } from '@angular/core';
import { ExerciseRow } from '../exercise-row/exercise-row';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  completed: boolean;
}

@Component({
  selector: 'app-weekly-table',
  standalone: true,
  imports: [ExerciseRow],
  templateUrl: './weekly-table.html',
  styleUrl: './weekly-table.scss',
})
export class WeeklyTable {
  exercises: Exercise[] = [
    { name: 'Press Banca', sets: 3, reps: '8-12', completed: false },
    { name: 'Sentadilla', sets: 4, reps: '6-10', completed: true },
    { name: 'Peso Muerto', sets: 3, reps: '5-8', completed: false },
    { name: 'Remo con Barra', sets: 3, reps: '8-12', completed: false },
  ];
}
