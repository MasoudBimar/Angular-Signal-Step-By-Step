import { ErrorHandler, inject } from '@angular/core';
import { NotificationService } from './notification';

export class CustomErrorHandler implements ErrorHandler {
  private readonly notificationService = inject(NotificationService);

  handleError(error: unknown): void {
    const realError = this.unwrapError(error);
    const message = this.getErrorMessage(realError);

    console.error('Global error:', error);



    this.notificationService.showError(message);
  }

  private unwrapError(error: unknown): unknown {
    if (!this.isObject(error)) {
      return error;
    }

    return (
      error['rejection'] ?? error['reason'] ?? error['originalError'] ?? error['error'] ?? error
    );
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (this.isObject(error) && typeof error['message'] === 'string') {
      return error['message'];
    }

    return 'Unexpected application error';
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
