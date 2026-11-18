import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideX } from '@lucide/angular';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [LucideX],
  template: `
    @if (open) {
      <div
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        (mousedown)="onBackdrop($event)"
        role="presentation"
      >
        <div
          tabindex="-1"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title"
          class="bg-white rounded-3xl shadow-xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
          [class]="maxWidth"
        >
          @if (title) {
            <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <h2 class="text-xl font-bold text-slate-800">{{ title }}</h2>
              <button
                type="button"
                (click)="onClose.emit()"
                aria-label="Fechar"
                class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
              >
                <svg lucideX [size]="20"></svg>
              </button>
            </div>
          }

          <div class="overflow-y-auto"><ng-content></ng-content></div>

          <div class="border-t border-slate-100 bg-white"><ng-content select="[modalFooter]"></ng-content></div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() maxWidth = 'max-w-2xl';
  @Output() onClose = new EventEmitter<void>();

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.onClose.emit();
  }
}
