import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FoodItem } from '../food-item/food-item'; // Import FoodItem

interface Food {
  icon: string; // Placeholder for icon path or name
  quantity: string;
  name: string;
}

@Component({
  selector: 'app-meal-section',
  standalone: true,
  imports: [CommonModule, FoodItem], // Add CommonModule here
  templateUrl: './meal-section.html',
  styleUrl: './meal-section.scss',
})
export class MealSection {
  @Input() title: string = '';

  // Dummy data for food items
  foodItems: Food[] = [
    { icon: 'apple', quantity: '100g', name: 'Manzana' },
    { icon: 'bread', quantity: '2 rebanadas', name: 'Pan Integral' },
    { icon: 'egg', quantity: '2 unidades', name: 'Huevos cocidos' },
  ];
}
