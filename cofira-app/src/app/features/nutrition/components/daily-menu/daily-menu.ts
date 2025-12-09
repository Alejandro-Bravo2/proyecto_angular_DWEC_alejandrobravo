import { Component } from '@angular/core';
import { MealSection } from '../meal-section/meal-section'; // Import MealSection

@Component({
  selector: 'app-daily-menu',
  standalone: true,
  imports: [MealSection], // Add MealSection to imports
  templateUrl: './daily-menu.html',
  styleUrl: './daily-menu.scss',
})
export class DailyMenu {

}
