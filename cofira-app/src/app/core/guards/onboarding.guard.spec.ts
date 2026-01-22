import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { onboardingGuard, skipIfOnboardedGuard } from './onboarding.guard';
import { AuthService } from '../auth/auth.service';

describe('onboardingGuard', () => {
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
    mockState = { url: '/entrenamiento' } as RouterStateSnapshot;
  });

  describe('onboardingGuard', () => {
    it('should allow access when user is not logged in (defer to authGuard)', () => {
      mockAuthService.isLoggedIn.and.returnValue(false);

      const result = TestBed.runInInjectionContext(() => onboardingGuard(mockRoute, mockState));

      expect(result).toBe(true);
      expect(mockAuthService.needsOnboarding).not.toHaveBeenCalled();
    });

    it('should allow access when user is logged in and onboarding complete', () => {
      mockAuthService.isLoggedIn.and.returnValue(true);
      mockAuthService.needsOnboarding.and.returnValue(false);

      const result = TestBed.runInInjectionContext(() => onboardingGuard(mockRoute, mockState));

      expect(result).toBe(true);
    });

    it('should redirect to onboarding when user needs onboarding', () => {
      mockAuthService.isLoggedIn.and.returnValue(true);
      mockAuthService.needsOnboarding.and.returnValue(true);
      const fakeUrlTree = {} as UrlTree;
      mockRouter.parseUrl.and.returnValue(fakeUrlTree);

      const result = TestBed.runInInjectionContext(() => onboardingGuard(mockRoute, mockState));

      expect(result).toBe(fakeUrlTree);
      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/onboarding');
    });
  });

  describe('skipIfOnboardedGuard', () => {
    it('should redirect to login when user is not logged in', () => {
      mockAuthService.isLoggedIn.and.returnValue(false);
      const fakeUrlTree = {} as UrlTree;
      mockRouter.parseUrl.and.returnValue(fakeUrlTree);

      const result = TestBed.runInInjectionContext(() => skipIfOnboardedGuard(mockRoute, mockState));

      expect(result).toBe(fakeUrlTree);
      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/login');
    });

    it('should redirect to home when user is logged in and onboarding complete', () => {
      mockAuthService.isLoggedIn.and.returnValue(true);
      mockAuthService.needsOnboarding.and.returnValue(false);
      const fakeUrlTree = {} as UrlTree;
      mockRouter.parseUrl.and.returnValue(fakeUrlTree);

      const result = TestBed.runInInjectionContext(() => skipIfOnboardedGuard(mockRoute, mockState));

      expect(result).toBe(fakeUrlTree);
      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/');
    });

    it('should allow access when user needs onboarding', () => {
      mockAuthService.isLoggedIn.and.returnValue(true);
      mockAuthService.needsOnboarding.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() => skipIfOnboardedGuard(mockRoute, mockState));

      expect(result).toBe(true);
    });
  });
});
