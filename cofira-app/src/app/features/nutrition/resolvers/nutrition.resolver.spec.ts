import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { nutritionResolver } from './nutrition.resolver';
import { NutritionService, AlimentoDTO } from '../services/nutrition.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ToastService } from '../../../core/services/toast.service';
import { of, throwError, isObservable, from, Observable } from 'rxjs';

describe('nutritionResolver', () => {
  let nutritionServiceSpy: jasmine.SpyObj<NutritionService>;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let router: Router;

  const mockAlimentos: AlimentoDTO[] = [
    {
      id: 1,
      nombre: 'Pollo a la plancha',
      ingredientes: ['Pollo', 'Aceite', 'Sal'],
    },
    {
      id: 2,
      nombre: 'Ensalada mixta',
      ingredientes: ['Lechuga', 'Tomate', 'Pepino', 'Aceite'],
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
    const nutritionSpy = jasmine.createSpyObj('NutritionService', ['listarAlimentos']);
    const loadingSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: NutritionService, useValue: nutritionSpy },
        { provide: LoadingService, useValue: loadingSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    });

    nutritionServiceSpy = TestBed.inject(NutritionService) as jasmine.SpyObj<NutritionService>;
    loadingServiceSpy = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    toastServiceSpy = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router);
  });

  it('should load alimentos successfully', fakeAsync(() => {
    nutritionServiceSpy.listarAlimentos.and.returnValue(of(mockAlimentos));

    let result: any;

    TestBed.runInInjectionContext(() => {
      const maybeAsync = nutritionResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe((data) => {
        result = data;
      });
    });

    tick();

    expect(result).toEqual(mockAlimentos);
    expect(loadingServiceSpy.show).toHaveBeenCalled();
    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  }));

  it('should show loading indicator while fetching', fakeAsync(() => {
    nutritionServiceSpy.listarAlimentos.and.returnValue(of(mockAlimentos));

    TestBed.runInInjectionContext(() => {
      const maybeAsync = nutritionResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe();
    });

    expect(loadingServiceSpy.show).toHaveBeenCalled();

    tick();

    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  }));

  it('should return empty array on error', fakeAsync(() => {
    nutritionServiceSpy.listarAlimentos.and.returnValue(
      throwError(() => new Error('Network error'))
    );

    let result: any;

    TestBed.runInInjectionContext(() => {
      const maybeAsync = nutritionResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe((data) => {
        result = data;
      });
    });

    tick();

    expect(result).toEqual([]);
    expect(toastServiceSpy.error).toHaveBeenCalledWith(
      'No se pudieron cargar los alimentos. Por favor, intenta más tarde.'
    );
  }));

  it('should hide loading indicator even on error', fakeAsync(() => {
    nutritionServiceSpy.listarAlimentos.and.returnValue(
      throwError(() => new Error('Network error'))
    );

    TestBed.runInInjectionContext(() => {
      const maybeAsync = nutritionResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe();
    });

    tick();

    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  }));

  it('should call nutrition service listarAlimentos', fakeAsync(() => {
    nutritionServiceSpy.listarAlimentos.and.returnValue(of([]));

    TestBed.runInInjectionContext(() => {
      const maybeAsync = nutritionResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe();
    });

    tick();

    expect(nutritionServiceSpy.listarAlimentos).toHaveBeenCalled();
  }));

  it('should return empty array when service returns empty', fakeAsync(() => {
    nutritionServiceSpy.listarAlimentos.and.returnValue(of([]));

    let result: any;

    TestBed.runInInjectionContext(() => {
      const maybeAsync = nutritionResolver(mockRoute, mockState);
      toObservable(maybeAsync).subscribe((data) => {
        result = data;
      });
    });

    tick();

    expect(result).toEqual([]);
    expect(toastServiceSpy.error).not.toHaveBeenCalled();
  }));
});
