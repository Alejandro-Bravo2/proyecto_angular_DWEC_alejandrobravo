import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { Progress } from './progress';
import { ProgressService, ProgressEntry, NutrientData } from './services/progress.service';
import { ProgressStore } from './stores/progress.store';

describe('Progress', () => {
  let component: Progress;
  let fixture: ComponentFixture<Progress>;
  let progressServiceSpy: jasmine.SpyObj<ProgressService>;
  let progressStoreMock: any;

  const usuarioMock = {
    id: 'user-123',
    nombre: 'Usuario Test',
    email: 'test@example.com'
  };

  const entradasProgresoMock: ProgressEntry[] = [
    {
      id: '1',
      userId: 'user-123',
      date: '2025-01-20',
      exerciseName: 'Press de banca',
      weight: 80,
      reps: 10,
      sets: 4,
      notes: ''
    },
    {
      id: '2',
      userId: 'user-123',
      date: '2025-01-21',
      exerciseName: 'Sentadilla',
      weight: 100,
      reps: 8,
      sets: 5,
      notes: ''
    }
  ];

  const nutrientesMock: NutrientData = {
    date: '2025-01-21',
    protein: 150,
    carbs: 200,
    fat: 70,
    fiber: 30,
    water: 2500,
    calories: 2100,
    calorieGoal: 2200
  };

  const ejerciciosMock = ['Press de banca', 'Sentadilla', 'Peso muerto'];

  beforeEach(async () => {
    progressServiceSpy = jasmine.createSpyObj('ProgressService', [
      'getProgressEntries',
      'getNutrientDataByDate',
      'getUserExercises'
    ]);

    // Mock del store con signals reales
    progressStoreMock = {
      progressEntries: signal(entradasProgresoMock),
      nutrientData: signal(nutrientesMock),
      strengthProgress: signal(null),
      exercises: signal(ejerciciosMock),
      loading: signal(false),
      error: signal(null),
      searchTerm: signal(''),
      currentPage: signal(1),
      currentDate: signal(new Date().toISOString().split('T')[0]),
      selectedExercise: signal(null),
      viewMode: signal('pagination' as 'pagination' | 'infinite'),
      infiniteScrollItems: signal(entradasProgresoMock),
      hasMore: signal(true),
      isLoadingMore: signal(false),
      totalPages: signal(1),
      paginatedEntries: signal(entradasProgresoMock),
      filteredEntries: signal(entradasProgresoMock),
      pageSize: 10,
      load: jasmine.createSpy('load'),
      setSearchTerm: jasmine.createSpy('setSearchTerm'),
      clearSearch: jasmine.createSpy('clearSearch'),
      previousPage: jasmine.createSpy('previousPage'),
      nextPage: jasmine.createSpy('nextPage'),
      setViewMode: jasmine.createSpy('setViewMode'),
      loadMore: jasmine.createSpy('loadMore'),
    };

    // Configurar retornos por defecto
    progressServiceSpy.getProgressEntries.and.returnValue(of(entradasProgresoMock));
    progressServiceSpy.getNutrientDataByDate.and.returnValue(of(nutrientesMock));
    progressServiceSpy.getUserExercises.and.returnValue(of(ejerciciosMock));

    await TestBed.configureTestingModule({
      imports: [Progress],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ProgressService, useValue: progressServiceSpy },
        { provide: ProgressStore, useValue: progressStoreMock }
      ],
    }).compileComponents();

    // Configurar localStorage mock
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(usuarioMock));

    fixture = TestBed.createComponent(Progress);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ==========================================
  // TESTS DE CREACION
  // ==========================================

  describe('Creacion del componente', () => {
    it('deberia crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('deberia inyectar el store correctamente', () => {
      expect(component.store).toBeTruthy();
    });

    it('deberia tener searchControl inicializado', () => {
      expect(component.searchControl).toBeDefined();
      expect(component.searchControl.value).toBe('');
    });

    it('deberia inicializar currentDate con fecha actual', () => {
      const fechaActual = new Date().toISOString().split('T')[0];
      expect(component.currentDate()).toBe(fechaActual);
    });

    it('deberia inicializar nutrientData como null', () => {
      expect(component.nutrientData()).toBeNull();
    });

    it('deberia inicializar progressEntries como array vacio', () => {
      expect(component.progressEntries()).toEqual([]);
    });

    it('deberia inicializar exercises como array vacio', () => {
      expect(component.exercises()).toEqual([]);
    });

    it('deberia inicializar isLoading en false', () => {
      expect(component.isLoading()).toBeFalse();
    });

    it('deberia inicializar error como null', () => {
      expect(component.error()).toBeNull();
    });
  });

  // ==========================================
  // TESTS DE ngOnInit
  // ==========================================

  describe('ngOnInit', () => {
    it('deberia llamar a loadProgressData', fakeAsync(() => {
      spyOn<any>(component, 'loadProgressData');

      component.ngOnInit();
      tick();

      expect((component as any).loadProgressData).toHaveBeenCalled();
    }));

    it('deberia cargar datos al inicializar', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(progressStoreMock.load).toHaveBeenCalled();
    }));
  });

  // ==========================================
  // TESTS DE loadProgressData
  // ==========================================

  describe('loadProgressData', () => {
    it('deberia establecer isLoading en true al iniciar', fakeAsync(() => {
      fixture.detectChanges();

      // isLoading se establece en true al inicio
      expect(progressServiceSpy.getProgressEntries).toHaveBeenCalled();
      tick();
    }));

    it('deberia llamar al store con userId y fecha actual', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const fechaActual = new Date().toISOString().split('T')[0];
      expect(progressStoreMock.load).toHaveBeenCalledWith('user-123', fechaActual);
    }));

    it('deberia cargar datos de nutrientes', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(progressServiceSpy.getNutrientDataByDate).toHaveBeenCalled();
      expect(component.nutrientData()).toEqual(nutrientesMock);
    }));

    it('deberia cargar entradas de progreso', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(progressServiceSpy.getProgressEntries).toHaveBeenCalled();
      expect(component.progressEntries()).toEqual(entradasProgresoMock);
    }));

    it('deberia cargar ejercicios del usuario', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(progressServiceSpy.getUserExercises).toHaveBeenCalled();
      expect(component.exercises()).toEqual(ejerciciosMock);
    }));

    it('deberia establecer isLoading en false al completar', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(component.isLoading()).toBeFalse();
    }));

    it('deberia manejar error al cargar nutrientes', fakeAsync(() => {
      progressServiceSpy.getNutrientDataByDate.and.returnValue(
        throwError(() => new Error('Error de red'))
      );
      spyOn(console, 'error');

      fixture.detectChanges();
      tick();

      expect(console.error).toHaveBeenCalled();
      expect(component.error()).toBe('Error al cargar los datos de nutrientes');
    }));

    it('deberia manejar error al cargar entradas de progreso', fakeAsync(() => {
      progressServiceSpy.getProgressEntries.and.returnValue(
        throwError(() => new Error('Error de red'))
      );
      spyOn(console, 'error');

      fixture.detectChanges();
      tick();

      expect(console.error).toHaveBeenCalled();
      expect(component.error()).toBe('Error al cargar el progreso');
    }));

    it('deberia manejar error al cargar ejercicios', fakeAsync(() => {
      progressServiceSpy.getUserExercises.and.returnValue(
        throwError(() => new Error('Error de red'))
      );
      spyOn(console, 'error');

      fixture.detectChanges();
      tick();

      expect(console.error).toHaveBeenCalled();
    }));

    it('deberia mostrar error cuando no hay usuario autenticado', fakeAsync(() => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);

      fixture.detectChanges();
      tick();

      expect(component.error()).toBe('Usuario no autenticado');
    }));
  });

  // ==========================================
  // TESTS DE searchControl
  // ==========================================

  describe('searchControl', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deberia actualizar searchTerm en el store despues de debounce', fakeAsync(() => {
      component.searchControl.setValue('press');

      // Esperar el debounce de 300ms
      tick(300);

      expect(progressStoreMock.setSearchTerm).toHaveBeenCalledWith('press');
    }));

    it('no deberia actualizar antes del debounce', fakeAsync(() => {
      component.searchControl.setValue('press');

      tick(100);

      expect(progressStoreMock.setSearchTerm).not.toHaveBeenCalled();
    }));

    it('deberia filtrar valores duplicados consecutivos', fakeAsync(() => {
      component.searchControl.setValue('press');
      tick(300);

      progressStoreMock.setSearchTerm.calls.reset();

      component.searchControl.setValue('press');
      tick(300);

      expect(progressStoreMock.setSearchTerm).not.toHaveBeenCalled();
    }));

    it('deberia manejar valores null como string vacio', fakeAsync(() => {
      component.searchControl.setValue(null);
      tick(300);

      expect(progressStoreMock.setSearchTerm).toHaveBeenCalledWith('');
    }));

    it('deberia actualizar cuando cambia el valor', fakeAsync(() => {
      component.searchControl.setValue('press');
      tick(300);

      expect(progressStoreMock.setSearchTerm).toHaveBeenCalledWith('press');

      progressStoreMock.setSearchTerm.calls.reset();

      component.searchControl.setValue('sentadilla');
      tick(300);

      expect(progressStoreMock.setSearchTerm).toHaveBeenCalledWith('sentadilla');
    }));
  });

  // ==========================================
  // TESTS DE clearSearch
  // ==========================================

  describe('clearSearch', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deberia limpiar el valor del searchControl', () => {
      component.searchControl.setValue('press');

      component.clearSearch();

      expect(component.searchControl.value).toBe('');
    });

    it('deberia llamar a clearSearch del store', () => {
      component.clearSearch();

      expect(progressStoreMock.clearSearch).toHaveBeenCalled();
    });
  });

  // ==========================================
  // TESTS DE previousPage
  // ==========================================

  describe('previousPage', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deberia llamar a previousPage del store', () => {
      component.previousPage();

      expect(progressStoreMock.previousPage).toHaveBeenCalled();
    });
  });

  // ==========================================
  // TESTS DE nextPage
  // ==========================================

  describe('nextPage', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deberia llamar a nextPage del store', () => {
      component.nextPage();

      expect(progressStoreMock.nextPage).toHaveBeenCalled();
    });
  });

  // ==========================================
  // TESTS DE setViewMode
  // ==========================================

  describe('setViewMode', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deberia cambiar a modo paginacion', () => {
      component.setViewMode('pagination');

      expect(progressStoreMock.setViewMode).toHaveBeenCalledWith('pagination');
    });

    it('deberia cambiar a modo infinite scroll', () => {
      component.setViewMode('infinite');

      expect(progressStoreMock.setViewMode).toHaveBeenCalledWith('infinite');
    });
  });

  // ==========================================
  // TESTS DE loadMore
  // ==========================================

  describe('loadMore', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deberia llamar a loadMore del store', () => {
      component.loadMore();

      expect(progressStoreMock.loadMore).toHaveBeenCalled();
    });
  });

  // ==========================================
  // TESTS DE INTEGRACION
  // ==========================================

  describe('Integracion', () => {
    it('deberia cargar todos los datos al inicializar', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(progressStoreMock.load).toHaveBeenCalled();
      expect(progressServiceSpy.getNutrientDataByDate).toHaveBeenCalled();
      expect(progressServiceSpy.getProgressEntries).toHaveBeenCalled();
      expect(progressServiceSpy.getUserExercises).toHaveBeenCalled();

      expect(component.nutrientData()).toEqual(nutrientesMock);
      expect(component.progressEntries()).toEqual(entradasProgresoMock);
      expect(component.exercises()).toEqual(ejerciciosMock);
      expect(component.isLoading()).toBeFalse();
    }));

    it('deberia manejar busqueda con debounce correctamente', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      component.searchControl.setValue('press');
      tick(300);

      expect(progressStoreMock.setSearchTerm).toHaveBeenCalledWith('press');

      progressStoreMock.setSearchTerm.calls.reset();

      component.clearSearch();

      expect(component.searchControl.value).toBe('');
      expect(progressStoreMock.clearSearch).toHaveBeenCalled();
    }));

    it('deberia coordinar paginacion con el store', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      component.nextPage();
      expect(progressStoreMock.nextPage).toHaveBeenCalledTimes(1);

      component.previousPage();
      expect(progressStoreMock.previousPage).toHaveBeenCalledTimes(1);
    }));

    it('deberia coordinar cambios de vista con el store', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      component.setViewMode('infinite');
      expect(progressStoreMock.setViewMode).toHaveBeenCalledWith('infinite');

      component.loadMore();
      expect(progressStoreMock.loadMore).toHaveBeenCalled();

      component.setViewMode('pagination');
      expect(progressStoreMock.setViewMode).toHaveBeenCalledWith('pagination');
    }));
  });

  // ==========================================
  // TESTS DE CASOS EDGE
  // ==========================================

  describe('Casos edge', () => {
    it('deberia manejar localStorage vacio', fakeAsync(() => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);

      fixture.detectChanges();
      tick();

      expect(component.error()).toBe('Usuario no autenticado');
    }));

    it('deberia manejar JSON invalido en localStorage', fakeAsync(() => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('invalid json');

      expect(() => {
        fixture.detectChanges();
        tick();
      }).toThrow();
    }));

    it('deberia manejar respuestas vacias del servicio', fakeAsync(() => {
      progressServiceSpy.getProgressEntries.and.returnValue(of([]));
      progressServiceSpy.getUserExercises.and.returnValue(of([]));

      fixture.detectChanges();
      tick();

      expect(component.progressEntries()).toEqual([]);
      expect(component.exercises()).toEqual([]);
    }));
  });
});
