import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideEye, LucideFileSearch, LucideRotateCcw, LucideSend } from '@lucide/angular';

import { FileIconComponent } from '../../../core/components/ui/file-icon.component';
import { StatusBadgeComponent } from '../../../core/components/ui/status-badge.component';
import { TableComponent } from '../../../core/components/ui/table.component';
import {
  DocumentStatus,
  prazoDocumentoMeta,
  statusPrazoDocumento,
} from '../../../core/domain/documento';
import type { Documento } from '../../../core/domain/models';

type AcaoLinha = { label: string; tipo: 'send' | 'view' };

@Component({
  selector: 'app-document-table',
  standalone: true,
  imports: [
    TableComponent,
    StatusBadgeComponent,
    FileIconComponent,
    LucideEye,
    LucideFileSearch,
    LucideRotateCcw,
    LucideSend,
  ],
  template: `
    <app-table>
      <table class="w-full text-left border-collapse">
        <thead>
          <tr
            class="border-b border-slate-200/50 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500"
          >
            <th class="p-4 pl-6 font-semibold">Documento</th>
            <th class="p-4 font-semibold">Tipo</th>
            <th class="p-4 font-semibold">Competência</th>
            <th class="p-4 font-semibold">Vencimento</th>
            <th class="p-4 font-semibold">Versão</th>
            <th class="p-4 font-semibold">Status</th>
            <th class="p-4 pr-6 font-semibold text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          @for (doc of documents; track doc.id) {
            <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors">
              <td class="p-4 pl-6 font-medium text-slate-700">
                <div class="flex items-center gap-3">
                  <app-file-icon [formato]="doc.formato"></app-file-icon>
                  {{ doc.nome }}
                </div>
              </td>
              <td class="p-4 text-sm text-slate-600">{{ doc.area }}</td>
              <td class="p-4 text-sm text-slate-600">{{ doc.competencia }}</td>
              <td class="p-4 text-sm text-slate-600 whitespace-nowrap">
                @if (doc.vencimento) {
                  <div class="flex items-center gap-2">
                    <span>{{ doc.vencimento }}</span>
                    @if (prazoMeta(doc); as meta) {
                      <span class="px-2 py-0.5 rounded-full border text-[11px] font-semibold" [class]="meta.badge">
                        {{ meta.label }}
                      </span>
                    }
                  </div>
                } @else {
                  —
                }
              </td>
              <td class="p-4 text-sm font-semibold text-slate-600">v{{ doc.versao }}</td>
              <td class="p-4">
                <app-status-badge [status]="doc.status"></app-status-badge>
              </td>
              <td class="p-4 pr-6">
                <div class="flex justify-center items-center gap-2">
                  <button
                    type="button"
                    title="Visualizar document"
                    [attr.aria-label]="'Visualizar ' + doc.nome"
                    (click)="onView.emit(doc)"
                    class="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <svg lucideEye [size]="16"></svg>
                  </button>

                  <button
                    type="button"
                    (click)="acao(doc).tipo === 'send' ? onSend.emit(doc) : onView.emit(doc)"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                    [class]="
                      acao(doc).tipo === 'send'
                        ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    "
                  >
                    @switch (acao(doc).tipo) {
                      @case ('send') {
                        @if (doc.status === DocumentStatus.RASCUNHO) {
                          <svg lucideSend [size]="14"></svg>
                        } @else {
                          <svg lucideRotateCcw [size]="14"></svg>
                        }
                      }
                      @default {
                        <svg lucideFileSearch [size]="14"></svg>
                      }
                    }
                    {{ acao(doc).label }}
                  </button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </app-table>
  `,
})
export class DocumentTableComponent {
  @Input() documents: Documento[] = [];
  @Output() onView = new EventEmitter<Documento>();
  @Output() onSend = new EventEmitter<Documento>();

  readonly DocumentStatus = DocumentStatus;

  acao(doc: Documento): AcaoLinha {
    switch (doc.status) {
      case DocumentStatus.RASCUNHO:
        return { label: 'Enviar', tipo: 'send' };
      case DocumentStatus.ENVIADO:
      case DocumentStatus.VISUALIZADO:
        return { label: 'Reenviar', tipo: 'send' };
      default:
        return { label: 'Ver protocolo', tipo: 'view' };
    }
  }

  prazoMeta(doc: Documento) {
    const prazo = statusPrazoDocumento(doc);
    return prazo ? prazoDocumentoMeta[prazo] : null;
  }
}
