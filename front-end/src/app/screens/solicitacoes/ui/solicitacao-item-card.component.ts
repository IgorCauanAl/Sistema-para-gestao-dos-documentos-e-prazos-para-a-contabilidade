import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  LucideCheck,
  LucideClipboardPlus,
  LucideDownload,
  LucideEye,
  LucideFileText,
  LucideHistory,
  LucideX,
} from '@lucide/angular';

import { StatusBadgeComponent } from '../../../core/components/ui/status-badge.component';
import type { SolicitacaoItem, SolicitacaoTentativa } from '../../../core/domain/models';
import {
  acaoTentativaLabel,
  itemStatusMeta,
  motivoRecusaLabel,
  StatusItem,
} from '../../../core/domain/solicitacao';

const ultimaTentativaComArquivo = (item: SolicitacaoItem): SolicitacaoTentativa | null =>
  [...item.tentativas].reverse().find((t) => t.arquivo) ?? null;

const ultimaRecusa = (item: SolicitacaoItem): SolicitacaoTentativa | null =>
  [...item.tentativas].reverse().find((t) => t.acao === 'RECUSADO') ?? null;

@Component({
  selector: 'app-solicitacao-item-card',
  standalone: true,
  imports: [
    StatusBadgeComponent,
    LucideCheck,
    LucideClipboardPlus,
    LucideDownload,
    LucideEye,
    LucideFileText,
    LucideHistory,
    LucideX,
  ],
  template: `
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-5 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <span
            class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0"
          >
            <svg lucideFileText [size]="18"></svg>
          </span>
          <div class="min-w-0">
            <p class="font-semibold text-slate-800 truncate">{{ item.nome }}</p>
            <p class="text-xs text-slate-400">Formato esperado: {{ item.formatoEsperado }}</p>
          </div>
        </div>
        <app-status-badge [meta]="meta"></app-status-badge>
      </div>

      @if (item.status === StatusItem.RECUSADO && recusa) {
        <div class="px-4 py-3 bg-red-50 border border-red-100 rounded-2xl">
          <p class="text-xs font-semibold text-red-700">
            Recusado: {{ labelMotivo(recusa.motivo) }}
            @if (recusa.detalhes) {
              — {{ recusa.detalhes }}
            }
          </p>
        </div>
      }

      @if (arquivo) {
        <div
          class="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100"
        >
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Arquivo do cliente</p>
            <p class="text-sm font-medium text-slate-700 truncate">{{ arquivo.arquivo?.nome }}</p>
          </div>
          <span class="text-sm text-slate-500">{{ arquivo.arquivo?.tamanho }}</span>
          <span class="text-sm text-slate-500">{{ arquivo.data }} às {{ arquivo.hora }}</span>
          @if (arquivo.canalOrigem) {
            <span class="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-50 text-indigo-600">
              {{ arquivo.canalOrigem }}
            </span>
          }
          @if (arquivo.observacao) {
            <span class="text-sm text-slate-500 italic w-full">“{{ arquivo.observacao }}”</span>
          }
          <div class="flex items-center gap-2 ml-auto">
            <button
              type="button"
              title="Visualizar arquivo"
              [attr.aria-label]="'Visualizar ' + arquivo.arquivo?.nome"
              (click)="onViewFile.emit({ item: item, tentativa: arquivo })"
              class="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <svg lucideEye [size]="16"></svg>
            </button>
            <button
              type="button"
              title="Baixar arquivo"
              [attr.aria-label]="'Baixar ' + arquivo.arquivo?.nome"
              (click)="onDownload.emit({ item: item, tentativa: arquivo })"
              class="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <svg lucideDownload [size]="16"></svg>
            </button>
          </div>
        </div>
      }

      @if (item.status === StatusItem.APROVADO && item.vencimento) {
        <div
          class="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 bg-green-50 rounded-2xl border border-green-100"
        >
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-green-700/70">Competência</p>
            <p class="text-sm font-medium text-slate-700">{{ item.competencia }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-green-700/70">Vencimento</p>
            <p class="text-sm font-medium text-slate-700">{{ item.vencimento }}</p>
          </div>
        </div>
      }

      <div class="flex flex-wrap items-center gap-2">
        @if (enviado) {
          <button
            type="button"
            (click)="onApprove.emit(item)"
            class="flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            <svg lucideCheck [size]="16"></svg> Aceitar
          </button>
          <button
            type="button"
            (click)="onReject.emit(item)"
            class="flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            <svg lucideX [size]="16"></svg> Recusar
          </button>
        }

        @if (item.status === StatusItem.PENDENTE || item.status === StatusItem.RECUSADO) {
          <button
            type="button"
            (click)="onManualReceipt.emit(item)"
            class="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <svg lucideClipboardPlus [size]="16"></svg> Registrar recebimento manual
          </button>
        }
      </div>

      <div class="border-t border-slate-100 pt-3">
        <button
          type="button"
          (click)="historicoAberto = !historicoAberto"
          [attr.aria-expanded]="historicoAberto"
          class="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg lucideHistory [size]="15"></svg>
          Histórico de tentativas ({{ item.tentativas.length }})
        </button>

        @if (historicoAberto) {
          <ol class="mt-3 space-y-3">
            @if (item.tentativas.length === 0) {
              <li class="text-sm text-slate-400 italic">Nenhuma tentativa registrada.</li>
            }
            @for (t of item.tentativas; track t.id) {
              <li class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span class="text-slate-500">{{ t.data }} às {{ t.hora }}</span>
                <span [class]="corAcao(t.acao)">{{ labelAcao(t.acao) }}</span>
                @if (t.motivo) {
                  <span class="text-slate-500">({{ labelMotivo(t.motivo) }})</span>
                }
                @if (t.detalhes) {
                  <span class="text-slate-400 truncate">— {{ t.detalhes }}</span>
                }
                <span class="text-xs text-slate-400 ml-auto">IP {{ t.ip }}</span>
              </li>
            }
          </ol>
        }
      </div>
    </div>
  `,
})
export class SolicitacaoItemCardComponent {
  @Input() item!: SolicitacaoItem;
  @Output() onApprove = new EventEmitter<SolicitacaoItem>();
  @Output() onReject = new EventEmitter<SolicitacaoItem>();
  @Output() onManualReceipt = new EventEmitter<SolicitacaoItem>();
  @Output() onViewFile = new EventEmitter<{ item: SolicitacaoItem; tentativa: SolicitacaoTentativa }>();
  @Output() onDownload = new EventEmitter<{ item: SolicitacaoItem; tentativa: SolicitacaoTentativa }>();

  readonly StatusItem = StatusItem;
  historicoAberto = false;

  get meta() {
    return itemStatusMeta[this.item?.status] ?? null;
  }

  get arquivo(): SolicitacaoTentativa | null {
    return this.item ? ultimaTentativaComArquivo(this.item) : null;
  }

  get recusa(): SolicitacaoTentativa | null {
    return this.item ? ultimaRecusa(this.item) : null;
  }

  get enviado(): boolean {
    return this.item?.status === StatusItem.ENVIADO;
  }

  labelMotivo(motivo: string | null): string {
    return motivo ? motivoRecusaLabel[motivo] ?? motivo : '';
  }

  labelAcao(acao: string): string {
    return acaoTentativaLabel[acao] ?? acao;
  }

  corAcao(acao: string): string {
    if (acao === 'APROVADO') return 'font-semibold text-green-700';
    if (acao === 'RECUSADO') return 'font-semibold text-red-600';
    return 'font-semibold text-slate-700';
  }
}
