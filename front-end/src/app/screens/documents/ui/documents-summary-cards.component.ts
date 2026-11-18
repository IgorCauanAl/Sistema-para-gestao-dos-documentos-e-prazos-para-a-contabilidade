import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideEye, LucideFilePenLine, LucideInbox, LucideSend } from '@lucide/angular';

export interface DocumentsContagens {
  [key: string]: number;
  RASCUNHO: number;
  ENVIADO: number;
  VISUALIZADO: number;
  SEMANA: number;
}

@Component({
  selector: 'app-documents-summary-cards',
  standalone: true,
  imports: [LucideFilePenLine, LucideSend, LucideEye, LucideInbox],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      @for (card of cards; track card.id) {
        <button
          type="button"
          [attr.aria-pressed]="ativo === card.id"
          (click)="onClick.emit(ativo === card.id ? null : card.id)"
          class="text-left bg-white rounded-3xl shadow-sm border-2 p-5 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          [class]="ativo === card.id ? 'border-indigo-500 ring-1 ring-indigo-500/40' : 'border-slate-200/50'"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1 min-w-0">
              <p class="text-sm font-medium text-slate-500 truncate">{{ card.label }}</p>
              <p class="text-3xl font-bold tracking-tight text-slate-800">{{ contagens[card.id] ?? 0 }}</p>
            </div>
            <span class="p-3 rounded-2xl shrink-0" [class]="card.tone">
              @switch (card.icon) {
                @case ('filePenLine') {
                  <svg lucideFilePenLine [size]="22"></svg>
                }
                @case ('send') {
                  <svg lucideSend [size]="22"></svg>
                }
                @case ('eye') {
                  <svg lucideEye [size]="22"></svg>
                }
                @default {
                  <svg lucideInbox [size]="22"></svg>
                }
              }
            </span>
          </div>
        </button>
      }
    </div>
  `,
})
export class DocumentsSummaryCardsComponent {
  @Input() contagens: DocumentsContagens = { RASCUNHO: 0, ENVIADO: 0, VISUALIZADO: 0, SEMANA: 0 };
  @Input() ativo: string | null = null;
  @Output() onClick = new EventEmitter<string | null>();

  readonly cards = [
    { id: 'RASCUNHO', label: 'Rascunhos', icon: 'filePenLine', tone: 'text-slate-500 bg-slate-100' },
    { id: 'ENVIADO', label: 'Enviados sem abertura', icon: 'send', tone: 'text-blue-600 bg-blue-50' },
    { id: 'VISUALIZADO', label: 'Visualizados, não baixados', icon: 'eye', tone: 'text-amber-600 bg-amber-50' },
    { id: 'SEMANA', label: 'Recebidos na semana', icon: 'inbox', tone: 'text-purple-600 bg-purple-50' },
  ];
}
