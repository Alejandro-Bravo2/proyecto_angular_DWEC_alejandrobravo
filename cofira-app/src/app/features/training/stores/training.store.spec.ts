import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TrainingStore } from './training.store';
import { TrainingService, Exercise } from '../services/training.service';
import { ToastService } from '../../../core/services/toast.service';
import { of, throwError, Subject } from 'rxjs';

describe('TrainingStore', () => {
  let store: TrainingStore;
  let trainingServiceSpy: jasmine.SpyObj<TrainingService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  const mockExercise: Exercise = {
    id: '1',
    userId: 'user-123',
    name: 'Press de banca',
    sets: 4,
    reps: '10-12',
    restSeconds: 90,
    description: 'Ejercicio de pecho',
    muscleGroup: 'Pecho',
    completed: false,
    date: '2024-01-15',
    notes: '',
  };

  const mockExercise2: Exercise = {
    id: '2',
    userId: 'user-123',
    name: 'Sentadillas',
    sets: 5,
    reps: '8-10',
    restSeconds: 120,
    muscleGroup: 'Piernas',
    completed: false,
    date: '2024-01-15',
  };

  const mockDays = ['LUNES', 'MIERCOLES', 'VIERNES'];

  beforeEach(() => {
    const trainingSpy = jasmine.createSpyObj('TrainingService', [
      'getExercisesByDay',
      'getAvailableTrainingDays',
    ]);
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    TestBed.configureTestingModule({
      providers: [
        TrainingStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TrainingService, useValue: trainingSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    });

    trainingServiceSpy = TestBed.inject(TrainingService) as jasmine.SpyObj<TrainingService>;
    toastServiceSpy = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    store = TestBed.inject(TrainingStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty exercises', () => {
      expect(store.exercises()).toEqual([]);
    });

    it('should have loading as false', () => {
      expect(store.loading()).toBeFalse();
    });

    it('should have error as null', () => {
      expect(store.error()).toBeNull();
    });

    it('should have empty searchTerm', () => {
      expect(store.searchTerm()).toBe('');
    });

    it('should have currentPage as 1', () => {
      expect(store.currentPage()).toBe(1);
    });

    it('should have viewMode as pagination', () => {
      expect(store.viewMode()).toBe('pagination');
    });
  });

  describe('computed: totalExercises', () => {
    it('should return 0 for empty exercises', () => {
      expect(store.totalExercises()).toBe(0);
    });
  });

  describe('computed: completedExercises', () => {
    it('should return 0 when no exercises completed', () => {
      store.add(mockExercise);

      expect(store.completedExercises()).toBe(0);
    });

    it('should count completed exercises', () => {
      store.add({ ...mockExercise, completed: true });
      store.add(mockExercise2);

      expect(store.completedExercises()).toBe(1);
    });
  });

  describe('computed: completionPercentage', () => {
    it('should return 0 when no exercises', () => {
      expect(store.completionPercentage()).toBe(0);
    });

    it('should calculate percentage correctly', () => {
      store.add({ ...mockExercise, completed: true });
      store.add(mockExercise2);

      expect(store.completionPercentage()).toBe(50);
    });

    it('should return 100 when all completed', () => {
      store.add({ ...mockExercise, completed: true });
      store.add({ ...mockExercise2, completed: true });

      expect(store.completionPercentage()).toBe(100);
    });
  });

  describe('computed: isEmpty', () => {
    it('should return true when no exercises and not loading', () => {
      expect(store.isEmpty()).toBeTrue();
    });
  });

  describe('add', () => {
    it('should add exercise to list', () => {
      store.add(mockExercise);

      expect(store.exercises().length).toBe(1);
      expect(store.exercises()[0]).toEqual(mockExercise);
      expect(toastServiceSpy.success).toHaveBeenCalledWith('Ejercicio agregado');
    });

    it('should add multiple exercises', () => {
      store.add(mockExercise);
      store.add(mockExercise2);

      expect(store.exercises().length).toBe(2);
    });
  });

  describe('update', () => {
    it('should update existing exercise', () => {
      store.add(mockExercise);

      const updatedExercise = { ...mockExercise, name: 'Press inclinado' };
      store.update(updatedExercise);

      expect(store.exercises()[0].name).toBe('Press inclinado');
    });

    it('should not modify other exercises', () => {
      store.add(mockExercise);
      store.add(mockExercise2);

      const updatedExercise = { ...mockExercise, name: 'Press inclinado' };
      store.update(updatedExercise);

      expect(store.exercises()[1]).toEqual(mockExercise2);
    });
  });

  describe('remove', () => {
    it('should remove exercise by id', () => {
      store.add(mockExercise);
      store.add(mockExercise2);

      store.remove('1');

      expect(store.exercises().length).toBe(1);
      expect(store.exercises()[0].id).toBe('2');
      expect(toastServiceSpy.success).toHaveBeenCalledWith('Ejercicio eliminado');
    });
  });

  describe('toggleComplete', () => {
    it('should toggle completion status', () => {
      store.add(mockExercise);

      store.toggleComplete('1');

      expect(store.exercises()[0].completed).toBeTrue();
    });

    it('should toggle back to incomplete', () => {
      store.add({ ...mockExercise, completed: true });

      store.toggleComplete('1');

      expect(store.exercises()[0].completed).toBeFalse();
    });
  });

  describe('completeAll', () => {
    it('should mark all exercises as completed', () => {
      store.add(mockExercise);
      store.add(mockExercise2);

      store.completeAll();

      expect(store.exercises()[0].completed).toBeTrue();
      expect(store.exercises()[1].completed).toBeTrue();
      expect(toastServiceSpy.success).toHaveBeenCalledWith('Todos los ejercicios completados');
    });
  });

  describe('search and filter', () => {
    beforeEach(() => {
      store.add(mockExercise);
      store.add(mockExercise2);
    });

    it('should set search term', () => {
      store.setSearchTerm('banca');

      expect(store.searchTerm()).toBe('banca');
      expect(store.currentPage()).toBe(1);
    });

    it('should filter exercises by name', () => {
      store.setSearchTerm('banca');

      expect(store.filteredExercises().length).toBe(1);
      expect(store.filteredExercises()[0].name).toBe('Press de banca');
    });

    it('should filter exercises by reps', () => {
      store.setSearchTerm('10-12');

      expect(store.filteredExercises().length).toBe(1);
    });

    it('should clear search', () => {
      store.setSearchTerm('banca');
      store.clearSearch();

      expect(store.searchTerm()).toBe('');
      expect(store.filteredExercises().length).toBe(2);
    });
  });

  describe('pagination', () => {
    it('should go to next page', () => {
      for (let i = 0; i < 15; i++) {
        store.add({ ...mockExercise, id: `exercise-${i}` });
      }

      store.nextPage();

      expect(store.currentPage()).toBe(2);
    });

    it('should not go past last page', () => {
      store.add(mockExercise);

      store.nextPage();

      expect(store.currentPage()).toBe(1);
    });

    it('should go to previous page', () => {
      for (let i = 0; i < 15; i++) {
        store.add({ ...mockExercise, id: `exercise-${i}` });
      }
      store.nextPage();

      store.previousPage();

      expect(store.currentPage()).toBe(1);
    });

    it('should not go below page 1', () => {
      store.previousPage();

      expect(store.currentPage()).toBe(1);
    });

    it('should go to specific page', () => {
      for (let i = 0; i < 25; i++) {
        store.add({ ...mockExercise, id: `exercise-${i}` });
      }

      store.goToPage(3);

      expect(store.currentPage()).toBe(3);
    });

    it('should not go to invalid page', () => {
      store.add(mockExercise);

      store.goToPage(10);

      expect(store.currentPage()).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear all state', () => {
      store.add(mockExercise);
      store.setSearchTerm('test');

      store.clear();

      expect(store.exercises()).toEqual([]);
      expect(store.loading()).toBeFalse();
      expect(store.searchTerm()).toBe('');
      expect(store.currentPage()).toBe(1);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      store.clearError();

      expect(store.error()).toBeNull();
    });
  });

  describe('computed: hasResults', () => {
    it('should return true when there are results', () => {
      store.add(mockExercise);

      expect(store.hasResults()).toBeTrue();
    });

    it('should return false when no results after filter', () => {
      store.add(mockExercise);
      store.setSearchTerm('nonexistent');

      expect(store.hasResults()).toBeFalse();
    });
  });

  describe('view mode', () => {
    it('should have default pagination mode', () => {
      expect(store.viewMode()).toBe('pagination');
    });

    it('should change to infinite scroll mode', fakeAsync(() => {
      store.add(mockExercise);

      store.setViewMode('infinite');
      tick(500);

      expect(store.viewMode()).toBe('infinite');
    }));
  });

  describe('load', () => {
    it('should load available days and exercises', fakeAsync(() => {
      trainingServiceSpy.getAvailableTrainingDays.and.returnValue(of(mockDays));
      trainingServiceSpy.getExercisesByDay.and.returnValue(of([mockExercise, mockExercise2]));

      store.load('user-123');
      tick();

      expect(store.availableDays()).toEqual(mockDays);
      expect(store.hasRoutines()).toBeTrue();
      expect(store.exercises().length).toBe(2);
    }));

    it('should handle error loading days', fakeAsync(() => {
      trainingServiceSpy.getAvailableTrainingDays.and.returnValue(
        throwError(() => new Error('Error'))
      );
      trainingServiceSpy.getExercisesByDay.and.returnValue(of([]));

      store.load('user-123');
      tick();

      expect(store.availableDays()).toEqual([]);
      expect(store.hasRoutines()).toBeFalse();
    }));
  });

  describe('day navigation', () => {
    beforeEach(fakeAsync(() => {
      trainingServiceSpy.getAvailableTrainingDays.and.returnValue(of(mockDays));
      trainingServiceSpy.getExercisesByDay.and.returnValue(of([mockExercise]));

      store.load('user-123');
      tick();
    }));

    it('should select a specific day', fakeAsync(() => {
      store.selectDay('user-123', 'MIERCOLES');
      tick();

      expect(store.selectedDay()).toBe('MIERCOLES');
    }));

    it('should go to previous day', fakeAsync(() => {
      store.selectDay('user-123', 'MIERCOLES');
      tick();

      store.previousDay('user-123');
      tick();

      expect(store.selectedDay()).toBe('LUNES');
    }));

    it('should not go past first day', fakeAsync(() => {
      store.selectDay('user-123', 'LUNES');
      tick();

      store.previousDay('user-123');
      tick();

      expect(store.selectedDay()).toBe('LUNES');
    }));

    it('should go to next day', fakeAsync(() => {
      store.selectDay('user-123', 'LUNES');
      tick();

      store.nextDay('user-123');
      tick();

      expect(store.selectedDay()).toBe('MIERCOLES');
    }));

    it('should not go past last day', fakeAsync(() => {
      store.selectDay('user-123', 'VIERNES');
      tick();

      store.nextDay('user-123');
      tick();

      expect(store.selectedDay()).toBe('VIERNES');
    }));
  });

  // ==========================================
  // PRUEBAS ADICIONALES DE PAGINACIÓN
  // ==========================================

  describe('computed: totalPages', () => {
    it('debe calcular correctamente el total de páginas', () => {
      for (let i = 0; i < 25; i++) {
        store.add({ ...mockExercise, id: `exercise-${i}` });
      }

      expect(store.totalPages()).toBe(3);
    });

    it('debe retornar 0 cuando no hay ejercicios', () => {
      expect(store.totalPages()).toBe(0);
    });

    it('debe retornar 1 cuando hay menos ejercicios que el tamaño de página', () => {
      store.add(mockExercise);
      store.add(mockExercise2);

      expect(store.totalPages()).toBe(1);
    });
  });

  describe('computed: paginatedExercises', () => {
    it('debe retornar ejercicios paginados correctamente', () => {
      for (let i = 0; i < 25; i++) {
        store.add({ ...mockExercise, id: `exercise-${i}`, name: `Exercise ${i}` });
      }

      const firstPageExercises = store.paginatedExercises();
      expect(firstPageExercises.length).toBe(10);
      expect(firstPageExercises[0].id).toBe('exercise-0');
    });

    it('debe retornar ejercicios de la página actual', () => {
      for (let i = 0; i < 25; i++) {
        store.add({ ...mockExercise, id: `exercise-${i}`, name: `Exercise ${i}` });
      }

      store.goToPage(2);

      const secondPageExercises = store.paginatedExercises();
      expect(secondPageExercises.length).toBe(10);
      expect(secondPageExercises[0].id).toBe('exercise-10');
    });

    it('debe retornar menos ejercicios en la última página si no hay suficientes', () => {
      for (let i = 0; i < 25; i++) {
        store.add({ ...mockExercise, id: `exercise-${i}`, name: `Exercise ${i}` });
      }

      store.goToPage(3);

      const lastPageExercises = store.paginatedExercises();
      expect(lastPageExercises.length).toBe(5);
    });

    it('debe respetar el filtro de búsqueda en la paginación', () => {
      for (let i = 0; i < 25; i++) {
        store.add({ ...mockExercise, id: `exercise-${i}`, name: `Exercise ${i}` });
      }
      store.add({ ...mockExercise2, id: 'sentadilla-especial', name: 'Sentadillas especiales' });

      store.setSearchTerm('sentadilla');

      const filteredPaginatedExercises = store.paginatedExercises();
      expect(filteredPaginatedExercises.length).toBe(1);
      expect(filteredPaginatedExercises[0].name).toContain('Sentadillas');
    });
  });

  // ==========================================
  // PRUEBAS DE INFINITE SCROLL
  // ==========================================

  describe('infinite scroll', () => {
    it('debe cargar más elementos cuando se llama a loadMore', fakeAsync(() => {
      for (let i = 0; i < 25; i++) {
        store.add({ ...mockExercise, id: `exercise-${i}` });
      }

      store.setViewMode('infinite');
      tick(500);

      expect(store.infiniteScrollItems().length).toBe(10);

      store.loadMore();
      tick(500);

      expect(store.infiniteScrollItems().length).toBe(20);
    }));

    it('debe indicar cuando hay más elementos para cargar', fakeAsync(() => {
      for (let i = 0; i < 25; i++) {
        store.add({ ...mockExercise, id: `exercise-${i}` });
      }

      store.setViewMode('infinite');
      tick(500);

      expect(store.hasMore()).toBeTrue();

      store.loadMore();
      tick(500);
      store.loadMore();
      tick(500);

      expect(store.hasMore()).toBeFalse();
    }));

    it('no debe cargar más elementos si ya no hay más', fakeAsync(() => {
      for (let i = 0; i < 15; i++) {
        store.add({ ...mockExercise, id: `exercise-${i}` });
      }

      store.setViewMode('infinite');
      tick(500);

      store.loadMore();
      tick(500);

      const itemsBeforeExtraLoad = store.infiniteScrollItems().length;

      store.loadMore();
      tick(500);

      expect(store.infiniteScrollItems().length).toBe(itemsBeforeExtraLoad);
    }));

    it('debe indicar cuando está cargando más elementos', fakeAsync(() => {
      for (let i = 0; i < 25; i++) {
        store.add({ ...mockExercise, id: `exercise-${i}` });
      }

      store.setViewMode('infinite');
      tick(500);

      store.loadMore();

      expect(store.isLoadingMore()).toBeTrue();

      tick(500);

      expect(store.isLoadingMore()).toBeFalse();
    }));

    it('no debe cargar más elementos si viewMode es pagination', fakeAsync(() => {
      for (let i = 0; i < 25; i++) {
        store.add({ ...mockExercise, id: `exercise-${i}` });
      }

      // viewMode está en 'pagination' por defecto
      store.loadMore();
      tick(500);

      expect(store.infiniteScrollItems().length).toBe(0);
    }));

    it('debe filtrar elementos de infinite scroll por búsqueda', fakeAsync(() => {
      // Agregar el item buscado primero para que esté en la primera página
      store.add({ ...mockExercise2, id: 'sentadilla-1', name: 'Sentadillas especiales' });
      for (let i = 0; i < 5; i++) {
        store.add({ ...mockExercise, id: `exercise-${i}`, name: `Exercise ${i}` });
      }

      store.setViewMode('infinite');
      tick(500);

      store.setSearchTerm('sentadilla');

      const filteredItems = store.infiniteScrollItems();
      expect(filteredItems.length).toBe(1);
      expect(filteredItems[0]?.name).toContain('Sentadillas');
    }));
  });

  // ==========================================
  // PRUEBAS DE REFRESH Y CARGA
  // ==========================================

  describe('refresh', () => {
    it('debe recargar los ejercicios', fakeAsync(() => {
      trainingServiceSpy.getAvailableTrainingDays.and.returnValue(of(mockDays));
      trainingServiceSpy.getExercisesByDay.and.returnValue(of([mockExercise]));

      store.refresh('user-123');
      tick();

      expect(trainingServiceSpy.getAvailableTrainingDays).toHaveBeenCalled();
      expect(trainingServiceSpy.getExercisesByDay).toHaveBeenCalled();
    }));

    it('debe pasar la fecha al recargar si se proporciona', fakeAsync(() => {
      trainingServiceSpy.getAvailableTrainingDays.and.returnValue(of(mockDays));
      trainingServiceSpy.getExercisesByDay.and.returnValue(of([mockExercise]));

      const dateToLoad = '2024-01-20';
      store.refresh('user-123', dateToLoad);
      tick();

      expect(trainingServiceSpy.getAvailableTrainingDays).toHaveBeenCalled();
    }));
  });

  // ==========================================
  // PRUEBAS DE MANEJO DE ERRORES
  // ==========================================

  describe('error handling', () => {
    it('debe manejar error al cargar ejercicios', fakeAsync(() => {
      trainingServiceSpy.getAvailableTrainingDays.and.returnValue(of(mockDays));
      trainingServiceSpy.getExercisesByDay.and.returnValue(
        throwError(() => new Error('Error al cargar ejercicios'))
      );

      store.load('user-123');
      tick();

      expect(store.error()).toBe('Error al cargar los ejercicios');
      expect(store.exercises()).toEqual([]);
    }));

    it('debe establecer loading en false después de un error', fakeAsync(() => {
      trainingServiceSpy.getAvailableTrainingDays.and.returnValue(of(mockDays));
      trainingServiceSpy.getExercisesByDay.and.returnValue(
        throwError(() => new Error('Error'))
      );

      store.load('user-123');
      tick();

      expect(store.loading()).toBeFalse();
    }));

    it('debe restablecer error cuando se carga con éxito después de un error', fakeAsync(() => {
      trainingServiceSpy.getAvailableTrainingDays.and.returnValue(of(mockDays));
      trainingServiceSpy.getExercisesByDay.and.returnValue(
        throwError(() => new Error('Error'))
      );

      store.load('user-123');
      tick();

      expect(store.error()).toBe('Error al cargar los ejercicios');

      // Ahora carga con éxito
      trainingServiceSpy.getExercisesByDay.and.returnValue(of([mockExercise]));
      store.refresh('user-123');
      tick();

      expect(store.error()).toBeNull();
    }));
  });

  // ==========================================
  // PRUEBAS DE CASOS EXTREMOS
  // ==========================================

  describe('edge cases', () => {
    it('debe manejar búsqueda con espacios en blanco', () => {
      store.add(mockExercise);
      store.add(mockExercise2);

      store.setSearchTerm('   ');

      expect(store.filteredExercises().length).toBe(2);
    });

    it('debe manejar búsqueda case-insensitive', () => {
      store.add(mockExercise);
      store.add(mockExercise2);

      store.setSearchTerm('BANCA');

      expect(store.filteredExercises().length).toBe(1);
      expect(store.filteredExercises()[0].name).toBe('Press de banca');
    });

    it('debe resetear a página 1 al cambiar el término de búsqueda', () => {
      for (let i = 0; i < 25; i++) {
        store.add({ ...mockExercise, id: `exercise-${i}` });
      }

      store.goToPage(3);
      expect(store.currentPage()).toBe(3);

      store.setSearchTerm('test');

      expect(store.currentPage()).toBe(1);
    });

    it('debe manejar actualización de ejercicio no existente', () => {
      store.add(mockExercise);

      const nonExistentExercise = { ...mockExercise2, id: 'non-existent' };
      store.update(nonExistentExercise);

      expect(store.exercises().length).toBe(1);
      expect(store.exercises()[0].id).toBe('1');
    });

    it('debe manejar toggle de ejercicio no existente', () => {
      store.add(mockExercise);

      store.toggleComplete('non-existent-id');

      expect(store.exercises()[0].completed).toBeFalse();
    });

    it('debe manejar remove de ejercicio no existente', () => {
      store.add(mockExercise);

      store.remove('non-existent-id');

      expect(store.exercises().length).toBe(1);
    });

    it('debe manejar completeAll con lista vacía', () => {
      store.completeAll();

      expect(store.exercises()).toEqual([]);
      expect(toastServiceSpy.success).toHaveBeenCalledWith('Todos los ejercicios completados');
    });

    it('debe manejar load sin días disponibles', fakeAsync(() => {
      trainingServiceSpy.getAvailableTrainingDays.and.returnValue(of([]));
      trainingServiceSpy.getExercisesByDay.and.returnValue(of([]));

      store.load('user-123');
      tick();

      expect(store.availableDays()).toEqual([]);
      expect(store.hasRoutines()).toBeFalse();
    }));

    it('debe seleccionar el primer día disponible si el día actual no está disponible', fakeAsync(() => {
      // Obtener el día actual del store (que es el día de hoy en español)
      const currentDay = store.selectedDay();

      // Crear un array de días que NO incluye el día actual
      const allPossibleDays = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
      const daysWithoutCurrent = allPossibleDays.filter(d => d !== currentDay);
      const availableDays = [daysWithoutCurrent[0], daysWithoutCurrent[1]]; // Primeros 2 días que NO son hoy

      trainingServiceSpy.getAvailableTrainingDays.and.returnValue(of(availableDays));
      trainingServiceSpy.getExercisesByDay.and.returnValue(of([mockExercise]));

      store.load('user-123');
      tick();

      // Debe cambiar al primer día disponible ya que el día actual no está en la lista
      expect(store.selectedDay()).toBe(availableDays[0]);
    }));
  });

  // ==========================================
  // PRUEBAS DE ESTADO INICIAL DEL DÍA
  // ==========================================

  describe('initial selected day', () => {
    it('debe establecer el día actual en español como día seleccionado inicial', () => {
      const daysOfWeek = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
      const today = new Date();
      const expectedDay = daysOfWeek[today.getDay()];

      expect(store.selectedDay()).toBe(expectedDay);
    });
  });

  // ==========================================
  // PRUEBAS DE COMPUTED AVANZADOS
  // ==========================================

  describe('computed: filteredExercises avanzado', () => {
    it('debe filtrar por múltiples criterios simultáneamente', () => {
      store.add({ ...mockExercise, name: 'Press de banca', reps: '10-12' });
      store.add({ ...mockExercise2, name: 'Sentadillas', reps: '8-10' });
      store.add({ ...mockExercise, id: '3', name: 'Press inclinado', reps: '10-12' });

      store.setSearchTerm('10-12');

      const filtered = store.filteredExercises();
      expect(filtered.length).toBe(2);
      expect(filtered.every(e => e.reps === '10-12')).toBeTrue();
    });

    it('debe retornar todos los ejercicios cuando el término de búsqueda está vacío', () => {
      store.add(mockExercise);
      store.add(mockExercise2);

      store.setSearchTerm('');

      expect(store.filteredExercises().length).toBe(2);
    });
  });

  // ==========================================
  // PRUEBAS DE REACTIVIDAD DE SEÑALES
  // ==========================================

  describe('signal reactivity', () => {
    it('debe actualizar completedExercises reactivamente al toggle', () => {
      store.add(mockExercise);
      store.add(mockExercise2);

      expect(store.completedExercises()).toBe(0);

      store.toggleComplete('1');

      expect(store.completedExercises()).toBe(1);

      store.toggleComplete('2');

      expect(store.completedExercises()).toBe(2);
    });

    it('debe actualizar completionPercentage reactivamente', () => {
      store.add(mockExercise);
      store.add(mockExercise2);

      expect(store.completionPercentage()).toBe(0);

      store.toggleComplete('1');

      expect(store.completionPercentage()).toBe(50);

      store.completeAll();

      expect(store.completionPercentage()).toBe(100);
    });

    it('debe actualizar isEmpty reactivamente', () => {
      expect(store.isEmpty()).toBeTrue();

      store.add(mockExercise);

      expect(store.isEmpty()).toBeFalse();

      store.remove('1');

      expect(store.isEmpty()).toBeTrue();
    });
  });
});
