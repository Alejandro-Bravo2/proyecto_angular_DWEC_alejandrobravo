import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  ProgressEvaluationService,
  RegistrarEntrenamientoDTO,
  RegistrarNutricionDTO,
  WorkoutHistoryItem,
  NutritionHistoryItem,
  DailyNutritionSummary,
  EvaluacionProgresoDTO,
  EjercicioProgresoDTO,
} from './progress-evaluation.service';
import { LoadingService } from '../../../core/services/loading.service';
import { environment } from '../../../../environments/environment';

describe('ProgressEvaluationService', () => {
  let service: ProgressEvaluationService;
  let httpMock: HttpTestingController;

  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProgressEvaluationService,
        LoadingService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ProgressEvaluationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Workout Logging', () => {
    it('should log a workout', (done) => {
      const dto: RegistrarEntrenamientoDTO = {
        ejercicioId: 1,
        fecha: '2024-01-15',
        seriesCompletadas: 4,
        repeticionesCompletadas: 10,
        pesoUtilizado: 80,
        nivelEsfuerzo: 'MODERADO',
      };

      const mockResponse = {
        message: 'Entrenamiento registrado',
        id: 1,
        volumen: 3200,
      };

      service.logWorkout(dto).subscribe((response) => {
        expect(response.message).toBe('Entrenamiento registrado');
        expect(response.id).toBe(1);
        expect(response.volumen).toBe(3200);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/progress-evaluation/training/log`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });

    it('should get workout history', (done) => {
      const mockHistory: WorkoutHistoryItem[] = [
        {
          id: 1,
          fecha: '2024-01-15',
          ejercicioId: 1,
          nombreEjercicio: 'Press de banca',
          grupoMuscular: 'Pecho',
          seriesCompletadas: 4,
          repeticionesCompletadas: 10,
          pesoUtilizado: 80,
          volumen: 3200,
          nivelEsfuerzo: 'MODERADO',
          notas: '',
        },
        {
          id: 2,
          fecha: '2024-01-14',
          ejercicioId: 2,
          nombreEjercicio: 'Sentadillas',
          grupoMuscular: 'Piernas',
          seriesCompletadas: 5,
          repeticionesCompletadas: 8,
          pesoUtilizado: 100,
          volumen: 4000,
          nivelEsfuerzo: 'DIFICIL',
          notas: 'Buena sesion',
        },
      ];

      service.getWorkoutHistory('2024-01-01', '2024-01-31').subscribe((history) => {
        expect(history).toEqual(mockHistory);
        expect(history.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/progress-evaluation/training/history?from=2024-01-01&to=2024-01-31`);
      expect(req.request.method).toBe('GET');
      req.flush(mockHistory);
    });

    it('should get exercise progress', (done) => {
      const mockProgress: EjercicioProgresoDTO = {
        ejercicioId: 1,
        nombreEjercicio: 'Press de banca',
        grupoMuscular: 'Pecho',
        pesoActual: 85,
        pesoAnterior: 80,
        mejoraPorcentaje: 6.25,
        volumenActual: 3400,
        volumenAnterior: 3200,
        tendencia: 'MEJORANDO',
        registrosSemana: 3,
      };

      service.getExerciseProgress(1).subscribe((progress) => {
        expect(progress.tendencia).toBe('MEJORANDO');
        expect(progress.mejoraPorcentaje).toBe(6.25);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/progress-evaluation/training/exercise/1/progress`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProgress);
    });
  });

  describe('Nutrition Logging', () => {
    it('should log nutrition', (done) => {
      const dto: RegistrarNutricionDTO = {
        fecha: '2024-01-15',
        tipoComida: 'ALMUERZO',
        caloriasConsumidas: 600,
        proteinasConsumidas: 40,
        carbohidratosConsumidos: 50,
        grasasConsumidas: 25,
        descripcionComida: 'Pollo con arroz',
      };

      const mockResponse = { message: 'Nutricion registrada', id: 1 };

      service.logNutrition(dto).subscribe((response) => {
        expect(response.message).toBe('Nutricion registrada');
        expect(response.id).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/progress-evaluation/nutrition/log`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });

    it('should get nutrition history', (done) => {
      const mockHistory: NutritionHistoryItem[] = [
        {
          id: 1,
          fecha: '2024-01-15',
          tipoComida: 'DESAYUNO',
          caloriasConsumidas: 400,
          proteinasConsumidas: 25,
          carbohidratosConsumidos: 40,
          grasasConsumidas: 15,
          descripcionComida: 'Avena con frutas',
        },
        {
          id: 2,
          fecha: '2024-01-15',
          tipoComida: 'ALMUERZO',
          caloriasConsumidas: 600,
          proteinasConsumidas: 40,
          carbohidratosConsumidos: 50,
          grasasConsumidas: 25,
          descripcionComida: 'Pollo con arroz',
        },
      ];

      service.getNutritionHistory('2024-01-15', '2024-01-15').subscribe((history) => {
        expect(history).toEqual(mockHistory);
        expect(history.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/progress-evaluation/nutrition/history?from=2024-01-15&to=2024-01-15`);
      expect(req.request.method).toBe('GET');
      req.flush(mockHistory);
    });

    it('should get daily nutrition summary', (done) => {
      const mockSummary: DailyNutritionSummary = {
        fecha: '2024-01-15',
        totalCalorias: 2000,
        totalProteinas: 150,
        totalCarbohidratos: 200,
        totalGrasas: 70,
        registros: 4,
      };

      service.getDailyNutritionSummary('2024-01-15').subscribe((summary) => {
        expect(summary.fecha).toBe('2024-01-15');
        expect(summary.totalCalorias).toBe(2000);
        expect(summary.registros).toBe(4);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/progress-evaluation/nutrition/daily-summary?date=2024-01-15`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSummary);
    });
  });

  describe('Evaluations', () => {
    const mockEvaluacion: EvaluacionProgresoDTO = {
      id: 1,
      fechaEvaluacion: '2024-01-15',
      tipoEvaluacion: 'INTEGRAL',
      entrenamientoResumen: {
        volumenTotal: 10000,
        pesoMaximoPromedio: 80,
        mejoraFuerzaPorcentaje: 5,
        entrenamientosCompletados: 5,
        entrenamientosPlanificados: 5,
        consistenciaPorcentaje: 100,
        hayPlateau: false,
      },
      nutricionResumen: {
        caloriasPromedio: 2000,
        caloriasMeta: 2200,
        adherenciaCalorias: 90,
        proteinasPromedio: 150,
        proteinasMeta: 160,
        adherenciaProteinas: 93,
        patronesDetectados: ['Bajo consumo de proteinas en desayuno'],
      },
      feedbackIA: 'Buen progreso general',
      recomendaciones: ['Aumentar proteinas en desayuno'],
      logrosDestacados: ['5 entrenamientos consecutivos'],
      tendenciaEntrenamiento: 'MEJORANDO',
      tendenciaNutricion: 'ESTABLE',
    };

    it('should evaluate training', (done) => {
      service.evaluateTraining().subscribe((evaluacion) => {
        expect(evaluacion.tipoEvaluacion).toBe('INTEGRAL');
        expect(evaluacion.tendenciaEntrenamiento).toBe('MEJORANDO');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/progress-evaluation/evaluate/training`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEvaluacion);
    });

    it('should evaluate nutrition', (done) => {
      service.evaluateNutrition().subscribe((evaluacion) => {
        expect(evaluacion.nutricionResumen).toBeTruthy();
        expect(evaluacion.tendenciaNutricion).toBe('ESTABLE');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/progress-evaluation/evaluate/nutrition`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEvaluacion);
    });

    it('should evaluate full progress', (done) => {
      service.evaluateFull().subscribe((evaluacion) => {
        expect(evaluacion.entrenamientoResumen).toBeTruthy();
        expect(evaluacion.nutricionResumen).toBeTruthy();
        expect(evaluacion.feedbackIA).toBe('Buen progreso general');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/progress-evaluation/evaluate/full`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEvaluacion);
    });

    it('should get evaluation history with default limit', (done) => {
      const mockHistory = [mockEvaluacion];

      service.getEvaluationHistory().subscribe((history) => {
        expect(history).toEqual(mockHistory);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/progress-evaluation/evaluate/history?limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockHistory);
    });

    it('should get evaluation history with custom limit', (done) => {
      const mockHistory = [mockEvaluacion];

      service.getEvaluationHistory(5).subscribe((history) => {
        expect(history.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/progress-evaluation/evaluate/history?limit=5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockHistory);
    });
  });
});
