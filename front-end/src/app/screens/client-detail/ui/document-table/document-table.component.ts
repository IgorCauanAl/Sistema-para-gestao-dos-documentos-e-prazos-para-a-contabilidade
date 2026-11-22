import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideEye, LucideFileSearch, LucideRotateCcw, LucideSend } from '@lucide/angular';

import { FileIconComponent } from '../../../../core/components/ui/file-icon/file-icon.component';
import { StatusBadgeComponent } from '../../../../core/components/ui/status-badge/status-badge.component';
import { TableComponent } from '../../../../core/components/ui/table/table.component';
import {
  DocumentStatus,
  prazoDocumentoMeta,
  statusPrazoDocumento,
} from '../../../../core/domain/documento';
import type { Documento } from '../../../../core/domain/models';

type AcaoLinha = { label: string; tipo: 'send' | 'view' };

@Component({
  selector: 'app-document-table',
  standalone: true,
  imports: [
    TableComponent,
    StatusBadgeComponent,
    FileIconComponent,
    LucideEye,
    LucideFileSearch,
    LucideRotateCcw,
    LucideSend,
  ],
  templateUrl: './document-table.component.html',
  styleUrl: './document-table.component.css',
})
export class DocumentTableComponent {
  @Input() documents: Documento[] = [];
  @Output() onView = new EventEmitter<Documento>();
  @Output() onSend = new EventEmitter<Documento>();

  readonly DocumentStatus = DocumentStatus;

  acao(doc: Documento): AcaoLinha {
    switch (doc.status) {
      case DocumentStatus.CRIADO:
      case DocumentStatus.RASCUNHO:
        return { label: 'Enviar', tipo: 'send' };
      case DocumentStatus.ENVIADO:
      case DocumentStatus.VISUALIZADO:
        return { label: 'Reenviar', tipo: 'send' };
      default:
        return { label: 'Ver protocolo', tipo: 'view' };
    }
  }

  prazoMeta(doc: Documento) {
    const prazo = statusPrazoDocumento(doc);
    return prazo ? prazoDocumentoMeta[prazo] : null;
  }
}
