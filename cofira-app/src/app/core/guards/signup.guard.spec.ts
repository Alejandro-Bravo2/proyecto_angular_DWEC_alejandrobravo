import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { signupGuard } from './signup.guard';
import { AuthService } from '../auth/auth.service';

describe('signupGuard', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'needsOnboarding']);
    mockRouter = jasmine.createSpyObj('Router', ['parseUrl']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/register' } as RouterStateSnapshot;
  });

  it('should allow access when user is not logged in', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => signupGuard(mockRoute, mockState));

    expect(result).toBe(true);
    expect(mockRouter.parseUrl).not.toHaveBeenCalled();
  });

  it('should redirect to onboarding when logged in and needs onboarding', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);
    mockAuthService.needsOnboarding.and.returnValue(true);
    const fakeUrlTree = {} as UrlTree;
    mockRouter.parseUrl.and.returnValue(fakeUrlTree);

    const result = TestBed.runInInjectionContext(() => signupGuard(mockRoute, mockState));

    expect(result).toBe(fakeUrlTree);
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('/onboarding');
  });

  it('should redirect to home when logged in and onboarding is complete', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);
    mockAuthService.needsOnboarding.and.returnValue(false);
    const fakeUrlTree = {} as UrlTree;
    mockRouter.parseUrl.and.returnValue(fakeUrlTree);

    const result = TestBed.runInInjectionContext(() => signupGuard(mockRoute, mockState));

    expect(result).toBe(fakeUrlTree);
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('/');
  });

  it('should call isLoggedIn first', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);

    TestBed.runInInjectionContext(() => signupGuard(mockRoute, mockState));

    expect(mockAuthService.isLoggedIn).toHaveBeenCalled();
  });

  it('should only call needsOnboarding if user is logged in', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);

    TestBed.runInInjectionContext(() => signupGuard(mockRoute, mockState));

    expect(mockAuthService.needsOnboarding).not.toHaveBeenCalled();
  });
});
