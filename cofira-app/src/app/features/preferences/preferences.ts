import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchableTags } from '../../shared/components/ui/searchable-tags/searchable-tags/searchable-tags';
import { PreferencesService } from './services/preferences.service';

interface Tag {
  label: string;
  value: string;
}

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, SearchableTags],
  templateUrl: './preferences.html',
  styleUrl: './preferences.scss',
})
export class Preferences implements OnInit {
  availableAllergies: Tag[] = [
    { label: 'Lácteos', value: 'lacteos' },
    { label: 'Gluten', value: 'gluten' },
    { label: 'Frutos secos', value: 'frutos_secos' },
    { label: 'Cacahuete', value: 'cacahuete' },
    { label: 'Soja', value: 'soja' },
  ];

  availableIngredients: Tag[] = [
    { label: 'Pollo', value: 'pollo' },
    { label: 'Arroz', value: 'arroz' },
    { label: 'Aguacate', value: 'aguacate' },
    { label: 'Espinacas', value: 'espinacas' },
    { label: 'Salmón', value: 'salmon' },
  ];

  constructor(public preferencesService: PreferencesService) {}

  ngOnInit(): void {
    // Optionally load initial preferences from a backend or user profile
  }

  onAllergyAdded(allergy: Tag): void {
    this.preferencesService.addAllergy(allergy);
  }

  onAllergyRemoved(allergy: Tag): void {
    this.preferencesService.removeAllergy(allergy);
  }

  onFavoriteIngredientAdded(ingredient: Tag): void {
    this.preferencesService.addFavoriteIngredient(ingredient);
  }

  onFavoriteIngredientRemoved(ingredient: Tag): void {
    this.preferencesService.removeFavoriteIngredient(ingredient);
  }
}
