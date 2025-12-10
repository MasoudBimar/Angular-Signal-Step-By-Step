import { CommonModule } from '@angular/common';
import { Component, contentChild, input, model } from '@angular/core';
import { OptionDirective } from './option.directive';

@Component({
  selector: 'app-option-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './option-selector.component.html',
  styleUrl: './option-selector.component.scss'
})
export class OptionSelectorComponent {
  readonly options = input.required<string[]>();
  readonly templateDirective = contentChild(OptionDirective); // ? to get the template from the structural directive

  // model combines input and output behavior => two-way binding
  // it can be set from outside and inside the component
  // input signal is readonly
  readonly model = model<string | null>(null);

  // with model  we can set and update the value from inside the component
  // optional model signal: if not provided from outside it will be created here
  // this is useful for optional two-way binding
  // required model signal: must be provided from outside
  readonly selected = model.required();

  select(option: string) {
    this.selected.set(option);
  }
}
