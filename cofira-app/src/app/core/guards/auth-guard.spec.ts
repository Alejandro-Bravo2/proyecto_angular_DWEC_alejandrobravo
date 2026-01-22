import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth-guard';
import { AuthService } from '../auth/auth.service';

describe('authGuard', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    mockRouter = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/entrenamiento' } as RouterStateSnapshot;
  });

  it('should allow access when user is logged in', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBe(true);
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not logged in', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);
    const fakeUrlTree = {} as ReturnType<Router['createUrlTree']>;
    mockRouter.createUrlTree.and.returnValue(fakeUrlTree);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBe(fakeUrlTree);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/entrenamiento' },
    });
  });

  it('should pass correct return URL in query params', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);
    const fakeUrlTree = {} as ReturnType<Router['createUrlTree']>;
    mockRouter.createUrlTree.and.returnValue(fakeUrlTree);

    const customState = { url: '/seguimiento/personal' } as RouterStateSnapshot;
    TestBed.runInInjectionContext(() => authGuard(mockRoute, customState));

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/seguimiento/personal' },
    });
  });

  it('should call isLoggedIn on AuthService', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);

    TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(mockAuthService.isLoggedIn).toHaveBeenCalled();
  });
});
