import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  LucideAlertTriangle,
  LucideCalendarClock,
  LucideCalendarRange,
  LucideListChecks,
} from '@lucide/angular';

export interface PrazoContagens {
  ATRASADOS: number;
  HOJE: number;
  SEMANA: number;
  PENDENTES: number;
}

@Component({
  selector: 'app-prazo-summary-cards',
  standalone: true,
  imports: [LucideAlertTriangle, LucideCalendarClock, LucideCalendarRange, LucideListChecks],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      @for (card of cards; track card.id) {
        <button
          type="button"
          [attr.aria-pressed]="ativo === card.id"
          (click)="onClick.emit(ativo === card.id ? null : card.id)"
          class="text-left bg-white rounded-3xl shadow-sm border-2 p-5 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          [class]="ativo === card.id ? 'border-indigo-500 ring-1 ring-indigo-500/40' : 'border-slate-200/50'"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1 min-w-0">
              <p class="text-sm font-medium text-slate-500 truncate">{{ card.label }}</p>
              <p class="text-3xl font-bold tracking-tight text-slate-800">{{ contagens[card.id] ?? 0 }}</p>
            </div>
            <span class="p-3 rounded-2xl shrink-0" [class]="card.tone">
              @switch (card.id) {
                @case ('ATRASADOS') {
                  <svg lucideAlertTriangle [size]="22"></svg>
                }
                @case ('HOJE') {
                  <svg lucideCalendarClock [size]="22"></svg>
                }
                @case ('SEMANA') {
                  <svg lucideCalendarRange [size]="22"></svg>
                }
                @default {
                  <svg lucideListChecks [size]="22"></svg>
                }
              }
            </span>
          </div>
        </button>
      }
    </div>
  `,
})
export class PrazoSummaryCardsComponent {
  @Input() contagens: PrazoContagens = { ATRASADOS: 0, HOJE: 0, SEMANA: 0, PENDENTES: 0 };
  @Input() ativo: string | null = null;
  @Output() onClick = new EventEmitter<string | null>();

  readonly cards = [
    { id: 'ATRASADOS', label: 'Atrasados', tone: 'text-red-600 bg-red-50' },
    { id: 'HOJE', label: 'Vencem hoje', tone: 'text-orange-600 bg-orange-50' },
    { id: 'SEMANA', label: 'Vencem nesta semana', tone: 'text-amber-600 bg-amber-50' },
    { id: 'PENDENTES', label: 'Pendentes', tone: 'text-blue-600 bg-blue-50' },
  ] as const;
}
