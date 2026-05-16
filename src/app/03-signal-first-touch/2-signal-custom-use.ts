import { Component, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { mySignal } from './signal-custom-implementation';

@Component({
  selector: 'app-nx-welcome',
  imports: [CommonModule],
  template: `
  <h1> First Signal Value{{ firstSignal()}}</h1>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class StartSignal {


  // trying to use my own signal
  readonly firstSignal = mySignal(12);
  readonly secondSignal = mySignal('signal');

  setSignal() {
    this.firstSignal.set(10);
  }

  updateSignal() {
    this.firstSignal.update((value) => value + 1);
  }


  constructor() {
    console.log('The first value is ', this.firstSignal());
  }


}
