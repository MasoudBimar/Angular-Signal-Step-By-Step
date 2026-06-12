import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { MoviesService } from '../services/movies.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatAnchor } from '@angular/material/button';

@Component({
  selector: 'app-movie-details-v2',
    imports: [RouterModule, CommonModule, MatCardModule, MatAnchor, AsyncPipe],
  templateUrl: './movie-details-v2.html',
  styleUrl: './movie-details-v2.scss',
})
export class MovieDetailsV2 {
  readonly route = inject(ActivatedRoute);
  readonly moviesService = inject(MoviesService);

  readonly id$ = this.route.params.pipe(
    map(params => Number(params['id']))
  );

  readonly movie$ = this.id$.pipe(
    map(id => this.moviesService.movies()
              .find(movie => movie.id === id)!)
  );

  readonly poster$ = this.movie$.pipe(
    map(movie => `movies/${movie.posterImage}`)
  );

  renderImagePlaceholder(event: Event): void {
    const image = event.target as HTMLImageElement;

    image.onerror = null; // prevents an infinite loop if placeholder also fails
    image.src = './images/image-placeholder.jpg';
  }
}
