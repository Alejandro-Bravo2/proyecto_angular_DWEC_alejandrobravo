import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ComponentRef } from '@angular/core';

import { MealSection } from './meal-section';
import { ModalService } from '../../../../core/services/modal.service';
import { FoodItem, IngredienteDTO } from '../../services/nutrition.service';

describe('MealSection', () => {
  let component: MealSection;
  let fixture: ComponentFixture<MealSection>;
  let componentRef: ComponentRef<MealSection>;
  let mockModalService: jasmine.SpyObj<ModalService>;

  const mockFoodItems: FoodItem[] = [
    {
      icon: '🍳',
      quantity: '2 unidades',
      name: 'Huevos',
      calories: 155,
      protein: 13,
      carbs: 1,
      fat: 11,
      fiber: 0,
    },
    {
      icon: '🍞',
      quantity: '2 rebanadas',
      name: 'Pan integral',
      calories: 140,
      protein: 6,
      carbs: 26,
      fat: 2,
      fiber: 4,
    },
  ];

  const mockIngredientes: IngredienteDTO[] = [
    {
      nombre: 'Huevos',
      cantidad: '2',
      unidad: 'unidades',
      opcional: false,
    },
    {
      nombre: 'Pan',
      cantidad: '2',
      unidad: 'rebanadas',
      opcional: false,
    },
  ];

  beforeEach(async () => {
    mockModalService = jasmine.createSpyObj('ModalService', ['open']);

    await TestBed.configureTestingModule({
      imports: [MealSection],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
        { provide: ModalService, useValue: mockModalService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MealSection);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Proveer los inputs required
    componentRef.setInput('title', 'Desayuno');
    componentRef.setInput('mealId', 'meal-1');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct title', () => {
    expect(component.title()).toBe('Desayuno');
  });

  it('should start with empty foods', () => {
    expect(component.isEmpty()).toBeTrue();
    expect(component.foodCount()).toBe(0);
  });

  describe('openIngredientsModal', () => {
    it('should not open modal when foods list is empty', () => {
      componentRef.setInput('foods', []);
      fixture.detectChanges();

      component.openIngredientsModal();

      expect(mockModalService.open).not.toHaveBeenCalled();
    });

    it('should open modal with correct data when foods list has items', () => {
      componentRef.setInput('foods', mockFoodItems);
      componentRef.setInput('descripcion', 'Desayuno saludable');
      componentRef.setInput('tiempoPreparacion', 15);
      componentRef.setInput('porciones', 2);
      componentRef.setInput('dificultad', 'FACIL');
      componentRef.setInput('ingredientes', mockIngredientes);
      componentRef.setInput('pasosPreparacion', ['Paso 1', 'Paso 2']);
      fixture.detectChanges();

      component.openIngredientsModal();

      expect(mockModalService.open).toHaveBeenCalled();
      const callArgs = mockModalService.open.calls.mostRecent().args;
      expect(callArgs[1]).toEqual({
        mealName: 'Desayuno',
        descripcion: 'Desayuno saludable',
        tiempoPreparacion: 15,
        porciones: 2,
        dificultad: 'FACIL',
        ingredientes: mockIngredientes,
        pasosPreparacion: ['Paso 1', 'Paso 2'],
        foods: ['Huevos', 'Pan integral'],
      });
    });

    it('should extract food names correctly', () => {
      componentRef.setInput('foods', mockFoodItems);
      fixture.detectChanges();

      component.openIngredientsModal();

      const callArgs = mockModalService.open.calls.mostRecent().args;
      const modalData = callArgs[1] as any;
      expect(modalData['foods']).toEqual(['Huevos', 'Pan integral']);
    });
  });

  describe('computed properties', () => {
    it('should update isEmpty when foods are added', () => {
      expect(component.isEmpty()).toBeTrue();

      componentRef.setInput('foods', mockFoodItems);
      fixture.detectChanges();

      expect(component.isEmpty()).toBeFalse();
    });

    it('should update foodCount when foods are added', () => {
      expect(component.foodCount()).toBe(0);

      componentRef.setInput('foods', mockFoodItems);
      fixture.detectChanges();

      expect(component.foodCount()).toBe(2);
    });
  });

  describe('trackByFoodName', () => {
    it('should return food name for tracking', () => {
      const foodItem = mockFoodItems[0];
      const result = component.trackByFoodName(0, foodItem);

      expect(result).toBe('Huevos');
    });
  });
});
