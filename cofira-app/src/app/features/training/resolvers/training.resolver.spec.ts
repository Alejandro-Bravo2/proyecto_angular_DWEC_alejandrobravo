import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { trainingResolver } from './training.resolver';
import { TrainingService, EjerciciosDTO } from '../services/training.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ToastService } from '../../../core/services/toast.service';
import { of, throwError, isObservable, from, Observable } from 'rxjs';

describe('trainingResolver', () => {
  let trainingServiceSpy: jasmine.SpyObj<TrainingService>;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let router: Router;

  const mockEjercicios: EjerciciosDTO[] = [
    {
      id: 1,
      nombreEjercicio: 'Press de banca',
      series: 4,
      repeticiones: 12,
      tiempoDescansoSegundos: 90,
      descripcion: 'Ejercicio de pecho',
      grupoMuscular: 'Pecho',
    },
    {
      id: 2,
      nombreEjercicio: 'Sentadillas',
      series: 5,
      repeticiones: 10,
      tiempoDescansoSegundos: 120,
      descripcion: 'Ejercicio de piernas',
      grupoMuscular: 'Piernas',
    },
  ];

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  // Helper function to convert MaybeAsync to Observable
  function toObservable<T>(maybeAsync: T | Observable<T> | Promise<T>): Observable<T> {
    if (isObservable(maybeAsync)) {
      return maybeAsync;
    }
    if (maybeAsync instanceof Promise) {
      return from(maybeAsync);
    }
    return of(maybeAsync);
  }

  beforeEach(() => {
    const trainingSpy = jasmine.createSpyObj('TrainingService', ['listarEjercicios']);
    const loadingSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: TrainingService, useValue: trainingSpy },
        { provide: LoadingService, useValue: loadingSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    });

    trainingServiceSpy = TestBed.inject(TrainingService) as jasmine.SpyObj<TrainingService>;
    loadingServiceSpy = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    toastServiceSpy = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router);
  });

  it('should load exercises successfully', fakeAsync(() => {
    trainingServiceSpy.listarEjercicios.and.returnValue(of(mockEjercicios));

    let result: any;

    TestBed.runInInjectionContext(() => {
      const maybeAsync = trainingResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe((data) => {
        result = data;
      });
    });

    tick();

    expect(result).toEqual(mockEjercicios);
    expect(loadingServiceSpy.show).toHaveBeenCalled();
    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  }));

  it('should show loading indicator while fetching', fakeAsync(() => {
    trainingServiceSpy.listarEjercicios.and.returnValue(of(mockEjercicios));

    TestBed.runInInjectionContext(() => {
      const maybeAsync = trainingResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe();
    });

    expect(loadingServiceSpy.show).toHaveBeenCalled();

    tick();

    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  }));

  it('should return empty array on error', fakeAsync(() => {
    trainingServiceSpy.listarEjercicios.and.returnValue(
      throwError(() => new Error('Network error'))
    );

    let result: any;

    TestBed.runInInjectionContext(() => {
      const maybeAsync = trainingResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe((data) => {
        result = data;
      });
    });

    tick();

    expect(result).toEqual([]);
    expect(toastServiceSpy.error).toHaveBeenCalledWith(
      'No se pudieron cargar los ejercicios. Por favor, intenta más tarde.'
    );
  }));

  it('should hide loading indicator even on error', fakeAsync(() => {
    trainingServiceSpy.listarEjercicios.and.returnValue(
      throwError(() => new Error('Network error'))
    );

    TestBed.runInInjectionContext(() => {
      const maybeAsync = trainingResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe();
    });

    tick();

    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  }));

  it('should call training service listarEjercicios', fakeAsync(() => {
    trainingServiceSpy.listarEjercicios.and.returnValue(of([]));

    TestBed.runInInjectionContext(() => {
      const maybeAsync = trainingResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe();
    });

    tick();

    expect(trainingServiceSpy.listarEjercicios).toHaveBeenCalled();
  }));
});
