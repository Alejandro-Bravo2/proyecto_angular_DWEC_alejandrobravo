import { Injectable, inject, signal, computed } from '@angular/core';
import { TrainingService, Exercise, WorkoutProgress } from '../services/training.service';
import { ToastService } from '../../../core/services/toast.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Store de dominio para gestionar el estado de entrenamientos
 *
 * Implementa el patrón de gestión de estado con Signals de Angular,
 * manteniendo el estado en memoria y notificando cambios reactivamente.
 *
 * @example
 * ```typescript
 * // En un componente
 * store = inject(TrainingStore);
 *
 * // Leer estado
 * exercises = this.store.exercises;
 * loading = this.store.loading;
 *
 * // Usar computed
 * total = this.store.totalExercises();
 *
 * // Modificar estado
 * this.store.add(newExercise);
 * this.store.toggleComplete('exercise-id');
 * ```
 */
@Injectable({ providedIn: 'root' })
export class TrainingStore {
  private readonly trainingService = inject(TrainingService);
  private readonly toastService = inject(ToastService);

  // ==========================================
  // ESTADO PRIVADO (solo modificable internamente)
  // ==========================================

  private readonly _exercises = signal<Exercise[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _searchTerm = signal('');
  private readonly _currentPage = signal(1);

  // ==========================================
  // ESTADO PUBLICO (readonly para componentes)
  // ==========================================

  /** Lista de ejercicios cargados */
  readonly exercises = this._exercises.asReadonly();

  /** Estado de carga */
  readonly loading = this._loading.asReadonly();

  /** Mensaje de error si existe */
  readonly error = this._error.asReadonly();

  /** Termino de busqueda actual */
  readonly searchTerm = this._searchTerm.asReadonly();

  /** Pagina actual */
  readonly currentPage = this._currentPage.asReadonly();

  /** Elementos por pagina */
  readonly pageSize = 10;

  // ==========================================
  // COMPUTED (valores derivados)
  // ==========================================

  /** Total de ejercicios */
  readonly totalExercises = computed(() => this._exercises().length);

  /** Ejercicios completados */
  readonly completedExercises = computed(() =>
    this._exercises().filter(e => e.completed).length
  );

  /** Porcentaje de completado */
  readonly completionPercentage = computed(() => {
    const total = this.totalExercises();
    if (total === 0) return 0;
    return Math.round((this.completedExercises() / total) * 100);
  });

  /** Ejercicios filtrados por busqueda */
  readonly filteredExercises = computed(() => {
    const term = this._searchTerm().toLowerCase().trim();
    const exercises = this._exercises();

    if (!term) return exercises;

    return exercises.filter(e =>
      e.name.toLowerCase().includes(term) ||
      e.reps.toLowerCase().includes(term)
    );
  });

  /** Total de paginas */
  readonly totalPages = computed(() =>
    Math.ceil(this.filteredExercises().length / this.pageSize)
  );

  /** Ejercicios paginados (para mostrar en la UI) */
  readonly paginatedExercises = computed(() => {
    const filtered = this.filteredExercises();
    const start = (this._currentPage() - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  });

  /** Indica si hay resultados de busqueda */
  readonly hasResults = computed(() => this.filteredExercises().length > 0);

  /** Indica si la lista esta vacia (sin ejercicios cargados) */
  readonly isEmpty = computed(() =>
    this._exercises().length === 0 && !this._loading() && !this._error()
  );

  // ==========================================
  // METODOS DE CARGA
  // ==========================================

  /**
   * Carga los ejercicios del usuario desde el backend
   */
  load(userId: string, date?: string): void {
    this._loading.set(true);
    this._error.set(null);

    const currentDate = date || new Date().toISOString().split('T')[0];

    this.trainingService.getExercises(userId, currentDate).pipe(
      catchError(err => {
        console.error('Error loading exercises:', err);
        this._error.set('Error al cargar los ejercicios');
        return of([]);
      }),
      finalize(() => this._loading.set(false))
    ).subscribe(exercises => {
      this._exercises.set(exercises);
      this._currentPage.set(1);
    });
  }

  /**
   * Recarga los ejercicios
   */
  refresh(userId: string, date?: string): void {
    this.load(userId, date);
  }

  // ==========================================
  // METODOS CRUD
  // ==========================================

  /**
   * Agrega un nuevo ejercicio a la lista
   */
  add(exercise: Exercise): void {
    this._exercises.update(list => [...list, exercise]);
    this.toastService.success('Ejercicio agregado');
  }

  /**
   * Actualiza un ejercicio existente
   */
  update(updated: Exercise): void {
    this._exercises.update(list =>
      list.map(e => e.id === updated.id ? updated : e)
    );
  }

  /**
   * Elimina un ejercicio por ID
   */
  remove(id: string): void {
    this._exercises.update(list => list.filter(e => e.id !== id));
    this.toastService.success('Ejercicio eliminado');
  }

  /**
   * Alterna el estado de completado de un ejercicio
   */
  toggleComplete(id: string): void {
    this._exercises.update(list =>
      list.map(e => e.id === id ? { ...e, completed: !e.completed } : e)
    );
  }

  /**
   * Marca todos los ejercicios como completados
   */
  completeAll(): void {
    this._exercises.update(list =>
      list.map(e => ({ ...e, completed: true }))
    );
    this.toastService.success('Todos los ejercicios completados');
  }

  // ==========================================
  // METODOS DE BUSQUEDA Y PAGINACION
  // ==========================================

  /**
   * Establece el termino de busqueda
   */
  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
    this._currentPage.set(1); // Resetear a primera pagina al buscar
  }

  /**
   * Limpia el termino de busqueda
   */
  clearSearch(): void {
    this._searchTerm.set('');
    this._currentPage.set(1);
  }

  /**
   * Va a la pagina siguiente
   */
  nextPage(): void {
    if (this._currentPage() < this.totalPages()) {
      this._currentPage.update(p => p + 1);
    }
  }

  /**
   * Va a la pagina anterior
   */
  previousPage(): void {
    if (this._currentPage() > 1) {
      this._currentPage.update(p => p - 1);
    }
  }

  /**
   * Va a una pagina especifica
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this._currentPage.set(page);
    }
  }

  // ==========================================
  // METODOS DE ESTADO
  // ==========================================

  /**
   * Limpia el estado del store
   */
  clear(): void {
    this._exercises.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._searchTerm.set('');
    this._currentPage.set(1);
  }

  /**
   * Limpia el error
   */
  clearError(): void {
    this._error.set(null);
  }
}
