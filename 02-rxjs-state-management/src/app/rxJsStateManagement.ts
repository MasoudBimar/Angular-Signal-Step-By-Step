import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, debounceTime, map } from 'rxjs';

type OptionKey = 'r' | 'b' | 'g' | 'c' | 'y' | 'm';
type Options = Partial<Record<OptionKey, string>>;

@Component({
  selector: 'app-rxjs-state-management',
  imports: [CommonModule],
  template: `
    Selected Key : {{ selectedKey$ | async}}
    <hr>
    <hr>
    <button (click)="switchOptions()"> switch</button>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class rxJsStateManagement {
  readonly options$ = new BehaviorSubject<Options>({ 'r': 'Red', 'g': 'Green', 'b': 'Blue' });

  readonly selectedKey$ = new BehaviorSubject<OptionKey>('b');

  readonly selectedValue$ = combineLatest([this.options$, this.selectedKey$]).pipe(
    debounceTime(0), // it lets the entire switchOption run before calculating and emitting a new value
    map(([options, key]) => options[key])
  );

  constructor() {
    // const keys: OptionKey[] = ['r', 'b', 'g'];
    // setInterval(() => {
    //   const idx= Math.floor((Math.random() * 299) / 100);
    //   console.log(idx);
    //   this.selectedKey$.next(keys[idx])
    // }, 1000);

    this.selectedValue$.subscribe(console.log);
  }

  switchOptions() {
    this.options$.next({ 'm': 'Magneta', 'y': 'yellow', 'c': 'Cyan' });
    this.selectedKey$.next('c');
  }

}
