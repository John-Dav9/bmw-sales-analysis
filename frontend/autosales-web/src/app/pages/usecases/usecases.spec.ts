import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Usecases } from './usecases';

describe('Usecases', () => {
  let component: Usecases;
  let fixture: ComponentFixture<Usecases>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Usecases]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Usecases);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
