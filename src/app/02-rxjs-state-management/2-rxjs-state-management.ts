import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, debounceTime, firstValueFrom, map } from 'rxjs';

@Component({
  selector: 'app-rxjs-state-management',
  imports: [CommonModule],
  template: `

  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class rxJsStateManagement {
  readonly a$ = new BehaviorSubject<number>(1);
  readonly b$ = new BehaviorSubject<number>(2);
  readonly sum$ = combineLatest([this.a$, this.b$]).pipe(
    map(([a, b]) => a + b)
  )

  async incA() { 
    // firstValueFrom create a new promise that returns a first value of an observable then completes
    const sum = await firstValueFrom(this.sum$);
    if (sum < 10) {// capable of evolving race condition if the sum is updated by another source before the next line runs
      this.a$.next(this.a$.value + 1);
    }
  }
}
