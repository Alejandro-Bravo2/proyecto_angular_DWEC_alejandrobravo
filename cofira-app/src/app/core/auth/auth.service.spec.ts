import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should register a new user successfully', (done) => {
      const mockResponse = {
        token: 'mock-jwt-token',
        user: { name: 'Test User', email: 'test@example.com' },
      };

      service.register('Test User', 'test@example.com', 'password123').subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(localStorage.getItem('authToken')).toBe('mock-jwt-token');
          done();
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      req.flush(mockResponse);
    });

    it('should handle registration error', (done) => {
      service.register('Test User', 'test@example.com', 'password123').subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/register');
      req.flush({ message: 'Email already exists' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('login', () => {
    it('should login user successfully', (done) => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      service.login('test@example.com', 'password123').subscribe({
        next: (response) => {
          expect(response.token).toBe('jwt-token-1');
          expect(response.user.email).toBe('test@example.com');
          expect(localStorage.getItem('authToken')).toBe('jwt-token-1');
          done();
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/users?email=test@example.com');
      expect(req.request.method).toBe('GET');
      req.flush([mockUser]);
    });

    it('should handle login with wrong password', (done) => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      service.login('test@example.com', 'wrongpassword').subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          expect(error.message).toBe('Invalid credentials');
          done();
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/users?email=test@example.com');
      req.flush([mockUser]);
    });

    it('should handle login with non-existent email', (done) => {
      service.login('nonexistent@example.com', 'password123').subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          expect(error.message).toBe('Invalid credentials');
          done();
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/users?email=nonexistent@example.com');
      req.flush([]);
    });
  });

  describe('logout', () => {
    it('should clear token and user data', () => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('currentUser', JSON.stringify({ id: 1, name: 'Test' }));

      service.logout();

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('authToken', 'mock-token');
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false when token does not exist', () => {
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      const token = 'mock-jwt-token';
      localStorage.setItem('authToken', token);
      expect(service.getToken()).toBe(token);
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('saveToken', () => {
    it('should save token to localStorage', () => {
      service.saveToken('test-token');
      expect(localStorage.getItem('authToken')).toBe('test-token');
    });
  });
});
