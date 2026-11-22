import { Component, Input } from '@angular/core';
import {
  LucideCheckCircle2,
  LucideClipboardList,
  LucideClockAlert,
  LucideFileWarning,
  LucideInbox,
  LucideSend,
  LucideUsers,
} from '@lucide/angular';

import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [
    CardComponent,
    LucideUsers,
    LucideFileWarning,
    LucideClockAlert,
    LucideCheckCircle2,
    LucideClipboardList,
    LucideInbox,
    LucideSend,
  ],
  templateUrl: './summary-card.component.html',
  styleUrl: './summary-card.component.css',
})
export class SummaryCardComponent {
  @Input() title = '';
  @Input() value = '';
  @Input() subtext = '';
  @Input() trend = '';
  @Input() trendUp = false;
  @Input() icon = '';
  @Input() colorTheme = '';

  get theme(): { text: string; bg: string; icon: string } {
    switch (this.colorTheme) {
      case 'warning':
        return { text: 'text-orange-700', bg: 'bg-orange-50', icon: 'text-orange-600' };
      case 'danger':
        return { text: 'text-red-700', bg: 'bg-red-50', icon: 'text-red-600' };
      case 'success':
        return { text: 'text-green-700', bg: 'bg-green-50', icon: 'text-green-600' };
      default:
        return { text: 'text-slate-700', bg: 'bg-slate-50', icon: 'text-slate-600' };
    }
  }
}
