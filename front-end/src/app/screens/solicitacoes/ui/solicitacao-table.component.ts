import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideEye, LucideSend, LucideXCircle } from '@lucide/angular';

import { ProgressBarComponent } from '../../../core/components/ui/progress-bar.component';
import { StatusBadgeComponent } from '../../../core/components/ui/status-badge.component';
import { TableComponent } from '../../../core/components/ui/table.component';
import type { Solicitacao } from '../../../core/domain/models';
import {
  calcularStatusSolicitacao,
  progressoSolicitacao,
  solicitacaoStatusMeta,
} from '../../../core/domain/solicitacao';

@Component({
  selector: 'app-solicitacao-table',
  standalone: true,
  imports: [TableComponent, StatusBadgeComponent, ProgressBarComponent, LucideEye, LucideSend, LucideXCircle],
  template: `
    <app-table>
      <table class="w-full text-left border-collapse">
        <thead>
          <tr
            class="border-b border-slate-200/50 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500"
          >
            @if (showCliente) {
              <th class="p-4 pl-6 font-semibold">Cliente</th>
            }
            <th class="p-4 font-semibold">Solicitação</th>
            <th class="p-4 font-semibold">Competência</th>
            <th class="p-4 font-semibold min-w-[180px]">Progresso</th>
            <th class="p-4 font-semibold">Prazo</th>
            <th class="p-4 font-semibold">Status</th>
            <th class="p-4 pr-6 font-semibold text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          @for (sol of solicitacoes; track sol.id) {
            <tr
              (click)="onOpen.emit(sol)"
              class="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              @if (showCliente) {
                <td class="p-4 pl-6 text-sm font-medium text-slate-700">{{ nomeCliente(sol.clienteId) }}</td>
              }
              <td class="p-4 text-sm font-semibold text-slate-700">{{ sol.titulo }}</td>
              <td class="p-4 text-sm text-slate-600">{{ sol.competencia }}</td>
              <td class="p-4">
                <div class="space-y-1.5">
                  <span class="text-xs font-medium text-slate-500">{{ progresso(sol).label }}</span>
                  <app-progress-bar
                    [pct]="progresso(sol).pct"
                    [tone]="progresso(sol).pct === 100 ? 'green' : 'indigo'"
                  ></app-progress-bar>
                </div>
              </td>
              <td class="p-4 text-sm text-slate-600">{{ sol.prazo }}</td>
              <td class="p-4">
                <app-status-badge [meta]="metaStatus(sol)"></app-status-badge>
              </td>
              <td class="p-4 pr-6">
                <div class="flex justify-center items-center gap-2">
                  <button
                    type="button"
                    title="Ver solicitação"
                    [attr.aria-label]="'Ver solicitação ' + sol.titulo"
                    (click)="$event.stopPropagation(); onOpen.emit(sol)"
                    class="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <svg lucideEye [size]="16"></svg>
                  </button>
                  <button
                    type="button"
                    title="Reenviar link"
                    [attr.aria-label]="'Reenviar link de ' + sol.titulo"
                    (click)="$event.stopPropagation(); onResend.emit(sol)"
                    class="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <svg lucideSend [size]="16"></svg>
                  </button>
                  <button
                    type="button"
                    title="Cancelar solicitação"
                    [attr.aria-label]="'Cancelar solicitação ' + sol.titulo"
                    (click)="$event.stopPropagation(); onCancel.emit(sol)"
                    class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg lucideXCircle [size]="16"></svg>
                  </button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </app-table>
  `,
})
export class SolicitacaoTableComponent {
  @Input() solicitacoes: Solicitacao[] = [];
  @Input() nomeCliente: (clienteId: number) => string = () => '—';
  @Input() showCliente = true;
  @Output() onOpen = new EventEmitter<Solicitacao>();
  @Output() onResend = new EventEmitter<Solicitacao>();
  @Output() onCancel = new EventEmitter<Solicitacao>();

  progresso(sol: Solicitacao) {
    return progressoSolicitacao(sol);
  }

  metaStatus(sol: Solicitacao) {
    return solicitacaoStatusMeta[calcularStatusSolicitacao(sol)];
  }
}
