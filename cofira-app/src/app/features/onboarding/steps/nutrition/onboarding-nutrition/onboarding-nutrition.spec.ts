import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingNutrition } from './onboarding-nutrition';

describe('OnboardingNutrition', () => {
  let component: OnboardingNutrition;
  let fixture: ComponentFixture<OnboardingNutrition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingNutrition]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingNutrition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
