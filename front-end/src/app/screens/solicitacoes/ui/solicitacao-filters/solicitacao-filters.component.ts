import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ANOS, MESES } from '../../../../core/domain/documento';
import type { Cliente } from '../../../../core/domain/models';
import { solicitacaoStatusMeta, StatusSolicitacao } from '../../../../core/domain/solicitacao';

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
  templateUrl: './solicitacao-filters.component.html',
  styleUrl: './solicitacao-filters.component.css',
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
