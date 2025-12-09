import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

interface AuthResponse {
  token: string;
  user: {
    email: string;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly API_URL = 'http://localhost:3000'; // Assuming json-server runs here

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<AuthResponse> {
    // In a real app, you'd send credentials to a backend API
    // For json-server, we'll simulate a successful login if credentials are basic
    if (email === 'user@example.com' && password === 'password') {
      const mockResponse: AuthResponse = {
        token: 'mock-jwt-token',
        user: { email: email, name: 'Mock User' }
      };
      return of(mockResponse).pipe(
        delay(1000), // Simulate network delay
        tap(response => this.saveToken(response.token))
      );
    } else {
      // Simulate login failure
      return new Observable(observer => {
        setTimeout(() => {
          observer.error({ status: 401, message: 'Invalid credentials' });
          observer.complete();
        }, 1000);
      });
    }
  }

  // Placeholder for register method
  register(name: string, email: string, password: string): Observable<AuthResponse> {
    // In a real app, send to /register endpoint
    console.log('Registering user:', { name, email, password });
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, { name, email, password }).pipe(
      delay(1000),
      tap(response => this.saveToken(response.token))
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

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  requestPasswordResetCode(email: string): Observable<any> {
    console.log('Requesting password reset code for:', email);
    // Simulate API call to send a reset code
    return of({ message: 'Reset code sent to your email.' }).pipe(delay(1000));
  }

  resetPasswordWithCode(email: string, code: string, newPassword: string): Observable<any> {
    console.log('Resetting password for:', email, 'with code:', code, 'and new password:', newPassword);
    // Simulate API call to reset password
    return of({ message: 'Password has been reset successfully.' }).pipe(delay(1000));
  }
}
