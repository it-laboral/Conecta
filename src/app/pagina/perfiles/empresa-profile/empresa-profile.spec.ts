import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpresaProfile } from './empresa-profile';

describe('EmpresaProfile', () => {
  let component: EmpresaProfile;
  let fixture: ComponentFixture<EmpresaProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpresaProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(EmpresaProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
