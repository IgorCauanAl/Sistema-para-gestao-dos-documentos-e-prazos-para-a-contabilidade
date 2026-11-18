import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  LucideAlertTriangle,
  LucideArrowDown,
  LucideArrowUp,
  LucideChevronsUpDown,
  LucideEye,
  LucideFileSearch,
  LucideRotateCcw,
  LucideSend,
} from '@lucide/angular';

import { FileIconComponent } from '../../../core/components/ui/file-icon.component';
import { StatusBadgeComponent } from '../../../core/components/ui/status-badge.component';
import { TableComponent } from '../../../core/components/ui/table.component';
import {
  DocumentStatus,
  emRiscoSemAbertura,
  LIMITE_DIAS_SEM_ABERTURA,
  prazoDocumentoMeta,
  statusPrazoDocumento,
  ultimaAtividade,
} from '../../../core/domain/documento';
import type { Documento } from '../../../core/domain/models';

export interface DocumentsSort {
  key: string;
  dir: 'asc' | 'desc';
}

type AcaoContextual = { label: string; tipo: 'enviar' | 'protocolo'; icon: 'send' | 'rotate' | 'fileSearch' };

const contextualAction = (doc: Documento): AcaoContextual | null => {
  switch (doc.status) {
    case DocumentStatus.RASCUNHO:
      return { label: 'Enviar', tipo: 'enviar', icon: 'send' };
    case DocumentStatus.ENVIADO:
    case DocumentStatus.VISUALIZADO:
      return { label: 'Reenviar', tipo: 'enviar', icon: 'rotate' };
    case DocumentStatus.BAIXADO:
      return { label: 'Ver protocolo', tipo: 'protocolo', icon: 'fileSearch' };
    default:
      return null;
  }
};

