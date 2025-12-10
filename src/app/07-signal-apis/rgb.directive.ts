import {
  computed,
  Directive,
  input,
  signal,
} from '@angular/core';

/**
 * The problem is to change the text color of an element
 * based on RGB input values and invert the color on click.
 * So we want to create a directive that takes RGB values as inputs,
 * computes the corresponding color, and inverts it when clicked.
 */
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

  readonly color = computed(() =>
    this.inverted()
      ? `rgb(${255 - this.red()}, ${255 - this.green()}, ${255 - this.blue()})`
      : `rgb(${this.red()}, ${this.green()}, ${this.blue()})`
  );

  invert() {
    this.inverted.update((v) => !v);
  }

  // First attempt:
  // The old HostBinding way:
  // @HostBinding('style.color')
  // get color() { ... }  
  // can't be used with signals directly because HostBinding expects a static value, not a reactive one,

  // Second Attempt:
  // Using static property and updating the style in an effect.
  // But that would be more complex and less efficient,
  // becuase the statics can't be used in zone-less environment,
  actualColor = '';
  readonly colorEffect = computed(() => {
    this.actualColor = this.color();
  });

  // Final Attempt:
  // Using the host property in the directive metadata,
  // which allows binding directly to signals,
  //  so the new host property syntax is preferred
  // in the latest angular versions, strongly typing host properties introduced by default.






}
