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
export class NxWelcome {
  // Signal is a function that returns a function

  // as we know from before it's considered bad practice to call a function inside html template
  // why is the entire paradime is based on calling function specially in template to getting the current value
  // The answer is relying on change detection, when we use automatic change detection these functions are executed way to many times
  // with signals we sopposed to use signal change detection not even onpush (with zoneless change detection)

  // readonly firstSignal = signal(12);
  // readonly secondSignal = signal('signal');

  // trying to use my own signal
  readonly firstSignal = mySignal(12);
  readonly secondSignal = mySignal('signal');

  setSignal(){
    this.firstSignal.set(10);
  }

  updateSignal(){
    this.firstSignal.update((value) => value + 1 );
  }


  constructor() {
    console.log('The first value is ', this.firstSignal());
  }


}
