import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChangeDetectionSampleDefault } from './01-change-detection/change-detection-sample-default';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChangeDetectionSampleDefault],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Angular21');
}
