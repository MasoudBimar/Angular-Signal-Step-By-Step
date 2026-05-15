import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { interval } from 'rxjs';

@Component({
  selector: 'app-nx-welcome',
  imports: [CommonModule],
  template: `
              <h2>Normal Counter = {{normalConter}}</h2>

              <h2>{{calculateValue()}}</h2>

              <button (click)="justNothing()">do nothing</button>

  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangeDetectionSampleOnPush {
  protected normalConter = 0;

  calculateValue() {
    console.log('Value is calculated');
    return 42;
  }

  constructor() {
    setInterval(() => {
      this.normalConter++;
    }, 1000);
  }

  justNothing() {
    // nothing
  }
}
