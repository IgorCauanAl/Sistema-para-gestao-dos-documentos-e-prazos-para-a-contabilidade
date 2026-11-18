import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { LucideCheck, LucideCopy, LucideMail, LucideMessageCircle } from '@lucide/angular';

import { ModalComponent } from '../../../core/components/ui/modal.component';
import type { Cliente, Solicitacao } from '../../../core/domain/models';

@Component({
  selector: 'app-link-generated-modal',
  standalone: true,
  imports: [ModalComponent, LucideCheck, LucideCopy, LucideMail, LucideMessageCircle],
  template: `
    @if (solicitacao) {
      <app-modal [open]="open" (onClose)="onClose.emit()" title="Link gerado">
        <div class="p-6 space-y-5 bg-slate-50/50">
          <div>
            <p class="text-sm font-semibold text-slate-700 mb-2">Link da solicitação</p>
            <div class="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl">
              <span class="text-sm font-mono text-indigo-600 break-all flex-1">{{ link }}</span>
              <button
                type="button"
                (click)="copiar()"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition-colors shrink-0"
              >
                @if (copiado) {
                  <svg lucideCheck [size]="14"></svg>
                } @else {
                  <svg lucideCopy [size]="14"></svg>
                }
                {{ copiado ? 'Copiado' : 'Copiar' }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1.5 text-slate-700">
              Mensagem pronta para envio <span class="font-normal text-slate-400">(editável)</span>
            </label>
            <textarea
              rows="5"
              [value]="mensagem"
              (input)="mensagem = $any($event.target).value"
              class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
            ></textarea>
          </div>
        </div>

        <div modalFooter class="px-6 py-4 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            (click)="onToast.emit({ message: 'Envio por e-mail simulado.', type: 'info' })"
            class="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
          >
            <svg lucideMail [size]="16"></svg> Enviar por e-mail
          </button>
          <button
            type="button"
            (click)="onToast.emit({ message: 'WhatsApp aberto (simulado).', type: 'info' })"
            class="flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <svg lucideMessageCircle [size]="16"></svg> Abrir WhatsApp
          </button>
        </div>
      </app-modal>
    }
  `,
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
