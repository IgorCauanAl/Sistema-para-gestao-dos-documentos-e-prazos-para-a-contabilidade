import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  LucideCheck,
  LucideClipboardPlus,
  LucideDownload,
  LucideEye,
  LucideFileText,
  LucideHistory,
  LucideX,
} from '@lucide/angular';

import { StatusBadgeComponent } from '../../../../core/components/ui/status-badge/status-badge.component';
import type { SolicitacaoItem, SolicitacaoTentativa } from '../../../../core/domain/models';
import {
  acaoTentativaLabel,
  itemStatusMeta,
  motivoRecusaLabel,
  StatusItem,
} from '../../../../core/domain/solicitacao';

const ultimaTentativaComArquivo = (item: SolicitacaoItem): SolicitacaoTentativa | null =>
  [...item.tentativas].reverse().find((t) => t.arquivo) ?? null;

const ultimaRecusa = (item: SolicitacaoItem): SolicitacaoTentativa | null =>
  [...item.tentativas].reverse().find((t) => t.acao === 'RECUSADO') ?? null;

@Component({
  selector: 'app-solicitacao-item-card',
  standalone: true,
  imports: [
    StatusBadgeComponent,
    LucideCheck,
    LucideClipboardPlus,
    LucideDownload,
    LucideEye,
    LucideFileText,
    LucideHistory,
    LucideX,
  ],
  templateUrl: './solicitacao-item-card.component.html',
  styleUrl: './solicitacao-item-card.component.css',
})
export class SolicitacaoItemCardComponent {
  @Input() item!: SolicitacaoItem;
  @Output() onApprove = new EventEmitter<SolicitacaoItem>();
  @Output() onReject = new EventEmitter<SolicitacaoItem>();
  @Output() onManualReceipt = new EventEmitter<SolicitacaoItem>();
  @Output() onViewFile = new EventEmitter<{ item: SolicitacaoItem; tentativa: SolicitacaoTentativa }>();
  @Output() onDownload = new EventEmitter<{ item: SolicitacaoItem; tentativa: SolicitacaoTentativa }>();

  readonly StatusItem = StatusItem;
  historicoAberto = false;

  get meta() {
    return itemStatusMeta[this.item?.status] ?? null;
  }

  get arquivo(): SolicitacaoTentativa | null {
    return this.item ? ultimaTentativaComArquivo(this.item) : null;
  }

  get recusa(): SolicitacaoTentativa | null {
    return this.item ? ultimaRecusa(this.item) : null;
  }

  get enviado(): boolean {
    return this.item?.status === StatusItem.ENVIADO;
  }

  labelMotivo(motivo: string | null): string {
    return motivo ? motivoRecusaLabel[motivo] ?? motivo : '';
  }

  labelAcao(acao: string): string {
    return acaoTentativaLabel[acao] ?? acao;
  }

  corAcao(acao: string): string {
    if (acao === 'APROVADO') return 'font-semibold text-green-700';
    if (acao === 'RECUSADO') return 'font-semibold text-red-600';
    return 'font-semibold text-slate-700';
  }
}
