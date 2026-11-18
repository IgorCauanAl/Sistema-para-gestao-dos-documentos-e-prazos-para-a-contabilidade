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

import { CardComponent } from './card.component';

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
  template: `
    <app-card className="flex flex-col justify-between">
      <div class="flex justify-between items-start mb-4">
        <div class="space-y-1">
          <p class="text-sm font-medium text-slate-500">{{ title }}</p>
          <div class="flex items-end gap-3">
            <h4 class="text-3xl font-bold tracking-tight" [class]="theme.text">{{ value }}</h4>
            @if (trend) {
              <span
                class="flex items-center text-xs font-semibold px-2 py-1 rounded-md mb-1"
                [class]="trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                {{ trendUp ? '↑' : '↓' }} {{ trend }}
              </span>
            }
          </div>
        </div>
        <div class="p-3 rounded-2xl" [class]="theme.bg">
          @switch (icon) {
            @case ('users') {
              <svg lucideUsers [size]="24" [class]="theme.icon"></svg>
            }
            @case ('fileWarning') {
              <svg lucideFileWarning [size]="24" [class]="theme.icon"></svg>
            }
            @case ('clockAlert') {
              <svg lucideClockAlert [size]="24" [class]="theme.icon"></svg>
            }
            @case ('clipboardList') {
              <svg lucideClipboardList [size]="24" [class]="theme.icon"></svg>
            }
            @case ('inbox') {
              <svg lucideInbox [size]="24" [class]="theme.icon"></svg>
            }
            @case ('send') {
              <svg lucideSend [size]="24" [class]="theme.icon"></svg>
            }
            @default {
              <svg lucideCheckCircle2 [size]="24" [class]="theme.icon"></svg>
            }
          }
        </div>
      </div>
      @if (subtext) {
        <p class="text-xs text-slate-400 font-medium">{{ subtext }}</p>
      }
    </app-card>
  `,
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
