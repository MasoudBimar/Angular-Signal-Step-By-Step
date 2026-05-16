# RxJS State Management

- [RxJS State Management](#rxjs-state-management)
  - [Goals](#goals)
  - [Core Concepts](#core-concepts)
    - [BehaviorSubject as a local state holder](#behaviorsubject-as-a-local-state-holder)
    - [Deriving values with `combineLatest`](#deriving-values-with-combinelatest)
    - [Immutable updates](#immutable-updates)
    - [Subscriptions and cleanup](#subscriptions-and-cleanup)
  - [Example (from `1-rxjs-state-management.ts`)](#example-from-1-rxjs-state-managementts)
  - [Second Example `2-rxjs-state-management.ts`](#second-example-2-rxjs-state-managementts)
    - [Solution](#solution)
  - [Notes and Recommendations](#notes-and-recommendations)


This document explains the small demonstration in `rxjs-state-management.ts` and shows the ideas behind using RxJS for local component state.

## Goals

- Demonstrate simple state containers using `BehaviorSubject`.
- Show how to derive values using `combineLatest` and `map`.
- Explain the use of `debounceTime(0)` to allow synchronous updates to complete before mapping.
- Illustrate safe state replacement (immutable updates) when switching configurations.

Imagine there is a list of options (like color codes) and a selected option key. The component needs to display the human-readable value for the selected key based on the current options. When the options change (asynchronously), the selected key should update accordingly. 

## Core Concepts

### BehaviorSubject as a local state holder

Use `BehaviorSubject<T>` to hold a piece of state that has a current value and can be observed as an `Observable<T>`:

```ts
const options$ = new BehaviorSubject<Record<string, string>>({ r: 'Red', g: 'Green', b: 'Blue' });
```

`BehaviorSubject` is useful for component-local state because it exposes both the current value (via `getValue()` or the subject itself) and an observable stream for templates or downstream logic.

### Deriving values with `combineLatest`

When a value depends on multiple state sources, use `combineLatest` to derive a new observable:

```ts
const selectedValue$ = combineLatest([options$, selectedKey$]).pipe(
  // let the synchronous producer finish before we compute
  debounceTime(0),
  map(([options, key]) => options[key])
);
```

Why `debounceTime(0)`? In this example `switchOptions()` updates multiple subjects synchronously. 
`debounceTime(0)` yields control back to the event loop, allowing the whole synchronous update sequence to finish so the derived calculation runs once with the final state instead of multiple intermediate times.

```ts
  switchOptions() {
    this.options$.next({ 'm': 'Magneta', 'y': 'yellow', 'c': 'Cyan' });
    this.selectedKey$.next('c');
  }
```

### Immutable updates

When replacing the `options$` value, prefer creating a new plain object rather than mutating an existing one. This pattern is easier to reason about and composes well with change-detection strategies:

```ts
options$.next({ m: 'Magenta', y: 'Yellow', c: 'Cyan' });
selectedKey$.next('c');
```

### Subscriptions and cleanup

Avoid long-lived subscriptions on plain components without cleanup. Prefer using the `async` pipe in templates or ensure you unsubscribe when the component is destroyed (for example via `takeUntil` / `DestroyRef` / `onDestroy`). The demo subscribes to show console output; in production code prefer template-binding or managed teardown.

## Example (from `1-rxjs-state-management.ts`)

```ts
// options$ is a BehaviorSubject holding available options
// selectedKey$ is a BehaviorSubject holding the currently selected option key
// selectedValue$ derives the human-readable value from the other two

// switchOptions replaces the available options and updates the selected key
function switchOptions() {
  options$.next({ m: 'Magenta', y: 'Yellow', c: 'Cyan' });
  selectedKey$.next('c');
}
```

## Second Example `2-rxjs-state-management.ts`

This example discuss a sitiuation where a calculated async value depends on multiple pieces of state. In other hand we have some limitation for changing the state in case the calculated value exceeds some threshold.

`a$` and `b$` each store part of the state, while `sum$` is derived from both values:

```ts
readonly a$ = new BehaviorSubject<number>(1);
readonly b$ = new BehaviorSubject<number>(2);

readonly sum$ = combineLatest([this.a$, this.b$]).pipe(
  map(([a, b]) => a + b)
);
```

The intention of `incA()` is to increment `a$` only while the total `sum$` remains below `10`.

Bad way to implement this:

```ts
incA(){
  if(this.a$.value + this.b$.value < 10) { // duplicate logic and potential for stale reads
    this.a$.next(this.a$.value + 1); 
  }
}
```

Better way to implement this:

```ts
async incA() {
  const sum = await firstValueFrom(this.sum$);

  if (sum < 10) {
    this.a$.next(this.a$.value + 1);
  }
}
```

Because `sum$` is an observable, it does not expose a `.value` property like `BehaviorSubject` does. `firstValueFrom(sum$)` gives us the current derived value by creating a promise from the first emitted value.

The trap is that `await` splits the function into two phases. After the first phase yields, other code may run before the continuation resumes. By the time the `if (sum < 10)` check is used, `a$` or `b$` may already have changed, so the decision can be based on stale state.

### Solution

When several pieces of state must be checked and updated together, prefer keeping them in one state object and updating that object atomically. This is the same core idea used by Redux-style state management:

```ts
type CounterState = {
  a: number;
  b: number;
};

readonly state$ = new BehaviorSubject<CounterState>({ a: 1, b: 2 });

readonly sum$ = this.state$.pipe(
  map(({ a, b }) => a + b)
);

incA() {
  const state = this.state$.value;

  if (state.a + state.b < 10) {
    this.state$.next({
      ...state,
      a: state.a + 1,
    });
  }
}
```

Now the read and write happen synchronously against one source of truth, so the guard and the update stay aligned.

## Notes and Recommendations

- Prefer `async` pipe in templates rather than manual `subscribe` when possible.
- Use `debounceTime(0)` intentionally only when you need to collapse synchronous updates. For async sources you normally don't need it.
- When migrating to Angular Signals or combining signals with RxJS, consider `toSignal()` / `toObservable()` to bridge the models.

---

