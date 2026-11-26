import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  LucideCheck,
  LucideCopy,
  LucideExternalLink,
  LucideMessageCircle,
  LucideX,
} from '@lucide/angular';

import type { Cliente, Documento } from '../../../../core/domain/models';
import {
  type DocumentoCompartilhado,
  urlWhatsappCliente,
} from '../../../../core/services/document.service';

@Component({
  selector: 'app-document-share-modal',
  standalone: true,
  imports: [LucideCheck, LucideCopy, LucideExternalLink, LucideMessageCircle, LucideX],
  templateUrl: './document-share-modal.component.html',
  styleUrl: './document-share-modal.component.css',
})
export class DocumentShareModalComponent {
  @Input() open = false;
  @Input() documento: Documento | null = null;
  @Input() cliente: Cliente | null = null;
  @Input() share: DocumentoCompartilhado | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onToast = new EventEmitter<{ message: string; type: 'success' | 'info' | 'error' }>();

  copiado = false;

  get link(): string {
    return this.share?.url ?? '';
  }

  get mensagem(): string {
    const nome = this.documento?.nome ?? 'o documento';
    const competencia = this.documento?.competencia ? ` (${this.documento.competencia})` : '';
    return (
      `Olá! Segue o link do documento "${nome}"${competencia}: ${this.link}`
    );
  }

  get whatsappUrl(): string | null {
    return urlWhatsappCliente(this.cliente?.whatsapp, this.mensagem);
  }

  copiar(): void {
    if (!this.link) return;
    void navigator.clipboard
      ?.writeText(this.link)
      .then(() => {
        this.copiado = true;
        this.onToast.emit({ message: 'Link do documento copiado.', type: 'success' });
        setTimeout(() => (this.copiado = false), 2500);
      })
      .catch(() => this.onToast.emit({ message: 'Não foi possível copiar o link.', type: 'error' }));
  }

  abrirLink(): void {
    if (!this.link) return;
    window.open(this.link, '_blank', 'noopener,noreferrer');
  }

  abrirWhatsapp(): void {
    const url = this.whatsappUrl;
    if (!url) {
      this.onToast.emit({
        message: 'Este cliente não possui WhatsApp cadastrado. Copie o link para enviar manualmente.',
        type: 'info',
      });
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    this.onToast.emit({
      message: 'Conversa do WhatsApp aberta. Envie o link copiado para o cliente.',
      type: 'info',
    });
  }
}
