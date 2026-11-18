import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSubject = new Subject<Toast[]>();
  private toasts: Toast[] = [];

  readonly toasts$ = this.toastsSubject.asObservable();

  show(message: string, type: ToastType = 'success'): void {
    const id = Date.now() + Math.random();
    this.toasts = [...this.toasts, { id, message, type }];
    this.toastsSubject.next(this.toasts);

    setTimeout(() => this.dismiss(id), 4000);
  }

  dismiss(id: number): void {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.toastsSubject.next(this.toasts);
  }
}
