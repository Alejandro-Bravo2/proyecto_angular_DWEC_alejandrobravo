import { Component, input, computed, inject, ChangeDetectionStrategy } from '@angular/core';
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
  imports: [FoodItem],
  templateUrl: './meal-section.html',
  styleUrl: './meal-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealSection {
  private readonly modalService = inject(ModalService);

  readonly title = input.required<string>();
  readonly foods = input<FoodItemType[]>([]);
  readonly mealId = input.required<string>();

  readonly isEmpty = computed(() => this.foods().length === 0);
  readonly foodCount = computed(() => this.foods().length);

  openIngredientsModal(): void {
    if (this.isEmpty()) return;

    const ingredients: Ingredient[] = this.foods().map(food => ({
      name: food.name,
      quantity: food.quantity,
      price: 0,
    }));

    this.modalService.open(IngredientsModal, {
      mealName: this.title(),
      ingredients,
    });
  }

  trackByFoodName(_index: number, food: FoodItemType): string {
    return food.name;
  }
}
