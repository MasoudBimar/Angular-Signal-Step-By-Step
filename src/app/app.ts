import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChangeDetectionSampleDefault } from './01-change-detection/change-detection-sample-default';
import { SubscribeForm } from './09-signal-forms/subscribe-form';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SubscribeForm],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Angular21');
}
