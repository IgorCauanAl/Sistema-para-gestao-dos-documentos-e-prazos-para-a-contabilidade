import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { LucideCheck, LucideCopy, LucideMail, LucideMessageCircle } from '@lucide/angular';

import { ModalComponent } from '../../../../core/components/ui/modal/modal.component';
import type { Cliente, Solicitacao } from '../../../../core/domain/models';

@Component({
  selector: 'app-link-generated-modal',
  standalone: true,
  imports: [ModalComponent, LucideCheck, LucideCopy, LucideMail, LucideMessageCircle],
  templateUrl: './link-generated-modal.component.html',
  styleUrl: './link-generated-modal.component.css',
})
export class LinkGeneratedModalComponent implements OnChanges {
  @Input() open = false;
  @Input() solicitacao: Solicitacao | null = null;
  @Input() cliente: Cliente | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onToast = new EventEmitter<{ message: string; type: 'success' | 'info' }>();

  mensagem = '';
  copiado = false;

  get link(): string {
    return this.solicitacao ? `contadash.app/s/${this.solicitacao.token}` : '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.iniciar();
    }
  }

  private iniciar(): void {
    const sol = this.solicitacao;
    const cliente = this.cliente;
    if (!sol || !cliente) return;

    this.mensagem =
      `Olá, ${cliente.responsavel?.split(' ')[0] ?? cliente.responsavel}! Aqui é o escritório contábil. ` +
      `Precisamos dos documentos: "${sol.titulo}" (competência ${sol.competencia}). ` +
      `Prazo para envio: ${sol.prazo}. ` +
      `Acesse o link seguro: ${this.link}`;
    this.copiado = false;
  }

  async copiar(): Promise<void> {
    try {
      await navigator.clipboard.writeText(`https://${this.link}`);
      this.copiado = true;
      this.onToast.emit({ message: 'Link copiado para a área de transferência.', type: 'success' });
      setTimeout(() => (this.copiado = false), 2500);
    } catch {
      this.onToast.emit({ message: 'Não foi possível copiar o link.', type: 'info' });
    }
  }
}
