import {
  computed,
  Directive,
  input,
  signal,
} from '@angular/core';

@Directive({
  selector: '[appRgb]',
  standalone: true,
  host: {
    '[style.color]': 'color()',
    '(click)': 'invert()'
  }
})
export class RgbDirective {
  readonly red = input(0);
  readonly green = input(0);
  readonly blue = input(0);

  readonly inverted = signal(false);

  // The old HostBinding way:
  // @HostBinding('style.color')
  // get color() { ... }  
  // cant be used with signals directly
  //  so the new host property syntax is preferred


  readonly color = computed(() =>
    this.inverted()
      ? `rgb(${255 - this.red()}, ${255 - this.green()}, ${255 - this.blue()})`
      : `rgb(${this.red()}, ${this.green()}, ${this.blue()})`
  );

  invert() {
    this.inverted.update((v) => !v);
  }

}
