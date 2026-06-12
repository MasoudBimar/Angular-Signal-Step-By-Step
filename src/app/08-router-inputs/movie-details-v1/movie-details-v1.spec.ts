import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieDetailsV1 } from './movie-details-v1';

describe('MovieDetailsOld', () => {
  let component: MovieDetailsV1;
  let fixture: ComponentFixture<MovieDetailsV1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieDetailsV1]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieDetailsV1);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
