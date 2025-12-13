import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  token: string;
  userInfo: {
    id: number;
    email: string;
    nombre: string;
  };
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  nombre: string;
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'currentUser';
  private readonly API_URL = `${environment.apiUrl}/api/auth`;

  login(email: string, password: string): Observable<AuthResponse> {
    const loginRequest: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, loginRequest).pipe(
      tap((response) => {
        this.saveToken(response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.userInfo));
      })
    );
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    const registerRequest: RegisterRequest = {
      nombre: name,
      username: name, // Usar el mismo valor para username
      email,
      password,
    };
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, registerRequest).pipe(
      tap((response) => {
        this.saveToken(response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.userInfo));
      })
    );
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): Observable<any> {
    const token = this.getToken();
    if (token) {
      return this.http.post(`${this.API_URL}/logout`, {}).pipe(
        tap(() => {
          localStorage.removeItem(this.TOKEN_KEY);
          localStorage.removeItem(this.USER_KEY);
        })
      );
    }
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    return of(null);
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.API_URL}/me`);
  }

  requestPasswordResetCode(email: string): Observable<any> {
    console.log('Requesting password reset code for:', email);
    // Simulate API call to send a reset code
    return of({ message: 'Reset code sent to your email.' }).pipe(delay(1000));
  }

  resetPasswordWithCode(email: string, code: string, newPassword: string): Observable<any> {
    console.log(
      'Resetting password for:',
      email,
      'with code:',
      code,
      'and new password:',
      newPassword
    );
    // Simulate API call to reset password
    return of({ message: 'Password has been reset successfully.' }).pipe(delay(1000));
  }
}
