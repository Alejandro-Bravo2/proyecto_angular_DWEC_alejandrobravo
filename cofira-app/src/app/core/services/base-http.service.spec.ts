import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, HttpErrorResponse } from '@angular/common/http';
import { BaseHttpService } from './base-http.service';
import { LoadingService } from './loading.service';
import { environment } from '../../../environments/environment';

describe('BaseHttpService', () => {
  let service: BaseHttpService;
  let httpMock: HttpTestingController;
  let loadingService: LoadingService;

  const mockData = { id: 1, name: 'Test' };
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseHttpService,
        LoadingService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(BaseHttpService);
    httpMock = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('GET requests', () => {
    it('should make GET request to correct URL', () => {
      service.get('users').subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${apiUrl}/users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should handle endpoint with leading slash', () => {
      service.get('/users').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should handle full URL endpoints', () => {
      const fullUrl = 'https://external-api.com/data';
      service.get(fullUrl).subscribe();

      const req = httpMock.expectOne(fullUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should pass query parameters', () => {
      service.get('users', { params: { page: '1', limit: '10' } }).subscribe();

      const req = httpMock.expectOne((r) => r.url.includes(`${apiUrl}/users`));
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('limit')).toBe('10');
      req.flush([]);
    });

    it('should pass custom headers', () => {
      service.get('users', { headers: { 'X-Custom-Header': 'value' } }).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/users`);
      expect(req.request.headers.get('X-Custom-Header')).toBe('value');
      req.flush(mockData);
    });
  });

  describe('POST requests', () => {
    it('should make POST request with body', () => {
      const postData = { name: 'New User', email: 'test@example.com' };

      service.post('users', postData).subscribe((data) => {
        expect(data).toEqual({ id: 1, ...postData });
      });

      const req = httpMock.expectOne(`${apiUrl}/users`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(postData);
      req.flush({ id: 1, ...postData });
    });

    it('should handle POST with empty body', () => {
      service.post('actions/trigger', {}).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/actions/trigger`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush({});
    });
  });

  describe('PUT requests', () => {
    it('should make PUT request with body', () => {
      const updateData = { name: 'Updated User' };

      service.put('users/1', updateData).subscribe((data) => {
        expect(data).toEqual({ id: 1, ...updateData });
      });

      const req = httpMock.expectOne(`${apiUrl}/users/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush({ id: 1, ...updateData });
    });
  });

  describe('DELETE requests', () => {
    it('should make DELETE request', () => {
      service.delete('users/1').subscribe((data) => {
        expect(data).toEqual({ success: true });
      });

      const req = httpMock.expectOne(`${apiUrl}/users/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true });
    });
  });

  describe('Loading state', () => {
    it('should show loading when request starts', () => {
      spyOn(loadingService, 'show');

      service.get('users').subscribe();
      expect(loadingService.show).toHaveBeenCalled();

      const req = httpMock.expectOne(`${apiUrl}/users`);
      req.flush(mockData);
    });

    it('should hide loading when request succeeds', () => {
      spyOn(loadingService, 'hide');

      service.get('users').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/users`);
      req.flush(mockData);

      expect(loadingService.hide).toHaveBeenCalled();
    });

    it('should hide loading when request fails', () => {
      spyOn(loadingService, 'hide');

      service.get('users').subscribe({
        error: () => {
          // Error manejado
        },
      });

      // Con retry(2), necesitamos fallar 3 veces: original + 2 reintentos
      for (let i = 0; i < 3; i++) {
        const req = httpMock.expectOne(`${apiUrl}/users`);
        req.flush('Error', { status: 500, statusText: 'Server Error' });
      }

      expect(loadingService.hide).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle server errors', (done) => {
      spyOn(console, 'error');

      service.get('users').subscribe({
        error: (error) => {
          expect(error.message).toContain('500');
          expect(console.error).toHaveBeenCalled();
          done();
        },
      });

      // Con retry(2), necesitamos fallar 3 veces
      for (let i = 0; i < 3; i++) {
        const req = httpMock.expectOne(`${apiUrl}/users`);
        req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
      }
    });

    it('should handle 404 errors', (done) => {
      service.get('nonexistent').subscribe({
        error: (error) => {
          expect(error.message).toContain('404');
          done();
        },
      });

      // Con retry(2), necesitamos fallar 3 veces
      for (let i = 0; i < 3; i++) {
        const req = httpMock.expectOne(`${apiUrl}/nonexistent`);
        req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      }
    });

    it('should handle network errors', (done) => {
      spyOn(console, 'error');

      service.get('users').subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        },
      });

      // Con retry(2), necesitamos fallar 3 veces
      for (let i = 0; i < 3; i++) {
        const req = httpMock.expectOne(`${apiUrl}/users`);
        req.error(new ProgressEvent('error'));
      }
    });

    it('should handle client-side ErrorEvent errors', (done) => {
      spyOn(console, 'error');

      service.get('users').subscribe({
        error: (error) => {
          expect(error.message).toContain('Error:');
          expect(console.error).toHaveBeenCalled();
          done();
        },
      });

      // Con retry(2), necesitamos fallar 3 veces
      for (let i = 0; i < 3; i++) {
        const req = httpMock.expectOne(`${apiUrl}/users`);
        // Simular un ErrorEvent de cliente
        const mockError = new ErrorEvent('Network error', {
          message: 'Connection failed',
        });
        req.error(mockError);
      }
    });
  });

  describe('Retry mechanism', () => {
    it('should retry failed requests twice', () => {
      let requestCount = 0;

      service.get('users').subscribe({
        error: () => {
          // Error esperado después de 3 intentos
        },
      });

      // Primera solicitud + 2 reintentos = 3 solicitudes totales
      for (let i = 0; i < 3; i++) {
        const req = httpMock.expectOne(`${apiUrl}/users`);
        requestCount++;
        req.flush('Error', { status: 500, statusText: 'Server Error' });
      }

      expect(requestCount).toBe(3);
    });

    it('should succeed after retry', () => {
      let responseData: any;

      service.get('users').subscribe({
        next: (data) => {
          responseData = data;
        },
      });

      // Primera solicitud falla
      const firstReq = httpMock.expectOne(`${apiUrl}/users`);
      firstReq.flush('Error', { status: 500, statusText: 'Server Error' });

      // Segundo intento tiene éxito
      const secondReq = httpMock.expectOne(`${apiUrl}/users`);
      secondReq.flush(mockData);

      expect(responseData).toEqual(mockData);
    });
  });

  describe('URL building', () => {
    it('should handle endpoints without leading slash', () => {
      service.get('api/v1/users').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/api/v1/users`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should not duplicate slashes', () => {
      service.get('/api/v1/users').subscribe();

      // No debe tener doble barra
      const req = httpMock.expectOne(`${apiUrl}/api/v1/users`);
      expect(req.request.url).not.toContain('//api');
      req.flush([]);
    });

    it('should preserve full URLs', () => {
      const externalUrl = 'https://api.external.com/data';
      service.get(externalUrl).subscribe();

      const req = httpMock.expectOne(externalUrl);
      expect(req.request.url).toBe(externalUrl);
      req.flush({});
    });
  });

  describe('Type safety', () => {
    interface User {
      id: number;
      name: string;
      email: string;
    }

    it('should return typed response for GET', (done) => {
      const expectedUser: User = { id: 1, name: 'Test', email: 'test@example.com' };

      service.get<User>('users/1').subscribe((user) => {
        expect(user.id).toBe(1);
        expect(user.name).toBe('Test');
        expect(user.email).toBe('test@example.com');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/users/1`);
      req.flush(expectedUser);
    });

    it('should return typed response for POST', (done) => {
      const newUser = { name: 'New', email: 'new@example.com' };
      const expectedUser: User = { id: 2, ...newUser };

      service.post<User>('users', newUser).subscribe((user) => {
        expect(user.id).toBe(2);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/users`);
      req.flush(expectedUser);
    });
  });

  describe('Unsupported HTTP methods', () => {
    it('should throw error for unsupported HTTP method', (done) => {
      // Acceder al método privado request a través de any
      const servicioConAccesoPrivado = service as any;

      servicioConAccesoPrivado.request('PATCH', 'users/1', {}).subscribe({
        error: (error: Error) => {
          expect(error.message).toBe('Unsupported HTTP method');
          done();
        },
      });
    });

    it('should not make HTTP request for unsupported method', (done) => {
      const servicioConAccesoPrivado = service as any;

      servicioConAccesoPrivado.request('OPTIONS', 'users').subscribe({
        error: (error: Error) => {
          expect(error.message).toBe('Unsupported HTTP method');
          done();
        },
      });

      // No debería haber ninguna solicitud HTTP pendiente
      httpMock.expectNone(`${apiUrl}/users`);
    });
  });
});
