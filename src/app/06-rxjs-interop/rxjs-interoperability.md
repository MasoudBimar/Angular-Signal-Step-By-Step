# Angular Signals: RxJS Interoperability and Immutability

This lesson shows how Angular signals can work together with RxJS streams, and why signal states that contains arrays or objects should be updated immutably.

The example component uses:

- `signal()` for local component state.
- `toObservable()` to expose a signal as an RxJS `Observable`.
- RxJS operators such as `switchMap()` to react to signal changes.
- `toSignal()` to expose an Observable result back to the template as a signal.
- Immutable updates for array state stored inside a signal.

## Signal to Observable with `toObservable`

`toObservable()` converts a signal into an RxJS Observable.

Angular tracks the source signal with an internal effect. Whenever the signal value changes, the Observable emits the latest value. New subscribers also receive the current signal value.

```ts
import { signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

readonly number = signal(10);
readonly number$ = toObservable(this.number);
```

This is useful when you want to use RxJS operators with signal state.

```ts
import { switchMap } from 'rxjs';

readonly number = signal(10);
readonly number$ = toObservable(this.number);

readonly results$ = this.number$.pipe(
  switchMap((n) => this.api.getPrimeFactors(n))
);
```

In the component, every click updates the `number` signal:

```ts
increase() {
  this.number.update((n) => n + 1);
}

decrease() {
  this.number.update((n) => Math.max(n - 1, 3));
}
```

Because `number$` was created from `number`, each signal update flows into the RxJS pipeline and triggers a new API request for prime factors.

## Observable to Signal with `toSignal`

`toSignal()` converts an RxJS Observable into a signal.

It subscribes to the Observable, stores the latest emitted value, and updates the signal whenever the Observable emits again.

```ts
import { toSignal } from '@angular/core/rxjs-interop';

readonly primeFactors = toSignal(this.results$, {
  initialValue: [],
});
```

The template can then read the result like any other signal:

```html
<h1>Factors:</h1>
{{ primeFactors() }}
```

### Why `initialValue` Matters

Signals always have a current value, but Observables might not emit immediately.

Without an `initialValue`, the signal returned by `toSignal()` can be `undefined` until the first emission:

```ts
readonly data = toSignal(this.api.getData());
// Signal value type includes undefined.
```

Use `initialValue` when the Observable is asynchronous:

```ts
readonly data = toSignal(this.api.getData(), {
  initialValue: [],
});
```

Use `requireSync: true` only when the Observable is guaranteed to emit synchronously during subscription:

```ts
import { BehaviorSubject } from 'rxjs';

readonly count$ = new BehaviorSubject(0);

readonly count = toSignal(this.count$, {
  requireSync: true,
});
```

If `requireSync: true` is used with an Observable that does not emit immediately, Angular throws a runtime error.

## Injection Context

Both `toObservable()` and `toSignal()` need an Angular injection context by default. Angular uses that context to get cleanup services such as `DestroyRef`.

These are valid places to call them:

- A field initializer.
- A constructor.
- A factory function.
- Code wrapped with an explicitly provided `Injector`.

The component uses field initializers, so this works:

```ts
readonly number = signal(10);
readonly number$ = toObservable(this.number);

readonly primeFactors = toSignal(this.results$, {
  initialValue: [],
});
```

`ngOnInit()` is not an injection context. Calling `toObservable()` or `toSignal()` there without options causes an Angular injection-context error.

```ts
ngOnInit() {
  // This throws because ngOnInit is not an injection context.
  const number$ = toObservable(this.number);
}
```

Pass an `Injector` when creating RxJS interop values outside an injection context:

```ts
import { Component, Injector, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

export class RxJsInteroperability {
  private readonly injector = inject(Injector);
  readonly number = signal(10);

  ngOnInit() {
    const number$ = toObservable(this.number, {
      injector: this.injector,
    });
  }
}
```

The same option is available for `toSignal()`:

```ts
const value = toSignal(this.results$, {
  initialValue: [],
  injector: this.injector,
});
```

## Cleanup

By default, Angular cleans up:

- The effect created by `toObservable()`.
- The subscription created by `toSignal()`.

