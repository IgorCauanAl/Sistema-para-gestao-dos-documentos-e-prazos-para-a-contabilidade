import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { LucideCheck } from '@lucide/angular';

import { ModalComponent } from '../../../../core/components/ui/modal/modal.component';
import { PrazoFieldsComponent } from '../../../../core/components/ui/prazo-fields/prazo-fields.component';
import { paraBR } from '../../../../core/domain/data';
import { ANOS, MESES, ANTECEDENCIA_PADRAO } from '../../../../core/domain/documento';
import type { Solicitacao, SolicitacaoItem } from '../../../../core/domain/models';

export interface AprovarItemPayload {
  competencia: string;
  vencimento: string;
  diasAntecedencia: number;
}

@Component({
  selector: 'app-approve-item-modal',
  standalone: true,
  imports: [ModalComponent, PrazoFieldsComponent, LucideCheck],
  templateUrl: './approve-item-modal.component.html',
  styleUrl: './approve-item-modal.component.css',
})
export class ApproveItemModalComponent implements OnChanges {
  @Input() open = false;
  @Input() solicitacao: Solicitacao | null = null;
  @Input() item: SolicitacaoItem | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<AprovarItemPayload>();

  competencia = '';
  vencimento = '';
  diasAntecedencia = ANTECEDENCIA_PADRAO;
  error = '';

  readonly competencias = ANOS.flatMap((ano) => MESES.map((mes) => `${mes}/${ano}`));

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open'] && !changes['item']) return;
    if (!this.open || !this.item) return;

    this.competencia = this.solicitacao?.competencia ?? '';
    this.vencimento = '';
    this.diasAntecedencia = ANTECEDENCIA_PADRAO;
    this.error = '';
  }

  handleSubmit(): void {
    if (!this.vencimento) {
      this.error = 'Informe a data de vencimento do document.';
      return;
    }

    this.error = '';
    this.onConfirm.emit({
      competencia: this.competencia,
      vencimento: paraBR(this.vencimento),
      diasAntecedencia: this.diasAntecedencia,
    });
  }
}
