# Angular Signals - Step by Step (Angular 20)

This Nx workspace contains a set of small Angular applications that teach the new signal-based APIs, from change detection basics to `input()`, `output()`, `model()`, signal queries, and RxJS interop.

Each folder is a standalone app you can serve with Nx. Skim the summary below and jump into the app that matches what you want to learn.

## Prerequisites

- Node.js 18+
- A package manager (npm or pnpm)
- Install dependencies in the workspace root:
  - `npm install` or `pnpm install`

## How to run

Serve any app with Nx's dev server:

```sh
npx nx serve <projectName>
```

Examples:

```sh
npx nx serve change-detection
npx nx serve 02-rxjs-state-management
npx nx serve signal-first-touch
npx nx serve signal-preliminary-injection-context
npx nx serve signal-computed-effect
npx nx serve rxjs-interop
npx nx serve signal-apis
```

## Quick index

- AngularSignal (root app)
  - Serve: `npx nx serve AngularSignal`
- change-detection (01-change-detection)
  - Serve: `npx nx serve change-detection`
- 02-rxjs-state-management
  - Serve: `npx nx serve 02-rxjs-state-management`
- signal-first-touch (03-signal-first-touch)
  - Serve: `npx nx serve signal-first-touch`
- signal-preliminary-injection-context (04-signal-preliminary-injection-context)
  - Serve: `npx nx serve signal-preliminary-injection-context`
- signal-computed-effect (05-signal-computed-effect)
  - Serve: `npx nx serve signal-computed-effect`
- rxjs-interop (06-rxjs-interop)
  - Serve: `npx nx serve rxjs-interop`
- signal-apis (07-signal-apis)
  - Serve: `npx nx serve signal-apis`

List all projects and their targets:

```sh
npx nx show projects
```

## Learning path and examples

1) Change Detection essentials - Default vs OnPush

- Project: `change-detection`
- Learn how Zone.js triggers checks, what OnPush changes, and why async pipe is special.
- Files to read:
  - `01-change-detection/src/app/change-detection-sample-default.ts`
  - `01-change-detection/src/app/change-detection-sample-onpush.ts`

2) RxJS state management mindset

- Project: `02-rxjs-state-management`
- Prepare for signals by modeling state with `BehaviorSubject`, `combineLatest`, and debouncing.
- Files to read:
  - `02-rxjs-state-management/src/app/rxJs-state-management.ts`
  - `02-rxjs-state-management/src/app/rxJs-state-management-another-chanllenge.ts`

3) First touch with Signals

- Project: `signal-first-touch`
- Create and use writable signals; see a tiny custom signal implementation to grasp the core idea.
- Files to read:
  - `03-signal-first-touch/src/app/writable-signal.ts`
  - `03-signal-first-touch/src/app/signal-custom-implementation.ts`

4) Injection context and effects

- Project: `signal-preliminary-injection-context`
- Effects require an injection context; learn `inject()`, `DestroyRef`, and how to start/stop effects.
- Files to read:
  - `04-signal-preliminary-injection-context/src/app/how-to-use-effect.ts`
  - `04-signal-preliminary-injection-context/src/app/signal-and-injection.ts`
  - `04-signal-preliminary-injection-context/src/app/app.util.ts`

5) Computed and Effect best practices

- Project: `signal-computed-effect`
- Use `computed()` for pure, synchronous derivations and `effect()` for side effects (no signal writes inside effects).
- File to read:
  - `05-signal-computed-effect/src/app/nx-welcome.ts`

6) RxJS interop with Signals

- Project: `rxjs-interop`
- Bridge between signals and observables with `toObservable()` and `toSignal()`; note they require an injection context.
- File to read:
  - `06-rxjs-interop/src/app/nx-welcome.ts`

7) The new signal-based APIs (Angular 17+ / 20)

- Project: `signal-apis`
- Learn signal-first APIs you'll use daily:
  - Inputs: `input()`, `input.required<T>()`
  - Outputs: `output()`, `outputFromObservable()`
  - Two-way binding: `model()`, `model.required()` and the banana-in-a-box `[(model)]` syntax
  - Queries as signals: `viewChild`, `viewChildren`, `.required`, `contentChild`
  - `computed()` in directives and components
- Files to explore:
  - Currency converter using `computed()` and `outputFromObservable()`:
    - `07-signal-apis/src/app/components/currency-converter/currency-converter.component.ts`
    - `07-signal-apis/src/app/components/currency-converter/currency-converter.component.html`
  - Option selector using `input.required()`, `model()`, and `contentChild()` templating:
    - `07-signal-apis/src/app/components/option-selector/option-selector.component.ts`
    - `07-signal-apis/src/app/components/option-selector/option.directive.ts`
  - Signal host bindings in a directive:
    - `07-signal-apis/src/app/rgb.directive.ts`
  - Signal queries (`viewChild.required`, `viewChildren`) with effects:
    - `07-signal-apis/src/app/nx-welcome.ts`
  - DI with `inject()` and functional guard example:
    - `07-signal-apis/src/app/auth-guard.ts`

## Key takeaways and best practices

- computed()
  - Pure and synchronous only; do not perform async work or side effects
  - Do not create/modify other signals inside a computed

- effect()
  - For side effects; can be async; runs initially and on dependencies change
  - Requires injection context; you can pass `{ injector }` and manually destroy via the returned `EffectRef`
  - Avoid writing to signals inside effects unless updating unrelated state

- RxJS interop
  - `toObservable(signal)` mirrors a signal as an observable (uses a replay subject under the hood)
  - `toSignal(observable, { initialValue, injector })` mirrors an observable as a signal and handles cleanup

- Immutability with signals
  - For arrays/objects, prefer `update()` with new references (e.g., spreads, map/filter) to trigger change

## Useful Nx commands

```sh
# Serve an app
npx nx serve <projectName>

# Build an app
npx nx build <projectName>

# Run unit tests
npx nx test <projectName>

# Visualize the project graph
npx nx graph
```

Happy learning!

