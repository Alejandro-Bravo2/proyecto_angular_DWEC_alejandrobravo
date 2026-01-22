import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProgressEvaluationStore } from './progress-evaluation.store';
import {
  ProgressEvaluationService,
  EvaluacionProgresoDTO,
  RegistrarEntrenamientoDTO,
  RegistrarNutricionDTO,
  WorkoutHistoryItem,
  NutritionHistoryItem,
  TendenciaProgreso
} from '../services/progress-evaluation.service';
import { ToastService } from '../../../core/services/toast.service';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

describe('ProgressEvaluationStore', () => {
  let store: ProgressEvaluationStore;
  let evaluationServiceSpy: jasmine.SpyObj<ProgressEvaluationService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  // ==========================================
  // DATOS DE PRUEBA
  // ==========================================

  const evaluacionEntrenamientoMock: EvaluacionProgresoDTO = {
    id: 1,
    fechaEvaluacion: '2025-01-21',
    tipoEvaluacion: 'ENTRENAMIENTO',
    entrenamientoResumen: {
      volumenTotal: 15000,
      pesoMaximoPromedio: 80,
      mejoraFuerzaPorcentaje: 5,
      entrenamientosCompletados: 4,
      entrenamientosPlanificados: 5,
      consistenciaPorcentaje: 80,
      ejerciciosDestacados: [],
      hayPlateau: false,
      mensajePlateau: ''
    },
    nutricionResumen: null,
    feedbackIA: 'Buen progreso en entrenamiento',
    recomendaciones: ['Aumentar peso en press banca', 'Mantener consistencia'],
    logrosDestacados: ['Superaste tu PR en sentadilla'],
    tendenciaEntrenamiento: 'MEJORANDO',
    tendenciaNutricion: null
  };

  const evaluacionNutricionMock: EvaluacionProgresoDTO = {
    id: 2,
    fechaEvaluacion: '2025-01-21',
    tipoEvaluacion: 'NUTRICION',
    entrenamientoResumen: null,
    nutricionResumen: {
      caloriasPromedio: 2200,
      caloriasMeta: 2500,
      adherenciaCalorias: 88,
      proteinasPromedio: 150,
      proteinasMeta: 180,
      adherenciaProteinas: 83,
      carbohidratosPromedio: 250,
      carbohidratosMeta: 300,
      grasasPromedio: 70,
      grasasMeta: 80,
      aguaPromedio: 2000,
      patronesDetectados: ['PROTEINAS_INSUFICIENTES']
    },
    feedbackIA: 'Mejorar consumo de proteinas',
    recomendaciones: ['Aumentar proteinas en desayuno'],
    logrosDestacados: ['Buena adherencia calorica'],
    tendenciaEntrenamiento: null,
    tendenciaNutricion: 'ESTABLE'
  };

  const evaluacionCompletaMock: EvaluacionProgresoDTO = {
    id: 3,
    fechaEvaluacion: '2025-01-21',
    tipoEvaluacion: 'INTEGRAL',
    entrenamientoResumen: {
      volumenTotal: 18000,
      pesoMaximoPromedio: 85,
      mejoraFuerzaPorcentaje: 8,
      entrenamientosCompletados: 5,
      entrenamientosPlanificados: 5,
      consistenciaPorcentaje: 100,
      ejerciciosDestacados: [],
      hayPlateau: true,
      mensajePlateau: 'Detectado plateau en press de banca'
    },
    nutricionResumen: {
      caloriasPromedio: 2400,
      caloriasMeta: 2500,
      adherenciaCalorias: 96,
      proteinasPromedio: 175,
      proteinasMeta: 180,
      adherenciaProteinas: 97,
      carbohidratosPromedio: 280,
      carbohidratosMeta: 300,
      grasasPromedio: 75,
      grasasMeta: 80,
      aguaPromedio: 2500,
      patronesDetectados: []
    },
    feedbackIA: 'Excelente semana en general',
    recomendaciones: ['Variar ejercicios para romper plateau'],
    logrosDestacados: ['100% consistencia', 'Excelente adherencia nutricional'],
    tendenciaEntrenamiento: 'PLATEAU',
    tendenciaNutricion: 'MEJORANDO'
  };

  const historialEvaluacionesMock: EvaluacionProgresoDTO[] = [
    evaluacionCompletaMock,
    evaluacionEntrenamientoMock,
    evaluacionNutricionMock
  ];

  const historialEntrenamientoMock: WorkoutHistoryItem[] = [
    {
      id: 1,
      fecha: '2025-01-20',
      ejercicioId: 1,
      nombreEjercicio: 'Press de banca',
      grupoMuscular: 'Pecho',
      seriesCompletadas: 4,
      repeticionesCompletadas: 10,
      pesoUtilizado: 80,
      volumen: 3200,
      nivelEsfuerzo: 'MODERADO',
      notas: 'Buena sesion'
    },
    {
      id: 2,
      fecha: '2025-01-21',
      ejercicioId: 2,
      nombreEjercicio: 'Sentadilla',
      grupoMuscular: 'Piernas',
      seriesCompletadas: 5,
      repeticionesCompletadas: 8,
      pesoUtilizado: 100,
      volumen: 4000,
      nivelEsfuerzo: 'DIFICIL',
      notas: ''
    }
  ];

  const historialNutricionMock: NutritionHistoryItem[] = [
    {
      id: 1,
      fecha: '2025-01-20',
      tipoComida: 'DESAYUNO',
      caloriasConsumidas: 500,
      proteinasConsumidas: 35,
      carbohidratosConsumidos: 60,
      grasasConsumidas: 15,
      descripcionComida: 'Avena con huevos'
    },
    {
      id: 2,
      fecha: '2025-01-20',
      tipoComida: 'COMIDA',
      caloriasConsumidas: 800,
      proteinasConsumidas: 50,
      carbohidratosConsumidos: 80,
      grasasConsumidas: 25,
      descripcionComida: 'Pollo con arroz'
    }
  ];

  const registroEntrenamientoMock: RegistrarEntrenamientoDTO = {
    ejercicioId: 1,
    fecha: '2025-01-21',
    seriesCompletadas: 4,
    repeticionesCompletadas: 10,
    pesoUtilizado: 82.5,
    tiempoDescansoReal: 90,
    duracionMinutos: 45,
    nivelEsfuerzo: 'MODERADO',
    notas: 'Sesion normal'
  };

  const registroNutricionMock: RegistrarNutricionDTO = {
    fecha: '2025-01-21',
    tipoComida: 'DESAYUNO',
    caloriasConsumidas: 550,
    proteinasConsumidas: 40,
    carbohidratosConsumidos: 65,
    grasasConsumidas: 18,
    descripcionComida: 'Tortilla de claras con avena'
  };

  // ==========================================
  // CONFIGURACION
  // ==========================================

  beforeEach(() => {
    evaluationServiceSpy = jasmine.createSpyObj('ProgressEvaluationService', [
      'logWorkout',
      'logNutrition',
      'evaluateTraining',
      'evaluateNutrition',
      'evaluateFull',
      'getEvaluationHistory',
      'getWorkoutHistory',
      'getNutritionHistory'
    ]);

    toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);

    TestBed.configureTestingModule({
      providers: [
        ProgressEvaluationStore,
        { provide: ProgressEvaluationService, useValue: evaluationServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    });

    store = TestBed.inject(ProgressEvaluationStore);
  });

  // ==========================================
  // TESTS DE CREACION
  // ==========================================

  describe('Creacion del store', () => {
    it('deberia crearse correctamente', () => {
      expect(store).toBeTruthy();
    });

    it('deberia inicializarse con valores por defecto', () => {
      expect(store.currentEvaluation()).toBeNull();
      expect(store.evaluationHistory()).toEqual([]);
      expect(store.workoutHistory()).toEqual([]);
      expect(store.nutritionHistory()).toEqual([]);
      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
    });

    it('deberia tener hasData en false inicialmente', () => {
      expect(store.hasData()).toBeFalse();
    });
  });

  // ==========================================
  // TESTS DE COMPUTED VALUES
  // ==========================================

  describe('Computed values', () => {
    describe('cuando no hay evaluacion', () => {
      it('trainingTrend deberia ser null', () => {
        expect(store.trainingTrend()).toBeNull();
      });

      it('nutritionTrend deberia ser null', () => {
        expect(store.nutritionTrend()).toBeNull();
      });

      it('aiFeedback deberia ser string vacio', () => {
        expect(store.aiFeedback()).toBe('');
      });

      it('recommendations deberia ser array vacio', () => {
        expect(store.recommendations()).toEqual([]);
      });

      it('achievements deberia ser array vacio', () => {
        expect(store.achievements()).toEqual([]);
      });

      it('trainingConsistency deberia ser 0', () => {
        expect(store.trainingConsistency()).toBe(0);
      });

      it('calorieAdherence deberia ser 0', () => {
        expect(store.calorieAdherence()).toBe(0);
      });

      it('proteinAdherence deberia ser 0', () => {
        expect(store.proteinAdherence()).toBe(0);
      });

      it('hasPlateau deberia ser false', () => {
        expect(store.hasPlateau()).toBeFalse();
      });

      it('plateauMessage deberia ser string vacio', () => {
        expect(store.plateauMessage()).toBe('');
      });

      it('trainingVolume deberia ser 0', () => {
        expect(store.trainingVolume()).toBe(0);
      });

      it('strengthImprovement deberia ser 0', () => {
        expect(store.strengthImprovement()).toBe(0);
      });

      it('averageCalories deberia ser 0', () => {
        expect(store.averageCalories()).toBe(0);
      });

      it('targetCalories deberia ser 0', () => {
        expect(store.targetCalories()).toBe(0);
      });

      it('nutritionPatterns deberia ser array vacio', () => {
        expect(store.nutritionPatterns()).toEqual([]);
      });
    });

    describe('cuando hay evaluacion de entrenamiento', () => {
      beforeEach(fakeAsync(() => {
        evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionEntrenamientoMock));
        store.loadTrainingEvaluation();
        tick();
      }));

      it('trainingTrend deberia reflejar la tendencia de entrenamiento', () => {
        expect(store.trainingTrend()).toBe('MEJORANDO');
      });

      it('aiFeedback deberia mostrar el feedback de IA', () => {
        expect(store.aiFeedback()).toBe('Buen progreso en entrenamiento');
      });

      it('recommendations deberia contener las recomendaciones', () => {
        expect(store.recommendations().length).toBe(2);
        expect(store.recommendations()).toContain('Aumentar peso en press banca');
      });

      it('achievements deberia contener los logros', () => {
        expect(store.achievements().length).toBe(1);
        expect(store.achievements()).toContain('Superaste tu PR en sentadilla');
      });

      it('trainingConsistency deberia ser 80', () => {
        expect(store.trainingConsistency()).toBe(80);
      });

      it('trainingVolume deberia ser 15000', () => {
        expect(store.trainingVolume()).toBe(15000);
      });

      it('strengthImprovement deberia ser 5', () => {
        expect(store.strengthImprovement()).toBe(5);
      });

      it('hasData deberia ser true', () => {
        expect(store.hasData()).toBeTrue();
      });
    });

    describe('cuando hay evaluacion de nutricion', () => {
      beforeEach(fakeAsync(() => {
        evaluationServiceSpy.evaluateNutrition.and.returnValue(of(evaluacionNutricionMock));
        store.loadNutritionEvaluation();
        tick();
      }));

      it('nutritionTrend deberia reflejar la tendencia de nutricion', () => {
        expect(store.nutritionTrend()).toBe('ESTABLE');
      });

      it('calorieAdherence deberia ser 88', () => {
        expect(store.calorieAdherence()).toBe(88);
      });

      it('proteinAdherence deberia ser 83', () => {
        expect(store.proteinAdherence()).toBe(83);
      });

      it('averageCalories deberia ser 2200', () => {
        expect(store.averageCalories()).toBe(2200);
      });

      it('targetCalories deberia ser 2500', () => {
        expect(store.targetCalories()).toBe(2500);
      });

      it('nutritionPatterns deberia contener los patrones detectados', () => {
        expect(store.nutritionPatterns()).toContain('PROTEINAS_INSUFICIENTES');
      });
    });

    describe('cuando hay evaluacion completa con plateau', () => {
      beforeEach(fakeAsync(() => {
        evaluationServiceSpy.evaluateFull.and.returnValue(of(evaluacionCompletaMock));
        store.loadFullEvaluation();
        tick();
      }));

      it('hasPlateau deberia ser true', () => {
        expect(store.hasPlateau()).toBeTrue();
      });

      it('plateauMessage deberia contener el mensaje de plateau', () => {
        expect(store.plateauMessage()).toBe('Detectado plateau en press de banca');
      });

      it('trainingConsistency deberia ser 100', () => {
        expect(store.trainingConsistency()).toBe(100);
      });
    });
  });

  // ==========================================
  // TESTS DE TREND ICONS Y CLASSES
  // ==========================================

  describe('Trend icons y classes', () => {
    describe('trainingTrendIcon', () => {
      it('deberia retornar ? cuando no hay evaluacion', () => {
        expect(store.trainingTrendIcon()).toBe('?');
      });

      it('deberia retornar icono correcto para MEJORANDO', fakeAsync(() => {
        evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionEntrenamientoMock));
        store.loadTrainingEvaluation();
        tick();
        expect(store.trainingTrendIcon()).toBe('↗');
      }));

      it('deberia retornar icono correcto para PLATEAU', fakeAsync(() => {
        evaluationServiceSpy.evaluateFull.and.returnValue(of(evaluacionCompletaMock));
        store.loadFullEvaluation();
        tick();
        expect(store.trainingTrendIcon()).toBe('⏸');
      }));

      it('deberia retornar icono correcto para RETROCEDIENDO', fakeAsync(() => {
        const evaluacionRetrocediendo = {
          ...evaluacionEntrenamientoMock,
          tendenciaEntrenamiento: 'RETROCEDIENDO' as TendenciaProgreso
        };
        evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionRetrocediendo));
        store.loadTrainingEvaluation();
        tick();
        expect(store.trainingTrendIcon()).toBe('↘');
      }));
    });

    describe('nutritionTrendIcon', () => {
      it('deberia retornar ? cuando no hay evaluacion', () => {
        expect(store.nutritionTrendIcon()).toBe('?');
      });

      it('deberia retornar icono correcto para ESTABLE', fakeAsync(() => {
        evaluationServiceSpy.evaluateNutrition.and.returnValue(of(evaluacionNutricionMock));
        store.loadNutritionEvaluation();
        tick();
        expect(store.nutritionTrendIcon()).toBe('→');
      }));
    });

    describe('trainingTrendClass', () => {
      it('deberia retornar trend-unknown cuando no hay evaluacion', () => {
        expect(store.trainingTrendClass()).toBe('trend-unknown');
      });

      it('deberia retornar trend-improving para MEJORANDO', fakeAsync(() => {
        evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionEntrenamientoMock));
        store.loadTrainingEvaluation();
        tick();
        expect(store.trainingTrendClass()).toBe('trend-improving');
      }));

      it('deberia retornar trend-plateau para PLATEAU', fakeAsync(() => {
        evaluationServiceSpy.evaluateFull.and.returnValue(of(evaluacionCompletaMock));
        store.loadFullEvaluation();
        tick();
        expect(store.trainingTrendClass()).toBe('trend-plateau');
      }));

      it('deberia retornar trend-declining para RETROCEDIENDO', fakeAsync(() => {
        const evaluacionRetrocediendo = {
          ...evaluacionEntrenamientoMock,
          tendenciaEntrenamiento: 'RETROCEDIENDO' as TendenciaProgreso
        };
        evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionRetrocediendo));
        store.loadTrainingEvaluation();
        tick();
        expect(store.trainingTrendClass()).toBe('trend-declining');
      }));
    });

    describe('nutritionTrendClass', () => {
      it('deberia retornar trend-unknown cuando no hay evaluacion', () => {
        expect(store.nutritionTrendClass()).toBe('trend-unknown');
      });

      it('deberia retornar trend-stable para ESTABLE', fakeAsync(() => {
        evaluationServiceSpy.evaluateNutrition.and.returnValue(of(evaluacionNutricionMock));
        store.loadNutritionEvaluation();
        tick();
        expect(store.nutritionTrendClass()).toBe('trend-stable');
      }));
    });
  });

  // ==========================================
  // TESTS DE logWorkout
  // ==========================================

  describe('logWorkout', () => {
    it('deberia establecer loading en true al iniciar', () => {
      evaluationServiceSpy.logWorkout.and.returnValue(of({ message: 'OK', id: 1, volumen: 3200 }).pipe(delay(100)));
      evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionEntrenamientoMock).pipe(delay(100)));

      store.logWorkout(registroEntrenamientoMock);

      expect(store.loading()).toBeTrue();
    });

    it('deberia llamar al servicio con los datos correctos', fakeAsync(() => {
      evaluationServiceSpy.logWorkout.and.returnValue(of({ message: 'OK', id: 1, volumen: 3200 }));
      evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionEntrenamientoMock));

      store.logWorkout(registroEntrenamientoMock);
      tick();

      expect(evaluationServiceSpy.logWorkout).toHaveBeenCalledWith(registroEntrenamientoMock);
    }));

    it('deberia mostrar toast de exito al registrar', fakeAsync(() => {
      evaluationServiceSpy.logWorkout.and.returnValue(of({ message: 'OK', id: 1, volumen: 3200 }));
      evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionEntrenamientoMock));

      store.logWorkout(registroEntrenamientoMock);
      tick();

      expect(toastServiceSpy.success).toHaveBeenCalledWith('Entrenamiento registrado');
    }));

    it('deberia cargar evaluacion de entrenamiento automaticamente', fakeAsync(() => {
      evaluationServiceSpy.logWorkout.and.returnValue(of({ message: 'OK', id: 1, volumen: 3200 }));
      evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionEntrenamientoMock));

      store.logWorkout(registroEntrenamientoMock);
      tick();

      expect(evaluationServiceSpy.evaluateTraining).toHaveBeenCalled();
    }));

    it('deberia establecer loading en false al completar', fakeAsync(() => {
      evaluationServiceSpy.logWorkout.and.returnValue(of({ message: 'OK', id: 1, volumen: 3200 }));
      evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionEntrenamientoMock));

      store.logWorkout(registroEntrenamientoMock);
      tick();

      expect(store.loading()).toBeFalse();
    }));

    it('deberia manejar errores correctamente', fakeAsync(() => {
      evaluationServiceSpy.logWorkout.and.returnValue(throwError(() => new Error('Error de red')));

      store.logWorkout(registroEntrenamientoMock);
      tick();

      expect(store.error()).toBe('Error al registrar entrenamiento');
      expect(toastServiceSpy.error).toHaveBeenCalledWith('Error al registrar el entrenamiento');
      expect(store.loading()).toBeFalse();
    }));

    it('deberia limpiar el error antes de iniciar', fakeAsync(() => {
      // Primero establecemos un error
      evaluationServiceSpy.logWorkout.and.returnValue(throwError(() => new Error('Error')));
      store.logWorkout(registroEntrenamientoMock);
      tick();

      expect(store.error()).toBe('Error al registrar entrenamiento');

      // Ahora intentamos de nuevo exitosamente
      evaluationServiceSpy.logWorkout.and.returnValue(of({ message: 'OK', id: 1, volumen: 3200 }));
      evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionEntrenamientoMock));

      store.logWorkout(registroEntrenamientoMock);

      // El error deberia limpiarse al iniciar
      expect(store.error()).toBeNull();

      tick();
    }));
  });

  // ==========================================
  // TESTS DE logNutrition
  // ==========================================

  describe('logNutrition', () => {
    it('deberia establecer loading en true al iniciar', () => {
      evaluationServiceSpy.logNutrition.and.returnValue(of({ message: 'OK', id: 1 }).pipe(delay(100)));
      evaluationServiceSpy.evaluateNutrition.and.returnValue(of(evaluacionNutricionMock).pipe(delay(100)));

      store.logNutrition(registroNutricionMock);

      expect(store.loading()).toBeTrue();
    });

    it('deberia llamar al servicio con los datos correctos', fakeAsync(() => {
      evaluationServiceSpy.logNutrition.and.returnValue(of({ message: 'OK', id: 1 }));
      evaluationServiceSpy.evaluateNutrition.and.returnValue(of(evaluacionNutricionMock));

      store.logNutrition(registroNutricionMock);
      tick();

      expect(evaluationServiceSpy.logNutrition).toHaveBeenCalledWith(registroNutricionMock);
    }));

    it('deberia mostrar toast de exito al registrar', fakeAsync(() => {
      evaluationServiceSpy.logNutrition.and.returnValue(of({ message: 'OK', id: 1 }));
      evaluationServiceSpy.evaluateNutrition.and.returnValue(of(evaluacionNutricionMock));

      store.logNutrition(registroNutricionMock);
      tick();

      expect(toastServiceSpy.success).toHaveBeenCalledWith('Comida registrada');
    }));

    it('deberia cargar evaluacion de nutricion automaticamente', fakeAsync(() => {
      evaluationServiceSpy.logNutrition.and.returnValue(of({ message: 'OK', id: 1 }));
      evaluationServiceSpy.evaluateNutrition.and.returnValue(of(evaluacionNutricionMock));

      store.logNutrition(registroNutricionMock);
      tick();

      expect(evaluationServiceSpy.evaluateNutrition).toHaveBeenCalled();
    }));

    it('deberia establecer loading en false al completar', fakeAsync(() => {
      evaluationServiceSpy.logNutrition.and.returnValue(of({ message: 'OK', id: 1 }));
      evaluationServiceSpy.evaluateNutrition.and.returnValue(of(evaluacionNutricionMock));

      store.logNutrition(registroNutricionMock);
      tick();

      expect(store.loading()).toBeFalse();
    }));

    it('deberia manejar errores correctamente', fakeAsync(() => {
      evaluationServiceSpy.logNutrition.and.returnValue(throwError(() => new Error('Error de red')));

      store.logNutrition(registroNutricionMock);
      tick();

      expect(store.error()).toBe('Error al registrar nutricion');
      expect(toastServiceSpy.error).toHaveBeenCalledWith('Error al registrar la comida');
      expect(store.loading()).toBeFalse();
    }));
  });

  // ==========================================
  // TESTS DE loadTrainingEvaluation
  // ==========================================

  describe('loadTrainingEvaluation', () => {
    it('deberia establecer loading en true al iniciar', () => {
      evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionEntrenamientoMock).pipe(delay(100)));

      store.loadTrainingEvaluation();

      expect(store.loading()).toBeTrue();
    });

    it('deberia llamar al servicio evaluateTraining', fakeAsync(() => {
      evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionEntrenamientoMock));

      store.loadTrainingEvaluation();
      tick();

      expect(evaluationServiceSpy.evaluateTraining).toHaveBeenCalled();
    }));

    it('deberia actualizar currentEvaluation con los datos recibidos', fakeAsync(() => {
      evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionEntrenamientoMock));

      store.loadTrainingEvaluation();
      tick();

      expect(store.currentEvaluation()).toEqual(evaluacionEntrenamientoMock);
    }));

    it('deberia establecer loading en false al completar', fakeAsync(() => {
      evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionEntrenamientoMock));

      store.loadTrainingEvaluation();
      tick();

      expect(store.loading()).toBeFalse();
    }));

    it('deberia manejar errores y establecer mensaje de error', fakeAsync(() => {
      evaluationServiceSpy.evaluateTraining.and.returnValue(throwError(() => new Error('Error')));

      store.loadTrainingEvaluation();
      tick();

      expect(store.error()).toBe('Error al cargar evaluacion de entrenamiento');
      expect(store.loading()).toBeFalse();
    }));

    it('no deberia actualizar currentEvaluation si hay error', fakeAsync(() => {
      evaluationServiceSpy.evaluateTraining.and.returnValue(throwError(() => new Error('Error')));

      store.loadTrainingEvaluation();
      tick();

      expect(store.currentEvaluation()).toBeNull();
    }));

    it('deberia limpiar error previo al iniciar nueva carga', fakeAsync(() => {
      // Generar error primero
      evaluationServiceSpy.evaluateTraining.and.returnValue(throwError(() => new Error('Error')));
      store.loadTrainingEvaluation();
      tick();

      expect(store.error()).toBe('Error al cargar evaluacion de entrenamiento');

      // Nueva carga exitosa
      evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionEntrenamientoMock));
      store.loadTrainingEvaluation();

      expect(store.error()).toBeNull();
      tick();
    }));
  });

  // ==========================================
  // TESTS DE loadNutritionEvaluation
  // ==========================================

  describe('loadNutritionEvaluation', () => {
    it('deberia establecer loading en true al iniciar', () => {
      evaluationServiceSpy.evaluateNutrition.and.returnValue(of(evaluacionNutricionMock).pipe(delay(100)));

      store.loadNutritionEvaluation();

      expect(store.loading()).toBeTrue();
    });

    it('deberia llamar al servicio evaluateNutrition', fakeAsync(() => {
      evaluationServiceSpy.evaluateNutrition.and.returnValue(of(evaluacionNutricionMock));

      store.loadNutritionEvaluation();
      tick();

      expect(evaluationServiceSpy.evaluateNutrition).toHaveBeenCalled();
    }));

    it('deberia actualizar currentEvaluation con los datos recibidos', fakeAsync(() => {
      evaluationServiceSpy.evaluateNutrition.and.returnValue(of(evaluacionNutricionMock));

      store.loadNutritionEvaluation();
      tick();

      expect(store.currentEvaluation()).toEqual(evaluacionNutricionMock);
    }));

    it('deberia establecer loading en false al completar', fakeAsync(() => {
      evaluationServiceSpy.evaluateNutrition.and.returnValue(of(evaluacionNutricionMock));

      store.loadNutritionEvaluation();
      tick();

      expect(store.loading()).toBeFalse();
    }));

    it('deberia manejar errores y establecer mensaje de error', fakeAsync(() => {
      evaluationServiceSpy.evaluateNutrition.and.returnValue(throwError(() => new Error('Error')));

      store.loadNutritionEvaluation();
      tick();

      expect(store.error()).toBe('Error al cargar evaluacion de nutricion');
      expect(store.loading()).toBeFalse();
    }));
  });

  // ==========================================
  // TESTS DE loadFullEvaluation
  // ==========================================

  describe('loadFullEvaluation', () => {
    it('deberia establecer loading en true al iniciar', () => {
      evaluationServiceSpy.evaluateFull.and.returnValue(of(evaluacionCompletaMock).pipe(delay(100)));

      store.loadFullEvaluation();

      expect(store.loading()).toBeTrue();
    });

    it('deberia llamar al servicio evaluateFull', fakeAsync(() => {
      evaluationServiceSpy.evaluateFull.and.returnValue(of(evaluacionCompletaMock));

      store.loadFullEvaluation();
      tick();

      expect(evaluationServiceSpy.evaluateFull).toHaveBeenCalled();
    }));

    it('deberia actualizar currentEvaluation con los datos recibidos', fakeAsync(() => {
      evaluationServiceSpy.evaluateFull.and.returnValue(of(evaluacionCompletaMock));

      store.loadFullEvaluation();
      tick();

      expect(store.currentEvaluation()).toEqual(evaluacionCompletaMock);
    }));

    it('deberia establecer loading en false al completar', fakeAsync(() => {
      evaluationServiceSpy.evaluateFull.and.returnValue(of(evaluacionCompletaMock));

      store.loadFullEvaluation();
      tick();

      expect(store.loading()).toBeFalse();
    }));

    it('deberia manejar errores y establecer mensaje de error', fakeAsync(() => {
      evaluationServiceSpy.evaluateFull.and.returnValue(throwError(() => new Error('Error')));

      store.loadFullEvaluation();
      tick();

      expect(store.error()).toBe('Error al cargar evaluacion completa');
      expect(store.loading()).toBeFalse();
    }));
  });

  // ==========================================
  // TESTS DE loadHistory
  // ==========================================

  describe('loadHistory', () => {
    it('deberia llamar al servicio con limite por defecto de 10', fakeAsync(() => {
      evaluationServiceSpy.getEvaluationHistory.and.returnValue(of(historialEvaluacionesMock));

      store.loadHistory();
      tick();

      expect(evaluationServiceSpy.getEvaluationHistory).toHaveBeenCalledWith(10);
    }));

    it('deberia llamar al servicio con limite personalizado', fakeAsync(() => {
      evaluationServiceSpy.getEvaluationHistory.and.returnValue(of(historialEvaluacionesMock));

      store.loadHistory(20);
      tick();

      expect(evaluationServiceSpy.getEvaluationHistory).toHaveBeenCalledWith(20);
    }));

    it('deberia actualizar evaluationHistory con los datos recibidos', fakeAsync(() => {
      evaluationServiceSpy.getEvaluationHistory.and.returnValue(of(historialEvaluacionesMock));

      store.loadHistory();
      tick();

      expect(store.evaluationHistory()).toEqual(historialEvaluacionesMock);
    }));

    it('deberia establecer array vacio en caso de error', fakeAsync(() => {
      evaluationServiceSpy.getEvaluationHistory.and.returnValue(throwError(() => new Error('Error')));

      store.loadHistory();
      tick();

      expect(store.evaluationHistory()).toEqual([]);
    }));
  });

  // ==========================================
  // TESTS DE loadWorkoutHistory
  // ==========================================

  describe('loadWorkoutHistory', () => {
    const fechaDesde = '2025-01-15';
    const fechaHasta = '2025-01-21';

    it('deberia llamar al servicio con las fechas correctas', fakeAsync(() => {
      evaluationServiceSpy.getWorkoutHistory.and.returnValue(of(historialEntrenamientoMock));

      store.loadWorkoutHistory(fechaDesde, fechaHasta);
      tick();

      expect(evaluationServiceSpy.getWorkoutHistory).toHaveBeenCalledWith(fechaDesde, fechaHasta);
    }));

    it('deberia actualizar workoutHistory con los datos recibidos', fakeAsync(() => {
      evaluationServiceSpy.getWorkoutHistory.and.returnValue(of(historialEntrenamientoMock));

      store.loadWorkoutHistory(fechaDesde, fechaHasta);
      tick();

      expect(store.workoutHistory()).toEqual(historialEntrenamientoMock);
    }));

    it('deberia establecer array vacio en caso de error', fakeAsync(() => {
      evaluationServiceSpy.getWorkoutHistory.and.returnValue(throwError(() => new Error('Error')));

      store.loadWorkoutHistory(fechaDesde, fechaHasta);
      tick();

      expect(store.workoutHistory()).toEqual([]);
    }));
  });

  // ==========================================
  // TESTS DE loadNutritionHistory
  // ==========================================

  describe('loadNutritionHistory', () => {
    const fechaDesde = '2025-01-15';
    const fechaHasta = '2025-01-21';

    it('deberia llamar al servicio con las fechas correctas', fakeAsync(() => {
      evaluationServiceSpy.getNutritionHistory.and.returnValue(of(historialNutricionMock));

      store.loadNutritionHistory(fechaDesde, fechaHasta);
      tick();

      expect(evaluationServiceSpy.getNutritionHistory).toHaveBeenCalledWith(fechaDesde, fechaHasta);
    }));

    it('deberia actualizar nutritionHistory con los datos recibidos', fakeAsync(() => {
      evaluationServiceSpy.getNutritionHistory.and.returnValue(of(historialNutricionMock));

      store.loadNutritionHistory(fechaDesde, fechaHasta);
      tick();

      expect(store.nutritionHistory()).toEqual(historialNutricionMock);
    }));

    it('deberia establecer array vacio en caso de error', fakeAsync(() => {
      evaluationServiceSpy.getNutritionHistory.and.returnValue(throwError(() => new Error('Error')));

      store.loadNutritionHistory(fechaDesde, fechaHasta);
      tick();

      expect(store.nutritionHistory()).toEqual([]);
    }));
  });

  // ==========================================
  // TESTS DE refresh
  // ==========================================

  describe('refresh', () => {
    it('deberia cargar evaluacion de entrenamiento si el ultimo tipo fue training', fakeAsync(() => {
      evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionEntrenamientoMock));

      // Primero cargamos training para establecer el tipo
      store.loadTrainingEvaluation();
      tick();

      // Reseteamos el spy para verificar la llamada de refresh
      evaluationServiceSpy.evaluateTraining.calls.reset();

      store.refresh();
      tick();

      expect(evaluationServiceSpy.evaluateTraining).toHaveBeenCalled();
    }));

    it('deberia cargar evaluacion de nutricion si el ultimo tipo fue nutrition', fakeAsync(() => {
      evaluationServiceSpy.evaluateNutrition.and.returnValue(of(evaluacionNutricionMock));

      // Primero cargamos nutrition para establecer el tipo
      store.loadNutritionEvaluation();
      tick();

      // Reseteamos el spy para verificar la llamada de refresh
      evaluationServiceSpy.evaluateNutrition.calls.reset();

      store.refresh();
      tick();

      expect(evaluationServiceSpy.evaluateNutrition).toHaveBeenCalled();
    }));

    it('deberia cargar evaluacion completa si el ultimo tipo fue full', fakeAsync(() => {
      evaluationServiceSpy.evaluateFull.and.returnValue(of(evaluacionCompletaMock));

      // Primero cargamos full para establecer el tipo
      store.loadFullEvaluation();
      tick();

      // Reseteamos el spy para verificar la llamada de refresh
      evaluationServiceSpy.evaluateFull.calls.reset();

      store.refresh();
      tick();

      expect(evaluationServiceSpy.evaluateFull).toHaveBeenCalled();
    }));

    it('deberia cargar evaluacion completa por defecto', fakeAsync(() => {
      evaluationServiceSpy.evaluateFull.and.returnValue(of(evaluacionCompletaMock));

      store.refresh();
      tick();

      expect(evaluationServiceSpy.evaluateFull).toHaveBeenCalled();
    }));
  });

  // ==========================================
  // TESTS DE clear
  // ==========================================

  describe('clear', () => {
    it('deberia limpiar currentEvaluation', fakeAsync(() => {
      evaluationServiceSpy.evaluateFull.and.returnValue(of(evaluacionCompletaMock));
      store.loadFullEvaluation();
      tick();

      expect(store.currentEvaluation()).not.toBeNull();

      store.clear();

      expect(store.currentEvaluation()).toBeNull();
    }));

    it('deberia limpiar evaluationHistory', fakeAsync(() => {
      evaluationServiceSpy.getEvaluationHistory.and.returnValue(of(historialEvaluacionesMock));
      store.loadHistory();
      tick();

      expect(store.evaluationHistory().length).toBeGreaterThan(0);

      store.clear();

      expect(store.evaluationHistory()).toEqual([]);
    }));

    it('deberia limpiar workoutHistory', fakeAsync(() => {
      evaluationServiceSpy.getWorkoutHistory.and.returnValue(of(historialEntrenamientoMock));
      store.loadWorkoutHistory('2025-01-15', '2025-01-21');
      tick();

      expect(store.workoutHistory().length).toBeGreaterThan(0);

      store.clear();

      expect(store.workoutHistory()).toEqual([]);
    }));

    it('deberia limpiar nutritionHistory', fakeAsync(() => {
      evaluationServiceSpy.getNutritionHistory.and.returnValue(of(historialNutricionMock));
      store.loadNutritionHistory('2025-01-15', '2025-01-21');
      tick();

      expect(store.nutritionHistory().length).toBeGreaterThan(0);

      store.clear();

      expect(store.nutritionHistory()).toEqual([]);
    }));

    it('deberia establecer loading en false', () => {
      store.clear();

      expect(store.loading()).toBeFalse();
    });

    it('deberia limpiar error', fakeAsync(() => {
      evaluationServiceSpy.evaluateFull.and.returnValue(throwError(() => new Error('Error')));
      store.loadFullEvaluation();
      tick();

      expect(store.error()).not.toBeNull();

      store.clear();

      expect(store.error()).toBeNull();
    }));
  });

  // ==========================================
  // TESTS DE clearError
  // ==========================================

  describe('clearError', () => {
    it('deberia limpiar el error', fakeAsync(() => {
      evaluationServiceSpy.evaluateFull.and.returnValue(throwError(() => new Error('Error')));
      store.loadFullEvaluation();
      tick();

      expect(store.error()).toBe('Error al cargar evaluacion completa');

      store.clearError();

      expect(store.error()).toBeNull();
    }));

    it('deberia funcionar cuando no hay error previo', () => {
      expect(store.error()).toBeNull();

      store.clearError();

      expect(store.error()).toBeNull();
    });
  });

  // ==========================================
  // TESTS DE getTrendText
  // ==========================================

  describe('getTrendText', () => {
    it('deberia retornar "Mejorando" para MEJORANDO', () => {
      expect(store.getTrendText('MEJORANDO')).toBe('Mejorando');
    });

    it('deberia retornar "Estable" para ESTABLE', () => {
      expect(store.getTrendText('ESTABLE')).toBe('Estable');
    });

    it('deberia retornar "Retrocediendo" para RETROCEDIENDO', () => {
      expect(store.getTrendText('RETROCEDIENDO')).toBe('Retrocediendo');
    });

    it('deberia retornar "Plateau" para PLATEAU', () => {
      expect(store.getTrendText('PLATEAU')).toBe('Plateau');
    });

    it('deberia retornar "Sin datos" para null', () => {
      expect(store.getTrendText(null)).toBe('Sin datos');
    });
  });

  // ==========================================
  // TESTS DE getPatternText
  // ==========================================

  describe('getPatternText', () => {
    it('deberia retornar "Consumo bajo frecuente" para BAJO_CONSUMO_FRECUENTE', () => {
      expect(store.getPatternText('BAJO_CONSUMO_FRECUENTE')).toBe('Consumo bajo frecuente');
    });

    it('deberia retornar "Consumo alto frecuente" para SOBRE_CONSUMO_FRECUENTE', () => {
      expect(store.getPatternText('SOBRE_CONSUMO_FRECUENTE')).toBe('Consumo alto frecuente');
    });

    it('deberia retornar "Proteinas insuficientes" para PROTEINAS_INSUFICIENTES', () => {
      expect(store.getPatternText('PROTEINAS_INSUFICIENTES')).toBe('Proteinas insuficientes');
    });

    it('deberia retornar "Hidratacion baja" para HIDRATACION_BAJA', () => {
      expect(store.getPatternText('HIDRATACION_BAJA')).toBe('Hidratacion baja');
    });

    it('deberia retornar "Datos insuficientes" para SIN_DATOS_SUFICIENTES', () => {
      expect(store.getPatternText('SIN_DATOS_SUFICIENTES')).toBe('Datos insuficientes');
    });

    it('deberia retornar el mismo patron para valores desconocidos', () => {
      expect(store.getPatternText('PATRON_DESCONOCIDO')).toBe('PATRON_DESCONOCIDO');
    });
  });

  // ==========================================
  // TESTS DE INTEGRACION
  // ==========================================

  describe('Integracion', () => {
    it('deberia mantener estado consistente despues de multiples operaciones', fakeAsync(() => {
      // Cargar evaluacion completa
      evaluationServiceSpy.evaluateFull.and.returnValue(of(evaluacionCompletaMock));
      store.loadFullEvaluation();
      tick();

      expect(store.hasData()).toBeTrue();
      expect(store.trainingTrend()).toBe('PLATEAU');
      expect(store.nutritionTrend()).toBe('MEJORANDO');

      // Cargar historial
      evaluationServiceSpy.getEvaluationHistory.and.returnValue(of(historialEvaluacionesMock));
      store.loadHistory();
      tick();

      expect(store.evaluationHistory().length).toBe(3);

      // Verificar que la evaluacion actual no cambio
      expect(store.currentEvaluation()).toEqual(evaluacionCompletaMock);
    }));

    it('deberia actualizar computed values cuando cambia currentEvaluation', fakeAsync(() => {
      // Inicialmente sin datos
      expect(store.trainingConsistency()).toBe(0);
      expect(store.calorieAdherence()).toBe(0);

      // Cargar evaluacion de entrenamiento
      evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionEntrenamientoMock));
      store.loadTrainingEvaluation();
      tick();

      expect(store.trainingConsistency()).toBe(80);
      expect(store.calorieAdherence()).toBe(0); // Nutricion no incluida

      // Cargar evaluacion completa
      evaluationServiceSpy.evaluateFull.and.returnValue(of(evaluacionCompletaMock));
      store.loadFullEvaluation();
      tick();

      expect(store.trainingConsistency()).toBe(100);
      expect(store.calorieAdherence()).toBe(96);
    }));

    it('deberia permitir registro seguido de refresh', fakeAsync(() => {
      // Registrar entrenamiento
      evaluationServiceSpy.logWorkout.and.returnValue(of({ message: 'OK', id: 1, volumen: 3200 }));
      evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionEntrenamientoMock));

      store.logWorkout(registroEntrenamientoMock);
      tick();

      expect(store.currentEvaluation()).toEqual(evaluacionEntrenamientoMock);

      // Refresh deberia cargar training porque fue el ultimo tipo
      evaluationServiceSpy.evaluateTraining.calls.reset();
      evaluationServiceSpy.evaluateTraining.and.returnValue(of({
        ...evaluacionEntrenamientoMock,
        entrenamientoResumen: {
          ...evaluacionEntrenamientoMock.entrenamientoResumen!,
          consistenciaPorcentaje: 85
        }
      }));

      store.refresh();
      tick();

      expect(evaluationServiceSpy.evaluateTraining).toHaveBeenCalled();
      expect(store.trainingConsistency()).toBe(85);
    }));
  });

  // ==========================================
  // TESTS ADICIONALES PARA 100% COBERTURA
  // ==========================================

  describe('Cobertura completa de computed values con datos nulos', () => {
    it('todos los computed deberían manejar evaluacion null correctamente', () => {
      // Verificar que todos los computed manejan null sin errores
      expect(store.trainingTrend()).toBeNull();
      expect(store.nutritionTrend()).toBeNull();
      expect(store.aiFeedback()).toBe('');
      expect(store.recommendations()).toEqual([]);
      expect(store.achievements()).toEqual([]);
      expect(store.trainingConsistency()).toBe(0);
      expect(store.calorieAdherence()).toBe(0);
      expect(store.proteinAdherence()).toBe(0);
      expect(store.hasPlateau()).toBeFalse();
      expect(store.plateauMessage()).toBe('');
      expect(store.trainingVolume()).toBe(0);
      expect(store.strengthImprovement()).toBe(0);
      expect(store.averageCalories()).toBe(0);
      expect(store.targetCalories()).toBe(0);
      expect(store.nutritionPatterns()).toEqual([]);
      expect(store.hasData()).toBeFalse();
      expect(store.trainingTrendIcon()).toBe('?');
      expect(store.nutritionTrendIcon()).toBe('?');
      expect(store.trainingTrendClass()).toBe('trend-unknown');
      expect(store.nutritionTrendClass()).toBe('trend-unknown');
    });
  });

  describe('Test de todos los estados de TendenciaProgreso', () => {
    it('deberia retornar icono y clase correctos para ESTABLE', fakeAsync(() => {
      const evaluacionEstable = {
        ...evaluacionEntrenamientoMock,
        tendenciaEntrenamiento: 'ESTABLE' as TendenciaProgreso
      };
      evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionEstable));
      store.loadTrainingEvaluation();
      tick();

      expect(store.trainingTrendIcon()).toBe('→');
      expect(store.trainingTrendClass()).toBe('trend-stable');
    }));
  });

  describe('Test de getPatternText con todos los patrones', () => {
    it('deberia manejar todos los patrones conocidos', () => {
      expect(store.getPatternText('BAJO_CONSUMO_FRECUENTE')).toBe('Consumo bajo frecuente');
      expect(store.getPatternText('SOBRE_CONSUMO_FRECUENTE')).toBe('Consumo alto frecuente');
      expect(store.getPatternText('PROTEINAS_INSUFICIENTES')).toBe('Proteinas insuficientes');
      expect(store.getPatternText('HIDRATACION_BAJA')).toBe('Hidratacion baja');
      expect(store.getPatternText('SIN_DATOS_SUFICIENTES')).toBe('Datos insuficientes');
      expect(store.getPatternText('PATRON_DESCONOCIDO')).toBe('PATRON_DESCONOCIDO');
    });
  });

  describe('Tests de loading states', () => {
    it('deberia establecer loading correctamente en loadTrainingEvaluation', () => {
      evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionEntrenamientoMock).pipe(delay(100)));

      store.loadTrainingEvaluation();

      expect(store.loading()).toBeTrue();
    });

    it('deberia establecer loading correctamente en loadNutritionEvaluation', () => {
      evaluationServiceSpy.evaluateNutrition.and.returnValue(of(evaluacionNutricionMock).pipe(delay(100)));

      store.loadNutritionEvaluation();

      expect(store.loading()).toBeTrue();
    });

    it('deberia establecer loading correctamente en loadFullEvaluation', () => {
      evaluationServiceSpy.evaluateFull.and.returnValue(of(evaluacionCompletaMock).pipe(delay(100)));

      store.loadFullEvaluation();

      expect(store.loading()).toBeTrue();
    });
  });

  describe('Tests de evaluaciones con nutricionResumen null', () => {
    it('deberia manejar evaluacion sin nutricionResumen', fakeAsync(() => {
      evaluationServiceSpy.evaluateTraining.and.returnValue(of(evaluacionEntrenamientoMock));
      store.loadTrainingEvaluation();
      tick();

      // Evaluacion de entrenamiento tiene nutricionResumen null
      expect(store.calorieAdherence()).toBe(0);
      expect(store.proteinAdherence()).toBe(0);
      expect(store.averageCalories()).toBe(0);
      expect(store.targetCalories()).toBe(0);
      expect(store.nutritionPatterns()).toEqual([]);
    }));
  });

  describe('Tests de evaluaciones con entrenamientoResumen null', () => {
    it('deberia manejar evaluacion sin entrenamientoResumen', fakeAsync(() => {
      evaluationServiceSpy.evaluateNutrition.and.returnValue(of(evaluacionNutricionMock));
      store.loadNutritionEvaluation();
      tick();

      // Evaluacion de nutricion tiene entrenamientoResumen null
      expect(store.trainingConsistency()).toBe(0);
      expect(store.hasPlateau()).toBeFalse();
      expect(store.plateauMessage()).toBe('');
      expect(store.trainingVolume()).toBe(0);
      expect(store.strengthImprovement()).toBe(0);
    }));
  });

  describe('Tests de manejo de errores en logWorkout', () => {
    it('deberia manejar error en evaluateTraining despues de logWorkout exitoso', fakeAsync(() => {
      evaluationServiceSpy.logWorkout.and.returnValue(of({ message: 'OK', id: 1, volumen: 3200 }));
      evaluationServiceSpy.evaluateTraining.and.returnValue(throwError(() => new Error('Error al evaluar')));

      store.logWorkout(registroEntrenamientoMock);
      tick();

      expect(toastServiceSpy.success).toHaveBeenCalledWith('Entrenamiento registrado');
      // La evaluacion falla silenciosamente despues del log exitoso
      expect(store.loading()).toBeFalse();
    }));
  });

  describe('Tests de manejo de errores en logNutrition', () => {
    it('deberia manejar error en evaluateNutrition despues de logNutrition exitoso', fakeAsync(() => {
      evaluationServiceSpy.logNutrition.and.returnValue(of({ message: 'OK', id: 1 }));
      evaluationServiceSpy.evaluateNutrition.and.returnValue(throwError(() => new Error('Error al evaluar')));

      store.logNutrition(registroNutricionMock);
      tick();

      expect(toastServiceSpy.success).toHaveBeenCalledWith('Comida registrada');
      expect(store.loading()).toBeFalse();
    }));
  });

  describe('Tests de readonly signals', () => {
    it('deberia exponer todos los signals readonly', () => {
      expect(store.currentEvaluation()).toBeDefined();
      expect(store.evaluationHistory()).toBeDefined();
      expect(store.workoutHistory()).toBeDefined();
      expect(store.nutritionHistory()).toBeDefined();
      expect(store.loading()).toBeDefined();
      expect(store.error()).toBeDefined();
    });
  });

  describe('Tests de getTrendText con undefined', () => {
    it('deberia manejar undefined correctamente', () => {
      expect(store.getTrendText(undefined as any)).toBe('Sin datos');
    });
  });

  describe('Tests de loadWorkoutHistory y loadNutritionHistory con multiples llamadas', () => {
    it('deberia actualizar workoutHistory multiples veces', fakeAsync(() => {
      evaluationServiceSpy.getWorkoutHistory.and.returnValue(of(historialEntrenamientoMock));

      store.loadWorkoutHistory('2025-01-15', '2025-01-21');
      tick();

      expect(store.workoutHistory().length).toBe(2);

      // Segunda carga
      const newHistory = [historialEntrenamientoMock[0]];
      evaluationServiceSpy.getWorkoutHistory.and.returnValue(of(newHistory));

      store.loadWorkoutHistory('2025-01-20', '2025-01-21');
      tick();

      expect(store.workoutHistory().length).toBe(1);
    }));

    it('deberia actualizar nutritionHistory multiples veces', fakeAsync(() => {
      evaluationServiceSpy.getNutritionHistory.and.returnValue(of(historialNutricionMock));

      store.loadNutritionHistory('2025-01-15', '2025-01-21');
      tick();

      expect(store.nutritionHistory().length).toBe(2);

      // Segunda carga
      const newHistory = [historialNutricionMock[0]];
      evaluationServiceSpy.getNutritionHistory.and.returnValue(of(newHistory));

      store.loadNutritionHistory('2025-01-20', '2025-01-21');
      tick();

      expect(store.nutritionHistory().length).toBe(1);
    }));
  });
});
