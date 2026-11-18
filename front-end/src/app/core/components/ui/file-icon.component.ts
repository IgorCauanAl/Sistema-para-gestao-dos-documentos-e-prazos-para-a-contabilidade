import { Component, Input } from '@angular/core';
import { LucideFileCode, LucideFileSpreadsheet, LucideFileText } from '@lucide/angular';

@Component({
  selector: 'app-file-icon',
  standalone: true,
  imports: [LucideFileText, LucideFileSpreadsheet, LucideFileCode],
  template: `
    <span class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" [class]="meta.className">
      @switch (meta.kind) {
        @case ('spreadsheet') {
          <svg lucideFileSpreadsheet [size]="size"></svg>
        }
        @case ('code') {
          <svg lucideFileCode [size]="size"></svg>
        }
        @default {
          <svg lucideFileText [size]="size"></svg>
        }
      }
    </span>
  `,
})
export class FileIconComponent {
  @Input() formato = '';
  @Input() size = 18;

  get meta(): { kind: string; className: string } {
    switch ((this.formato || '').toLowerCase()) {
      case 'pdf':
        return { kind: 'text', className: 'bg-red-50 text-red-500' };
      case 'xlsx':
      case 'csv':
        return { kind: 'spreadsheet', className: 'bg-green-50 text-green-600' };
      case 'xml':
        return { kind: 'code', className: 'bg-amber-50 text-amber-600' };
      case 'ofx':
        return { kind: 'code', className: 'bg-blue-50 text-blue-600' };
      default:
        return { kind: 'text', className: 'bg-slate-100 text-slate-500' };
    }
  }
}
