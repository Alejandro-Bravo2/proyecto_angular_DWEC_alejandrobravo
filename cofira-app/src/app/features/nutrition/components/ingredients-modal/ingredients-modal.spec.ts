import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientsModal } from './ingredients-modal';

describe('IngredientsModal', () => {
  let component: IngredientsModal;
  let fixture: ComponentFixture<IngredientsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientsModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngredientsModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
