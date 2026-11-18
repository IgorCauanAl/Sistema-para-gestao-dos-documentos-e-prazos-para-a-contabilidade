import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { LucideCheck } from '@lucide/angular';

import { ModalComponent } from '../../../core/components/ui/modal.component';
import { PrazoFieldsComponent } from '../../../core/components/ui/table.component';
import { paraBR } from '../../../core/domain/data';
import { ANOS, MESES, ANTECEDENCIA_PADRAO } from '../../../core/domain/documento';
import type { Solicitacao, SolicitacaoItem } from '../../../core/domain/models';

export interface AprovarItemPayload {
  competencia: string;
  vencimento: string;
  diasAntecedencia: number;
}

@Component({
  selector: 'app-approve-item-modal',
  standalone: true,
  imports: [ModalComponent, PrazoFieldsComponent, LucideCheck],
  template: `
    @if (open && item) {
      <app-modal [open]="open" (onClose)="onClose.emit()" title="Aceitar document">
        <div class="p-6 space-y-5 bg-slate-50/50">
          <p class="text-sm text-slate-500">
            Item: <strong class="text-slate-700">{{ item.nome }}</strong>
          </p>

          <div>
            <label class="block text-sm font-semibold mb-1.5 text-slate-700">
              Competência <span class="text-red-500">*</span>
            </label>
            <select
              class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
              [value]="competencia"
              (change)="competencia = $any($event.target).value"
            >
              @for (valor of competencias; track valor) {
                <option [value]="valor">{{ valor }}</option>
              }
            </select>
          </div>

          <app-prazo-fields
            [vencimento]="vencimento"
            [diasAntecedencia]="diasAntecedencia"
            [vencimentoObrigatorio]="true"
            (onVencimentoChange)="vencimento = $event"
            (onDiasAntecedenciaChange)="diasAntecedencia = $event"
          ></app-prazo-fields>

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
            class="px-6 py-2.5 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
          >
            <svg lucideCheck [size]="16"></svg> Aceitar e registrar
          </button>
        </div>
      </app-modal>
    }
  `,
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
