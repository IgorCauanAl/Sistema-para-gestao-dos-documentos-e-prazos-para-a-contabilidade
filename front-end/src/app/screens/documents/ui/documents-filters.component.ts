import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideSearch, LucideX } from '@lucide/angular';

import {
  ANOS,
  CANAIS_DOCUMENTO,
  documentStatusMeta,
  MESES,
  STATUS_DOCUMENTO_FILTROS,
} from '../../../core/domain/documento';
import type { Cliente } from '../../../core/domain/models';
import { ClientSelectComponent } from './client-select.component';

export interface DocumentsFiltersModel {
  busca: string;
  clienteId: number | null;
  tipo: string;
  competencia: string;
  status: string;
  canal: string;
}

export function emptyDocumentsFilters(): DocumentsFiltersModel {
  return { busca: '', clienteId: null, tipo: '', competencia: '', status: '', canal: '' };
}

const selectClass =
  'px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[150px]';

@Component({
  selector: 'app-documents-filters',
  standalone: true,
  imports: [ClientSelectComponent, LucideSearch, LucideX],
  template: `
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-4 flex flex-wrap items-end gap-4">
      <div class="flex flex-col gap-1.5 flex-1 min-w-[220px]">
        <label class="text-xs font-semibold uppercase tracking-wider text-slate-500">Busca por nome</label>
        <div class="relative">
          <svg
            lucideSearch
            [size]="15"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          ></svg>
          <input
            id="filtro-busca-doc"
            type="text"
            placeholder="Ex.: Guia FGTS"
            class="w-full px-3 py-2.5 pl-9 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            [value]="filters.busca"
            (input)="patch({ busca: $any($event.target).value })"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <app-client-select
          id="filtro-cliente-doc"
          label="Cliente"
          [clientes]="clientes"
          [value]="filters.clienteId"
          (clienteChange)="patch({ clienteId: $event?.id ?? null })"
          placeholder="Todos os clientes"
        ></app-client-select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold uppercase tracking-wider text-slate-500">Tipo</label>
        <select
          id="filtro-tipo-doc"
          [class]="selectClass"
          [value]="filters.tipo"
          (change)="patch({ tipo: $any($event.target).value })"
        >
          <option value="">Todos</option>
          @for (tipo of opcoesTipo; track tipo) {
            <option [value]="tipo">{{ tipo }}</option>
          }
        </select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold uppercase tracking-wider text-slate-500">Competência</label>
        <select
          id="filtro-competencia-doc"
          [class]="selectClass"
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
        <label class="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</label>
        <select
          id="filtro-status-doc"
          [class]="selectClass"
          [value]="filters.status"
          (change)="patch({ status: $any($event.target).value })"
        >
          <option value="">Todos</option>
          @for (status of statusOpcoes; track status) {
            <option [value]="status">{{ labelStatus(status) }}</option>
          }
        </select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold uppercase tracking-wider text-slate-500">Canal</label>
        <select
          id="filtro-canal-doc"
          [class]="selectClass"
          [value]="filters.canal"
          (change)="patch({ canal: $any($event.target).value })"
        >
          <option value="">Todos</option>
          @for (canal of canais; track canal) {
            <option [value]="canal">{{ canal }}</option>
          }
        </select>
      </div>

      <button
        type="button"
        (click)="onClear.emit()"
        class="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
      >
        <svg lucideX [size]="15"></svg> Limpar filtros
      </button>
    </div>
  `,
})
export class DocumentsFiltersComponent {
  @Input() filters: DocumentsFiltersModel = emptyDocumentsFilters();
  @Input() clientes: Cliente[] = [];
  @Input() opcoesTipo: string[] = [];
  @Output() onChange = new EventEmitter<DocumentsFiltersModel>();
  @Output() onClear = new EventEmitter<void>();

  readonly selectClass = selectClass;
  readonly canais = CANAIS_DOCUMENTO;
  readonly statusOpcoes = STATUS_DOCUMENTO_FILTROS;
  readonly competencias = ANOS.flatMap((ano) => MESES.map((mes) => `${mes}/${ano}`));

  patch(partial: Partial<DocumentsFiltersModel>): void {
    this.onChange.emit({ ...this.filters, ...partial });
  }

  labelStatus(status: string): string {
    return documentStatusMeta[status].label;
  }
}
