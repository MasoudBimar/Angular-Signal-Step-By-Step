import { TestBed } from '@angular/core/testing';

import { MatSnackBar } from '@angular/material/snack-bar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from './notification';

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBar: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    snackBar = {
      open: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: MatSnackBar,
          useValue: snackBar,
        },
      ],
    });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open error messages with the error snackbar class', () => {
    service.showError('Failed to save');

    expect(snackBar.open).toHaveBeenCalledWith(
      'Failed to save',
      'Close',
      expect.objectContaining({
        panelClass: ['app-snackbar-error'],
      }),
    );
  });
});
