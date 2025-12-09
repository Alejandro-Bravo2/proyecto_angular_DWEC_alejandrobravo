import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrengthGainChart } from './strength-gain-chart';

describe('StrengthGainChart', () => {
  let component: StrengthGainChart;
  let fixture: ComponentFixture<StrengthGainChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StrengthGainChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StrengthGainChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
