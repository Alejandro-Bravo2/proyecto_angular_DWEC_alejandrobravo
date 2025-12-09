import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutrientCounter } from './nutrient-counter';

describe('NutrientCounter', () => {
  let component: NutrientCounter;
  let fixture: ComponentFixture<NutrientCounter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NutrientCounter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutrientCounter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
