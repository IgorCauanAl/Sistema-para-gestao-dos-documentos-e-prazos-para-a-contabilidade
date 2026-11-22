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
  templateUrl: './documents-summary-cards.component.html',
  styleUrl: './documents-summary-cards.component.css',
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
