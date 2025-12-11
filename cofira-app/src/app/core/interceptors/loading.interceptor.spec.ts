import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';
import { Observable, of, throwError, delay } from 'rxjs';

describe('LoadingInterceptor', () => {
  let loadingService: jasmine.SpyObj<LoadingService>;
  let mockRequest: HttpRequest<any>;
  let mockNext: HttpHandlerFn;

  beforeEach(() => {
    loadingService = jasmine.createSpyObj('LoadingService', ['show', 'hide']);

    TestBed.configureTestingModule({
      providers: [{ provide: LoadingService, useValue: loadingService }],
    });

    mockRequest = new HttpRequest('GET', '/api/test');
  });

  describe('Loading State Management', () => {
    it('should call show() before request starts', (done) => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe(() => {
          expect(loadingService.show).toHaveBeenCalled();
          done();
        });
      });
    });

    it('should call hide() after request completes successfully', (done) => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe(() => {
          expect(loadingService.hide).toHaveBeenCalled();
          done();
        });
      });
    });

    it('should call hide() after request fails', (done) => {
      const error = new Error('Request failed');
      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => error));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            expect(loadingService.hide).toHaveBeenCalled();
            done();
          },
        });
      });
    });

    it('should call show() exactly once per request', (done) => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe(() => {
          expect(loadingService.show).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    it('should call hide() exactly once per request', (done) => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe(() => {
          expect(loadingService.hide).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    it('should call show() before hide()', (done) => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));
      const callOrder: string[] = [];

      loadingService.show.and.callFake(() => callOrder.push('show'));
      loadingService.hide.and.callFake(() => callOrder.push('hide'));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe(() => {
          expect(callOrder).toEqual(['show', 'hide']);
          done();
        });
      });
    });
  });

  describe('Multiple Concurrent Requests', () => {
    it('should call show() for each concurrent request', (done) => {
      const mockNext1 = jasmine.createSpy('mockNext1').and.returnValue(of({} as HttpEvent<any>));
      const mockNext2 = jasmine.createSpy('mockNext2').and.returnValue(of({} as HttpEvent<any>));
      const mockNext3 = jasmine.createSpy('mockNext3').and.returnValue(of({} as HttpEvent<any>));

      let completedRequests = 0;
      const checkDone = () => {
        completedRequests++;
        if (completedRequests === 3) {
          expect(loadingService.show).toHaveBeenCalledTimes(3);
          done();
        }
      };

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext1).subscribe(() => checkDone());
        loadingInterceptor(mockRequest, mockNext2).subscribe(() => checkDone());
        loadingInterceptor(mockRequest, mockNext3).subscribe(() => checkDone());
      });
    });

    it('should call hide() for each concurrent request', (done) => {
      const mockNext1 = jasmine.createSpy('mockNext1').and.returnValue(of({} as HttpEvent<any>));
      const mockNext2 = jasmine.createSpy('mockNext2').and.returnValue(of({} as HttpEvent<any>));
      const mockNext3 = jasmine.createSpy('mockNext3').and.returnValue(of({} as HttpEvent<any>));

      let completedRequests = 0;
      const checkDone = () => {
        completedRequests++;
        if (completedRequests === 3) {
          expect(loadingService.hide).toHaveBeenCalledTimes(3);
          done();
        }
      };

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext1).subscribe(() => checkDone());
        loadingInterceptor(mockRequest, mockNext2).subscribe(() => checkDone());
        loadingInterceptor(mockRequest, mockNext3).subscribe(() => checkDone());
      });
    });

    it('should handle mix of successful and failed requests', (done) => {
      const mockNext1 = jasmine.createSpy('mockNext1').and.returnValue(of({} as HttpEvent<any>));
      const mockNext2 = jasmine
        .createSpy('mockNext2')
        .and.returnValue(throwError(() => new Error('Error')));
      const mockNext3 = jasmine.createSpy('mockNext3').and.returnValue(of({} as HttpEvent<any>));

      let completedRequests = 0;
      const checkDone = () => {
        completedRequests++;
        if (completedRequests === 3) {
          expect(loadingService.show).toHaveBeenCalledTimes(3);
          expect(loadingService.hide).toHaveBeenCalledTimes(3);
          done();
        }
      };

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext1).subscribe(() => checkDone());
        loadingInterceptor(mockRequest, mockNext2).subscribe({
          error: () => checkDone(),
        });
        loadingInterceptor(mockRequest, mockNext3).subscribe(() => checkDone());
      });
    });
  });

  describe('Different HTTP Methods', () => {
    it('should handle GET requests', (done) => {
      const getRequest = new HttpRequest('GET', '/api/users');
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(getRequest, mockNext).subscribe(() => {
          expect(loadingService.show).toHaveBeenCalled();
          expect(loadingService.hide).toHaveBeenCalled();
          done();
        });
      });
    });

    it('should handle POST requests', (done) => {
      const postRequest = new HttpRequest('POST', '/api/users', { name: 'Test' });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(postRequest, mockNext).subscribe(() => {
          expect(loadingService.show).toHaveBeenCalled();
          expect(loadingService.hide).toHaveBeenCalled();
          done();
        });
      });
    });

    it('should handle PUT requests', (done) => {
      const putRequest = new HttpRequest('PUT', '/api/users/1', { name: 'Updated' });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(putRequest, mockNext).subscribe(() => {
          expect(loadingService.show).toHaveBeenCalled();
          expect(loadingService.hide).toHaveBeenCalled();
          done();
        });
      });
    });

    it('should handle PATCH requests', (done) => {
      const patchRequest = new HttpRequest('PATCH', '/api/users/1', { name: 'Patched' });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(patchRequest, mockNext).subscribe(() => {
          expect(loadingService.show).toHaveBeenCalled();
          expect(loadingService.hide).toHaveBeenCalled();
          done();
        });
      });
    });

    it('should handle DELETE requests', (done) => {
      const deleteRequest = new HttpRequest('DELETE', '/api/users/1');
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(deleteRequest, mockNext).subscribe(() => {
          expect(loadingService.show).toHaveBeenCalled();
          expect(loadingService.hide).toHaveBeenCalled();
          done();
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should hide loading on HTTP error', (done) => {
      mockNext = jasmine
        .createSpy('mockNext')
        .and.returnValue(throwError(() => new Error('HTTP Error')));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            expect(loadingService.hide).toHaveBeenCalled();
            done();
          },
        });
      });
    });

    it('should hide loading on network error', (done) => {
      mockNext = jasmine
        .createSpy('mockNext')
        .and.returnValue(throwError(() => new Error('Network Error')));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            expect(loadingService.hide).toHaveBeenCalled();
            done();
          },
        });
      });
    });

    it('should hide loading on timeout error', (done) => {
      mockNext = jasmine
        .createSpy('mockNext')
        .and.returnValue(throwError(() => new Error('Timeout')));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            expect(loadingService.hide).toHaveBeenCalled();
            done();
          },
        });
      });
    });

    it('should not call hide() twice if error occurs', (done) => {
      mockNext = jasmine
        .createSpy('mockNext')
        .and.returnValue(throwError(() => new Error('Error')));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe({
          error: () => {
            expect(loadingService.hide).toHaveBeenCalledTimes(1);
            done();
          },
        });
      });
    });
  });

  describe('Response Handling', () => {
    it('should not modify response data', (done) => {
      const responseData = { id: 1, name: 'Test User', email: 'test@example.com' };
      const httpResponse = new HttpResponse({ body: responseData, status: 200 });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(httpResponse));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe((response: any) => {
          if (response.body) {
            expect(response.body).toEqual(responseData);
          }
          done();
        });
      });
    });

    it('should pass through all response events', (done) => {
      const httpResponse = new HttpResponse({ body: { data: 'test' }, status: 200 });
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(httpResponse));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe((response: any) => {
          expect(response).toEqual(httpResponse);
          done();
        });
      });
    });
  });

  describe('Timing and Performance', () => {
    it('should show loading before request is sent', () => {
      let showCalled = false;
      let nextCalled = false;

      loadingService.show.and.callFake(() => {
        showCalled = true;
        expect(nextCalled).toBe(false, 'show should be called before next');
      });

      mockNext = jasmine.createSpy('mockNext').and.callFake(() => {
        nextCalled = true;
        expect(showCalled).toBe(true, 'show should be called before next');
        return of({} as HttpEvent<any>);
      });

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe();
      });
    });

    it('should hide loading after response is received', (done) => {
      let responseReceived = false;

      mockNext = jasmine
        .createSpy('mockNext')
        .and.returnValue(of({} as HttpEvent<any>).pipe(delay(10)));

      loadingService.hide.and.callFake(() => {
        expect(responseReceived).toBe(true, 'Response should be received before hide');
      });

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe(() => {
          responseReceived = true;
          setTimeout(() => {
            expect(loadingService.hide).toHaveBeenCalled();
            done();
          }, 20);
        });
      });
    });
  });

  describe('Service Integration', () => {
    it('should inject LoadingService', (done) => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe(() => {
          expect(loadingService.show).toHaveBeenCalled();
          done();
        });
      });
    });

    it('should work with LoadingService methods', (done) => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe(() => {
          expect(loadingService.show).toHaveBeenCalled();
          expect(loadingService.hide).toHaveBeenCalled();
          done();
        });
      });
    });
  });

  describe('Observable Behavior', () => {
    it('should complete the observable after hiding loading', (done) => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe({
          complete: () => {
            expect(loadingService.hide).toHaveBeenCalled();
            done();
          },
        });
      });
    });

    it('should propagate errors after hiding loading', (done) => {
      const testError = new Error('Test Error');
      mockNext = jasmine.createSpy('mockNext').and.returnValue(throwError(() => testError));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe({
          error: (error) => {
            expect(loadingService.hide).toHaveBeenCalled();
            expect(error.message).toBe('Test Error');
            done();
          },
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty response', (done) => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(null as any));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe(() => {
          expect(loadingService.show).toHaveBeenCalled();
          expect(loadingService.hide).toHaveBeenCalled();
          done();
        });
      });
    });

    it('should handle undefined response', (done) => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of(undefined as any));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe(() => {
          expect(loadingService.show).toHaveBeenCalled();
          expect(loadingService.hide).toHaveBeenCalled();
          done();
        });
      });
    });

    it('should handle very fast requests', (done) => {
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(mockRequest, mockNext).subscribe(() => {
          expect(loadingService.show).toHaveBeenCalled();
          expect(loadingService.hide).toHaveBeenCalled();
          done();
        });
      });
    });
  });

  describe('Request URL Patterns', () => {
    it('should handle requests to internal API', (done) => {
      const internalRequest = new HttpRequest('GET', 'http://localhost:3000/api/users');
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(internalRequest, mockNext).subscribe(() => {
          expect(loadingService.show).toHaveBeenCalled();
          expect(loadingService.hide).toHaveBeenCalled();
          done();
        });
      });
    });

    it('should handle requests to external API', (done) => {
      const externalRequest = new HttpRequest('GET', 'https://api.external.com/data');
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(externalRequest, mockNext).subscribe(() => {
          expect(loadingService.show).toHaveBeenCalled();
          expect(loadingService.hide).toHaveBeenCalled();
          done();
        });
      });
    });

    it('should handle relative URLs', (done) => {
      const relativeRequest = new HttpRequest('GET', '/api/users');
      mockNext = jasmine.createSpy('mockNext').and.returnValue(of({} as HttpEvent<any>));

      TestBed.runInInjectionContext(() => {
        loadingInterceptor(relativeRequest, mockNext).subscribe(() => {
          expect(loadingService.show).toHaveBeenCalled();
          expect(loadingService.hide).toHaveBeenCalled();
          done();
        });
      });
    });
  });
});
