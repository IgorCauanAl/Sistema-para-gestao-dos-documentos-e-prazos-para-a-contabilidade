import { Component, Input } from '@angular/core';

import { documentStatusMeta, type StatusMeta } from '../../domain/documento';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    @if (info) {
      <span
        class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border"
        [class]="info.badge + ' ' + className"
      >
        {{ info.label }}
      </span>
    }
  `,
})
export class StatusBadgeComponent {
  @Input() status = '';
  @Input() meta: StatusMeta | null = null;
  @Input() className = '';

  get info(): StatusMeta | null {
    return this.meta ?? documentStatusMeta[this.status] ?? null;
  }
}
