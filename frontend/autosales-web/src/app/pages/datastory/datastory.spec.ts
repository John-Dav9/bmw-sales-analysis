import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Datastory } from './datastory';

describe('Datastory', () => {
  let component: Datastory;
  let fixture: ComponentFixture<Datastory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Datastory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Datastory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
