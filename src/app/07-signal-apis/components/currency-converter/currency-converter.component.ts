import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';
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
  takeUntil
} from 'rxjs';
import { RATES } from './rates';

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currency-converter.component.html',
  styleUrl: './currency-converter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyConverterComponent {
  readonly manualRefresh$ = new BehaviorSubject<void>(undefined); // we need initial value for switchMap to work

  private readonly stop$ = new Subject<void>();

  // outpoutfromObservable will take care of unsubscribing
  // but it emit new output every time the observable emit a new value
  // so we need to use another approach if we want to stop the output before the component is destroyed
  stopRefresh() {
    // use the stop subject to use in takeUntil
    // so when we call this method the stream of refreshRequired$ will complete
    this.stop$.next();
  }

  // refresh every 5 seconds or user clicks the refresh button
  readonly refreshRequired$ = this.manualRefresh$.pipe(
    switchMap(() => interval(5000).pipe(startWith(0))),
    map((): void => undefined),
    takeUntilDestroyed(),
    takeUntil(this.stop$)
  );

  // readonly refreshRequired = output<void>();
  readonly refreshRequired = outputFromObservable(this.refreshRequired$); // integrat output with observable

  readonly amount = input.required<number>();
  readonly currency = input.required<string>();

  readonly rate = computed(() => RATES[this.currency()]);
  readonly converted = computed(() => this.amount() * this.rate());
}
