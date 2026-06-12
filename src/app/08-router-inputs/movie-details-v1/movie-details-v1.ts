import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie.model';
import { MoviesService } from '../services/movies.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatAnchor } from '@angular/material/button';

@Component({
  selector: 'app-movie-details-v1',
  imports: [RouterModule, CommonModule, MatCardModule, MatAnchor],
  templateUrl: './movie-details-v1.html',
  styleUrl: './movie-details-v1.scss',
})
export class MovieDetailsV1 {
  route = inject(ActivatedRoute);
  movie: Movie | undefined;
  movieService = inject(MoviesService);

  constructor() {
    this.route.params.subscribe((params) => {
      let id = +params['id'];
      if (id) {
        this.movie = this.movieService.movies().find((movie) => movie.id === id);
      }
    });
  }

  renderImagePlaceholder(event: Event): void {
    const image = event.target as HTMLImageElement;

    image.onerror = null; // prevents an infinite loop if placeholder also fails
    image.src = './images/image-placeholder.jpg';
  }
}
