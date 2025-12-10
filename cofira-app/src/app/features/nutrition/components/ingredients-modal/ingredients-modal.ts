import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Ingredient {
  name: string;
  quantity: string;
  price: number;
}

@Component({
  selector: 'app-ingredients-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ingredients-modal.html',
  styleUrl: './ingredients-modal.scss',
})
export class IngredientsModal {
  @Input() mealName: string = 'Plato';
  @Input() ingredients: Ingredient[] = [
    { name: 'Pollo', quantity: '200g', price: 2.50 },
    { name: 'Arroz', quantity: '150g', price: 0.30 },
    { name: 'Verduras Mixtas', quantity: '100g', price: 0.80 },
  ];

  get totalCost(): number {
    return this.ingredients.reduce((sum, item) => sum + item.price, 0);
  }
}
