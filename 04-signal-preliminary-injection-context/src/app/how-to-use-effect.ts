import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';

@Component({
  selector: 'app-how-to-use-effect',
  standalone: true,
  imports: [CommonModule],
  template:`
    <button (click)="incrementX()">Increment X</button>
    <p>X: {{ x() }}</p>
    @if (isLarge()){
        <p >X is large!</p>
    }
  `,
})
export class AppComponent {
  readonly x = signal(10);

  // bad practice to use effect  to write to a signal
  readonly isLarge = signal(false);

  // best practice to use computed to derive a signal from another signal
  readonly xLarge = computed(() => this.x() > 12);

  incrementX() {
    this.x.update(v => v + 1);
  }

  constructor() {
    effect(async () => {
      if (this.x() > 12) {
        console.log('x is greater than 12');
        
        await new Promise(resolve => setTimeout(resolve, 100));
        // after an async operation there is another task(the rest isnt in reactive context)
        // so the effect function is complete here
        // bad practice to use effect  to write to a signal
        this.isLarge.set(true);
      }
    }, {
      // allowSignalWrites: true
    });
    // if we need to write to a signal inside an effect
    // we can use the allowSignalWrites option to true
    // it works but it's not a good practice
    // and it works only for completely unrelated signals and values

  }

  // If its not recommended to run business logic inside an effect
  // where should we run business logic that needs to respond to signal changes?
  // rxjs, ngrx, statefull services
  // or using rxjs interoperability with signals

}
