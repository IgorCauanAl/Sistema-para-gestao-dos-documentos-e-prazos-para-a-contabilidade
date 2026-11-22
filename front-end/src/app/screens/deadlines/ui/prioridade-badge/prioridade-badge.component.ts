import { Component, Input } from '@angular/core';

import { prioridadeMeta } from '../../../../core/domain/prazo';

@Component({
  selector: 'app-prioridade-badge',
  standalone: true,
  templateUrl: './prioridade-badge.component.html',
  styleUrl: './prioridade-badge.component.css',
})
export class PrioridadeBadgeComponent {
  @Input() prioridade = '';
  get meta() {
    return prioridadeMeta[this.prioridade] ?? null;
  }
}
