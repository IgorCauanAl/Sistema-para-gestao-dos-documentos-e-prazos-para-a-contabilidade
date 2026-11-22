import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  LucideBuilding2,
  LucideCheckCircle2,
  LucideHistory,
  LucidePaperclip,
  LucideUser,
  LucideX,
} from '@lucide/angular';

import type { Cliente, Prazo } from '../../../../core/domain/models';
import {
  etapaAtualLabel,
  estaAtrasado,
  prazoEncerrado,
  prioridadeEfetiva,
  textoRelativoVencimento,
  vencimentoFoiAjustado,
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
    LucideBuilding2,
    LucideCheckCircle2,
    LucideHistory,
    LucidePaperclip,
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
  @Output() onClose = new EventEmitter<void>();
  @Output() onMarcarEntregue = new EventEmitter<void>();
  @Output() onAnexarGuia = new EventEmitter<void>();

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

  get ajustado(): boolean {
    return vencimentoFoiAjustado(this.deadline);
  }

  get etapaAtual(): string {
    return etapaAtualLabel(this.deadline);
  }

  get historicoReverso() {
    return [...(this.deadline?.historico ?? [])].reverse();
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.onClose.emit();
  }
}
