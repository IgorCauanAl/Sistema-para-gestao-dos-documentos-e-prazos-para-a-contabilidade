import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ANOS, AREAS_DOCUMENTO, DocumentStatus, documentStatusMeta, MESES } from '../../../core/domain/documento';

export interface DocumentFiltersModel {
  competencia: string;
  tipo: string;
  status: string;
}

export function emptyDocumentFilters(): DocumentFiltersModel {
  return { competencia: '', tipo: '', status: '' };
}

const selectClass =
  'px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[160px]';

@Component({
  selector: 'app-document-filters',
  standalone: true,
  template: `
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-4 flex flex-wrap items-end gap-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold uppercase tracking-wider text-slate-500">Competência</label>
        <select
          class="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[160px]"
          [value]="filters.competencia"
          (change)="patch({ competencia: $any($event.target).value })"
        >
          <option value="">Todas</option>
          @for (competencia of competencias; track competencia) {
            <option [value]="competencia">{{ competencia }}</option>
          }
        </select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold uppercase tracking-wider text-slate-500">Tipo</label>
        <select
          class="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[160px]"
          [value]="filters.tipo"
          (change)="patch({ tipo: $any($event.target).value })"
        >
          <option value="">Todos</option>
          @for (area of areas; track area) {
            <option [value]="area">{{ area }}</option>
          }
        </select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</label>
        <select
          class="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[160px]"
          [value]="filters.status"
          (change)="patch({ status: $any($event.target).value })"
        >
          <option value="">Todos</option>
          @for (status of statusOpcoes; track status) {
            <option [value]="status">{{ labelStatus(status) }}</option>
          }
        </select>
      </div>
    </div>
  `,
})
export class DocumentFiltersComponent {
  @Input() filters: DocumentFiltersModel = emptyDocumentFilters();
  @Output() onChange = new EventEmitter<DocumentFiltersModel>();

  readonly areas = AREAS_DOCUMENTO;
  readonly statusOpcoes = Object.values(DocumentStatus);
  readonly competencias = ANOS.flatMap((ano) => MESES.map((mes) => `${mes}/${ano}`));

  patch(partial: Partial<DocumentFiltersModel>): void {
    this.onChange.emit({ ...this.filters, ...partial });
  }

  labelStatus(status: string): string {
    return documentStatusMeta[status].label;
  }
}
