import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressCard } from './progress-card';

describe('ProgressCard', () => {
  let component: ProgressCard;
  let fixture: ComponentFixture<ProgressCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
