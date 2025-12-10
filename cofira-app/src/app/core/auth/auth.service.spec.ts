import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
    localStorage.clear(); // Clear local storage before each test
  });

  afterEach(() => {
    httpTestingController.verify(); // Ensure that there are no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should return a token on successful login with mock credentials', (done) => {
      const mockResponse = { token: 'mock-jwt-token', user: { email: 'user@example.com', name: 'Mock User' } };
      spyOn(localStorage, 'setItem'); // Spy on setItem to check if token is saved

      service.login('user@example.com', 'password').subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'mock-jwt-token');
        done();
      });
    });

    it('should return an error on failed login with mock credentials', (done) => {
      service.login('wrong@example.com', 'wrong').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain('Invalid credentials');
          done();
        }
      });
    });
  });

  describe('register', () => {
    it('should return a token on successful registration', (done) => {
      const mockResponse = { token: 'new-mock-jwt-token', user: { email: 'new@example.com', name: 'New User' } };
      spyOn(localStorage, 'setItem');

      service.register('New User', 'new@example.com', 'NewPassword123!').subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'new-mock-jwt-token');
        done();
      });

      const req = httpTestingController.expectOne('http://localhost:3000/register');
      expect(req.request.method).toEqual('POST');
      req.flush(mockResponse);
    });

    it('should handle registration error', (done) => {
      service.register('New User', 'error@example.com', 'NewPassword123!').subscribe({
        next: () => fail('should have failed with an error'),
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        }
      });

      const req = httpTestingController.expectOne('http://localhost:3000/register');
      req.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });
    });
  });

  describe('token management', () => {
    it('should save and retrieve token', () => {
      service.saveToken('test-token');
      expect(service.getToken()).toBe('test-token');
    });

    it('should return null if no token exists', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return true if user is logged in', () => {
      service.saveToken('test-token');
      expect(service.isLoggedIn()).toBeTrue();
    });

    it('should return false if user is not logged in', () => {
      expect(service.isLoggedIn()).toBeFalse();
    });

    it('should clear token on logout', () => {
      service.saveToken('test-token');
      service.logout();
      expect(service.getToken()).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
    });
  });
});
