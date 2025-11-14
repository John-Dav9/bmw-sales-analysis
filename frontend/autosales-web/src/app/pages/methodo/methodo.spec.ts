import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Methodo } from './methodo';

describe('Methodo', () => {
  let component: Methodo;
  let fixture: ComponentFixture<Methodo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Methodo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Methodo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
