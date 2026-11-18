import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ModalComponent } from '../../../core/components/ui/modal.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ModalComponent],
  template: `
    <app-modal [open]="open" (onClose)="onClose.emit()" [title]="title" maxWidth="max-w-md">
      <div class="p-6 bg-slate-50/50">
        <p class="text-sm text-slate-600 leading-relaxed">{{ message }}</p>
      </div>

      <div modalFooter class="px-6 py-4 flex justify-end gap-3">
        <button
          type="button"
          (click)="onClose.emit()"
          class="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
        >
          Voltar
        </button>
        <button
          type="button"
          (click)="onConfirm.emit()"
          class="px-6 py-2.5 rounded-full text-white font-medium transition-colors text-sm"
          [class]="danger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-500 hover:bg-indigo-600'"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </app-modal>
  `,
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() message = '';
  @Input() confirmLabel = 'Confirmar';
  @Input() danger = true;
  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<void>();
}
