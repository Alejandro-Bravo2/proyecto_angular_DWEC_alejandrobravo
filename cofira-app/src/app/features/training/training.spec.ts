import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Training } from './training';
import { TrainingService, WorkoutProgress } from './services/training.service';
import { TrainingStore } from './stores/training.store';

describe('Training', () => {
  let component: Training;
  let fixture: ComponentFixture<Training>;
  let trainingService: jasmine.SpyObj<TrainingService>;
  let trainingStore: TrainingStore;
  let httpMock: HttpTestingController;

  const mockWorkoutProgress: WorkoutProgress = {
    userId: 'user123',
    totalWorkouts: 5,
    completedExercises: 20,
    streak: 3,
    lastWorkout: '2024-01-15'
  };

  beforeEach(async () => {
    const trainingServiceSpy = jasmine.createSpyObj('TrainingService', [
      'getWorkoutProgress',
      'getExercises',
      'getAvailableTrainingDays',
      'getExercisesByDay'
    ]);
    trainingServiceSpy.getWorkoutProgress.and.returnValue(of(mockWorkoutProgress));
    trainingServiceSpy.getExercises.and.returnValue(of([]));
    trainingServiceSpy.getAvailableTrainingDays.and.returnValue(of(['2024-01-15', '2024-01-14', '2024-01-13']));
    trainingServiceSpy.getExercisesByDay.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [Training],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        TrainingStore, // Usar el store real
        { provide: TrainingService, useValue: trainingServiceSpy }
      ],
    }).compileComponents();

    trainingService = TestBed.inject(TrainingService) as jasmine.SpyObj<TrainingService>;
    trainingStore = TestBed.inject(TrainingStore);
    httpMock = TestBed.inject(HttpTestingController);

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'currentUser') {
        return JSON.stringify({ id: 'user123' });
      }
      return null;
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(Training);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Inicializacion del componente', () => {
    it('debe cargar datos de entrenamiento en ngOnInit', () => {
      fixture = TestBed.createComponent(Training);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(trainingService.getWorkoutProgress).toHaveBeenCalledWith('user123');
    });

    it('debe establecer error cuando no hay usuario autenticado', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);

      fixture = TestBed.createComponent(Training);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.error()).toBe('Usuario no autenticado');
    });

    it('debe establecer isLoading y workoutProgress correctamente', fakeAsync(() => {
      fixture = TestBed.createComponent(Training);
      component = fixture.componentInstance;
      fixture.detectChanges();

      tick();

      expect(component.workoutProgress()).toEqual(mockWorkoutProgress);
      expect(component.isLoading()).toBe(false);
    }));

    it('debe manejar error al cargar progreso de entrenamiento', fakeAsync(() => {
      const consoleErrorSpy = spyOn(console, 'error');
      trainingService.getWorkoutProgress.and.returnValue(throwError(() => new Error('Error de red')));

      fixture = TestBed.createComponent(Training);
      component = fixture.componentInstance;
      fixture.detectChanges();

      tick();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(component.isLoading()).toBe(false);
    }));
  });

  describe('getUserId', () => {
    it('debe obtener el ID del usuario desde localStorage', () => {
      fixture = TestBed.createComponent(Training);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const userId = (component as any).getUserId();
      expect(userId).toBe('user123');
    });

    it('debe manejar error al parsear usuario de localStorage', () => {
      const consoleErrorSpy = spyOn(console, 'error');
      (localStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'currentUser') {
          return 'invalid json';
        }
        return null;
      });

      fixture = TestBed.createComponent(Training);
      component = fixture.componentInstance;

      const userId = (component as any).getUserId();
      expect(userId).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('searchControl', () => {
    it('debe actualizar el término de busqueda con debounce', fakeAsync(() => {
      fixture = TestBed.createComponent(Training);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.searchControl.setValue('press de banca');
      tick(300);

      expect(trainingStore.searchTerm()).toBe('press de banca');
    }));

    it('debe manejar término de busqueda null', fakeAsync(() => {
      fixture = TestBed.createComponent(Training);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.searchControl.setValue(null);
      tick(300);

      expect(trainingStore.searchTerm()).toBe('');
    }));
  });

  describe('clearSearch', () => {
    it('debe limpiar la busqueda', fakeAsync(() => {
      fixture = TestBed.createComponent(Training);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.searchControl.setValue('test');
      tick(300);

      component.clearSearch();

      expect(component.searchControl.value).toBe('');
      expect(trainingStore.searchTerm()).toBe('');
    }));
  });

  describe('previousPage', () => {
    it('debe ir a la pagina anterior', () => {
      fixture = TestBed.createComponent(Training);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const spy = spyOn(trainingStore, 'previousPage');
      component.previousPage();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('nextPage', () => {
    it('debe ir a la pagina siguiente', () => {
      fixture = TestBed.createComponent(Training);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const spy = spyOn(trainingStore, 'nextPage');
      component.nextPage();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('createRoutine', () => {
    it('debe llamar a console.log cuando se crea una rutina', () => {
      const consoleLogSpy = spyOn(console, 'log');
      fixture = TestBed.createComponent(Training);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.createRoutine();

      expect(consoleLogSpy).toHaveBeenCalledWith('Crear nueva rutina de entrenamiento');
    });
  });

  describe('onPreviousDay', () => {
    it('debe navegar al dia anterior cuando hay usuario', () => {
      fixture = TestBed.createComponent(Training);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const spy = spyOn(trainingStore, 'previousDay');
      component.onPreviousDay();

      expect(spy).toHaveBeenCalledWith('user123');
    });

    it('no debe navegar cuando no hay usuario', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);
      fixture = TestBed.createComponent(Training);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const spy = spyOn(trainingStore, 'previousDay');
      component.onPreviousDay();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('onNextDay', () => {
    it('debe navegar al dia siguiente cuando hay usuario', () => {
      fixture = TestBed.createComponent(Training);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const spy = spyOn(trainingStore, 'nextDay');
      component.onNextDay();

      expect(spy).toHaveBeenCalledWith('user123');
    });

    it('no debe navegar cuando no hay usuario', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);
      fixture = TestBed.createComponent(Training);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const spy = spyOn(trainingStore, 'nextDay');
      component.onNextDay();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('setViewMode', () => {
    it('debe cambiar el modo de visualizacion a paginacion', () => {
      fixture = TestBed.createComponent(Training);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const spy = spyOn(trainingStore, 'setViewMode');
      component.setViewMode('pagination');

      expect(spy).toHaveBeenCalledWith('pagination');
    });

    it('debe cambiar el modo de visualizacion a infinite scroll', () => {
      fixture = TestBed.createComponent(Training);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const spy = spyOn(trainingStore, 'setViewMode');
      component.setViewMode('infinite');

      expect(spy).toHaveBeenCalledWith('infinite');
    });
  });

  describe('loadMore', () => {
    it('debe cargar mas elementos para infinite scroll', () => {
      fixture = TestBed.createComponent(Training);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const spy = spyOn(trainingStore, 'loadMore');
      component.loadMore();

      expect(spy).toHaveBeenCalled();
    });
  });
});
