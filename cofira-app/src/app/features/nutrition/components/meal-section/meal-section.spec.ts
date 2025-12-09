import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealSection } from './meal-section';

describe('MealSection', () => {
  let component: MealSection;
  let fixture: ComponentFixture<MealSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
