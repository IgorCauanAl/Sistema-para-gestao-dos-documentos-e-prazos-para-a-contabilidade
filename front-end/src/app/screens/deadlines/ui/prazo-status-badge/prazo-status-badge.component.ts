import { Component, Input } from '@angular/core';

import { StatusBadgeComponent } from '../../../../core/components/ui/status-badge/status-badge.component';
import { statusPrazoMeta } from '../../../../core/domain/prazo';

@Component({
  selector: 'app-prazo-status-badge',
  standalone: true,
  imports: [StatusBadgeComponent],
  templateUrl: './prazo-status-badge.component.html',
  styleUrl: './prazo-status-badge.component.css',
})
export class PrazoStatusBadgeComponent {
  @Input() status = '';
  get meta() {
    return statusPrazoMeta[this.status] ?? null;
  }
}
