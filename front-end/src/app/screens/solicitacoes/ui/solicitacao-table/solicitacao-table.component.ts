import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideEye } from '@lucide/angular';

import { ProgressBarComponent } from '../../../../core/components/ui/progress-bar/progress-bar.component';
import { StatusBadgeComponent } from '../../../../core/components/ui/status-badge/status-badge.component';
import { TableComponent } from '../../../../core/components/ui/table/table.component';
import type { Solicitacao } from '../../../../core/domain/models';
import {
  calcularStatusSolicitacao,
  progressoSolicitacao,
  solicitacaoStatusMeta,
} from '../../../../core/domain/solicitacao';

@Component({
  selector: 'app-solicitacao-table',
  standalone: true,
  imports: [TableComponent, StatusBadgeComponent, ProgressBarComponent, LucideEye],
  templateUrl: './solicitacao-table.component.html',
  styleUrl: './solicitacao-table.component.css',
})
export class SolicitacaoTableComponent {
  @Input() solicitacoes: Solicitacao[] = [];
  @Input() nomeCliente: (clienteId: number) => string = () => '—';
  @Input() showCliente = true;
  @Output() onOpen = new EventEmitter<Solicitacao>();

  progresso(sol: Solicitacao) {
    return progressoSolicitacao(sol);
  }

  metaStatus(sol: Solicitacao) {
    return solicitacaoStatusMeta[calcularStatusSolicitacao(sol)];
  }
}
