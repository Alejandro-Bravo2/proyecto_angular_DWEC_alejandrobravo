import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingMuscles } from './onboarding-muscles';

describe('OnboardingMuscles', () => {
  let component: OnboardingMuscles;
  let fixture: ComponentFixture<OnboardingMuscles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingMuscles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingMuscles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
