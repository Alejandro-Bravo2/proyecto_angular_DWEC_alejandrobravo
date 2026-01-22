import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  ProgressService,
  ObjetivosDTO,
  CrearObjetivosDTO,
  ModificarObjetivosDTO,
} from './progress.service';
import { LoadingService } from '../../../core/services/loading.service';
import { environment } from '../../../../environments/environment';

describe('ProgressService', () => {
  let service: ProgressService;
  let httpMock: HttpTestingController;

  const apiUrl = environment.apiUrl;

  const mockObjetivos: ObjetivosDTO = {
    id: 1,
    listaObjetivos: ['Perder peso', 'Ganar músculo'],
    usuarioId: 100,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProgressService,
        LoadingService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ProgressService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listarObjetivos', () => {
    it('should fetch all objectives', (done) => {
      service.listarObjetivos().subscribe((objetivos) => {
        expect(objetivos).toEqual([mockObjetivos]);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/objetivos`);
      expect(req.request.method).toBe('GET');
      req.flush([mockObjetivos]);
    });
  });

  describe('obtenerObjetivos', () => {
    it('should fetch objectives by ID', (done) => {
      service.obtenerObjetivos(1).subscribe((objetivos) => {
        expect(objetivos).toEqual(mockObjetivos);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/objetivos/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockObjetivos);
    });
  });

  describe('obtenerObjetivosPorUsuario', () => {
    it('should fetch objectives by user ID', (done) => {
      service.obtenerObjetivosPorUsuario(100).subscribe((objetivos) => {
        expect(objetivos).toEqual(mockObjetivos);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/objetivos/usuario/100`);
      expect(req.request.method).toBe('GET');
      req.flush(mockObjetivos);
    });
  });

  describe('crearObjetivos', () => {
    it('should create new objectives', (done) => {
      const nuevosObjetivos: CrearObjetivosDTO = {
        listaObjetivos: ['Mejorar resistencia'],
        usuarioId: 100,
      };

      service.crearObjetivos(nuevosObjetivos).subscribe((objetivos) => {
        expect(objetivos.listaObjetivos).toContain('Mejorar resistencia');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/objetivos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(nuevosObjetivos);
      req.flush({ ...mockObjetivos, listaObjetivos: ['Mejorar resistencia'] });
    });
  });

  describe('actualizarObjetivos', () => {
    it('should update objectives', (done) => {
      const modificacion: ModificarObjetivosDTO = {
        listaObjetivos: ['Perder peso', 'Ganar músculo', 'Mejorar flexibilidad'],
      };

      service.actualizarObjetivos(1, modificacion).subscribe((objetivos) => {
        expect(objetivos.listaObjetivos).toContain('Mejorar flexibilidad');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/objetivos/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(modificacion);
      req.flush({ ...mockObjetivos, listaObjetivos: modificacion.listaObjetivos });
    });
  });

  describe('eliminarObjetivos', () => {
    it('should delete objectives', (done) => {
      service.eliminarObjetivos(1).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/objetivos/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Legacy methods', () => {
    it('getProgressEntries should return empty array', (done) => {
      service.getProgressEntries('user-123').subscribe((entries) => {
        expect(entries).toEqual([]);
        done();
      });
    });

    it('getProgressByExercise should return empty array', (done) => {
      service.getProgressByExercise('user-123', 'Press de banca').subscribe((entries) => {
        expect(entries).toEqual([]);
        done();
      });
    });

    it('addProgressEntry should return entry with ID', (done) => {
      const entry = {
        userId: 'user-123',
        date: '2024-01-15',
        exerciseName: 'Press de banca',
        weight: 80,
        reps: 10,
        sets: 3,
      };

      service.addProgressEntry(entry).subscribe((result) => {
        expect(result.id).toBeTruthy();
        expect(result.exerciseName).toBe('Press de banca');
        done();
      });
    });

    it('updateProgressEntry should return empty object', (done) => {
      service.updateProgressEntry('entry-1', { weight: 85 }).subscribe((result) => {
        expect(result).toEqual({} as any);
        done();
      });
    });

    it('deleteProgressEntry should complete', (done) => {
      service.deleteProgressEntry('entry-1').subscribe({
        next: (result) => {
          expect(result).toBeUndefined();
        },
        complete: () => done(),
      });
    });

    it('getStrengthProgress should return exercise with empty data', (done) => {
      service.getStrengthProgress('user-123', 'Sentadillas').subscribe((progress) => {
        expect(progress.exerciseName).toBe('Sentadillas');
        expect(progress.data).toEqual([]);
        done();
      });
    });

    it('getUserExercises should return empty array', (done) => {
      service.getUserExercises('user-123').subscribe((exercises) => {
        expect(exercises).toEqual([]);
        done();
      });
    });
  });

  describe('getNutrientDataByDate', () => {
    it('should fetch nutrient data with targets', (done) => {
      const mockTargets = {
        calculatedBMR: 1800,
        calculatedTDEE: 2500,
        dailyCalories: 2200,
        proteinGrams: 150,
      };

      service.getNutrientDataByDate('user-123', '2024-01-15').subscribe((data) => {
        expect(data.date).toBe('2024-01-15');
        expect(data.calorieGoal).toBe(2200);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/onboarding/nutrition-targets`);
      req.flush(mockTargets);
    });

    it('should use default calorie goal on error', (done) => {
      service.getNutrientDataByDate('user-123', '2024-01-15').subscribe((data) => {
        expect(data.date).toBe('2024-01-15');
        expect(data.calorieGoal).toBe(2000);
        done();
      });

      // BaseHttpService usa retry(2), por lo que necesitamos fallar 3 veces
      // (1 intento original + 2 reintentos) antes de que catchError capture el error
      for (let i = 0; i < 3; i++) {
        const req = httpMock.expectOne(`${apiUrl}/onboarding/nutrition-targets`);
        req.error(new ProgressEvent('error'));
      }
    });
  });
});
