import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { LucideAlertTriangle, LucideCalendarClock } from '@lucide/angular';

import { ModalComponent } from '../../../core/components/ui/modal.component';
import { paraBR, paraData } from '../../../core/domain/data';
import type { Prazo } from '../../../core/domain/models';
import {
  ehDiaUtil,
  MOTIVOS_REPROGRAMACAO_OPCOES,
  MotivoReprogramacao,
  motivoReprogramacaoLabel,
} from '../../../core/domain/prazo';

export interface ReprogramarPayload {
  novaData: string;
  motivo: string;
  observacao: string;
}

@Component({
  selector: 'app-reprogramar-modal',
  standalone: true,
  imports: [ModalComponent, LucideAlertTriangle, LucideCalendarClock],
  template: `
    @if (prazo) {
      <app-modal [open]="open" (onClose)="onClose.emit()" title="Reprogramar vencimento">
        <div class="p-6 space-y-5 bg-slate-50/50">
          <p class="text-sm text-slate-500">
            {{ prazo.obrigacao }} · {{ prazo.competencia }}. Vencimento atual:
            <strong class="text-slate-700">{{ prazo.vencimentoAtual }}</strong>.
          </p>

          <div>
            <label class="block text-sm font-semibold mb-1.5 text-slate-700">
              Nova data de vencimento <span class="text-red-500">*</span>
            </label>
            <input
              type="date"
              class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
              [value]="novaData"
              (input)="novaData = $any($event.target).value"
            />
            <p class="mt-1.5 text-xs text-slate-400">
              O vencimento original ({{ prazo.vencimentoOriginal }}) é mantido no histórico.
            </p>
          </div>

          @if (novaData && !diaUtil) {
            <div class="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
              <svg lucideAlertTriangle [size]="18" class="text-amber-600 shrink-0 mt-0.5"></svg>
              <p class="text-sm font-medium text-amber-800">
                A data escolhida cai em fim de semana ou feriado.
              </p>
            </div>
          }

          <div>
            <label class="block text-sm font-semibold mb-1.5 text-slate-700">Motivo</label>
            <select
              class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
              [value]="motivo"
              (change)="motivo = $any($event.target).value"
            >
              @for (opcao of motivos; track opcao) {
                <option [value]="opcao">{{ labelMotivo(opcao) }}</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1.5 text-slate-700">
              Observação <span class="font-normal text-slate-400">(opcional)</span>
            </label>
            <textarea
              rows="3"
              class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
              placeholder="Ex.: guia reemitida após correção da base de cálculo"
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
            class="px-6 py-2.5 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors text-sm flex items-center gap-2"
          >
            <svg lucideCalendarClock [size]="16"></svg> Reprogramar
          </button>
        </div>
      </app-modal>
    }
  `,
})
export class ReprogramarModalComponent implements OnChanges {
  @Input() open = false;
  @Input() prazo: Prazo | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<ReprogramarPayload>();

  novaData = '';
  motivo: string = MotivoReprogramacao.RECALCULO_GUIA;
  observacao = '';
  error = '';
  readonly motivos = MOTIVOS_REPROGRAMACAO_OPCOES;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.novaData = '';
      this.motivo = MotivoReprogramacao.RECALCULO_GUIA;
      this.observacao = '';
      this.error = '';
    }
  }

  get diaUtil(): boolean {
    return this.novaData ? ehDiaUtil(paraData(paraBR(this.novaData))!) : true;
  }

  labelMotivo(opcao: string): string {
    return motivoReprogramacaoLabel[opcao];
  }

  handleSubmit(): void {
    if (!this.novaData) {
      this.error = 'Informe a nova data de vencimento.';
      return;
    }
    if (!this.diaUtil) {
      this.error = 'Selecione um dia útil para o vencimento.';
      return;
    }
    this.error = '';
    this.onConfirm.emit({
      novaData: paraBR(this.novaData),
      motivo: this.motivo,
      observacao: this.observacao.trim(),
    });
  }
}
