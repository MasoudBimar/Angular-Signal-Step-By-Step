# Signal APIs

This lesson collects the Angular signal-based APIs.

- [Signal APIs](#signal-apis)
  - [Functional Guards](#functional-guards)
  - [Signal Inputs](#signal-inputs)
  - [Outputs New API](#outputs-new-api)
  - [Model Signals](#model-signals)
  - [View Queries](#view-queries)
  - [Content Queries](#content-queries)
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
> in previous angular api the `viewchild` should be used with `ngAfterViewInit` lifecycle hook to make sure that the view is initialized and the query result is available. but with the new signal-based API, the viewChild query can be accessed at any time, what is the proper way to access it?

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


## Content Queries

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
