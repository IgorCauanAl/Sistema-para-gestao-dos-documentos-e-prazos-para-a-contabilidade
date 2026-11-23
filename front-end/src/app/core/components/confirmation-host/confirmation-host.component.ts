import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { ConfirmationService } from '../../services/confirmation.service';
import { ConfirmDialogComponent } from '../ui/confirm-dialog/confirm-dialog.component';

/** Host global do modal de decisão usado pelo NotificationService. */
@Component({
  selector: 'app-confirmation-host',
  standalone: true,
  imports: [AsyncPipe, ConfirmDialogComponent],
  templateUrl: './confirmation-host.component.html',
})
export class ConfirmationHostComponent {
  readonly confirmation = inject(ConfirmationService);
}
