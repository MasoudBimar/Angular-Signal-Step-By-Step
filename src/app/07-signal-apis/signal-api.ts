import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, effect, ElementRef, OnInit, signal, viewChild, viewChildren, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CurrencyConverterComponent } from './components/currency-converter/currency-converter.component';
import { RATES } from './components/currency-converter/rates';
import { OptionSelectorComponent } from './components/option-selector/option-selector.component';
import { OptionDirective } from './components/option-selector/option.directive';
import { RgbDirective } from './rgb.directive';

@Component({
  selector: 'app-nx-welcome',
  imports: [
    CommonModule,
    CurrencyConverterComponent,
    ReactiveFormsModule,
    OptionSelectorComponent,
    OptionDirective,
    RgbDirective,
  ],
  template: `
    <h1 appRgb [red]="30" [green]="150" [blue]="30">Currency Converter</h1>
    <label for="amount">Amount</label>
    <input id="amount" type="number" [formControl]="amount" />

    <span id="currency-label">Currency</span>


    <!-- model binding can be used with banana in the box or separatedly -->
     <!-- Dont forget in banana in a box syntax we dont need to call the model signal we pass it by reference -->
     <!-- [(selected)]="currency" -->
      <!-- [selected]="currency()" (selectedChange)="currency.set($event)" -->
    <app-option-selector
      aria-labelledby="currency-label"
      [options]="currencies"
      [(selected)]="currency"
    >
      <!-- we dont call the model signal in this case -->
      <!-- create a template for the currency option -->
      <span *appOption="let currency" class="currency-option">
        <img
          [src]="'/icons/' + currency + '.svg'"
          alt="{{ currency }}"
          class="currency-icon"
        />
        {{ currency }}
      </span>
    </app-option-selector>

    <div #myRef></div>

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
export class SignalAPI implements OnInit, AfterViewInit {

  // with required we are sure that the viewChild will be there when we call it
  currencyConverter = viewChild(CurrencyConverterComponent);
  // without required it can be undefined so when we call the method we need to check if it is undefined
  // we need to call it : this.currencyConverter()?.stopRefresh();
  // currencyConverter = viewChild.required(CurrencyConverterComponent);

  // we cant use required with viewChildren because it always return an array
  currencyConverters = viewChildren(CurrencyConverterComponent); // also accepts view params for read and static

  /**
   *  component // elementRef // templateRef// viewContainerRef
   *  In all of these cases we neeed to use a refernce variable in order to use reference variable
   *  in order to mark the element that were looking for
   */

  // By grabbing the ElementRef we can access the native element and do whatever we want with it
  // you can change properties of the element or styles or attach to events
  myRefDiv = viewChild('myRef', { read: ElementRef }); // need to supply #myRef in the template

  // By grabbing the ViewContainerRef we can access the view container of that element
  // what you actually get is not the element itself but the point on the view afterwards you can insert other components or templates
  myRefDiv2 = viewChild('myRef', { read: ViewContainerRef }); // need to supply #myRef in the template


  stopRefresh() {
    // we dont need to check if it is undefined because we used required
    this.currencyConverter()?.stopRefresh();

    // for viewChildren we need to loop through the array
    // this.currencyConverters().forEach(c => c.stopRefresh());
  }

  readonly currencies = Object.keys(RATES);

  readonly currency = signal('GBP');

  amount = new FormControl(100);

  refreshData() {
    console.log('refreshData');
  }

  constructor() {
    // ! Accessing the viewChild required signal in the constructor (is too early)
    // ? we can use it in after view init but one of the benefits of signals is that you dont need to rely on lifecycle hooks
    console.log('Accesing view child required value', this.currencyConverter());
    // ! NG0951: child Query result is Required but no value is available.

    // * effects are executed after all the lifecycle hooks are executed
    effect(() => {
      console.log('Accessing view child required value in effect', this.currencyConverter()); // * This will work
    });
  }

  ngOnInit() {
    // ! Accessing the viewChild required signal in the ngOnInit lifecycle hook (is too early / is before afterViewInit)
    console.log('Accessing view child required value', this.currencyConverter()); // ! NG0951: child Query result is Required but no value is available.
  }

  ngAfterViewInit(): void {
    //* Accessing the viewChild required signal in the ngAfterViewInit lifecycle hook
    console.log('Accessing view child required value', this.currencyConverter());
  }
}


// ! We know from the classsic angular that
// ! Viewchild Query doesn not return value until a lifecycle hook is executed (afterViewInit)
// ? So while we understand how ViewChild and ViewChildren are implemented, we understand that
// ? in some points the values are undefined or an empty array
// ? So the question is how is ViewChildRequired implemented to be sure that the value is there when we call it
// ! SO when we  that signal with required does not allow undefined values
// ? for example if we want to use the viewCHild required signal in the constructor, we know for sure that the value is not initialized yet


// In the case of signals we can access the value right away because it is lazy evaluated
// so when we call the method that uses the viewChild it will get the value at that time
// so we dont need to wait for a lifecycle hook to access it


// ? contentChild and contentChildren also have the same behavior as viewChild and viewChildren
// ? In angular 18 signal based api -- content child and content children functions are used to query projected elements or components
// ? withing a component's content and both of them return signals that hold the query results
