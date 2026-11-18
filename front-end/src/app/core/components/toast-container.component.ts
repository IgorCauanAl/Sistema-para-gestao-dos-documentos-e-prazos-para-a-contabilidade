import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideCheckCircle2, LucideInfo, LucideX } from '@lucide/angular';
import { Observable } from 'rxjs';

import { Toast, ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, LucideCheckCircle2, LucideInfo, LucideX],
  template: `
    <div class="fixed top-6 right-6 z-[60] flex flex-col gap-3" role="status" aria-live="polite">
      @for (toast of toasts$ | async; track toast.id) {
        <div
          class="bg-white border border-slate-200 shadow-lg rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[260px] animate-in fade-in slide-in-from-right duration-300"
        >
          @if (toast.type === 'info') {
            <svg lucideInfo [size]="20" class="text-indigo-500"></svg>
          } @else {
            <svg lucideCheckCircle2 [size]="20" class="text-green-600"></svg>
          }
          <span class="text-sm font-medium text-slate-700 flex-1">{{ toast.message }}</span>
          <button
            type="button"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Fechar notificação"
            class="text-slate-400 hover:text-slate-600"
          >
            <svg lucideX [size]="16"></svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent implements OnInit {
  toasts$!: Observable<Toast[]>;

  constructor(public toastService: ToastService) {}

  ngOnInit(): void {
    this.toasts$ = this.toastService.toasts$;
  }
}
