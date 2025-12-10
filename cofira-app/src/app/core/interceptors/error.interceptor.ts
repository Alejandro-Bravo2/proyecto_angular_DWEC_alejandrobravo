import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado.';
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 401: // Unauthorized
            errorMessage = 'Acceso no autorizado. Por favor, inicia sesión de nuevo.';
            toastService.error(errorMessage);
            router.navigate(['/login']); // Redirect to login page
            break;
          case 403: // Forbidden
            errorMessage = 'No tienes permiso para acceder a este recurso.';
            toastService.warning(errorMessage);
            break;
          case 404: // Not Found
            errorMessage = 'El recurso solicitado no se encontró.';
            toastService.warning(errorMessage);
            break;
          case 500: // Internal Server Error
            errorMessage = 'Error interno del servidor. Por favor, inténtalo más tarde.';
            toastService.error(errorMessage);
            break;
          default:
            errorMessage = `Error: ${error.status} - ${error.message}`;
            toastService.error(errorMessage);
            break;
        }
      }
      console.error(errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};
