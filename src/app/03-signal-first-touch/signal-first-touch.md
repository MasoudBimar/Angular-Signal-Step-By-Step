# Signal First Touch

- [Signal First Touch](#signal-first-touch)
  - [Goals](#goals)
  - [1. A signal is read by calling it](#1-a-signal-is-read-by-calling-it)
  - [2. Why calling a signal in the template is different](#2-why-calling-a-signal-in-the-template-is-different)
  - [3. Writable signals](#3-writable-signals)
  - [4. Computed signals](#4-computed-signals)
  - [5. A minimal custom signal implementation](#5-a-minimal-custom-signal-implementation)
  - [6. Using the custom signal](#6-using-the-custom-signal)
  - [Key Ideas](#key-ideas)

This section introduces Angular signals from first principles: how to read them, how to update them, how computed signals derive values, and what the basic shape of a writable signal looks like under the hood.

## Goals

- Understand that a signal is read by calling it like a function.
- Learn how writable signals are created and updated.
- See how computed signals derive values from other signals.
- Build a tiny custom signal implementation to understand the core API shape.

## 1. A signal is read by calling it

A signal stores a value, but you read that value by calling the signal:

```ts
const firstSignal = signal(42);
const value = firstSignal();
```

The same idea appears in a template:

```html
<h1>First Signal Value {{ firstSignal() }}</h1>
```

In the first component example, the signal is created and read like this:

```ts
readonly firstSignal = signal(12);
readonly secondSignal = signal('signal');

constructor() {
  console.log('The first value is ', this.firstSignal());
}
```

## 2. Why calling a signal in the template is different

Normally, calling arbitrary functions from a template is discouraged because Angular change detection may execute them many times.

Signals are designed for this style of access. Instead of relying on broad automatic change detection, signal-based change detection can track which template reads depend on which signals and update only when those signals change. This model fits especially well with zoneless change detection.

## 3. Writable signals

A writable signal is created with `signal(initialValue)`. It is first and foremost a callable value container, but it also exposes methods for changing the value.

```ts
const firstSignal = signal(42);

// Read the current value
const value = firstSignal();

// Replace the value directly
firstSignal.set(43);

// Derive the next value from the previous one
firstSignal.update(value => value + 1);
```

The same pattern inside a component:

```ts
readonly firstSignal = signal(12);

setSignal() {
  this.firstSignal.set(10);
}

updateSignal() {
  this.firstSignal.update(value => value + 1);
}
```

## 4. Computed signals

A computed signal is read-only. You do not set it directly; it recalculates itself from other signals used inside its expression.

```ts
const firstSignal = signal(42);
const derived = computed(() => firstSignal() * 2);

const value = derived();
console.log('Derived Signal Value:', value);
```

When `firstSignal` changes, Angular knows that `derived` depends on it and recalculates the derived value when needed.

Computed signals are read the same way as writable signals:

```html
<h1>Derived Signal: {{ derived() }}</h1>
```

## 5. A minimal custom signal implementation

The folder also includes a tiny custom implementation that mirrors the basic shape of a writable signal.

A readable signal is simply a function that returns a value:

```ts
export type MySignal<T> = () => T;
```

A writable signal extends that callable function with `set` and `update` methods:

```ts
export type MyWriteableSignal<T> = MySignal<T> & {
  set(value: T): void;
  update(updater: (value: T) => T): void;
};
```

The implementation closes over the current value and exposes functions that update it:

```ts
export function mySignal<T>(value: T): MyWriteableSignal<T> {
  const result = () => value;

  result.set = (newValue: T) => value = newValue;
  result.update = (updater: (value: T) => T) => value = updater(value);

  return result;
}
```

This is not a full Angular signal implementation, but it reveals the important API idea: a signal can be both callable and writable.

## 6. Using the custom signal

The second example swaps Angular's `signal()` for the custom `mySignal()` while keeping the same usage pattern:

```ts
readonly firstSignal = mySignal(12);
readonly secondSignal = mySignal('signal');

setSignal() {
  this.firstSignal.set(10);
}

updateSignal() {
  this.firstSignal.update(value => value + 1);
}

constructor() {
  console.log('The first value is ', this.firstSignal());
}
```

## Key Ideas

- Signals are read by calling them: `count()`.
- Writable signals support both `set()` and `update()`.
- Computed signals are read-only values derived from other signals.
- Template calls are acceptable for signals because the framework can track those reads precisely.
