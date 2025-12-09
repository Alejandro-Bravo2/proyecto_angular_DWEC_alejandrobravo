import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingAbout } from './onboarding-about';

describe('OnboardingAbout', () => {
  let component: OnboardingAbout;
  let fixture: ComponentFixture<OnboardingAbout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingAbout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingAbout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
