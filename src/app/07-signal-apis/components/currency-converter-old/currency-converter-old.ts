import { CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RATES } from '../currency-converter/rates';

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
