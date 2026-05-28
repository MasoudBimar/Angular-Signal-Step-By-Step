# Change Detection in Angular

- [Change Detection in Angular](#change-detection-in-angular)
  - [Overview](#overview)
  - [How Change Detection Works](#how-change-detection-works)
    - [Default Change Detection Strategy](#default-change-detection-strategy)
    - [What triggers Change Detection with OnPush Strategy?](#what-triggers-change-detection-with-onpush-strategy)
    - [What triggers Change Detection with Default Strategy(zone-based)?](#what-triggers-change-detection-with-default-strategyzone-based)
  - [OnPush Change Detection Strategy](#onpush-change-detection-strategy)
  - [Triggers for OnPush Change Detection](#triggers-for-onpush-change-detection)
  - [Comparison: Default vs OnPush](#comparison-default-vs-onpush)
  - [Best Practices with Change Detection](#best-practices-with-change-detection)
  - [Why Use OnPush with Signals?](#why-use-onpush-with-signals)
  - [Key Takeaways](#key-takeaways)
  - [Things Changed in Angular 21](#things-changed-in-angular-21)
    - [Key Implications for Developers](#key-implications-for-developers)
      - [Before Angular 21 (Zone-based)](#before-angular-21-zone-based)
      - [Angular 21 (Zoneless + Signals)](#angular-21-zoneless--signals)
    - [Migration Benefits](#migration-benefits)
    - [Migration Challenges](#migration-challenges)
  - [Conclusion](#conclusion)
  - [Behavior Comparison: Variables vs Signals Across Strategies](#behavior-comparison-variables-vs-signals-across-strategies)
    - [Scenario Setup](#scenario-setup)
    - [Comprehensive Behavior Table](#comprehensive-behavior-table)

## Overview

Change Detection is a core mechanism in Angular that determines when and how the UI should be updated in response to application state changes. Angular provides two strategies for change detection: **Default** and **OnPush**.

---

## How Change Detection Works

When a change detection cycle runs, Angular checks all component properties and updates the template if values have changed. The key difference between the two strategies lies in **when** this checking happens.

### Default Change Detection Strategy

With the **Default** strategy, Angular runs change detection very frequently - essentially after any asynchronous operation completes. This is achieved through **Zone.js**, which intercepts and wraps all asynchronous operations.

- If one of them trigger a change on the template the CI check's all of them and all values will be updated
- If user trigger an angular event like (click) the same CI process will happen
- If there is a async pipe the pipe will trigger the change detection process

There are two categories of events or of occasions which cause the change detection to run when we're on OnPush
- When we use Angular's mechanisms such as inputs, outputs or events.
- Manullay call the change detector by runnign detectchanges() and that will happen as well.

### What triggers Change Detection with OnPush Strategy?

- Inputs
- Angular Events
- Trigger manually by change detector ref

Lets Imagine a scenario where we have a component with OnPush strategy and we have a setInterval that updates a variable every second, in this case the change detection will not run because there is no trigger for it.

So lets examine a three event that can trigger the change detection in this case:

1. We have a button in the template and we bind a click event to it, so when we click on the button the change detection will run because it's an angular event.
2. Wwe can call the change detector manually using `ChangeDetectorRef` by calling detectChanges() method and that will trigger the change detection as well.
3. If the component has an input and the parent component pass a new value to it, that will trigger the change detection as well.

```ts
 @component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>Counter: {{ counter }}</p>
    <button (click)="justNothing()">do nothing</button>
  `,
 })
 export class MyComponent {
  @Input() counter: any;

  constructor(private cdr: ChangeDetectorRef) {
    setInterval(() => {
      this.counter++; // This does NOT trigger change detection
      // To trigger it manually:
      // this.cdr.detectChanges();
    }, 1000);
  }
  justNothing() {
    // Clicking this DOES trigger change detection (Angular event)
  }
 }
```

### What triggers Change Detection with Default Strategy(zone-based)?

In the default strategy, Angular's Zone.js library "monkey-patches" browser APIs to notify the framework when the following occur:

- **User Events**: Any user interaction bound in a template, such as `click`, `submit`, `keydown`.
- **Asynchronous Requests**: Completion of network requests, such as those made via `HttpClient` (XHR).
- **Timers**: Execution of setTimeout() or setInterval() callbacks.
- **Promises/Observables**: The resolution of a Promise.then() or the emission of a value from a subscribed RxJS Observable.
- **Input Property Changes**: Whenever a parent component passes a new value (primitive or object reference) to a child via an @Input()

Seems like all the time, But how?

- setTimeout
- setInterval
- addEventHandler
- XHR.send
- Script file loaded
- Promise.then
- Promise.catch
- queueMicrotask

**Zone.js intercepts these operations:**

- Zone Js overload all functions that passed to queue to be executed a little bit later
- Zone Js attach prefix and postfix to these functions

```typescript
// All of these trigger change detection with Default strategy
setTimeout(() => {
  /* ... */
}, 1000);

setInterval(() => {
  /* ... */
}, 1000);

addEventListener('click', handler);

XMLHttpRequest.send();

Promise.then();

Promise.catch();

queueMicrotask(() => {
  /* ... */
});
```

**Example Component - Default Strategy:**

```typescript
import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval } from 'rxjs';

@Component({
  selector: 'app-change-detection-default',
  imports: [CommonModule],
  template: `
    <h1>Counter (async) = {{ counter$ | async }}</h1>
    <h2>Normal Counter = {{ normalCounter }}</h2>
    <h2>{{ calculateValue() }}</h2>
    <button (click)="justNothing()">do nothing</button>
  `,
  // Default strategy - checks everything frequently
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ChangeDetectionSampleDefault {
  readonly counter$ = interval(1000);
  protected normalCounter = 0;

  calculateValue() {
    console.log('Value is calculated');// This will be called very frequently, even when not needed
    return 42;
  }

  constructor() {
    // This triggers change detection automatically
    setInterval(() => {
      this.normalCounter++;
    }, 1000);
  }

  justNothing() {
    // Even though this does nothing,
    // clicking it still triggers change detection
  }
}
```

**How it works:**

- Zone.js wraps all async operations with zone enter/exit logic
- After each async operation completes, Zone.js notifies Angular
- Angular runs change detection for the entire component tree
- Template checks all bound properties (`normalCounter`, `calculateValue()`, etc.)
- If values changed, the DOM is updated

**Performance Consideration:** With Default strategy, `calculateValue()` might be called multiple times per second, even when values haven't actually changed.

---

## OnPush Change Detection Strategy

With **OnPush** strategy, Angular only runs change detection when one of these specific events occurs:

1. **An Input property reference changes** (new object/primitive value)
2. **An Angular event originates from the component** (like `(click)`)
3. **An observable emits via the async pipe**
4. **Manual trigger via ChangeDetectorRef.markForCheck()**
5. **Pure pipes** only re-run when their inputs change by reference (This works very well with OnPush since Angular doesn’t re-check everything)
6. **Async pipe** is almost always the best option for handling observables, because it:
   1. Subscribes/unsubscribes automatically
   2. Marks the component for check when new values come in (so you don’t need manual detection)

**Example Component - OnPush Strategy:**

```typescript
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval } from 'rxjs';

@Component({
  selector: 'app-change-detection-onpush',
  imports: [CommonModule],
  template: `
    <h1>Counter (async) = {{ counter$ | async }}</h1>
    <h2>Normal Counter = {{ normalCounter }}</h2>
    <h2>{{ calculateValue() }}</h2>
    <button (click)="justNothing()">do nothing</button>
  `,
  // OnPush strategy - only checks when necessary
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeDetectionSampleOnPush {
  readonly counter$ = interval(1000);
  protected normalCounter = 0;
  private readonly cdr = inject(ChangeDetectorRef);

  calculateValue() {
    console.log('Value is calculated');
    return 42;
  }

  constructor() {
    setInterval(() => {
      this.normalCounter++; // This does NOT trigger change detection
    }, 1000);

    setInterval(() => {
      this.cdr.detectChanges(); // Manually trigger change detection
    }, 3000);
  }

  justNothing() {
    // Clicking this DOES trigger change detection (Angular event)
  }
}
```

**What happens with OnPush:**

- `counter$` updates from the async pipe → **triggers change detection**
- `normalCounter` increments in setInterval → **does NOT trigger change detection**
- Click on button → **triggers change detection** (Angular event)
- Manual `detectChanges()` call → **triggers change detection**
- `calculateValue()` is only called when change detection actually runs

---

## Triggers for OnPush Change Detection

| Trigger             | Description                                     | Example                                        |
| ------------------- | ----------------------------------------------- | ---------------------------------------------- |
| **@Input() change** | When an input property receives a new reference | `@Input() user: User` receives a new object    |
| **Angular events**  | Click, submit, and other Angular-bound events   | `<button (click)="handler()">`                 |
| **Async pipe**      | When an observable/promise emits a new value    | `{{ data$ \| async }}`                         |
| **Manual trigger**  | Explicit call to ChangeDetectorRef methods      | `this.cdr.markForCheck()` or `detectChanges()` |

---

## Comparison: Default vs OnPush

| Feature                    | Default                             | OnPush                                 |
| -------------------------- | ----------------------------------- | -------------------------------------- |
| **Change Detection Runs**  | After every async operation         | Only on specific triggers              |
| **Performance**            | ⚠️ Can be slower with complex trees | ✅ More efficient                      |
| **calculateValue() calls** | Very frequently                     | Only when change detection runs        |
| **Observables**            | Need manual management              | Work seamlessly with async pipe        |
| **Best For**               | Simple apps, rapid prototyping      | Performance-critical apps, large trees |

---

## Best Practices with Change Detection

**1. Use OnPush for Better Performance**

```typescript
@Component({
  selector: 'app-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ... component definition
})
export class UserCardComponent {
  @Input() user!: User; // Only check when this changes
}
```

**2. Use Async Pipe with Observables**

```typescript
@Component({
  template: ` <div>
    <!-- Automatically triggers change detection -->
    <p>{{ userName$ | async }}</p>
  </div>`,
})
export class UserComponent {
  userName$ = this.userService.getUser().pipe(map((user) => user.name));

  constructor(private userService: UserService) {}
}
```

**3. Manual Detection When Needed**

```typescript
export class DataTableComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    // Subscribe outside of Angular zone
    this.dataService.data$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.data = data;
      // Manually trigger change detection
      this.cdr.markForCheck();
    });
  }
}
```

**4. Use Pure Pipes**

Pure pipes only re-evaluate when their inputs change by reference, which works perfectly with OnPush:

```typescript
@Pipe({
  name: 'uppercase',
  pure: true, // Default - only runs when input changes
})
export class UppercasePipe implements PipeTransform {
  transform(value: string): string {
    return value.toUpperCase();
  }
}
```

---

## Why Use OnPush with Signals?

Signals are designed to work perfectly with OnPush change detection:

```typescript
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';

@Component({
  selector: 'app-counter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>Count: {{ count() }}</p>
    <p>Doubled: {{ doubled() }}</p>
    <button (click)="increment()">+1</button>
  `,
})
export class CounterComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2);

  increment() {
    this.count.set(this.count() + 1); // Triggers change detection
  }
}
```

When a signal changes:

1. ✅ The component is automatically marked for check
2. ✅ Computed values are recalculated
3. ✅ Change detection runs efficiently
4. ✅ Only affected bindings in the template update

---

## Key Takeaways

- **Default strategy**: Change detection runs constantly → simpler but slower
- **OnPush strategy**: Change detection runs on-demand → faster and more predictable
- **Async pipe**: Best way to handle observables → automatic change detection
- **Signals**: Designed for OnPush → automatic component marking
- **ChangeDetectorRef**: Manual control when needed → `markForCheck()` or `detectChanges()`
- **Zone.js**: Powers the default change detection → intercepts all async operations

Choose OnPush with Signals for modern, performant Angular applications!

---

## Things Changed in Angular 21

Angular 21 introduces significant changes to change detection with the introduction of **Zoneless** mode and **Signals** as the default reactivity model. Here's how the landscape has shifted:

| Feature / Behavior                                                 | Pre-v21 (Zone-based)                                                                                                           | Angular 21 (Zoneless + Signals by default)                                                                                                                                                                  |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **What triggers change detection automatically**                   | Any async operation (timers like `setTimeout`, Promises, HTTP, DOM events) — because Zone.js patches them.                     | Only explicit/reactive triggers: signal updates, user-bound events, async-pipe output, manual calls (`markForCheck`, etc.), component input changes — no more "any async = CD".                             |
| **Default strategy semantics (`ChangeDetectionStrategy.Default`)** | Full tree check after every async operation — entire component tree is re-evaluated.                                           | Still supported — but now requires "notifications" (signal changes / events / manual marks) to trigger CD; no "magic" automatic detection from arbitrary async.                                             |
| **OnPush strategy semantics**                                      | Check only when component marked dirty: input changes, events, async-pipe, manual call. Reduces unnecessary checks vs Default. | Same semantics — still very relevant; OnPush often recommended (especially with signals) to maximize performance and avoid redundant checks.                                                                |
| **Reactivity model & state propagation**                           | Often mutable, imperative code + async + zone magic. Template updates rely on Zone to detect changes.                          | More explicit reactivity: Signals (immutable/functional-reactive) drive state; when a signal used in template changes, Angular knows exactly what to update. More predictable, performant, easier to trace. |
| **Bundle size, performance, runtime overhead**                     | Zone.js adds overhead, patches many APIs, runs CD often — may lead to redundant checks & performance cost for large apps.      | Zoneless + signals removes Zone.js overhead → smaller bundle, fewer redundant checks, more efficient change detection cycles.                                                                               |
| **Backward-compatibility / legacy code expectations**              | Many libraries and patterns expect Zone.js (async auto-CD, mutation-based state, etc.). Works out-of-the-box.                  | Some legacy code depending on Zone.js "magic" may break or behave unexpectedly — requires migration (signal adoption, explicit CD triggers, ensuring OnPush/triggering).                                    |

### Key Implications for Developers

#### Before Angular 21 (Zone-based)

```typescript
// Change detection was "magical" - any async would trigger it
@Component({
  template: `<p>Count: {{ count }}</p>`,
})
export class CounterComponent {
  count = 0;

  constructor() {
    setTimeout(() => {
      this.count++; // Automatically detected and updated
    }, 1000);
  }
}
```

#### Angular 21 (Zoneless + Signals)

```typescript
// More explicit - signals drive change detection
@Component({
  template: `<p>Count: {{ count() }}</p>`,
})
export class CounterComponent {
  count = signal(0);

  constructor() {
    setTimeout(() => {
      this.count.set(this.count() + 1); // Explicitly triggers CD
    }, 1000);
  }
}
```

### Migration Benefits

1. **Smaller Bundle**: No Zone.js overhead (~36KB gzipped)
2. **Better Performance**: No unnecessary change detection cycles
3. **Predictable Behavior**: Clear cause-and-effect for state updates
4. **Easier Debugging**: Signal dependencies are explicit and traceable
5. **Framework Interoperability**: Easier integration with non-Zone.js libraries

### Migration Challenges

- Legacy code relying on Zone.js "magic" needs updates
- Some third-party libraries may require adjustments
- Manual change detection management becomes more important
- Requires adoption of Signals throughout the application

---

## Conclusion

Angular 21's move to Zoneless mode and Signals represents a fundamental shift toward more predictable, performant, and maintainable applications. While it requires some migration effort for existing codebases, the benefits far outweigh the initial learning curve. Modern Angular development embraces explicit reactivity with Signals and OnPush change detection strategy for optimal performance! 🚀

---

## Behavior Comparison: Variables vs Signals Across Strategies

The table below demonstrates how different combinations of state management (plain variables vs signals), change detection strategies (Default vs OnPush), and zone modes (Zone.js vs Zoneless) affect template updates when a value changes every second via `setInterval`.

### Scenario Setup

Both scenarios update a value every second using `setInterval`:

```typescript
// Scenario 1: Plain Variable
counter = 0;

constructor() {
  setInterval(() => {
    this.counter++;  // Updates in memory
  }, 1000);
}

// Template
<p>{{ counter }}</p>
```

```typescript
// Scenario 2: Signal Variable
counter = signal(0);

constructor() {
  setInterval(() => {
    this.counter.set(this.counter() + 1);  // Explicit update
  }, 1000);
}

// Template
<p>{{ counter() }}</p>
```

### Comprehensive Behavior Table

| Scenario                            |                                        With Zone.js + Default                                         |                                                   With Zone.js + OnPush                                                   |                                      Zoneless + Default                                      |                    Zoneless + OnPush                     |
| ----------------------------------- | :---------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------: | :------------------------------------------------------: |
| **Plain Variable (interpolation)**  |                                            ✅ **Updates**                                             |                                                     ❌ **No Update**                                                      |                                       ❌ **No Update**                                       |                     ❌ **No Update**                     |
|                                     |         After `setInterval` fires, Zone.js triggers CD → template checks value → DOM updates          | `setInterval` doesn't trigger CD in OnPush without manual marking → template never re-checked → variable change invisible | Without Zone.js, no CD trigger from async → template never re-checked → variable stays stale |    No auto-trigger, no signal → variable stays stale     |
| **Signal Variable (function call)** |                                            ✅ **Updates**                                             |                                                      ✅ **Updates**                                                       |                                       ✅ **Updates**                                       |                      ✅ **Updates**                      |
|                                     | CD triggers after `setInterval` → template checks signal → signal marks component dirty → DOM updates |                   Signal change marks component for check → CD runs → signal re-evaluates → DOM updates                   |    Without Zone.js and no CD, signal still marks component but no one listens → no update    | Signal marks component for check → CD runs → DOM updates |

**Detailed Explanations**

1. Plain Variable + Zone.js + Default Strategy

**Result:** ✅ **Updates every second**

```typescript
// What happens:
setInterval(() => {
  this.counter++; // Plain variable updated
}, 1000);
// Zone.js detects the async operation
// → Angular runs change detection automatically
// → Template {{ counter }} is re-evaluated
// → DOM shows the new value
```

**Why it works:** Zone.js patches `setInterval`, so after each tick, change detection automatically runs and the template can see the updated plain variable.

---

2. Plain Variable + Zone.js + OnPush Strategy

**Result:** ❌ **No updates**

```typescript
// What happens:
setInterval(() => {
  this.counter++; // Plain variable updated
}, 1000);
// Zone.js detects the async operation
// → BUT OnPush says: "Only check on explicit triggers"
// → setInterval is not an explicit trigger (no @Input, no event, no signal)
// → Change detection does NOT run
// → Template never re-evaluates
// → Variable stays stale on screen
```

**Why it fails:** OnPush is strict—it ignores generic async operations. Without marking the component dirty manually, the template never re-checks.

---

3. Plain Variable + Zoneless + Default Strategy

**Result:** ❌ **No updates**

```typescript
// What happens:
setInterval(() => {
  this.counter++; // Plain variable updated
}, 1000);
// Without Zone.js, there's no automatic detection of async
// → No one tells Angular to run change detection
// → Template is never re-evaluated
// → Variable stays stale
```

**Why it fails:** Even though the strategy is "Default," without Zone.js there's no mechanism to know when an async operation completes.

---

4. Plain Variable + Zoneless + OnPush Strategy

**Result:** ❌ **No updates**

```typescript
// What happens:
setInterval(() => {
  this.counter++; // Plain variable updated
}, 1000);
// No Zone.js → no async detection
// OnPush is also waiting for explicit triggers
// → Double failure: neither mechanism triggers CD
// → Variable stays stale
```

**Why it fails:** Both CD triggers are disabled—Zone.js and OnPush explicit markers.

---

5. Signal + Zone.js + Default Strategy

**Result:** ✅ **Updates every second**

```typescript
// What happens:
setInterval(() => {
  this.counter.set(this.counter() + 1); // Signal updates
}, 1000);
// Zone.js detects the async operation
// → Change detection runs automatically
// → Template {{ counter() }} is re-evaluated
// → Signal function call returns new value
// → DOM updates
```

**Why it works:** Zone.js triggers CD, and signals seamlessly integrate—when CD runs, the signal provides the latest value.

---

6. Signal + Zone.js + OnPush Strategy

**Result:** ✅ **Updates every second**

```typescript
// What happens:
setInterval(() => {
  this.counter.set(this.counter() + 1); // Signal updates
}, 1000);
// Signal.set() internally marks the component for check
// → Even with OnPush, the component is marked
// → Change detection runs
// → Template {{ counter() }} re-evaluates to the new value
// → DOM updates
```

**Why it works:** Signals are "signal-aware"—they automatically mark the component dirty, triggering CD even with OnPush.

---

7. Signal + Zoneless + Default Strategy

**Result:** ✅ **Updates**

In zoneless mode, signals themselves are one of the mechanisms that schedule change detection for dependents; plain async like setInterval does not.

---

8. Signal + Zoneless + OnPush Strategy

**Result:** ✅ **Updates every second**

```typescript
// What happens:
setInterval(() => {
  this.counter.set(this.counter() + 1); // Signal updates
}, 1000);
// Signal marks the component for check (explicit marker)
// → OnPush respects this signal-based marking
// → Change detection runs
// → Template {{ counter() }} re-evaluates
// → DOM updates
```

**Why it works:** This is the **modern Angular 21 pattern**—signals are the explicit trigger mechanism that OnPush was designed for. No Zone.js needed; signals handle reactivity natively.

---

**Key Insights**

| Pattern                       | Works? | Why                             | Best For                            |
| ----------------------------- | :----: | ------------------------------- | ----------------------------------- |
| **Plain var + Zone/Default**  |   ✅   | Zone.js magic—catches all async | Legacy code, rapid prototyping      |
| **Plain var + OnPush**        |   ❌   | No explicit trigger             | N/A—avoid this combo                |
| **Plain var + Zoneless**      |   ❌   | No CD trigger mechanism         | N/A—use signals instead             |
| **Signal + Zone/Default**     |   ✅   | Zone.js + signal awareness      | Transition period                   |
| **Signal + Zone/OnPush**      |   ✅   | Signals mark component dirty    | Modern Angular with Zone.js         |
| **Signal + Zoneless/Default** |   ✅   | Signals drive all reactivity    | **Modern Angular 21 (recommended)** |
| **Signal + Zoneless/OnPush**  |   ✅   | Signals drive all reactivity    | **Modern Angular 21 (recommended)** |

**Recommendation**

For modern Angular 21+ applications:

```typescript
// ✅ Best Practice: Signals + Zoneless + OnPush
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Zoneless is configured in main.ts or bootstrapApplication
  template: `<p>Count: {{ count() }}</p>`,
})
export class MyComponent {
  count = signal(0);

  constructor() {
    setInterval(() => {
      this.count.set(this.count() + 1);
    }, 1000);
  }
}
```

This combination provides:

- ✅ Predictable reactivity (signals drive all updates)
- ✅ Minimal bundle size (no Zone.js)
- ✅ Best performance (no unnecessary change detection)
- ✅ Future-proof (aligned with Angular 21+ direction)
