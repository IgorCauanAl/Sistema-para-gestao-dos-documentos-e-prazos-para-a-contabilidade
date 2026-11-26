import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideBuilding2,
  LucideCheckCircle2,
  LucideHistory,
  LucideRotateCcw,
  LucidePaperclip,
  LucideTrash2,
  LucideUser,
  LucideX,
} from '@lucide/angular';

import type { Cliente, EventoAuditoria, Prazo } from '../../../../core/domain/models';
import {
  ESTAGIOS_BACKEND,
  etapaAtualLabel,
  estaAtrasado,
  prazoEncerrado,
  prioridadeEfetiva,
  textoRelativoVencimento,
  type EstagioBackend,
} from '../../../../core/domain/prazo';
import { EtapasChecklistComponent } from '../etapas-checklist/etapas-checklist.component';
import { AtrasoBadgeComponent } from '../atraso-badge/atraso-badge.component';
import { PrazoStatusBadgeComponent } from '../prazo-status-badge/prazo-status-badge.component';
import { PrioridadeBadgeComponent } from '../prioridade-badge/prioridade-badge.component';

@Component({
  selector: 'app-prazo-detail-panel',
  standalone: true,
  imports: [
    EtapasChecklistComponent,
    PrazoStatusBadgeComponent,
    PrioridadeBadgeComponent,
    AtrasoBadgeComponent,
    LucideArrowLeft,
    LucideArrowRight,
    LucideBuilding2,
    LucideCheckCircle2,
    LucideHistory,
    LucideRotateCcw,
    LucidePaperclip,
    LucideTrash2,
    LucideUser,
    LucideX,
  ],
  templateUrl: './prazo-detail-panel.component.html',
  styleUrl: './prazo-detail-panel.component.css',
})
export class PrazoDetailPanelComponent {
  @Input() open = false;
  @Input() deadline: Prazo | null = null;
  @Input() cliente: Cliente | null = null;
  @Input() hoje = new Date();
  @Input() eventosAuditoria: EventoAuditoria[] = [];
  @Output() onClose = new EventEmitter<void>();
  @Output() onMarcarEntregue = new EventEmitter<void>();
  @Output() onAnexarGuia = new EventEmitter<void>();
  @Output() onExcluir = new EventEmitter<void>();
  @Output() onMoverEtapa = new EventEmitter<EstagioBackend>();
  @Output() onReabrir = new EventEmitter<string>();

  justificativaReabertura = '';

  get atrasado(): boolean {
    return estaAtrasado(this.deadline, this.hoje);
  }

  get entregue(): boolean {
    return prazoEncerrado(this.deadline);
  }

  get relativo(): string {
    return this.deadline ? textoRelativoVencimento(this.deadline, this.hoje) : '';
  }

  get prioridadeAtual(): string {
    return prioridadeEfetiva(this.deadline, this.hoje);
  }

  get etapaAtual(): string {
    return etapaAtualLabel(this.deadline);
  }

  get historicoReverso() {
    return [...(this.deadline?.historico ?? [])].reverse();
  }

  get bloqueadoPorEstado(): boolean {
    return this.entregue || this.deadline?.status === 'CANCELADO';
  }

  get podeAvancar(): boolean {
    return !this.bloqueadoPorEstado && (this.deadline?.etapaAtual ?? 0) < ESTAGIOS_BACKEND.length - 1;
  }

  get podeRetroceder(): boolean {
    return !this.bloqueadoPorEstado && (this.deadline?.etapaAtual ?? 0) > 0;
  }

  get podeReabrir(): boolean {
    return this.entregue;
  }

  mover(delta: number): void {
    if (!this.deadline || this.bloqueadoPorEstado) return;
    const proxima = this.deadline.etapaAtual + delta;
    if (proxima < 0 || proxima >= ESTAGIOS_BACKEND.length) return;
    this.onMoverEtapa.emit(ESTAGIOS_BACKEND[proxima]);
  }

  reabrir(): void {
    const justificativa = this.justificativaReabertura.trim();
    if (!justificativa) return;
    this.onReabrir.emit(justificativa);
    this.justificativaReabertura = '';
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.onClose.emit();
  }
}
