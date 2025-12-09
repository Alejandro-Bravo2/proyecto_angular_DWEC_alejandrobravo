import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule

interface Food {
  icon: string; // Placeholder for icon path or name
  quantity: string;
  name: string;
}

@Component({
  selector: 'app-food-item',
  standalone: true,
  imports: [CommonModule], // Add CommonModule here
  templateUrl: './food-item.html',
  styleUrl: './food-item.scss',
})
export class FoodItem {
  @Input() food: Food | undefined;
}
