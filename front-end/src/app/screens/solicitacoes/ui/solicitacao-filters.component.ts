import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ANOS, MESES } from '../../../core/domain/documento';
import type { Cliente } from '../../../core/domain/models';
import { solicitacaoStatusMeta, StatusSolicitacao } from '../../../core/domain/solicitacao';

export interface SolicitacaoFiltersModel {
  clienteId: string;
  status: string;
  competencia: string;
}

export function emptySolicitacaoFilters(): SolicitacaoFiltersModel {
  return { clienteId: '', status: '', competencia: '' };
}

const selectClass =
  'px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[170px]';

@Component({
  selector: 'app-solicitacao-filters',
  standalone: true,
  template: `
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-4 flex flex-wrap items-end gap-4">
      @if (showCliente) {
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold uppercase tracking-wider text-slate-500">Cliente</label>
          <select
            class="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[170px]"
            [value]="filters.clienteId"
            (change)="patch({ clienteId: $any($event.target).value })"
          >
            <option value="">Todos</option>
            @for (cliente of clientes; track cliente.id) {
              <option [value]="cliente.id">{{ cliente.razaoSocial }}</option>
            }
          </select>
        </div>
      }

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</label>
        <select
          class="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[170px]"
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
        <label class="text-xs font-semibold uppercase tracking-wider text-slate-500">Competência</label>
        <select
          class="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[170px]"
          [value]="filters.competencia"
          (change)="patch({ competencia: $any($event.target).value })"
        >
          <option value="">Todas</option>
          @for (competencia of competencias; track competencia) {
            <option [value]="competencia">{{ competencia }}</option>
          }
        </select>
      </div>
    </div>
  `,
})
export class SolicitacaoFiltersComponent {
  @Input() filters: SolicitacaoFiltersModel = emptySolicitacaoFilters();
  @Input() clientes: Cliente[] = [];
  @Input() showCliente = true;
  @Output() filtersChange = new EventEmitter<SolicitacaoFiltersModel>();

  readonly selectClass = selectClass;
  readonly statusOpcoes = Object.values(StatusSolicitacao);
  readonly competencias = ANOS.flatMap((ano) => MESES.map((mes) => `${mes}/${ano}`));

  patch(partial: Partial<SolicitacaoFiltersModel>): void {
    this.filtersChange.emit({ ...this.filters, ...partial });
  }

  labelStatus(status: string): string {
    return solicitacaoStatusMeta[status].label;
  }
}
