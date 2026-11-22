import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAlertTriangle, LucideCalendarClock, LucideHourglass, LucideMail } from '@lucide/angular';

import { formatarData } from '../../../../core/domain/data';
import type { Cliente, Prazo } from '../../../../core/domain/models';
import { diasRestantes, estaAtrasado, StatusPrazo } from '../../../../core/domain/prazo';
import { ModalComponent } from '../../../../core/components/ui/modal/modal.component';

@Component({
  selector: 'app-email-simulado-modal',
  standalone: true,
  imports: [ModalComponent, LucideAlertTriangle, LucideCalendarClock, LucideHourglass, LucideMail],
  templateUrl: './email-simulado-modal.component.html',
  styleUrl: './email-simulado-modal.component.css',
})
export class EmailSimuladoModalComponent {
  @Input() open = false;
  @Input() prazos: Prazo[] = [];
  @Input() clientes: Cliente[] = [];
  @Input() hoje = new Date();
  @Output() onClose = new EventEmitter<void>();
  @Output() onSend = new EventEmitter<void>();

  get dataHoje(): string {
    return formatarData(this.hoje);
  }

  get secoes(): Array<{ titulo: string; tone: string; icon: string; itens: Prazo[] }> {
    const abertos = (this.prazos ?? []).filter((prazo) => prazo.status !== StatusPrazo.ENTREGUE);
    const atrasados = abertos.filter((prazo) => estaAtrasado(prazo, this.hoje));
    const proximos = abertos.filter((prazo) => {
      const dias = diasRestantes(prazo, this.hoje);
      return dias !== null && dias >= 0 && dias <= 7;
    });
    const aguardando = abertos.filter((prazo) => prazo.status === StatusPrazo.AGUARDANDO_CLIENTE);

    return [
      { titulo: 'Atrasados', tone: 'text-red-600', icon: 'alert', itens: atrasados },
      { titulo: 'Vencem nos próximos 7 dias', tone: 'text-amber-600', icon: 'clock', itens: proximos },
      { titulo: 'Aguardando o cliente', tone: 'text-indigo-600', icon: 'hourglass', itens: aguardando },
    ];
  }

  nomeCliente(clienteId: number): string {
    return this.clientes.find((cliente) => cliente.id === clienteId)?.razaoSocial ?? '—';
  }
}
