import { Component, signal, viewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RgbDirective } from './rgb.directive';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { OptionDirective } from './components/option-selector/option.directive';
import { OptionSelectorComponent } from './components/option-selector/option-selector.component';
import { CurrencyConverterComponent } from './components/currency-converter/currency-converter.component';
import { RATES } from './components/currency-converter/rates';

@Component({
  selector: 'app-nx-welcome',
  imports: [CommonModule,
    RouterOutlet,
    CurrencyConverterComponent,
    ReactiveFormsModule,
    OptionSelectorComponent,
    OptionDirective,
    RgbDirective
  ],
  template: `
<h1 
  appRgb [red]="30" [green]="150" [blue]="30"
  >Currency Converter</h1>
<label for="amount">Amount</label>
<input id="amount" type="number" [formControl]="amount" />

<span id="currency-label">Currency</span>

<app-option-selector 
  aria-labelledby="currency-label"
  [options]="currencies" 
  [(selected)]="currency">
  <!-- we dont call the model signal in this case -->

  <span *appOption="let currency" class="currency-option">
    <img [src]="'/icons/' + currency + '.svg'" alt="{{ currency }}" class="currency-icon"/>
    {{ currency }}
  </span>

</app-option-selector>

<app-currency-converter
  [amount]="amount.value!"
  [currency]="currency()"
  (refreshRequired)="refreshData()"
/>

<button (click)="stopRefresh()">Stop Refresh Events</button>

  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class NxWelcome {
  currencyConverter = viewChild.required(CurrencyConverterComponent);

  stopRefresh() {
    this.currencyConverter().stopRefresh();
  }

  readonly currencies = Object.keys(RATES);

  readonly currency = signal('GBP');

  amount = new FormControl(100);

  refreshData() {
    console.log('refreshData');
  }
}
