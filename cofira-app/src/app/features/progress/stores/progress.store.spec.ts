import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProgressStore } from './progress.store';
import { ProgressService, ProgressEntry, NutrientData, StrengthProgress } from '../services/progress.service';
import { ToastService } from '../../../core/services/toast.service';
import { of, throwError, Subject } from 'rxjs';

describe('ProgressStore', () => {
  let store: ProgressStore;
  let progressServiceSpy: jasmine.SpyObj<ProgressService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  const mockEntry: ProgressEntry = {
    id: '1',
    userId: 'user-123',
    date: '2024-01-15',
    exerciseName: 'Press de banca',
    weight: 80,
    reps: 10,
    sets: 4,
    notes: 'Buena sesion',
  };

  const mockEntry2: ProgressEntry = {
    id: '2',
    userId: 'user-123',
    date: '2024-01-15',
    exerciseName: 'Sentadillas',
    weight: 100,
    reps: 8,
    sets: 5,
    notes: '',
  };

  const mockNutrientData: NutrientData = {
    date: '2024-01-15',
    protein: 150,
    carbs: 200,
    fat: 70,
    fiber: 30,
    water: 2500,
    calories: 2100,
    calorieGoal: 2200,
  };

  const mockStrengthProgress: StrengthProgress = {
    exerciseName: 'Press de banca',
    data: [
      { date: '2024-01-01', maxWeight: 70, totalVolume: 2800 },
      { date: '2024-01-08', maxWeight: 75, totalVolume: 3000 },
      { date: '2024-01-15', maxWeight: 80, totalVolume: 3200 },
    ],
  };

  beforeEach(() => {
    const progressSpy = jasmine.createSpyObj('ProgressService', [
      'getProgressEntries',
      'getNutrientDataByDate',
      'getUserExercises',
      'getStrengthProgress',
    ]);
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    TestBed.configureTestingModule({
      providers: [
        ProgressStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProgressService, useValue: progressSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    });

    progressServiceSpy = TestBed.inject(ProgressService) as jasmine.SpyObj<ProgressService>;
    toastServiceSpy = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    store = TestBed.inject(ProgressStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty progressEntries', () => {
      expect(store.progressEntries()).toEqual([]);
    });

    it('should have null nutrientData', () => {
      expect(store.nutrientData()).toBeNull();
    });

    it('should have loading as false', () => {
      expect(store.loading()).toBeFalse();
    });

    it('should have empty searchTerm', () => {
      expect(store.searchTerm()).toBe('');
    });

    it('should have currentPage as 1', () => {
      expect(store.currentPage()).toBe(1);
    });
  });

  describe('computed: totalEntries', () => {
    it('should return 0 for empty entries', () => {
      expect(store.totalEntries()).toBe(0);
    });
  });

  describe('computed: isEmpty', () => {
    it('should return true when no entries and not loading', () => {
      expect(store.isEmpty()).toBeTrue();
    });
  });

  describe('load', () => {
    it('should load all data successfully', fakeAsync(() => {
      progressServiceSpy.getProgressEntries.and.returnValue(of([mockEntry, mockEntry2]));
      progressServiceSpy.getNutrientDataByDate.and.returnValue(of(mockNutrientData));
      progressServiceSpy.getUserExercises.and.returnValue(of(['Press de banca', 'Sentadillas']));

      store.load('user-123', '2024-01-15');
      tick();

      expect(store.progressEntries().length).toBe(2);
      expect(store.nutrientData()).toEqual(mockNutrientData);
      expect(store.exercises().length).toBe(2);
      expect(store.loading()).toBeFalse();
    }));

    it('should handle errors gracefully', fakeAsync(() => {
      progressServiceSpy.getProgressEntries.and.returnValue(throwError(() => new Error('Error')));
      progressServiceSpy.getNutrientDataByDate.and.returnValue(throwError(() => new Error('Error')));
      progressServiceSpy.getUserExercises.and.returnValue(throwError(() => new Error('Error')));

      store.load('user-123');
      tick();

      expect(store.progressEntries()).toEqual([]);
      expect(store.exercises()).toEqual([]);
      expect(store.loading()).toBeFalse();
    }));

    it('should set loading to true while loading', fakeAsync(() => {
      // Use Subject to control when the observables emit
      const entriesSubject = new Subject<ProgressEntry[]>();
      const nutrientsSubject = new Subject<NutrientData>();
      const exercisesSubject = new Subject<string[]>();

      progressServiceSpy.getProgressEntries.and.returnValue(entriesSubject.asObservable());
      progressServiceSpy.getNutrientDataByDate.and.returnValue(nutrientsSubject.asObservable());
      progressServiceSpy.getUserExercises.and.returnValue(exercisesSubject.asObservable());

      store.load('user-123');

      // At this point, observables haven't emitted yet
      expect(store.loading()).toBeTrue();

      // Complete the observables
      entriesSubject.next([mockEntry]);
      entriesSubject.complete();
      nutrientsSubject.next(mockNutrientData);
      nutrientsSubject.complete();
      exercisesSubject.next([]);
      exercisesSubject.complete();
      tick();

      expect(store.loading()).toBeFalse();
    }));
  });

  describe('loadStrengthProgress', () => {
    it('should load strength progress for exercise', fakeAsync(() => {
      progressServiceSpy.getStrengthProgress.and.returnValue(of(mockStrengthProgress));

      store.loadStrengthProgress('user-123', 'Press de banca');
      tick();

      expect(store.strengthProgress()).toEqual(mockStrengthProgress);
      expect(store.selectedExercise()).toBe('Press de banca');
    }));

    it('should handle error and return empty data', fakeAsync(() => {
      progressServiceSpy.getStrengthProgress.and.returnValue(throwError(() => new Error('Error')));

      store.loadStrengthProgress('user-123', 'Press de banca');
      tick();

      expect(store.strengthProgress()).toEqual({ exerciseName: 'Press de banca', data: [] });
    }));
  });

  describe('add', () => {
    it('should add entry to list', () => {
      store.add(mockEntry);

      expect(store.progressEntries().length).toBe(1);
      expect(store.progressEntries()[0]).toEqual(mockEntry);
      expect(toastServiceSpy.success).toHaveBeenCalledWith('Progreso registrado');
    });

    it('should add multiple entries', () => {
      store.add(mockEntry);
      store.add(mockEntry2);

      expect(store.progressEntries().length).toBe(2);
    });
  });

  describe('update', () => {
    it('should update existing entry', () => {
      store.add(mockEntry);

      const updatedEntry = { ...mockEntry, weight: 85 };
      store.update(updatedEntry);

      expect(store.progressEntries()[0].weight).toBe(85);
    });

    it('should not modify other entries', () => {
      store.add(mockEntry);
      store.add(mockEntry2);

      const updatedEntry = { ...mockEntry, weight: 85 };
      store.update(updatedEntry);

      expect(store.progressEntries()[1]).toEqual(mockEntry2);
    });
  });

  describe('remove', () => {
    it('should remove entry by id', () => {
      store.add(mockEntry);
      store.add(mockEntry2);

      store.remove('1');

      expect(store.progressEntries().length).toBe(1);
      expect(store.progressEntries()[0].id).toBe('2');
      expect(toastServiceSpy.success).toHaveBeenCalledWith('Entrada eliminada');
    });
  });

  describe('search and pagination', () => {
    beforeEach(() => {
      store.add(mockEntry);
      store.add(mockEntry2);
    });

    it('should set search term', () => {
      store.setSearchTerm('banca');

      expect(store.searchTerm()).toBe('banca');
      expect(store.currentPage()).toBe(1);
    });

    it('should filter entries by search term', () => {
      store.setSearchTerm('banca');

      expect(store.filteredEntries().length).toBe(1);
      expect(store.filteredEntries()[0].exerciseName).toBe('Press de banca');
    });

    it('should clear search', () => {
      store.setSearchTerm('banca');
      store.clearSearch();

      expect(store.searchTerm()).toBe('');
      expect(store.filteredEntries().length).toBe(2);
    });

    it('should filter by notes', () => {
      store.setSearchTerm('buena');

      expect(store.filteredEntries().length).toBe(1);
    });
  });

  describe('pagination', () => {
    it('should go to next page', () => {
      // Add enough entries to have multiple pages
      for (let i = 0; i < 15; i++) {
        store.add({ ...mockEntry, id: `entry-${i}` });
      }

      store.nextPage();

      expect(store.currentPage()).toBe(2);
    });

    it('should not go past last page', () => {
      store.add(mockEntry);

      store.nextPage();

      expect(store.currentPage()).toBe(1);
    });

    it('should go to previous page', () => {
      for (let i = 0; i < 15; i++) {
        store.add({ ...mockEntry, id: `entry-${i}` });
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
        store.add({ ...mockEntry, id: `entry-${i}` });
      }

      store.goToPage(3);

      expect(store.currentPage()).toBe(3);
    });

    it('should not go to invalid page', () => {
      store.add(mockEntry);

      store.goToPage(10);

      expect(store.currentPage()).toBe(1);
    });
  });

  describe('date navigation', () => {
    it('should set date', () => {
      store.setDate('2024-02-01');

      expect(store.currentDate()).toBe('2024-02-01');
    });

    it('should go to previous day', fakeAsync(() => {
      progressServiceSpy.getProgressEntries.and.returnValue(of([]));
      progressServiceSpy.getNutrientDataByDate.and.returnValue(of(mockNutrientData));
      progressServiceSpy.getUserExercises.and.returnValue(of([]));

      store.setDate('2024-01-15');
      store.previousDay('user-123');
      tick();

      expect(store.currentDate()).toBe('2024-01-14');
    }));

    it('should go to next day', fakeAsync(() => {
      progressServiceSpy.getProgressEntries.and.returnValue(of([]));
      progressServiceSpy.getNutrientDataByDate.and.returnValue(of(mockNutrientData));
      progressServiceSpy.getUserExercises.and.returnValue(of([]));

      store.setDate('2024-01-15');
      store.nextDay('user-123');
      tick();

      expect(store.currentDate()).toBe('2024-01-16');
    }));
  });

  describe('exercise methods', () => {
    it('should select exercise', () => {
      store.selectExercise('Press de banca');

      expect(store.selectedExercise()).toBe('Press de banca');
    });

    it('should clear exercise selection', () => {
      store.selectExercise('Press de banca');
      store.selectExercise(null);

      expect(store.selectedExercise()).toBeNull();
    });

    it('should add new exercise', () => {
      store.addExercise('Peso muerto');

      expect(store.exercises()).toContain('Peso muerto');
    });

    it('should not add duplicate exercise', () => {
      store.addExercise('Peso muerto');
      store.addExercise('Peso muerto');

      const countOfPesoMuerto = store.exercises().filter(e => e === 'Peso muerto').length;
      expect(countOfPesoMuerto).toBe(1);
    });
  });

  describe('computed: maxWeight', () => {
    it('should return 0 for empty entries', () => {
      expect(store.maxWeight()).toBe(0);
    });

    it('should return max weight from entries', () => {
      store.add(mockEntry);
      store.add(mockEntry2);

      expect(store.maxWeight()).toBe(100);
    });
  });

  describe('computed: totalVolume', () => {
    it('should calculate total volume', () => {
      store.add(mockEntry); // 80 * 10 * 4 = 3200
      store.add(mockEntry2); // 100 * 8 * 5 = 4000

      expect(store.totalVolume()).toBe(7200);
    });
  });

  describe('computed: calorie metrics', () => {
    beforeEach(fakeAsync(() => {
      progressServiceSpy.getProgressEntries.and.returnValue(of([]));
      progressServiceSpy.getNutrientDataByDate.and.returnValue(of(mockNutrientData));
      progressServiceSpy.getUserExercises.and.returnValue(of([]));

      store.load('user-123');
      tick();
    }));

    it('should return calories consumed', () => {
      expect(store.caloriesConsumed()).toBe(2100);
    });

    it('should return calorie goal', () => {
      expect(store.calorieGoal()).toBe(2200);
    });

    it('should calculate calorie percentage', () => {
      expect(store.caloriePercentage()).toBe(95); // 2100/2200 * 100 = 95.45 rounded to 95
    });
  });

  describe('clear', () => {
    it('should clear all state', fakeAsync(() => {
      progressServiceSpy.getProgressEntries.and.returnValue(of([mockEntry]));
      progressServiceSpy.getNutrientDataByDate.and.returnValue(of(mockNutrientData));
      progressServiceSpy.getUserExercises.and.returnValue(of(['Press de banca']));

      store.load('user-123');
      tick();

      store.clear();

      expect(store.progressEntries()).toEqual([]);
      expect(store.nutrientData()).toBeNull();
      expect(store.exercises()).toEqual([]);
      expect(store.loading()).toBeFalse();
      expect(store.searchTerm()).toBe('');
      expect(store.currentPage()).toBe(1);
    }));
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      store.clearError();

      expect(store.error()).toBeNull();
    });
  });

  describe('view mode', () => {
    it('should have default pagination mode', () => {
      expect(store.viewMode()).toBe('pagination');
    });

    it('should change to infinite scroll mode', fakeAsync(() => {
      store.add(mockEntry);

      store.setViewMode('infinite');
      tick(500);

      expect(store.viewMode()).toBe('infinite');
    }));

    it('should load initial items when switching to infinite mode', fakeAsync(() => {
      for (let i = 0; i < 15; i++) {
        store.add({ ...mockEntry, id: `entry-${i}` });
      }

      store.setViewMode('infinite');
      tick(500);

      expect(store.infiniteScrollItems().length).toBeGreaterThan(0);
    }));
  });

  describe('infinite scroll', () => {
    beforeEach(() => {
      for (let i = 0; i < 25; i++) {
        store.add({ ...mockEntry, id: `entry-${i}`, exerciseName: `Exercise ${i}` });
      }
    });

    it('should have hasMore as true initially in infinite mode', fakeAsync(() => {
      store.setViewMode('infinite');
      tick(500);

      expect(store.hasMore()).toBeTrue();
    }));

    it('should load more items when loadMore is called', fakeAsync(() => {
      store.setViewMode('infinite');
      tick(500);

      const initialCount = store.infiniteScrollItems().length;

      store.loadMore();
      tick(500);

      expect(store.infiniteScrollItems().length).toBeGreaterThan(initialCount);
    }));

    it('should not load more when already loading', fakeAsync(() => {
      store.setViewMode('infinite');
      tick(500);

      store.loadMore();
      const countDuringLoad = store.infiniteScrollItems().length;

      store.loadMore();

      expect(store.infiniteScrollItems().length).toBe(countDuringLoad);
      tick(500);
    }));

    it('should not load more when hasMore is false', fakeAsync(() => {
      // Limpiar el store y agregar solo 5 items para que quepan en 1 pagina
      store.clear();
      for (let i = 0; i < 5; i++) {
        store.add({ ...mockEntry, id: `small-item-${i}` });
      }

      store.setViewMode('infinite');
      tick(500);

      // Con solo 5 items y pageSize=10, todos cargan en la primera pagina
      // hasMore deberia ser false despues de la carga inicial
      const finalCount = store.infiniteScrollItems().length;
      expect(finalCount).toBe(5);

      // Intentar cargar mas no deberia agregar items
      store.loadMore();
      tick(500);

      expect(store.infiniteScrollItems().length).toBe(finalCount);
    }));

    it('should not load more when in pagination mode', fakeAsync(() => {
      store.setViewMode('pagination');

      store.loadMore();
      tick(500);

      expect(store.infiniteScrollItems().length).toBe(0);
    }));

    it('should set hasMore to false when all items are loaded', fakeAsync(() => {
      // Limpiar store y agregar solo 5 items (menos que pageSize=10)
      store.clear();
      for (let i = 0; i < 5; i++) {
        store.add({ ...mockEntry, id: `small-${i}` });
      }

      store.setViewMode('infinite');
      tick(500);

      // Con solo 5 items y pageSize=10, todos cargan en la primera pagina
      // hasMore deberia ser false porque end(10) > allItems.length(5)
      expect(store.hasMore()).toBeFalse();
    }));

    it('should filter infinite scroll items by search term', fakeAsync(() => {
      store.setViewMode('infinite');
      tick(500);

      store.setSearchTerm('Exercise 1');

      const filteredItems = store.infiniteScrollItems();
      expect(filteredItems.every(item => item.exerciseName.includes('Exercise 1'))).toBeTrue();
    }));

    it('should reset infinite scroll when switching modes', fakeAsync(() => {
      store.setViewMode('infinite');
      tick(500);

      store.loadMore();
      tick(500);

      const itemsCount = store.infiniteScrollItems().length;

      store.setViewMode('pagination');
      store.setViewMode('infinite');
      tick(500);

      expect(store.infiniteScrollItems().length).toBeLessThanOrEqual(store.pageSize);
    }));
  });

  describe('computed: hasResults', () => {
    it('should return true when there are results', () => {
      store.add(mockEntry);

      expect(store.hasResults()).toBeTrue();
    });

    it('should return false when no results after filter', () => {
      store.add(mockEntry);
      store.setSearchTerm('nonexistent');

      expect(store.hasResults()).toBeFalse();
    });
  });

  describe('computed: hasProgress', () => {
    it('should return false when no entries', () => {
      expect(store.hasProgress()).toBeFalse();
    });

    it('should return true when entries exist', () => {
      store.add(mockEntry);

      expect(store.hasProgress()).toBeTrue();
    });
  });

  describe('refresh', () => {
    it('should reload data with current date', fakeAsync(() => {
      progressServiceSpy.getProgressEntries.and.returnValue(of([mockEntry]));
      progressServiceSpy.getNutrientDataByDate.and.returnValue(of(mockNutrientData));
      progressServiceSpy.getUserExercises.and.returnValue(of([]));

      store.setDate('2024-01-20');
      store.refresh('user-123');
      tick();

      expect(progressServiceSpy.getNutrientDataByDate).toHaveBeenCalled();
    }));
  });

  describe('computed: totalExercises', () => {
    it('should return 0 for empty exercises', () => {
      expect(store.totalExercises()).toBe(0);
    });

    it('should return correct count when exercises exist', fakeAsync(() => {
      progressServiceSpy.getProgressEntries.and.returnValue(of([]));
      progressServiceSpy.getNutrientDataByDate.and.returnValue(of(mockNutrientData));
      progressServiceSpy.getUserExercises.and.returnValue(of(['Press de banca', 'Sentadillas']));

      store.load('user-123');
      tick();

      expect(store.totalExercises()).toBe(2);
    }));
  });

  describe('computed: caloriePercentage with edge cases', () => {
    it('should return 0 when calorieGoal is 0', fakeAsync(() => {
      const nutrientDataWithZeroGoal = { ...mockNutrientData, calorieGoal: 0 };
      progressServiceSpy.getProgressEntries.and.returnValue(of([]));
      progressServiceSpy.getNutrientDataByDate.and.returnValue(of(nutrientDataWithZeroGoal));
      progressServiceSpy.getUserExercises.and.returnValue(of([]));

      store.load('user-123');
      tick();

      expect(store.caloriePercentage()).toBe(0);
    }));
  });

  describe('computed: paginatedEntries', () => {
    it('should return correct page of entries', () => {
      for (let i = 0; i < 15; i++) {
        store.add({ ...mockEntry, id: `entry-${i}`, exerciseName: `Exercise ${i}` });
      }

      expect(store.paginatedEntries().length).toBe(10);

      store.nextPage();

      expect(store.paginatedEntries().length).toBe(5);
    });
  });

  describe('computed: totalPages', () => {
    it('should calculate total pages correctly', () => {
      for (let i = 0; i < 25; i++) {
        store.add({ ...mockEntry, id: `entry-${i}` });
      }

      expect(store.totalPages()).toBe(3);
    });

    it('should return 0 for empty list', () => {
      expect(store.totalPages()).toBe(0);
    });
  });

  describe('computed: filteredEntries with notes', () => {
    it('should filter by notes with null notes', () => {
      store.add({ ...mockEntry, notes: undefined });
      store.setSearchTerm('buena');

      expect(store.filteredEntries().length).toBe(0);
    });
  });

  describe('previousDay and nextDay edge cases', () => {
    it('should handle date transitions correctly', fakeAsync(() => {
      progressServiceSpy.getProgressEntries.and.returnValue(of([]));
      progressServiceSpy.getNutrientDataByDate.and.returnValue(of(mockNutrientData));
      progressServiceSpy.getUserExercises.and.returnValue(of([]));

      store.setDate('2024-01-31');
      store.nextDay('user-123');
      tick();

      expect(store.currentDate()).toBe('2024-02-01');
    }));
  });

  describe('strengthProgress signal states', () => {
    it('should have null strengthProgress initially', () => {
      expect(store.strengthProgress()).toBeNull();
    });

    it('should maintain strengthProgress after loading', fakeAsync(() => {
      progressServiceSpy.getStrengthProgress.and.returnValue(of(mockStrengthProgress));

      store.loadStrengthProgress('user-123', 'Press de banca');
      tick();

      expect(store.strengthProgress()).not.toBeNull();
      expect(store.strengthProgress()?.data.length).toBe(3);
    }));
  });

  describe('error signal states', () => {
    it('should have null error initially', () => {
      expect(store.error()).toBeNull();
    });

    it('should have null strengthProgress initially', () => {
      expect(store.strengthProgress()).toBeNull();
    });

    it('should have empty exercises initially', () => {
      expect(store.exercises()).toEqual([]);
    });

    it('should have null selectedExercise initially', () => {
      expect(store.selectedExercise()).toBeNull();
    });

    it('should have default currentDate', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(store.currentDate()).toBe(today);
    });

    it('should have pageSize of 10', () => {
      expect(store.pageSize).toBe(10);
    });
  });

  describe('load with default date', () => {
    it('should use current date when no date provided', fakeAsync(() => {
      const today = new Date().toISOString().split('T')[0];
      progressServiceSpy.getProgressEntries.and.returnValue(of([]));
      progressServiceSpy.getNutrientDataByDate.and.returnValue(of(mockNutrientData));
      progressServiceSpy.getUserExercises.and.returnValue(of([]));

      store.load('user-123');
      tick();

      expect(store.currentDate()).toBe(today);
    }));
  });

  describe('infinite scroll edge cases', () => {
    it('should handle empty infiniteScrollItems with search', fakeAsync(() => {
      store.clear();
      for (let i = 0; i < 5; i++) {
        store.add({ ...mockEntry, id: `item-${i}`, exerciseName: 'Press de banca' });
      }

      store.setViewMode('infinite');
      tick(500);

      store.setSearchTerm('Sentadillas');

      expect(store.infiniteScrollItems().length).toBe(0);
    }));

    it('should correctly filter infiniteScrollItems with notes', fakeAsync(() => {
      store.clear();
      store.add({ ...mockEntry, id: '1', notes: 'excelente sesion' });
      store.add({ ...mockEntry2, id: '2', notes: 'regular' });

      store.setViewMode('infinite');
      tick(500);

      store.setSearchTerm('excelente');

      const filtered = store.infiniteScrollItems();
      expect(filtered.length).toBe(1);
      expect(filtered[0].notes).toContain('excelente');
    }));
  });

  describe('computed: caloriesConsumed and calorieGoal with null nutrientData', () => {
    it('should return 0 for caloriesConsumed when nutrientData is null', () => {
      expect(store.caloriesConsumed()).toBe(0);
    });

    it('should return 2000 for calorieGoal when nutrientData is null', () => {
      expect(store.calorieGoal()).toBe(2000);
    });
  });
});
