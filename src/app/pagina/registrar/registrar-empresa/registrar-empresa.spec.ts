import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarEmpresa } from './registrar-empresa';

describe('RegistrarEmpresa', () => {
  let component: RegistrarEmpresa;
  let fixture: ComponentFixture<RegistrarEmpresa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarEmpresa],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarEmpresa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
