import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { LucidePaperclip, LucideX } from '@lucide/angular';

import { ModalComponent } from '../../../../core/components/ui/modal/modal.component';
import { PrazoFieldsComponent } from '../../../../core/components/ui/prazo-fields/prazo-fields.component';
import { paraBR } from '../../../../core/domain/data';
import { ANTECEDENCIA_PADRAO } from '../../../../core/domain/documento';
import type { SolicitacaoItem } from '../../../../core/domain/models';

export interface RecebimentoManualPayload {
  file: File;
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
  templateUrl: './manual-receipt-modal.component.html',
  styleUrl: './manual-receipt-modal.component.css',
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
      file: this.file,
      arquivo: { nome: this.file.name, tamanho: formatSize(this.file.size) },
      canalOrigem: this.canalOrigem,
      vencimento: this.vencimento ? paraBR(this.vencimento) : null,
      diasAntecedencia: this.diasAntecedencia,
      observacao: this.observacao.trim(),
    });
  }
}
