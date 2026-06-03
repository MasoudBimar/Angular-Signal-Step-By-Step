# Signal APIs

This lesson collects the Angular signal-based APIs.

- [Signal APIs](#signal-apis)
  - [Functional Guards](#functional-guards)
  - [Signal Inputs](#signal-inputs)
  - [Outputs New API](#outputs-new-api)
  - [Model Signals](#model-signals)
  - [View Queries](#view-queries)
  - [Content Queries (content projection)](#content-queries-content-projection)
  - [Problem: Passing Html tags to a component](#problem-passing-html-tags-to-a-component)
    - [Solution 1 — `<ng-content>` (Basic, Angular-native)](#solution-1--ng-content-basic-angular-native)
    - [Solution 2 — `@Input() TemplateRef` (Flexible, explicit API)](#solution-2--input-templateref-flexible-explicit-api)
    - [Solution 3 — DOM Manipulation via `ElementRef`](#solution-3--dom-manipulation-via-elementref)
    - [Solution 4 — Directive + `@ContentChild` to capture `TemplateRef` (Recommended)](#solution-4--directive--contentchild-to-capture-templateref-recommended)
      - [Step 1 — Create the directive](#step-1--create-the-directive)
      - [Step 2 — Create the component](#step-2--create-the-component)
      - [Step 3 — Use in parent](#step-3--use-in-parent)
      - [Named multi-template variant](#named-multi-template-variant)
  - [Directive Host Bindings with Signals](#directive-host-bindings-with-signals)
  - [Outputs from Observables](#outputs-from-observables)
  - [Key Ideas](#key-ideas)
  - [References](#references)


## Functional Guards

The `inject()` function lets Angular code request dependencies without constructor injection. This is especially useful in functional APIs such as route guards.

Old class guard:

```ts
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn() {
    return true;
  }
}

export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  canActivate() {
    return this.auth.isLoggedIn();
  }
}
```

Functional guard:

```ts
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () =>
  inject(AuthService).isLoggedIn();
```

The same function-first style appears throughout many modern Angular component APIs:

> [!NOTE]
> Angular still uses decorators for declaring components and directives. The newer APIs shown here replace many member decorators, such as `@Input()` and `@ViewChild()`, with initializer functions that often return signals.

Old API:

```ts

export class OldComponent{
constructor(@Inject(SOME_NUMBER) private num: number){}
@Input({required: true}) title!: string;
}

```

> [!NOTE]
> Signal-based APIs are usually declared by calling initializer functions in class fields, not by putting decorators on class members.
> Signal values are read by calling the signal function, such as `currency()` or `amount()`.


New API:

```ts
readonly title = input.required<string>();
readonly selected = model.required<string>();
readonly child = viewChild(SomeChildComponent);
readonly projected = contentChild(SomeDirective);
```
> [!NOTE]
> With function based APIs we can Avoid unneccesary classes, have Less decorators and Less Lifecycle hooks

## Signal Inputs

`input()` creates a read-only signal for data passed from a parent component.

```ts

@Component({
  selector: 'app-currency-converter-without-signal',
  template: `{{ converted | currency : currency }}`,
})
export class CurrencyConverterOld {
  @Input()
  amount: number = 0;
  @Input()
  currency: string ='USD';

  @Input({ required: true }) requiredAmount!: number; // Non-null assertion for required input.

  rate: number = 0;
  converted: number = 0;

  ngOnChanges() {
    this.rate = RATES[this.currency];
    this.converted = this.amount * this.rate;
  }
}
```

> [!CAUTION]
> The old API requires `ngOnChanges()` to recalculate values when inputs change. also for required inputs we need to use non-null assertion or default values to avoid runtime errors (calming the typescript compiler down to not complain about not initializing the input).

Use `input.required<T>()` when the parent must provide the value. The returned signal does not include `undefined`, so the component can read it directly.

```ts
import { Component, computed, input } from '@angular/core';
import { RATES } from './rates';

@Component({
  selector: 'app-currency-converter',
  template: `{{ converted() | currency : currency() }}`,
})
export class CurrencyConverterComponent {
  readonly optionalAmount = input(0);
  readonly optionalCurrency = input('USD');

  // Required inputs are guaranteed by Angular once bindings are checked.
  readonly amount = input.required<number>();
  readonly currency = input.required<string>();

  // Computed signals recalculate when the input signals they read change.
  readonly rate = computed(() => RATES[this.currency()]);
  readonly converted = computed(() => this.amount() * this.rate());
}
```

The parent passes plain values into the child:

> [!WARNING]
> If the parent does not pass values for all required inputs, Angular reports a build-time template error.

```html
<app-currency-converter
  [amount]="amount.value!"
  [currency]="currency()"
/>
```

The parent reads its own `currency` signal with `currency()` because `[currency]` expects the current string value.

In this parent template, `amount` refers to the parent component's `FormControl`, not the child component's `amount` input signal. That is why the binding uses `amount.value!`. In production code, another option is to create the control as non-nullable so the binding can avoid the non-null assertion.

## Outputs New API

Angular's new output API uses the `output()` initializer instead of the `@Output()` decorator and `EventEmitter`.

Old API:

```ts
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-refresh-button',
  template: `<button type="button" (click)="refresh()">Refresh</button>`,
})
export class RefreshButtonComponent {
  @Output() refreshRequired = new EventEmitter<void>();

  refresh() {
    this.refreshRequired.emit();
  }
}
```

New API:

```ts
import { Component, output } from '@angular/core';

@Component({
  selector: 'app-refresh-button',
  template: `<button type="button" (click)="refresh()">Refresh</button>`,
})
export class RefreshButtonComponent {
  readonly refreshRequired = output<void>();

  refresh() {
    this.refreshRequired.emit();
  }
}
```

The parent listens to an `output()` exactly like it listened to an `@Output()`:

```html
<app-refresh-button (refreshRequired)="refreshData()" />
```

If the output emits a value, type it with a generic and read the value from `$event` in the parent:

```ts
import { Component, output } from '@angular/core';

@Component({
  selector: 'app-rating-picker',
  template: `
    <button type="button" (click)="select(1)">1</button>
    <button type="button" (click)="select(2)">2</button>
    <button type="button" (click)="select(3)">3</button>
  `,
})
export class RatingPickerComponent {
  readonly ratingSelected = output<number>();

  select(rating: number) {
    this.ratingSelected.emit(rating);
  }
}
```

```html
<app-rating-picker (ratingSelected)="saveRating($event)" />
```

`output()` returns an `OutputEmitterRef<T>`. You call `.emit()` to notify the parent. Unlike signals, outputs are not read with `()`, and they do not hold current state; they represent events.

Outputs can be aliased, but use aliases sparingly:

```ts
readonly changed = output<number>({ alias: 'valueChanged' });
```

```html
<app-rating-picker (valueChanged)="saveRating($event)" />
```

The alias only changes the template event name. TypeScript code still uses the class property name, such as `changed.emit(5)`.

Output Recap:

- `output()` can only be called in a component or directive property initializer.
- Output event names are case-sensitive.
- Custom Angular outputs do not bubble through the DOM.
- Avoid names that collide with native DOM events, such as `click` or `input`.
- Prefer `output()` for new code. The decorator-based `@Output() EventEmitter` API is still supported for existing code.

## Model Signals

`model()` creates a writable signal that also acts as an input and output pair. It is useful for custom two-way binding.

In `OptionSelectorComponent`, `selected` is a required model because the parent owns the selected currency:

```ts
import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-option-selector',
  templateUrl: './option-selector.component.html',
})
export class OptionSelectorComponent {
  readonly options = input.required<string[]>();

  // Required model: parent must bind a writable signal or value/output pair.
  readonly selected = model.required<string>();

  select(option: string) {
    // Updating the model updates the child and notifies the parent binding.
    this.selected.set(option);
  }
}
```

The parent can use banana-in-a-box syntax (and passing model without calling it):

```html
<app-option-selector
  [options]="currencies"
  [(selected)]="currency"
/>
```

With model binding, pass the signal instance, not the signal value. That is why the parent writes `[(selected)]="currency"` instead of `[(selected)]="currency()"`.

The same binding can be written manually:

```html
<app-option-selector
  [options]="currencies"
  [selected]="currency()"
  (selectedChange)="currency.set($event)"
/>
```

## View Queries

`viewChild()` and `viewChildren()` replace decorator-based view queries with signal-based queries.

```ts
import {
  Component,
  effect,
  ElementRef,
  ViewContainerRef,
  viewChild,
  viewChildren,
} from '@angular/core';
import { CurrencyConverterComponent } from './components/currency-converter/currency-converter.component';

@Component({
  template: `
    <div #myRef></div>
    <app-currency-converter [amount]="100" currency="GBP" />
  `,
})
export class SignalAPI {
  // Optional query: value is undefined until the component exists.
  readonly currencyConverter = viewChild(CurrencyConverterComponent);

  // Multiple queries always return an array signal.
  readonly currencyConverters = viewChildren(CurrencyConverterComponent);

  // Read ElementRef when you need the native element.
  readonly myRefDiv = viewChild('myRef', { read: ElementRef }); // read in view quiries tells angular what to expect to return

  // Read ViewContainerRef when you need an insertion point for views/components.
  readonly myRefContainer = viewChild('myRef', { read: ViewContainerRef });

  stopRefresh() {
    this.currencyConverter()?.stopRefresh();
    this.currencyConverters().forEach((converter) => converter.stopRefresh());
  }
}
```

> [!NOTE]
> In previous angular api the `viewchild` should be used with `ngAfterViewInit` lifecycle hook to make sure that the view is initialized and the query result is available. but with the new signal-based API, the viewChild query can be accessed at any time, what is the proper way to access it?

Use `viewChild.required()` only when the query result must exist. Required queries remove `undefined` from the signal type, but they do not make the result available earlier in the component lifecycle. If a required query is read before Angular has produced a result, Angular throws because no value is available yet.

> [!TIPS]
> We can call the viewChild after ngAfterViewInit lifecycle hook, but if we try to call it in the constructor it will throw an error because the view has not been created yet and the query result is not available.

```ts
readonly converter = viewChild.required(CurrencyConverterComponent);

constructor() {
  // Too early: the view has not been created yet.
  console.log(this.converter());
  // Raising error: "Required view query 'converter' did not find any matches."
}
```

An `effect()` can react when the query signal receives a value:

```ts
import { effect } from '@angular/core';

constructor() {
  effect(() => {
    // after examining this effect runs only after all the lifecycle hooks so the viewChild query is available and we can safely read it without worrying about the lifecycle.
    const converter = this.currencyConverter();

    if (converter) {
      console.log('Converter is available', converter);
    }
  });
}
```


## Content Queries (content projection)

`contentChild()` reads projected content as a signal. In this example, the option selector looks for an `appOption` structural directive that provides a custom option template.

```ts
import { Component, contentChild, input, model } from '@angular/core';
import { OptionDirective } from './option.directive';

@Component({
  selector: 'app-option-selector',
  templateUrl: './option-selector.component.html',
})
export class OptionSelectorComponent {
  readonly options = input.required<string[]>();
  readonly selected = model.required<string>();

  // contentChild tracks projected content and updates if that content changes.
  readonly templateDirective = contentChild(OptionDirective);
}
```

The directive stores the `TemplateRef` that should be rendered for each option:

```ts
import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appOption]',
  standalone: true,
})
export class OptionDirective {
  // TemplateRef represents the embedded template behind the structural directive.
  readonly template = inject(TemplateRef<string>);
}
```

The parent provides the template:

```html
<span *appOption="let currency" class="currency-option">
  <img [src]="'/icons/' + currency + '.svg'" alt="{{ currency }}" />
  {{ currency }}
</span>
```

The selector renders the custom template when it exists:

```html
@if (templateDirective(); as directive) {
  <ng-container
    *ngTemplateOutlet="directive.template; context: { $implicit: option }"
  />
} @else {
  {{ option }}
}
```




## Problem: Passing Html tags to a component

You have an Angular component and you want to **pass raw HTML tags between its opening and closing tags** (like you would with native HTML elements), then **render that content wherever you want** inside the component — not necessarily in a fixed slot.

```html
<!-- You want this to work naturally -->
<app-card>
  <h2>Title</h2>
  <p>Some paragraph</p>
  <button>Click me</button>
</app-card>
```

The challenge is gaining **programmatic control** over where and how that content renders, rather than just dropping it in a fixed `<ng-content>` slot.

---

### Solution 1 — `<ng-content>` (Basic, Angular-native)

The simplest built-in Angular mechanism. The projected content lands exactly where you place `<ng-content>`.

**Parent:**
```html
<app-card>
  <h2>Title</h2>
  <p>Some content</p>
</app-card>
```

**Child component template:**
```html
<div class="card">
  <ng-content></ng-content>
</div>
```

**Multi-slot variant** — project into named regions using `select`:

```html
<!-- Parent -->
<app-card>
  <h2 slot="header">My Title</h2>
  <p slot="body">My body</p>
</app-card>

<!-- Child template -->
<div class="card">
  <div class="card-header">
    <ng-content select="[slot=header]"></ng-content>
  </div>
  <div class="card-body">
    <ng-content select="[slot=body]"></ng-content>
  </div>
</div>
```

**Limitations:** You cannot conditionally render, duplicate, or programmatically reposition the content. The slot is fixed at compile time.

---

### Solution 2 — `@Input() TemplateRef` (Flexible, explicit API)

Pass an `<ng-template>` as an `@Input()`. The component receives a `TemplateRef` and can render it anywhere, conditionally, or multiple times.

**Parent:**
```html
<ng-template #myTpl let-item>
  <strong>{{ item.name }}</strong>
</ng-template>

<app-list [itemTemplate]="myTpl" [items]="data"></app-list>
```

**Child component:**
```typescript
@Component({
  selector: 'app-list',
  template: `
    <ul>
      @for (item of items; track item.id) {
        <li>
          <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: item }">
          </ng-container>
        </li>
      }
    </ul>
  `
})
export class ListComponent {
  @Input() itemTemplate!: TemplateRef<any>;
  @Input() items: any[] = [];
}
```

**Limitations:** Requires the consumer to wrap their HTML inside `<ng-template>`, which is more verbose.

---

### Solution 3 — DOM Manipulation via `ElementRef` 

Access the raw child nodes projected onto the host element and manually move them into a target container. No `<ng-content>` needed.

**Child component:**
```typescript
@Component({
  selector: 'app-card',
  template: `<div #container class="card-body"></div>`
})
export class CardComponent implements AfterContentInit {
  @ViewChild('container') container!: ElementRef;
  private host= inject(ElementRef);

  ngAfterContentInit() {
    const children = Array.from(this.host.nativeElement.childNodes) as Node[];

    children.forEach(node => {
      this.container.nativeElement.appendChild(node);
    });
  }
}
```

**Parent:**

```html
<app-card>
  <h2>Title</h2>
  <p>Paragraph</p>
  <button>Click me</button>
</app-card>
```

**How it works:** Before Angular's `<ng-content>` claims them, the projected tags live on the host element's `childNodes`. You grab them and `appendChild` them wherever you want.

**Limitations:** Bypasses Angular's change detection. DOM nodes moved this way are no longer part of Angular's rendering tree, so bindings (`{{ }}`, `[prop]`, `(event)`) on the projected content may break.

---

### Solution 4 — Directive + `@ContentChild` to capture `TemplateRef` (Recommended)

The consumer wraps their HTML in `<ng-template>` and applies a custom directive. The component reads the `TemplateRef` via `@ContentChild` and renders it wherever it wants.

#### Step 1 — Create the directive

```typescript
import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appTemplate]',
  standalone: true
})
export class TemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}
```

#### Step 2 — Create the component

```typescript
import { Component, ContentChild, AfterContentInit } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TemplateDirective } from './template.directive';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgTemplateOutlet, TemplateDirective],
  template: `
    <div class="card">
      <ng-container *ngTemplateOutlet="templateDir.templateRef"></ng-container>
    </div>
  `
})
export class CardComponent implements AfterContentInit {
  @ContentChild(TemplateDirective) templateDir!: TemplateDirective;

  ngAfterContentInit() {
    console.log('Got template:', this.templateDir.templateRef);
  }
}
```

#### Step 3 — Use in parent

```html
<app-card>
  <ng-template appTemplate>
    <h2>Title</h2>
    <p>My paragraph</p>
    <button>Click</button>
  </ng-template>
</app-card>
```

#### Named multi-template variant

Extend the directive with an `@Input` to support multiple named slots:

```typescript
@Directive({ selector: '[appTemplate]', standalone: true })
export class TemplateDirective {
  @Input('appTemplate') name!: string; // e.g. 'header' | 'body' | 'footer'
  constructor(public templateRef: TemplateRef<any>) {}
}
```

```typescript
// In the component class
@ContentChildren(TemplateDirective) templates!: QueryList<TemplateDirective>;

headerTemplate!: TemplateRef<any>;
bodyTemplate!: TemplateRef<any>;

ngAfterContentInit() {
  this.templates.forEach(t => {
    if (t.name === 'header') this.headerTemplate = t.templateRef;
    if (t.name === 'body')   this.bodyTemplate   = t.templateRef;
  });
}
```

```html
<!-- Parent -->
<app-card>
  <ng-template appTemplate="header">
    <h2>Header content</h2>
  </ng-template>
  <ng-template appTemplate="body">
    <p>Body content</p>
  </ng-template>
</app-card>

<!-- Child template -->
<div class="card">
  <div class="header">
    <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
  </div>
  <div class="body">
    <ng-container *ngTemplateOutlet="bodyTemplate"></ng-container>
  </div>
</div>
```

## Directive Host Bindings with Signals

`RgbDirective` uses signal inputs for RGB values, a writable signal for local state, and a computed signal for the final color.

The directive host metadata binds directly to the computed signal:

```ts
import { computed, Directive, input, signal } from '@angular/core';

@Directive({
  selector: '[appRgb]',
  standalone: true,
  host: {
    '[style.color]': 'color()',
    '(click)': 'invert()',
  },
})
export class RgbDirective {
  readonly red = input(0);
  readonly green = input(0);
  readonly blue = input(0);

  // Local UI state owned by the directive.
  readonly inverted = signal(false);

  // The host style depends on all RGB inputs and the local inverted state.
  readonly color = computed(() =>
    this.inverted()
      ? `rgb(${255 - this.red()}, ${255 - this.green()}, ${255 - this.blue()})`
      : `rgb(${this.red()}, ${this.green()}, ${this.blue()})`
  );

  invert() {
    this.inverted.update((value) => !value);
  }
}
```

Usage:

```html
<h1 appRgb [red]="30" [green]="150" [blue]="30">
  Currency Converter
</h1>
```

Prefer host metadata for signal-driven host bindings. It keeps the binding declarative and avoids manual effect code just to copy a signal value into a class field.

## Outputs from Observables

`outputFromObservable()` creates an Angular output from an RxJS Observable. Angular subscribes and stops forwarding values when the component is destroyed.

The currency converter emits `refreshRequired` every five seconds and after manual refresh clicks:

```ts
import {
  outputFromObservable,
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  interval,
  map,
  startWith,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';

export class CurrencyConverterComponent {
  readonly manualRefresh$ = new BehaviorSubject<void>(undefined);
  private readonly stop$ = new Subject<void>();

  readonly refreshRequired$ = this.manualRefresh$.pipe(
    // Restart the timer whenever the user manually requests refresh.
    switchMap(() => interval(5000).pipe(startWith(0))),
    map((): void => undefined),
    takeUntilDestroyed(),
    takeUntil(this.stop$)
  );

  // Observable emissions become component output events.
  readonly refreshRequired = outputFromObservable(this.refreshRequired$);

  stopRefresh() {
    this.stop$.next();
  }
}
```

The parent listens to it like any other output:

```html
<app-currency-converter
  [amount]="amount.value!"
  [currency]="currency()"
  (refreshRequired)="refreshData()"
/>
```

Use `output()` when the component emits imperatively with `.emit()`. Use `outputFromObservable()` when the event source is already an RxJS stream. `outputFromObservable()` only forwards `next` values; handle observable errors yourself with RxJS operators such as `catchError` when needed.



## Key Ideas

- Signal-based APIs are usually declared by calling initializer functions in class fields, not by putting decorators on class members.
- Signal values are read by calling the signal function, such as `currency()` or `amount()`.
- `input()` is read-only from inside the receiving component.
- `model()` is writable and supports two-way binding.
- `viewChild()` and `contentChild()` return signals, so query values can be used reactively.
- `outputFromObservable()` connects RxJS streams to Angular output events.
- `inject()` makes functional guards and field-level dependency access straightforward.

## References

- Angular signals guide: `https://angular.dev/guide/signals`
- Angular `input()` API: `https://angular.dev/api/core/input`
- Angular `model()` API: `https://angular.dev/api/core/model`
- Angular `viewChild()` API: `https://angular.dev/api/core/viewChild`
- Angular `contentChild()` API: `https://angular.dev/api/core/contentChild`
- Angular outputs guide: `https://angular.dev/guide/components/outputs`
- Angular `output()` API: `https://angular.dev/api/core/output`
- Angular output RxJS interop guide: `https://angular.dev/ecosystem/rxjs-interop/output-interop`
- Angular `outputFromObservable()` API: `https://angular.dev/api/core/rxjs-interop/outputFromObservable`
- Angular dependency injection guide: `https://angular.dev/guide/di`
