import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { ModalComponent } from '../../../core/components/ui/modal.component';
import type { Cliente, Solicitacao, SolicitacaoItem } from '../../../core/domain/models';
import { MotivoRecusa, motivoRecusaLabel } from '../../../core/domain/solicitacao';

export interface RecusarItemPayload {
  motivo: string;
  detalhes: string;
  mensagem: string;
}

const inputClass =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700';

const mensagemPadrao = (dados: {
  cliente: Cliente | null;
  item: SolicitacaoItem | null;
  solicitacao: Solicitacao | null;
  motivo: string;
  detalhes: string;
}): string =>
  `Olá, ${dados.cliente?.responsavel ?? ''}! O item "${dados.item?.nome ?? ''}" da solicitação "${
    dados.solicitacao?.titulo ?? ''
  }" ` +
  `precisa ser reenviado. Motivo: ${dados.motivo ? motivoRecusaLabel[dados.motivo] : ''}${
    dados.detalhes ? ` — ${dados.detalhes}` : ''
  }. ` +
  `Reenvie somente este item pelo link: contadash.app/s/${dados.solicitacao?.token ?? ''}`;

@Component({
  selector: 'app-reject-item-modal',
  standalone: true,
  imports: [ModalComponent],
  template: `
    @if (open && item) {
      <app-modal [open]="open" (onClose)="onClose.emit()" title="Recusar document">
        <div class="p-6 space-y-5 bg-slate-50/50">
          <p class="text-sm text-slate-500">
            Item: <strong class="text-slate-700">{{ item.nome }}</strong>
          </p>

          <div>
            <label class="block text-sm font-semibold mb-1.5 text-slate-700">
              Motivo <span class="text-red-500">*</span>
            </label>
            <select
              class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
              [value]="motivo"
              (change)="setMotivo($any($event.target).value)"
            >
              <option value="">Selecione o motivo...</option>
              @for (opcao of motivos; track opcao) {
                <option [value]="opcao">{{ labelMotivo(opcao) }}</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1.5 text-slate-700">
              Detalhes para o cliente
              @if (motivo === MotivoRecusa.OUTRO) {
                <span class="text-red-500">*</span>
              } @else {
                <span class="font-normal text-slate-400">(opcional)</span>
              }
            </label>
            <textarea
              rows="3"
              class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
              placeholder="Ex.: faltam as páginas 3 e 4"
              [value]="detalhes"
              (input)="setDetalhes($any($event.target).value)"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1.5 text-slate-700">
              Pré-visualização da mensagem de retorno
              <span class="font-normal text-slate-400">(editável)</span>
            </label>
            <textarea
              rows="4"
              class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
              [value]="mensagem"
              (input)="mensagem = $any($event.target).value"
            ></textarea>
          </div>

          @if (error) {
            <div class="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl" role="alert">
              <p class="text-sm font-medium text-red-700">{{ error }}</p>
            </div>
          }
        </div>

        <div modalFooter class="px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            (click)="onClose.emit()"
            class="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            (click)="handleSubmit()"
            class="px-6 py-2.5 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-colors text-sm"
          >
            Recusar e enviar retorno
          </button>
        </div>
      </app-modal>
    }
  `,
})
export class RejectItemModalComponent implements OnChanges {
  @Input() open = false;
  @Input() solicitacao: Solicitacao | null = null;
  @Input() cliente: Cliente | null = null;
  @Input() item: SolicitacaoItem | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<RecusarItemPayload>();

  motivo = '';
  detalhes = '';
  mensagem = '';
  error = '';

  readonly MotivoRecusa = MotivoRecusa;
  readonly motivos = Object.values(MotivoRecusa);
  readonly labelMotivo = (motivo: string): string => motivoRecusaLabel[motivo];

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open'] && !changes['item']) return;
    if (!this.open || !this.item) return;

    this.motivo = '';
    this.detalhes = '';
    this.error = '';
    this.atualizarMensagem();
  }

  setMotivo(valor: string): void {
    this.motivo = valor;
    this.atualizarMensagem();
  }

  setDetalhes(valor: string): void {
    this.detalhes = valor;
    this.atualizarMensagem();
  }

  private atualizarMensagem(): void {
    this.mensagem = mensagemPadrao({
      cliente: this.cliente,
      item: this.item,
      solicitacao: this.solicitacao,
      motivo: this.motivo,
      detalhes: this.detalhes,
    });
  }

  handleSubmit(): void {
    if (!this.motivo) {
      this.error = 'Selecione o motivo da recusa.';
      return;
    }
    if (this.motivo === MotivoRecusa.OUTRO && !this.detalhes.trim()) {
      this.error = 'Descreva os detalhes para o cliente quando o motivo for "Outro".';
      return;
    }

    this.error = '';
    this.onConfirm.emit({ motivo: this.motivo, detalhes: this.detalhes.trim(), mensagem: this.mensagem });
  }
}
