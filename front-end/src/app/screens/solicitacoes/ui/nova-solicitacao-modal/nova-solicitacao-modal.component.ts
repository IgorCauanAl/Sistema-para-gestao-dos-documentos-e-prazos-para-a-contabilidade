import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { LucideFileText, LucidePlus, LucideTrash2 } from '@lucide/angular';

import { ModalComponent } from '../../../../core/components/ui/modal/modal.component';
import { paraBR } from '../../../../core/domain/data';
import { ANOS, CANAIS_ENVIO, MESES } from '../../../../core/domain/documento';
import type { Cliente, SolicitacaoNova } from '../../../../core/domain/models';
import { FORMATOS_ESPERADOS, SUGESTOES_ITENS } from '../../../../core/domain/solicitacao';

const inputClass =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700';

@Component({
  selector: 'app-nova-solicitacao-modal',
  standalone: true,
  imports: [ModalComponent, LucideFileText, LucidePlus, LucideTrash2],
  templateUrl: './nova-solicitacao-modal.component.html',
  styleUrl: './nova-solicitacao-modal.component.css',
})
export class NovaSolicitacaoModalComponent implements OnChanges {
  @Input() open = false;
  @Input() clientes: Cliente[] = [];
  @Input() clienteInicial: Cliente | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<SolicitacaoNova>();

  clienteNome = '';
  titulo = '';
  competencia = '09/2026';
  prazo = '';
  itens: Array<{ nome: string; formato: string }> = [{ nome: '', formato: 'PDF' }];
  instrucoes = '';
  validadeDias = '7';
  canal = 'WhatsApp';
  error = '';

  readonly sugestoes = SUGESTOES_ITENS;
  readonly formatos = FORMATOS_ESPERADOS;
  readonly canais = CANAIS_ENVIO;
  readonly competencias = ANOS.flatMap((ano) => MESES.map((mes) => `${mes}/${ano}`));

  get clienteTravado(): boolean {
    return Boolean(this.clienteInicial);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open'] || !this.open) return;

    const cliente = this.clienteInicial ?? null;
    this.clienteNome = cliente?.razaoSocial ?? '';
    this.titulo = cliente ? `Documentos de ${this.competencia}` : '';
    this.prazo = '';
    this.itens = [{ nome: '', formato: 'PDF' }];
    this.instrucoes = '';
    this.validadeDias = '7';
    this.canal = cliente?.canalPreferido ?? 'WhatsApp';
    this.error = '';
  }

  addItem(nome = ''): void {
    this.itens = [...this.itens, { nome, formato: 'PDF' }];
  }

  setItem(index: number, patch: Partial<{ nome: string; formato: string }>): void {
    this.itens = this.itens.map((item, i) => (i === index ? { ...item, ...patch } : item));
  }

  removeItem(index: number): void {
    this.itens = this.itens.filter((_, i) => i !== index);
  }

  handleSubmit(enviarAgora: boolean): void {
    const cliente = this.clienteTravado
      ? this.clienteInicial
      : this.clientes.find(
          (c) => c.razaoSocial.toLowerCase() === (this.clienteNome ?? '').trim().toLowerCase()
        );

    if (!cliente) {
      this.error = 'Selecione um cliente válido.';
      return;
    }
    if (!this.titulo.trim()) {
      this.error = 'Informe o título da solicitação.';
      return;
    }
    const itensValidos = this.itens.filter((item) => item.nome.trim());
    if (itensValidos.length === 0) {
      this.error = 'Adicione pelo menos 1 item à solicitação.';
      return;
    }
    if (!this.prazo) {
      this.error = 'Informe o deadline para envio.';
      return;
    }

    this.error = '';
    this.onSubmit.emit({
      clienteId: cliente.id,
      titulo: this.titulo.trim(),
      competencia: this.competencia,
      prazo: paraBR(this.prazo),
      instrucoes: this.instrucoes.trim(),
      canal: this.canal,
      validadeDias: Number(this.validadeDias),
      itens: itensValidos.map((item) => ({ nome: item.nome.trim(), formato: item.formato })),
      enviarAgora,
    });
  }
}
