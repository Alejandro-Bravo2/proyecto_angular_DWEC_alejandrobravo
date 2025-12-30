import { Component, input, computed } from '@angular/core';
import { FoodItem as FoodItemType } from '../../services/nutrition.service';

@Component({
  selector: 'app-food-item',
  standalone: true,
  imports: [],
  templateUrl: './food-item.html',
  styleUrl: './food-item.scss',
})
export class FoodItem {
  readonly food = input<FoodItemType>();

  readonly hasFood = computed(() => !!this.food());
  readonly displayName = computed(() => this.food()?.name ?? '');
  readonly displayQuantity = computed(() => this.food()?.quantity ?? '');
}
