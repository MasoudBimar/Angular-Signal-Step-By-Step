# RxJS State Management

This document explains the small demonstration in `rxJs-state-management.ts` and shows the ideas behind using RxJS for local component state.

## Goals

- Demonstrate simple state containers using `BehaviorSubject`.
- Show how to derive values using `combineLatest` and `map`.
- Explain the use of `debounceTime(0)` to allow synchronous updates to complete before mapping.
- Illustrate safe state replacement (immutable updates) when switching configurations.

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

Why `debounceTime(0)`? In this example `switchOptions()` updates multiple subjects synchronously. `debounceTime(0)` yields control back to the event loop, allowing the whole synchronous update sequence to finish so the derived calculation runs once with the final state instead of multiple intermediate times.

### Immutable updates

When replacing the `options$` value, prefer creating a new plain object rather than mutating an existing one. This pattern is easier to reason about and composes well with change-detection strategies:

```ts
options$.next({ m: 'Magenta', y: 'Yellow', c: 'Cyan' });
selectedKey$.next('c');
```

### Subscriptions and cleanup

Avoid long-lived subscriptions on plain components without cleanup. Prefer using the `async` pipe in templates or ensure you unsubscribe when the component is destroyed (for example via `takeUntil` / `DestroyRef` / `onDestroy`). The demo subscribes to show console output; in production code prefer template-binding or managed teardown.

## Example (from `rxJs-state-management.ts`)

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

## Notes & Recommendations

- Prefer `async` pipe in templates rather than manual `subscribe` when possible.
- Use `debounceTime(0)` intentionally only when you need to collapse synchronous updates. For async sources you normally don't need it.
- When migrating to Angular Signals or combining signals with RxJS, consider `toSignal()` / `toObservable()` to bridge the models.

---

See the component `rxJs-state-management.ts` for the minimal runnable example that inspired this document.
