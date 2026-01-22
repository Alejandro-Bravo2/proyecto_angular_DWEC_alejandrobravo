import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeeklyProgress, WeeklyData } from './weekly-progress';
import { ThemeService } from '../../../../core/services/theme.service';
import { signal, Component, input } from '@angular/core';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

// Registrar componentes de Chart.js necesarios para los tests
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Mock del BaseChartDirective
@Component({
  selector: 'canvas[baseChart]',
  standalone: true,
  template: ''
})
class MockBaseChartDirective {
  type = input<string>();
  data = input<unknown>();
  options = input<unknown>();
}

describe('WeeklyProgress', () => {
  let component: WeeklyProgress;
  let fixture: ComponentFixture<WeeklyProgress>;
  let mockThemeService: { currentTheme: ReturnType<typeof signal<'light' | 'dark'>> };

  const mockWeeklyData: WeeklyData[] = [
    { day: 'Lun', calories: 1800, protein: 120, carbs: 200, fat: 60 },
    { day: 'Mar', calories: 2100, protein: 140, carbs: 220, fat: 70 },
    { day: 'Mie', calories: 1950, protein: 130, carbs: 210, fat: 65 },
    { day: 'Jue', calories: 2200, protein: 150, carbs: 240, fat: 75 },
    { day: 'Vie', calories: 2000, protein: 135, carbs: 215, fat: 68 },
    { day: 'Sab', calories: 2300, protein: 145, carbs: 250, fat: 80 },
    { day: 'Dom', calories: 1900, protein: 125, carbs: 205, fat: 62 }
  ];

  beforeEach(async () => {
    mockThemeService = {
      currentTheme: signal<'light' | 'dark'>('light')
    };

    await TestBed.configureTestingModule({
      imports: [WeeklyProgress],
      providers: [
        { provide: ThemeService, useValue: mockThemeService }
      ]
    })
    .overrideComponent(WeeklyProgress, {
      remove: {
        imports: []
      },
      add: {
        imports: [MockBaseChartDirective]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeeklyProgress);
    component = fixture.componentInstance;
  });

  it('deberia crear el componente', () => {
    fixture.componentRef.setInput('weeklyData', mockWeeklyData);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('weeklyData', mockWeeklyData);
      fixture.detectChanges();
    });

    it('deberia establecer weeklyData correctamente', () => {
      expect(component.weeklyData()).toEqual(mockWeeklyData);
    });

    it('deberia tener un valor por defecto de calorieGoal de 2000', () => {
      expect(component.calorieGoal()).toBe(2000);
    });

    it('deberia poder establecer calorieGoal personalizado', () => {
      fixture.componentRef.setInput('calorieGoal', 2500);
      fixture.detectChanges();
      expect(component.calorieGoal()).toBe(2500);
    });

    it('deberia tener un valor por defecto de activeTab de calories', () => {
      expect(component.activeTab()).toBe('calories');
    });

    it('deberia poder establecer activeTab personalizado', () => {
      fixture.componentRef.setInput('activeTab', 'protein');
      fixture.detectChanges();
      expect(component.activeTab()).toBe('protein');
    });
  });

  describe('Tabs', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('weeklyData', mockWeeklyData);
      fixture.detectChanges();
    });

    it('deberia tener 4 tabs definidos', () => {
      expect(component.tabs.length).toBe(4);
    });

    it('deberia tener las tabs correctas', () => {
      const tabKeys = component.tabs.map(tab => tab.key);
      expect(tabKeys).toEqual(['calories', 'protein', 'carbs', 'fat']);
    });

    it('deberia tener las etiquetas correctas para las tabs', () => {
      const tabLabels = component.tabs.map(tab => tab.label);
      expect(tabLabels).toEqual(['Calorías', 'Proteína', 'Carbos', 'Grasas']);
    });
  });

  describe('Computed: currentUnit', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('weeklyData', mockWeeklyData);
      fixture.detectChanges();
    });

    it('deberia devolver kcal cuando activeTab es calories', () => {
      fixture.componentRef.setInput('activeTab', 'calories');
      fixture.detectChanges();
      expect(component.currentUnit()).toBe('kcal');
    });

    it('deberia devolver g cuando activeTab es protein', () => {
      fixture.componentRef.setInput('activeTab', 'protein');
      fixture.detectChanges();
      expect(component.currentUnit()).toBe('g');
    });

    it('deberia devolver g cuando activeTab es carbs', () => {
      fixture.componentRef.setInput('activeTab', 'carbs');
      fixture.detectChanges();
      expect(component.currentUnit()).toBe('g');
    });

    it('deberia devolver g cuando activeTab es fat', () => {
      fixture.componentRef.setInput('activeTab', 'fat');
      fixture.detectChanges();
      expect(component.currentUnit()).toBe('g');
    });
  });

  describe('Computed: chartData', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('weeklyData', mockWeeklyData);
      fixture.detectChanges();
    });

    it('deberia generar datos del grafico con las etiquetas correctas', () => {
      const chartData = component.chartData();
      expect(chartData.labels).toEqual(['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']);
    });

    it('deberia generar datos del grafico para calorias por defecto', () => {
      const chartData = component.chartData();
      const expectedCalories = mockWeeklyData.map(d => d.calories);
      expect(chartData.datasets[0].data).toEqual(expectedCalories);
    });

    it('deberia generar datos del grafico para proteinas cuando se selecciona', () => {
      fixture.componentRef.setInput('activeTab', 'protein');
      fixture.detectChanges();
      const chartData = component.chartData();
      const expectedProtein = mockWeeklyData.map(d => d.protein);
      expect(chartData.datasets[0].data).toEqual(expectedProtein);
    });

    it('deberia aplicar colores para tema claro', () => {
      mockThemeService.currentTheme.set('light');
      fixture.detectChanges();
      const chartData = component.chartData();
      expect(chartData.datasets[0].backgroundColor).toBe('rgba(0,0,0,0.1)');
    });

    it('deberia aplicar colores para tema oscuro', () => {
      mockThemeService.currentTheme.set('dark');
      fixture.detectChanges();
      const chartData = component.chartData();
      expect(chartData.datasets[0].backgroundColor).toBe('rgba(255,255,255,0.15)');
    });
  });

  describe('Computed: chartOptions', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('weeklyData', mockWeeklyData);
      fixture.detectChanges();
    });

    it('deberia configurar opciones responsivas', () => {
      const options = component.chartOptions();
      expect(options?.responsive).toBeTrue();
      expect(options?.maintainAspectRatio).toBeFalse();
    });

    it('deberia ocultar la leyenda', () => {
      const options = component.chartOptions();
      expect(options?.plugins?.legend?.display).toBeFalse();
    });

    it('deberia configurar colores de texto para tema claro', () => {
      mockThemeService.currentTheme.set('light');
      fixture.detectChanges();
      const options = component.chartOptions();
      const scales = options?.scales as Record<string, { ticks?: { color?: string } }>;
      expect(scales?.['x']?.ticks?.color).toBe('rgba(0,0,0,0.6)');
    });

    it('deberia configurar colores de texto para tema oscuro', () => {
      mockThemeService.currentTheme.set('dark');
      fixture.detectChanges();
      const options = component.chartOptions();
      const scales = options?.scales as Record<string, { ticks?: { color?: string } }>;
      expect(scales?.['x']?.ticks?.color).toBe('rgba(255,255,255,0.7)');
    });
  });

  describe('Computed: averageValue', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('weeklyData', mockWeeklyData);
      fixture.detectChanges();
    });

    it('deberia calcular el promedio de calorias correctamente', () => {
      const totalCalories = mockWeeklyData.reduce((sum, d) => sum + d.calories, 0);
      const expectedAverage = Math.round(totalCalories / mockWeeklyData.length);
      expect(component.averageValue()).toBe(expectedAverage);
    });

    it('deberia calcular el promedio de proteinas cuando se selecciona', () => {
      fixture.componentRef.setInput('activeTab', 'protein');
      fixture.detectChanges();
      const totalProtein = mockWeeklyData.reduce((sum, d) => sum + d.protein, 0);
      const expectedAverage = Math.round(totalProtein / mockWeeklyData.length);
      expect(component.averageValue()).toBe(expectedAverage);
    });
  });

  describe('Computed: trend', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('weeklyData', mockWeeklyData);
      fixture.detectChanges();
    });

    it('deberia calcular la tendencia comparando mitades del periodo', () => {
      const trend = component.trend();
      expect(typeof trend).toBe('number');
    });

    it('deberia devolver 0 si hay menos de 2 dias de datos', () => {
      fixture.componentRef.setInput('weeklyData', [{ day: 'Lun', calories: 2000, protein: 100, carbs: 200, fat: 50 }]);
      fixture.detectChanges();
      expect(component.trend()).toBe(0);
    });

    it('deberia devolver 0 si la primera mitad es 0', () => {
      const datosConCero: WeeklyData[] = [
        { day: 'Lun', calories: 0, protein: 0, carbs: 0, fat: 0 },
        { day: 'Mar', calories: 0, protein: 0, carbs: 0, fat: 0 },
        { day: 'Mie', calories: 0, protein: 0, carbs: 0, fat: 0 },
        { day: 'Jue', calories: 2000, protein: 100, carbs: 200, fat: 50 }
      ];
      fixture.componentRef.setInput('weeklyData', datosConCero);
      fixture.detectChanges();
      expect(component.trend()).toBe(0);
    });
  });

  describe('setActiveTab', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('weeklyData', mockWeeklyData);
      fixture.detectChanges();
    });

    it('deberia registrar el cambio de tab en la consola', () => {
      spyOn(console, 'log');
      component.setActiveTab('protein');
      expect(console.log).toHaveBeenCalledWith('Tab changed to:', 'protein');
    });

    it('deberia aceptar todas las tabs validas', () => {
      spyOn(console, 'log');

      component.setActiveTab('calories');
      expect(console.log).toHaveBeenCalledWith('Tab changed to:', 'calories');

      component.setActiveTab('protein');
      expect(console.log).toHaveBeenCalledWith('Tab changed to:', 'protein');

      component.setActiveTab('carbs');
      expect(console.log).toHaveBeenCalledWith('Tab changed to:', 'carbs');

      component.setActiveTab('fat');
      expect(console.log).toHaveBeenCalledWith('Tab changed to:', 'fat');
    });
  });

  describe('Math helper', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('weeklyData', mockWeeklyData);
      fixture.detectChanges();
    });

    it('deberia exponer el objeto Math', () => {
      expect(component.Math).toBe(Math);
    });
  });

  describe('Colores por tipo de tab', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('weeklyData', mockWeeklyData);
      fixture.detectChanges();
    });

    it('deberia aplicar colores de proteina para tema claro', () => {
      fixture.componentRef.setInput('activeTab', 'protein');
      mockThemeService.currentTheme.set('light');
      fixture.detectChanges();
      const chartData = component.chartData();
      expect(chartData.datasets[0].backgroundColor).toBe('rgba(37,99,235,0.2)');
    });

    it('deberia aplicar colores de carbohidratos para tema claro', () => {
      fixture.componentRef.setInput('activeTab', 'carbs');
      mockThemeService.currentTheme.set('light');
      fixture.detectChanges();
      const chartData = component.chartData();
      expect(chartData.datasets[0].backgroundColor).toBe('rgba(245,158,11,0.2)');
    });

    it('deberia aplicar colores de grasas para tema claro', () => {
      fixture.componentRef.setInput('activeTab', 'fat');
      mockThemeService.currentTheme.set('light');
      fixture.detectChanges();
      const chartData = component.chartData();
      expect(chartData.datasets[0].backgroundColor).toBe('rgba(16,185,129,0.2)');
    });

    it('deberia aplicar colores de proteina para tema oscuro', () => {
      fixture.componentRef.setInput('activeTab', 'protein');
      mockThemeService.currentTheme.set('dark');
      fixture.detectChanges();
      const chartData = component.chartData();
      expect(chartData.datasets[0].backgroundColor).toBe('rgba(96,165,250,0.25)');
    });
  });
});