@Component({
  selector: 'app-documents-table',
  standalone: true,
  imports: [
    TableComponent,
    StatusBadgeComponent,
    FileIconComponent,
    LucideAlertTriangle,
    LucideArrowDown,
    LucideArrowUp,
    LucideChevronsUpDown,
    LucideEye,
    LucideFileSearch,
    LucideRotateCcw,
    LucideSend,
  ],
  template: `
    <app-table>
      <table class="w-full text-left border-collapse min-w-[1024px]">
        <thead>
          <tr class="border-b border-slate-200/50 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
            <th class="p-4 pl-6 w-12">
              <input
                type="checkbox"
                aria-label="Selecionar todos os documentos da página"
                class="w-4 h-4 accent-indigo-500 cursor-pointer"
                [checked]="todosDaPaginaSelecionados"
                (change)="onTogglePage.emit($any($event.target).checked)"
              />
            </th>

            <th class="p-4 font-semibold">
              <button
                type="button"
                (click)="onSort.emit('cliente')"
                class="flex items-center gap-1.5 uppercase tracking-wider hover:text-slate-700 transition-colors"
                [class]="isActive('cliente') ? 'text-indigo-600' : ''"
              >
                Cliente
                @if (isActive('cliente')) {
                  @if (sort.dir === 'asc') {
                    <svg lucideArrowUp [size]="13"></svg>
                  } @else {
                    <svg lucideArrowDown [size]="13"></svg>
                  }
                } @else {
                  <svg lucideChevronsUpDown [size]="13"></svg>
                }
              </button>
            </th>

            <th class="p-4 font-semibold">Documento</th>
            <th class="p-4 font-semibold">Tipo</th>

            <th class="p-4 font-semibold">
              <button
                type="button"
                (click)="onSort.emit('competencia')"
                class="flex items-center gap-1.5 uppercase tracking-wider hover:text-slate-700 transition-colors"
                [class]="isActive('competencia') ? 'text-indigo-600' : ''"
              >
                Competência
                @if (isActive('competencia')) {
                  @if (sort.dir === 'asc') {
                    <svg lucideArrowUp [size]="13"></svg>
                  } @else {
                    <svg lucideArrowDown [size]="13"></svg>
                  }
                } @else {
                  <svg lucideChevronsUpDown [size]="13"></svg>
                }
              </button>
            </th>

            <th class="p-4 font-semibold">Vencimento</th>
            <th class="p-4 font-semibold">Versão</th>
            <th class="p-4 font-semibold">Status</th>
            <th class="p-4 font-semibold">Canal</th>

            <th class="p-4 font-semibold">
              <button
                type="button"
                (click)="onSort.emit('atividade')"
                class="flex items-center gap-1.5 uppercase tracking-wider hover:text-slate-700 transition-colors"
                [class]="isActive('atividade') ? 'text-indigo-600' : ''"
              >
                Última atividade
                @if (isActive('atividade')) {
                  @if (sort.dir === 'asc') {
                    <svg lucideArrowUp [size]="13"></svg>
                  } @else {
                    <svg lucideArrowDown [size]="13"></svg>
                  }
                } @else {
                  <svg lucideChevronsUpDown [size]="13"></svg>
                }
              </button>
            </th>

            <th class="p-4 pr-6 font-semibold text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          @for (doc of documents; track doc.id) {
            <tr
              class="border-b border-slate-100 last:border-0 transition-colors"
              [class]="
                (risco(doc) ? 'bg-amber-50/80 hover:bg-amber-100/70' : 'hover:bg-slate-50/80') +
                ' ' +
                (estaMarcado(doc) ? 'ring-1 ring-inset ring-indigo-300' : '')
              "
            >
              <td class="p-4 pl-6">
                <input
                  type="checkbox"
                  [attr.aria-label]="'Selecionar ' + doc.nome"
                  class="w-4 h-4 accent-indigo-500 cursor-pointer"
                  [checked]="estaMarcado(doc)"
                  (change)="onToggleRow.emit({ id: doc.id, checked: $any($event.target).checked })"
                />
              </td>
              <td class="p-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                {{ nomeCliente(doc.clienteId) }}
              </td>
              <td class="p-4 text-sm font-medium text-slate-700">
                <div class="flex items-center gap-2">
                  <app-file-icon [formato]="doc.formato"></app-file-icon>
                  <span class="truncate max-w-[200px]">{{ doc.nome }}</span>
                  @if (risco(doc)) {
                    <span
                      [title]="'Enviado há mais de ' + limiteDias + ' dias sem abertura pelo cliente'"
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-800 text-[11px] font-semibold whitespace-nowrap"
                    >
                      <svg lucideAlertTriangle [size]="12"></svg> Sem abertura
                    </span>
                  }
                </div>
              </td>
              <td class="p-4 text-sm text-slate-600">{{ doc.tipo }}</td>
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
              <td class="p-4 text-sm text-slate-600">{{ doc.canal ?? '—' }}</td>
              <td class="p-4 text-sm text-slate-600 whitespace-nowrap">
                @if (atividade(doc); as evento) {
                  {{ evento.data }} · {{ evento.hora }}
                } @else {
                  —
                }
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

                  @if (acao(doc); as contextual) {
                    <button
                      type="button"
                      [title]="contextual.label"
                      [attr.aria-label]="contextual.label + ' ' + doc.nome"
                      (click)="contextual.tipo === 'enviar' ? onSend.emit(doc) : onView.emit(doc)"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                      [class]="
                        contextual.tipo === 'enviar'
                          ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      "
                    >
                      @switch (contextual.icon) {
                        @case ('send') {
                          <svg lucideSend [size]="14"></svg>
                        }
                        @case ('rotate') {
                          <svg lucideRotateCcw [size]="14"></svg>
                        }
                        @default {
                          <svg lucideFileSearch [size]="14"></svg>
                        }
                      }
                      {{ contextual.label }}
                    </button>
                  }
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </app-table>
  `,
})
export class DocumentsTableComponent {
  @Input() documents: Documento[] = [];
  @Input() nomeCliente: (clienteId: number) => string = () => '—';
  @Input() sort: DocumentsSort = { key: 'atividade', dir: 'desc' };
  @Input() selectedIds: Set<number> = new Set<number>();
  @Input() todosDaPaginaSelecionados = false;
  @Output() onView = new EventEmitter<Documento>();
  @Output() onSend = new EventEmitter<Documento>();
  @Output() onSort = new EventEmitter<string>();
  @Output() onToggleRow = new EventEmitter<{ id: number; checked: boolean }>();
  @Output() onTogglePage = new EventEmitter<boolean>();

  readonly limiteDias = LIMITE_DIAS_SEM_ABERTURA;

  isActive(key: string): boolean {
    return this.sort.key === key;
  }

  risco(doc: Documento): boolean {
    return emRiscoSemAbertura(doc);
  }

  estaMarcado(doc: Documento): boolean {
    return this.selectedIds.has(doc.id);
  }

  acao(doc: Documento): AcaoContextual | null {
    return contextualAction(doc);
  }

  atividade(doc: Documento) {
    return ultimaAtividade(doc);
  }

  prazoMeta(doc: Documento) {
    const prazo = statusPrazoDocumento(doc);
    return prazo ? prazoDocumentoMeta[prazo] : null;
  }
}
