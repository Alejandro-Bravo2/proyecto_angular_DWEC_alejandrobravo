import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { ProgressEvaluation } from './progress-evaluation';
import { ProgressEvaluationStore } from '../../stores/progress-evaluation.store';
import {
  EvaluacionProgresoDTO,
  TendenciaProgreso
} from '../../services/progress-evaluation.service';

describe('ProgressEvaluation', () => {
  let component: ProgressEvaluation;
  let fixture: ComponentFixture<ProgressEvaluation>;
  let storeSpy: jasmine.SpyObj<ProgressEvaluationStore>;

  // ==========================================
  // DATOS DE PRUEBA
  // ==========================================

  const evaluacionCompletaMock: EvaluacionProgresoDTO = {
    id: 1,
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
      hayPlateau: false,
      mensajePlateau: ''
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
      patronesDetectados: ['BAJO_CONSUMO_FRECUENTE']
    },
    feedbackIA: 'Excelente semana en general',
    recomendaciones: ['Aumentar peso en press banca', 'Mantener consistencia'],
    logrosDestacados: ['100% consistencia', 'Excelente adherencia nutricional'],
    tendenciaEntrenamiento: 'MEJORANDO',
    tendenciaNutricion: 'ESTABLE'
  };

  // ==========================================
  // CONFIGURACION
  // ==========================================

  beforeEach(async () => {
    // Crear signals para el mock del store
    const currentEvaluationSignal = signal<EvaluacionProgresoDTO | null>(null);
    const loadingSignal = signal(false);
    const errorSignal = signal<string | null>(null);
    const trainingTrendSignal = signal<TendenciaProgreso | null>(null);
    const nutritionTrendSignal = signal<TendenciaProgreso | null>(null);
    const aiFeedbackSignal = signal('');
    const recommendationsSignal = signal<string[]>([]);
    const achievementsSignal = signal<string[]>([]);
    const trainingConsistencySignal = signal(0);
    const calorieAdherenceSignal = signal(0);
    const proteinAdherenceSignal = signal(0);
    const hasPlateauSignal = signal(false);
    const plateauMessageSignal = signal('');
    const trainingVolumeSignal = signal(0);
    const strengthImprovementSignal = signal(0);
    const averageCaloriesSignal = signal(0);
    const targetCaloriesSignal = signal(0);
    const nutritionPatternsSignal = signal<string[]>([]);
    const hasDataSignal = signal(false);

    storeSpy = jasmine.createSpyObj('ProgressEvaluationStore', [
      'loadFullEvaluation',
      'loadTrainingEvaluation',
      'loadNutritionEvaluation',
      'refresh'
    ], {
      currentEvaluation: currentEvaluationSignal.asReadonly(),
      loading: loadingSignal.asReadonly(),
      error: errorSignal.asReadonly(),
      trainingTrend: trainingTrendSignal.asReadonly(),
      nutritionTrend: nutritionTrendSignal.asReadonly(),
      aiFeedback: aiFeedbackSignal.asReadonly(),
      recommendations: recommendationsSignal.asReadonly(),
      achievements: achievementsSignal.asReadonly(),
      trainingConsistency: trainingConsistencySignal.asReadonly(),
      calorieAdherence: calorieAdherenceSignal.asReadonly(),
      proteinAdherence: proteinAdherenceSignal.asReadonly(),
      hasPlateau: hasPlateauSignal.asReadonly(),
      plateauMessage: plateauMessageSignal.asReadonly(),
      trainingVolume: trainingVolumeSignal.asReadonly(),
      strengthImprovement: strengthImprovementSignal.asReadonly(),
      averageCalories: averageCaloriesSignal.asReadonly(),
      targetCalories: targetCaloriesSignal.asReadonly(),
      nutritionPatterns: nutritionPatternsSignal.asReadonly(),
      hasData: hasDataSignal.asReadonly()
    });

    await TestBed.configureTestingModule({
      imports: [ProgressEvaluation],
      providers: [
        { provide: ProgressEvaluationStore, useValue: storeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressEvaluation);
    component = fixture.componentInstance;
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

    it('deberia inicializar activeTab con "full" por defecto', () => {
      expect(component.activeTab()).toBe('full');
    });
  });

  // ==========================================
  // TESTS DE ngOnInit
  // ==========================================

  describe('ngOnInit', () => {
    it('deberia llamar a loadFullEvaluation al inicializar', () => {
      fixture.detectChanges();

      expect(storeSpy.loadFullEvaluation).toHaveBeenCalled();
    });

    it('deberia llamar a loadFullEvaluation solo una vez', () => {
      fixture.detectChanges();

      expect(storeSpy.loadFullEvaluation).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================
  // TESTS DE setTab
  // ==========================================

  describe('setTab', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    describe('cuando se selecciona tab "training"', () => {
      it('deberia actualizar activeTab a "training"', () => {
        component.setTab('training');

        expect(component.activeTab()).toBe('training');
      });

      it('deberia llamar a loadTrainingEvaluation en el store', () => {
        component.setTab('training');

        expect(storeSpy.loadTrainingEvaluation).toHaveBeenCalled();
      });
    });

    describe('cuando se selecciona tab "nutrition"', () => {
      it('deberia actualizar activeTab a "nutrition"', () => {
        component.setTab('nutrition');

        expect(component.activeTab()).toBe('nutrition');
      });

      it('deberia llamar a loadNutritionEvaluation en el store', () => {
        component.setTab('nutrition');

        expect(storeSpy.loadNutritionEvaluation).toHaveBeenCalled();
      });
    });

    describe('cuando se selecciona tab "full"', () => {
      it('deberia actualizar activeTab a "full"', () => {
        // Primero cambiamos a otro tab
        component.setTab('training');
        expect(component.activeTab()).toBe('training');

        // Luego volvemos a full
        component.setTab('full');

        expect(component.activeTab()).toBe('full');
      });

      it('deberia llamar a loadFullEvaluation en el store', () => {
        // Resetear las llamadas previas (incluyendo ngOnInit)
        storeSpy.loadFullEvaluation.calls.reset();

        component.setTab('full');

        expect(storeSpy.loadFullEvaluation).toHaveBeenCalled();
      });
    });

    describe('transiciones entre tabs', () => {
      it('deberia permitir cambiar de training a nutrition', () => {
        component.setTab('training');
        expect(component.activeTab()).toBe('training');

        component.setTab('nutrition');
        expect(component.activeTab()).toBe('nutrition');
      });

      it('deberia permitir cambiar de nutrition a full', () => {
        component.setTab('nutrition');
        expect(component.activeTab()).toBe('nutrition');

        component.setTab('full');
        expect(component.activeTab()).toBe('full');
      });

      it('deberia llamar al metodo de carga correcto en cada cambio', () => {
        storeSpy.loadFullEvaluation.calls.reset();

        component.setTab('training');
        expect(storeSpy.loadTrainingEvaluation).toHaveBeenCalledTimes(1);

        component.setTab('nutrition');
        expect(storeSpy.loadNutritionEvaluation).toHaveBeenCalledTimes(1);

        component.setTab('full');
        expect(storeSpy.loadFullEvaluation).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ==========================================
  // TESTS DE refresh
  // ==========================================

  describe('refresh', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deberia llamar a refresh en el store', () => {
      component.refresh();

      expect(storeSpy.refresh).toHaveBeenCalled();
    });

    it('deberia llamar a refresh solo una vez por llamada', () => {
      component.refresh();

      expect(storeSpy.refresh).toHaveBeenCalledTimes(1);
    });

    it('deberia permitir multiples llamadas a refresh', () => {
      component.refresh();
      component.refresh();
      component.refresh();

      expect(storeSpy.refresh).toHaveBeenCalledTimes(3);
    });
  });

  // ==========================================
  // TESTS DE getTrendIcon
  // ==========================================

  describe('getTrendIcon', () => {
    it('deberia retornar flecha hacia arriba para MEJORANDO', () => {
      const icono = component.getTrendIcon('MEJORANDO');

      expect(icono).toBe('↗');
    });

    it('deberia retornar flecha horizontal para ESTABLE', () => {
      const icono = component.getTrendIcon('ESTABLE');

      expect(icono).toBe('→');
    });

    it('deberia retornar flecha hacia abajo para RETROCEDIENDO', () => {
      const icono = component.getTrendIcon('RETROCEDIENDO');

      expect(icono).toBe('↘');
    });

    it('deberia retornar icono de pausa para PLATEAU', () => {
      const icono = component.getTrendIcon('PLATEAU');

      expect(icono).toBe('⏸');
    });

    it('deberia retornar signo de interrogacion para null', () => {
      const icono = component.getTrendIcon(null);

      expect(icono).toBe('?');
    });

    it('deberia retornar signo de interrogacion para valor desconocido', () => {
      const icono = component.getTrendIcon('VALOR_DESCONOCIDO');

      expect(icono).toBe('?');
    });
  });

  // ==========================================
  // TESTS DE getTrendText
  // ==========================================

  describe('getTrendText', () => {
    it('deberia retornar "Mejorando" para MEJORANDO', () => {
      const texto = component.getTrendText('MEJORANDO');

      expect(texto).toBe('Mejorando');
    });

    it('deberia retornar "Estable" para ESTABLE', () => {
      const texto = component.getTrendText('ESTABLE');

      expect(texto).toBe('Estable');
    });

    it('deberia retornar "Retrocediendo" para RETROCEDIENDO', () => {
      const texto = component.getTrendText('RETROCEDIENDO');

      expect(texto).toBe('Retrocediendo');
    });

    it('deberia retornar "Plateau" para PLATEAU', () => {
      const texto = component.getTrendText('PLATEAU');

      expect(texto).toBe('Plateau');
    });

    it('deberia retornar "Sin datos" para null', () => {
      const texto = component.getTrendText(null);

      expect(texto).toBe('Sin datos');
    });

    it('deberia retornar "Sin datos" para valor desconocido', () => {
      const texto = component.getTrendText('VALOR_DESCONOCIDO');

      expect(texto).toBe('Sin datos');
    });
  });

  // ==========================================
  // TESTS DE getTrendClass
  // ==========================================

  describe('getTrendClass', () => {
    it('deberia retornar "trend--improving" para MEJORANDO', () => {
      const clase = component.getTrendClass('MEJORANDO');

      expect(clase).toBe('trend--improving');
    });

    it('deberia retornar "trend--stable" para ESTABLE', () => {
      const clase = component.getTrendClass('ESTABLE');

      expect(clase).toBe('trend--stable');
    });

    it('deberia retornar "trend--declining" para RETROCEDIENDO', () => {
      const clase = component.getTrendClass('RETROCEDIENDO');

      expect(clase).toBe('trend--declining');
    });

    it('deberia retornar "trend--plateau" para PLATEAU', () => {
      const clase = component.getTrendClass('PLATEAU');

      expect(clase).toBe('trend--plateau');
    });

    it('deberia retornar "trend--unknown" para null', () => {
      const clase = component.getTrendClass(null);

      expect(clase).toBe('trend--unknown');
    });

    it('deberia retornar "trend--unknown" para valor desconocido', () => {
      const clase = component.getTrendClass('VALOR_DESCONOCIDO');

      expect(clase).toBe('trend--unknown');
    });
  });

  // ==========================================
  // TESTS DE getPatternText
  // ==========================================

  describe('getPatternText', () => {
    it('deberia retornar "Consumo bajo" para BAJO_CONSUMO_FRECUENTE', () => {
      const texto = component.getPatternText('BAJO_CONSUMO_FRECUENTE');

      expect(texto).toBe('Consumo bajo');
    });

    it('deberia retornar "Consumo alto" para SOBRE_CONSUMO_FRECUENTE', () => {
      const texto = component.getPatternText('SOBRE_CONSUMO_FRECUENTE');

      expect(texto).toBe('Consumo alto');
    });

    it('deberia retornar "Proteinas bajas" para PROTEINAS_INSUFICIENTES', () => {
      const texto = component.getPatternText('PROTEINAS_INSUFICIENTES');

      expect(texto).toBe('Proteinas bajas');
    });

    it('deberia retornar "Poca hidratacion" para HIDRATACION_BAJA', () => {
      const texto = component.getPatternText('HIDRATACION_BAJA');

      expect(texto).toBe('Poca hidratacion');
    });

    it('deberia retornar "Datos insuficientes" para SIN_DATOS_SUFICIENTES', () => {
      const texto = component.getPatternText('SIN_DATOS_SUFICIENTES');

      expect(texto).toBe('Datos insuficientes');
    });

    it('deberia retornar el mismo patron para valores desconocidos', () => {
      const patronDesconocido = 'PATRON_PERSONALIZADO';
      const texto = component.getPatternText(patronDesconocido);

      expect(texto).toBe(patronDesconocido);
    });
  });

  // ==========================================
  // TESTS DE INTEGRACION
  // ==========================================

  describe('Integracion', () => {
    it('deberia mantener estado de tab despues de refresh', () => {
      fixture.detectChanges();

      component.setTab('training');
      expect(component.activeTab()).toBe('training');

      component.refresh();

      expect(component.activeTab()).toBe('training');
    });

    it('deberia cargar evaluacion correcta despues de cambiar tab y hacer refresh', () => {
      fixture.detectChanges();
      storeSpy.loadFullEvaluation.calls.reset();

      // Cambiar a training
      component.setTab('training');
      expect(storeSpy.loadTrainingEvaluation).toHaveBeenCalledTimes(1);

      // Hacer refresh (el store decide que cargar basado en ultimo tipo)
      component.refresh();
      expect(storeSpy.refresh).toHaveBeenCalledTimes(1);

      // Cambiar a full
      component.setTab('full');
      expect(storeSpy.loadFullEvaluation).toHaveBeenCalledTimes(1);
    });

    it('deberia funcionar correctamente con todos los valores de trend', () => {
      const trends = ['MEJORANDO', 'ESTABLE', 'RETROCEDIENDO', 'PLATEAU', null, 'DESCONOCIDO'];

      trends.forEach(trend => {
        const icono = component.getTrendIcon(trend);
        const texto = component.getTrendText(trend);
        const clase = component.getTrendClass(trend);

        expect(icono).toBeTruthy();
        expect(texto).toBeTruthy();
        expect(clase).toBeTruthy();
      });
    });

    it('deberia funcionar correctamente con todos los patrones de nutricion', () => {
      const patrones = [
        'BAJO_CONSUMO_FRECUENTE',
        'SOBRE_CONSUMO_FRECUENTE',
        'PROTEINAS_INSUFICIENTES',
        'HIDRATACION_BAJA',
        'SIN_DATOS_SUFICIENTES',
        'PATRON_PERSONALIZADO'
      ];

      patrones.forEach(patron => {
        const texto = component.getPatternText(patron);

        expect(texto).toBeTruthy();
      });
    });
  });

  // ==========================================
  // TESTS DE ACCESO AL STORE
  // ==========================================

  describe('Acceso al store', () => {
    it('deberia exponer el store como propiedad readonly', () => {
      expect(component.store).toBe(storeSpy);
    });

    it('deberia poder acceder a loading del store', () => {
      expect(component.store.loading()).toBeFalse();
    });

    it('deberia poder acceder a error del store', () => {
      expect(component.store.error()).toBeNull();
    });

    it('deberia poder acceder a currentEvaluation del store', () => {
      expect(component.store.currentEvaluation()).toBeNull();
    });

    it('deberia poder acceder a hasData del store', () => {
      expect(component.store.hasData()).toBeFalse();
    });

    it('deberia poder acceder a recommendations del store', () => {
      expect(component.store.recommendations()).toEqual([]);
    });

    it('deberia poder acceder a achievements del store', () => {
      expect(component.store.achievements()).toEqual([]);
    });
  });
});
