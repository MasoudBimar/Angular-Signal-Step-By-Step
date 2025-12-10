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
