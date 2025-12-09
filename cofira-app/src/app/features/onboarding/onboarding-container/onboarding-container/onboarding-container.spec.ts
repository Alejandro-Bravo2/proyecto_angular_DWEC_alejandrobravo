import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingContainer } from './onboarding-container';

describe('OnboardingContainer', () => {
  let component: OnboardingContainer;
  let fixture: ComponentFixture<OnboardingContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
