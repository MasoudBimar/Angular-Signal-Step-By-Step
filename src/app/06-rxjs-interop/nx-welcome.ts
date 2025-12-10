import { ChangeDetectionStrategy, Component, inject, signal, ViewEncapsulation, OnInit, Injector } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './api.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
/**
 *  ToObservable creates an observable which tracks the value of a signal
 *  toObservable is an effect that runs whenever the signal changes
 *  underneath it uses a replaySubject to update the observable, 
 *  so that stores in memory the latest value of the signal
 *  --------------------------------------------------------------------------
 * ToSignal creates a signal which tracks the value of an observable
 *  its subscribe to the observable and updates the signal whenever the observable emits a new value
 *  who unsubscribes from the observable when the signal is destroyed (toSignal is destroyed when the component is destroyed)
 *  --------------------------------------------------------------------------
 * so both toObservable and toSignal are needed injection context to unsubscribe from the observable or destroy the effect
 * so both toObservable and toSignal can only be used within an injection context
 * so we do not need manual cleanup
 *  --------------------------------------------------------------------------
 */
@Component({
  selector: 'app-nx-welcome',
  imports: [CommonModule],
  template: `
  <button (click)="increase()">+</button>
{{number()}}
<button (click)="decrease()">-</button>

<hr>
<h1>Factors: </h1>
{{primeFactors()}}
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class NxWelcome {
  readonly injector = inject(Injector);
  readonly number = signal(10);
  readonly number$ = toObservable(this.number); // when the effect destoys the replaySubject also is destroyed

  readonly results$ = this.number$.pipe(
    switchMap(n => this.api.getPrimeFactors(n))
  )

  readonly api = inject(ApiService);

  // call here because we are in an injection context
  readonly primeFactors = toSignal(this.results$, { initialValue: [], 
    // injector: this.injector
    // manualCleanup: true // we can use manual cleanup to avoid passing the injector
    // if we are so sure that the observable will complete by itself in a proper time
   });

  increase() {
    this.number.update(n => n + 1);
  }

  decrease() {
    this.number.update(n => Math.max(n - 1, 3));
  }

  constructor() {
    // we immediately get the current value of the signal because of the replaySubject
    // and only one value is cashed
    this.number$.subscribe(n => {
      console.log('Number changed to', n);
    })
  }

  // As we know  OnInit does not run in an injection context
  onInit(){
    // Error: NG0203: toObservable() can be used within an injection context
    const number2 = toObservable(this.number); // this will throw an error
    const number3 = toSignal(this.number$); // this will throw an error
    // because OnInit does not run in an injection context
    // to fix it we can use injector
    const number3Fixed = toObservable(this.number, { injector: this.injector });

  }

  // Signals and Immutability
  names = signal(['Alice', 'Bob', 'Charlie']);

  addName(){
    this.names().push('New Name');
    // this will not work because the array reference did not change
    // this.names.set([...this.names(), 'New Name']);
    // this will work because we are creating a new array reference

    // this is better way to update the signal immutably
    this.names.update(names => [...names, 'New Name']);

    // these are different from string, number, boolean signals
    // because they are primitive types and immutable by default
    // so we can do this:
    // this.title() = 'New Title';
    // but we cannot do this:
    // this.names() = ['New Name']; // this will not work because the array reference did not change

    // TODO: we should treat every object inside the signal as immutable
    // TODO: Even though the language does not enforce immutability
    // TODO: using map, filter, slice and spread operator to create new array references
    // Imutability helps avoid race conditions in reactive programming
  }
}


