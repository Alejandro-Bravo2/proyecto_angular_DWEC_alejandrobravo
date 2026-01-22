import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { ExerciseDetail } from './exercise-detail';
import { TrainingService, EjerciciosDTO } from '../../services/training.service';

describe('ExerciseDetail', () => {
  let component: ExerciseDetail;
  let fixture: ComponentFixture<ExerciseDetail>;
  let trainingServiceSpy: jasmine.SpyObj<TrainingService>;
  let router: Router;
  let paramMapSubject: BehaviorSubject<any>;

  const mockEjercicio: EjerciciosDTO = {
    id: 1,
    nombreEjercicio: 'Press de banca',
    series: 4,
    repeticiones: 12,
    tiempoDescansoSegundos: 90,
    descripcion: 'Ejercicio de pecho con barra',
    grupoMuscular: 'Pecho',
  };

  beforeEach(async () => {
    const trainingSpy = jasmine.createSpyObj('TrainingService', ['obtenerEjercicio']);
    paramMapSubject = new BehaviorSubject(convertToParamMap({ id: '1' }));

    await TestBed.configureTestingModule({
      imports: [ExerciseDetail],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'entrenamiento', component: class {} as any },
          { path: 'entrenamiento/:id', component: ExerciseDetail },
        ]),
        { provide: TrainingService, useValue: trainingSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable(),
            snapshot: {
              paramMap: convertToParamMap({ id: '1' }),
            },
          },
        },
      ],
    }).compileComponents();

    trainingServiceSpy = TestBed.inject(TrainingService) as jasmine.SpyObj<TrainingService>;
    router = TestBed.inject(Router);

    // Default mock response
    trainingServiceSpy.obtenerEjercicio.and.returnValue(of(mockEjercicio));

    fixture = TestBed.createComponent(ExerciseDetail);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set initial loading state to true', () => {
    expect(component.isLoading()).toBeTrue();
  });

  it('should load exercise on init with valid id', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(component.exercise()).toEqual(mockEjercicio);
    expect(component.exerciseId()).toBe(1);
    expect(component.isLoading()).toBeFalse();
    expect(component.error()).toBeNull();
  }));

  it('should call trainingService.obtenerEjercicio with correct id', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(trainingServiceSpy.obtenerEjercicio).toHaveBeenCalledWith(1);
  }));

  it('should set error when no id is provided', fakeAsync(() => {
    paramMapSubject.next(convertToParamMap({}));
    fixture.detectChanges();
    tick();

    expect(component.error()).toBe('ID de ejercicio no proporcionado');
    expect(component.isLoading()).toBeFalse();
    expect(trainingServiceSpy.obtenerEjercicio).not.toHaveBeenCalled();
  }));

  it('should set error state when API call fails', fakeAsync(() => {
    trainingServiceSpy.obtenerEjercicio.and.returnValue(
      throwError(() => new Error('Not found'))
    );

    fixture.detectChanges();
    tick();

    expect(component.error()).toBe('No se pudo cargar el ejercicio. Es posible que no exista.');
    expect(component.isLoading()).toBeFalse();
    expect(component.exercise()).toBeNull();
  }));

  it('should log error to console when API call fails', fakeAsync(() => {
    const consoleSpy = spyOn(console, 'error');
    const error = new Error('API Error');
    trainingServiceSpy.obtenerEjercicio.and.returnValue(throwError(() => error));

    fixture.detectChanges();
    tick();

    expect(consoleSpy).toHaveBeenCalledWith('Error al cargar ejercicio:', error);
  }));

  it('should react to param changes', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(component.exerciseId()).toBe(1);

    // Change route param
    const ejercicio2: EjerciciosDTO = {
      ...mockEjercicio,
      id: 2,
      nombreEjercicio: 'Sentadillas',
    };
    trainingServiceSpy.obtenerEjercicio.and.returnValue(of(ejercicio2));
    paramMapSubject.next(convertToParamMap({ id: '2' }));
    tick();

    expect(component.exerciseId()).toBe(2);
    expect(component.exercise()?.nombreEjercicio).toBe('Sentadillas');
  }));

  describe('goBack', () => {
    it('should navigate to /entrenamiento', () => {
      const navigateSpy = spyOn(router, 'navigate');

      component.goBack();

      expect(navigateSpy).toHaveBeenCalledWith(['/entrenamiento']);
    });
  });

  describe('goToNextExercise', () => {
    it('should navigate to next exercise id', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const navigateSpy = spyOn(router, 'navigate');
      component.goToNextExercise();

      expect(navigateSpy).toHaveBeenCalledWith(['/entrenamiento', 2]);
    }));

    it('should not navigate if exerciseId is null', () => {
      const navigateSpy = spyOn(router, 'navigate');

      // exerciseId is null by default before init
      component.goToNextExercise();

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('goToPreviousExercise', () => {
    it('should navigate to previous exercise id when id > 1', fakeAsync(() => {
      paramMapSubject.next(convertToParamMap({ id: '5' }));
      const ejercicio5: EjerciciosDTO = { ...mockEjercicio, id: 5 };
      trainingServiceSpy.obtenerEjercicio.and.returnValue(of(ejercicio5));

      fixture.detectChanges();
      tick();

      const navigateSpy = spyOn(router, 'navigate');
      component.goToPreviousExercise();

      expect(navigateSpy).toHaveBeenCalledWith(['/entrenamiento', 4]);
    }));

    it('should not navigate if exerciseId is 1', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const navigateSpy = spyOn(router, 'navigate');
      component.goToPreviousExercise();

      expect(navigateSpy).not.toHaveBeenCalled();
    }));

    it('should not navigate if exerciseId is null', () => {
      const navigateSpy = spyOn(router, 'navigate');

      component.goToPreviousExercise();

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('getMuscleGroupColor', () => {
    it('should return correct color for Pecho', () => {
      expect(component.getMuscleGroupColor('Pecho')).toBe('#e74c3c');
    });

    it('should return correct color for Espalda', () => {
      expect(component.getMuscleGroupColor('Espalda')).toBe('#3498db');
    });

    it('should return correct color for Piernas', () => {
      expect(component.getMuscleGroupColor('Piernas')).toBe('#2ecc71');
    });

    it('should return correct color for Hombros', () => {
      expect(component.getMuscleGroupColor('Hombros')).toBe('#f39c12');
    });

    it('should return correct color for Brazos', () => {
      expect(component.getMuscleGroupColor('Brazos')).toBe('#9b59b6');
    });

    it('should return correct color for Core', () => {
      expect(component.getMuscleGroupColor('Core')).toBe('#1abc9c');
    });

    it('should return correct color for Cardio', () => {
      expect(component.getMuscleGroupColor('Cardio')).toBe('#e91e63');
    });

    it('should return default color for unknown muscle group', () => {
      expect(component.getMuscleGroupColor('Unknown')).toBe('#6c757d');
    });

    it('should return default color for empty string', () => {
      expect(component.getMuscleGroupColor('')).toBe('#6c757d');
    });
  });

  describe('template rendering', () => {
    it('should display loading state when isLoading is true', fakeAsync(() => {
      // Initialize the component first
      fixture.detectChanges();
      tick();

      // Then set loading state to simulate a new load
      component.isLoading.set(true);
      component.exercise.set(null);
      component.error.set(null);
      fixture.detectChanges();

      const loadingElement = fixture.nativeElement.querySelector('.exercise-detail__loading');
      expect(loadingElement).toBeTruthy();
      expect(loadingElement.textContent).toContain('Cargando ejercicio...');
    }));

    it('should display error state', fakeAsync(() => {
      trainingServiceSpy.obtenerEjercicio.and.returnValue(
        throwError(() => new Error('Error'))
      );
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('.exercise-detail__error');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain('No se pudo cargar el ejercicio');
    }));

    it('should display exercise content when loaded', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const titleElement = fixture.nativeElement.querySelector('.exercise-detail__title');
      expect(titleElement).toBeTruthy();
      expect(titleElement.textContent).toContain('Press de banca');
    }));

    it('should display exercise parameters', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const statsElement = fixture.nativeElement.querySelector('.exercise-detail__stats');
      expect(statsElement).toBeTruthy();
      expect(statsElement.textContent).toContain('4');
      expect(statsElement.textContent).toContain('12');
      expect(statsElement.textContent).toContain('90s');
    }));

    it('should display muscle group badge with correct color', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const badge = fixture.nativeElement.querySelector('.exercise-detail__muscle-badge');
      expect(badge).toBeTruthy();
      expect(badge.textContent.trim()).toBe('Pecho');
      expect(badge.style.backgroundColor).toBe('rgb(231, 76, 60)'); // #e74c3c
    }));

    it('should display exercise ID', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const idElement = fixture.nativeElement.querySelector('.exercise-detail__id');
      expect(idElement).toBeTruthy();
      expect(idElement.textContent).toContain('#1');
    }));

    it('should disable previous button when exerciseId is 1', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const prevButton = fixture.nativeElement.querySelector(
        '.exercise-detail__btn--secondary[disabled]'
      );
      expect(prevButton).toBeTruthy();
    }));

    it('should show breadcrumb navigation', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const breadcrumb = fixture.nativeElement.querySelector('.exercise-detail__breadcrumb');
      expect(breadcrumb).toBeTruthy();

      const currentPage = fixture.nativeElement.querySelector('.exercise-detail__breadcrumb-current');
      expect(currentPage.textContent.trim()).toBe('Press de banca');
    }));

    it('should show default breadcrumb when exercise is not loaded', fakeAsync(() => {
      // First let the component initialize
      fixture.detectChanges();
      tick();

      // Now set to loading state without exercise
      component.exercise.set(null);
      component.isLoading.set(false);
      component.error.set(null);
      fixture.detectChanges();

      const currentPage = fixture.nativeElement.querySelector('.exercise-detail__breadcrumb-current');
      expect(currentPage.textContent.trim()).toBe('Detalle');
    }));

    it('should display description section', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const descriptionSection = fixture.nativeElement.querySelector('.exercise-detail__description');
      expect(descriptionSection).toBeTruthy();
      expect(descriptionSection.textContent).toContain('Ejercicio de pecho con barra');
    }));

    it('should display default description when not available', fakeAsync(() => {
      const ejercicioSinDescripcion: EjerciciosDTO = {
        ...mockEjercicio,
        descripcion: '',
      };
      trainingServiceSpy.obtenerEjercicio.and.returnValue(of(ejercicioSinDescripcion));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const descriptionSection = fixture.nativeElement.querySelector('.exercise-detail__description');
      expect(descriptionSection.textContent).toContain('Sin descripción disponible.');
    }));
  });

  describe('button interactions', () => {
    it('should call goBack when volver button is clicked', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const goBackSpy = spyOn(component, 'goBack');
      const volverButton = fixture.nativeElement.querySelector('.exercise-detail__btn--outline');
      volverButton.click();

      expect(goBackSpy).toHaveBeenCalled();
    }));

    it('should call goToNextExercise when siguiente button is clicked', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const nextSpy = spyOn(component, 'goToNextExercise');
      const buttons = fixture.nativeElement.querySelectorAll('.exercise-detail__btn--secondary');
      const siguienteButton = buttons[1]; // Second secondary button is "Siguiente"
      siguienteButton.click();

      expect(nextSpy).toHaveBeenCalled();
    }));

    it('should call goToPreviousExercise when anterior button is clicked', fakeAsync(() => {
      // Set up with id > 1 so button is not disabled
      paramMapSubject.next(convertToParamMap({ id: '5' }));
      const ejercicio5: EjerciciosDTO = { ...mockEjercicio, id: 5 };
      trainingServiceSpy.obtenerEjercicio.and.returnValue(of(ejercicio5));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const prevSpy = spyOn(component, 'goToPreviousExercise');
      const buttons = fixture.nativeElement.querySelectorAll('.exercise-detail__btn--secondary');
      const anteriorButton = buttons[0]; // First secondary button is "Anterior"
      anteriorButton.click();

      expect(prevSpy).toHaveBeenCalled();
    }));

    it('should call goBack when error button is clicked', fakeAsync(() => {
      trainingServiceSpy.obtenerEjercicio.and.returnValue(
        throwError(() => new Error('Error'))
      );
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const goBackSpy = spyOn(component, 'goBack');
      const errorButton = fixture.nativeElement.querySelector('.exercise-detail__error .exercise-detail__btn');
      errorButton.click();

      expect(goBackSpy).toHaveBeenCalled();
    }));
  });

  describe('state transitions', () => {
    it('should reset error and show loading when loading new exercise', fakeAsync(() => {
      // First load fails
      trainingServiceSpy.obtenerEjercicio.and.returnValue(
        throwError(() => new Error('Error'))
      );
      fixture.detectChanges();
      tick();

      expect(component.error()).not.toBeNull();

      // Change to new id
      trainingServiceSpy.obtenerEjercicio.and.returnValue(of(mockEjercicio));
      paramMapSubject.next(convertToParamMap({ id: '2' }));
      tick();

      expect(component.error()).toBeNull();
      expect(component.exercise()).toEqual(mockEjercicio);
    }));

    it('should update exerciseId before loading exercise', fakeAsync(() => {
      fixture.detectChanges();

      // Check that exerciseId is set before the async call completes
      paramMapSubject.next(convertToParamMap({ id: '10' }));

      // The exerciseId signal should be updated immediately
      expect(component.exerciseId()).toBe(10);

      tick();
    }));
  });
});
