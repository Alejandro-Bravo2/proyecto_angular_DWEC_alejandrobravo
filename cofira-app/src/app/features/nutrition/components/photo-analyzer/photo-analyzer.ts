import { Component, signal, output, inject } from '@angular/core';
import { NutritionAIService, FoodAnalysis } from '../../services/nutrition-ai.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-photo-analyzer',
  standalone: true,
  imports: [],
  template: `
    <article class="photo-analyzer">
      <div
        class="photo-analyzer__dropzone"
        [class.photo-analyzer__dropzone--active]="isDragging()"
        [class.photo-analyzer__dropzone--has-image]="previewUrl()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
        role="button"
        tabindex="0"
        (keydown.enter)="fileInput.click()"
        (keydown.space)="fileInput.click()"
        [attr.aria-label]="previewUrl() ? 'Cambiar imagen' : 'Subir imagen de comida'"
      >
        @if (previewUrl()) {
          <img [src]="previewUrl()" alt="Vista previa de comida" class="photo-analyzer__preview" />
          <div class="photo-analyzer__overlay">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" x2="12" y1="3" y2="15"/>
            </svg>
            <span>Cambiar imagen</span>
          </div>
        } @else {
          <div class="photo-analyzer__placeholder">
            <div class="photo-analyzer__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" x2="12" y1="3" y2="15"/>
              </svg>
            </div>
            <p class="photo-analyzer__text">
              <strong>Sube una foto de tu comida</strong>
              <span>Arrastra o haz clic para seleccionar</span>
            </p>
          </div>
        }
        <input
          #fileInput
          type="file"
          accept="image/*"
          class="photo-analyzer__input"
          (change)="onFileSelected($event)"
          aria-hidden="true"
        />
      </div>

      @if (isAnalyzing()) {
        <div class="photo-analyzer__loading" role="status">
          <div class="photo-analyzer__spinner"></div>
          <p>Analizando tu comida con IA...</p>
        </div>
      }

      @if (analysis()) {
        <div class="photo-analyzer__results">
          <header class="photo-analyzer__results-header">
            <h3>{{ analysis()!.name }}</h3>
            <span class="photo-analyzer__confidence">{{ analysis()!.confidence }}% seguro</span>
          </header>

          <div class="photo-analyzer__macros">
            <div class="photo-analyzer__macro">
              <span class="photo-analyzer__macro-value">{{ analysis()!.calories }}</span>
              <span class="photo-analyzer__macro-label">kcal</span>
            </div>
            <div class="photo-analyzer__macro">
              <span class="photo-analyzer__macro-value">{{ analysis()!.protein }}g</span>
              <span class="photo-analyzer__macro-label">Proteína</span>
            </div>
            <div class="photo-analyzer__macro">
              <span class="photo-analyzer__macro-value">{{ analysis()!.carbs }}g</span>
              <span class="photo-analyzer__macro-label">Carbos</span>
            </div>
            <div class="photo-analyzer__macro">
              <span class="photo-analyzer__macro-value">{{ analysis()!.fat }}g</span>
              <span class="photo-analyzer__macro-label">Grasa</span>
            </div>
          </div>

          @if (analysis()!.ingredients?.length) {
            <div class="photo-analyzer__ingredients">
              <h4>Ingredientes detectados</h4>
              <ul>
                @for (ingredient of analysis()!.ingredients; track ingredient) {
                  <li>{{ ingredient }}</li>
                }
              </ul>
            </div>
          }

          <div class="photo-analyzer__actions">
            <button type="button" class="photo-analyzer__btn photo-analyzer__btn--primary" (click)="confirmAnalysis()">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Añadir a mi diario
            </button>
            <button type="button" class="photo-analyzer__btn photo-analyzer__btn--secondary" (click)="reset()">
              Analizar otra
            </button>
          </div>
        </div>
      }
    </article>
  `,
  styleUrl: './photo-analyzer.scss',
})
export class PhotoAnalyzer {
  private readonly aiService = inject(NutritionAIService);
  private readonly toastService = inject(ToastService);

  readonly isDragging = signal(false);
  readonly previewUrl = signal<string | null>(null);
  readonly isAnalyzing = signal(false);
  readonly analysis = signal<FoodAnalysis | null>(null);

  readonly foodAnalyzed = output<FoodAnalysis>();
  readonly foodConfirmed = output<FoodAnalysis>();

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.processFile(input.files[0]);
    }
  }

  private processFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.toastService.error('Por favor, selecciona una imagen válida');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
      this.analyzeImage(file);
    };
    reader.readAsDataURL(file);
  }

  private analyzeImage(file: File): void {
    this.isAnalyzing.set(true);
    this.analysis.set(null);

    this.aiService.analyzeFood(file).subscribe({
      next: (result) => {
        this.analysis.set(result.analysis);
        this.foodAnalyzed.emit(result.analysis);
        this.isAnalyzing.set(false);
      },
      error: (err) => {
        console.error('Error analyzing food:', err);
        this.toastService.error('Error al analizar la imagen');
        this.isAnalyzing.set(false);
      },
    });
  }

  confirmAnalysis(): void {
    const currentAnalysis = this.analysis();
    if (currentAnalysis) {
      this.foodConfirmed.emit(currentAnalysis);
      this.toastService.success('Comida añadida a tu diario');
      this.reset();
    }
  }

  reset(): void {
    this.previewUrl.set(null);
    this.analysis.set(null);
  }
}
