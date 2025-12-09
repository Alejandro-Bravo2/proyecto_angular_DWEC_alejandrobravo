import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyTable } from './weekly-table';

describe('WeeklyTable', () => {
  let component: WeeklyTable;
  let fixture: ComponentFixture<WeeklyTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeeklyTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
