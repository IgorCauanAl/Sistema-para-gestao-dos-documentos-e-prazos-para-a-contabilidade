import { Component, Input } from '@angular/core';

import { documentStatusMeta, type StatusMeta } from '../../../domain/documento';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css',
})
export class StatusBadgeComponent {
  @Input() status = '';
  @Input() meta: StatusMeta | null = null;
  @Input() className = '';

  get info(): StatusMeta | null {
    return this.meta ?? documentStatusMeta[this.status] ?? null;
  }
}
