import { TestBed } from '@angular/core/testing';
import { PreferencesService } from './preferences.service';

describe('PreferencesService', () => {
  let service: PreferencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PreferencesService],
    });

    service = TestBed.inject(PreferencesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('allergies', () => {
    it('should initialize with empty allergies array', () => {
      expect(service.allergies()).toEqual([]);
    });

    it('should add an allergy', () => {
      const allergy = { label: 'Gluten', value: 'gluten' };

      service.addAllergy(allergy);

      expect(service.allergies()).toContain(allergy);
      expect(service.allergies().length).toBe(1);
    });

    it('should not add duplicate allergy', () => {
      const allergy = { label: 'Gluten', value: 'gluten' };

      service.addAllergy(allergy);
      service.addAllergy(allergy);

      expect(service.allergies().length).toBe(1);
    });

    it('should add multiple different allergies', () => {
      const allergy1 = { label: 'Gluten', value: 'gluten' };
      const allergy2 = { label: 'Lactosa', value: 'lactosa' };
      const allergy3 = { label: 'Frutos secos', value: 'frutos_secos' };

      service.addAllergy(allergy1);
      service.addAllergy(allergy2);
      service.addAllergy(allergy3);

      expect(service.allergies().length).toBe(3);
    });

    it('should remove an allergy', () => {
      const allergy1 = { label: 'Gluten', value: 'gluten' };
      const allergy2 = { label: 'Lactosa', value: 'lactosa' };

      service.addAllergy(allergy1);
      service.addAllergy(allergy2);
      service.removeAllergy(allergy1);

      expect(service.allergies().length).toBe(1);
      expect(service.allergies()).not.toContain(allergy1);
      expect(service.allergies()).toContain(allergy2);
    });

    it('should handle removing non-existent allergy gracefully', () => {
      const allergy1 = { label: 'Gluten', value: 'gluten' };
      const nonExistent = { label: 'Mariscos', value: 'mariscos' };

      service.addAllergy(allergy1);
      service.removeAllergy(nonExistent);

      expect(service.allergies().length).toBe(1);
    });
  });

  describe('favoriteIngredients', () => {
    it('should initialize with empty favorite ingredients array', () => {
      expect(service.favoriteIngredients()).toEqual([]);
    });

    it('should add a favorite ingredient', () => {
      const ingredient = { label: 'Pollo', value: 'pollo' };

      service.addFavoriteIngredient(ingredient);

      expect(service.favoriteIngredients()).toContain(ingredient);
      expect(service.favoriteIngredients().length).toBe(1);
    });

    it('should not add duplicate favorite ingredient', () => {
      const ingredient = { label: 'Pollo', value: 'pollo' };

      service.addFavoriteIngredient(ingredient);
      service.addFavoriteIngredient(ingredient);

      expect(service.favoriteIngredients().length).toBe(1);
    });

    it('should add multiple different favorite ingredients', () => {
      const ingredient1 = { label: 'Pollo', value: 'pollo' };
      const ingredient2 = { label: 'Arroz', value: 'arroz' };
      const ingredient3 = { label: 'Brocoli', value: 'brocoli' };

      service.addFavoriteIngredient(ingredient1);
      service.addFavoriteIngredient(ingredient2);
      service.addFavoriteIngredient(ingredient3);

      expect(service.favoriteIngredients().length).toBe(3);
    });

    it('should remove a favorite ingredient', () => {
      const ingredient1 = { label: 'Pollo', value: 'pollo' };
      const ingredient2 = { label: 'Arroz', value: 'arroz' };

      service.addFavoriteIngredient(ingredient1);
      service.addFavoriteIngredient(ingredient2);
      service.removeFavoriteIngredient(ingredient1);

      expect(service.favoriteIngredients().length).toBe(1);
      expect(service.favoriteIngredients()).not.toContain(ingredient1);
      expect(service.favoriteIngredients()).toContain(ingredient2);
    });

    it('should handle removing non-existent ingredient gracefully', () => {
      const ingredient1 = { label: 'Pollo', value: 'pollo' };
      const nonExistent = { label: 'Salmon', value: 'salmon' };

      service.addFavoriteIngredient(ingredient1);
      service.removeFavoriteIngredient(nonExistent);

      expect(service.favoriteIngredients().length).toBe(1);
    });
  });

  describe('combined operations', () => {
    it('should manage allergies and ingredients independently', () => {
      const allergy = { label: 'Gluten', value: 'gluten' };
      const ingredient = { label: 'Pollo', value: 'pollo' };

      service.addAllergy(allergy);
      service.addFavoriteIngredient(ingredient);

      expect(service.allergies().length).toBe(1);
      expect(service.favoriteIngredients().length).toBe(1);

      service.removeAllergy(allergy);

      expect(service.allergies().length).toBe(0);
      expect(service.favoriteIngredients().length).toBe(1);
    });
  });

  describe('Cobertura adicional - casos edge', () => {
    it('should handle adding allergy with same value but different label', () => {
      const allergy1 = { label: 'Gluten', value: 'gluten' };
      const allergy2 = { label: 'Gluten Sensitivity', value: 'gluten' };

      service.addAllergy(allergy1);
      service.addAllergy(allergy2);

      // Solo debe existir una alergia ya que el value es el mismo
      expect(service.allergies().length).toBe(1);
    });

    it('should handle adding ingredient with same value but different label', () => {
      const ingredient1 = { label: 'Pollo', value: 'pollo' };
      const ingredient2 = { label: 'Chicken', value: 'pollo' };

      service.addFavoriteIngredient(ingredient1);
      service.addFavoriteIngredient(ingredient2);

      // Solo debe existir un ingrediente ya que el value es el mismo
      expect(service.favoriteIngredients().length).toBe(1);
    });

    it('should maintain correct order when removing middle allergy', () => {
      const allergy1 = { label: 'Gluten', value: 'gluten' };
      const allergy2 = { label: 'Lactosa', value: 'lactosa' };
      const allergy3 = { label: 'Frutos secos', value: 'frutos_secos' };

      service.addAllergy(allergy1);
      service.addAllergy(allergy2);
      service.addAllergy(allergy3);

      service.removeAllergy(allergy2);

      const currentAllergies = service.allergies();
      expect(currentAllergies.length).toBe(2);
      expect(currentAllergies[0]).toEqual(allergy1);
      expect(currentAllergies[1]).toEqual(allergy3);
    });

    it('should maintain correct order when removing middle ingredient', () => {
      const ingredient1 = { label: 'Pollo', value: 'pollo' };
      const ingredient2 = { label: 'Arroz', value: 'arroz' };
      const ingredient3 = { label: 'Brocoli', value: 'brocoli' };

      service.addFavoriteIngredient(ingredient1);
      service.addFavoriteIngredient(ingredient2);
      service.addFavoriteIngredient(ingredient3);

      service.removeFavoriteIngredient(ingredient2);

      const currentIngredients = service.favoriteIngredients();
      expect(currentIngredients.length).toBe(2);
      expect(currentIngredients[0]).toEqual(ingredient1);
      expect(currentIngredients[1]).toEqual(ingredient3);
    });

    it('should handle removing all allergies one by one', () => {
      const allergy1 = { label: 'Gluten', value: 'gluten' };
      const allergy2 = { label: 'Lactosa', value: 'lactosa' };
      const allergy3 = { label: 'Frutos secos', value: 'frutos_secos' };

      service.addAllergy(allergy1);
      service.addAllergy(allergy2);
      service.addAllergy(allergy3);

      expect(service.allergies().length).toBe(3);

      service.removeAllergy(allergy1);
      expect(service.allergies().length).toBe(2);

      service.removeAllergy(allergy2);
      expect(service.allergies().length).toBe(1);

      service.removeAllergy(allergy3);
      expect(service.allergies().length).toBe(0);
    });

    it('should handle removing all ingredients one by one', () => {
      const ingredient1 = { label: 'Pollo', value: 'pollo' };
      const ingredient2 = { label: 'Arroz', value: 'arroz' };
      const ingredient3 = { label: 'Brocoli', value: 'brocoli' };

      service.addFavoriteIngredient(ingredient1);
      service.addFavoriteIngredient(ingredient2);
      service.addFavoriteIngredient(ingredient3);

      expect(service.favoriteIngredients().length).toBe(3);

      service.removeFavoriteIngredient(ingredient1);
      expect(service.favoriteIngredients().length).toBe(2);

      service.removeFavoriteIngredient(ingredient2);
      expect(service.favoriteIngredients().length).toBe(1);

      service.removeFavoriteIngredient(ingredient3);
      expect(service.favoriteIngredients().length).toBe(0);
    });

    it('should handle multiple operations in sequence', () => {
      const allergy1 = { label: 'Gluten', value: 'gluten' };
      const allergy2 = { label: 'Lactosa', value: 'lactosa' };
      const ingredient1 = { label: 'Pollo', value: 'pollo' };
      const ingredient2 = { label: 'Arroz', value: 'arroz' };

      // Agregar alergias
      service.addAllergy(allergy1);
      service.addAllergy(allergy2);
      expect(service.allergies().length).toBe(2);

      // Agregar ingredientes
      service.addFavoriteIngredient(ingredient1);
      service.addFavoriteIngredient(ingredient2);
      expect(service.favoriteIngredients().length).toBe(2);

      // Remover una alergia
      service.removeAllergy(allergy1);
      expect(service.allergies().length).toBe(1);
      expect(service.favoriteIngredients().length).toBe(2);

      // Agregar alergia de nuevo
      service.addAllergy(allergy1);
      expect(service.allergies().length).toBe(2);

      // Remover un ingrediente
      service.removeFavoriteIngredient(ingredient1);
      expect(service.favoriteIngredients().length).toBe(1);

      // Remover todas las alergias
      service.removeAllergy(allergy1);
      service.removeAllergy(allergy2);
      expect(service.allergies().length).toBe(0);
      expect(service.favoriteIngredients().length).toBe(1);
    });

    it('should not modify original arrays when updating', () => {
      const allergy1 = { label: 'Gluten', value: 'gluten' };
      const allergy2 = { label: 'Lactosa', value: 'lactosa' };

      service.addAllergy(allergy1);
      const allergiesBeforeAdd = service.allergies();

      service.addAllergy(allergy2);
      const allergiesAfterAdd = service.allergies();

      // Los arrays deben ser diferentes referencias (inmutables)
      expect(allergiesBeforeAdd).not.toBe(allergiesAfterAdd);
    });

    it('should handle empty string values', () => {
      const allergyEmpty = { label: 'Empty', value: '' };
      const ingredientEmpty = { label: 'Empty', value: '' };

      service.addAllergy(allergyEmpty);
      service.addFavoriteIngredient(ingredientEmpty);

      expect(service.allergies().length).toBe(1);
      expect(service.favoriteIngredients().length).toBe(1);

      service.removeAllergy(allergyEmpty);
      service.removeFavoriteIngredient(ingredientEmpty);

      expect(service.allergies().length).toBe(0);
      expect(service.favoriteIngredients().length).toBe(0);
    });

    it('should handle special characters in values', () => {
      const allergy = { label: 'Test', value: 'test-value_123!@#' };
      const ingredient = { label: 'Test', value: 'test-value_456!@#' };

      service.addAllergy(allergy);
      service.addFavoriteIngredient(ingredient);

      expect(service.allergies()).toContain(allergy);
      expect(service.favoriteIngredients()).toContain(ingredient);
    });
  });
});
