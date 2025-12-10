import { Injectable, signal } from '@angular/core';
import { ToastMessage, ToastType, ToastConfig } from '../../../shared/models/toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Signal con array de toasts activos
  toasts = signal<ToastMessage[]>([]);

  private readonly DEFAULT_DURATIONS: Record<ToastType, number> = {
    success: 4000,
    error: 8000,
    info: 3000,
    warning: 6000
  };

  show(config: ToastConfig): void {
    const toast: ToastMessage = {
      id: this.generateId(),
      message: config.message,
      type: config.type,
      duration: config.duration ?? this.DEFAULT_DURATIONS[config.type]
    };

    // Añadir toast al array
    this.toasts.update(toasts => [...toasts, toast]);

    // Auto-dismiss si duration > 0
    if (toast.duration > 0) {
      setTimeout(() => this.dismiss(toast.id), toast.duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number): void {
    this.show({ message, type: 'error', duration });
  }

  info(message: string, duration?: number): void {
    this.show({ message, type: 'info', duration });
  }

  warning(message: string, duration?: number): void {
    this.show({ message, type: 'warning', duration });
  }

  dismiss(id: string): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
