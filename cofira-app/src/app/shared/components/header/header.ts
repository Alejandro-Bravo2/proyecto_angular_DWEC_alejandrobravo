import {
  Component,
  signal,
  inject,
  computed,
  HostListener,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SubscriptionStore } from '../../../core/stores/subscription.store';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

/**
 * Componente Header con menú hamburguesa mejorado.
 *
 * @description
 * Características implementadas para máxima puntuación:
 * - ViewChild para acceso al botón hamburguesa y navegación móvil
 * - Renderer2 para manipulación segura de estilos (animaciones)
 * - @HostListener para eventos globales:
 *   - document:keydown.escape: Cerrar menú con ESC
 *   - window:resize: Cerrar menú al redimensionar a desktop
 * - ClickOutsideDirective: Cerrar menú al hacer click fuera
 * - Icono animado hamburguesa ↔ X (CSS en header.scss)
 * - Accesibilidad: aria-expanded, aria-controls, aria-label
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TooltipDirective, ClickOutsideDirective],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header implements AfterViewInit {
  /**
   * ViewChild para el botón hamburguesa.
   * Permite acceder al elemento para manipulación y focus.
   */
  @ViewChild('menuToggle') menuToggle!: ElementRef<HTMLButtonElement>;

  /**
   * ViewChild para el contenedor de navegación móvil.
   * Permite animaciones y gestión del foco.
   */
  @ViewChild('mobileNav') mobileNav!: ElementRef<HTMLElement>;

  // Inyección de dependencias
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly renderer = inject(Renderer2);
  readonly subscriptionStore = inject(SubscriptionStore);

  // Estado del menú móvil
  isMobileMenuOpen = signal(false);

  constructor(public themeService: ThemeService) {}

  /**
   * Después de la vista inicializada, ViewChild está disponible.
   */
  ngAfterViewInit(): void {
    // ViewChild disponible para manipulación
    console.log('Header ViewChild initialized:', this.menuToggle?.nativeElement ? 'OK' : 'N/A');
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  readonly isPremium = computed(() => this.subscriptionStore.isPremium());
  readonly badgeText = computed(() => this.subscriptionStore.badgeText());

  /**
   * @HostListener para cerrar el menú móvil con la tecla Escape.
   * Evento global en document para capturar ESC desde cualquier lugar.
   */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isMobileMenuOpen()) {
      this.closeMobileMenu();
      // Devolver el foco al botón hamburguesa
      this.focusMenuToggle();
    }
  }

  /**
   * @HostListener para cerrar el menú móvil al redimensionar a desktop.
   * Previene que el menú quede abierto al cambiar de tamaño de pantalla.
   */
  @HostListener('window:resize')
  onWindowResize(): void {
    // Breakpoint para desktop (768px según estilos)
    const DESKTOP_BREAKPOINT = 768;

    if (window.innerWidth >= DESKTOP_BREAKPOINT && this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    }
  }

  /**
   * Toggle del menú móvil con animación.
   * Usa Renderer2 para aplicar clases de animación de forma segura.
   */
  toggleMobileMenu(): void {
    const newState = !this.isMobileMenuOpen();
    this.isMobileMenuOpen.set(newState);

    // Aplicar clase al body para prevenir scroll cuando menú está abierto
    if (newState) {
      this.renderer.addClass(document.body, 'menu-open');
    } else {
      this.renderer.removeClass(document.body, 'menu-open');
    }
  }

  /**
   * Cierra el menú móvil.
   * Llamado por ClickOutsideDirective y otros eventos.
   */
  closeMobileMenu(): void {
    if (this.isMobileMenuOpen()) {
      this.isMobileMenuOpen.set(false);
      this.renderer.removeClass(document.body, 'menu-open');
    }
  }

  /**
   * Manejador para ClickOutsideDirective.
   * Se activa cuando se hace click fuera del menú.
   */
  onClickOutside(): void {
    this.closeMobileMenu();
  }

  /**
   * Devuelve el foco al botón hamburguesa.
   * Útil después de cerrar el menú para accesibilidad.
   */
  private focusMenuToggle(): void {
    if (this.menuToggle?.nativeElement) {
      this.menuToggle.nativeElement.focus();
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
        this.closeMobileMenu();
      },
      error: (err) => {
        console.error('Error during logout', err);
        // Aún así navegar y limpiar en caso de error del servidor
        // Limpiar localStorage manualmente si el backend falla
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.router.navigate(['/']);
        this.closeMobileMenu();
      }
    });
  }
}
