import { Component } from '@angular/core';
import { NutrientCounter } from './components/nutrient-counter/nutrient-counter';
import { StrengthGainChart } from './components/strength-gain-chart/strength-gain-chart';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [NutrientCounter, StrengthGainChart],
  templateUrl: './progress.html',
  styleUrl: './progress.scss',
})
export class Progress {

}
