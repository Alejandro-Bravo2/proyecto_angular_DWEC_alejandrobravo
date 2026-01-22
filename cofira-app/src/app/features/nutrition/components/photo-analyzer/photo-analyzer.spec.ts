import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PhotoAnalyzer } from './photo-analyzer';
import { NutritionAIService, FoodAnalysis, AnalysisResponse } from '../../services/nutrition-ai.service';
import { ToastService } from '../../../../core/services/toast.service';
import { of, throwError } from 'rxjs';

describe('PhotoAnalyzer', () => {
  let component: PhotoAnalyzer;
  let fixture: ComponentFixture<PhotoAnalyzer>;
  let mockNutritionAIService: jasmine.SpyObj<NutritionAIService>;
  let mockToastService: jasmine.SpyObj<ToastService>;

  const mockFoodAnalysis: FoodAnalysis = {
    name: 'Ensalada Cesar',
    description: 'Ensalada fresca con pollo',
    calories: 450,
    protein: 35,
    carbs: 18,
    fat: 28,
    fiber: 4,
    sugar: 3,
    sodium: 500,
    confidence: 92,
    ingredients: ['Lechuga', 'Pollo', 'Parmesano'],
    suggestions: ['Usa aderezo bajo en grasa']
  };

  const mockAnalysisResponse: AnalysisResponse = {
    analysis: mockFoodAnalysis,
    imageUrl: 'http://example.com/image.jpg'
  };

  beforeEach(async () => {
    mockNutritionAIService = jasmine.createSpyObj('NutritionAIService', ['analyzeFood']);
    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);

    await TestBed.configureTestingModule({
      imports: [PhotoAnalyzer],
      providers: [
        { provide: NutritionAIService, useValue: mockNutritionAIService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoAnalyzer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deberia crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Estado inicial', () => {
    it('deberia inicializar isDragging como false', () => {
      expect(component.isDragging()).toBeFalse();
    });

    it('deberia inicializar previewUrl como null', () => {
      expect(component.previewUrl()).toBeNull();
    });

    it('deberia inicializar isAnalyzing como false', () => {
      expect(component.isAnalyzing()).toBeFalse();
    });

    it('deberia inicializar analysis como null', () => {
      expect(component.analysis()).toBeNull();
    });
  });

  describe('Eventos de arrastrar y soltar', () => {
    it('deberia establecer isDragging en true cuando se ejecuta onDragOver', () => {
      const mockDragEvent = new DragEvent('dragover', { bubbles: true, cancelable: true });
      spyOn(mockDragEvent, 'preventDefault');
      spyOn(mockDragEvent, 'stopPropagation');

      component.onDragOver(mockDragEvent);

      expect(mockDragEvent.preventDefault).toHaveBeenCalled();
      expect(mockDragEvent.stopPropagation).toHaveBeenCalled();
      expect(component.isDragging()).toBeTrue();
    });

    it('deberia establecer isDragging en false cuando se ejecuta onDragLeave', () => {
      component.isDragging.set(true);
      const mockDragEvent = new DragEvent('dragleave', { bubbles: true, cancelable: true });
      spyOn(mockDragEvent, 'preventDefault');
      spyOn(mockDragEvent, 'stopPropagation');

      component.onDragLeave(mockDragEvent);

      expect(mockDragEvent.preventDefault).toHaveBeenCalled();
      expect(mockDragEvent.stopPropagation).toHaveBeenCalled();
      expect(component.isDragging()).toBeFalse();
    });

    it('deberia procesar el archivo cuando se ejecuta onDrop con archivos validos', fakeAsync(() => {
      mockNutritionAIService.analyzeFood.and.returnValue(of(mockAnalysisResponse));

      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(mockFile);

      const mockDragEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer
      });
      spyOn(mockDragEvent, 'preventDefault');
      spyOn(mockDragEvent, 'stopPropagation');

      component.onDrop(mockDragEvent);

      expect(mockDragEvent.preventDefault).toHaveBeenCalled();
      expect(mockDragEvent.stopPropagation).toHaveBeenCalled();
      expect(component.isDragging()).toBeFalse();
    }));

    it('deberia no procesar si no hay archivos en el evento drop', () => {
      const mockDragEvent = new DragEvent('drop', { bubbles: true, cancelable: true });
      spyOn(mockDragEvent, 'preventDefault');
      spyOn(mockDragEvent, 'stopPropagation');

      component.onDrop(mockDragEvent);

      expect(component.isDragging()).toBeFalse();
      expect(mockNutritionAIService.analyzeFood).not.toHaveBeenCalled();
    });
  });

  describe('Seleccion de archivo', () => {
    it('deberia procesar el archivo cuando se selecciona a traves del input', fakeAsync(() => {
      mockNutritionAIService.analyzeFood.and.returnValue(of(mockAnalysisResponse));

      const mockFile = new File(['contenido de prueba'], 'test.png', { type: 'image/png' });
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      } as unknown as Event;

      component.onFileSelected(mockEvent);
      tick();

      // El archivo se procesa de forma asincrona
    }));

    it('deberia no procesar si no hay archivos seleccionados', () => {
      const mockEvent = {
        target: {
          files: []
        }
      } as unknown as Event;

      component.onFileSelected(mockEvent);

      expect(mockNutritionAIService.analyzeFood).not.toHaveBeenCalled();
    });

    it('deberia mostrar error si el archivo no es una imagen', () => {
      const mockFile = new File(['contenido'], 'documento.pdf', { type: 'application/pdf' });
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      } as unknown as Event;

      component.onFileSelected(mockEvent);

      expect(mockToastService.error).toHaveBeenCalledWith('Por favor, selecciona una imagen válida');
    });
  });

  describe('Analisis de imagen', () => {
    it('deberia emitir foodAnalyzed cuando el analisis es exitoso', fakeAsync(() => {
      mockNutritionAIService.analyzeFood.and.returnValue(of(mockAnalysisResponse));

      const emittedAnalysis: FoodAnalysis[] = [];
      component.foodAnalyzed.subscribe((analysis) => {
        emittedAnalysis.push(analysis);
      });

      const mockFile = new File(['imagen de prueba'], 'comida.jpg', { type: 'image/jpeg' });

      // Simular FileReader
      const originalFileReader = window.FileReader;
      const mockFileReader = {
        result: 'data:image/jpeg;base64,test',
        onload: null as ((e: ProgressEvent<FileReader>) => void) | null,
        readAsDataURL: function(_blob: Blob) {
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: { result: this.result } } as unknown as ProgressEvent<FileReader>);
            }
          }, 0);
        }
      };

      spyOn(window, 'FileReader').and.returnValue(mockFileReader as unknown as FileReader);

      const mockEvent = {
        target: { files: [mockFile] }
      } as unknown as Event;

      component.onFileSelected(mockEvent);
      tick();

      expect(component.analysis()).toEqual(mockFoodAnalysis);
      expect(component.isAnalyzing()).toBeFalse();
      expect(emittedAnalysis).toContain(mockFoodAnalysis);

      window.FileReader = originalFileReader;
    }));

    it('deberia manejar errores durante el analisis', fakeAsync(() => {
      mockNutritionAIService.analyzeFood.and.returnValue(throwError(() => new Error('Error de servidor')));

      const mockFile = new File(['imagen'], 'error.jpg', { type: 'image/jpeg' });

      const mockFileReader = {
        result: 'data:image/jpeg;base64,test',
        onload: null as ((e: ProgressEvent<FileReader>) => void) | null,
        readAsDataURL: function(_blob: Blob) {
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: { result: this.result } } as unknown as ProgressEvent<FileReader>);
            }
          }, 0);
        }
      };

      spyOn(window, 'FileReader').and.returnValue(mockFileReader as unknown as FileReader);
      spyOn(console, 'error');

      const mockEvent = {
        target: { files: [mockFile] }
      } as unknown as Event;

      component.onFileSelected(mockEvent);
      tick();

      expect(mockToastService.error).toHaveBeenCalledWith('Error al analizar la imagen');
      expect(component.isAnalyzing()).toBeFalse();
    }));
  });

  describe('Confirmacion de analisis', () => {
    it('deberia emitir foodConfirmed y resetear cuando se confirma el analisis', () => {
      component.analysis.set(mockFoodAnalysis);
      component.previewUrl.set('http://example.com/preview.jpg');

      const emittedConfirmations: FoodAnalysis[] = [];
      component.foodConfirmed.subscribe((analysis) => {
        emittedConfirmations.push(analysis);
      });

      component.confirmAnalysis();

      expect(emittedConfirmations).toContain(mockFoodAnalysis);
      expect(mockToastService.success).toHaveBeenCalledWith('Comida añadida a tu diario');
      expect(component.previewUrl()).toBeNull();
      expect(component.analysis()).toBeNull();
    });

    it('deberia no emitir si no hay analisis actual', () => {
      component.analysis.set(null);

      const emittedConfirmations: FoodAnalysis[] = [];
      component.foodConfirmed.subscribe((analysis) => {
        emittedConfirmations.push(analysis);
      });

      component.confirmAnalysis();

      expect(emittedConfirmations.length).toBe(0);
      expect(mockToastService.success).not.toHaveBeenCalled();
    });
  });

  describe('Reset', () => {
    it('deberia limpiar previewUrl y analysis cuando se ejecuta reset', () => {
      component.previewUrl.set('http://example.com/imagen.jpg');
      component.analysis.set(mockFoodAnalysis);

      component.reset();

      expect(component.previewUrl()).toBeNull();
      expect(component.analysis()).toBeNull();
    });
  });
});
