import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAlertTriangle, LucideCalendarClock, LucideHourglass, LucideMail } from '@lucide/angular';

import { formatarData } from '../../../core/domain/data';
import type { Cliente, Prazo } from '../../../core/domain/models';
import { diasRestantes, estaAtrasado, StatusPrazo } from '../../../core/domain/prazo';
import { ModalComponent } from '../../../core/components/ui/modal.component';

@Component({
  selector: 'app-email-simulado-modal',
  standalone: true,
  imports: [ModalComponent, LucideAlertTriangle, LucideCalendarClock, LucideHourglass, LucideMail],
  template: `
    <app-modal [open]="open" (onClose)="onClose.emit()" title="Prévia do resumo diário" maxWidth="max-w-2xl">
      <div class="p-6 space-y-5 bg-slate-50/50">
        <div class="rounded-3xl border border-slate-200/70 bg-white p-5 space-y-4">
          <div class="border-b border-slate-100 pb-3 space-y-1">
            <p class="text-xs text-slate-400">
              <span class="font-semibold text-slate-500">De:</span> resumo&commat;contadash.app
            </p>
            <p class="text-xs text-slate-400">
              <span class="font-semibold text-slate-500">Para:</span> equipes&commat;contadash.app
            </p>
            <p class="text-sm font-semibold text-slate-700">Resumo de prazos — {{ dataHoje }}</p>
          </div>

          <p class="text-sm text-slate-600">
            Bom dia! Segue o panorama de obrigações do escritório para hoje:
          </p>

          @for (secao of secoes; track secao.titulo) {
            <div>
              <p class="text-sm font-semibold flex items-center gap-2" [class]="secao.tone">
                @switch (secao.icon) {
                  @case ('alert') {
                    <svg lucideAlertTriangle [size]="15"></svg>
                  }
                  @case ('clock') {
                    <svg lucideCalendarClock [size]="15"></svg>
                  }
                  @default {
                    <svg lucideHourglass [size]="15"></svg>
                  }
                }
                {{ secao.titulo }} ({{ secao.itens.length }})
              </p>
              @if (secao.itens.length === 0) {
                <p class="text-xs text-slate-400 mt-1 ml-6">Nenhum item.</p>
              } @else {
                <ul class="mt-1.5 ml-6 space-y-1">
                  @for (prazo of secao.itens; track prazo.id) {
                    <li class="text-sm text-slate-600">
                      <span class="font-medium text-slate-700">{{ prazo.obrigacao }}</span> ·
                      {{ prazo.competencia }} — {{ nomeCliente(prazo.clienteId) }} (vence
                      {{ prazo.vencimentoAtual }})
                    </li>
                  }
                </ul>
              }
            </div>
          }

          <p class="text-xs text-slate-400 pt-2 border-t border-slate-100">
            Este é um envio simulado — nenhum e-mail é disparado de verdade nesta demonstração.
          </p>
        </div>
      </div>

      <div modalFooter class="px-6 py-4 flex justify-end gap-3">
        <button
          type="button"
          (click)="onClose.emit()"
          class="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
        >
          Fechar
        </button>
        <button
          type="button"
          (click)="onSend.emit()"
          class="px-6 py-2.5 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors text-sm flex items-center gap-2"
        >
          <svg lucideMail [size]="16"></svg> Enviar resumo
        </button>
      </div>
    </app-modal>
  `,
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
