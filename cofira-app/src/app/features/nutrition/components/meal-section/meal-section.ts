import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FoodItem } from '../food-item/food-item'; // Import FoodItem
import { ModalService } from '../../../../../core/services/modal.service';
import { IngredientsModal } from '../ingredients-modal/ingredients-modal';

interface Food {
  icon: string; // Placeholder for icon path or name
  quantity: string;
  name: string;
}

interface Ingredient {
  name: string;
  quantity: string;
  price: number;
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

  // Dummy ingredients data for the modal
  dummyIngredients: Ingredient[] = [
    { name: 'Pollo', quantity: '200g', price: 2.50 },
    { name: 'Arroz', quantity: '150g', price: 0.30 },
    { name: 'Verduras Mixtas', quantity: '100g', price: 0.80 },
  ];

  constructor(private modalService: ModalService) {}

  openIngredientsModal(): void {
    this.modalService.open(IngredientsModal, {
      mealName: this.title,
      ingredients: this.dummyIngredients
    });
  }
}
