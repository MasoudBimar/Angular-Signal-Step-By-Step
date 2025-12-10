import { Component, computed, effect, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nx-welcome',
  imports: [CommonModule],
  template: `
              <!-- Computed Signals -->
              <!-- it's OK to Use more than one Signal -->
              <!-- it's OK to Use writable or computed signals -->
              <!-- it's OK to Use constants and immutable non-signal data -->

              <!-- But don't Use asynchronous code: computed(async () => x() * await calc());  --> 
              <!-- But don't Use changeable data that is not signal computed(() => x() * Date.now()); -->
              <!-- But don't Cause side effects  computed(() => x() * j++); --> 
              <!-- But don't Modify or create other signals  --> 

              <!-- Effects -->
              <!-- Effects are functions that rely on signals -->
              <!-- These functions are executed automatically whenever any of the signals they rely on change -->
              <!-- it's automatically subscribe and unsubscribe from signals-->
              <!-- The effect is execute initially then whenever any of them changes it will re-executed -->
              <!-- if we have change in more than one signal, it runs once, it accumolate the changes in signals -->

              <!-- it's OK to Use more than one signal in effect -->
              <!-- it's OK to Use writable or computed signals  in effect -->
              <!-- it's OK to Use asynchronous code inside effect: effect(async() => await storage.save(x())) -->
              <!-- it's OK to Cause side effects inside effect:  effect(() => { storage.save() }) -->
              <!-- But don't modify any signal inside effect:  effect(() => { x.set(100) }) -->
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class NxWelcome {
  readonly firstSignal = signal(42);
  readonly secondSignal = signal(42);
  readonly thirdSignal = signal(10);

  computedSignal = computed(() => this.firstSignal() + this.thirdSignal());

  /**
   *
   */
  constructor() {
    effect(() => {
      console.log("Effect run: ", this.firstSignal());
      console.log("Effect run: ", this.secondSignal());
      // You can not change signals inside effect
      // this.firstSignal.set(100); // Error
    })

  }
}
