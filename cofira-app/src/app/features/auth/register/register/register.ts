import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { passwordStrengthValidator } from '../../../../shared/validators/password-strength.validator';
import { passwordMatchValidator } from '../../../../shared/validators/cross-field.validators';
import { AsyncValidatorsService } from '../../../../shared/validators/async-validators.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { ToastService } from '../../../../core/services/toast.service'; // Placeholder ToastService

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email], [this.asyncValidatorsService.emailUnique()]),
    password: new FormControl('', [Validators.required, passwordStrengthValidator()]),
    confirmPassword: new FormControl('', [Validators.required]),
  }, { validators: passwordMatchValidator('password', 'confirmPassword') });

  constructor(
    private asyncValidatorsService: AsyncValidatorsService,
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService,
    private toastService: ToastService // Placeholder ToastService
  ) {}

  onSubmit(): void {
    if (this.registerForm.valid) {
      const { name, email, password } = this.registerForm.value;
      if (name && email && password) {
        this.loadingService.show();
        this.authService.register(name, email, password).subscribe({
          next: (response) => {
            console.log('Registration successful', response);
            this.loadingService.hide();
            this.toastService.success('Registro exitoso. ¡Bienvenido!');
            this.router.navigate(['/login']); // Redirect to login page after registration
          },
          error: (err) => {
            console.error('Registration failed', err);
            this.loadingService.hide();
            this.toastService.error('Error en el registro: ' + (err.message || 'Inténtalo de nuevo.'));
          }
        });
      }
    } else {
      console.log('Form is invalid');
      this.registerForm.markAllAsTouched();
    }
  }
}
