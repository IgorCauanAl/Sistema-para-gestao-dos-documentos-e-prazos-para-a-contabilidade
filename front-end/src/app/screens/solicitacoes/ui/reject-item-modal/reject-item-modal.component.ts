import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { ModalComponent } from '../../../../core/components/ui/modal/modal.component';
import type { Cliente, Solicitacao, SolicitacaoItem } from '../../../../core/domain/models';
import { MotivoRecusa, motivoRecusaLabel } from '../../../../core/domain/solicitacao';

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
  templateUrl: './reject-item-modal.component.html',
  styleUrl: './reject-item-modal.component.css',
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
