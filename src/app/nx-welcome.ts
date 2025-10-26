import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nx-welcome',
  imports: [CommonModule],
  template: `
    <div class="nx-welcome">
      <h1>Welcome to {{ title }}!</h1>
      <a
        href="https://nx.dev/angular"
        target="_blank"
        rel="noopener"
      >
        Learn more about Nx for Angular
      </a>
    </div>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class NxWelcome {
  title = 'AngularSignal';
}
