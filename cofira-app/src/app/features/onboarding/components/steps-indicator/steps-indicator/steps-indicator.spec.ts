import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepsIndicator } from './steps-indicator';

describe('StepsIndicator', () => {
  let component: StepsIndicator;
  let fixture: ComponentFixture<StepsIndicator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepsIndicator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepsIndicator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
