import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AddMealForm } from './add-meal-form';
import { NutritionService, Meal } from '../../services/nutrition.service';
import { ToastService } from '../../../../core/services/toast.service';
import { of, throwError, delay } from 'rxjs';

describe('AddMealForm', () => {
  let component: AddMealForm;
  let fixture: ComponentFixture<AddMealForm>;
  let mockNutritionService: jasmine.SpyObj<NutritionService>;
  let mockToastService: jasmine.SpyObj<ToastService>;

  const mockMeal: Meal = {
    id: '123',
    userId: 'user1',
    date: '2024-01-15',
    mealType: 'breakfast',
    foods: [{
      icon: '🍽️',
      quantity: '1 porcion',
      name: 'Tostada',
      calories: 150,
      protein: 5,
      carbs: 25,
      fat: 3,
      fiber: 2
    }],
    totalCalories: 150,
    totalProtein: 5,
    totalCarbs: 25,
    totalFat: 3,
    totalFiber: 2
  };

  beforeEach(async () => {
    mockNutritionService = jasmine.createSpyObj('NutritionService', ['addMeal']);
    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);

    await TestBed.configureTestingModule({
      imports: [AddMealForm, ReactiveFormsModule],
      providers: [
        { provide: NutritionService, useValue: mockNutritionService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddMealForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deberia crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Estado inicial', () => {
    it('deberia inicializar showForm como false', () => {
      expect(component.showForm()).toBeFalse();
    });

    it('deberia inicializar isSubmitting como false', () => {
      expect(component.isSubmitting()).toBeFalse();
    });

    it('deberia tener tipos de comida definidos', () => {
      expect(component.mealTypes).toEqual(['breakfast', 'lunch', 'dinner', 'snack']);
    });
  });

  describe('Formulario inicial', () => {
    it('deberia tener mealType como breakfast por defecto', () => {
      expect(component.mealForm.get('mealType')?.value).toBe('breakfast');
    });

    it('deberia tener la fecha actual por defecto', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(component.mealForm.get('date')?.value).toBe(today);
    });

    it('deberia tener un alimento inicial en el array de foods', () => {
      expect(component.foods.length).toBe(1);
    });
  });

  describe('Validaciones del formulario', () => {
    it('deberia requerir mealType', () => {
      component.mealForm.get('mealType')?.setValue('');
      expect(component.mealForm.get('mealType')?.valid).toBeFalse();
    });

    it('deberia requerir date', () => {
      component.mealForm.get('date')?.setValue('');
      expect(component.mealForm.get('date')?.valid).toBeFalse();
    });

    it('deberia requerir nombre del alimento con minimo 2 caracteres', () => {
      const foodGroup = component.foods.at(0);
      foodGroup.get('name')?.setValue('A');
      expect(foodGroup.get('name')?.valid).toBeFalse();

      foodGroup.get('name')?.setValue('AB');
      expect(foodGroup.get('name')?.valid).toBeTrue();
    });

    it('deberia requerir cantidad', () => {
      const foodGroup = component.foods.at(0);
      foodGroup.get('quantity')?.setValue('');
      expect(foodGroup.get('quantity')?.valid).toBeFalse();
    });

    it('deberia requerir calorias con valor minimo 0', () => {
      const foodGroup = component.foods.at(0);
      foodGroup.get('calories')?.setValue(-1);
      expect(foodGroup.get('calories')?.valid).toBeFalse();

      foodGroup.get('calories')?.setValue(0);
      expect(foodGroup.get('calories')?.valid).toBeTrue();
    });

    it('deberia requerir proteinas con valor minimo 0', () => {
      const foodGroup = component.foods.at(0);
      foodGroup.get('protein')?.setValue(-5);
      expect(foodGroup.get('protein')?.valid).toBeFalse();
    });

    it('deberia requerir carbohidratos con valor minimo 0', () => {
      const foodGroup = component.foods.at(0);
      foodGroup.get('carbs')?.setValue(-10);
      expect(foodGroup.get('carbs')?.valid).toBeFalse();
    });

    it('deberia requerir grasas con valor minimo 0', () => {
      const foodGroup = component.foods.at(0);
      foodGroup.get('fat')?.setValue(-3);
      expect(foodGroup.get('fat')?.valid).toBeFalse();
    });

    it('deberia requerir fibra con valor minimo 0', () => {
      const foodGroup = component.foods.at(0);
      foodGroup.get('fiber')?.setValue(-2);
      expect(foodGroup.get('fiber')?.valid).toBeFalse();
    });
  });

  describe('Metodo createFoodItem', () => {
    it('deberia crear un FormGroup con valores por defecto', () => {
      const newFoodItem = component.createFoodItem();

      expect(newFoodItem.get('name')?.value).toBe('');
      expect(newFoodItem.get('quantity')?.value).toBe('');
      expect(newFoodItem.get('calories')?.value).toBe(0);
      expect(newFoodItem.get('protein')?.value).toBe(0);
      expect(newFoodItem.get('carbs')?.value).toBe(0);
      expect(newFoodItem.get('fat')?.value).toBe(0);
      expect(newFoodItem.get('fiber')?.value).toBe(0);
      expect(newFoodItem.get('icon')?.value).toBe('🍽️');
    });
  });

  describe('Metodo addFood', () => {
    it('deberia agregar un nuevo alimento al array', () => {
      const initialLength = component.foods.length;
      component.addFood();
      expect(component.foods.length).toBe(initialLength + 1);
    });

    it('deberia agregar multiples alimentos', () => {
      component.addFood();
      component.addFood();
      component.addFood();
      expect(component.foods.length).toBe(4);
    });
  });

  describe('Metodo removeFood', () => {
    it('deberia eliminar un alimento del array si hay mas de uno', () => {
      component.addFood();
      expect(component.foods.length).toBe(2);

      component.removeFood(0);
      expect(component.foods.length).toBe(1);
    });

    it('deberia no eliminar si solo hay un alimento', () => {
      expect(component.foods.length).toBe(1);
      component.removeFood(0);
      expect(component.foods.length).toBe(1);
    });

    it('deberia eliminar el alimento en el indice correcto', () => {
      component.addFood();
      component.addFood();

      component.foods.at(0).get('name')?.setValue('Primero');
      component.foods.at(1).get('name')?.setValue('Segundo');
      component.foods.at(2).get('name')?.setValue('Tercero');

      component.removeFood(1);

      expect(component.foods.at(0).get('name')?.value).toBe('Primero');
      expect(component.foods.at(1).get('name')?.value).toBe('Tercero');
    });
  });

  describe('Metodo toggleForm', () => {
    it('deberia alternar showForm de false a true', () => {
      expect(component.showForm()).toBeFalse();
      component.toggleForm();
      expect(component.showForm()).toBeTrue();
    });

    it('deberia alternar showForm de true a false', () => {
      component.showForm.set(true);
      component.toggleForm();
      expect(component.showForm()).toBeFalse();
    });

    it('deberia resetear el formulario cuando se cierra', () => {
      component.showForm.set(true);
      component.mealForm.get('mealType')?.setValue('dinner');
      component.addFood();
      component.addFood();

      component.toggleForm();

      expect(component.mealForm.get('mealType')?.value).toBe('breakfast');
      expect(component.foods.length).toBe(1);
    });

    it('deberia no resetear el formulario cuando se abre', () => {
      component.mealForm.get('mealType')?.setValue('lunch');
      component.toggleForm();

      expect(component.mealForm.get('mealType')?.value).toBe('lunch');
    });
  });

  describe('Metodo onSubmit', () => {
    beforeEach(() => {
      // Configurar usuario en localStorage
      localStorage.setItem('currentUser', JSON.stringify({ id: 'user1' }));
    });

    afterEach(() => {
      localStorage.removeItem('currentUser');
    });

    it('deberia no enviar si el formulario es invalido', () => {
      component.foods.at(0).get('name')?.setValue('');
      component.onSubmit();

      expect(mockNutritionService.addMeal).not.toHaveBeenCalled();
    });

    it('deberia marcar todos los campos como tocados si el formulario es invalido', () => {
      spyOn(component.mealForm, 'markAllAsTouched');
      component.foods.at(0).get('name')?.setValue('');

      component.onSubmit();

      expect(component.mealForm.markAllAsTouched).toHaveBeenCalled();
    });

    it('deberia mostrar error si no hay usuario autenticado', () => {
      localStorage.removeItem('currentUser');
      component.foods.at(0).get('name')?.setValue('Huevos');
      component.foods.at(0).get('quantity')?.setValue('2 unidades');

      component.onSubmit();

      expect(mockToastService.error).toHaveBeenCalledWith('Usuario no autenticado');
      expect(component.isSubmitting()).toBeFalse();
    });

    it('deberia enviar el formulario correctamente', fakeAsync(() => {
      mockNutritionService.addMeal.and.returnValue(of(mockMeal));

      component.foods.at(0).get('name')?.setValue('Tostada');
      component.foods.at(0).get('quantity')?.setValue('1 porcion');
      component.foods.at(0).get('calories')?.setValue(150);
      component.foods.at(0).get('protein')?.setValue(5);
      component.foods.at(0).get('carbs')?.setValue(25);
      component.foods.at(0).get('fat')?.setValue(3);
      component.foods.at(0).get('fiber')?.setValue(2);

      component.onSubmit();
      tick();

      expect(mockNutritionService.addMeal).toHaveBeenCalled();
      expect(mockToastService.success).toHaveBeenCalledWith('Comida agregada exitosamente');
    }));

    it('deberia emitir mealAdded cuando se agrega exitosamente', fakeAsync(() => {
      mockNutritionService.addMeal.and.returnValue(of(mockMeal));

      const emittedMeals: Meal[] = [];
      component.mealAdded.subscribe((meal) => {
        emittedMeals.push(meal);
      });

      component.foods.at(0).get('name')?.setValue('Tostada');
      component.foods.at(0).get('quantity')?.setValue('1 porcion');

      component.onSubmit();
      tick();

      expect(emittedMeals).toContain(mockMeal);
    }));

    it('deberia calcular los totales correctamente', fakeAsync(() => {
      mockNutritionService.addMeal.and.returnValue(of(mockMeal));

      component.addFood();
      component.foods.at(0).get('name')?.setValue('Huevos');
      component.foods.at(0).get('quantity')?.setValue('2 unidades');
      component.foods.at(0).get('calories')?.setValue(180);
      component.foods.at(0).get('protein')?.setValue(14);
      component.foods.at(0).get('carbs')?.setValue(2);
      component.foods.at(0).get('fat')?.setValue(12);
      component.foods.at(0).get('fiber')?.setValue(0);

      component.foods.at(1).get('name')?.setValue('Tostada');
      component.foods.at(1).get('quantity')?.setValue('2 rebanadas');
      component.foods.at(1).get('calories')?.setValue(120);
      component.foods.at(1).get('protein')?.setValue(4);
      component.foods.at(1).get('carbs')?.setValue(24);
      component.foods.at(1).get('fat')?.setValue(2);
      component.foods.at(1).get('fiber')?.setValue(2);

      component.onSubmit();
      tick();

      const callArgs = mockNutritionService.addMeal.calls.mostRecent().args[0];
      expect(callArgs.totalCalories).toBe(300);
      expect(callArgs.totalProtein).toBe(18);
      expect(callArgs.totalCarbs).toBe(26);
      expect(callArgs.totalFat).toBe(14);
      expect(callArgs.totalFiber).toBe(2);
    }));

    it('deberia manejar errores durante el envio', fakeAsync(() => {
      mockNutritionService.addMeal.and.returnValue(throwError(() => new Error('Error de servidor')));
      spyOn(console, 'error');

      component.foods.at(0).get('name')?.setValue('Tostada');
      component.foods.at(0).get('quantity')?.setValue('1 porcion');

      component.onSubmit();
      tick();

      expect(mockToastService.error).toHaveBeenCalledWith('Error al agregar la comida');
      expect(component.isSubmitting()).toBeFalse();
    }));

    it('deberia establecer isSubmitting en true durante el envio', fakeAsync(() => {
      // Usamos un delay para simular una peticion asincrona real
      mockNutritionService.addMeal.and.returnValue(of(mockMeal).pipe(delay(100)));

      component.foods.at(0).get('name')?.setValue('Tostada');
      component.foods.at(0).get('quantity')?.setValue('1 porcion');

      component.onSubmit();

      // Inmediatamente despues de llamar onSubmit deberia estar en true
      expect(component.isSubmitting()).toBeTrue();

      tick(100);

      expect(component.isSubmitting()).toBeFalse();
    }));

    it('deberia cerrar el formulario despues de enviar exitosamente', fakeAsync(() => {
      mockNutritionService.addMeal.and.returnValue(of(mockMeal));
      component.showForm.set(true);

      component.foods.at(0).get('name')?.setValue('Tostada');
      component.foods.at(0).get('quantity')?.setValue('1 porcion');

      component.onSubmit();
      tick();

      expect(component.showForm()).toBeFalse();
    }));

    it('deberia no enviar si ya esta enviando', fakeAsync(() => {
      mockNutritionService.addMeal.and.returnValue(of(mockMeal));
      component.isSubmitting.set(true);

      component.foods.at(0).get('name')?.setValue('Tostada');
      component.foods.at(0).get('quantity')?.setValue('1 porcion');

      component.onSubmit();
      tick();

      expect(mockNutritionService.addMeal).not.toHaveBeenCalled();
    }));
  });

  describe('Getter foods', () => {
    it('deberia devolver el FormArray de alimentos', () => {
      expect(component.foods).toBeTruthy();
      expect(component.foods.length).toBe(1);
    });
  });
});
