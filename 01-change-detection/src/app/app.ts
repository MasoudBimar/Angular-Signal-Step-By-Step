import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChangeDetectionSampleOnPush } from './change-detection-sample-onpush';

@Component({
  imports: [ChangeDetectionSampleOnPush, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'change-detection-01';
}
