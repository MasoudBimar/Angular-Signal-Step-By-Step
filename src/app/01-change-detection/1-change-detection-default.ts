import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { interval } from 'rxjs';

@Component({
  selector: 'app-nx-welcome',
  imports: [CommonModule],
  template: `<h2>Normal Counter = {{ normalConter }}</h2> `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ChangeDetectionSampleDefault {
  protected normalConter = 0;

  constructor() {
    setInterval(() => {
      this.normalConter++;
    }, 1000);
  }
}
