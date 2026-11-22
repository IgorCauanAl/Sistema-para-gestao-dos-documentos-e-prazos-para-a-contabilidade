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

import { FileIconComponent } from '../../../../core/components/ui/file-icon/file-icon.component';
import { StatusBadgeComponent } from '../../../../core/components/ui/status-badge/status-badge.component';
import { TableComponent } from '../../../../core/components/ui/table/table.component';
import {
  DocumentStatus,
  emRiscoSemAbertura,
  LIMITE_DIAS_SEM_ABERTURA,
  prazoDocumentoMeta,
  statusPrazoDocumento,
  ultimaAtividade,
} from '../../../../core/domain/documento';
import type { Documento } from '../../../../core/domain/models';

export interface DocumentsSort {
  key: string;
  dir: 'asc' | 'desc';
}

type AcaoContextual = { label: string; tipo: 'enviar' | 'protocolo'; icon: 'send' | 'rotate' | 'fileSearch' };

const contextualAction = (doc: Documento): AcaoContextual | null => {
  switch (doc.status) {
    case DocumentStatus.CRIADO:
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
  templateUrl: './documents-table.component.html',
  styleUrl: './documents-table.component.css',
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
