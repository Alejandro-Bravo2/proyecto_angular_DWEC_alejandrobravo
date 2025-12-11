import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormControl } from '@angular/forms';
import { AsyncValidatorsService } from './async-validators.service';
import { of, throwError } from 'rxjs';

describe('AsyncValidatorsService', () => {
  let service: AsyncValidatorsService;
  let httpMock: HttpTestingController;
  const API_URL = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AsyncValidatorsService],
    });
    service = TestBed.inject(AsyncValidatorsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have API_URL configured', () => {
      expect((service as any).API_URL).toBe('http://localhost:3000');
    });
  });

  describe('emailUnique validator', () => {
    it('should return null for pristine control', fakeAsync(() => {
      const control = new FormControl('');
      const validator = service.emailUnique();

      const result = validator(control);

      if (result instanceof Promise) {
        result.then((res) => expect(res).toBeNull());
      } else {
        result.subscribe((res) => expect(res).toBeNull());
      }

      tick(500);
    }));

    it('should return null for empty value', fakeAsync(() => {
      const control = new FormControl('');
      control.markAsDirty();
      const validator = service.emailUnique();

      const result = validator(control);

      if (result instanceof Promise) {
        result.then((res) => expect(res).toBeNull());
      } else {
        result.subscribe((res) => expect(res).toBeNull());
      }

      tick(500);
    }));

    it('should return null when email matches excludeEmail', fakeAsync(() => {
      const control = new FormControl('user@example.com');
      control.markAsDirty();
      const validator = service.emailUnique('user@example.com');

      const result = validator(control);

      if (result instanceof Promise) {
        result.then((res) => expect(res).toBeNull());
      } else {
        result.subscribe((res) => expect(res).toBeNull());
      }

      tick(500);
    }));

    it('should return emailTaken error when email exists', fakeAsync(() => {
      const control = new FormControl('existing@example.com');
      control.markAsDirty();
      const validator = service.emailUnique();

      const result = validator(control);

      tick(500);

      const req = httpMock.expectOne(`${API_URL}/users?email=existing@example.com`);
      expect(req.request.method).toBe('GET');
      req.flush([{ id: 1, email: 'existing@example.com' }]);

      if (result instanceof Promise) {
        result.then((res) => {
          expect(res).toEqual({ emailTaken: true });
        });
      } else {
        result.subscribe((res) => {
          expect(res).toEqual({ emailTaken: true });
        });
      }

      flush();
    }));

    it('should return null when email is unique', fakeAsync(() => {
      const control = new FormControl('unique@example.com');
      control.markAsDirty();
      const validator = service.emailUnique();

      const result = validator(control);

      tick(500);

      const req = httpMock.expectOne(`${API_URL}/users?email=unique@example.com`);
      expect(req.request.method).toBe('GET');
      req.flush([]);

      if (result instanceof Promise) {
        result.then((res) => {
          expect(res).toBeNull();
        });
      } else {
        result.subscribe((res) => {
          expect(res).toBeNull();
        });
      }

      flush();
    }));

    it('should handle API errors gracefully', fakeAsync(() => {
      const control = new FormControl('test@example.com');
      control.markAsDirty();
      const validator = service.emailUnique();

      const result = validator(control);

      tick(500);

      const req = httpMock.expectOne(`${API_URL}/users?email=test@example.com`);
      req.error(new ErrorEvent('Network error'));

      if (result instanceof Promise) {
        result.then((res) => {
          expect(res).toBeNull();
        });
      } else {
        result.subscribe((res) => {
          expect(res).toBeNull();
        });
      }

      flush();
    }));

    it('should debounce multiple calls', fakeAsync(() => {
      const control = new FormControl('');
      control.markAsDirty();
      const validator = service.emailUnique();

      // First call
      control.setValue('test1@example.com');
      validator(control);
      tick(300);

      // Second call before debounce completes
      control.setValue('test2@example.com');
      validator(control);
      tick(500);

      // Only the last call should make an HTTP request
      const req = httpMock.expectOne(`${API_URL}/users?email=test2@example.com`);
      req.flush([]);

      flush();
    }));

    it('should validate multiple different emails', fakeAsync(() => {
      const control = new FormControl('email1@example.com');
      control.markAsDirty();
      const validator = service.emailUnique();

      // First validation
      validator(control);
      tick(500);
      let req = httpMock.expectOne(`${API_URL}/users?email=email1@example.com`);
      req.flush([]);

      // Second validation with different email
      control.setValue('email2@example.com');
      validator(control);
      tick(500);
      req = httpMock.expectOne(`${API_URL}/users?email=email2@example.com`);
      req.flush([{ id: 1, email: 'email2@example.com' }]);

      flush();
    }));
  });

  describe('usernameUnique validator', () => {
    it('should return null for pristine control', fakeAsync(() => {
      const control = new FormControl('');
      const validator = service.usernameUnique();

      const result = validator(control);

      if (result instanceof Promise) {
        result.then((res) => expect(res).toBeNull());
      } else {
        result.subscribe((res) => expect(res).toBeNull());
      }

      tick(500);
    }));

    it('should return null for empty value', fakeAsync(() => {
      const control = new FormControl('');
      control.markAsDirty();
      const validator = service.usernameUnique();

      const result = validator(control);

      if (result instanceof Promise) {
        result.then((res) => expect(res).toBeNull());
      } else {
        result.subscribe((res) => expect(res).toBeNull());
      }

      tick(500);
    }));

    it('should return null when username matches excludeUsername', fakeAsync(() => {
      const control = new FormControl('currentuser');
      control.markAsDirty();
      const validator = service.usernameUnique('currentuser');

      const result = validator(control);

      if (result instanceof Promise) {
        result.then((res) => expect(res).toBeNull());
      } else {
        result.subscribe((res) => expect(res).toBeNull());
      }

      tick(500);
    }));

    it('should return usernameTaken error when username exists', fakeAsync(() => {
      const control = new FormControl('existinguser');
      control.markAsDirty();
      const validator = service.usernameUnique();

      const result = validator(control);

      tick(500);

      const req = httpMock.expectOne(`${API_URL}/users?username=existinguser`);
      expect(req.request.method).toBe('GET');
      req.flush([{ id: 1, username: 'existinguser' }]);

      if (result instanceof Promise) {
        result.then((res) => {
          expect(res).toEqual({ usernameTaken: true });
        });
      } else {
        result.subscribe((res) => {
          expect(res).toEqual({ usernameTaken: true });
        });
      }

      flush();
    }));

    it('should return null when username is unique', fakeAsync(() => {
      const control = new FormControl('uniqueuser');
      control.markAsDirty();
      const validator = service.usernameUnique();

      const result = validator(control);

      tick(500);

      const req = httpMock.expectOne(`${API_URL}/users?username=uniqueuser`);
      expect(req.request.method).toBe('GET');
      req.flush([]);

      if (result instanceof Promise) {
        result.then((res) => {
          expect(res).toBeNull();
        });
      } else {
        result.subscribe((res) => {
          expect(res).toBeNull();
        });
      }

      flush();
    }));

    it('should handle API errors gracefully', fakeAsync(() => {
      const control = new FormControl('testuser');
      control.markAsDirty();
      const validator = service.usernameUnique();

      const result = validator(control);

      tick(500);

      const req = httpMock.expectOne(`${API_URL}/users?username=testuser`);
      req.error(new ErrorEvent('Network error'));

      if (result instanceof Promise) {
        result.then((res) => {
          expect(res).toBeNull();
        });
      } else {
        result.subscribe((res) => {
          expect(res).toBeNull();
        });
      }

      flush();
    }));

    it('should debounce multiple calls', fakeAsync(() => {
      const control = new FormControl('');
      control.markAsDirty();
      const validator = service.usernameUnique();

      // First call
      control.setValue('user1');
      validator(control);
      tick(300);

      // Second call before debounce completes
      control.setValue('user2');
      validator(control);
      tick(500);

      // Only the last call should make an HTTP request
      const req = httpMock.expectOne(`${API_URL}/users?username=user2`);
      req.flush([]);

      flush();
    }));

    it('should handle special characters in username', fakeAsync(() => {
      const control = new FormControl('user_name-123');
      control.markAsDirty();
      const validator = service.usernameUnique();

      const result = validator(control);

      tick(500);

      const req = httpMock.expectOne(`${API_URL}/users?username=user_name-123`);
      req.flush([]);

      flush();
    }));

    it('should validate multiple different usernames', fakeAsync(() => {
      const control = new FormControl('username1');
      control.markAsDirty();
      const validator = service.usernameUnique();

      // First validation
      validator(control);
      tick(500);
      let req = httpMock.expectOne(`${API_URL}/users?username=username1`);
      req.flush([]);

      // Second validation with different username
      control.setValue('username2');
      validator(control);
      tick(500);
      req = httpMock.expectOne(`${API_URL}/users?username=username2`);
      req.flush([{ id: 1, username: 'username2' }]);

      flush();
    }));
  });

  describe('Edge Cases and Integration', () => {
    it('should handle rapid successive validations', fakeAsync(() => {
      const control = new FormControl('');
      control.markAsDirty();
      const validator = service.emailUnique();

      for (let i = 0; i < 5; i++) {
        control.setValue(`test${i}@example.com`);
        validator(control);
        tick(100);
      }

      tick(500);

      // Only the last validation should trigger HTTP request
      const req = httpMock.expectOne(`${API_URL}/users?email=test4@example.com`);
      req.flush([]);

      flush();
    }));

    it('should handle very long email addresses', fakeAsync(() => {
      const longEmail = 'a'.repeat(64) + '@' + 'b'.repeat(63) + '.com';
      const control = new FormControl(longEmail);
      control.markAsDirty();
      const validator = service.emailUnique();

      validator(control);
      tick(500);

      const req = httpMock.expectOne(`${API_URL}/users?email=${longEmail}`);
      req.flush([]);

      flush();
    }));

    it('should handle unicode characters in username', fakeAsync(() => {
      const unicodeUsername = 'user名前123';
      const control = new FormControl(unicodeUsername);
      control.markAsDirty();
      const validator = service.usernameUnique();

      validator(control);
      tick(500);

      const req = httpMock.expectOne(`${API_URL}/users?username=${unicodeUsername}`);
      req.flush([]);

      flush();
    }));
  });
});
