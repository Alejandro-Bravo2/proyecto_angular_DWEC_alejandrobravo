import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingGoal } from './onboarding-goal';

describe('OnboardingGoal', () => {
  let component: OnboardingGoal;
  let fixture: ComponentFixture<OnboardingGoal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingGoal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingGoal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
