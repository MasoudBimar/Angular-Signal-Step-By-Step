import { CommonModule } from '@angular/common';
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MatAnchor } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { MoviesService } from './services/movies.service';

@Component({
  selector: 'app-router-inputs',
  imports: [RouterModule, CommonModule, MatCardModule, MatAnchor],
  template: `
    <h1>Welcome to {{ title }}!</h1>

    <section class="movies-container">
      @for (movie of moviesService.movies(); track movie.id) {
        <mat-card appearance="outlined" class="movie-card">
          <mat-card-header>
            <!-- <div mat-card-avatar class="example-header-image"></div> -->
            <mat-card-title>{{ movie.name }}</mat-card-title>
            <!-- <mat-card-subtitle></mat-card-subtitle> -->
          </mat-card-header>
          <img
            mat-card-image
            [src]="movie.posterImage"
            (error)="renderImagePlaceholder($event)"
            [alt]="movie.name"
          />
          <mat-card-content>
            <p>
              {{ movie.description }}
            </p>
          </mat-card-content>

          <mat-card-actions align="end">
            <a matButton [routerLink]="['/router-inputs/movie', movie.id]">{{ movie.name }}</a>
            <a matButton [routerLink]="['/router-inputs/movie-v1', movie.id]"> {{ movie.name }} v1 </a>
            <a matButton [routerLink]="['/router-inputs/movie-v2', movie.id]"> {{ movie.name }} v2 </a>
          </mat-card-actions>
        </mat-card>
      }
    </section>
  `,
  styles: `
    .movies-container {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: stretch;
    }

    .movie-card {
      flex: 1 1 300px;
      max-width: 360px;
    }
  `,
  encapsulation: ViewEncapsulation.None,
})
export class RouterInputs {
  title = 'Angular Router Inputs';
  moviesService = inject(MoviesService);

  renderImagePlaceholder(event: Event): void {
    const image = event.target as HTMLImageElement;

    image.onerror = null; // prevents an infinite loop if placeholder also fails
    image.src = './images/image-placeholder.jpg';
  }
}
