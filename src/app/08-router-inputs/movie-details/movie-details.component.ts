import { Component, computed, inject, input, numberAttribute } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MoviesService } from '../services/movies.service';
import { MatCardModule } from '@angular/material/card';
import { MatAnchor } from '@angular/material/button';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [RouterModule, CommonModule, MatCardModule, MatAnchor],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.scss',
})
export default class MovieDetailsComponent {
  readonly moviesService = inject(MoviesService);

  readonly id = input.required({ transform: numberAttribute });

  readonly movie = computed(() => this.moviesService.movies().find((mv) => mv.id === this.id()));

  readonly poster = computed(() => `movies/${this.movie()?.posterImage ?? ''}`);

  renderImagePlaceholder(event: Event): void {
    const image = event.target as HTMLImageElement;

    image.onerror = null; // prevents an infinite loop if placeholder also fails
    image.src = './images/image-placeholder.jpg';
  }
}
