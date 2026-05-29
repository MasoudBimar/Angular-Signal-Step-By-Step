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
export class NotificationService {
  private readonly snackbar = inject(MatSnackBar);
  private readonly defaultErrorConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
    panelClass: ['app-snackbar-error'],
  };

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
    return this.snackbar.open(
      message,
      action,
      this.mergeConfig(this.defaultErrorConfig, config),
    );
  }
  showNotification(
    message: string,
    action: string = 'Close',
    config?: MatSnackBarConfig,
  ): MatSnackBarRef<TextOnlySnackBar> {
    return this.snackbar.open(message, action, config);
  }

  private mergeConfig(
    defaultConfig: MatSnackBarConfig,
    config?: MatSnackBarConfig,
  ): MatSnackBarConfig {
    return {
      ...defaultConfig,
      ...config,
      panelClass: [
        ...this.toPanelClassArray(defaultConfig.panelClass),
        ...this.toPanelClassArray(config?.panelClass),
      ],
    };
  }

  private toPanelClassArray(panelClass: MatSnackBarConfig['panelClass']): string[] {
    if (!panelClass) {
      return [];
    }

    return Array.isArray(panelClass) ? panelClass : [panelClass];
  }
}
