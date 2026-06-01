import { Component, Input, input } from '@angular/core';
import { outputFromObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, interval, map, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { RATES } from '../currency-converter/rates';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-currency-converter-old',
  imports: [CurrencyPipe],
  templateUrl: './currency-converter-old.html',
  styleUrl: './currency-converter-old.scss',
})
export class CurrencyConverterOld {
  @Input()
  amount: number = 0;
  @Input()
  currency: string ='USD';

  rate: number = 0;
  converted: number = 0;

  ngOnChanges() {
    this.rate = RATES[this.currency];
    this.converted = this.amount * this.rate;
  }
}
