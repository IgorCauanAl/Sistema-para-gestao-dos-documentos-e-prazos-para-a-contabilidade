import { Component, EventEmitter, Input, Output } from '@angular/core';

import {
  ANOS,
  DocumentStatus,
  documentStatusMeta,
  MESES,
  TIPOS_DOCUMENTO,
} from '../../../../core/domain/documento';

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
  templateUrl: './document-filters.component.html',
  styleUrl: './document-filters.component.css',
})
export class DocumentFiltersComponent {
  @Input() filters: DocumentFiltersModel = emptyDocumentFilters();
  @Output() onChange = new EventEmitter<DocumentFiltersModel>();

  readonly tipos = TIPOS_DOCUMENTO.map((tipo) => tipo.nome);
  readonly statusOpcoes = Object.values(DocumentStatus);
  readonly competencias = ANOS.flatMap((ano) => MESES.map((mes) => `${mes}/${ano}`));

  patch(partial: Partial<DocumentFiltersModel>): void {
    this.onChange.emit({ ...this.filters, ...partial });
  }

  labelStatus(status: string): string {
    return documentStatusMeta[status].label;
  }
}
