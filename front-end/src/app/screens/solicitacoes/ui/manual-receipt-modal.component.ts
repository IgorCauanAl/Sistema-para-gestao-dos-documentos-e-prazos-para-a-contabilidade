import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { LucidePaperclip, LucideX } from '@lucide/angular';

import { ModalComponent } from '../../../core/components/ui/modal.component';
import { PrazoFieldsComponent } from '../../../core/components/ui/table.component';
import { paraBR } from '../../../core/domain/data';
import { ANTECEDENCIA_PADRAO } from '../../../core/domain/documento';
import type { SolicitacaoItem } from '../../../core/domain/models';

export interface RecebimentoManualPayload {
  arquivo: { nome: string; tamanho: string };
  canalOrigem: string;
  vencimento: string | null;
  diasAntecedencia: number;
  observacao: string;
}

const formatSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

@Component({
  selector: 'app-manual-receipt-modal',
  standalone: true,
  imports: [ModalComponent, PrazoFieldsComponent, LucidePaperclip, LucideX],
  template: `
    @if (open && item) {
      <app-modal
        [open]="open"
        (onClose)="onClose.emit()"
        title="Registrar recebimento manual"
        maxWidth="max-w-lg"
      >
        <div class="p-6 space-y-5 bg-slate-50/50">
          <p class="text-sm text-slate-500">
            Item: <strong class="text-slate-700">{{ item.nome }}</strong>
          </p>

          <div>
            <label class="block text-sm font-semibold mb-1.5 text-slate-700">
              Arquivo recebido <span class="text-red-500">*</span>
            </label>
            <div class="flex items-center gap-3">
              <input
                #fileInput
                type="file"
                (change)="handleFile(fileInput.files?.[0] ?? null)"
                class="block w-full text-sm text-slate-500 file:mr-3 file:px-4 file:py-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
              />
              @if (file) {
                <button
                  type="button"
                  aria-label="Remover arquivo"
                  (click)="file = null"
                  class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                  <svg lucideX [size]="16"></svg>
                </button>
              }
            </div>
            @if (file) {
              <p class="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                <svg lucidePaperclip [size]="14"></svg> {{ file.name }} · {{ formatSize(file.size) }}
              </p>
            }
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1.5 text-slate-700">Canal de origem</label>
            <select
              class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
              [value]="canalOrigem"
              (change)="canalOrigem = $any($event.target).value"
            >
              <option value="WhatsApp">WhatsApp</option>
              <option value="E-mail">E-mail</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <app-prazo-fields
            [vencimento]="vencimento"
            [diasAntecedencia]="diasAntecedencia"
            (onVencimentoChange)="vencimento = $event"
            (onDiasAntecedenciaChange)="diasAntecedencia = $event"
          ></app-prazo-fields>

          <div>
            <label class="block text-sm font-semibold mb-1.5 text-slate-700">
              Observação <span class="font-normal text-slate-400">(opcional)</span>
            </label>
            <textarea
              rows="3"
              class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
              placeholder="Ex.: cliente enviou pelo WhatsApp"
              [value]="observacao"
              (input)="observacao = $any($event.target).value"
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
            class="px-6 py-2.5 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors text-sm"
          >
            Salvar registro
          </button>
        </div>
      </app-modal>
    }
  `,
})
export class ManualReceiptModalComponent implements OnChanges {
  @Input() open = false;
  @Input() item: SolicitacaoItem | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<RecebimentoManualPayload>();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  file: File | null = null;
  canalOrigem = 'WhatsApp';
  vencimento = '';
  diasAntecedencia = ANTECEDENCIA_PADRAO;
  observacao = '';
  error = '';

  readonly formatSize = formatSize;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open'] || !this.open) return;

    this.file = null;
    this.canalOrigem = 'WhatsApp';
    this.vencimento = '';
    this.diasAntecedencia = ANTECEDENCIA_PADRAO;
    this.observacao = '';
    this.error = '';
  }

  handleFile(selected: File | null): void {
    this.file = selected;
    this.error = '';
  }

  handleSubmit(): void {
    if (!this.file) {
      this.error = 'Selecione o arquivo recebido.';
      return;
    }

    this.onConfirm.emit({
      arquivo: { nome: this.file.name, tamanho: formatSize(this.file.size) },
      canalOrigem: this.canalOrigem,
      vencimento: this.vencimento ? paraBR(this.vencimento) : null,
      diasAntecedencia: this.diasAntecedencia,
      observacao: this.observacao.trim(),
    });
  }
}
