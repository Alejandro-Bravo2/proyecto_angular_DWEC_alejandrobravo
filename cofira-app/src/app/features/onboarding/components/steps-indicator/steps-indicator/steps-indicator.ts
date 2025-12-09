import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule

interface Step {
  index: number;
  label: string;
}

@Component({
  selector: 'app-steps-indicator',
  standalone: true,
  imports: [CommonModule], // Add CommonModule here
  templateUrl: './steps-indicator.html',
  styleUrl: './steps-indicator.scss',
})
export class StepsIndicator {
  @Input() steps: Step[] = [];
  @Input() currentStep: number = 1;
}
