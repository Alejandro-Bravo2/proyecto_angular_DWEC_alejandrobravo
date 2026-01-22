import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRouteSnapshot, RouterStateSnapshot, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { exerciseDetailResolver } from './exercise-detail.resolver';
import { TrainingService, EjerciciosDTO } from '../services/training.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ToastService } from '../../../core/services/toast.service';
import { of, throwError, isObservable, from, Observable } from 'rxjs';

describe('exerciseDetailResolver', () => {
  let trainingServiceSpy: jasmine.SpyObj<TrainingService>;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let router: Router;

  const mockEjercicio: EjerciciosDTO = {
    id: 1,
    nombreEjercicio: 'Press de banca',
    series: 4,
    repeticiones: 12,
    tiempoDescansoSegundos: 90,
    descripcion: 'Ejercicio de pecho con barra',
    grupoMuscular: 'Pecho',
  };

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

  // Helper function to create a mock ActivatedRouteSnapshot with params
  function createMockRoute(id: string | null): ActivatedRouteSnapshot {
    const paramMap = convertToParamMap(id !== null ? { id } : {});
    return {
      paramMap,
    } as ActivatedRouteSnapshot;
  }

  beforeEach(() => {
    const trainingSpy = jasmine.createSpyObj('TrainingService', ['obtenerEjercicio']);
    const loadingSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'entrenamiento', component: class {} as any },
          { path: 'entrenamiento/:id', component: class {} as any },
        ]),
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

  it('should load exercise successfully with valid id', fakeAsync(() => {
    const mockRoute = createMockRoute('1');
    trainingServiceSpy.obtenerEjercicio.and.returnValue(of(mockEjercicio));

    let result: any;

    TestBed.runInInjectionContext(() => {
      const maybeAsync = exerciseDetailResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe((data) => {
        result = data;
      });
    });

    tick();

    expect(result).toEqual(mockEjercicio);
    expect(trainingServiceSpy.obtenerEjercicio).toHaveBeenCalledWith(1);
  }));

  it('should show loading indicator while fetching exercise', fakeAsync(() => {
    const mockRoute = createMockRoute('1');
    trainingServiceSpy.obtenerEjercicio.and.returnValue(of(mockEjercicio));

    TestBed.runInInjectionContext(() => {
      const maybeAsync = exerciseDetailResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe();
    });

    expect(loadingServiceSpy.show).toHaveBeenCalled();

    tick();

    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  }));

  it('should hide loading indicator even on error', fakeAsync(() => {
    const mockRoute = createMockRoute('1');
    trainingServiceSpy.obtenerEjercicio.and.returnValue(
      throwError(() => new Error('Network error'))
    );

    TestBed.runInInjectionContext(() => {
      const maybeAsync = exerciseDetailResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe();
    });

    tick();

    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  }));

  it('should return null and show error toast when id is not provided', fakeAsync(() => {
    const mockRoute = createMockRoute(null);
    const navigateSpy = spyOn(router, 'navigate');

    let result: any;

    TestBed.runInInjectionContext(() => {
      const maybeAsync = exerciseDetailResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe((data) => {
        result = data;
      });
    });

    tick();

    expect(result).toBeNull();
    expect(toastServiceSpy.error).toHaveBeenCalledWith('ID de ejercicio inválido');
    expect(navigateSpy).toHaveBeenCalledWith(['/entrenamiento']);
    expect(trainingServiceSpy.obtenerEjercicio).not.toHaveBeenCalled();
  }));

  it('should return null and show error toast when id is not a valid number', fakeAsync(() => {
    const mockRoute = createMockRoute('abc');
    const navigateSpy = spyOn(router, 'navigate');

    let result: any;

    TestBed.runInInjectionContext(() => {
      const maybeAsync = exerciseDetailResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe((data) => {
        result = data;
      });
    });

    tick();

    expect(result).toBeNull();
    expect(toastServiceSpy.error).toHaveBeenCalledWith('ID de ejercicio inválido');
    expect(navigateSpy).toHaveBeenCalledWith(['/entrenamiento']);
    expect(trainingServiceSpy.obtenerEjercicio).not.toHaveBeenCalled();
  }));

  it('should return null and redirect on API error', fakeAsync(() => {
    const mockRoute = createMockRoute('999');
    const navigateSpy = spyOn(router, 'navigate');
    trainingServiceSpy.obtenerEjercicio.and.returnValue(
      throwError(() => new Error('Exercise not found'))
    );

    let result: any;

    TestBed.runInInjectionContext(() => {
      const maybeAsync = exerciseDetailResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe((data) => {
        result = data;
      });
    });

    tick();

    expect(result).toBeNull();
    expect(toastServiceSpy.error).toHaveBeenCalledWith('No se encontró el ejercicio con ID 999');
    expect(navigateSpy).toHaveBeenCalledWith(['/entrenamiento'], {
      state: { error: 'No existe el ejercicio con id 999' }
    });
  }));

  it('should call training service obtenerEjercicio with correct id', fakeAsync(() => {
    const mockRoute = createMockRoute('42');
    trainingServiceSpy.obtenerEjercicio.and.returnValue(of(mockEjercicio));

    TestBed.runInInjectionContext(() => {
      const maybeAsync = exerciseDetailResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe();
    });

    tick();

    expect(trainingServiceSpy.obtenerEjercicio).toHaveBeenCalledWith(42);
  }));

  it('should handle valid numeric string ids correctly', fakeAsync(() => {
    const mockRoute = createMockRoute('100');
    const ejercicioConId100: EjerciciosDTO = {
      ...mockEjercicio,
      id: 100,
    };
    trainingServiceSpy.obtenerEjercicio.and.returnValue(of(ejercicioConId100));

    let result: any;

    TestBed.runInInjectionContext(() => {
      const maybeAsync = exerciseDetailResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe((data) => {
        result = data;
      });
    });

    tick();

    expect(result).toEqual(ejercicioConId100);
    expect(trainingServiceSpy.obtenerEjercicio).toHaveBeenCalledWith(100);
  }));

  it('should not show loading when id is invalid', fakeAsync(() => {
    const mockRoute = createMockRoute('invalid');
    spyOn(router, 'navigate');

    TestBed.runInInjectionContext(() => {
      const maybeAsync = exerciseDetailResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe();
    });

    tick();

    expect(loadingServiceSpy.show).not.toHaveBeenCalled();
  }));

  it('should handle empty string id as invalid', fakeAsync(() => {
    const mockRoute = createMockRoute('');
    const navigateSpy = spyOn(router, 'navigate');

    let result: any;

    TestBed.runInInjectionContext(() => {
      const maybeAsync = exerciseDetailResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe((data) => {
        result = data;
      });
    });

    tick();

    expect(result).toBeNull();
    expect(toastServiceSpy.error).toHaveBeenCalledWith('ID de ejercicio inválido');
    expect(navigateSpy).toHaveBeenCalledWith(['/entrenamiento']);
  }));

  it('should log error to console when API call fails', fakeAsync(() => {
    const mockRoute = createMockRoute('1');
    const consoleSpy = spyOn(console, 'error');
    const error = new Error('API Error');
    trainingServiceSpy.obtenerEjercicio.and.returnValue(throwError(() => error));
    spyOn(router, 'navigate');

    TestBed.runInInjectionContext(() => {
      const maybeAsync = exerciseDetailResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe();
    });

    tick();

    expect(consoleSpy).toHaveBeenCalledWith('Error al cargar ejercicio en resolver:', error);
  }));

  it('should handle negative id as valid number (backend validation)', fakeAsync(() => {
    const mockRoute = createMockRoute('-1');
    trainingServiceSpy.obtenerEjercicio.and.returnValue(
      throwError(() => new Error('Not found'))
    );
    spyOn(router, 'navigate');

    TestBed.runInInjectionContext(() => {
      const maybeAsync = exerciseDetailResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe();
    });

    tick();

    // -1 is a valid number, so it should call the service (backend will handle validation)
    expect(trainingServiceSpy.obtenerEjercicio).toHaveBeenCalledWith(-1);
  }));

  it('should return the exact exercise data from the service', fakeAsync(() => {
    const mockRoute = createMockRoute('5');
    const ejercicioEspecifico: EjerciciosDTO = {
      id: 5,
      nombreEjercicio: 'Curl de bíceps',
      series: 3,
      repeticiones: 15,
      tiempoDescansoSegundos: 60,
      descripcion: 'Ejercicio para bíceps con mancuernas',
      grupoMuscular: 'Brazos',
    };
    trainingServiceSpy.obtenerEjercicio.and.returnValue(of(ejercicioEspecifico));

    let result: any;

    TestBed.runInInjectionContext(() => {
      const maybeAsync = exerciseDetailResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe((data) => {
        result = data;
      });
    });

    tick();

    expect(result).toEqual(ejercicioEspecifico);
    expect(result?.nombreEjercicio).toBe('Curl de bíceps');
    expect(result?.grupoMuscular).toBe('Brazos');
  }));
});
