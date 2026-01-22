import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, NavigationEnd } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { OnboardingContainer } from './onboarding-container';

describe('OnboardingContainer', () => {
  let component: OnboardingContainer;
  let fixture: ComponentFixture<OnboardingContainer>;
  let router: Router;
  let activatedRoute: ActivatedRoute;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    routerEventsSubject = new Subject();

    await TestBed.configureTestingModule({
      imports: [OnboardingContainer],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          {
            path: 'onboarding',
            children: [
              { path: 'about', component: OnboardingContainer },
              { path: 'nutrition', component: OnboardingContainer },
              { path: 'goal', component: OnboardingContainer },
              { path: 'pricing', component: OnboardingContainer },
              { path: 'muscles', component: OnboardingContainer },
            ],
          },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingContainer);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);

    spyOnProperty(router, 'url').and.returnValue('/onboarding/about');
    spyOnProperty(router, 'events').and.returnValue(routerEventsSubject.asObservable());

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('deberia actualizar currentStepIndex cuando ocurre NavigationEnd', (done) => {
      component.currentStepIndex = 0;

      const navigationEndEvent = new NavigationEnd(1, '/onboarding/goal', '/onboarding/goal');

      setTimeout(() => {
        expect(component.currentStepIndex).toBe(2);
        done();
      }, 100);

      routerEventsSubject.next(navigationEndEvent);
    });

    it('deberia actualizar currentStepIndex con la URL inicial del router', () => {
      const originalUrl = router.url;
      Object.defineProperty(router, 'url', {
        get: () => '/onboarding/muscles',
        configurable: true,
      });

      component.ngOnInit();

      expect(component.currentStepIndex).toBe(4);

      Object.defineProperty(router, 'url', {
        get: () => originalUrl,
        configurable: true,
      });
    });
  });

  describe('updateCurrentStep', () => {
    it('deberia actualizar currentStepIndex cuando el path existe', () => {
      component['updateCurrentStep']('/onboarding/pricing');

      expect(component.currentStepIndex).toBe(3);
    });

    it('no deberia cambiar currentStepIndex cuando el path no existe', () => {
      component.currentStepIndex = 1;

      component['updateCurrentStep']('/onboarding/unknown');

      expect(component.currentStepIndex).toBe(1);
    });
  });

  describe('nextStep', () => {
    it('deberia navegar al siguiente paso cuando no es el ultimo', () => {
      const navigateSpy = spyOn(router, 'navigate');
      component.currentStepIndex = 1;

      component.nextStep();

      expect(component.currentStepIndex).toBe(2);
      expect(navigateSpy).toHaveBeenCalledWith(['goal'], { relativeTo: activatedRoute });
    });

    it('deberia mostrar mensaje de completado cuando es el ultimo paso', () => {
      const consoleSpy = spyOn(console, 'log');
      component.currentStepIndex = 4;

      component.nextStep();

      expect(component.currentStepIndex).toBe(4);
      expect(consoleSpy).toHaveBeenCalledWith('Onboarding complete!');
    });
  });

  describe('prevStep', () => {
    it('deberia navegar al paso anterior cuando no es el primero', () => {
      const navigateSpy = spyOn(router, 'navigate');
      component.currentStepIndex = 2;

      component.prevStep();

      expect(component.currentStepIndex).toBe(1);
      expect(navigateSpy).toHaveBeenCalledWith(['nutrition'], { relativeTo: activatedRoute });
    });

    it('no deberia cambiar el paso cuando ya es el primero', () => {
      const navigateSpy = spyOn(router, 'navigate');
      component.currentStepIndex = 0;

      component.prevStep();

      expect(component.currentStepIndex).toBe(0);
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('stepsForIndicator', () => {
    it('deberia devolver steps con indices 1-based', () => {
      const stepsParaIndicador = component.stepsForIndicator;

      expect(stepsParaIndicador.length).toBe(5);
      expect(stepsParaIndicador[0]).toEqual({ index: 1, label: 'Sobre ti' });
      expect(stepsParaIndicador[4]).toEqual({ index: 5, label: 'Grupos musculares' });
    });
  });
});
