import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideCheck } from '@lucide/angular';

import type { Prazo } from '../../../core/domain/models';
import { ETAPAS_PADRAO, StatusPrazo } from '../../../core/domain/prazo';

@Component({
  selector: 'app-etapas-checklist',
  standalone: true,
  imports: [LucideCheck],
  template: `
    <ul class="space-y-2">
      @for (nome of etapas; track nome; let index = $index) {
        <li>
          <button
            type="button"
            role="checkbox"
            [attr.aria-checked]="concluida(index)"
            [attr.aria-label]="'Etapa ' + nome"
            [disabled]="entregue"
            (click)="onToggle.emit(index)"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl border text-left transition-colors disabled:cursor-not-allowed"
            [class]="
              concluida(index)
                ? 'border-green-200 bg-green-50'
                : atual(index)
                  ? 'border-indigo-300 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
            "
          >
            <span
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
              [class]="
                concluida(index)
                  ? 'bg-green-500 border-green-500 text-white'
                  : atual(index)
                    ? 'border-indigo-500 bg-white'
                    : 'border-slate-300 bg-white'
              "
            >
              @if (concluida(index)) {
                <svg lucideCheck [size]="12" [strokeWidth]="3"></svg>
              }
            </span>

            <span
              class="text-sm font-medium"
              [class]="
                concluida(index) ? 'text-green-700' : atual(index) ? 'text-indigo-700' : 'text-slate-600'
              "
            >
              {{ nome }}
            </span>

            @if (atual(index)) {
              <span class="ml-auto text-[11px] font-semibold uppercase tracking-wider text-indigo-500">
                Etapa atual
              </span>
            }
          </button>
        </li>
      }
    </ul>
  `,
})
export class EtapasChecklistComponent {
  @Input() prazo!: Prazo;
  @Output() onToggle = new EventEmitter<number>();

  readonly etapas = ETAPAS_PADRAO;

  get entregue(): boolean {
    return this.prazo.status === StatusPrazo.ENTREGUE;
  }

  concluida(index: number): boolean {
    return this.prazo.etapasConcluidas.includes(index);
  }

  atual(index: number): boolean {
    return !this.concluida(index) && index === this.prazo.etapaAtual && !this.entregue;
  }
}
