import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnDefFooter } from './column-def-footer';

describe('ColumnDefFooter', () => {
  let component: ColumnDefFooter;
  let fixture: ComponentFixture<ColumnDefFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnDefFooter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnDefFooter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
