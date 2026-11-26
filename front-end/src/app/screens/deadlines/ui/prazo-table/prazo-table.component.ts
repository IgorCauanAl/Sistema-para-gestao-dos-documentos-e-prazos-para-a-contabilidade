import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideCheckCircle2, LucideEye, LucideTrash2 } from '@lucide/angular';

import { TableComponent } from '../../../../core/components/ui/table/table.component';
import type { Prazo } from '../../../../core/domain/models';
import {
  diasRestantes,
  etapaAtualLabel,
  estaAtrasado,
  prioridadeEfetiva,
  StatusPrazo,
  textoRelativoVencimento,
} from '../../../../core/domain/prazo';
import { AtrasoBadgeComponent } from '../atraso-badge/atraso-badge.component';
import { PrazoStatusBadgeComponent } from '../prazo-status-badge/prazo-status-badge.component';
import { PrioridadeBadgeComponent } from '../prioridade-badge/prioridade-badge.component';

@Component({
  selector: 'app-prazo-table',
  standalone: true,
  imports: [
    TableComponent,
    PrazoStatusBadgeComponent,
    PrioridadeBadgeComponent,
    AtrasoBadgeComponent,
    LucideCheckCircle2,
    LucideEye,
    LucideTrash2,
  ],
  templateUrl: './prazo-table.component.html',
  styleUrl: './prazo-table.component.css',
})
export class PrazoTableComponent {
  @Input() prazos: Prazo[] = [];
  @Input() nomeCliente: (clienteId: number) => string = () => '—';
  @Input() hoje = new Date();
  @Output() onView = new EventEmitter<Prazo>();
  @Output() onEntregar = new EventEmitter<Prazo>();
  @Output() onExcluir = new EventEmitter<Prazo>();

  readonly StatusPrazo = StatusPrazo;

  atrasado(prazo: Prazo): boolean {
    return estaAtrasado(prazo, this.hoje);
  }

  venceHoje(prazo: Prazo): boolean {
    return diasRestantes(prazo, this.hoje) === 0 && prazo.status !== StatusPrazo.ENTREGUE;
  }

  relativo(prazo: Prazo): string {
    return textoRelativoVencimento(prazo, this.hoje);
  }

  etapaAtual(prazo: Prazo): string {
    return etapaAtualLabel(prazo);
  }

  prioridadeEfetiva(prazo: Prazo, hoje: Date): string {
    return prioridadeEfetiva(prazo, hoje);
  }
}
