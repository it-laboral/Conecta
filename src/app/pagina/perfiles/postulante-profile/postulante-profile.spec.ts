import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostulanteProfile } from './postulante-profile';

describe('PostulanteProfile', () => {
  let component: PostulanteProfile;
  let fixture: ComponentFixture<PostulanteProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostulanteProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(PostulanteProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
