import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarHome } from './registrar-home';

describe('RegistrarHome', () => {
  let component: RegistrarHome;
  let fixture: ComponentFixture<RegistrarHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarHome],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
