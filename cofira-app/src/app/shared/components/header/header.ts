import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/auth/auth.service';
import { TooltipDirective } from '../../directives/tooltip.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TooltipDirective],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header {
  private router = inject(Router);
  private authService = inject(AuthService);

  isMobileMenuOpen = signal(false);

  constructor(public themeService: ThemeService) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((value) => !value);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
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
