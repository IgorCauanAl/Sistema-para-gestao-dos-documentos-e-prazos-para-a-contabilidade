import { Component, Input } from '@angular/core';

import { prioridadeMeta, statusPrazoMeta } from '../../../core/domain/prazo';
import { StatusBadgeComponent } from '../../../core/components/ui/status-badge.component';

@Component({
  selector: 'app-prazo-status-badge',
  standalone: true,
  imports: [StatusBadgeComponent],
  template: `@if (meta) { <app-status-badge [meta]="meta"></app-status-badge> }`,
})
export class PrazoStatusBadgeComponent {
  @Input() status = '';
  get meta() {
    return statusPrazoMeta[this.status] ?? null;
  }
}

@Component({
  selector: 'app-prioridade-badge',
  standalone: true,
  template: `
    @if (meta) {
      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border" [class]="meta.badge">
        {{ meta.label }}
      </span>
    }
  `,
})
export class PrioridadeBadgeComponent {
  @Input() prioridade = '';
  get meta() {
    return prioridadeMeta[this.prioridade] ?? null;
  }
}

@Component({
  selector: 'app-atraso-badge',
  standalone: true,
  template: `
    <span
      class="inline-flex items-center px-2 py-0.5 rounded-full border border-red-200 bg-red-100 text-red-700 text-[11px] font-semibold whitespace-nowrap"
    >
      Atrasado
    </span>
  `,
})
export class AtrasoBadgeComponent {}
