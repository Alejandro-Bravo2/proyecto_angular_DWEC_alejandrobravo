import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { LoadingService } from '../../../core/services/loading.service';
import { environment } from '../../../../environments/environment';

// DTOs que coinciden con el backend
export interface RutinaAlimentacionDTO {
  id: number;
  fechaInicio: string;
  diasAlimentacion: DiaAlimentacionDTO[];
}

export interface DiaAlimentacionDTO {
  id: number;
  diaSemana: string;
  desayuno: ComidaDTO | null;
  almuerzo: ComidaDTO | null;
  comida: ComidaDTO | null;
  merienda: ComidaDTO | null;
  cena: ComidaDTO | null;
}

export interface ComidaDTO {
  id: number;
  alimentos: string[];
}

export interface AlimentoDTO {
  id: number;
  nombre: string;
  ingredientes: string[];
}

export interface CrearRutinaAlimentacionDTO {
  fechaInicio: string;
  diasAlimentacion: CrearDiaAlimentacionDTO[];
}

export interface CrearDiaAlimentacionDTO {
  diaSemana: string;
  desayuno?: CrearComidaDTO;
  almuerzo?: CrearComidaDTO;
  comida?: CrearComidaDTO;
  merienda?: CrearComidaDTO;
  cena?: CrearComidaDTO;
}

export interface CrearComidaDTO {
  alimentos: string[];
}

// Interfaces legacy para compatibilidad con componentes existentes
export interface Meal {
  id: string;
  userId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
}

export interface FoodItem {
  icon: string;
  quantity: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface DailyNutrition {
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  waterIntake: number;
  calorieGoal: number;
}

@Injectable({
  providedIn: 'root'
})
export class NutritionService extends BaseHttpService {
  constructor(http: HttpClient, loadingService: LoadingService) {
    super(http, loadingService);
  }

  /**
   * Listar todas las rutinas de alimentación
   */
  listarRutinas(): Observable<RutinaAlimentacionDTO[]> {
    return this.get<RutinaAlimentacionDTO[]>('rutinas-alimentacion');
  }

  /**
   * Obtener una rutina de alimentación por ID
   */
  obtenerRutina(id: number): Observable<RutinaAlimentacionDTO> {
    return this.get<RutinaAlimentacionDTO>(`rutinas-alimentacion/${id}`);
  }

  /**
   * Crear una nueva rutina de alimentación
   */
  crearRutina(dto: CrearRutinaAlimentacionDTO): Observable<RutinaAlimentacionDTO> {
    return this.post<RutinaAlimentacionDTO>('rutinas-alimentacion', dto);
  }

  /**
   * Eliminar una rutina de alimentación
   */
  eliminarRutina(id: number): Observable<void> {
    return this.delete<void>(`rutinas-alimentacion/${id}`);
  }

  /**
   * Listar todos los alimentos disponibles
   */
  listarAlimentos(): Observable<AlimentoDTO[]> {
    return this.get<AlimentoDTO[]>('alimentos');
  }

  /**
   * Obtener un alimento por ID
   */
  obtenerAlimento(id: number): Observable<AlimentoDTO> {
    return this.get<AlimentoDTO>(`alimentos/${id}`);
  }

  // ==========================================
  // MÉTODOS LEGACY CON TRANSFORMADORES
  // ==========================================

  /**
   * Obtiene las comidas de un día específico transformadas al formato legacy
   * @deprecated Usar listarRutinas() y trabajar con RutinaAlimentacionDTO directamente
   */
  getMealsByDate(userId: string, date: string): Observable<Meal[]> {
    // Por ahora, retornar array vacío hasta que se implemente el backend endpoint específico
    // O transformar desde rutinas de alimentación si es necesario
    return this.listarRutinas().pipe(
      map(rutinas => {
        // Transformar rutinas a formato legacy Meal[]
        // Por ahora retornar vacío como placeholder
        return [];
      })
    );
  }

  /**
   * Obtiene la nutrición diaria transformada al formato legacy
   * @deprecated Usar listarRutinas() y calcular nutrición desde RutinaAlimentacionDTO
   */
  getDailyNutrition(userId: string, date: string): Observable<DailyNutrition> {
    return this.listarRutinas().pipe(
      map(rutinas => {
        // Transformar rutinas a formato legacy DailyNutrition
        // Por ahora retornar estructura vacía como placeholder
        return {
          date: date,
          meals: [],
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          totalFiber: 0,
          waterIntake: 0,
          calorieGoal: 2000
        };
      })
    );
  }

  /**
   * Añade una nueva comida (formato legacy)
   * @deprecated Usar crearRutina() con CrearRutinaAlimentacionDTO
   */
  addMeal(meal: Omit<Meal, 'id'>): Observable<Meal> {
    // Transformar de formato legacy a backend DTO
    // Por ahora retornar el meal con un ID generado
    return of({
      ...meal,
      id: Date.now().toString()
    } as Meal);
  }

  /**
   * Actualiza una comida existente (formato legacy)
   * @deprecated Actualizar directamente la rutina con los endpoints del backend
   */
  updateMeal(mealId: string, meal: Partial<Meal>): Observable<Meal> {
    // Implementar transformación cuando se necesite
    return of({} as Meal);
  }

  /**
   * Elimina una comida (formato legacy)
   * @deprecated Usar eliminarRutina() o modificar la rutina directamente
   */
  deleteMeal(mealId: string): Observable<void> {
    // Implementar cuando se necesite
    return of(void 0);
  }

  /**
   * Obtiene todas las comidas de un usuario (formato legacy)
   * @deprecated Usar listarRutinas() directamente
   */
  getAllMeals(userId: string): Observable<Meal[]> {
    return this.listarRutinas().pipe(
      map(rutinas => {
        // Transformar rutinas a formato legacy Meal[]
        return [];
      })
    );
  }
}
