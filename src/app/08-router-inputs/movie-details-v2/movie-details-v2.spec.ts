import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieDetailsV2 } from './movie-details-v2';

describe('MovieDetailsV2', () => {
  let component: MovieDetailsV2;
  let fixture: ComponentFixture<MovieDetailsV2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieDetailsV2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieDetailsV2);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
