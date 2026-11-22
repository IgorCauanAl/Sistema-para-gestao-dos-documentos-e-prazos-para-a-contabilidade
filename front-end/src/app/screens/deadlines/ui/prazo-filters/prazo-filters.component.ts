import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideSearch, LucideX } from '@lucide/angular';

import { ClientSelectComponent } from '../../../documents/ui/client-select/client-select.component';
import { ANOS, MESES } from '../../../../core/domain/documento';
import type { Cliente } from '../../../../core/domain/models';
import {
  CATEGORIAS,
  PRIORIDADE_OPCOES,
  prioridadeMeta,
  STATUS_PRAZO_OPCOES,
  statusPrazoMeta,
} from '../../../../core/domain/prazo';

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
  templateUrl: './prazo-filters.component.html',
  styleUrl: './prazo-filters.component.css',
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
