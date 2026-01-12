import { Injectable, signal, inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

/**
 * Servicio de gestión de temas (claro/oscuro) con detección en tiempo real.
 *
 * @description
 * Características implementadas:
 * - Detección de preferencia del sistema (prefers-color-scheme)
 * - Listener en tiempo real para cambios del sistema (matchMedia.addEventListener)
 * - Persistencia en localStorage
 * - SSR-safe con PLATFORM_ID check
 *
 * @example
 * ```typescript
 * // En componente
 * themeService = inject(ThemeService);
 *
 * // Leer tema actual
 * const isDark = this.themeService.isDark();
 *
 * // Cambiar tema
 * this.themeService.toggleTheme();
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService implements OnDestroy {
  // Inyección de PLATFORM_ID para verificar si estamos en el navegador (SSR-safe)
  private readonly platformId = inject(PLATFORM_ID);

  // Signal para el tema actual
  currentTheme = signal<Theme>('light');

  // Referencia al MediaQueryList para poder eliminar el listener
  private mediaQuery: MediaQueryList | null = null;

  // Referencia al handler para poder eliminarlo en OnDestroy
  private mediaQueryHandler: ((e: MediaQueryListEvent) => void) | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initTheme();
      this.listenToSystemChanges();
    }
  }

  /**
   * Limpieza del listener al destruir el servicio.
   */
  ngOnDestroy(): void {
    if (this.mediaQuery && this.mediaQueryHandler) {
      this.mediaQuery.removeEventListener('change', this.mediaQueryHandler);
    }
  }

  /**
   * Inicializa el tema desde localStorage o preferencia del sistema.
   */
  private initTheme(): void {
    // 1. Intentar leer de localStorage
    const savedTheme = localStorage.getItem('cofira-theme') as Theme | null;

    if (savedTheme) {
      this.setTheme(savedTheme);
      return;
    }

    // 2. Si no hay guardado, detectar preferencia del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme: Theme = prefersDark ? 'dark' : 'light';
    this.setTheme(defaultTheme);
  }

  /**
   * Escucha cambios en la preferencia del sistema en tiempo real.
   * Usa matchMedia.addEventListener para detectar cuando el usuario
   * cambia el tema del sistema operativo.
   *
   * Solo actualiza si el usuario no ha establecido preferencia manual.
   */
  private listenToSystemChanges(): void {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Handler para cambios del sistema en tiempo real
    this.mediaQueryHandler = (e: MediaQueryListEvent) => {
      // Solo actualizar si el usuario no ha guardado una preferencia manual
      const savedTheme = localStorage.getItem('cofira-theme');
      if (!savedTheme) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    };

    // Registrar listener con addEventListener (método moderno)
    this.mediaQuery.addEventListener('change', this.mediaQueryHandler);
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cofira-theme', theme);
  }

  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }
}
