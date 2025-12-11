import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodItem } from '../food-item/food-item';
import { ModalService } from '../../../../core/services/modal.service';
import { IngredientsModal } from '../ingredients-modal/ingredients-modal';
import { FoodItem as FoodItemType } from '../../services/nutrition.service';

interface Ingredient {
  name: string;
  quantity: string;
  price: number;
}

@Component({
  selector: 'app-meal-section',
  standalone: true,
  imports: [CommonModule, FoodItem],
  templateUrl: './meal-section.html',
  styleUrl: './meal-section.scss',
})
export class MealSection {
  // Input signals for real data
  title = input<string>('');
  foods = input<FoodItemType[]>([]);
  mealId = input<string>('');

  constructor(private modalService: ModalService) {}

  openIngredientsModal(): void {
    // Convert foods to ingredients format for modal
    const ingredients: Ingredient[] = this.foods().map(food => ({
      name: food.name,
      quantity: food.quantity,
      price: 0 // Price can be added later if available in the API
    }));

    this.modalService.open(IngredientsModal, {
      mealName: this.title(),
      ingredients
    });
  }
}
