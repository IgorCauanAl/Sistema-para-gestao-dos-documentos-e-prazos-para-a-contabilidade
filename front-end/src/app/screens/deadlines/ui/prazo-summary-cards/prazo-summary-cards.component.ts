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
  templateUrl: './prazo-summary-cards.component.html',
  styleUrl: './prazo-summary-cards.component.css',
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
