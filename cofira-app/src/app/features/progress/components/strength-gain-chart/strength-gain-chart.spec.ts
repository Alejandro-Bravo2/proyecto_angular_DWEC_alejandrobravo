import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StrengthGainChart } from './strength-gain-chart';
import { ProgressEntry } from '../../services/progress.service';

describe('StrengthGainChart', () => {
  let component: StrengthGainChart;
  let fixture: ComponentFixture<StrengthGainChart>;
  let componentRef: ComponentRef<StrengthGainChart>;

  const entradasProgresoMock: ProgressEntry[] = [
    {
      id: '1',
      userId: 'user-123',
      date: '2025-01-10',
      exerciseName: 'Press de banca',
      weight: 75,
      reps: 10,
      sets: 4,
      notes: ''
    },
    {
      id: '2',
      userId: 'user-123',
      date: '2025-01-15',
      exerciseName: 'Press de banca',
      weight: 80,
      reps: 10,
      sets: 4,
      notes: ''
    },
    {
      id: '3',
      userId: 'user-123',
      date: '2025-01-20',
      exerciseName: 'Sentadilla',
      weight: 100,
      reps: 8,
      sets: 5,
      notes: ''
    },
    {
      id: '4',
      userId: 'user-123',
      date: '2025-01-21',
      exerciseName: 'Press de banca',
      weight: 85,
      reps: 8,
      sets: 4,
      notes: ''
    }
  ];

  const ejerciciosMock = ['Press de banca', 'Sentadilla', 'Peso muerto'];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StrengthGainChart],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(StrengthGainChart);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  // ==========================================
  // TESTS DE CREACION
  // ==========================================

  describe('Creacion del componente', () => {
    it('deberia crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('deberia inicializar progressEntries como array vacio', () => {
      fixture.detectChanges();
      expect(component.progressEntries()).toEqual([]);
    });

    it('deberia inicializar exercises como array vacio', () => {
      fixture.detectChanges();
      expect(component.exercises()).toEqual([]);
    });

    it('deberia inicializar selectedExercise como string vacio', () => {
      fixture.detectChanges();
      expect(component.selectedExercise()).toBe('');
    });

    it('deberia tener lineChartData inicializado', () => {
      fixture.detectChanges();
      expect(component.lineChartData()).toBeDefined();
    });

    it('deberia tener lineChartOptions configurado', () => {
      expect(component.lineChartOptions).toBeDefined();
    });
  });

  // ==========================================
  // TESTS DE INPUT SIGNALS
  // ==========================================

  describe('progressEntries input', () => {
    it('deberia aceptar array de entradas', () => {
      componentRef.setInput('progressEntries', entradasProgresoMock);
      fixture.detectChanges();

      expect(component.progressEntries()).toEqual(entradasProgresoMock);
    });

    it('deberia aceptar array vacio', () => {
      componentRef.setInput('progressEntries', []);
      fixture.detectChanges();

      expect(component.progressEntries()).toEqual([]);
    });

    it('deberia actualizar cuando cambian las entradas', () => {
      const primeraEntrada = [entradasProgresoMock[0]];
      componentRef.setInput('progressEntries', primeraEntrada);
      fixture.detectChanges();

      expect(component.progressEntries().length).toBe(1);

      componentRef.setInput('progressEntries', entradasProgresoMock);
      fixture.detectChanges();

      expect(component.progressEntries().length).toBe(4);
    });
  });

  describe('exercises input', () => {
    it('deberia aceptar array de ejercicios', () => {
      componentRef.setInput('exercises', ejerciciosMock);
      fixture.detectChanges();

      expect(component.exercises()).toEqual(ejerciciosMock);
    });

    it('deberia aceptar array vacio', () => {
      componentRef.setInput('exercises', []);
      fixture.detectChanges();

      expect(component.exercises()).toEqual([]);
    });
  });

  // ==========================================
  // TESTS DE selectedExercise SIGNAL
  // ==========================================

  describe('selectedExercise signal', () => {
    it('deberia permitir actualizar el ejercicio seleccionado', () => {
      component.selectedExercise.set('Press de banca');
      fixture.detectChanges();

      expect(component.selectedExercise()).toBe('Press de banca');
    });

    it('deberia permitir limpiar el ejercicio seleccionado', () => {
      component.selectedExercise.set('Press de banca');
      expect(component.selectedExercise()).toBe('Press de banca');

      component.selectedExercise.set('');
      fixture.detectChanges();

      expect(component.selectedExercise()).toBe('');
    });
  });

  // ==========================================
  // TESTS DE COMPUTED: filteredProgress
  // ==========================================

  describe('filteredProgress computed', () => {
    beforeEach(() => {
      componentRef.setInput('progressEntries', entradasProgresoMock);
      fixture.detectChanges();
    });

    it('deberia retornar array vacio cuando no hay ejercicio seleccionado', () => {
      component.selectedExercise.set('');
      fixture.detectChanges();

      expect(component.filteredProgress()).toEqual([]);
    });

    it('deberia filtrar entradas por ejercicio seleccionado', () => {
      component.selectedExercise.set('Press de banca');
      fixture.detectChanges();

      const filtradas = component.filteredProgress();
      expect(filtradas.length).toBe(3);
      expect(filtradas.every(e => e.exerciseName === 'Press de banca')).toBeTrue();
    });

    it('deberia ordenar entradas por fecha ascendente', () => {
      component.selectedExercise.set('Press de banca');
      fixture.detectChanges();

      const filtradas = component.filteredProgress();
      const fechas = filtradas.map(e => e.date);

      expect(fechas).toEqual(['2025-01-10', '2025-01-15', '2025-01-21']);
    });

    it('deberia retornar array vacio para ejercicio no existente', () => {
      component.selectedExercise.set('Ejercicio inexistente');
      fixture.detectChanges();

      expect(component.filteredProgress()).toEqual([]);
    });

    it('deberia actualizar cuando cambia el ejercicio seleccionado', () => {
      component.selectedExercise.set('Press de banca');
      fixture.detectChanges();
      expect(component.filteredProgress().length).toBe(3);

      component.selectedExercise.set('Sentadilla');
      fixture.detectChanges();
      expect(component.filteredProgress().length).toBe(1);
    });
  });

  // ==========================================
  // TESTS DE COMPUTED: hasProgressData
  // ==========================================

  describe('hasProgressData computed', () => {
    it('deberia retornar false cuando no hay datos filtrados', () => {
      component.selectedExercise.set('');
      fixture.detectChanges();

      expect(component.hasProgressData()).toBeFalse();
    });

    it('deberia retornar true cuando hay datos filtrados', () => {
      componentRef.setInput('progressEntries', entradasProgresoMock);
      component.selectedExercise.set('Press de banca');
      fixture.detectChanges();

      expect(component.hasProgressData()).toBeTrue();
    });
  });

  // ==========================================
  // TESTS DE lineChartData
  // ==========================================

  describe('lineChartData', () => {
    it('deberia inicializar con labels y datasets vacios', () => {
      fixture.detectChanges();
      const chartData = component.lineChartData();

      expect(chartData.labels).toEqual([]);
      expect(chartData.datasets).toEqual([]);
    });

    it('deberia actualizar labels con fechas formateadas', () => {
      componentRef.setInput('progressEntries', entradasProgresoMock);
      component.selectedExercise.set('Press de banca');
      fixture.detectChanges();

      const chartData = component.lineChartData();
      expect(chartData.labels?.length).toBe(3);
      // Las fechas se formatean a formato local español
      expect(chartData.labels).toBeTruthy();
    });

    it('deberia incluir dataset de peso maximo', () => {
      componentRef.setInput('progressEntries', entradasProgresoMock);
      component.selectedExercise.set('Press de banca');
      fixture.detectChanges();

      const chartData = component.lineChartData();
      const pesoDataset = chartData.datasets.find(d => d.label === 'Peso Máximo (kg)');

      expect(pesoDataset).toBeDefined();
      expect(pesoDataset?.data).toEqual([75, 80, 85]);
    });

    it('deberia incluir dataset de volumen total', () => {
      componentRef.setInput('progressEntries', entradasProgresoMock);
      component.selectedExercise.set('Press de banca');
      fixture.detectChanges();

      const chartData = component.lineChartData();
      const volumenDataset = chartData.datasets.find(d => d.label === 'Volumen Total (kg)');

      expect(volumenDataset).toBeDefined();
      // 75*10*4=3000, 80*10*4=3200, 85*8*4=2720
      expect(volumenDataset?.data).toEqual([3000, 3200, 2720]);
    });

    it('deberia configurar colores correctamente para peso', () => {
      componentRef.setInput('progressEntries', entradasProgresoMock);
      component.selectedExercise.set('Press de banca');
      fixture.detectChanges();

      const chartData = component.lineChartData();
      const pesoDataset = chartData.datasets[0];

      expect(pesoDataset.borderColor).toBe('#FDB913');
      expect(pesoDataset.backgroundColor).toBe('rgba(253, 185, 19, 0.1)');
    });

    it('deberia configurar colores correctamente para volumen', () => {
      componentRef.setInput('progressEntries', entradasProgresoMock);
      component.selectedExercise.set('Press de banca');
      fixture.detectChanges();

      const chartData = component.lineChartData();
      const volumenDataset = chartData.datasets[1];

      expect(volumenDataset.borderColor).toBe('#2C3E50');
      expect(volumenDataset.backgroundColor).toBe('rgba(44, 62, 80, 0.1)');
    });

    it('deberia limpiar datos cuando no hay progreso filtrado', () => {
      componentRef.setInput('progressEntries', entradasProgresoMock);
      component.selectedExercise.set('Press de banca');
      fixture.detectChanges();

      // Verificar que hay datos
      expect(component.lineChartData().datasets.length).toBe(2);

      // Limpiar seleccion
      component.selectedExercise.set('');
      fixture.detectChanges();

      const chartData = component.lineChartData();
      expect(chartData.labels).toEqual([]);
      expect(chartData.datasets).toEqual([]);
    });
  });

  // ==========================================
  // TESTS DE lineChartOptions
  // ==========================================

  describe('lineChartOptions', () => {
    it('deberia tener opciones de chart configuradas', () => {
      expect(component.lineChartOptions).toBeDefined();
    });

    it('deberia ser responsive', () => {
      expect(component.lineChartOptions?.responsive).toBeTrue();
    });

    it('deberia no mantener aspect ratio', () => {
      expect(component.lineChartOptions?.maintainAspectRatio).toBeFalse();
    });

    it('deberia mostrar la leyenda', () => {
      expect(component.lineChartOptions?.plugins?.legend?.display).toBeTrue();
    });

    it('deberia posicionar la leyenda arriba', () => {
      expect(component.lineChartOptions?.plugins?.legend?.position).toBe('top');
    });

    it('deberia configurar tooltip en modo index', () => {
      expect(component.lineChartOptions?.plugins?.tooltip?.mode).toBe('index');
    });

    it('deberia configurar eje Y sin comenzar en cero', () => {
      const yScale = component.lineChartOptions?.scales?.['y'] as any;
      expect(yScale?.beginAtZero).toBeFalse();
    });

    it('deberia tener titulo en eje Y', () => {
      expect(component.lineChartOptions?.scales?.['y']?.title?.display).toBeTrue();
      expect(component.lineChartOptions?.scales?.['y']?.title?.text).toBe('Peso (kg)');
    });

    it('deberia tener titulo en eje X', () => {
      expect(component.lineChartOptions?.scales?.['x']?.title?.display).toBeTrue();
      expect(component.lineChartOptions?.scales?.['x']?.title?.text).toBe('Fecha');
    });
  });

  // ==========================================
  // TESTS DE onExerciseChange
  // ==========================================

  describe('onExerciseChange', () => {
    it('deberia actualizar selectedExercise con el valor del select', () => {
      const event = {
        target: { value: 'Press de banca' } as HTMLSelectElement
      } as unknown as Event;

      component.onExerciseChange(event);
      fixture.detectChanges();

      expect(component.selectedExercise()).toBe('Press de banca');
    });

    it('deberia actualizar selectedExercise con valor vacio', () => {
      component.selectedExercise.set('Press de banca');

      const event = {
        target: { value: '' } as HTMLSelectElement
      } as unknown as Event;

      component.onExerciseChange(event);
      fixture.detectChanges();

      expect(component.selectedExercise()).toBe('');
    });

    it('deberia actualizar los datos del chart al cambiar ejercicio', () => {
      componentRef.setInput('progressEntries', entradasProgresoMock);
      fixture.detectChanges();

      const event = {
        target: { value: 'Press de banca' } as HTMLSelectElement
      } as unknown as Event;

      component.onExerciseChange(event);
      fixture.detectChanges();

      expect(component.lineChartData().datasets.length).toBe(2);
    });
  });

  // ==========================================
  // TESTS DE INTEGRACION
  // ==========================================

  describe('Integracion', () => {
    it('deberia actualizar todos los computed cuando cambian las entradas', () => {
      componentRef.setInput('progressEntries', []);
      component.selectedExercise.set('Press de banca');
      fixture.detectChanges();

      expect(component.filteredProgress()).toEqual([]);
      expect(component.hasProgressData()).toBeFalse();
      expect(component.lineChartData().datasets.length).toBe(0);

      componentRef.setInput('progressEntries', entradasProgresoMock);
      fixture.detectChanges();

      expect(component.filteredProgress().length).toBe(3);
      expect(component.hasProgressData()).toBeTrue();
      expect(component.lineChartData().datasets.length).toBe(2);
    });

    it('deberia manejar cambio de ejercicio con recalculo de datos', () => {
      componentRef.setInput('progressEntries', entradasProgresoMock);
      component.selectedExercise.set('Press de banca');
      fixture.detectChanges();

      expect(component.filteredProgress().length).toBe(3);

      component.selectedExercise.set('Sentadilla');
      fixture.detectChanges();

      expect(component.filteredProgress().length).toBe(1);
      expect(component.lineChartData().datasets.length).toBe(2);
    });

    it('deberia calcular volumen correctamente para multiples entradas', () => {
      componentRef.setInput('progressEntries', entradasProgresoMock);
      component.selectedExercise.set('Press de banca');
      fixture.detectChanges();

      const chartData = component.lineChartData();
      const volumenDataset = chartData.datasets[1];

      // Verificar calculos: peso * reps * sets
      expect(volumenDataset.data[0]).toBe(75 * 10 * 4);
      expect(volumenDataset.data[1]).toBe(80 * 10 * 4);
      expect(volumenDataset.data[2]).toBe(85 * 8 * 4);
    });
  });
});
