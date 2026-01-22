import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MacroChart, MacroData } from './macro-chart';
import { ThemeService } from '../../../../core/services/theme.service';
import { signal, Component, input } from '@angular/core';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

// Registrar componentes de Chart.js necesarios para los tests
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

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

describe('MacroChart', () => {
  let component: MacroChart;
  let fixture: ComponentFixture<MacroChart>;
  let mockThemeService: { currentTheme: ReturnType<typeof signal<'light' | 'dark'>> };

  const mockMacroData: MacroData = {
    current: 75,
    goal: 150,
    unit: 'g'
  };

  beforeEach(async () => {
    mockThemeService = {
      currentTheme: signal<'light' | 'dark'>('light')
    };

    await TestBed.configureTestingModule({
      imports: [MacroChart],
      providers: [
        { provide: ThemeService, useValue: mockThemeService }
      ]
    })
    .overrideComponent(MacroChart, {
      remove: {
        imports: []
      },
      add: {
        imports: [MockBaseChartDirective]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(MacroChart);
    component = fixture.componentInstance;
  });

  it('deberia crear el componente', () => {
    fixture.componentRef.setInput('label', 'Proteina');
    fixture.componentRef.setInput('data', mockMacroData);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Inputs requeridos', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Proteina');
      fixture.componentRef.setInput('data', mockMacroData);
      fixture.detectChanges();
    });

    it('deberia establecer label correctamente', () => {
      expect(component.label()).toBe('Proteina');
    });

    it('deberia establecer data correctamente', () => {
      expect(component.data()).toEqual(mockMacroData);
    });
  });

  describe('Input opcional color', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Proteina');
      fixture.componentRef.setInput('data', mockMacroData);
      fixture.detectChanges();
    });

    it('deberia tener color por defecto de #000000', () => {
      expect(component.color()).toBe('#000000');
    });

    it('deberia establecer color personalizado', () => {
      fixture.componentRef.setInput('color', '#3B82F6');
      fixture.detectChanges();
      expect(component.color()).toBe('#3B82F6');
    });
  });

  describe('Computed: percentage', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Proteina');
      fixture.componentRef.setInput('data', mockMacroData);
      fixture.detectChanges();
    });

    it('deberia calcular el porcentaje correctamente', () => {
      fixture.componentRef.setInput('data', { current: 75, goal: 150, unit: 'g' });
      fixture.detectChanges();
      expect(component.percentage()).toBe(50);
    });

    it('deberia limitar el porcentaje a 100 maximo', () => {
      fixture.componentRef.setInput('data', { current: 200, goal: 150, unit: 'g' });
      fixture.detectChanges();
      expect(component.percentage()).toBe(100);
    });

    it('deberia manejar valores cero', () => {
      fixture.componentRef.setInput('data', { current: 0, goal: 150, unit: 'g' });
      fixture.detectChanges();
      expect(component.percentage()).toBe(0);
    });

    it('deberia calcular porcentajes decimales correctamente', () => {
      fixture.componentRef.setInput('data', { current: 33, goal: 100, unit: 'g' });
      fixture.detectChanges();
      expect(component.percentage()).toBe(33);
    });
  });

  describe('Computed: displayValue', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Proteina');
      fixture.componentRef.setInput('data', mockMacroData);
      fixture.detectChanges();
    });

    it('deberia redondear el porcentaje para mostrar', () => {
      fixture.componentRef.setInput('data', { current: 33.333, goal: 100, unit: 'g' });
      fixture.detectChanges();
      expect(component.displayValue()).toBe(33);
    });

    it('deberia devolver 100 cuando se excede el objetivo', () => {
      fixture.componentRef.setInput('data', { current: 200, goal: 100, unit: 'g' });
      fixture.detectChanges();
      expect(component.displayValue()).toBe(100);
    });

    it('deberia devolver 0 cuando current es 0', () => {
      fixture.componentRef.setInput('data', { current: 0, goal: 100, unit: 'g' });
      fixture.detectChanges();
      expect(component.displayValue()).toBe(0);
    });
  });

  describe('Computed: chartData', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Proteina');
      fixture.componentRef.setInput('data', mockMacroData);
      fixture.componentRef.setInput('color', '#3B82F6');
      fixture.detectChanges();
    });

    it('deberia generar datos del grafico con valores correctos', () => {
      const chartData = component.chartData();
      expect(chartData.datasets[0].data).toEqual([75, 75]);
    });

    it('deberia usar el color proporcionado', () => {
      const chartData = component.chartData();
      const backgroundColor = chartData.datasets[0].backgroundColor as string[];
      expect(backgroundColor[0]).toBe('#3B82F6');
    });

    it('deberia usar color de fondo claro para tema light', () => {
      mockThemeService.currentTheme.set('light');
      fixture.detectChanges();
      const chartData = component.chartData();
      const backgroundColor = chartData.datasets[0].backgroundColor as string[];
      expect(backgroundColor[1]).toBe('rgba(0,0,0,0.05)');
    });

    it('deberia usar color de fondo oscuro para tema dark', () => {
      mockThemeService.currentTheme.set('dark');
      fixture.detectChanges();
      const chartData = component.chartData();
      const backgroundColor = chartData.datasets[0].backgroundColor as string[];
      expect(backgroundColor[1]).toBe('rgba(255,255,255,0.1)');
    });

    it('deberia calcular remaining como 0 cuando se excede el objetivo', () => {
      fixture.componentRef.setInput('data', { current: 200, goal: 150, unit: 'g' });
      fixture.detectChanges();
      const chartData = component.chartData();
      expect(chartData.datasets[0].data).toEqual([200, 0]);
    });

    it('deberia tener borderWidth de 0', () => {
      const chartData = component.chartData();
      expect(chartData.datasets[0].borderWidth).toBe(0);
    });

    it('deberia tener borderRadius de 20', () => {
      const chartData = component.chartData();
      expect(chartData.datasets[0].borderRadius).toBe(20);
    });

    it('deberia tener spacing de 2', () => {
      const chartData = component.chartData();
      expect(chartData.datasets[0].spacing).toBe(2);
    });
  });

  describe('chartOptions estaticas', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Proteina');
      fixture.componentRef.setInput('data', mockMacroData);
      fixture.detectChanges();
    });

    it('deberia ser responsivo', () => {
      expect(component.chartOptions?.responsive).toBeTrue();
    });

    it('deberia mantener aspect ratio', () => {
      expect(component.chartOptions?.maintainAspectRatio).toBeTrue();
    });

    it('deberia tener cutout del 75%', () => {
      expect(component.chartOptions?.cutout).toBe('75%');
    });

    it('deberia ocultar la leyenda', () => {
      expect(component.chartOptions?.plugins?.legend?.display).toBeFalse();
    });

    it('deberia deshabilitar tooltips', () => {
      expect(component.chartOptions?.plugins?.tooltip?.enabled).toBeFalse();
    });

    it('deberia tener animacion configurada', () => {
      const animation = component.chartOptions?.animation as { animateRotate?: boolean; animateScale?: boolean; duration?: number } | undefined;
      expect(animation?.animateRotate).toBeTrue();
      expect(animation?.animateScale).toBeTrue();
      expect(animation?.duration).toBe(1000);
    });
  });

  describe('Computed: ariaLabel', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Proteina');
      fixture.componentRef.setInput('data', mockMacroData);
      fixture.detectChanges();
    });

    it('deberia generar ariaLabel descriptivo', () => {
      const expectedLabel = 'Proteina: 75 de 150 g, 50% completado';
      expect(component.ariaLabel()).toBe(expectedLabel);
    });

    it('deberia actualizar ariaLabel cuando cambian los datos', () => {
      fixture.componentRef.setInput('data', { current: 100, goal: 200, unit: 'kcal' });
      fixture.detectChanges();
      const expectedLabel = 'Proteina: 100 de 200 kcal, 50% completado';
      expect(component.ariaLabel()).toBe(expectedLabel);
    });

    it('deberia actualizar ariaLabel cuando cambia el label', () => {
      fixture.componentRef.setInput('label', 'Carbohidratos');
      fixture.detectChanges();
      const expectedLabel = 'Carbohidratos: 75 de 150 g, 50% completado';
      expect(component.ariaLabel()).toBe(expectedLabel);
    });
  });

  describe('Computed: barGradient', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Proteina');
      fixture.componentRef.setInput('data', mockMacroData);
      fixture.detectChanges();
    });

    it('deberia generar gradiente lineal con el color base', () => {
      fixture.componentRef.setInput('color', '#3B82F6');
      fixture.detectChanges();
      const gradient = component.barGradient();
      expect(gradient).toContain('linear-gradient');
      expect(gradient).toContain('#3B82F6');
    });

    it('deberia incluir color aclarado en el gradiente', () => {
      fixture.componentRef.setInput('color', '#000000');
      fixture.detectChanges();
      const gradient = component.barGradient();
      expect(gradient).toContain('linear-gradient(90deg,');
    });
  });

  describe('Reactividad al tema', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Proteina');
      fixture.componentRef.setInput('data', mockMacroData);
      fixture.detectChanges();
    });

    it('deberia actualizar chartData cuando cambia el tema', () => {
      mockThemeService.currentTheme.set('light');
      fixture.detectChanges();
      const lightChartData = component.chartData();
      const lightBgColors = lightChartData.datasets[0].backgroundColor as string[];
      const lightBgColor = lightBgColors[1];

      mockThemeService.currentTheme.set('dark');
      fixture.detectChanges();
      const darkChartData = component.chartData();
      const darkBgColors = darkChartData.datasets[0].backgroundColor as string[];
      const darkBgColor = darkBgColors[1];

      expect(lightBgColor).not.toBe(darkBgColor);
    });
  });

  describe('Diferentes escenarios de datos', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Test');
      fixture.componentRef.setInput('data', mockMacroData);
      fixture.detectChanges();
    });

    it('deberia manejar objetivo muy grande', () => {
      fixture.componentRef.setInput('data', { current: 50, goal: 10000, unit: 'mg' });
      fixture.detectChanges();
      expect(component.percentage()).toBeCloseTo(0.5, 1);
      expect(component.displayValue()).toBe(1);
    });

    it('deberia manejar valores decimales en current', () => {
      fixture.componentRef.setInput('data', { current: 33.7, goal: 100, unit: 'g' });
      fixture.detectChanges();
      expect(component.percentage()).toBeCloseTo(33.7, 1);
      expect(component.displayValue()).toBe(34);
    });

    it('deberia manejar objetivo igual a current', () => {
      fixture.componentRef.setInput('data', { current: 100, goal: 100, unit: 'g' });
      fixture.detectChanges();
      expect(component.percentage()).toBe(100);
      expect(component.displayValue()).toBe(100);
    });

    it('deberia manejar diferentes unidades', () => {
      fixture.componentRef.setInput('data', { current: 500, goal: 1000, unit: 'ml' });
      fixture.detectChanges();
      expect(component.ariaLabel()).toContain('ml');
    });
  });

  describe('Colores personalizados', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Macro');
      fixture.componentRef.setInput('data', mockMacroData);
      fixture.detectChanges();
    });

    it('deberia aceptar colores hex cortos', () => {
      fixture.componentRef.setInput('color', '#F00');
      fixture.detectChanges();
      const chartData = component.chartData();
      const backgroundColor = chartData.datasets[0].backgroundColor as string[];
      expect(backgroundColor[0]).toBe('#F00');
    });

    it('deberia aceptar colores hex largos', () => {
      fixture.componentRef.setInput('color', '#FF5733');
      fixture.detectChanges();
      const chartData = component.chartData();
      const backgroundColor = chartData.datasets[0].backgroundColor as string[];
      expect(backgroundColor[0]).toBe('#FF5733');
    });
  });

  describe('Integracion completa', () => {
    it('deberia funcionar con todos los inputs configurados', () => {
      fixture.componentRef.setInput('label', 'Proteina');
      fixture.componentRef.setInput('data', { current: 120, goal: 150, unit: 'g' });
      fixture.componentRef.setInput('color', '#10B981');
      fixture.detectChanges();

      expect(component.label()).toBe('Proteina');
      expect(component.percentage()).toBe(80);
      expect(component.displayValue()).toBe(80);
      expect(component.ariaLabel()).toBe('Proteina: 120 de 150 g, 80% completado');

      const chartData = component.chartData();
      const backgroundColor = chartData.datasets[0].backgroundColor as string[];
      expect(chartData.datasets[0].data).toEqual([120, 30]);
      expect(backgroundColor[0]).toBe('#10B981');
    });
  });
});
