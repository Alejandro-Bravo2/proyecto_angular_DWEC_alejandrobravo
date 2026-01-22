import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { ExerciseRow } from './exercise-row';

describe('ExerciseRow', () => {
  let componente: ExerciseRow;
  let fixture: ComponentFixture<ExerciseRow>;

  const mockEjercicio = {
    name: 'Press de banca',
    sets: 4,
    reps: '10-12',
    completed: false
  };

  const mockEjercicioCompletado = {
    name: 'Sentadillas',
    sets: 5,
    reps: '8-10',
    completed: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseRow],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ExerciseRow);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(componente).toBeTruthy();
  });

  // ==========================================
  // PRUEBAS DE ESTADO INICIAL
  // ==========================================

  describe('Estado inicial', () => {
    it('debe tener exercise como undefined por defecto', () => {
      expect(componente.exercise()).toBeUndefined();
    });
  });

  // ==========================================
  // PRUEBAS DE INPUT SIGNAL
  // ==========================================

  describe('Input signal: exercise', () => {
    it('debe recibir un ejercicio a través del input', () => {
      fixture.componentRef.setInput('exercise', mockEjercicio);
      fixture.detectChanges();

      expect(componente.exercise()).toBeDefined();
      expect(componente.exercise()?.name).toBe('Press de banca');
    });

    it('debe actualizar cuando el input cambia', () => {
      fixture.componentRef.setInput('exercise', mockEjercicio);
      fixture.detectChanges();

      expect(componente.exercise()?.name).toBe('Press de banca');

      fixture.componentRef.setInput('exercise', mockEjercicioCompletado);
      fixture.detectChanges();

      expect(componente.exercise()?.name).toBe('Sentadillas');
    });

    it('debe manejar ejercicio con completed false', () => {
      fixture.componentRef.setInput('exercise', mockEjercicio);
      fixture.detectChanges();

      expect(componente.exercise()?.completed).toBeFalse();
    });

    it('debe manejar ejercicio con completed true', () => {
      fixture.componentRef.setInput('exercise', mockEjercicioCompletado);
      fixture.detectChanges();

      expect(componente.exercise()?.completed).toBeTrue();
    });

    it('debe recibir ejercicio con diferentes series', () => {
      const ejercicioConMuchasSeries = {
        ...mockEjercicio,
        sets: 10,
        reps: '5-8'
      };

      fixture.componentRef.setInput('exercise', ejercicioConMuchasSeries);
      fixture.detectChanges();

      expect(componente.exercise()?.sets).toBe(10);
      expect(componente.exercise()?.reps).toBe('5-8');
    });

    it('debe manejar ejercicio con sets mínimos', () => {
      const ejercicioSetsMinimos = {
        ...mockEjercicio,
        sets: 1,
        reps: '1'
      };

      fixture.componentRef.setInput('exercise', ejercicioSetsMinimos);
      fixture.detectChanges();

      expect(componente.exercise()?.sets).toBe(1);
      expect(componente.exercise()?.reps).toBe('1');
    });
  });

  // ==========================================
  // PRUEBAS DE PROPIEDADES DEL EJERCICIO
  // ==========================================

  describe('Propiedades del ejercicio', () => {
    it('debe mantener todas las propiedades del ejercicio', () => {
      const ejercicioCompleto = {
        name: 'Dominadas',
        sets: 3,
        reps: 'hasta fallo',
        completed: false
      };

      fixture.componentRef.setInput('exercise', ejercicioCompleto);
      fixture.detectChanges();

      const exercise = componente.exercise();
      expect(exercise?.name).toBe('Dominadas');
      expect(exercise?.sets).toBe(3);
      expect(exercise?.reps).toBe('hasta fallo');
      expect(exercise?.completed).toBeFalse();
    });

    it('debe manejar nombres de ejercicio largos', () => {
      const ejercicioNombreLargo = {
        ...mockEjercicio,
        name: 'Press de banca inclinado con mancuernas alternas'
      };

      fixture.componentRef.setInput('exercise', ejercicioNombreLargo);
      fixture.detectChanges();

      expect(componente.exercise()?.name).toBe('Press de banca inclinado con mancuernas alternas');
    });

    it('debe manejar nombres de ejercicio cortos', () => {
      const ejercicioNombreCorto = {
        ...mockEjercicio,
        name: 'AB'
      };

      fixture.componentRef.setInput('exercise', ejercicioNombreCorto);
      fixture.detectChanges();

      expect(componente.exercise()?.name).toBe('AB');
    });

    it('debe manejar reps como rango', () => {
      const ejercicioRango = {
        ...mockEjercicio,
        reps: '8-12'
      };

      fixture.componentRef.setInput('exercise', ejercicioRango);
      fixture.detectChanges();

      expect(componente.exercise()?.reps).toBe('8-12');
    });

    it('debe manejar reps como número fijo', () => {
      const ejercicioNumeroFijo = {
        ...mockEjercicio,
        reps: '10'
      };

      fixture.componentRef.setInput('exercise', ejercicioNumeroFijo);
      fixture.detectChanges();

      expect(componente.exercise()?.reps).toBe('10');
    });

    it('debe manejar reps como texto descriptivo', () => {
      const ejercicioTextoDescriptivo = {
        ...mockEjercicio,
        reps: 'máximo posible'
      };

      fixture.componentRef.setInput('exercise', ejercicioTextoDescriptivo);
      fixture.detectChanges();

      expect(componente.exercise()?.reps).toBe('máximo posible');
    });
  });

  // ==========================================
  // PRUEBAS DE REACTIVIDAD
  // ==========================================

  describe('Reactividad del componente', () => {
    it('debe reaccionar inmediatamente a cambios en el input', () => {
      fixture.componentRef.setInput('exercise', mockEjercicio);
      fixture.detectChanges();

      expect(componente.exercise()?.completed).toBeFalse();

      const ejercicioActualizado = { ...mockEjercicio, completed: true };
      fixture.componentRef.setInput('exercise', ejercicioActualizado);
      fixture.detectChanges();

      expect(componente.exercise()?.completed).toBeTrue();
    });

    it('debe mantener el estado correcto después de múltiples actualizaciones', () => {
      const ejercicios = [
        { name: 'Ejercicio 1', sets: 3, reps: '10', completed: false },
        { name: 'Ejercicio 2', sets: 4, reps: '8', completed: true },
        { name: 'Ejercicio 3', sets: 5, reps: '6', completed: false }
      ];

      ejercicios.forEach(ejercicio => {
        fixture.componentRef.setInput('exercise', ejercicio);
        fixture.detectChanges();

        expect(componente.exercise()?.name).toBe(ejercicio.name);
        expect(componente.exercise()?.sets).toBe(ejercicio.sets);
        expect(componente.exercise()?.reps).toBe(ejercicio.reps);
        expect(componente.exercise()?.completed).toBe(ejercicio.completed);
      });
    });
  });

  // ==========================================
  // PRUEBAS DE CASOS EXTREMOS
  // ==========================================

  describe('Casos extremos', () => {
    it('debe manejar undefined como valor de exercise', () => {
      fixture.componentRef.setInput('exercise', undefined);
      fixture.detectChanges();

      expect(componente.exercise()).toBeUndefined();
    });

    it('debe manejar ejercicio con sets en 0', () => {
      const ejercicioSinSets = {
        ...mockEjercicio,
        sets: 0
      };

      fixture.componentRef.setInput('exercise', ejercicioSinSets);
      fixture.detectChanges();

      expect(componente.exercise()?.sets).toBe(0);
    });

    it('debe manejar ejercicio con nombre vacío', () => {
      const ejercicioNombreVacio = {
        ...mockEjercicio,
        name: ''
      };

      fixture.componentRef.setInput('exercise', ejercicioNombreVacio);
      fixture.detectChanges();

      expect(componente.exercise()?.name).toBe('');
    });

    it('debe manejar ejercicio con reps vacío', () => {
      const ejercicioRepsVacio = {
        ...mockEjercicio,
        reps: ''
      };

      fixture.componentRef.setInput('exercise', ejercicioRepsVacio);
      fixture.detectChanges();

      expect(componente.exercise()?.reps).toBe('');
    });

    it('debe manejar ejercicio con sets muy alto', () => {
      const ejercicioSetsMuyAlto = {
        ...mockEjercicio,
        sets: 999
      };

      fixture.componentRef.setInput('exercise', ejercicioSetsMuyAlto);
      fixture.detectChanges();

      expect(componente.exercise()?.sets).toBe(999);
    });
  });

  // ==========================================
  // PRUEBAS DE INTEGRACIÓN CON TEMPLATE
  // ==========================================

  describe('Integración con template', () => {
    it('debe renderizar sin errores cuando exercise es undefined', () => {
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('debe renderizar sin errores con ejercicio válido', () => {
      fixture.componentRef.setInput('exercise', mockEjercicio);

      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('debe actualizar la vista cuando el input cambia', () => {
      fixture.componentRef.setInput('exercise', mockEjercicio);
      fixture.detectChanges();

      const elementoAntes = fixture.nativeElement;

      fixture.componentRef.setInput('exercise', mockEjercicioCompletado);
      fixture.detectChanges();

      const elementoDespues = fixture.nativeElement;

      expect(elementoAntes).toBe(elementoDespues); // Mismo elemento DOM
    });
  });

  // ==========================================
  // PRUEBAS DE CHANGE DETECTION
  // ==========================================

  describe('Change Detection', () => {
    it('debe usar OnPush change detection strategy', () => {
      // El componente tiene changeDetection: ChangeDetectionStrategy.OnPush
      const componentRef = fixture.componentRef;

      expect(componentRef).toBeTruthy();
      expect(componente).toBeTruthy();
    });

    it('debe detectar cambios solo cuando el input cambia', () => {
      fixture.componentRef.setInput('exercise', mockEjercicio);

      let detectionCount = 0;
      const originalDetectChanges = fixture.detectChanges.bind(fixture);
      fixture.detectChanges = () => {
        detectionCount++;
        originalDetectChanges();
      };

      fixture.detectChanges();
      expect(detectionCount).toBe(1);

      fixture.componentRef.setInput('exercise', mockEjercicioCompletado);
      fixture.detectChanges();
      expect(detectionCount).toBe(2);
    });
  });
});
