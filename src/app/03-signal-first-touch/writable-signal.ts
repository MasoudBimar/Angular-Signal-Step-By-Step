import { computed, signal } from "@angular/core";

/**
 * 1. Writable Signal
 * We can create writable signals using signal function, which takes an initial value
 * and returns a writable signal.
 *
 * Writable signal is first and foremost a function,
 * which you can call to extract its current value.
 *
 * 2. Computed Signal
 * Computed signal is a read-only signal you cannot modify them, they calculate themselves
 * and modify themselves based on an expression that may include other signals
 * 4.
 *
 * 5.
 */
{
  // 1. Creating a signal
  const firstSignal = signal(42);

  // Reading the value
  let val1 = firstSignal();

  // Binding to the value
  const string = `
                        <h1>
                            First Signal: {{firstSignal()}}
                        </h1>
    `;

  // Modifying the value
  firstSignal.set(43); // set the new value
  firstSignal.update(value => value + 1); // calculate the new value based on the prev value

  // 2. Computed Signal
  // Angular is celever enought to mark the related signal with the derived one,
  // so it knows that whenever any one of the signals in the expression change,
  // the derived signal needs to be recalculated as well
  const derived = computed(() => firstSignal() * 2);

  // Reading the value
  const val2 = derived(); // same as writable
  console.log('Derived Signal Value:', val2);

  // Binding to the value
  const binding = `
                    <h1>
                            Derived Signal: {{derived()}} // same as writable
                    </h1>
    `;


}
