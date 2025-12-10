import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval } from 'rxjs';

@Component({
  selector: 'app-nx-welcome',
  imports: [CommonModule],
  template: `
<h1>Counter (async) = {{counter$ | async}}</h1>
<h2>Normal Counter = {{normalConter}}</h2>

<h2>{{calculateValue()}}</h2>

<button (click)="justNothing()">do nothing</button>

<!-- If one of them trigger a change on the template the CI check's all of them and all values will be updated -->
<!-- If user trigger an angular event like (click) the same CI process will happen -->
<!-- If there is a async pipe the pipe will trigger the change detection process -->

<!-- So there two categories of events or of occasions which cause the change detection to run when we're on OnPush  -->
<!-- One of them is when we use Angular's mechanisms such as inputs, outputs or events. -->
<!-- Second one is we can manullay cal the change detector by runnign detectchanges() and that will happen as well.   -->

<h3> On push </h3>
<ul>
  <!-- this trgidders angular change detection strategy -->
  <li>ANgular inputs changes</li>
  <li>Angular events triggered</li>
  <li>When triggered using ChnageDetectorRef</li>
  <li>A few more selected triggers</li>
</ul>

<h3>Default</h3>
<ul>
  <li>Seems like all the time</li>
  <li>But how?</li>
  <li>setTimeout</li>
  <li>setInterval</li>
  <li>addEventHandler</li>
  <li>XHR.send</li>
  <li>Script file loaded</li>
  <li>Promise.then</li>
  <li>Promise.catch</li>
  <li>queueMicrotask</li>


</ul>

<!-- Zone Js overload all functions that passed to queue to be executed a little bit later.-->
<!-- Zone Js attach prefix and postfix to these functions -->
  

<!-- SO Finally:  -->
<!-- When you use OnPush in Angular, Angular will only run change detection for a component if: -->

<!-- One of its @Input() references changes (new object/primitive value). -->

<!-- An event originates from inside the component (like (click)). -->

<!-- An observable emits via the async pipe. -->

<!-- You manually trigger it (ChangeDetectorRef.markForCheck()). -->

<!-- Pure pipes only re-run when their inputs change by reference. This works very well with OnPush since Angular doesn’t re-check everything. -->
  
<!-- Async pipe is almost always the best option for handling observables, because it: -->

<!-- Subscribes/unsubscribes automatically, -->

<!-- Marks the component for check when new values come in (so you don’t need manual detection). -->
  
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangeDetectionSampleDefault {
  readonly counter$ = interval(1000);
  protected normalConter = 0;
  private readonly cdr = inject(ChangeDetectorRef);

  calculateValue() {
    console.log('Value is calculated');
    return 42;
  }

  constructor() {
    setInterval(() => {
      this.normalConter++;
    }, 1000);

    setInterval(() => {
      this.cdr.detectChanges(); // manually call the change detector
    }, 3000);
  }

  justNothing() {
    // nothing
  }
}
