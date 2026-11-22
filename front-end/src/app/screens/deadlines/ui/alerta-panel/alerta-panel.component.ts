import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  LucideAlertTriangle,
  LucideBellRing,
  LucideCalendarRange,
  LucideMail,
  LucideX,
} from '@lucide/angular';

import type { Cliente, Prazo } from '../../../../core/domain/models';
import { estaAtrasado } from '../../../../core/domain/prazo';
import type { AlertasPrazo } from '../../../../core/services/prazo.service';

@Component({
  selector: 'app-alerta-panel',
  standalone: true,
  imports: [CommonModule, LucideAlertTriangle, LucideBellRing, LucideCalendarRange, LucideMail, LucideX],
  templateUrl: './alerta-panel.component.html',
  styleUrl: './alerta-panel.component.css',
})
export class AlertaPanelComponent {
  @Input() open = false;
  @Input() alertas: AlertasPrazo = { atrasados: [], semana: [], janela: [], total: 0 };
  @Input() clientes: Cliente[] = [];
  @Input() hoje = new Date();
  @Output() onClose = new EventEmitter<void>();
  @Output() onSelect = new EventEmitter<Prazo>();
  @Output() onSimularEmail = new EventEmitter<void>();

  nomeCliente(clienteId: number): string {
    return this.clientes.find((cliente) => cliente.id === clienteId)?.razaoSocial ?? '—';
  }

  estaAtrasado(prazo: Prazo, hoje: Date): boolean {
    return estaAtrasado(prazo, hoje);
  }
}
