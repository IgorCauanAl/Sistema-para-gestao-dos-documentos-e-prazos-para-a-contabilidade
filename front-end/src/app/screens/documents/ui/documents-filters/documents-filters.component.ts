import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideSearch, LucideX } from '@lucide/angular';

import {
  ANOS,
  CANAIS_DOCUMENTO,
  documentStatusMeta,
  MESES,
  STATUS_DOCUMENTO_FILTROS,
} from '../../../../core/domain/documento';
import type { Cliente } from '../../../../core/domain/models';
import { ClientSelectComponent } from '../client-select/client-select.component';

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
  templateUrl: './documents-filters.component.html',
  styleUrl: './documents-filters.component.css',
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
