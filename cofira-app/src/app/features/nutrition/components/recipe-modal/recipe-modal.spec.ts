import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipeModal } from './recipe-modal';
import { IngredienteDTO } from '../../services/nutrition.service';

describe('RecipeModal', () => {
  let component: RecipeModal;
  let fixture: ComponentFixture<RecipeModal>;

  const mockIngredientes: IngredienteDTO[] = [
    { nombre: 'Pollo', cantidad: '200', unidad: 'g', opcional: false },
    { nombre: 'Lechuga', cantidad: '100', unidad: 'g', opcional: false },
    { nombre: 'Parmesano', cantidad: '50', unidad: 'g', opcional: true }
  ];

  const mockPasosPreparacion: string[] = [
    'Cocinar el pollo a la parrilla',
    'Cortar la lechuga en trozos',
    'Mezclar con el aderezo',
    'Añadir el parmesano rallado'
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeModal]
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deberia crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Valores por defecto de inputs', () => {
    it('deberia tener mealName como Plato por defecto', () => {
      expect(component.mealName()).toBe('Plato');
    });

    it('deberia tener descripcion vacia por defecto', () => {
      expect(component.descripcion()).toBe('');
    });

    it('deberia tener tiempoPreparacion como 0 por defecto', () => {
      expect(component.tiempoPreparacion()).toBe(0);
    });

    it('deberia tener porciones como 1 por defecto', () => {
      expect(component.porciones()).toBe(1);
    });

    it('deberia tener dificultad como FACIL por defecto', () => {
      expect(component.dificultad()).toBe('FACIL');
    });

    it('deberia tener ingredientes como array vacio por defecto', () => {
      expect(component.ingredientes()).toEqual([]);
    });

    it('deberia tener pasosPreparacion como array vacio por defecto', () => {
      expect(component.pasosPreparacion()).toEqual([]);
    });

    it('deberia tener foods como array vacio por defecto', () => {
      expect(component.foods()).toEqual([]);
    });
  });

  describe('Inputs personalizados', () => {
    it('deberia establecer mealName correctamente', () => {
      fixture.componentRef.setInput('mealName', 'Ensalada Cesar');
      fixture.detectChanges();
      expect(component.mealName()).toBe('Ensalada Cesar');
    });

    it('deberia establecer descripcion correctamente', () => {
      fixture.componentRef.setInput('descripcion', 'Deliciosa ensalada con pollo');
      fixture.detectChanges();
      expect(component.descripcion()).toBe('Deliciosa ensalada con pollo');
    });

    it('deberia establecer tiempoPreparacion correctamente', () => {
      fixture.componentRef.setInput('tiempoPreparacion', 30);
      fixture.detectChanges();
      expect(component.tiempoPreparacion()).toBe(30);
    });

    it('deberia establecer porciones correctamente', () => {
      fixture.componentRef.setInput('porciones', 4);
      fixture.detectChanges();
      expect(component.porciones()).toBe(4);
    });

    it('deberia establecer dificultad correctamente', () => {
      fixture.componentRef.setInput('dificultad', 'MEDIA');
      fixture.detectChanges();
      expect(component.dificultad()).toBe('MEDIA');
    });

    it('deberia establecer ingredientes correctamente', () => {
      fixture.componentRef.setInput('ingredientes', mockIngredientes);
      fixture.detectChanges();
      expect(component.ingredientes()).toEqual(mockIngredientes);
    });

    it('deberia establecer pasosPreparacion correctamente', () => {
      fixture.componentRef.setInput('pasosPreparacion', mockPasosPreparacion);
      fixture.detectChanges();
      expect(component.pasosPreparacion()).toEqual(mockPasosPreparacion);
    });

    it('deberia establecer foods correctamente', () => {
      const foods = ['Pollo', 'Lechuga', 'Tomate'];
      fixture.componentRef.setInput('foods', foods);
      fixture.detectChanges();
      expect(component.foods()).toEqual(foods);
    });
  });

  describe('Estado de activeTab', () => {
    it('deberia inicializar activeTab como ingredientes', () => {
      expect(component.activeTab()).toBe('ingredientes');
    });
  });

  describe('Metodo setActiveTab', () => {
    it('deberia cambiar activeTab a ingredientes', () => {
      component.activeTab.set('receta');
      component.setActiveTab('ingredientes');
      expect(component.activeTab()).toBe('ingredientes');
    });

    it('deberia cambiar activeTab a receta', () => {
      component.setActiveTab('receta');
      expect(component.activeTab()).toBe('receta');
    });
  });

  describe('Computed: hasRecipe', () => {
    it('deberia devolver false cuando no hay ingredientes ni pasos', () => {
      expect(component.hasRecipe()).toBeFalse();
    });

    it('deberia devolver true cuando hay ingredientes', () => {
      fixture.componentRef.setInput('ingredientes', mockIngredientes);
      fixture.detectChanges();
      expect(component.hasRecipe()).toBeTrue();
    });

    it('deberia devolver true cuando hay pasos de preparacion', () => {
      fixture.componentRef.setInput('pasosPreparacion', mockPasosPreparacion);
      fixture.detectChanges();
      expect(component.hasRecipe()).toBeTrue();
    });

    it('deberia devolver true cuando hay ambos ingredientes y pasos', () => {
      fixture.componentRef.setInput('ingredientes', mockIngredientes);
      fixture.componentRef.setInput('pasosPreparacion', mockPasosPreparacion);
      fixture.detectChanges();
      expect(component.hasRecipe()).toBeTrue();
    });
  });

  describe('Computed: difficultyLabel', () => {
    it('deberia devolver Facil para FACIL', () => {
      fixture.componentRef.setInput('dificultad', 'FACIL');
      fixture.detectChanges();
      expect(component.difficultyLabel()).toBe('Facil');
    });

    it('deberia devolver Media para MEDIA', () => {
      fixture.componentRef.setInput('dificultad', 'MEDIA');
      fixture.detectChanges();
      expect(component.difficultyLabel()).toBe('Media');
    });

    it('deberia devolver Dificil para DIFICIL', () => {
      fixture.componentRef.setInput('dificultad', 'DIFICIL');
      fixture.detectChanges();
      expect(component.difficultyLabel()).toBe('Dificil');
    });

    it('deberia devolver el valor original si no coincide con ninguna clave', () => {
      fixture.componentRef.setInput('dificultad', 'EXPERTO');
      fixture.detectChanges();
      expect(component.difficultyLabel()).toBe('EXPERTO');
    });
  });

  describe('Computed: difficultyClass', () => {
    it('deberia devolver difficulty--easy para FACIL', () => {
      fixture.componentRef.setInput('dificultad', 'FACIL');
      fixture.detectChanges();
      expect(component.difficultyClass()).toBe('difficulty--easy');
    });

    it('deberia devolver difficulty--medium para MEDIA', () => {
      fixture.componentRef.setInput('dificultad', 'MEDIA');
      fixture.detectChanges();
      expect(component.difficultyClass()).toBe('difficulty--medium');
    });

    it('deberia devolver difficulty--hard para DIFICIL', () => {
      fixture.componentRef.setInput('dificultad', 'DIFICIL');
      fixture.detectChanges();
      expect(component.difficultyClass()).toBe('difficulty--hard');
    });

    it('deberia devolver difficulty--easy por defecto si no coincide', () => {
      fixture.componentRef.setInput('dificultad', 'OTRO');
      fixture.detectChanges();
      expect(component.difficultyClass()).toBe('difficulty--easy');
    });
  });

  describe('Integracion de multiples propiedades', () => {
    it('deberia manejar una receta completa correctamente', () => {
      fixture.componentRef.setInput('mealName', 'Ensalada Mediterranea');
      fixture.componentRef.setInput('descripcion', 'Ensalada fresca y saludable');
      fixture.componentRef.setInput('tiempoPreparacion', 15);
      fixture.componentRef.setInput('porciones', 2);
      fixture.componentRef.setInput('dificultad', 'FACIL');
      fixture.componentRef.setInput('ingredientes', mockIngredientes);
      fixture.componentRef.setInput('pasosPreparacion', mockPasosPreparacion);
      fixture.componentRef.setInput('foods', ['Tomate', 'Pepino', 'Aceitunas']);
      fixture.detectChanges();

      expect(component.mealName()).toBe('Ensalada Mediterranea');
      expect(component.descripcion()).toBe('Ensalada fresca y saludable');
      expect(component.tiempoPreparacion()).toBe(15);
      expect(component.porciones()).toBe(2);
      expect(component.hasRecipe()).toBeTrue();
      expect(component.difficultyLabel()).toBe('Facil');
      expect(component.difficultyClass()).toBe('difficulty--easy');
    });
  });

  describe('Cambios de estado', () => {
    it('deberia permitir alternar entre tabs multiples veces', () => {
      expect(component.activeTab()).toBe('ingredientes');

      component.setActiveTab('receta');
      expect(component.activeTab()).toBe('receta');

      component.setActiveTab('ingredientes');
      expect(component.activeTab()).toBe('ingredientes');

      component.setActiveTab('receta');
      expect(component.activeTab()).toBe('receta');
    });
  });

  describe('Casos limite', () => {
    it('deberia manejar ingredientes vacios correctamente', () => {
      fixture.componentRef.setInput('ingredientes', []);
      fixture.componentRef.setInput('pasosPreparacion', []);
      fixture.detectChanges();
      expect(component.hasRecipe()).toBeFalse();
    });

    it('deberia manejar un solo ingrediente', () => {
      fixture.componentRef.setInput('ingredientes', [mockIngredientes[0]]);
      fixture.detectChanges();
      expect(component.hasRecipe()).toBeTrue();
      expect(component.ingredientes().length).toBe(1);
    });

    it('deberia manejar un solo paso de preparacion', () => {
      fixture.componentRef.setInput('pasosPreparacion', ['Unico paso']);
      fixture.detectChanges();
      expect(component.hasRecipe()).toBeTrue();
      expect(component.pasosPreparacion().length).toBe(1);
    });
  });
});
