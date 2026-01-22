import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AddProgressForm } from './add-progress-form';
import { ProgressService, ProgressEntry } from '../../services/progress.service';
import { ToastService } from '../../../../core/services/toast.service';

describe('AddProgressForm', () => {
  let component: AddProgressForm;
  let fixture: ComponentFixture<AddProgressForm>;
  let progressServiceSpy: jasmine.SpyObj<ProgressService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  // ==========================================
  // DATOS DE PRUEBA
  // ==========================================

  const usuarioMock = {
    id: 'user-123',
    nombre: 'Usuario Test',
    email: 'test@example.com'
  };

  const ejerciciosMock = ['Press de banca', 'Sentadilla', 'Peso muerto', 'Dominadas'];

  const entradaProgresoMock: ProgressEntry = {
    id: 'entry-1',
    userId: 'user-123',
    date: '2025-01-21',
    exerciseName: 'Press de banca',
    weight: 80,
    reps: 10,
    sets: 4,
    notes: 'Buena sesion'
  };

  // ==========================================
  // CONFIGURACION
  // ==========================================

  beforeEach(async () => {
    progressServiceSpy = jasmine.createSpyObj('ProgressService', [
      'getUserExercises',
      'addProgressEntry'
    ]);

    toastServiceSpy = jasmine.createSpyObj('ToastService', [
      'success',
      'error',
      'info',
      'warning'
    ]);

    // Configurar retornos por defecto
    progressServiceSpy.getUserExercises.and.returnValue(of(ejerciciosMock));
    progressServiceSpy.addProgressEntry.and.returnValue(of(entradaProgresoMock));

    await TestBed.configureTestingModule({
      imports: [AddProgressForm, ReactiveFormsModule],
      providers: [
        { provide: ProgressService, useValue: progressServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddProgressForm);
    component = fixture.componentInstance;

    // Simular usuario autenticado en localStorage
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(usuarioMock));
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

    it('deberia inicializar showForm en false', () => {
      expect(component.showForm()).toBeFalse();
    });

    it('deberia inicializar isSubmitting en false', () => {
      expect(component.isSubmitting()).toBeFalse();
    });

    it('deberia inicializar exercises como array vacio', () => {
      expect(component.exercises()).toEqual([]);
    });

    it('deberia tener el output progressAdded definido', () => {
      expect(component.progressAdded).toBeDefined();
    });
  });

  // ==========================================
  // TESTS DEL FORMULARIO
  // ==========================================

  describe('Formulario', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deberia crear el formulario con los campos correctos', () => {
      expect(component.progressForm.contains('exerciseName')).toBeTrue();
      expect(component.progressForm.contains('date')).toBeTrue();
      expect(component.progressForm.contains('weight')).toBeTrue();
      expect(component.progressForm.contains('reps')).toBeTrue();
      expect(component.progressForm.contains('sets')).toBeTrue();
      expect(component.progressForm.contains('notes')).toBeTrue();
    });

    it('deberia inicializar date con la fecha actual', () => {
      const fechaActual = new Date().toISOString().split('T')[0];
      const valorFecha = component.progressForm.get('date')?.value;

      expect(valorFecha).toBe(fechaActual);
    });

    it('deberia inicializar weight en 0', () => {
      expect(component.progressForm.get('weight')?.value).toBe(0);
    });

    it('deberia inicializar reps en 0', () => {
      expect(component.progressForm.get('reps')?.value).toBe(0);
    });

    it('deberia inicializar sets en 0', () => {
      expect(component.progressForm.get('sets')?.value).toBe(0);
    });

    it('deberia inicializar notes como string vacio', () => {
      expect(component.progressForm.get('notes')?.value).toBe('');
    });

    describe('Validaciones de exerciseName', () => {
      it('deberia ser requerido', () => {
        const control = component.progressForm.get('exerciseName');
        control?.setValue('');

        expect(control?.hasError('required')).toBeTrue();
      });

      it('deberia requerir minimo 2 caracteres', () => {
        const control = component.progressForm.get('exerciseName');
        control?.setValue('A');

        expect(control?.hasError('minlength')).toBeTrue();
      });

      it('deberia ser valido con 2 o mas caracteres', () => {
        const control = component.progressForm.get('exerciseName');
        control?.setValue('AB');

        expect(control?.valid).toBeTrue();
      });
    });

    describe('Validaciones de date', () => {
      it('deberia ser requerido', () => {
        const control = component.progressForm.get('date');
        control?.setValue('');

        expect(control?.hasError('required')).toBeTrue();
      });

      it('deberia ser valido con una fecha', () => {
        const control = component.progressForm.get('date');
        control?.setValue('2025-01-21');

        expect(control?.valid).toBeTrue();
      });
    });

    describe('Validaciones de weight', () => {
      it('deberia ser requerido', () => {
        const control = component.progressForm.get('weight');
        control?.setValue(null);

        expect(control?.hasError('required')).toBeTrue();
      });

      it('deberia requerir valor minimo de 0', () => {
        const control = component.progressForm.get('weight');
        control?.setValue(-1);

        expect(control?.hasError('min')).toBeTrue();
      });

      it('deberia ser valido con valor 0', () => {
        const control = component.progressForm.get('weight');
        control?.setValue(0);

        expect(control?.valid).toBeTrue();
      });

      it('deberia ser valido con valor positivo', () => {
        const control = component.progressForm.get('weight');
        control?.setValue(80);

        expect(control?.valid).toBeTrue();
      });
    });

    describe('Validaciones de reps', () => {
      it('deberia ser requerido', () => {
        const control = component.progressForm.get('reps');
        control?.setValue(null);

        expect(control?.hasError('required')).toBeTrue();
      });

      it('deberia requerir valor minimo de 1', () => {
        const control = component.progressForm.get('reps');
        control?.setValue(0);

        expect(control?.hasError('min')).toBeTrue();
      });

      it('deberia ser valido con valor 1 o mayor', () => {
        const control = component.progressForm.get('reps');
        control?.setValue(1);

        expect(control?.valid).toBeTrue();
      });
    });

    describe('Validaciones de sets', () => {
      it('deberia ser requerido', () => {
        const control = component.progressForm.get('sets');
        control?.setValue(null);

        expect(control?.hasError('required')).toBeTrue();
      });

      it('deberia requerir valor minimo de 1', () => {
        const control = component.progressForm.get('sets');
        control?.setValue(0);

        expect(control?.hasError('min')).toBeTrue();
      });

      it('deberia ser valido con valor 1 o mayor', () => {
        const control = component.progressForm.get('sets');
        control?.setValue(1);

        expect(control?.valid).toBeTrue();
      });
    });

    describe('Validaciones de notes', () => {
      it('deberia ser opcional (sin validaciones)', () => {
        const control = component.progressForm.get('notes');
        control?.setValue('');

        expect(control?.valid).toBeTrue();
      });

      it('deberia permitir texto largo', () => {
        const control = component.progressForm.get('notes');
        control?.setValue('Esta es una nota muy larga sobre el entrenamiento de hoy.');

        expect(control?.valid).toBeTrue();
      });
    });
  });

  // ==========================================
  // TESTS DE ngOnInit
  // ==========================================

  describe('ngOnInit', () => {
    it('deberia cargar los ejercicios del usuario', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(progressServiceSpy.getUserExercises).toHaveBeenCalledWith('user-123');
    }));

    it('deberia actualizar la lista de ejercicios', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(component.exercises()).toEqual(ejerciciosMock);
    }));

    it('deberia manejar error al cargar ejercicios', fakeAsync(() => {
      progressServiceSpy.getUserExercises.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');

      fixture.detectChanges();
      tick();

      expect(console.error).toHaveBeenCalled();
      expect(component.exercises()).toEqual([]);
    }));

    it('no deberia cargar ejercicios si no hay usuario autenticado', fakeAsync(() => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);
      progressServiceSpy.getUserExercises.calls.reset();

      fixture.detectChanges();
      tick();

      expect(progressServiceSpy.getUserExercises).not.toHaveBeenCalled();
    }));
  });

  // ==========================================
  // TESTS DE toggleForm
  // ==========================================

  describe('toggleForm', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deberia cambiar showForm de false a true', () => {
      expect(component.showForm()).toBeFalse();

      component.toggleForm();

      expect(component.showForm()).toBeTrue();
    });

    it('deberia cambiar showForm de true a false', () => {
      component.toggleForm(); // true
      expect(component.showForm()).toBeTrue();

      component.toggleForm(); // false

      expect(component.showForm()).toBeFalse();
    });

    it('deberia resetear el formulario al cerrar', () => {
      // Abrir formulario
      component.toggleForm();

      // Modificar valores
      component.progressForm.patchValue({
        exerciseName: 'Press de banca',
        weight: 100,
        reps: 12,
        sets: 4,
        notes: 'Test'
      });

      // Cerrar formulario
      component.toggleForm();

      // Verificar reset
      expect(component.progressForm.get('exerciseName')?.value).toBeNull();
      expect(component.progressForm.get('weight')?.value).toBe(0);
      expect(component.progressForm.get('reps')?.value).toBe(0);
      expect(component.progressForm.get('sets')?.value).toBe(0);
    });

    it('deberia mantener la fecha actual al resetear', () => {
      const fechaActual = new Date().toISOString().split('T')[0];

      component.toggleForm(); // abrir
      component.progressForm.patchValue({ date: '2020-01-01' });
      component.toggleForm(); // cerrar y resetear

      expect(component.progressForm.get('date')?.value).toBe(fechaActual);
    });

    it('no deberia resetear al abrir el formulario', () => {
      component.progressForm.patchValue({ notes: 'Test' });

      component.toggleForm(); // abrir

      // El formulario no se resetea al abrir, solo al cerrar
      expect(component.progressForm.get('notes')?.value).toBe('Test');
    });
  });

  // ==========================================
  // TESTS DE onSubmit
  // ==========================================

  describe('onSubmit', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    function rellenarFormularioValido() {
      component.progressForm.patchValue({
        exerciseName: 'Press de banca',
        date: '2025-01-21',
        weight: 80,
        reps: 10,
        sets: 4,
        notes: 'Buena sesion'
      });
    }

    it('no deberia enviar si el formulario es invalido', fakeAsync(() => {
      component.onSubmit();
      tick();

      expect(progressServiceSpy.addProgressEntry).not.toHaveBeenCalled();
    }));

    it('deberia marcar todos los campos como touched si el formulario es invalido', () => {
      component.onSubmit();

      expect(component.progressForm.get('exerciseName')?.touched).toBeTrue();
      expect(component.progressForm.get('date')?.touched).toBeTrue();
      expect(component.progressForm.get('weight')?.touched).toBeTrue();
      expect(component.progressForm.get('reps')?.touched).toBeTrue();
      expect(component.progressForm.get('sets')?.touched).toBeTrue();
    });

    it('no deberia enviar si ya se esta enviando', fakeAsync(() => {
      rellenarFormularioValido();
      (component as any).isSubmitting.set(true);

      component.onSubmit();
      tick();

      expect(progressServiceSpy.addProgressEntry).not.toHaveBeenCalled();
    }));

    it('deberia mostrar error si no hay usuario autenticado', fakeAsync(() => {
      rellenarFormularioValido();
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);

      component.onSubmit();
      tick();

      expect(toastServiceSpy.error).toHaveBeenCalledWith('Usuario no autenticado');
      expect(component.isSubmitting()).toBeFalse();
    }));

    describe('envio exitoso', () => {
      beforeEach(() => {
        rellenarFormularioValido();
      });

      it('deberia establecer isSubmitting en true al iniciar', fakeAsync(() => {
        let submittingDuranteEnvio = false;

        progressServiceSpy.addProgressEntry.and.callFake(() => {
          submittingDuranteEnvio = component.isSubmitting();
          return of(entradaProgresoMock);
        });

        component.onSubmit();
        tick();

        expect(submittingDuranteEnvio).toBeTrue();
      }));

      it('deberia llamar al servicio con los datos correctos', fakeAsync(() => {
        component.onSubmit();
        tick();

        expect(progressServiceSpy.addProgressEntry).toHaveBeenCalled();
        const datosEnviados = progressServiceSpy.addProgressEntry.calls.mostRecent().args[0];

        expect(datosEnviados.userId).toBe('user-123');
        expect(datosEnviados.exerciseName).toBe('Press de banca');
        expect(datosEnviados.weight).toBe(80);
        expect(datosEnviados.reps).toBe(10);
        expect(datosEnviados.sets).toBe(4);
      }));

      it('deberia mostrar toast de exito', fakeAsync(() => {
        component.onSubmit();
        tick();

        expect(toastServiceSpy.success).toHaveBeenCalledWith('Progreso registrado exitosamente');
      }));

      it('deberia emitir evento progressAdded', fakeAsync(() => {
        spyOn(component.progressAdded, 'emit');

        component.onSubmit();
        tick();

        expect(component.progressAdded.emit).toHaveBeenCalledWith(entradaProgresoMock);
      }));

      it('deberia cerrar el formulario despues del envio', fakeAsync(() => {
        component.showForm.set(true);

        component.onSubmit();
        tick();

        expect(component.showForm()).toBeFalse();
      }));

      it('deberia establecer isSubmitting en false al completar', fakeAsync(() => {
        component.onSubmit();
        tick();

        expect(component.isSubmitting()).toBeFalse();
      }));

      it('deberia recargar la lista de ejercicios', fakeAsync(() => {
        progressServiceSpy.getUserExercises.calls.reset();

        component.onSubmit();
        tick();

        expect(progressServiceSpy.getUserExercises).toHaveBeenCalled();
      }));

      it('deberia manejar notes como undefined si esta vacio', fakeAsync(() => {
        component.progressForm.patchValue({ notes: '' });

        component.onSubmit();
        tick();

        const datosEnviados = progressServiceSpy.addProgressEntry.calls.mostRecent().args[0];
        expect(datosEnviados.notes).toBeUndefined();
      }));
    });

    describe('error en el envio', () => {
      beforeEach(() => {
        rellenarFormularioValido();
        progressServiceSpy.addProgressEntry.and.returnValue(
          throwError(() => new Error('Error de red'))
        );
      });

      it('deberia mostrar toast de error', fakeAsync(() => {
        spyOn(console, 'error');

        component.onSubmit();
        tick();

        expect(toastServiceSpy.error).toHaveBeenCalledWith('Error al registrar el progreso');
      }));

      it('deberia establecer isSubmitting en false', fakeAsync(() => {
        spyOn(console, 'error');

        component.onSubmit();
        tick();

        expect(component.isSubmitting()).toBeFalse();
      }));

      it('deberia loguear el error en consola', fakeAsync(() => {
        spyOn(console, 'error');

        component.onSubmit();
        tick();

        expect(console.error).toHaveBeenCalled();
      }));

      it('no deberia emitir evento progressAdded', fakeAsync(() => {
        spyOn(console, 'error');
        spyOn(component.progressAdded, 'emit');

        component.onSubmit();
        tick();

        expect(component.progressAdded.emit).not.toHaveBeenCalled();
      }));

      it('no deberia cerrar el formulario', fakeAsync(() => {
        spyOn(console, 'error');
        component.showForm.set(true);

        component.onSubmit();
        tick();

        expect(component.showForm()).toBeTrue();
      }));
    });
  });

  // ==========================================
  // TESTS DE INTEGRACION
  // ==========================================

  describe('Integracion', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deberia permitir ciclo completo: abrir formulario, rellenar y enviar', fakeAsync(() => {
      spyOn(component.progressAdded, 'emit');

      // Abrir formulario
      component.toggleForm();
      expect(component.showForm()).toBeTrue();

      // Rellenar formulario
      component.progressForm.patchValue({
        exerciseName: 'Sentadilla',
        date: '2025-01-21',
        weight: 100,
        reps: 8,
        sets: 5,
        notes: 'PR personal'
      });

      // Enviar
      component.onSubmit();
      tick();

      // Verificar resultados
      expect(toastServiceSpy.success).toHaveBeenCalled();
      expect(component.progressAdded.emit).toHaveBeenCalled();
      expect(component.showForm()).toBeFalse();
      expect(component.isSubmitting()).toBeFalse();
    }));

    it('deberia permitir multiples envios consecutivos', fakeAsync(() => {
      // Primer envio
      component.toggleForm();
      component.progressForm.patchValue({
        exerciseName: 'Press de banca',
        date: '2025-01-21',
        weight: 80,
        reps: 10,
        sets: 4
      });
      component.onSubmit();
      tick();

      // Segundo envio
      component.toggleForm();
      component.progressForm.patchValue({
        exerciseName: 'Sentadilla',
        date: '2025-01-21',
        weight: 100,
        reps: 8,
        sets: 5
      });
      component.onSubmit();
      tick();

      expect(progressServiceSpy.addProgressEntry).toHaveBeenCalledTimes(2);
    }));

    it('deberia mantener lista de ejercicios actualizada despues de enviar', fakeAsync(() => {
      const ejerciciosActualizados = [...ejerciciosMock, 'Curl de biceps'];
      progressServiceSpy.getUserExercises.and.returnValue(of(ejerciciosActualizados));

      component.toggleForm();
      component.progressForm.patchValue({
        exerciseName: 'Curl de biceps',
        date: '2025-01-21',
        weight: 20,
        reps: 12,
        sets: 3
      });
      component.onSubmit();
      tick();

      expect(component.exercises()).toEqual(ejerciciosActualizados);
    }));
  });

  // ==========================================
  // TESTS DE ESTADO
  // ==========================================

  describe('Estado de signals', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('showForm deberia ser un WritableSignal', () => {
      expect(typeof component.showForm).toBe('function');
      expect(typeof component.showForm()).toBe('boolean');
    });

    it('isSubmitting deberia ser un WritableSignal', () => {
      expect(typeof component.isSubmitting).toBe('function');
      expect(typeof component.isSubmitting()).toBe('boolean');
    });

    it('exercises deberia ser un WritableSignal', () => {
      expect(typeof component.exercises).toBe('function');
      expect(Array.isArray(component.exercises())).toBeTrue();
    });

    it('deberia permitir actualizar showForm directamente', () => {
      component.showForm.set(true);
      expect(component.showForm()).toBeTrue();

      component.showForm.set(false);
      expect(component.showForm()).toBeFalse();
    });
  });

  // ==========================================
  // TESTS DE CASOS EDGE
  // ==========================================

  describe('Casos edge', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deberia manejar fecha nula usando fecha actual', fakeAsync(() => {
      component.progressForm.patchValue({
        exerciseName: 'Test',
        date: null,
        weight: 50,
        reps: 10,
        sets: 3
      });

      // Forzar que el formulario sea valido manualmente
      Object.keys(component.progressForm.controls).forEach(key => {
        component.progressForm.get(key)?.setErrors(null);
      });

      component.onSubmit();
      tick();

      const datosEnviados = progressServiceSpy.addProgressEntry.calls.mostRecent().args[0];
      expect(datosEnviados.date).toBeTruthy();
    }));

    it('deberia manejar weight como 0 correctamente', fakeAsync(() => {
      component.progressForm.patchValue({
        exerciseName: 'Dominadas',
        date: '2025-01-21',
        weight: 0,
        reps: 10,
        sets: 3
      });

      component.onSubmit();
      tick();

      const datosEnviados = progressServiceSpy.addProgressEntry.calls.mostRecent().args[0];
      expect(datosEnviados.weight).toBe(0);
    }));

    it('deberia manejar exerciseName vacio como string vacio', fakeAsync(() => {
      component.progressForm.patchValue({
        exerciseName: '',
        date: '2025-01-21',
        weight: 50,
        reps: 10,
        sets: 3
      });

      // Forzar validez
      Object.keys(component.progressForm.controls).forEach(key => {
        component.progressForm.get(key)?.setErrors(null);
      });

      component.onSubmit();
      tick();

      const datosEnviados = progressServiceSpy.addProgressEntry.calls.mostRecent().args[0];
      expect(datosEnviados.exerciseName).toBe('');
    }));

    it('deberia manejar JSON invalido en localStorage', fakeAsync(() => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('invalid json');

      component.progressForm.patchValue({
        exerciseName: 'Test',
        date: '2025-01-21',
        weight: 50,
        reps: 10,
        sets: 3
      });

      expect(() => component.onSubmit()).toThrow();
    }));
  });
});