That cleanup happens when the creation context is destroyed, such as when the component is destroyed.

`toSignal()` also supports `manualCleanup: true`. Use it only when the Observable completes by itself and you intentionally do not want Angular to tie the subscription to the current destroy context.

```ts
readonly once = toSignal(this.api.getPrimeFactors(10), {
  initialValue: [],
  manualCleanup: true,
});
```

For component state, prefer the default automatic cleanup unless there is a clear reason to change it.

## Custom Equality with `toSignal`

`toSignal()` can receive an `equal` function. Angular uses it to decide whether a new Observable emission should update the signal.

```ts
readonly temperature = toSignal(this.temperature$, {
  initialValue: { value: 20 },
  equal: (previous, current) => previous.value === current.value,
});
```

This avoids unnecessary downstream updates when the emitted object is new but the meaningful data is unchanged.

## Signals and Immutability

Signals detect changes when their value is replaced with a new value. For primitives like `number`, `string`, and `boolean`, this is straightforward because primitive values are immutable.

```ts
readonly title = signal('Angular Signals');

rename() {
  this.title.set('RxJS Interop');
}
```

Arrays and objects are different. They are mutable references. If you mutate the existing array or object directly, Angular may not notify dependents because the signal still points to the same reference.

Avoid this:

```ts
readonly names = signal(['Alice', 'Bob', 'Charlie']);

addName() {
  this.names().push('Dana');
}
```

The array content changed, but the array reference did not.

Prefer immutable updates:

```ts
readonly names = signal(['Alice', 'Bob', 'Charlie']);

addName() {
  this.names.update((names) => [...names, 'Dana']);
}
```

The spread operator creates a new array reference, and the signal is updated with that new array.

## Common Immutable Array Updates

Add an item:

```ts
this.names.update((names) => [...names, 'Dana']);
```

Remove an item:

```ts
this.names.update((names) => names.filter((name) => name !== 'Bob'));
```

Replace an item:

```ts
this.names.update((names) =>
  names.map((name) => (name === 'Alice' ? 'Alicia' : name))
);
```

Sort without mutating the original array:

```ts
this.names.update((names) => [...names].sort());
```

## Immutable Object Updates

For object signals, create a new object instead of changing a property on the existing one.

Avoid this:

```ts
readonly user = signal({
  name: 'Alice',
  role: 'Admin',
});

updateRole() {
  this.user().role = 'Editor';
}
```

Prefer this:

```ts
updateRole() {
  this.user.update((user) => ({
    ...user,
    role: 'Editor',
  }));
}
```

For nested objects, replace each changed level:

```ts
readonly profile = signal({
  name: 'Alice',
  settings: {
    theme: 'light',
    notifications: true,
  },
});

enableDarkMode() {
  this.profile.update((profile) => ({
    ...profile,
    settings: {
      ...profile.settings,
      theme: 'dark',
    },
  }));
}
```

## Why Immutability Helps with Signals

Immutable updates make signal state predictable:

- The signal receives a new reference when data changes.
- Computed signals and effects can react reliably.
- Templates update consistently.
- RxJS pipelines built from signals receive clear state changes.
- Debugging is easier because old state is not silently modified.

Treat every array and object stored in a signal as read-only. Use `set()` or `update()` with a new value instead of mutating the current value in place.

## Full Flow from the Component

```ts
readonly number = signal(10);

readonly number$ = toObservable(this.number);

readonly results$ = this.number$.pipe(
  switchMap((n) => this.api.getPrimeFactors(n))
);

readonly primeFactors = toSignal(this.results$, {
  initialValue: [],
});
```

The flow is:

1. The user clicks `+` or `-`.
2. The `number` signal updates.
3. `number$` emits the latest number.
4. `switchMap()` calls the API with that number.
5. `results$` emits the prime factors.
6. `primeFactors` updates and the template renders the new value.

## References

- Angular `toObservable()` API: `https://angular.dev/api/core/rxjs-interop/toObservable`
- Angular `toSignal()` options: `https://angular.dev/api/core/rxjs-interop/ToSignalOptions`
- Angular signals guide: `https://angular.dev/guide/signals`
