import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import {
  TrainingService,
  GeneratedWorkout,
  GeneratedExercise,
  WeeklySchedule,
  GenerateWorkoutsRequest,
  RutinaEjercicioDTO,
  DiaEjercicioDTO,
  EjerciciosDTO,
  CrearRutinaEjercicioDTO,
  Exercise,
  WorkoutFeedback,
  WorkoutProgress,
} from './training.service';
import { environment } from '../../../../environments/environment';
import { LoadingService } from '../../../core/services/loading.service';

describe('TrainingService', () => {
  let servicio: TrainingService;
  let httpMock: HttpTestingController;
  let loadingService: jasmine.SpyObj<LoadingService>;

  const urlBaseAI = `${environment.apiUrl}/training`;
  const urlBaseAPI = environment.apiUrl;

  // Mock data - Datos simulados para las pruebas
  const mockGeneratedExercise: GeneratedExercise = {
    id: 'ex1',
    name: 'Press de banca',
    description: 'Ejercicio compuesto de pecho',
    sets: 4,
    reps: '8-10',
    restSeconds: 90,
    muscleGroup: 'CHEST',
    equipmentNeeded: 'Barra',
    order: 1,
    isCompleted: false
  };

  const mockGeneratedWorkout: GeneratedWorkout = {
    id: 'workout-1',
    name: 'Entrenamiento de Pecho',
    description: 'Rutina enfocada en pectorales',
    duration: 45,
    difficulty: 'MEDIUM',
    muscleGroups: ['CHEST', 'TRICEPS'],
    workoutType: 'STRENGTH',
    exercises: [mockGeneratedExercise],
    scheduledFor: '2024-01-15',
    isCompleted: false,
    isAiGenerated: true
  };

  const mockWeeklySchedule: WeeklySchedule = {
    weekStart: '2024-01-15',
    weekEnd: '2024-01-21',
    schedule: {
      'LUNES': [mockGeneratedWorkout],
      'MIERCOLES': [],
      'VIERNES': []
    },
    totalWorkouts: 3,
    completedWorkouts: 1
  };

  const mockEjercicioDTO: EjerciciosDTO = {
    id: 1,
    nombreEjercicio: 'Sentadillas',
    series: 4,
    repeticiones: 12,
    tiempoDescansoSegundos: 90,
    descripcion: 'Ejercicio de piernas',
    grupoMuscular: 'PIERNAS'
  };

  const mockDiaEjercicioDTO: DiaEjercicioDTO = {
    id: 1,
    diaSemana: 'LUNES',
    ejercicios: [mockEjercicioDTO]
  };

  const mockRutinaEjercicio: RutinaEjercicioDTO = {
    id: 1,
    fechaInicio: '2024-01-15',
    diasEjercicio: [mockDiaEjercicioDTO]
  };

  beforeEach(() => {
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide']);

    TestBed.configureTestingModule({
      providers: [
        TrainingService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LoadingService, useValue: loadingServiceSpy }
      ]
    });

    servicio = TestBed.inject(TrainingService);
    httpMock = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el servicio', () => {
    expect(servicio).toBeTruthy();
  });

  // ==========================================
  // PRUEBAS DE SEÑALES - ESTADO INICIAL
  // ==========================================

  describe('Signals - Estado Inicial', () => {
    it('debe inicializar weeklySchedule como null', () => {
      expect(servicio.weeklySchedule()).toBeNull();
    });

    it('debe inicializar isGenerating como false', () => {
      expect(servicio.isGenerating()).toBeFalse();
    });

    it('debe inicializar currentWorkout como null', () => {
      expect(servicio.currentWorkout()).toBeNull();
    });
  });

  // ==========================================
  // PRUEBAS DE GENERACIÓN DE ENTRENAMIENTOS IA
  // ==========================================

  describe('generateAIWorkouts', () => {
    it('debe generar entrenamientos con IA exitosamente', (done) => {
      const solicitud: GenerateWorkoutsRequest = {
        muscleGroupFocus: ['CHEST', 'BACK'],
        weekStartDate: '2024-01-15'
      };

      const respuestaEsperada = {
        message: 'Entrenamientos generados',
        workouts: [mockGeneratedWorkout]
      };

      servicio.generateAIWorkouts(solicitud).subscribe(respuesta => {
        expect(respuesta.workouts).toEqual([mockGeneratedWorkout]);
        expect(servicio.isGenerating()).toBe(false);
        done();
      });

      // Verificar que isGenerating se establece en true al inicio
      expect(servicio.isGenerating()).toBe(true);

      // Primera petición: generateAIWorkouts
      const req = httpMock.expectOne(`${urlBaseAI}/generate`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(solicitud);
      req.flush(respuestaEsperada);

      // Segunda petición: loadWeeklySchedule automático
      const scheduleReq = httpMock.expectOne(`${urlBaseAI}/schedule`);
      expect(scheduleReq.request.method).toBe('GET');
      scheduleReq.flush(mockWeeklySchedule);
    });

    it('debe generar entrenamientos sin parametros opcionales', (done) => {
      const respuestaEsperada = {
        message: 'Entrenamientos generados',
        workouts: [mockGeneratedWorkout]
      };

      servicio.generateAIWorkouts().subscribe(respuesta => {
        expect(respuesta.workouts).toBeDefined();
        expect(respuesta.workouts.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAI}/generate`);
      expect(req.request.body).toEqual({});
      req.flush(respuestaEsperada);

      // Limpiar petición de loadWeeklySchedule
      const scheduleReq = httpMock.expectOne(`${urlBaseAI}/schedule`);
      scheduleReq.flush(mockWeeklySchedule);
    });

    it('debe establecer isGenerating en true al iniciar generación', () => {
      expect(servicio.isGenerating()).toBe(false);

      servicio.generateAIWorkouts().subscribe();

      expect(servicio.isGenerating()).toBe(true);

      const req = httpMock.expectOne(`${urlBaseAI}/generate`);
      req.flush({ message: 'OK', workouts: [] });

      const scheduleReq = httpMock.expectOne(`${urlBaseAI}/schedule`);
      scheduleReq.flush(mockWeeklySchedule);
    });

    it('debe establecer isGenerating en false después de éxito', (done) => {
      servicio.generateAIWorkouts().subscribe(() => {
        expect(servicio.isGenerating()).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAI}/generate`);
      req.flush({ message: 'OK', workouts: [mockGeneratedWorkout] });

      const scheduleReq = httpMock.expectOne(`${urlBaseAI}/schedule`);
      scheduleReq.flush(mockWeeklySchedule);
    });

    it('debe manejar error al generar entrenamientos', (done) => {
      const mensajeError = 'Error al generar entrenamientos';

      servicio.generateAIWorkouts().subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(servicio.isGenerating()).toBe(false);
          done();
        }
      });

      const req = httpMock.expectOne(`${urlBaseAI}/generate`);
      req.flush({ error: mensajeError }, { status: 500, statusText: 'Server Error' });
    });

    it('debe establecer isGenerating en false después de error', (done) => {
      servicio.generateAIWorkouts().subscribe({
        error: () => {
          expect(servicio.isGenerating()).toBe(false);
          done();
        }
      });

      const req = httpMock.expectOne(`${urlBaseAI}/generate`);
      req.flush({}, { status: 500, statusText: 'Error' });
    });

    it('debe llamar a loadWeeklySchedule después de generación exitosa', (done) => {
      servicio.generateAIWorkouts().subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAI}/generate`);
      req.flush({ message: 'OK', workouts: [] });

      // Verificar que se llama a loadWeeklySchedule
      const scheduleReq = httpMock.expectOne(`${urlBaseAI}/schedule`);
      expect(scheduleReq.request.method).toBe('GET');
      scheduleReq.flush(mockWeeklySchedule);
    });
  });

  // ==========================================
  // PRUEBAS DE OBTENCIÓN DE ENTRENAMIENTOS
  // ==========================================

  describe('getWorkouts', () => {
    it('debe obtener entrenamientos sin parametros', (done) => {
      const respuestaEsperada = { workouts: [mockGeneratedWorkout] };

      servicio.getWorkouts().subscribe(respuesta => {
        expect(respuesta.workouts.length).toBe(1);
        expect(respuesta.workouts[0].id).toBe('workout-1');
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAI}/workouts`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(respuestaEsperada);
    });

    it('debe obtener entrenamientos con fecha de inicio', (done) => {
      const fechaInicio = '2024-01-15';
      const respuestaEsperada = { workouts: [mockGeneratedWorkout] };

      servicio.getWorkouts(fechaInicio).subscribe(respuesta => {
        expect(respuesta.workouts).toBeDefined();
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${urlBaseAI}/workouts`);
      expect(req.request.params.get('startDate')).toBe(fechaInicio);
      req.flush(respuestaEsperada);
    });

    it('debe obtener entrenamientos con rango de fechas', (done) => {
      const fechaInicio = '2024-01-15';
      const fechaFin = '2024-01-21';
      const respuestaEsperada = { workouts: [mockGeneratedWorkout] };

      servicio.getWorkouts(fechaInicio, fechaFin).subscribe(respuesta => {
        expect(respuesta.workouts).toBeDefined();
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${urlBaseAI}/workouts`);
      expect(req.request.params.get('startDate')).toBe(fechaInicio);
      expect(req.request.params.get('endDate')).toBe(fechaFin);
      req.flush(respuestaEsperada);
    });

    it('debe obtener entrenamientos completados', (done) => {
      const respuestaEsperada = { workouts: [{ ...mockGeneratedWorkout, isCompleted: true }] };

      servicio.getWorkouts(undefined, undefined, true).subscribe(respuesta => {
        expect(respuesta.workouts[0].isCompleted).toBe(true);
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${urlBaseAI}/workouts`);
      expect(req.request.params.get('completed')).toBe('true');
      req.flush(respuestaEsperada);
    });

    it('debe obtener entrenamientos no completados', (done) => {
      const respuestaEsperada = { workouts: [mockGeneratedWorkout] };

      servicio.getWorkouts(undefined, undefined, false).subscribe(respuesta => {
        expect(respuesta.workouts[0].isCompleted).toBe(false);
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${urlBaseAI}/workouts`);
      expect(req.request.params.get('completed')).toBe('false');
      req.flush(respuestaEsperada);
    });

    it('debe manejar respuesta vacía', (done) => {
      const respuestaEsperada = { workouts: [] };

      servicio.getWorkouts().subscribe(respuesta => {
        expect(respuesta.workouts.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAI}/workouts`);
      req.flush(respuestaEsperada);
    });

    it('debe construir parametros correctamente con todos los valores', (done) => {
      const fechaInicio = '2024-01-01';
      const fechaFin = '2024-01-31';
      const completado = true;

      servicio.getWorkouts(fechaInicio, fechaFin, completado).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${urlBaseAI}/workouts`);
      expect(req.request.params.get('startDate')).toBe(fechaInicio);
      expect(req.request.params.get('endDate')).toBe(fechaFin);
      expect(req.request.params.get('completed')).toBe('true');
      req.flush({ workouts: [] });
    });
  });

  describe('getWorkout', () => {
    it('debe obtener un entrenamiento específico por ID', (done) => {
      const idEntrenamiento = '123';
      const respuestaEsperada = { workout: mockGeneratedWorkout };

      servicio.getWorkout(idEntrenamiento).subscribe(respuesta => {
        expect(respuesta.workout.id).toBe('workout-1');
        expect(respuesta.workout.name).toBe('Entrenamiento de Pecho');
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAI}/workouts/${idEntrenamiento}`);
      expect(req.request.method).toBe('GET');
      req.flush(respuestaEsperada);
    });

    it('debe actualizar la señal currentWorkout', (done) => {
      const idEntrenamiento = '123';
      const respuestaEsperada = { workout: mockGeneratedWorkout };

      // Verificar que está null inicialmente
      expect(servicio.currentWorkout()).toBeNull();

      servicio.getWorkout(idEntrenamiento).subscribe(() => {
        expect(servicio.currentWorkout()).not.toBeNull();
        expect(servicio.currentWorkout()?.name).toBe('Entrenamiento de Pecho');
        expect(servicio.currentWorkout()?.id).toBe('workout-1');
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAI}/workouts/${idEntrenamiento}`);
      req.flush(respuestaEsperada);
    });

    it('debe manejar error al obtener entrenamiento específico', (done) => {
      const idEntrenamiento = '999';

      servicio.getWorkout(idEntrenamiento).subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });

      const req = httpMock.expectOne(`${urlBaseAI}/workouts/${idEntrenamiento}`);
      req.flush({ error: 'No encontrado' }, { status: 404, statusText: 'Not Found' });
    });
  });

  // ==========================================
  // PRUEBAS DE COMPLETAR Y ELIMINAR ENTRENAMIENTOS
  // ==========================================

  describe('completeWorkout', () => {
    it('debe marcar un entrenamiento como completado', (done) => {
      const idEntrenamiento = '123';
      const respuestaEsperada = {
        message: 'Entrenamiento completado',
        workout: { ...mockGeneratedWorkout, isCompleted: true }
      };

      servicio.completeWorkout(idEntrenamiento).subscribe(respuesta => {
        expect(respuesta.workout.isCompleted).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAI}/workouts/${idEntrenamiento}/complete`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ exercisesCompleted: undefined });
      req.flush(respuestaEsperada);

      // Limpiar petición de loadWeeklySchedule
      const scheduleReq = httpMock.expectOne(`${urlBaseAI}/schedule`);
      scheduleReq.flush(mockWeeklySchedule);
    });

    it('debe completar entrenamiento con ejercicios específicos', (done) => {
      const idEntrenamiento = '123';
      const ejerciciosCompletados = ['ex1', 'ex2', 'ex3'];
      const respuestaEsperada = {
        message: 'Entrenamiento completado',
        workout: { ...mockGeneratedWorkout, isCompleted: true }
      };

      servicio.completeWorkout(idEntrenamiento, ejerciciosCompletados).subscribe(respuesta => {
        expect(respuesta.workout.isCompleted).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAI}/workouts/${idEntrenamiento}/complete`);
      expect(req.request.body).toEqual({ exercisesCompleted: ejerciciosCompletados });
      req.flush(respuestaEsperada);

      // Limpiar petición de loadWeeklySchedule
      const scheduleReq = httpMock.expectOne(`${urlBaseAI}/schedule`);
      scheduleReq.flush(mockWeeklySchedule);
    });

    it('debe recargar el calendario semanal después de completar', (done) => {
      const idEntrenamiento = '123';
      const respuestaEsperada = {
        message: 'Entrenamiento completado',
        workout: mockGeneratedWorkout
      };

      servicio.completeWorkout(idEntrenamiento).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAI}/workouts/${idEntrenamiento}/complete`);
      req.flush(respuestaEsperada);

      // Verificar que se llama a loadWeeklySchedule
      const scheduleReq = httpMock.expectOne(`${urlBaseAI}/schedule`);
      expect(scheduleReq.request.method).toBe('GET');
      scheduleReq.flush(mockWeeklySchedule);
    });

    it('debe manejar error al completar entrenamiento', (done) => {
      const idEntrenamiento = '999';

      servicio.completeWorkout(idEntrenamiento).subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });

      const req = httpMock.expectOne(`${urlBaseAI}/workouts/${idEntrenamiento}/complete`);
      req.flush({ error: 'No encontrado' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteWorkout', () => {
    it('debe eliminar un entrenamiento', (done) => {
      const idEntrenamiento = '123';
      const respuestaEsperada = { message: 'Entrenamiento eliminado' };

      servicio.deleteWorkout(idEntrenamiento).subscribe(respuesta => {
        expect(respuesta.message).toBe('Entrenamiento eliminado');
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAI}/workouts/${idEntrenamiento}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(respuestaEsperada);

      // Limpiar petición de loadWeeklySchedule
      const scheduleReq = httpMock.expectOne(`${urlBaseAI}/schedule`);
      scheduleReq.flush(mockWeeklySchedule);
    });

    it('debe recargar el calendario semanal después de eliminar', (done) => {
      const idEntrenamiento = '123';
      const respuestaEsperada = { message: 'Eliminado' };

      servicio.deleteWorkout(idEntrenamiento).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAI}/workouts/${idEntrenamiento}`);
      req.flush(respuestaEsperada);

      // Verificar que se llama a loadWeeklySchedule
      const scheduleReq = httpMock.expectOne(`${urlBaseAI}/schedule`);
      expect(scheduleReq.request.method).toBe('GET');
      scheduleReq.flush(mockWeeklySchedule);
    });

    it('debe manejar error al eliminar entrenamiento', (done) => {
      const idEntrenamiento = '999';

      servicio.deleteWorkout(idEntrenamiento).subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });

      const req = httpMock.expectOne(`${urlBaseAI}/workouts/${idEntrenamiento}`);
      req.flush({ error: 'No encontrado' }, { status: 404, statusText: 'Not Found' });
    });
  });

  // ==========================================
  // PRUEBAS DE CALENDARIO SEMANAL
  // ==========================================

  describe('getWeeklySchedule', () => {
    it('debe obtener el calendario semanal', (done) => {
      servicio.getWeeklySchedule().subscribe(calendario => {
        expect(calendario.totalWorkouts).toBe(3);
        expect(calendario.completedWorkouts).toBe(1);
        expect(calendario.weekStart).toBe('2024-01-15');
        expect(calendario.weekEnd).toBe('2024-01-21');
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAI}/schedule`);
      expect(req.request.method).toBe('GET');
      req.flush(mockWeeklySchedule);
    });

    it('debe actualizar la señal weeklySchedule', (done) => {
      // Verificar que está null inicialmente
      expect(servicio.weeklySchedule()).toBeNull();

      servicio.getWeeklySchedule().subscribe(() => {
        expect(servicio.weeklySchedule()).not.toBeNull();
        expect(servicio.weeklySchedule()?.totalWorkouts).toBe(3);
        expect(servicio.weeklySchedule()?.completedWorkouts).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAI}/schedule`);
      req.flush(mockWeeklySchedule);
    });

    it('debe manejar calendario vacío', (done) => {
      const calendarioVacio: WeeklySchedule = {
        weekStart: '2024-01-15',
        weekEnd: '2024-01-21',
        schedule: {},
        totalWorkouts: 0,
        completedWorkouts: 0
      };

      servicio.getWeeklySchedule().subscribe(calendario => {
        expect(calendario.totalWorkouts).toBe(0);
        expect(Object.keys(calendario.schedule).length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAI}/schedule`);
      req.flush(calendarioVacio);
    });

    it('debe manejar error al obtener calendario', (done) => {
      servicio.getWeeklySchedule().subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        }
      });

      const req = httpMock.expectOne(`${urlBaseAI}/schedule`);
      req.flush({ error: 'Error del servidor' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('loadWeeklySchedule', () => {
    it('debe cargar el calendario semanal', () => {
      servicio.loadWeeklySchedule();

      const req = httpMock.expectOne(`${urlBaseAI}/schedule`);
      expect(req.request.method).toBe('GET');
      req.flush(mockWeeklySchedule);
    });

    it('debe actualizar la señal weeklySchedule al cargar', (done) => {
      servicio.loadWeeklySchedule();

      const req = httpMock.expectOne(`${urlBaseAI}/schedule`);
      req.flush(mockWeeklySchedule);

      setTimeout(() => {
        expect(servicio.weeklySchedule()).not.toBeNull();
        done();
      }, 100);
    });
  });

  // ==========================================
  // PRUEBAS DE ENTRENAMIENTO PERSONALIZADO
  // ==========================================

  describe('createCustomWorkout', () => {
    it('debe crear un entrenamiento personalizado', (done) => {
      const entrenamientoPersonalizado: Partial<GeneratedWorkout> = {
        name: 'Mi Rutina Personalizada',
        description: 'Rutina creada manualmente',
        duration: 60,
        difficulty: 'MEDIUM',
        muscleGroups: ['CHEST', 'BACK'],
        workoutType: 'CUSTOM'
      };

      const respuestaEsperada = {
        workout: { ...mockGeneratedWorkout, ...entrenamientoPersonalizado, isAiGenerated: false }
      };

      servicio.createCustomWorkout(entrenamientoPersonalizado).subscribe(respuesta => {
        expect(respuesta.workout.name).toBe('Mi Rutina Personalizada');
        expect(respuesta.workout.workoutType).toBe('CUSTOM');
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAI}/workouts`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(entrenamientoPersonalizado);
      req.flush(respuestaEsperada);
    });

    it('debe crear entrenamiento con ejercicios personalizados', (done) => {
      const ejercicioPersonalizado: GeneratedExercise = {
        id: 'custom1',
        name: 'Sentadillas',
        sets: 5,
        reps: '10',
        restSeconds: 120,
        order: 1,
        isCompleted: false
      };

      const entrenamientoConEjercicios: Partial<GeneratedWorkout> = {
        name: 'Rutina Completa',
        exercises: [ejercicioPersonalizado]
      };

      const respuestaEsperada = {
        workout: { ...mockGeneratedWorkout, ...entrenamientoConEjercicios }
      };

      servicio.createCustomWorkout(entrenamientoConEjercicios).subscribe(respuesta => {
        expect(respuesta.workout.exercises.length).toBeGreaterThan(0);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAI}/workouts`);
      req.flush(respuestaEsperada);
    });

    it('debe manejar error al crear entrenamiento personalizado', (done) => {
      const entrenamientoInvalido: Partial<GeneratedWorkout> = {
        name: ''
      };

      servicio.createCustomWorkout(entrenamientoInvalido).subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(`${urlBaseAI}/workouts`);
      req.flush({ error: 'Datos inválidos' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  // ==========================================
  // PRUEBAS DE MÉTODOS LEGACY
  // ==========================================

  describe('listarRutinas', () => {
    it('debe listar todas las rutinas de ejercicio', (done) => {
      const rutinasEsperadas: RutinaEjercicioDTO[] = [mockRutinaEjercicio];

      servicio.listarRutinas().subscribe(rutinas => {
        expect(rutinas.length).toBe(1);
        expect(rutinas[0].id).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      expect(req.request.method).toBe('GET');
      req.flush(rutinasEsperadas);
    });

    it('debe manejar lista vacía de rutinas', (done) => {
      servicio.listarRutinas().subscribe(rutinas => {
        expect(rutinas.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([]);
    });
  });

  describe('obtenerRutina', () => {
    it('debe obtener una rutina específica por ID', (done) => {
      const idRutina = 1;

      servicio.obtenerRutina(idRutina).subscribe(rutina => {
        expect(rutina.id).toBe(1);
        expect(rutina.diasEjercicio.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio/${idRutina}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRutinaEjercicio);
    });

    it('debe manejar error al obtener rutina no existente', (done) => {
      const idRutina = 999;

      servicio.obtenerRutina(idRutina).subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error: Error) => {
          // BaseHttpService transforma el error en un Error con mensaje
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toContain('404');
          expect(error.message).toContain('Error Code');
          done();
        }
      });

      // BaseHttpService usa retry(2), por lo que debemos manejar 3 peticiones en total
      for (let intento = 0; intento < 3; intento++) {
        const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio/${idRutina}`);
        req.flush({ error: 'No encontrado' }, { status: 404, statusText: 'Not Found' });
      }
    });
  });

  describe('crearRutina', () => {
    it('debe crear una nueva rutina de ejercicio', (done) => {
      const nuevaRutina: CrearRutinaEjercicioDTO = {
        fechaInicio: '2024-01-15',
        diasEjercicio: [
          {
            diaSemana: 'LUNES',
            ejercicios: [1, 2, 3]
          }
        ]
      };

      servicio.crearRutina(nuevaRutina).subscribe(rutina => {
        expect(rutina.id).toBeDefined();
        expect(rutina.fechaInicio).toBe('2024-01-15');
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(nuevaRutina);
      req.flush(mockRutinaEjercicio);
    });

    it('debe crear rutina con múltiples días', (done) => {
      const rutinaMultiDia: CrearRutinaEjercicioDTO = {
        fechaInicio: '2024-01-15',
        diasEjercicio: [
          { diaSemana: 'LUNES', ejercicios: [1, 2] },
          { diaSemana: 'MIERCOLES', ejercicios: [3, 4] },
          { diaSemana: 'VIERNES', ejercicios: [5, 6] }
        ]
      };

      const respuestaEsperada: RutinaEjercicioDTO = {
        ...mockRutinaEjercicio,
        diasEjercicio: [
          { id: 1, diaSemana: 'LUNES', ejercicios: [] },
          { id: 2, diaSemana: 'MIERCOLES', ejercicios: [] },
          { id: 3, diaSemana: 'VIERNES', ejercicios: [] }
        ]
      };

      servicio.crearRutina(rutinaMultiDia).subscribe(rutina => {
        expect(rutina.diasEjercicio.length).toBe(3);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush(respuestaEsperada);
    });
  });

  describe('eliminarRutina', () => {
    it('debe eliminar una rutina de ejercicio', (done) => {
      const idRutina = 1;

      servicio.eliminarRutina(idRutina).subscribe(() => {
        expect(true).toBe(true); // Verificar que se completa
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio/${idRutina}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('debe manejar error al eliminar rutina', (done) => {
      const idRutina = 999;

      servicio.eliminarRutina(idRutina).subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error: Error) => {
          // BaseHttpService transforma el error en un Error con mensaje
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toContain('404');
          expect(error.message).toContain('Error Code');
          done();
        }
      });

      // BaseHttpService usa retry(2), por lo que debemos manejar 3 peticiones en total
      for (let intento = 0; intento < 3; intento++) {
        const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio/${idRutina}`);
        req.flush({ error: 'No encontrado' }, { status: 404, statusText: 'Not Found' });
      }
    });
  });

  describe('listarEjercicios', () => {
    it('debe listar todos los ejercicios disponibles', (done) => {
      const ejerciciosEsperados: EjerciciosDTO[] = [mockEjercicioDTO];

      servicio.listarEjercicios().subscribe(ejercicios => {
        expect(ejercicios.length).toBe(1);
        expect(ejercicios[0].nombreEjercicio).toBe('Sentadillas');
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/ejercicios`);
      expect(req.request.method).toBe('GET');
      req.flush(ejerciciosEsperados);
    });

    it('debe manejar lista vacía de ejercicios', (done) => {
      servicio.listarEjercicios().subscribe(ejercicios => {
        expect(ejercicios.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/ejercicios`);
      req.flush([]);
    });
  });

  describe('obtenerEjercicio', () => {
    it('debe obtener un ejercicio específico por ID', (done) => {
      const idEjercicio = 1;
      const ejercicioEsperado: EjerciciosDTO = {
        id: 1,
        nombreEjercicio: 'Press de banca',
        series: 4,
        repeticiones: 10,
        tiempoDescansoSegundos: 90,
        descripcion: 'Ejercicio de pecho',
        grupoMuscular: 'PECHO'
      };

      servicio.obtenerEjercicio(idEjercicio).subscribe(ejercicio => {
        expect(ejercicio.id).toBe(1);
        expect(ejercicio.nombreEjercicio).toBe('Press de banca');
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/ejercicios/${idEjercicio}`);
      expect(req.request.method).toBe('GET');
      req.flush(ejercicioEsperado);
    });
  });

  // ==========================================
  // PRUEBAS DE TRANSFORMACIÓN DE DATOS
  // ==========================================

  describe('getExercises', () => {
    it('debe obtener ejercicios del día actual', (done) => {
      const idUsuario = 'user123';
      const fechaHoy = new Date().toISOString().split('T')[0];

      // Crear mock con el día de hoy
      const diaHoy = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'][new Date().getDay()];
      const rutinaConDiaActual: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: fechaHoy,
        diasEjercicio: [
          {
            id: 1,
            diaSemana: diaHoy,
            ejercicios: [mockEjercicioDTO]
          }
        ]
      };

      servicio.getExercises(idUsuario).subscribe(ejercicios => {
        expect(ejercicios.length).toBe(1);
        expect(ejercicios[0].name).toBe('Sentadillas');
        expect(ejercicios[0].userId).toBe(idUsuario);
        expect(ejercicios[0].sets).toBe(4);
        expect(ejercicios[0].reps).toBe('12');
        expect(ejercicios[0].date).toBe(fechaHoy);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaConDiaActual]);
    });

    it('debe obtener ejercicios de una fecha específica', (done) => {
      const idUsuario = 'user123';
      const fechaEspecifica = '2024-01-15'; // Lunes

      const ejercicioLunes: EjerciciosDTO = {
        id: 2,
        nombreEjercicio: 'Press de banca',
        series: 3,
        repeticiones: 8,
        tiempoDescansoSegundos: 120,
        descripcion: 'Ejercicio de pecho',
        grupoMuscular: 'PECHO'
      };

      const rutinaConLunes: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: '2024-01-15',
        diasEjercicio: [
          {
            id: 1,
            diaSemana: 'LUNES',
            ejercicios: [ejercicioLunes]
          }
        ]
      };

      servicio.getExercises(idUsuario, fechaEspecifica).subscribe(ejercicios => {
        expect(ejercicios.length).toBe(1);
        expect(ejercicios[0].name).toBe('Press de banca');
        expect(ejercicios[0].date).toBe(fechaEspecifica);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaConLunes]);
    });

    it('debe retornar array vacío cuando no hay rutinas', (done) => {
      const idUsuario = 'user123';

      servicio.getExercises(idUsuario).subscribe(ejercicios => {
        expect(ejercicios.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([]);
    });

    it('debe retornar array vacío cuando no hay ejercicios para el día', (done) => {
      const idUsuario = 'user123';
      const fechaMartes = '2024-01-16'; // Martes

      const rutinaSinMartes: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: '2024-01-15',
        diasEjercicio: [
          {
            id: 1,
            diaSemana: 'LUNES',
            ejercicios: []
          }
        ]
      };

      servicio.getExercises(idUsuario, fechaMartes).subscribe(ejercicios => {
        expect(ejercicios.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaSinMartes]);
    });

    it('debe usar tiempo de descanso por defecto cuando es cero', (done) => {
      const idUsuario = 'user123';
      const fechaLunes = '2024-01-15';

      const ejercicioSinDescanso: EjerciciosDTO = {
        ...mockEjercicioDTO,
        tiempoDescansoSegundos: 0
      };

      const rutinaSinTiempoDescanso: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: '2024-01-15',
        diasEjercicio: [
          {
            id: 1,
            diaSemana: 'LUNES',
            ejercicios: [ejercicioSinDescanso]
          }
        ]
      };

      servicio.getExercises(idUsuario, fechaLunes).subscribe(ejercicios => {
        expect(ejercicios[0].restSeconds).toBe(60); // Valor por defecto
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaSinTiempoDescanso]);
    });

    it('debe seleccionar la rutina más reciente', (done) => {
      const idUsuario = 'user123';
      const fechaLunes = '2024-01-15';

      const ejercicioViejo: EjerciciosDTO = {
        id: 1,
        nombreEjercicio: 'Ejercicio viejo',
        series: 2,
        repeticiones: 10,
        tiempoDescansoSegundos: 60,
        descripcion: 'Viejo',
        grupoMuscular: 'TEST'
      };

      const ejercicioNuevo: EjerciciosDTO = {
        id: 2,
        nombreEjercicio: 'Ejercicio nuevo',
        series: 4,
        repeticiones: 12,
        tiempoDescansoSegundos: 90,
        descripcion: 'Nuevo',
        grupoMuscular: 'TEST'
      };

      const rutinasMultiples: RutinaEjercicioDTO[] = [
        {
          id: 1,
          fechaInicio: '2024-01-01',
          diasEjercicio: [
            {
              id: 1,
              diaSemana: 'LUNES',
              ejercicios: [ejercicioViejo]
            }
          ]
        },
        {
          id: 2,
          fechaInicio: '2024-01-15',
          diasEjercicio: [
            {
              id: 2,
              diaSemana: 'LUNES',
              ejercicios: [ejercicioNuevo]
            }
          ]
        }
      ];

      servicio.getExercises(idUsuario, fechaLunes).subscribe(ejercicios => {
        expect(ejercicios.length).toBe(1);
        expect(ejercicios[0].name).toBe('Ejercicio nuevo'); // Debe ser la rutina más reciente
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush(rutinasMultiples);
    });

    it('debe transformar correctamente todos los campos del ejercicio', (done) => {
      const idUsuario = 'user123';
      const fechaLunes = '2024-01-15';

      const rutinaCompleta: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: '2024-01-15',
        diasEjercicio: [
          {
            id: 1,
            diaSemana: 'LUNES',
            ejercicios: [mockEjercicioDTO]
          }
        ]
      };

      servicio.getExercises(idUsuario, fechaLunes).subscribe(ejercicios => {
        const ejercicio = ejercicios[0];
        expect(ejercicio.id).toBe('1');
        expect(ejercicio.userId).toBe(idUsuario);
        expect(ejercicio.name).toBe('Sentadillas');
        expect(ejercicio.sets).toBe(4);
        expect(ejercicio.reps).toBe('12');
        expect(ejercicio.restSeconds).toBe(90);
        expect(ejercicio.description).toBe('Ejercicio de piernas');
        expect(ejercicio.muscleGroup).toBe('PIERNAS');
        expect(ejercicio.completed).toBe(false);
        expect(ejercicio.date).toBe(fechaLunes);
        expect(ejercicio.notes).toBe('Ejercicio de piernas');
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaCompleta]);
    });

    it('debe retornar array vacío cuando diasEjercicio es null', (done) => {
      const idUsuario = 'user123';

      const rutinaSinDias: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: '2024-01-15',
        diasEjercicio: null as any
      };

      servicio.getExercises(idUsuario).subscribe(ejercicios => {
        expect(ejercicios.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaSinDias]);
    });
  });

  describe('getExercisesByDay', () => {
    it('debe obtener ejercicios para un día específico', (done) => {
      const idUsuario = 'user123';
      const diaSemana = 'LUNES';

      servicio.getExercisesByDay(idUsuario, diaSemana).subscribe(ejercicios => {
        expect(ejercicios.length).toBe(1);
        expect(ejercicios[0].name).toBe('Sentadillas');
        expect(ejercicios[0].userId).toBe(idUsuario);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([mockRutinaEjercicio]);
    });

    it('debe manejar día de semana en minúsculas', (done) => {
      const idUsuario = 'user123';
      const diaSemana = 'lunes';

      servicio.getExercisesByDay(idUsuario, diaSemana).subscribe(ejercicios => {
        expect(ejercicios.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([mockRutinaEjercicio]);
    });

    it('debe retornar array vacío para día sin ejercicios', (done) => {
      const idUsuario = 'user123';
      const diaSemana = 'DOMINGO';

      const rutinaSinDomingo: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: '2024-01-15',
        diasEjercicio: [
          {
            id: 1,
            diaSemana: 'LUNES',
            ejercicios: []
          }
        ]
      };

      servicio.getExercisesByDay(idUsuario, diaSemana).subscribe(ejercicios => {
        expect(ejercicios.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaSinDomingo]);
    });

    it('debe usar la fecha de hoy en los ejercicios', (done) => {
      const idUsuario = 'user123';
      const diaSemana = 'MARTES';
      const fechaHoy = new Date().toISOString().split('T')[0];

      const rutinaConMartes: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: '2024-01-15',
        diasEjercicio: [
          {
            id: 1,
            diaSemana: 'MARTES',
            ejercicios: [mockEjercicioDTO]
          }
        ]
      };

      servicio.getExercisesByDay(idUsuario, diaSemana).subscribe(ejercicios => {
        expect(ejercicios[0].date).toBe(fechaHoy);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaConMartes]);
    });

    it('debe retornar array vacío cuando no hay rutinas', (done) => {
      const idUsuario = 'user123';
      const diaSemana = 'LUNES';

      servicio.getExercisesByDay(idUsuario, diaSemana).subscribe(ejercicios => {
        expect(ejercicios.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([]);
    });
  });

  describe('getAvailableTrainingDays', () => {
    it('debe obtener todos los días de entrenamiento disponibles', (done) => {
      const rutinaConMultiplesDias: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: '2024-01-15',
        diasEjercicio: [
          { id: 1, diaSemana: 'LUNES', ejercicios: [] },
          { id: 2, diaSemana: 'MIERCOLES', ejercicios: [] },
          { id: 3, diaSemana: 'VIERNES', ejercicios: [] }
        ]
      };

      servicio.getAvailableTrainingDays().subscribe(dias => {
        expect(dias.length).toBe(3);
        expect(dias).toContain('LUNES');
        expect(dias).toContain('MIERCOLES');
        expect(dias).toContain('VIERNES');
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaConMultiplesDias]);
    });

    it('debe retornar array vacío cuando no hay rutinas', (done) => {
      servicio.getAvailableTrainingDays().subscribe(dias => {
        expect(dias.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([]);
    });

    it('debe retornar array vacío cuando no hay días de ejercicio', (done) => {
      const rutinaSinDias: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: '2024-01-15',
        diasEjercicio: []
      };

      servicio.getAvailableTrainingDays().subscribe(dias => {
        expect(dias.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaSinDias]);
    });

    it('debe seleccionar la rutina más reciente', (done) => {
      const rutinasMultiples: RutinaEjercicioDTO[] = [
        {
          id: 1,
          fechaInicio: '2024-01-01',
          diasEjercicio: [
            { id: 1, diaSemana: 'LUNES', ejercicios: [] }
          ]
        },
        {
          id: 2,
          fechaInicio: '2024-01-15',
          diasEjercicio: [
            { id: 1, diaSemana: 'MARTES', ejercicios: [] },
            { id: 2, diaSemana: 'JUEVES', ejercicios: [] }
          ]
        }
      ];

      servicio.getAvailableTrainingDays().subscribe(dias => {
        expect(dias.length).toBe(2);
        expect(dias).toContain('MARTES');
        expect(dias).toContain('JUEVES');
        expect(dias).not.toContain('LUNES'); // No debe incluir días de rutina antigua
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush(rutinasMultiples);
    });
  });

  // ==========================================
  // PRUEBAS DE MÉTODOS AUXILIARES
  // ==========================================

  describe('updateExercise', () => {
    it('debe retornar un observable con objeto vacío', (done) => {
      const idEjercicio = '123';
      const datosActualizacion: Partial<Exercise> = {
        name: 'Ejercicio actualizado',
        completed: true
      };

      servicio.updateExercise(idEjercicio, datosActualizacion).subscribe(resultado => {
        expect(resultado).toEqual({} as Exercise);
        done();
      });
    });

    it('debe completar inmediatamente sin llamadas HTTP', (done) => {
      servicio.updateExercise('1', { name: 'Test' }).subscribe((resultado) => {
        expect(resultado).toEqual({} as Exercise);
        done();
      });
      // No debe haber peticiones HTTP pendientes
    });
  });

  describe('addFeedback', () => {
    it('debe agregar retroalimentación de entrenamiento', (done) => {
      const retroalimentacion: Omit<WorkoutFeedback, 'id'> = {
        userId: 'user123',
        date: '2024-01-15',
        difficulty: 4,
        energy: 5,
        comments: 'Buen entrenamiento'
      };

      servicio.addFeedback(retroalimentacion).subscribe(resultado => {
        expect(resultado.id).toBeDefined();
        expect(resultado.userId).toBe('user123');
        expect(resultado.difficulty).toBe(4);
        expect(resultado.energy).toBe(5);
        expect(resultado.comments).toBe('Buen entrenamiento');
        done();
      });
    });

    it('debe generar un ID único para cada retroalimentación', (done) => {
      const retroalimentacion: Omit<WorkoutFeedback, 'id'> = {
        userId: 'user123',
        date: '2024-01-15',
        difficulty: 3,
        energy: 4
      };

      let id1: string;
      servicio.addFeedback(retroalimentacion).subscribe(resultado1 => {
        id1 = resultado1.id;

        // Esperar 10ms para asegurar que Date.now() genere un valor diferente
        setTimeout(() => {
          servicio.addFeedback(retroalimentacion).subscribe(resultado2 => {
            expect(resultado1.id).not.toBe(resultado2.id);
            expect(id1).not.toBe(resultado2.id);
            expect(resultado2.id).toBeTruthy();
            done();
          });
        }, 10);
      });
    });

    it('debe completar inmediatamente sin llamadas HTTP', (done) => {
      const feedback: Omit<WorkoutFeedback, 'id'> = {
        userId: '1',
        date: '2024-01-15',
        difficulty: 3,
        energy: 4
      };

      servicio.addFeedback(feedback).subscribe((resultado) => {
        expect(resultado.id).toBeDefined();
        expect(resultado.userId).toBe('1');
        done();
      });
      // No debe haber peticiones HTTP pendientes
    });
  });

  describe('getWorkoutProgress', () => {
    it('debe obtener el progreso de entrenamiento del usuario', (done) => {
      const idUsuario = 'user123';
      const rutinasMultiples: RutinaEjercicioDTO[] = [
        mockRutinaEjercicio,
        { ...mockRutinaEjercicio, id: 2 },
        { ...mockRutinaEjercicio, id: 3 }
      ];

      servicio.getWorkoutProgress(idUsuario).subscribe(progreso => {
        expect(progreso.userId).toBe(idUsuario);
        expect(progreso.totalWorkouts).toBe(3);
        expect(progreso.completedExercises).toBe(0);
        expect(progreso.streak).toBe(0);
        expect(progreso.lastWorkout).toBeUndefined();
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush(rutinasMultiples);
    });

    it('debe manejar progreso sin rutinas', (done) => {
      const idUsuario = 'user123';

      servicio.getWorkoutProgress(idUsuario).subscribe(progreso => {
        expect(progreso.userId).toBe(idUsuario);
        expect(progreso.totalWorkouts).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([]);
    });

    it('debe retornar valores predeterminados para ejercicios completados y racha', (done) => {
      const idUsuario = 'user123';

      servicio.getWorkoutProgress(idUsuario).subscribe(progreso => {
        expect(progreso.completedExercises).toBe(0);
        expect(progreso.streak).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([mockRutinaEjercicio]);
    });
  });

  // ==========================================
  // PRUEBAS DE METODO PRIVADO getDayOfWeekInSpanish (verificado indirectamente)
  // ==========================================

  describe('getDayOfWeekInSpanish (verificado indirectamente)', () => {
    it('debe convertir correctamente todos los dias de la semana', (done) => {
      const idUsuario = 'user123';

      // Array de fechas conocidas y sus días esperados
      const pruebasFechas: Array<{ fecha: string; diaEsperado: string }> = [
        { fecha: '2024-01-14', diaEsperado: 'DOMINGO' },  // Domingo
        { fecha: '2024-01-15', diaEsperado: 'LUNES' },    // Lunes
        { fecha: '2024-01-16', diaEsperado: 'MARTES' },   // Martes
        { fecha: '2024-01-17', diaEsperado: 'MIERCOLES' },// Miércoles
        { fecha: '2024-01-18', diaEsperado: 'JUEVES' },   // Jueves
        { fecha: '2024-01-19', diaEsperado: 'VIERNES' },  // Viernes
        { fecha: '2024-01-20', diaEsperado: 'SABADO' }    // Sábado
      ];

      let pruebasCompletadas = 0;

      pruebasFechas.forEach((prueba, index) => {
        const rutinaConDia: RutinaEjercicioDTO = {
          id: 1,
          fechaInicio: prueba.fecha,
          diasEjercicio: [
            {
              id: 1,
              diaSemana: prueba.diaEsperado,
              ejercicios: [mockEjercicioDTO]
            }
          ]
        };

        servicio.getExercises(idUsuario, prueba.fecha).subscribe(ejercicios => {
          expect(ejercicios.length).toBe(1);
          expect(ejercicios[0].name).toBe('Sentadillas');
          pruebasCompletadas++;

          if (pruebasCompletadas === pruebasFechas.length) {
            done();
          }
        });

        const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
        req.flush([rutinaConDia]);
      });
    });

    it('debe manejar correctamente fechas con años bisiestos', (done) => {
      const idUsuario = 'user123';
      const fechaBisiesto = '2024-02-29'; // Jueves en año bisiesto

      const rutinaJueves: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: fechaBisiesto,
        diasEjercicio: [
          {
            id: 1,
            diaSemana: 'JUEVES',
            ejercicios: [mockEjercicioDTO]
          }
        ]
      };

      servicio.getExercises(idUsuario, fechaBisiesto).subscribe(ejercicios => {
        expect(ejercicios.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaJueves]);
    });
  });

  // ==========================================
  // PRUEBAS DE INTEGRACIÓN Y CASOS EXTREMOS
  // ==========================================

  describe('Casos extremos y validaciones', () => {
    it('debe manejar rutina con diasEjercicio vacio correctamente', (done) => {
      const idUsuario = 'user123';
      const rutinaSinDias: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: '2024-01-15',
        diasEjercicio: []
      };

      servicio.getExercises(idUsuario).subscribe(ejercicios => {
        expect(ejercicios).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaSinDias]);
    });

    it('debe manejar ejercicios con valores de tiempoDescansoSegundos undefined', (done) => {
      const idUsuario = 'user123';
      const fechaLunes = '2024-01-15';

      const ejercicioSinDescansoDefinido: EjerciciosDTO = {
        ...mockEjercicioDTO,
        tiempoDescansoSegundos: undefined as any
      };

      const rutinaSinDescansoDefinido: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: '2024-01-15',
        diasEjercicio: [
          {
            id: 1,
            diaSemana: 'LUNES',
            ejercicios: [ejercicioSinDescansoDefinido]
          }
        ]
      };

      servicio.getExercises(idUsuario, fechaLunes).subscribe(ejercicios => {
        expect(ejercicios[0].restSeconds).toBe(60); // Valor por defecto
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaSinDescansoDefinido]);
    });

    it('debe manejar ejercicios con valores de tiempoDescansoSegundos null', (done) => {
      const idUsuario = 'user123';
      const fechaLunes = '2024-01-15';

      const ejercicioSinDescansoNull: EjerciciosDTO = {
        ...mockEjercicioDTO,
        tiempoDescansoSegundos: null as any
      };

      const rutinaSinDescansoNull: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: '2024-01-15',
        diasEjercicio: [
          {
            id: 1,
            diaSemana: 'LUNES',
            ejercicios: [ejercicioSinDescansoNull]
          }
        ]
      };

      servicio.getExercises(idUsuario, fechaLunes).subscribe(ejercicios => {
        expect(ejercicios[0].restSeconds).toBe(60); // Valor por defecto
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaSinDescansoNull]);
    });

    it('debe transformar correctamente ID numerico a string', (done) => {
      const idUsuario = 'user123';
      const fechaLunes = '2024-01-15';

      const ejercicioConIdGrande: EjerciciosDTO = {
        ...mockEjercicioDTO,
        id: 999999
      };

      const rutinaConIdGrande: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: '2024-01-15',
        diasEjercicio: [
          {
            id: 1,
            diaSemana: 'LUNES',
            ejercicios: [ejercicioConIdGrande]
          }
        ]
      };

      servicio.getExercises(idUsuario, fechaLunes).subscribe(ejercicios => {
        expect(ejercicios[0].id).toBe('999999');
        expect(typeof ejercicios[0].id).toBe('string');
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaConIdGrande]);
    });

    it('debe manejar repeticiones con valores numericos grandes', (done) => {
      const idUsuario = 'user123';
      const fechaLunes = '2024-01-15';

      const ejercicioConRepsGrandes: EjerciciosDTO = {
        ...mockEjercicioDTO,
        repeticiones: 1000
      };

      const rutinaConRepsGrandes: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: '2024-01-15',
        diasEjercicio: [
          {
            id: 1,
            diaSemana: 'LUNES',
            ejercicios: [ejercicioConRepsGrandes]
          }
        ]
      };

      servicio.getExercises(idUsuario, fechaLunes).subscribe(ejercicios => {
        expect(ejercicios[0].reps).toBe('1000');
        expect(typeof ejercicios[0].reps).toBe('string');
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaConRepsGrandes]);
    });

    it('debe manejar getExercisesByDay con rutinas null', (done) => {
      const idUsuario = 'user123';
      const diaSemana = 'LUNES';

      servicio.getExercisesByDay(idUsuario, diaSemana).subscribe(ejercicios => {
        expect(ejercicios).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush(null as any);
    });

    it('debe usar tiempo de descanso por defecto en getExercisesByDay cuando es cero', (done) => {
      const idUsuario = 'user123';
      const diaSemana = 'LUNES';

      const ejercicioSinDescanso: EjerciciosDTO = {
        ...mockEjercicioDTO,
        tiempoDescansoSegundos: 0
      };

      const rutinaSinDescanso: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: '2024-01-15',
        diasEjercicio: [
          {
            id: 1,
            diaSemana: 'LUNES',
            ejercicios: [ejercicioSinDescanso]
          }
        ]
      };

      servicio.getExercisesByDay(idUsuario, diaSemana).subscribe(ejercicios => {
        expect(ejercicios[0].restSeconds).toBe(60); // Valor por defecto
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaSinDescanso]);
    });

    it('debe manejar getAvailableTrainingDays con diasEjercicio null', (done) => {
      const rutinaSinDiasNull: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: '2024-01-15',
        diasEjercicio: null as any
      };

      servicio.getAvailableTrainingDays().subscribe(dias => {
        expect(dias).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaSinDiasNull]);
    });

    it('debe manejar multiples rutinas y seleccionar la ultima', (done) => {
      const idUsuario = 'user123';

      const rutinasEnOrden: RutinaEjercicioDTO[] = [
        {
          id: 1,
          fechaInicio: '2024-01-01',
          diasEjercicio: [
            { id: 1, diaSemana: 'LUNES', ejercicios: [] }
          ]
        },
        {
          id: 2,
          fechaInicio: '2024-01-08',
          diasEjercicio: [
            { id: 2, diaSemana: 'MARTES', ejercicios: [] }
          ]
        },
        {
          id: 3,
          fechaInicio: '2024-01-15',
          diasEjercicio: [
            { id: 3, diaSemana: 'MIERCOLES', ejercicios: [mockEjercicioDTO] }
          ]
        }
      ];

      servicio.getExercisesByDay(idUsuario, 'MIERCOLES').subscribe(ejercicios => {
        expect(ejercicios.length).toBe(1);
        expect(ejercicios[0].name).toBe('Sentadillas');
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush(rutinasEnOrden);
    });
  });

  // ==========================================
  // PRUEBAS DE ESTADO Y SEÑALES
  // ==========================================

  describe('Estado de señales durante operaciones', () => {
    it('debe mantener weeklySchedule cuando no hay actualizaciones', () => {
      expect(servicio.weeklySchedule()).toBeNull();

      // No debería cambiar sin llamadas explícitas
      expect(servicio.weeklySchedule()).toBeNull();
    });

    it('debe actualizar currentWorkout solo cuando se llama a getWorkout', (done) => {
      const idEntrenamiento = 'workout-123';
      const respuestaEsperada = { workout: mockGeneratedWorkout };

      expect(servicio.currentWorkout()).toBeNull();

      servicio.getWorkout(idEntrenamiento).subscribe(() => {
        expect(servicio.currentWorkout()).not.toBeNull();
        expect(servicio.currentWorkout()?.id).toBe('workout-1');
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAI}/workouts/${idEntrenamiento}`);
      req.flush(respuestaEsperada);
    });

    it('debe mantener isGenerating en false cuando no hay generaciones activas', () => {
      expect(servicio.isGenerating()).toBe(false);
    });
  });

  // ==========================================
  // PRUEBAS ADICIONALES DE COBERTURA
  // ==========================================

  describe('Cobertura adicional - getExercisesByDay', () => {
    it('debe retornar array vacío cuando ejercicios es null en diaEjercicio', (done) => {
      const idUsuario = 'user123';
      const diaSemana = 'LUNES';

      const rutinaSinEjercicios: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: '2024-01-15',
        diasEjercicio: [
          {
            id: 1,
            diaSemana: 'LUNES',
            ejercicios: null as any
          }
        ]
      };

      servicio.getExercisesByDay(idUsuario, diaSemana).subscribe(ejercicios => {
        expect(ejercicios).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaSinEjercicios]);
    });

    it('debe seleccionar la rutina más reciente correctamente', (done) => {
      const idUsuario = 'user123';
      const diaSemana = 'MIERCOLES';

      const rutinasMultiples: RutinaEjercicioDTO[] = [
        {
          id: 1,
          fechaInicio: '2024-01-01',
          diasEjercicio: [
            { id: 1, diaSemana: 'LUNES', ejercicios: [] }
          ]
        },
        {
          id: 2,
          fechaInicio: '2024-01-15',
          diasEjercicio: [
            {
              id: 2,
              diaSemana: 'MIERCOLES',
              ejercicios: [mockEjercicioDTO]
            }
          ]
        }
      ];

      servicio.getExercisesByDay(idUsuario, diaSemana).subscribe(ejercicios => {
        expect(ejercicios.length).toBe(1);
        expect(ejercicios[0].name).toBe('Sentadillas');
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush(rutinasMultiples);
    });

    it('debe retornar array vacío cuando diasEjercicio es null', (done) => {
      const idUsuario = 'user123';
      const diaSemana = 'LUNES';

      const rutinaSinDias: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: '2024-01-15',
        diasEjercicio: null as any
      };

      servicio.getExercisesByDay(idUsuario, diaSemana).subscribe(ejercicios => {
        expect(ejercicios).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaSinDias]);
    });
  });

  describe('Cobertura adicional - getExercises', () => {
    it('debe retornar array vacío cuando ejercicios es null en diaEjercicio', (done) => {
      const idUsuario = 'user123';
      const fechaHoy = new Date().toISOString().split('T')[0];
      const diaHoy = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'][new Date().getDay()];

      const rutinaSinEjercicios: RutinaEjercicioDTO = {
        id: 1,
        fechaInicio: fechaHoy,
        diasEjercicio: [
          {
            id: 1,
            diaSemana: diaHoy,
            ejercicios: null as any
          }
        ]
      };

      servicio.getExercises(idUsuario).subscribe(ejercicios => {
        expect(ejercicios).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush([rutinaSinEjercicios]);
    });

    it('debe manejar rutinas con array null correctamente', (done) => {
      const idUsuario = 'user123';

      servicio.getExercises(idUsuario).subscribe(ejercicios => {
        expect(ejercicios).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
      req.flush(null as any);
    });
  });

  // ==========================================
  // PRUEBAS DE MANEJO DE ERRORES HTTP
  // ==========================================

  describe('Manejo de Errores HTTP', () => {
    it('debe manejar error 401 - No autorizado', (done) => {
      servicio.getWorkouts().subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        }
      });

      const req = httpMock.expectOne(`${urlBaseAI}/workouts`);
      req.flush({ error: 'No autorizado' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('debe manejar error 403 - Prohibido', (done) => {
      servicio.getWorkout('123').subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(403);
          done();
        }
      });

      const req = httpMock.expectOne(`${urlBaseAI}/workouts/123`);
      req.flush({ error: 'Prohibido' }, { status: 403, statusText: 'Forbidden' });
    });

    it('debe manejar error 500 - Error del servidor', (done) => {
      servicio.listarRutinas().subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error: Error) => {
          // BaseHttpService transforma el error en un Error con mensaje
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toContain('500');
          expect(error.message).toContain('Error Code');
          done();
        }
      });

      // BaseHttpService usa retry(2), por lo que debemos manejar 3 peticiones en total
      for (let intento = 0; intento < 3; intento++) {
        const req = httpMock.expectOne(`${urlBaseAPI}/rutinas-ejercicio`);
        req.flush({ error: 'Error del servidor' }, { status: 500, statusText: 'Internal Server Error' });
      }
    });
  });
});
