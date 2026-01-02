import { Injectable, inject, signal, computed } from '@angular/core';
import { NutritionService, Meal, DailyNutrition } from '../services/nutrition.service';
import { ToastService } from '../../../core/services/toast.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Store de dominio para gestionar el estado de nutricion
 *
 * Implementa el patron de gestion de estado con Signals de Angular,
 * manteniendo el estado en memoria y notificando cambios reactivamente.
 *
 * @example
 * ```typescript
 * // En un componente
 * store = inject(NutritionStore);
 *
 * // Leer estado
 * meals = this.store.meals;
 * loading = this.store.loading;
 *
 * // Usar computed
 * calories = this.store.totalCalories();
 *
 * // Modificar estado
 * this.store.add(newMeal);
 * this.store.remove('meal-id');
 * ```
 */
@Injectable({ providedIn: 'root' })
export class NutritionStore {
  private readonly nutritionService = inject(NutritionService);
  private readonly toastService = inject(ToastService);

  // ==========================================
  // ESTADO PRIVADO (solo modificable internamente)
  // ==========================================

  private readonly _meals = signal<Meal[]>([]);
  private readonly _dailyNutrition = signal<DailyNutrition | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _searchTerm = signal('');
  private readonly _currentPage = signal(1);
  private readonly _currentDate = signal(new Date().toISOString().split('T')[0]);

  // ==========================================
  // ESTADO PUBLICO (readonly para componentes)
  // ==========================================

  /** Lista de comidas cargadas */
  readonly meals = this._meals.asReadonly();

  /** Nutricion diaria completa */
  readonly dailyNutrition = this._dailyNutrition.asReadonly();

  /** Estado de carga */
  readonly loading = this._loading.asReadonly();

  /** Mensaje de error si existe */
  readonly error = this._error.asReadonly();

  /** Termino de busqueda actual */
  readonly searchTerm = this._searchTerm.asReadonly();

  /** Pagina actual */
  readonly currentPage = this._currentPage.asReadonly();

  /** Fecha actual seleccionada */
  readonly currentDate = this._currentDate.asReadonly();

  /** Elementos por pagina */
  readonly pageSize = 5;

  // ==========================================
  // COMPUTED (valores derivados)
  // ==========================================

  /** Total de comidas */
  readonly mealCount = computed(() => this._meals().length);

  /** Total de calorias del dia */
  readonly totalCalories = computed(() =>
    this._meals().reduce((sum, m) => sum + m.totalCalories, 0)
  );

  /** Total de proteinas del dia */
  readonly totalProtein = computed(() =>
    this._meals().reduce((sum, m) => sum + m.totalProtein, 0)
  );

  /** Total de carbohidratos del dia */
  readonly totalCarbs = computed(() =>
    this._meals().reduce((sum, m) => sum + m.totalCarbs, 0)
  );

  /** Total de grasas del dia */
  readonly totalFat = computed(() =>
    this._meals().reduce((sum, m) => sum + m.totalFat, 0)
  );

  /** Comidas filtradas por busqueda */
  readonly filteredMeals = computed(() => {
    const term = this._searchTerm().toLowerCase().trim();
    const meals = this._meals();

    if (!term) return meals;

    return meals.filter(m =>
      m.mealType.toLowerCase().includes(term) ||
      m.foods.some(f => f.name.toLowerCase().includes(term))
    );
  });

  /** Total de paginas */
  readonly totalPages = computed(() =>
    Math.ceil(this.filteredMeals().length / this.pageSize)
  );

  /** Comidas paginadas (para mostrar en la UI) */
  readonly paginatedMeals = computed(() => {
    const filtered = this.filteredMeals();
    const start = (this._currentPage() - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  });

  /** Indica si hay resultados de busqueda */
  readonly hasResults = computed(() => this.filteredMeals().length > 0);

  /** Indica si la lista esta vacia */
  readonly isEmpty = computed(() =>
    this._meals().length === 0 && !this._loading() && !this._error()
  );

  /** Indica si hay comidas hoy */
  readonly hasMealsToday = computed(() => this._meals().length > 0);

  // ==========================================
  // METODOS DE CARGA
  // ==========================================

  /**
   * Carga la nutricion del dia desde el backend
   */
  loadByDate(userId: string, date?: string): void {
    const targetDate = date || this._currentDate();
    this._currentDate.set(targetDate);
    this._loading.set(true);
    this._error.set(null);

    this.nutritionService.getDailyNutrition(userId, targetDate).pipe(
      catchError(err => {
        console.error('Error loading nutrition data:', err);
        this._error.set('Error al cargar los datos de nutricion');
        return of(this.getEmptyNutrition(targetDate));
      }),
      finalize(() => this._loading.set(false))
    ).subscribe(nutrition => {
      this._dailyNutrition.set(nutrition);
      this._meals.set(nutrition.meals);
      this._currentPage.set(1);
    });
  }

  /**
   * Recarga los datos
   */
  refresh(userId: string): void {
    this.loadByDate(userId, this._currentDate());
  }

  // ==========================================
  // METODOS CRUD
  // ==========================================

  /**
   * Agrega una nueva comida
   */
  add(meal: Meal): void {
    this._meals.update(list => [...list, meal]);
    this.toastService.success('Comida agregada');
  }

  /**
   * Actualiza una comida existente
   */
  update(updated: Meal): void {
    this._meals.update(list =>
      list.map(m => m.id === updated.id ? updated : m)
    );
  }

  /**
   * Elimina una comida por ID
   */
  remove(id: string): void {
    this._meals.update(list => list.filter(m => m.id !== id));
    this.toastService.success('Comida eliminada');
  }

  // ==========================================
  // METODOS DE BUSQUEDA Y PAGINACION
  // ==========================================

  /**
   * Establece el termino de busqueda
   */
  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
    this._currentPage.set(1);
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
  // METODOS DE FECHA
  // ==========================================

  /**
   * Cambia la fecha actual
   */
  setDate(date: string): void {
    this._currentDate.set(date);
  }

  /**
   * Va al dia anterior
   */
  previousDay(userId: string): void {
    const current = new Date(this._currentDate() + 'T12:00:00');
    current.setDate(current.getDate() - 1);
    const newDate = current.toISOString().split('T')[0];
    this.loadByDate(userId, newDate);
  }

  /**
   * Va al dia siguiente
   */
  nextDay(userId: string): void {
    const current = new Date(this._currentDate() + 'T12:00:00');
    current.setDate(current.getDate() + 1);
    const newDate = current.toISOString().split('T')[0];
    this.loadByDate(userId, newDate);
  }

  // ==========================================
  // METODOS DE ESTADO
  // ==========================================

  /**
   * Limpia el estado del store
   */
  clear(): void {
    this._meals.set([]);
    this._dailyNutrition.set(null);
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

  // ==========================================
  // METODOS PRIVADOS
  // ==========================================

  private getEmptyNutrition(date: string): DailyNutrition {
    return {
      date,
      meals: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      waterIntake: 0,
      calorieGoal: 2000
    };
  }
}
