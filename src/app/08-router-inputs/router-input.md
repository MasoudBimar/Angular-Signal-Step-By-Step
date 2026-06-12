# Angular Router, Route Params, and Signals

- [Angular Router, Route Params, and Signals](#angular-router-route-params-and-signals)
  - [Managing Router Behavior in `app.config`](#managing-router-behavior-in-appconfig)
  - [Navigating with `RouterLink`](#navigating-with-routerlink)
  - [Option 1: Manual `ActivatedRoute` Subscription](#option-1-manual-activatedroute-subscription)
  - [Option 2: Observable Route Params and `AsyncPipe`](#option-2-observable-route-params-and-asyncpipe)
  - [Option 3: Route Params as Signal Inputs](#option-3-route-params-as-signal-inputs)
  - [Fetching Async Data from a Route Param](#fetching-async-data-from-a-route-param)
  - [Reacting to Route Param Changes](#reacting-to-route-param-changes)
    - [Signal-first reaction](#signal-first-reaction)
    - [Observable reaction](#observable-reaction)
    - [Imperative reaction](#imperative-reaction)
  - [Handling Async Data in Templates](#handling-async-data-in-templates)
  - [Practical Rule](#practical-rule)
  - [References](#references)


This lesson uses the `08-router-inputs` samples to show three ways to connect Angular Router state to component state:

- `movie-details-v1`: read `ActivatedRoute.params` manually and assign a class property.
- `movie-details-v2`: keep route changes as RxJS streams and render them with `AsyncPipe`.
- `movie-details`: bind route params directly to signal inputs with `withComponentInputBinding()` and derive state with `computed()`.

The signal-input version is the preferred shape for simple route-driven component state. 
RxJS is still useful when the value is naturally a stream, such as HTTP requests, debounce flows, cancellation, polling, or composed async sources.

## Managing Router Behavior in `app.config`

Standalone Angular apps configure the router in `app.config.ts` with `provideRouter()`:

```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withHashLocation(),
      withComponentInputBinding(),
    ),
    provideZonelessChangeDetection(),
  ],
};
```

`provideRouter(routes, ...features)` installs router providers and accepts feature functions that change router behavior.

In this sample:

- `withHashLocation()` uses hash-based URLs, such as `#/router-inputs/movie/1`.
- `withComponentInputBinding()` lets route data bind directly to component inputs.
- `provideZonelessChangeDetection()` makes signal-driven state especially important because the app is not relying on Zone.js to patch async browser APIs.

Other router behavior can be configured with router feature functions. For example:

```ts
import { provideRouter, withRouterConfig } from '@angular/router';

provideRouter(
  routes,
  withRouterConfig({
    onSameUrlNavigation: 'reload',
    paramsInheritanceStrategy: 'always',
  }),
);
```

Use router configuration sparingly. Most route-param and async-data problems can be solved in the component with signals, RxJS, resolvers, or input binding.

## Navigating with `RouterLink`

The list component uses `routerLink` arrays to build detail URLs:

```html
<a matButton [routerLink]="['/router-inputs/movie', movie.id]">
  {{ movie.name }}
</a>
```

Because only the `id` route parameter changes, Angular may reuse the same component instance. The component must therefore react to parameter changes, not only read the initial value once.

## Option 1: Manual `ActivatedRoute` Subscription

`movie-details-v1` uses the classic style:

```ts
export class MovieDetailsV1 {
  route = inject(ActivatedRoute);
  movie: Movie | undefined;
  movieService = inject(MoviesService);

  constructor() {
    this.route.params.subscribe((params) => {
      const id = +params['id'];

      if (id) {
        this.movie = this.movieService.movies().find((movie) => movie.id === id);
      }
    });
  }
}
```

This works because `ActivatedRoute.params` emits again when the route parameter changes. Clicking previous or next updates the `movie` property while staying on the same component.

The downside is ownership of the subscription. This specific route stream is managed by Angular and is usually safe in routed components, but manual subscriptions do not scale well. In general app code, prefer one of these instead:

- Use `AsyncPipe` in the template.
- Use `toSignal()` for signal-based component state.
- Use `takeUntilDestroyed()` for imperative subscriptions that are really needed.

## Option 2: Observable Route Params and `AsyncPipe`

`movie-details-v2` keeps the route parameter and selected movie as streams:

```ts
export class MovieDetailsV2 {
  readonly route = inject(ActivatedRoute);
  readonly moviesService = inject(MoviesService);

  readonly id$ = this.route.params.pipe(
    map((params) => Number(params['id'])),
  );

  readonly movie$ = this.id$.pipe(
    map((id) => this.moviesService.movies().find((movie) => movie.id === id)!),
  );

  readonly poster$ = this.movie$.pipe(
    map((movie) => `movies/${movie.posterImage}`),
  );
}
```

The template unwraps the observable with `AsyncPipe`:

```html
@if (movie$ | async; as movie) {
  <mat-card appearance="outlined" class="movie-card">
    <mat-card-title>{{ movie.name }}</mat-card-title>
    <img mat-card-image [src]="poster$ | async" [alt]="movie.name" />
  </mat-card>
}
```

`AsyncPipe` subscribes for the template, returns the latest emitted value, marks the view for change detection when new values arrive, and unsubscribes when the component is destroyed.

For template code, prefer assigning the async value once:

```html
@if (movie$ | async; as movie) {
  <h2>{{ movie.name }}</h2>
  <img [src]="'movies/' + movie.posterImage" [alt]="movie.name" />
}
```

That avoids multiple subscriptions to related streams in the same template and keeps the data shape easier to read.

## Option 3: Route Params as Signal Inputs

The main `movie-details` sample uses the modern router input-binding style:

```ts
import { Component, computed, inject, input, numberAttribute } from '@angular/core';

export default class MovieDetailsComponent {
  readonly moviesService = inject(MoviesService);

  readonly id = input.required({ transform: numberAttribute });

  readonly movie = computed(() =>
    this.moviesService.movies().find((movie) => movie.id === this.id()),
  );
}
```

This works because the app enabled `withComponentInputBinding()` in `app.config.ts`. The route has a parameter named `id`, and the component has an input named `id`, so Angular binds the route parameter into the input.

Route parameters are strings. `numberAttribute` converts the incoming value to a number so the computed signal can compare it to `movie.id`.

The template reads the computed signal:

```html
@if (movie(); as movie) {
  <mat-card appearance="outlined" class="movie-card">
    <mat-card-title>{{ movie.name }}</mat-card-title>
    <img mat-card-image [src]="movie.posterImage" [alt]="movie.name" />
  </mat-card>
}
```

When the route changes from `/movie/1` to `/movie/2`, Angular updates the `id` input signal. Because `movie` is a `computed()` signal that reads `id()`, it recalculates automatically.

Use this style when:

- The component state is directly derived from route params, query params, matrix params, static data, or resolved data.
- The derived value can be computed synchronously from local state.
- You want a simple signal-first component without manual RxJS subscription code.

## Fetching Async Data from a Route Param

Real apps often fetch data from an API instead of a local signal array. In that case, keep the route parameter reactive and cancel old requests when the parameter changes.

RxJS version:

```ts
readonly id$ = this.route.paramMap.pipe(
  map((params) => Number(params.get('id'))),
);

readonly movie$ = this.id$.pipe(
  switchMap((id) => this.moviesApi.getMovie(id)),
);
```

Template:

```html
@if (movie$ | async; as movie) {
  <h2>{{ movie.name }}</h2>
}
```

`switchMap()` is important for request streams. If the user navigates from movie `1` to movie `2` before the first request finishes, `switchMap()` unsubscribes from the old request and keeps only the latest route param active.

Signal interop version:

```ts
readonly id$ = this.route.paramMap.pipe(
  map((params) => Number(params.get('id'))),
);

readonly movie = toSignal(
  this.id$.pipe(
    switchMap((id) => this.moviesApi.getMovie(id)),
  ),
  { initialValue: undefined },
);
```

Template:

```html
@if (movie(); as movie) {
  <h2>{{ movie.name }}</h2>
}
```

Use `toSignal()` when the component template and derived state are mostly signal-based, but the source is an Observable. Create the signal once and reuse it; do not call `toSignal()` repeatedly for the same Observable.

## Reacting to Route Param Changes

There are three common patterns:

### Signal-first reaction

Use `withComponentInputBinding()` and `computed()` when route params become component inputs:

```ts
readonly id = input.required({ transform: numberAttribute });
readonly movie = computed(() => this.moviesService.movies().find((movie) => movie.id === this.id()));
```

This is the cleanest option for synchronous derived state.

### Observable reaction

Use RxJS operators when route changes trigger async work:

```ts
readonly movie$ = this.route.paramMap.pipe(
  map((params) => Number(params.get('id'))),
  distinctUntilChanged(),
  switchMap((id) => this.moviesApi.getMovie(id)),
);
```

This is the cleanest option for data streams, cancellation, retries, debounce, and error handling.

### Imperative reaction

Use an explicit subscription only when you need an imperative side effect:

```ts
constructor() {
  this.route.paramMap
    .pipe(takeUntilDestroyed())
    .subscribe((params) => {
      console.log('route id changed', params.get('id'));
    });
}
```


## Handling Async Data in Templates

When the component exposes an Observable, use `AsyncPipe`:

```html
@if (movie$ | async; as movie) {
  <h2>{{ movie.name }}</h2>
} @else {
  <p>Loading...</p>
}
```

When the component exposes a signal, call the signal:

```html
@if (movie(); as movie) {
  <h2>{{ movie.name }}</h2>
} @else {
  <p>Loading...</p>
}
```

Avoid mixing both styles for the same value in the same component. Pick the shape at the component boundary:

- Observable boundary: expose `movie$` and use `AsyncPipe`.
- Signal boundary: expose `movie` and call `movie()`.


## Practical Rule

Use route input binding plus signals for route values that are just component inputs:

```ts
readonly id = input.required({ transform: numberAttribute });
readonly movie = computed(() => findMovie(this.id()));
```

Use RxJS for async streams driven by route values:

```ts
readonly movie$ = this.route.paramMap.pipe(
  map((params) => Number(params.get('id'))),
  switchMap((id) => this.moviesApi.getMovie(id)),
);
```

Use `AsyncPipe` for Observables in templates, and call signals directly for signal state.

## References

- Angular `provideRouter`: https://angular.dev/api/router/provideRouter
- Angular route input binding: https://angular.dev/guide/routing/common-router-tasks#getting-route-information
- Angular router configuration: https://angular.dev/guide/routing/customizing-route-behavior#router-configuration-options
- Angular `AsyncPipe`: https://angular.dev/api/common/AsyncPipe
- Angular RxJS and signals interop: https://angular.dev/ecosystem/rxjs-interop
