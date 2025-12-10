import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, debounceTime, firstValueFrom, map } from 'rxjs';

type OptionKey = 'r' | 'b' | 'g' | 'c' | 'y' | 'm';
type Options = Partial<Record<OptionKey, string>>;

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

  async incA() { // need to be async because I'm calling await
    // only increment A if A+B is less than 10
    // we dont want to do it with repeating the same complex calculation
    // we can't check sum$.value because it hasn't such a property
    // it can be checked by using firstValueFrom
    // firstValueFrom create a new a promise that returns a first value of an observable then completes
    const sum = await firstValueFrom(this.sum$);
    if (sum < 10) {
      this.a$.next(this.a$.value + 1);
    }

    // when we using await in a function we convert it to two function
    // the second part of the function is continueation and it is scheduled to run when the original promise ends.
    // The second part will be queued and will be executed later

    // Warning: when the function leaves the thread it means between now and the point that the continuation executes
    // there maybe cases where other codes is going to run
    // So the test cannot be relied on because sum may have change

    // the best way to do this is through the redux pattern
    // The redux pattern holds the entire state in one object




  }
}
