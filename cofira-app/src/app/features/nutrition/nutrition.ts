import { Component } from '@angular/core';
import { DailyMenu } from './components/daily-menu/daily-menu';

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [DailyMenu],
  templateUrl: './nutrition.html',
  styleUrl: './nutrition.scss',
})
export class Nutrition {

}
