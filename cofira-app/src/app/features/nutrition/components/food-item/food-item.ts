import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Food {
  icon: string;
  quantity: string;
  name: string;
}

@Component({
  selector: 'app-food-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './food-item.html',
  styleUrl: './food-item.scss',
})
export class FoodItem {
  // Using Angular 20 input signal
  food = input<Food | undefined>(undefined);
}
