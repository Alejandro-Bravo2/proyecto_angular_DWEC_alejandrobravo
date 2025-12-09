import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseRow } from './exercise-row';

describe('ExerciseRow', () => {
  let component: ExerciseRow;
  let fixture: ComponentFixture<ExerciseRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseRow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExerciseRow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
