import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<Toast[]>([]);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private toasts: Toast[] = [];
  private proximoId = 1;

  readonly toasts$ = this.toastsSubject.asObservable();

  show(message: string, type: ToastType = 'success', durationMs = 4000): void {
    const id = this.proximoId++;
    this.toasts = [...this.toasts, { id, message, type }];
    this.toastsSubject.next(this.toasts);

    this.timers.set(id, setTimeout(() => this.dismiss(id), durationMs));
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.toastsSubject.next(this.toasts);
  }
}
