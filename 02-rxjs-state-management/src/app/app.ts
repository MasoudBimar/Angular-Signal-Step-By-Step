import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { rxJsStateManagement } from './rxJs-state-management';

@Component({
  imports: [rxJsStateManagement, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'rxjs-state-management';
}
