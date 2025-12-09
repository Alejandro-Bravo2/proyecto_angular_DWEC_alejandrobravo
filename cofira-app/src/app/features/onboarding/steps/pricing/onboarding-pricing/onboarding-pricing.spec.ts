import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingPricing } from './onboarding-pricing';

describe('OnboardingPricing', () => {
  let component: OnboardingPricing;
  let fixture: ComponentFixture<OnboardingPricing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingPricing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingPricing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
