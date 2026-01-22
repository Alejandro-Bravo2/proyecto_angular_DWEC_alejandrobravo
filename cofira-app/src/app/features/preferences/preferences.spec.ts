import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';

import { Preferences } from './preferences';
import { PreferencesService } from './services/preferences.service';

interface TagOption {
  label: string;
  value: string;
}

describe('Preferences', () => {
  let component: Preferences;
  let fixture: ComponentFixture<Preferences>;
  let preferencesService: jasmine.SpyObj<PreferencesService>;

  beforeEach(async () => {
    const preferencesServiceSpy = jasmine.createSpyObj('PreferencesService', [
      'addAllergy',
      'removeAllergy',
      'addFavoriteIngredient',
      'removeFavoriteIngredient'
    ]);

    // Add signals to the spy object
    preferencesServiceSpy.allergies = signal<TagOption[]>([]);
    preferencesServiceSpy.favoriteIngredients = signal<TagOption[]>([]);

    await TestBed.configureTestingModule({
      imports: [Preferences],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: PreferencesService, useValue: preferencesServiceSpy }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Preferences);
    component = fixture.componentInstance;
    preferencesService = TestBed.inject(PreferencesService) as jasmine.SpyObj<PreferencesService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have tabs configuration', () => {
    expect(component.tabs.length).toBe(3);
    expect(component.tabs[0].id).toBe('nutrition');
    expect(component.tabs[1].id).toBe('account');
    expect(component.tabs[2].id).toBe('notifications');
  });

  it('should start with nutrition tab active', () => {
    expect(component.activeTab()).toBe('nutrition');
  });

  it('should change active tab', () => {
    component.onTabChanged('account');
    expect(component.activeTab()).toBe('account');

    component.onTabChanged('notifications');
    expect(component.activeTab()).toBe('notifications');
  });

  it('should have available allergies', () => {
    expect(component.availableAllergies.length).toBeGreaterThan(0);
  });

  it('should have available ingredients', () => {
    expect(component.availableIngredients.length).toBeGreaterThan(0);
  });

  describe('onAllergyAdded', () => {
    it('debería llamar al servicio de preferencias para añadir una alergia', () => {
      const alergiaDePrueba: TagOption = { label: 'Lácteos', value: 'lacteos' };

      component.onAllergyAdded(alergiaDePrueba);

      expect(preferencesService.addAllergy).toHaveBeenCalledTimes(1);
      expect(preferencesService.addAllergy).toHaveBeenCalledWith(alergiaDePrueba);
    });

    it('debería llamar al servicio con diferentes alergias correctamente', () => {
      const primeraAlergia: TagOption = { label: 'Gluten', value: 'gluten' };
      const segundaAlergia: TagOption = { label: 'Frutos secos', value: 'frutos_secos' };

      component.onAllergyAdded(primeraAlergia);
      component.onAllergyAdded(segundaAlergia);

      expect(preferencesService.addAllergy).toHaveBeenCalledTimes(2);
      expect(preferencesService.addAllergy).toHaveBeenCalledWith(primeraAlergia);
      expect(preferencesService.addAllergy).toHaveBeenCalledWith(segundaAlergia);
    });
  });

  describe('onAllergyRemoved', () => {
    it('debería llamar al servicio de preferencias para eliminar una alergia', () => {
      const alergiaDePrueba: TagOption = { label: 'Soja', value: 'soja' };

      component.onAllergyRemoved(alergiaDePrueba);

      expect(preferencesService.removeAllergy).toHaveBeenCalledTimes(1);
      expect(preferencesService.removeAllergy).toHaveBeenCalledWith(alergiaDePrueba);
    });

    it('debería llamar al servicio con diferentes alergias a eliminar correctamente', () => {
      const primeraAlergia: TagOption = { label: 'Cacahuete', value: 'cacahuete' };
      const segundaAlergia: TagOption = { label: 'Lácteos', value: 'lacteos' };

      component.onAllergyRemoved(primeraAlergia);
      component.onAllergyRemoved(segundaAlergia);

      expect(preferencesService.removeAllergy).toHaveBeenCalledTimes(2);
      expect(preferencesService.removeAllergy).toHaveBeenCalledWith(primeraAlergia);
      expect(preferencesService.removeAllergy).toHaveBeenCalledWith(segundaAlergia);
    });
  });

  describe('onFavoriteIngredientAdded', () => {
    it('debería llamar al servicio de preferencias para añadir un ingrediente favorito', () => {
      const ingredienteDePrueba: TagOption = { label: 'Pollo', value: 'pollo' };

      component.onFavoriteIngredientAdded(ingredienteDePrueba);

      expect(preferencesService.addFavoriteIngredient).toHaveBeenCalledTimes(1);
      expect(preferencesService.addFavoriteIngredient).toHaveBeenCalledWith(ingredienteDePrueba);
    });

    it('debería llamar al servicio con diferentes ingredientes correctamente', () => {
      const primerIngrediente: TagOption = { label: 'Arroz', value: 'arroz' };
      const segundoIngrediente: TagOption = { label: 'Aguacate', value: 'aguacate' };

      component.onFavoriteIngredientAdded(primerIngrediente);
      component.onFavoriteIngredientAdded(segundoIngrediente);

      expect(preferencesService.addFavoriteIngredient).toHaveBeenCalledTimes(2);
      expect(preferencesService.addFavoriteIngredient).toHaveBeenCalledWith(primerIngrediente);
      expect(preferencesService.addFavoriteIngredient).toHaveBeenCalledWith(segundoIngrediente);
    });
  });

  describe('onFavoriteIngredientRemoved', () => {
    it('debería llamar al servicio de preferencias para eliminar un ingrediente favorito', () => {
      const ingredienteDePrueba: TagOption = { label: 'Salmón', value: 'salmon' };

      component.onFavoriteIngredientRemoved(ingredienteDePrueba);

      expect(preferencesService.removeFavoriteIngredient).toHaveBeenCalledTimes(1);
      expect(preferencesService.removeFavoriteIngredient).toHaveBeenCalledWith(ingredienteDePrueba);
    });

    it('debería llamar al servicio con diferentes ingredientes a eliminar correctamente', () => {
      const primerIngrediente: TagOption = { label: 'Espinacas', value: 'espinacas' };
      const segundoIngrediente: TagOption = { label: 'Pollo', value: 'pollo' };

      component.onFavoriteIngredientRemoved(primerIngrediente);
      component.onFavoriteIngredientRemoved(segundoIngrediente);

      expect(preferencesService.removeFavoriteIngredient).toHaveBeenCalledTimes(2);
      expect(preferencesService.removeFavoriteIngredient).toHaveBeenCalledWith(primerIngrediente);
      expect(preferencesService.removeFavoriteIngredient).toHaveBeenCalledWith(segundoIngrediente);
    });
  });
});
