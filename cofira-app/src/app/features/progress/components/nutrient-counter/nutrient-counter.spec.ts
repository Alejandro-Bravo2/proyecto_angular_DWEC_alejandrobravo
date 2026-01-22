import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NutrientCounter } from './nutrient-counter';
import { NutrientData } from '../../services/progress.service';

describe('NutrientCounter', () => {
  let component: NutrientCounter;
  let fixture: ComponentFixture<NutrientCounter>;
  let componentRef: ComponentRef<NutrientCounter>;

  const nutrientesDatosMock: NutrientData = {
    date: '2025-01-21',
    protein: 150,
    carbs: 200,
    fat: 70,
    fiber: 30,
    water: 2500,
    calories: 2100,
    calorieGoal: 2200
  };

  const nutrientesVaciosMock: NutrientData = {
    date: '2025-01-21',
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    water: 0,
    calories: 0,
    calorieGoal: 2000
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NutrientCounter],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NutrientCounter);
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

    it('deberia inicializar con nutrientData nulo', () => {
      fixture.detectChanges();
      expect(component.nutrientData()).toBeNull();
    });

    it('deberia tener hasNutrientData en false inicialmente', () => {
      fixture.detectChanges();
      expect(component.hasNutrientData()).toBeFalse();
    });

    it('deberia tener caloriePercentage en 0 inicialmente', () => {
      fixture.detectChanges();
      expect(component.caloriePercentage()).toBe(0);
    });

    it('deberia tener doughnutChartData inicializado', () => {
      fixture.detectChanges();
      expect(component.doughnutChartData()).toBeDefined();
    });
  });

  // ==========================================
  // TESTS DE INPUT SIGNAL
  // ==========================================

  describe('nutrientData input', () => {
    it('deberia aceptar datos de nutrientes', () => {
      componentRef.setInput('nutrientData', nutrientesDatosMock);
      fixture.detectChanges();

      expect(component.nutrientData()).toEqual(nutrientesDatosMock);
    });

    it('deberia aceptar null', () => {
      componentRef.setInput('nutrientData', null);
      fixture.detectChanges();

      expect(component.nutrientData()).toBeNull();
    });

    it('deberia actualizar cuando cambian los datos', () => {
      componentRef.setInput('nutrientData', nutrientesVaciosMock);
      fixture.detectChanges();

      expect(component.nutrientData()).toEqual(nutrientesVaciosMock);

      componentRef.setInput('nutrientData', nutrientesDatosMock);
      fixture.detectChanges();

      expect(component.nutrientData()).toEqual(nutrientesDatosMock);
    });
  });

  // ==========================================
  // TESTS DE COMPUTED: hasNutrientData
  // ==========================================

  describe('hasNutrientData computed', () => {
    it('deberia retornar false cuando nutrientData es null', () => {
      componentRef.setInput('nutrientData', null);
      fixture.detectChanges();

      expect(component.hasNutrientData()).toBeFalse();
    });

    it('deberia retornar false cuando todos los valores son cero', () => {
      componentRef.setInput('nutrientData', nutrientesVaciosMock);
      fixture.detectChanges();

      expect(component.hasNutrientData()).toBeFalse();
    });

    it('deberia retornar true cuando protein es mayor que 0', () => {
      const datos: NutrientData = { ...nutrientesVaciosMock, protein: 50 };
      componentRef.setInput('nutrientData', datos);
      fixture.detectChanges();

      expect(component.hasNutrientData()).toBeTrue();
    });

    it('deberia retornar true cuando carbs es mayor que 0', () => {
      const datos: NutrientData = { ...nutrientesVaciosMock, carbs: 100 };
      componentRef.setInput('nutrientData', datos);
      fixture.detectChanges();

      expect(component.hasNutrientData()).toBeTrue();
    });

    it('deberia retornar true cuando fat es mayor que 0', () => {
      const datos: NutrientData = { ...nutrientesVaciosMock, fat: 30 };
      componentRef.setInput('nutrientData', datos);
      fixture.detectChanges();

      expect(component.hasNutrientData()).toBeTrue();
    });

    it('deberia retornar true cuando calories es mayor que 0', () => {
      const datos: NutrientData = { ...nutrientesVaciosMock, calories: 500 };
      componentRef.setInput('nutrientData', datos);
      fixture.detectChanges();

      expect(component.hasNutrientData()).toBeTrue();
    });

    it('deberia retornar true cuando hay datos completos', () => {
      componentRef.setInput('nutrientData', nutrientesDatosMock);
      fixture.detectChanges();

      expect(component.hasNutrientData()).toBeTrue();
    });
  });

  // ==========================================
  // TESTS DE COMPUTED: caloriePercentage
  // ==========================================

  describe('caloriePercentage computed', () => {
    it('deberia retornar 0 cuando nutrientData es null', () => {
      componentRef.setInput('nutrientData', null);
      fixture.detectChanges();

      expect(component.caloriePercentage()).toBe(0);
    });

    it('deberia retornar 0 cuando calorieGoal es 0', () => {
      const datos: NutrientData = { ...nutrientesDatosMock, calorieGoal: 0 };
      componentRef.setInput('nutrientData', datos);
      fixture.detectChanges();

      expect(component.caloriePercentage()).toBe(0);
    });

    it('deberia calcular porcentaje correctamente', () => {
      componentRef.setInput('nutrientData', nutrientesDatosMock);
      fixture.detectChanges();

      // 2100 / 2200 * 100 = 95.45 redondeado a 95
      expect(component.caloriePercentage()).toBe(95);
    });

    it('deberia limitar el porcentaje a 100 como maximo', () => {
      const datos: NutrientData = { ...nutrientesDatosMock, calories: 2500, calorieGoal: 2000 };
      componentRef.setInput('nutrientData', datos);
      fixture.detectChanges();

      expect(component.caloriePercentage()).toBe(100);
    });

    it('deberia manejar porcentajes bajos correctamente', () => {
      const datos: NutrientData = { ...nutrientesDatosMock, calories: 500, calorieGoal: 2000 };
      componentRef.setInput('nutrientData', datos);
      fixture.detectChanges();

      expect(component.caloriePercentage()).toBe(25);
    });

    it('deberia redondear porcentajes correctamente', () => {
      const datos: NutrientData = { ...nutrientesDatosMock, calories: 1666, calorieGoal: 2000 };
      componentRef.setInput('nutrientData', datos);
      fixture.detectChanges();

      // 1666 / 2000 * 100 = 83.3 redondeado a 83
      expect(component.caloriePercentage()).toBe(83);
    });
  });

  // ==========================================
  // TESTS DE CHART DATA
  // ==========================================

  describe('doughnutChartData', () => {
    it('deberia inicializar con labels y datasets vacios', () => {
      fixture.detectChanges();
      const chartData = component.doughnutChartData();

      expect(chartData.labels).toEqual([]);
      expect(chartData.datasets).toEqual([]);
    });

    it('deberia actualizar chart data cuando hay datos de nutrientes', () => {
      componentRef.setInput('nutrientData', nutrientesDatosMock);
      fixture.detectChanges();

      const chartData = component.doughnutChartData();

      expect(chartData.labels).toEqual(['Proteínas', 'Carbohidratos', 'Grasas']);
      expect(chartData.datasets.length).toBe(1);
    });

    it('deberia incluir datos correctos en el dataset', () => {
      componentRef.setInput('nutrientData', nutrientesDatosMock);
      fixture.detectChanges();

      const chartData = component.doughnutChartData();
      const dataset = chartData.datasets[0];

      expect(dataset.data).toEqual([150, 200, 70]);
    });

    it('deberia incluir colores correctos en el dataset', () => {
      componentRef.setInput('nutrientData', nutrientesDatosMock);
      fixture.detectChanges();

      const chartData = component.doughnutChartData();
      const dataset = chartData.datasets[0];

      expect(dataset.backgroundColor).toEqual(['#FDB913', '#2C3E50', '#7F8C8D']);
    });

    it('deberia configurar borderWidth correctamente', () => {
      componentRef.setInput('nutrientData', nutrientesDatosMock);
      fixture.detectChanges();

      const chartData = component.doughnutChartData();
      const dataset = chartData.datasets[0];

      expect(dataset.borderWidth).toBe(2);
    });

    it('deberia configurar borderColor correctamente', () => {
      componentRef.setInput('nutrientData', nutrientesDatosMock);
      fixture.detectChanges();

      const chartData = component.doughnutChartData();
      const dataset = chartData.datasets[0];

      expect(dataset.borderColor).toBe('#FFFFFF');
    });

    it('deberia limpiar chart data cuando nutrientData es null', () => {
      componentRef.setInput('nutrientData', nutrientesDatosMock);
      fixture.detectChanges();

      // Verificar que hay datos
      expect(component.doughnutChartData().datasets.length).toBe(1);

      // Establecer a null
      componentRef.setInput('nutrientData', null);
      fixture.detectChanges();

      const chartData = component.doughnutChartData();
      expect(chartData.labels).toEqual([]);
      expect(chartData.datasets).toEqual([]);
    });
  });

  // ==========================================
  // TESTS DE CHART OPTIONS
  // ==========================================

  describe('doughnutChartOptions', () => {
    it('deberia tener opciones de chart configuradas', () => {
      expect(component.doughnutChartOptions).toBeDefined();
    });

    it('deberia ser responsive', () => {
      expect(component.doughnutChartOptions?.responsive).toBeTrue();
    });

    it('deberia no mantener aspect ratio', () => {
      expect(component.doughnutChartOptions?.maintainAspectRatio).toBeFalse();
    });

    it('deberia ocultar la leyenda', () => {
      expect(component.doughnutChartOptions?.plugins?.legend?.display).toBeFalse();
    });

    it('deberia tener tooltips configurados', () => {
      expect(component.doughnutChartOptions?.plugins?.tooltip).toBeDefined();
    });

    it('deberia tener callback de tooltip para labels', () => {
      const tooltipCallbacks = component.doughnutChartOptions?.plugins?.tooltip?.callbacks;
      expect(tooltipCallbacks?.label).toBeDefined();
    });

    it('deberia formatear correctamente el tooltip', () => {
      const tooltipCallbacks = component.doughnutChartOptions?.plugins?.tooltip?.callbacks;
      if (tooltipCallbacks?.label) {
        const mockContext = {
          label: 'Proteínas',
          parsed: 150
        };
        const resultado = (tooltipCallbacks.label as any).call(null, mockContext);
        expect(resultado).toBe('Proteínas: 150g');
      }
    });

    it('deberia manejar tooltip sin label', () => {
      const tooltipCallbacks = component.doughnutChartOptions?.plugins?.tooltip?.callbacks;
      if (tooltipCallbacks?.label) {
        const mockContext = {
          label: '',
          parsed: 100
        };
        const resultado = (tooltipCallbacks.label as any).call(null, mockContext);
        expect(resultado).toBe(': 100g');
      }
    });

    it('deberia manejar tooltip sin valor parsed', () => {
      const tooltipCallbacks = component.doughnutChartOptions?.plugins?.tooltip?.callbacks;
      if (tooltipCallbacks?.label) {
        const mockContext = {
          label: 'Carbohidratos',
          parsed: 0
        };
        const resultado = (tooltipCallbacks.label as any).call(null, mockContext);
        expect(resultado).toBe('Carbohidratos: 0g');
      }
    });
  });

  // ==========================================
  // TESTS DE INTEGRACION
  // ==========================================

  describe('Integracion', () => {
    it('deberia actualizar todos los computed cuando cambian los datos', () => {
      componentRef.setInput('nutrientData', null);
      fixture.detectChanges();

      expect(component.hasNutrientData()).toBeFalse();
      expect(component.caloriePercentage()).toBe(0);
      expect(component.doughnutChartData().datasets.length).toBe(0);

      componentRef.setInput('nutrientData', nutrientesDatosMock);
      fixture.detectChanges();

      expect(component.hasNutrientData()).toBeTrue();
      expect(component.caloriePercentage()).toBe(95);
      expect(component.doughnutChartData().datasets.length).toBe(1);
    });

    it('deberia manejar transicion de datos vacios a datos completos', () => {
      componentRef.setInput('nutrientData', nutrientesVaciosMock);
      fixture.detectChanges();

      expect(component.hasNutrientData()).toBeFalse();

      componentRef.setInput('nutrientData', nutrientesDatosMock);
      fixture.detectChanges();

      expect(component.hasNutrientData()).toBeTrue();
      expect(component.doughnutChartData().datasets[0].data).toEqual([150, 200, 70]);
    });
  });
});
