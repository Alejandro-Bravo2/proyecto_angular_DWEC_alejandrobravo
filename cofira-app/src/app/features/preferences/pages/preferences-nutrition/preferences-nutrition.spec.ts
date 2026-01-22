import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';

import { PreferencesNutrition } from './preferences-nutrition';
import { PreferencesService } from '../../services/preferences.service';

describe('PreferencesNutrition', () => {
  let component: PreferencesNutrition;
  let fixture: ComponentFixture<PreferencesNutrition>;
  let mockPreferencesService: jasmine.SpyObj<PreferencesService>;

  beforeEach(async () => {
    mockPreferencesService = jasmine.createSpyObj(
      'PreferencesService',
      ['addAllergy', 'removeAllergy', 'addFavoriteIngredient', 'removeFavoriteIngredient'],
      {
        allergies: signal([]),
        favoriteIngredients: signal([]),
      }
    );

    await TestBed.configureTestingModule({
      imports: [PreferencesNutrition],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PreferencesService, useValue: mockPreferencesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PreferencesNutrition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deberia crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('deberia tener 8 alergias disponibles', () => {
    expect(component.availableAllergies.length).toBe(8);
  });

  it('deberia tener las alergias correctas', () => {
    const valoresAlergiasEsperados = [
      'lacteos',
      'gluten',
      'frutos_secos',
      'cacahuete',
      'soja',
      'huevo',
      'marisco',
      'pescado',
    ];
    const valoresAlergiasActuales = component.availableAllergies.map((alergia) => alergia.value);
    expect(valoresAlergiasActuales).toEqual(valoresAlergiasEsperados);
  });

  it('deberia tener las etiquetas de alergias correctas', () => {
    const etiquetasEsperadas = [
      'Lacteos',
      'Gluten',
      'Frutos secos',
      'Cacahuete',
      'Soja',
      'Huevo',
      'Marisco',
      'Pescado',
    ];
    const etiquetasActuales = component.availableAllergies.map((alergia) => alergia.label);
    expect(etiquetasActuales).toEqual(etiquetasEsperadas);
  });

  it('deberia tener 8 ingredientes disponibles', () => {
    expect(component.availableIngredients.length).toBe(8);
  });

  it('deberia tener los ingredientes correctos', () => {
    const valoresIngredientesEsperados = [
      'pollo',
      'arroz',
      'aguacate',
      'espinacas',
      'salmon',
      'huevos',
      'brocoli',
      'avena',
    ];
    const valoresIngredientesActuales = component.availableIngredients.map(
      (ingrediente) => ingrediente.value
    );
    expect(valoresIngredientesActuales).toEqual(valoresIngredientesEsperados);
  });

  it('deberia tener las etiquetas de ingredientes correctas', () => {
    const etiquetasEsperadas = [
      'Pollo',
      'Arroz',
      'Aguacate',
      'Espinacas',
      'Salmon',
      'Huevos',
      'Brocoli',
      'Avena',
    ];
    const etiquetasActuales = component.availableIngredients.map(
      (ingrediente) => ingrediente.label
    );
    expect(etiquetasActuales).toEqual(etiquetasEsperadas);
  });

  it('deberia llamar a addAllergy del servicio cuando se anade una alergia', () => {
    const alergiaNueva = { label: 'Gluten', value: 'gluten' };
    component.onAllergyAdded(alergiaNueva);
    expect(mockPreferencesService.addAllergy).toHaveBeenCalledWith(alergiaNueva);
  });

  it('deberia llamar a removeAllergy del servicio cuando se elimina una alergia', () => {
    const alergiaEliminar = { label: 'Lacteos', value: 'lacteos' };
    component.onAllergyRemoved(alergiaEliminar);
    expect(mockPreferencesService.removeAllergy).toHaveBeenCalledWith(alergiaEliminar);
  });

  it('deberia llamar a addFavoriteIngredient del servicio cuando se anade un ingrediente favorito', () => {
    const ingredienteNuevo = { label: 'Pollo', value: 'pollo' };
    component.onFavoriteIngredientAdded(ingredienteNuevo);
    expect(mockPreferencesService.addFavoriteIngredient).toHaveBeenCalledWith(ingredienteNuevo);
  });

  it('deberia llamar a removeFavoriteIngredient del servicio cuando se elimina un ingrediente favorito', () => {
    const ingredienteEliminar = { label: 'Arroz', value: 'arroz' };
    component.onFavoriteIngredientRemoved(ingredienteEliminar);
    expect(mockPreferencesService.removeFavoriteIngredient).toHaveBeenCalledWith(
      ingredienteEliminar
    );
  });

  it('deberia inyectar el PreferencesService correctamente', () => {
    expect(component.preferencesService).toBeTruthy();
  });

  it('deberia ser un componente standalone', () => {
    const esStandalone = (PreferencesNutrition as any).ɵcmp?.standalone;
    expect(esStandalone).toBeTrue();
  });

  it('deberia manejar multiples adiciones de alergias', () => {
    const alergia1 = { label: 'Gluten', value: 'gluten' };
    const alergia2 = { label: 'Lacteos', value: 'lacteos' };

    component.onAllergyAdded(alergia1);
    component.onAllergyAdded(alergia2);

    expect(mockPreferencesService.addAllergy).toHaveBeenCalledTimes(2);
    expect(mockPreferencesService.addAllergy).toHaveBeenCalledWith(alergia1);
    expect(mockPreferencesService.addAllergy).toHaveBeenCalledWith(alergia2);
  });

  it('deberia manejar multiples adiciones de ingredientes favoritos', () => {
    const ingrediente1 = { label: 'Pollo', value: 'pollo' };
    const ingrediente2 = { label: 'Salmon', value: 'salmon' };

    component.onFavoriteIngredientAdded(ingrediente1);
    component.onFavoriteIngredientAdded(ingrediente2);

    expect(mockPreferencesService.addFavoriteIngredient).toHaveBeenCalledTimes(2);
    expect(mockPreferencesService.addFavoriteIngredient).toHaveBeenCalledWith(ingrediente1);
    expect(mockPreferencesService.addFavoriteIngredient).toHaveBeenCalledWith(ingrediente2);
  });
});
