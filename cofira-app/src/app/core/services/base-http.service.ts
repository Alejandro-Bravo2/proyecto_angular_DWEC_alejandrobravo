import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, finalize } from 'rxjs/operators';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class BaseHttpService {
  private API_BASE_URL = 'http://localhost:3000'; // Default to json-server

  constructor(private http: HttpClient, private loadingService: LoadingService) { }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}
Message: ${error.message}`;
    }
    console.error(errorMessage);
    // Optionally re-throw to propagate error to component
    return throwError(() => new Error(errorMessage));
  }

  private request<T>(method: string, endpoint: string, data?: any): Observable<T> {
    const url = `${this.API_BASE_URL}/${endpoint}`;
    this.loadingService.show();

    let requestObservable: Observable<T>;

    switch (method.toLowerCase()) {
      case 'get':
        requestObservable = this.http.get<T>(url);
        break;
      case 'post':
        requestObservable = this.http.post<T>(url, data);
        break;
      case 'put':
        requestObservable = this.http.put<T>(url, data);
        break;
      case 'delete':
        requestObservable = this.http.delete<T>(url);
        break;
      default:
        return throwError(() => new Error('Unsupported HTTP method'));
    }

    return requestObservable.pipe(
      retry(2), // Retry failed requests twice
      catchError(this.handleError),
      finalize(() => this.loadingService.hide())
    );
  }

  get<T>(endpoint: string): Observable<T> {
    return this.request<T>('get', endpoint);
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.request<T>('post', endpoint, data);
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.request<T>('put', endpoint, data);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.request<T>('delete', endpoint);
  }
}
