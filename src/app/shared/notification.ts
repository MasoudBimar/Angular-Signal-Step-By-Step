import { inject, Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarRef,
  TextOnlySnackBar,
} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class Notification {
  private readonly snackbar = inject(MatSnackBar);

  showWarning(
    message: string,
    action: string = 'Close',
    config?: MatSnackBarConfig,
  ): MatSnackBarRef<TextOnlySnackBar> {
    return this.snackbar.open(message, action, config);
  }

  showError(
    message: string,
    action: string = 'Close',
    config?: MatSnackBarConfig,
  ): MatSnackBarRef<TextOnlySnackBar> {
    return this.snackbar.open(message, action, config);
  }
  showNotification(
    message: string,
    action: string = 'Close',
    config?: MatSnackBarConfig,
  ): MatSnackBarRef<TextOnlySnackBar> {
    return this.snackbar.open(message, action, config);
  }
}
