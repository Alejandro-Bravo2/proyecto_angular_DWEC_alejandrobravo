import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { LoadingService } from '../../../core/services/loading.service';
import { environment } from '../../../../environments/environment';

// DTOs que coinciden con el backend
export interface RutinaEjercicioDTO {
  id: number;
  fechaInicio: string;
  diasEjercicio: DiaEjercicioDTO[];
}

export interface DiaEjercicioDTO {
  id: number;
  diaSemana: string;
  ejercicios: EjerciciosDTO[];
}

export interface EjerciciosDTO {
  id: number;
  nombreEjercicio: string;
  series: number;
  repeticiones: number;
  tiempoDescansoSegundos: number;
  descripcion: string;
  grupoMuscular: string;
}

export interface CrearRutinaEjercicioDTO {
  fechaInicio: string;
  diasEjercicio: CrearDiaEjercicioDTO[];
}

export interface CrearDiaEjercicioDTO {
  diaSemana: string;
  ejercicios: number[]; // IDs de ejercicios
}

// Interfaces legacy para compatibilidad
export interface Exercise {
  id: string;
  userId: string;
  name: string;
  sets: number;
  reps: string;
  completed: boolean;
  date: string;
  notes?: string;
}

export interface WorkoutFeedback {
  id: string;
  userId: string;
  date: string;
  difficulty: number; // 1-5
  energy: number; // 1-5
  comments?: string;
}

export interface WorkoutProgress {
  userId: string;
  totalWorkouts: number;
  completedExercises: number;
  streak: number;
  lastWorkout?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TrainingService extends BaseHttpService {
  constructor(http: HttpClient, loadingService: LoadingService) {
    super(http, loadingService);
  }

  /**
   * Listar todas las rutinas de ejercicio
   */
  listarRutinas(): Observable<RutinaEjercicioDTO[]> {
    return this.get<RutinaEjercicioDTO[]>('rutinas-ejercicio');
  }

  /**
   * Obtener una rutina de ejercicio por ID
   */
  obtenerRutina(id: number): Observable<RutinaEjercicioDTO> {
    return this.get<RutinaEjercicioDTO>(`rutinas-ejercicio/${id}`);
  }

  /**
   * Crear una nueva rutina de ejercicio
   */
  crearRutina(dto: CrearRutinaEjercicioDTO): Observable<RutinaEjercicioDTO> {
    return this.post<RutinaEjercicioDTO>('rutinas-ejercicio', dto);
  }

  /**
   * Eliminar una rutina de ejercicio
   */
  eliminarRutina(id: number): Observable<void> {
    return this.delete<void>(`rutinas-ejercicio/${id}`);
  }

  /**
   * Listar todos los ejercicios disponibles
   */
  listarEjercicios(): Observable<EjerciciosDTO[]> {
    return this.get<EjerciciosDTO[]>('ejercicios');
  }

  /**
   * Obtener un ejercicio por ID
   */
  obtenerEjercicio(id: number): Observable<EjerciciosDTO> {
    return this.get<EjerciciosDTO>(`ejercicios/${id}`);
  }

  // ==========================================
  // MÉTODOS LEGACY CON TRANSFORMADORES
  // ==========================================

  /**
   * Obtiene ejercicios transformados al formato legacy
   * @deprecated Usar listarRutinas() y trabajar con RutinaEjercicioDTO directamente
   */
  getExercises(userId: string, date?: string): Observable<Exercise[]> {
    return this.listarRutinas().pipe(
      map(rutinas => {
        // Transformar rutinas a formato legacy Exercise[]
        // Por ahora retornar vacío como placeholder
        return [];
      })
    );
  }

  /**
   * Actualiza un ejercicio (formato legacy)
   * @deprecated Actualizar directamente la rutina con los endpoints del backend
   */
  updateExercise(exerciseId: string, data: Partial<Exercise>): Observable<Exercise> {
    // Implementar transformación cuando se necesite
    return of({} as Exercise);
  }

  /**
   * Añade feedback de entrenamiento (formato legacy)
   * @deprecated Implementar endpoint específico en backend si se necesita
   */
  addFeedback(feedback: Omit<WorkoutFeedback, 'id'>): Observable<WorkoutFeedback> {
    // Por ahora retornar el feedback con un ID generado
    return of({
      ...feedback,
      id: Date.now().toString()
    } as WorkoutFeedback);
  }

  /**
   * Obtiene el progreso del entrenamiento (formato legacy)
   * @deprecated Calcular desde las rutinas o implementar endpoint específico
   */
  getWorkoutProgress(userId: string): Observable<WorkoutProgress> {
    return this.listarRutinas().pipe(
      map(rutinas => {
        // Calcular progreso desde las rutinas
        return {
          userId: userId,
          totalWorkouts: rutinas.length,
          completedExercises: 0,
          streak: 0,
          lastWorkout: undefined
        };
      })
    );
  }
}
