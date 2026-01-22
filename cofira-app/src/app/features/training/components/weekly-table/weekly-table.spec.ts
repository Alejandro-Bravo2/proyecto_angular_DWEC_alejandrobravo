import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { WeeklyTable } from './weekly-table';
import { Exercise } from '../../services/training.service';
import { TrainingStore } from '../../stores/training.store';

describe('WeeklyTable', () => {
  let componente: WeeklyTable;
  let fixture: ComponentFixture<WeeklyTable>;
  let storeSpy: jasmine.SpyObj<TrainingStore>;

  const mockEjercicio: Exercise = {
    id: 'exercise-1',
    userId: 'user-123',
    name: 'Press de banca',
    sets: 4,
    reps: '10-12',
    restSeconds: 90,
    description: 'Ejercicio compuesto de pecho',
    muscleGroup: 'PECHO',
    completed: false,
    date: '2024-01-15',
    notes: 'Mantener la espalda en el banco'
  };

  const mockEjercicio2: Exercise = {
    id: 'exercise-2',
    userId: 'user-123',
    name: 'Sentadillas',
    sets: 5,
    reps: '8-10',
    restSeconds: 120,
    description: '1. Colocar la barra en la espalda 2. Bajar controladamente 3. Subir con fuerza',
    muscleGroup: 'PIERNAS',
    completed: true,
    date: '2024-01-15'
  };

  const mockDiasDisponibles = ['LUNES', 'MIERCOLES', 'VIERNES'];

  beforeEach(async () => {
    const storeSpyObj = jasmine.createSpyObj('TrainingStore', ['toggleComplete']);

    await TestBed.configureTestingModule({
      imports: [WeeklyTable],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: TrainingStore, useValue: storeSpyObj }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WeeklyTable);
    componente = fixture.componentInstance;
    storeSpy = TestBed.inject(TrainingStore) as jasmine.SpyObj<TrainingStore>;

    // Establecer inputs por defecto
    fixture.componentRef.setInput('exercises', []);
    fixture.componentRef.setInput('selectedDay', 'LUNES');
    fixture.componentRef.setInput('availableDays', mockDiasDisponibles);

    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(componente).toBeTruthy();
  });

  // ==========================================
  // PRUEBAS DE ESTADO INICIAL
  // ==========================================

  describe('Estado inicial', () => {
    it('debe tener expandedExerciseId como null', () => {
      expect(componente.expandedExerciseId()).toBeNull();
    });

    it('debe tener ejercicios vacíos por defecto', () => {
      expect(componente.exercises()).toEqual([]);
    });

    it('debe tener LUNES como día seleccionado por defecto', () => {
      expect(componente.selectedDay()).toBe('LUNES');
    });

    it('debe tener días disponibles configurados', () => {
      expect(componente.availableDays()).toEqual(mockDiasDisponibles);
    });
  });

  // ==========================================
  // PRUEBAS DE INPUTS
  // ==========================================

  describe('Inputs del componente', () => {
    it('debe recibir y mostrar ejercicios', () => {
      fixture.componentRef.setInput('exercises', [mockEjercicio, mockEjercicio2]);
      fixture.detectChanges();

      expect(componente.exercises().length).toBe(2);
      expect(componente.exercises()[0].name).toBe('Press de banca');
    });

    it('debe recibir día seleccionado', () => {
      fixture.componentRef.setInput('selectedDay', 'MIERCOLES');
      fixture.detectChanges();

      expect(componente.selectedDay()).toBe('MIERCOLES');
    });

    it('debe recibir días disponibles', () => {
      const nuevosDias = ['LUNES', 'MARTES', 'JUEVES'];
      fixture.componentRef.setInput('availableDays', nuevosDias);
      fixture.detectChanges();

      expect(componente.availableDays()).toEqual(nuevosDias);
    });
  });

  // ==========================================
  // PRUEBAS DE COMPUTED: COMPLETADO
  // ==========================================

  describe('computed: completedCount', () => {
    it('debe retornar 0 cuando no hay ejercicios completados', () => {
      fixture.componentRef.setInput('exercises', [mockEjercicio]);
      fixture.detectChanges();

      expect(componente.completedCount()).toBe(0);
    });

    it('debe contar correctamente los ejercicios completados', () => {
      fixture.componentRef.setInput('exercises', [mockEjercicio, mockEjercicio2]);
      fixture.detectChanges();

      expect(componente.completedCount()).toBe(1);
    });

    it('debe retornar el total cuando todos están completados', () => {
      const ejerciciosCompletados = [
        { ...mockEjercicio, completed: true },
        { ...mockEjercicio2, completed: true }
      ];
      fixture.componentRef.setInput('exercises', ejerciciosCompletados);
      fixture.detectChanges();

      expect(componente.completedCount()).toBe(2);
    });
  });

  describe('computed: totalCount', () => {
    it('debe retornar 0 cuando no hay ejercicios', () => {
      expect(componente.totalCount()).toBe(0);
    });

    it('debe retornar el total de ejercicios', () => {
      fixture.componentRef.setInput('exercises', [mockEjercicio, mockEjercicio2]);
      fixture.detectChanges();

      expect(componente.totalCount()).toBe(2);
    });
  });

  // ==========================================
  // PRUEBAS DE COMPUTED: NAVEGACIÓN
  // ==========================================

  describe('computed: canGoPrevious', () => {
    it('debe retornar false cuando está en el primer día', () => {
      fixture.componentRef.setInput('selectedDay', 'LUNES');
      fixture.componentRef.setInput('availableDays', mockDiasDisponibles);
      fixture.detectChanges();

      expect(componente.canGoPrevious()).toBeFalse();
    });

    it('debe retornar true cuando no está en el primer día', () => {
      fixture.componentRef.setInput('selectedDay', 'MIERCOLES');
      fixture.componentRef.setInput('availableDays', mockDiasDisponibles);
      fixture.detectChanges();

      expect(componente.canGoPrevious()).toBeTrue();
    });

    it('debe retornar true en el último día', () => {
      fixture.componentRef.setInput('selectedDay', 'VIERNES');
      fixture.componentRef.setInput('availableDays', mockDiasDisponibles);
      fixture.detectChanges();

      expect(componente.canGoPrevious()).toBeTrue();
    });
  });

  describe('computed: canGoNext', () => {
    it('debe retornar true cuando está en el primer día', () => {
      fixture.componentRef.setInput('selectedDay', 'LUNES');
      fixture.componentRef.setInput('availableDays', mockDiasDisponibles);
      fixture.detectChanges();

      expect(componente.canGoNext()).toBeTrue();
    });

    it('debe retornar false cuando está en el último día', () => {
      fixture.componentRef.setInput('selectedDay', 'VIERNES');
      fixture.componentRef.setInput('availableDays', mockDiasDisponibles);
      fixture.detectChanges();

      expect(componente.canGoNext()).toBeFalse();
    });

    it('debe retornar true en días intermedios', () => {
      fixture.componentRef.setInput('selectedDay', 'MIERCOLES');
      fixture.componentRef.setInput('availableDays', mockDiasDisponibles);
      fixture.detectChanges();

      expect(componente.canGoNext()).toBeTrue();
    });
  });

  // ==========================================
  // PRUEBAS DE COMPUTED: FORMATO DE DÍA
  // ==========================================

  describe('computed: formatDayName', () => {
    it('debe formatear LUNES correctamente', () => {
      fixture.componentRef.setInput('selectedDay', 'LUNES');
      fixture.detectChanges();

      expect(componente.formatDayName()).toBe('Lunes');
    });

    it('debe formatear MIERCOLES correctamente', () => {
      fixture.componentRef.setInput('selectedDay', 'MIERCOLES');
      fixture.detectChanges();

      expect(componente.formatDayName()).toBe('Miércoles');
    });

    it('debe manejar día no reconocido retornando el valor original', () => {
      fixture.componentRef.setInput('selectedDay', 'INVALID_DAY');
      fixture.detectChanges();

      expect(componente.formatDayName()).toBe('INVALID_DAY');
    });

    it('debe formatear todos los días de la semana correctamente', () => {
      const diasConFormato: Record<string, string> = {
        'LUNES': 'Lunes',
        'MARTES': 'Martes',
        'MIERCOLES': 'Miércoles',
        'JUEVES': 'Jueves',
        'VIERNES': 'Viernes',
        'SABADO': 'Sábado',
        'DOMINGO': 'Domingo'
      };

      Object.entries(diasConFormato).forEach(([diaOriginal, diaEsperado]) => {
        fixture.componentRef.setInput('selectedDay', diaOriginal);
        fixture.detectChanges();

        expect(componente.formatDayName()).toBe(diaEsperado);
      });
    });
  });

  // ==========================================
  // PRUEBAS DE MÉTODOS DE NAVEGACIÓN
  // ==========================================

  describe('onPreviousDay', () => {
    it('debe emitir evento previousDayClicked', () => {
      let eventEmitted = false;
      componente.previousDayClicked.subscribe(() => {
        eventEmitted = true;
      });

      componente.onPreviousDay();

      expect(eventEmitted).toBeTrue();
    });
  });

  describe('onNextDay', () => {
    it('debe emitir evento nextDayClicked', () => {
      let eventEmitted = false;
      componente.nextDayClicked.subscribe(() => {
        eventEmitted = true;
      });

      componente.onNextDay();

      expect(eventEmitted).toBeTrue();
    });
  });

  // ==========================================
  // PRUEBAS DE TOGGLE EXPANDIDO
  // ==========================================

  describe('toggleExpanded', () => {
    it('debe expandir un ejercicio', () => {
      componente.toggleExpanded('exercise-1');

      expect(componente.expandedExerciseId()).toBe('exercise-1');
    });

    it('debe colapsar un ejercicio expandido', () => {
      componente.toggleExpanded('exercise-1');
      expect(componente.expandedExerciseId()).toBe('exercise-1');

      componente.toggleExpanded('exercise-1');

      expect(componente.expandedExerciseId()).toBeNull();
    });

    it('debe cambiar de un ejercicio expandido a otro', () => {
      componente.toggleExpanded('exercise-1');
      expect(componente.expandedExerciseId()).toBe('exercise-1');

      componente.toggleExpanded('exercise-2');

      expect(componente.expandedExerciseId()).toBe('exercise-2');
    });
  });

  describe('isExpanded', () => {
    it('debe retornar true para ejercicio expandido', () => {
      componente.toggleExpanded('exercise-1');

      expect(componente.isExpanded('exercise-1')).toBeTrue();
    });

    it('debe retornar false para ejercicio no expandido', () => {
      expect(componente.isExpanded('exercise-1')).toBeFalse();
    });

    it('debe retornar false para otros ejercicios cuando uno está expandido', () => {
      componente.toggleExpanded('exercise-1');

      expect(componente.isExpanded('exercise-2')).toBeFalse();
    });
  });

  // ==========================================
  // PRUEBAS DE TOGGLE COMPLETE
  // ==========================================

  describe('toggleComplete', () => {
    it('debe llamar al store para marcar ejercicio como completado', () => {
      const mockEvent = new Event('click');
      spyOn(mockEvent, 'stopPropagation');

      componente.toggleComplete('exercise-1', mockEvent);

      expect(storeSpy.toggleComplete).toHaveBeenCalledWith('exercise-1');
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('debe detener propagación del evento', () => {
      const mockEvent = new Event('click');
      spyOn(mockEvent, 'stopPropagation');

      componente.toggleComplete('exercise-1', mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  // ==========================================
  // PRUEBAS DE FORMATEO DE TIEMPO DE DESCANSO
  // ==========================================

  describe('formatRestTime', () => {
    it('debe formatear segundos menores a 60', () => {
      expect(componente.formatRestTime(30)).toBe('30s');
      expect(componente.formatRestTime(45)).toBe('45s');
    });

    it('debe formatear exactamente 60 segundos como 1 minuto', () => {
      expect(componente.formatRestTime(60)).toBe('1m');
    });

    it('debe formatear minutos completos sin segundos', () => {
      expect(componente.formatRestTime(120)).toBe('2m');
      expect(componente.formatRestTime(180)).toBe('3m');
    });

    it('debe formatear minutos con segundos', () => {
      expect(componente.formatRestTime(90)).toBe('1m 30s');
      expect(componente.formatRestTime(150)).toBe('2m 30s');
    });

    it('debe formatear tiempo de descanso largo', () => {
      expect(componente.formatRestTime(300)).toBe('5m');
      expect(componente.formatRestTime(305)).toBe('5m 5s');
    });

    it('debe manejar 0 segundos', () => {
      expect(componente.formatRestTime(0)).toBe('0s');
    });
  });

  // ==========================================
  // PRUEBAS DE PARSEO DE DESCRIPCIÓN
  // ==========================================

  describe('parseDescriptionSteps', () => {
    it('debe parsear descripción con pasos numerados', () => {
      const descripcionConPasos = '1. Paso uno 2. Paso dos 3. Paso tres';
      const pasos = componente.parseDescriptionSteps(descripcionConPasos);

      expect(pasos).not.toBeNull();
      expect(pasos?.length).toBe(3);
      expect(pasos?.[0]).toBe('Paso uno');
      expect(pasos?.[1]).toBe('Paso dos');
      expect(pasos?.[2]).toBe('Paso tres');
    });

    it('debe retornar null para descripción sin formato de pasos', () => {
      const descripcionSinPasos = 'Esta es una descripción sin pasos numerados';
      const pasos = componente.parseDescriptionSteps(descripcionSinPasos);

      expect(pasos).toBeNull();
    });

    it('debe retornar null para descripción undefined', () => {
      const pasos = componente.parseDescriptionSteps(undefined);

      expect(pasos).toBeNull();
    });

    it('debe retornar null para descripción vacía', () => {
      const pasos = componente.parseDescriptionSteps('');

      expect(pasos).toBeNull();
    });

    it('debe manejar pasos con espacios extras', () => {
      const descripcionConEspacios = '1.  Paso con espacios  2.  Otro paso   3.   Tercer paso';
      const pasos = componente.parseDescriptionSteps(descripcionConEspacios);

      expect(pasos).not.toBeNull();
      expect(pasos?.length).toBe(3);
    });

    it('debe retornar null si solo hay un paso numerado', () => {
      const descripcionUnSoloPaso = '1. Solo un paso';
      const pasos = componente.parseDescriptionSteps(descripcionUnSoloPaso);

      expect(pasos).toBeNull();
    });

    it('debe manejar múltiples pasos numerados', () => {
      const descripcionMultiplesPasos = '1. Primero 2. Segundo 3. Tercero 4. Cuarto';
      const pasos = componente.parseDescriptionSteps(descripcionMultiplesPasos);

      expect(pasos).not.toBeNull();
      expect(pasos?.length).toBe(4);
    });

    it('debe eliminar correctamente los números del inicio de cada paso', () => {
      const descripcionConNumeros = '1. Colocar barra 2. Bajar lentamente 3. Subir con fuerza';
      const pasos = componente.parseDescriptionSteps(descripcionConNumeros);

      expect(pasos?.[0]).not.toContain('1.');
      expect(pasos?.[1]).not.toContain('2.');
      expect(pasos?.[2]).not.toContain('3.');
    });
  });

  describe('hasStepsFormat', () => {
    it('debe retornar true para descripción con pasos numerados', () => {
      const descripcionConPasos = '1. Paso uno 2. Paso dos';

      expect(componente.hasStepsFormat(descripcionConPasos)).toBeTrue();
    });

    it('debe retornar false para descripción sin pasos', () => {
      const descripcionSinPasos = 'Descripción normal sin pasos';

      expect(componente.hasStepsFormat(descripcionSinPasos)).toBeFalse();
    });

    it('debe retornar false para undefined', () => {
      expect(componente.hasStepsFormat(undefined)).toBeFalse();
    });

    it('debe retornar false para string vacío', () => {
      expect(componente.hasStepsFormat('')).toBeFalse();
    });
  });

  // ==========================================
  // PRUEBAS DE INTEGRACIÓN
  // ==========================================

  describe('Integración: ejercicios y expansión', () => {
    it('debe poder expandir un ejercicio de la lista', () => {
      fixture.componentRef.setInput('exercises', [mockEjercicio, mockEjercicio2]);
      fixture.detectChanges();

      componente.toggleExpanded(mockEjercicio.id);

      expect(componente.isExpanded(mockEjercicio.id)).toBeTrue();
      expect(componente.isExpanded(mockEjercicio2.id)).toBeFalse();
    });

    it('debe mantener el estado de completado al expandir/colapsar', () => {
      fixture.componentRef.setInput('exercises', [mockEjercicio, mockEjercicio2]);
      fixture.detectChanges();

      componente.toggleExpanded(mockEjercicio2.id);

      expect(componente.exercises()[1].completed).toBeTrue();
    });
  });

  // ==========================================
  // PRUEBAS DE CASOS EXTREMOS
  // ==========================================

  describe('Casos extremos', () => {
    it('debe manejar lista vacía de días disponibles', () => {
      fixture.componentRef.setInput('availableDays', []);
      fixture.detectChanges();

      expect(componente.canGoPrevious()).toBeFalse();
      expect(componente.canGoNext()).toBeFalse();
    });

    it('debe manejar un solo día disponible', () => {
      fixture.componentRef.setInput('availableDays', ['LUNES']);
      fixture.componentRef.setInput('selectedDay', 'LUNES');
      fixture.detectChanges();

      expect(componente.canGoPrevious()).toBeFalse();
      expect(componente.canGoNext()).toBeFalse();
    });

    it('debe manejar descripción con caracteres especiales', () => {
      const descripcionEspecial = '1. Paso con @#$ 2. Otro con ñ y á';
      const pasos = componente.parseDescriptionSteps(descripcionEspecial);

      expect(pasos).not.toBeNull();
      expect(pasos?.length).toBe(2);
    });

    it('debe formatear tiempo de descanso muy largo', () => {
      const tiempoMuyLargo = 600; // 10 minutos

      expect(componente.formatRestTime(tiempoMuyLargo)).toBe('10m');
    });

    it('debe manejar toggleComplete con diferentes tipos de eventos', () => {
      const eventos = [
        new MouseEvent('click'),
        new PointerEvent('pointerdown'),
        new Event('custom')
      ];

      eventos.forEach(evento => {
        spyOn(evento, 'stopPropagation');
        componente.toggleComplete('exercise-1', evento);

        expect(evento.stopPropagation).toHaveBeenCalled();
      });
    });
  });
});
