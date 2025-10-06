import { ChangeDetectionStrategy, Component, computed, EventEmitter, Input, input, OnChanges, output, Output, signal } from '@angular/core';
import { RATES } from './rates';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, EMPTY, interval, map, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { outputFromObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currency-converter.component.html',
  styleUrl: './currency-converter.component.scss', 
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrencyConverterComponent {
  readonly manualRefresh$ = new BehaviorSubject<void>(undefined); // we need initial value for switchMap to work

  private readonly stop$ = new Subject<void>();
  stopRefresh() {
    this.stop$.next();
  }


  // refresh every 5 seconds or user clicks the refresh button
  readonly refreshRequired$ = this.manualRefresh$.pipe(
    switchMap(() => interval(5000).pipe(startWith(0))),
    map(() => {}),
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
