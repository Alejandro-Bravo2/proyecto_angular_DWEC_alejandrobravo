import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, timer, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AsyncValidatorsService {
  private readonly API_URL = 'http://localhost:3000'; // Assuming json-server runs here

  constructor(private http: HttpClient) { }

  emailUnique(excludeEmail?: string): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
      if (!control.valueChanges || control.pristine) {
        return of(null);
      }
      return timer(500).pipe( // Debounce for 500ms
        switchMap(() => {
          if (!control.value) {
            return of(null); // No value, no validation needed
          }
          if (control.value === excludeEmail) {
            return of(null); // Current email, no validation needed
          }
          // Simulate API call to check if email exists
          return this.http.get<any[]>(`${this.API_URL}/users?email=${control.value}`).pipe(
            map(users => {
              // If any user with this email exists, it's not unique
              return users.length > 0 ? { emailTaken: true } : null;
            }),
            catchError(() => of(null)) // Handle API errors gracefully
          );
        })
      );
    };
  }

  usernameUnique(excludeUsername?: string): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
      if (!control.valueChanges || control.pristine) {
        return of(null);
      }
      return timer(500).pipe( // Debounce for 500ms
        switchMap(() => {
          if (!control.value) {
            return of(null); // No value, no validation needed
          }
          if (control.value === excludeUsername) {
            return of(null); // Current username, no validation needed
          }
          // Simulate API call to check if username exists
          return this.http.get<any[]>(`${this.API_URL}/users?username=${control.value}`).pipe(
            map(users => {
              // If any user with this username exists, it's not unique
              return users.length > 0 ? { usernameTaken: true } : null;
            }),
            catchError(() => of(null)) // Handle API errors gracefully
          );
        })
      );
    };
  }
}
