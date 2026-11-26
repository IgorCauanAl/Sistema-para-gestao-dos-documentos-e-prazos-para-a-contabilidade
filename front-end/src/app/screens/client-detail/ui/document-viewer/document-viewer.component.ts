import { Component, EventEmitter, HostListener, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  LucideAward,
  LucideCheck,
  LucideChevronLeft,
  LucideChevronRight,
  LucideCopy,
  LucideDownload,
  LucidePlus,
  LucideSend,
  LucideShieldOff,
  LucideShare2,
  LucideX,
  LucideZoomIn,
  LucideZoomOut,
} from '@lucide/angular';

import { FileIconComponent } from '../../../../core/components/ui/file-icon/file-icon.component';
import { StatusBadgeComponent } from '../../../../core/components/ui/status-badge/status-badge.component';
import { TimelineComponent, type TimelineItem } from '../../../../core/components/ui/timeline/timeline.component';
import type { DocumentoEvento, EventoAuditoria } from '../../../../core/domain/models';
import { NotificationService } from '../../../../core/services/notification.service';

export interface ViewerDocument {
  id: number | string;
  /** Presente quando o objeto veio da listagem; opcional para rascunhos locais. */
  clienteId?: number;
  nome: string;
  formato: string;
  versao: number;
  competencia: string;
  tamanho: string;
  status: string;
  hash: string;
  direcao?: string;
  historico: DocumentoEvento[];
  /** RF27.1: documento inativo preserva histórico, mas não permite novas ações. */
  ativo?: boolean;
  eventosAuditoria?: EventoAuditoria[];
}

const protocolStepsSaida = [
  { etapa: 'CRIADO', titulo: 'Criado' },
  { etapa: 'ENVIADO', titulo: 'Enviado' },
  { etapa: 'VISUALIZADO', titulo: 'Visualizado' },
  { etapa: 'BAIXADO', titulo: 'Baixado' },
];

const protocolStepsEntrada = [
  { etapa: 'CRIADO', titulo: 'Registrado' },
  { etapa: 'RECEBIDO', titulo: 'Recebido do cliente' },
  { etapa: 'VISUALIZADO', titulo: 'Visualizado' },
  { etapa: 'BAIXADO', titulo: 'Baixado' },
];

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [
    FileIconComponent,
    StatusBadgeComponent,
    TimelineComponent,
    LucideAward,
    LucideCheck,
    LucideChevronLeft,
    LucideChevronRight,
    LucideCopy,
    LucideDownload,
    LucidePlus,
    LucideSend,
    LucideShare2,
    LucideShieldOff,
    LucideX,
    LucideZoomIn,
    LucideZoomOut,
  ],
  templateUrl: './document-viewer.component.html',
  styleUrl: './document-viewer.component.css',
})
export class DocumentViewerComponent implements OnChanges {
  private readonly notification = inject(NotificationService);

  @Input() open = false;
  @Input() documento: ViewerDocument | null = null;
  @Input() versions: ViewerDocument[] = [];
  @Input() showActions = true;
  @Output() onSelectVersion = new EventEmitter<ViewerDocument>();
  @Output() onClose = new EventEmitter<void>();
  @Output() onResend = new EventEmitter<void>();
  @Output() onNewVersion = new EventEmitter<void>();
  @Output() onDownload = new EventEmitter<void>();
  @Output() onReceipt = new EventEmitter<void>();
  @Output() onShare = new EventEmitter<void>();
  @Output() onInactivate = new EventEmitter<void>();

  readonly Math = Math;
  zoom = 100;
  page = 1;
  copied = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] || changes['documento']) {
      if (this.open) {
        this.zoom = 100;
        this.page = 1;
        this.copied = false;
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.onClose.emit();
  }

  get inativo(): boolean {
    return this.documento?.ativo === false;
  }

  get isPdf(): boolean {
    return this.documento?.formato === 'pdf';
  }

  get steps(): Array<{ etapa: string; titulo: string }> {
    return this.documento?.direcao === 'ENTRADA' ? protocolStepsEntrada : protocolStepsSaida;
  }

  get timelineItems(): TimelineItem[] {
    const doc = this.documento;
    if (!doc) return [];

    return this.steps.map((step) => {
      const evento = doc.historico.find((h) => h.etapa === step.etapa);

      return {
        title: step.etapa === 'ENVIADO' && evento?.canal ? `Enviado (${evento.canal})` : step.titulo,
        done: Boolean(evento),
        date: evento?.data,
        time: evento?.hora,
        extra: evento?.ip ? `IP ${evento.ip}` : undefined,
      };
    });
  }

  get currentVersion(): ViewerDocument | null {
    const doc = this.documento;
    if (!doc) return null;
    return this.versions.find((v) => v.id === doc.id) ?? doc;
  }

  dataCriado(version: ViewerDocument): string {
    return version.historico.find((h) => h.etapa === 'CRIADO')?.data ?? '';
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.onClose.emit();
  }

  async copyHash(): Promise<void> {
    if (!this.documento) return;
    try {
      await navigator.clipboard.writeText(this.documento.hash);
      this.copied = true;
      this.notification.success('Hash copiado para a área de transferência.');
      setTimeout(() => (this.copied = false), 2000);
    } catch {
      this.copied = false;
      this.notification.error(new Error('Não foi possível copiar o hash do documento.'));
    }
  }
}
