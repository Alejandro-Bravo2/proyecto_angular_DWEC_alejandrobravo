import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  completed: boolean;
}

@Component({
  selector: 'app-exercise-row',
  standalone: true,
  imports: [CommonModule], // Add CommonModule here
  templateUrl: './exercise-row.html',
  styleUrl: './exercise-row.scss',
})
export class ExerciseRow {
  @Input() exercise: Exercise | undefined;
}
