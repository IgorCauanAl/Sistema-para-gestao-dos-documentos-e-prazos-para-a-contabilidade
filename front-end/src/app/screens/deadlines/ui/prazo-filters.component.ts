import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideSearch, LucideX } from '@lucide/angular';

import { ClientSelectComponent } from '../../documents/ui/client-select.component';
import { ANOS, MESES } from '../../../core/domain/documento';
import type { Cliente } from '../../../core/domain/models';
import {
  CATEGORIAS,
  PRIORIDADE_OPCOES,
  prioridadeMeta,
  STATUS_PRAZO_OPCOES,
  statusPrazoMeta,
} from '../../../core/domain/prazo';

export interface PrazoFiltersModel {
  busca: string;
  clienteId: number | null;
  obrigacao: string;
  categoria: string;
  competencia: string;
  status: string;
  prioridade: string;
}

export function emptyPrazoFilters(): PrazoFiltersModel {
  return { busca: '', clienteId: null, obrigacao: '', categoria: '', competencia: '', status: '', prioridade: '' };
}

@Component({
  selector: 'app-prazo-filters',
  standalone: true,
  imports: [ClientSelectComponent, LucideSearch, LucideX],
  template: `
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-4 flex flex-wrap items-end gap-4">
      <div class="flex flex-col gap-1.5 flex-1 min-w-[200px]">
        <label class="text-xs font-semibold uppercase tracking-wider text-slate-500">Busca</label>
        <div class="relative">
          <svg
            lucideSearch
            [size]="15"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          ></svg>
          <input
            type="text"
            placeholder="Ex.: FGTS, eSocial, DAS"
            class="w-full px-3 py-2.5 pl-9 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            [value]="filters.busca"
            (input)="patch({ busca: $any($event.target).value })"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <app-client-select
          id="filtro-cliente-deadline"
          label="Cliente"
          [clientes]="clientes"
          [value]="filters.clienteId"
          (clienteChange)="patch({ clienteId: $event?.id ?? null })"
          placeholder="Todos os clientes"
        ></app-client-select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold uppercase tracking-wider text-slate-500">Obrigação</label>
        <select
          class="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[150px]"
          [value]="filters.obrigacao"
          (change)="patch({ obrigacao: $any($event.target).value })"
        >
          <option value="">Todas</option>
          @for (nome of opcoesObrigacao; track nome) {
            <option [value]="nome">{{ nome }}</option>
          }
        </select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold uppercase tracking-wider text-slate-500">Categoria</label>
        <select
          class="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[150px]"
          [value]="filters.categoria"
          (change)="patch({ categoria: $any($event.target).value })"
        >
          <option value="">Todas</option>
          @for (categoria of categorias; track categoria) {
            <option [value]="categoria">{{ categoria }}</option>
          }
        </select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold uppercase tracking-wider text-slate-500">Competência</label>
        <select
          class="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[150px]"
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
          class="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[150px]"
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
        <label class="text-xs font-semibold uppercase tracking-wider text-slate-500">Prioridade</label>
        <select
          class="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[150px]"
          [value]="filters.prioridade"
          (change)="patch({ prioridade: $any($event.target).value })"
        >
          <option value="">Todas</option>
          @for (prioridade of prioridades; track prioridade) {
            <option [value]="prioridade">{{ labelPrioridade(prioridade) }}</option>
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
export class PrazoFiltersComponent {
  @Input() filters: PrazoFiltersModel = emptyPrazoFilters();
  @Input() clientes: Cliente[] = [];
  @Input() opcoesObrigacao: string[] = [];
  @Output() filtersChange = new EventEmitter<PrazoFiltersModel>();
  @Output() onClear = new EventEmitter<void>();

  readonly categorias = CATEGORIAS;
  readonly statusOpcoes = STATUS_PRAZO_OPCOES;
  readonly prioridades = PRIORIDADE_OPCOES;
  readonly competencias = ANOS.flatMap((ano) => MESES.map((mes) => `${mes}/${ano}`));

  patch(partial: Partial<PrazoFiltersModel>): void {
    this.filtersChange.emit({ ...this.filters, ...partial });
  }

  labelStatus(status: string): string {
    return statusPrazoMeta[status].label;
  }

  labelPrioridade(prioridade: string): string {
    return prioridadeMeta[prioridade].label;
  }
}
