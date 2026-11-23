import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export interface ConfirmRequest extends Required<ConfirmOptions> {}

@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  private readonly requestSubject = new BehaviorSubject<ConfirmRequest | null>(null);
  private resolver: ((confirmado: boolean) => void) | null = null;

  readonly request$ = this.requestSubject.asObservable();

  /** Abre o modal de decisão e resolve com `true` apenas se o usuário confirmar. */
  confirm(options: ConfirmOptions): Promise<boolean> {
    // Se uma nova decisão abrir antes da anterior terminar, a anterior é cancelada.
    this.resolver?.(false);

    this.requestSubject.next({
      confirmLabel: 'Confirmar',
      cancelLabel: 'Cancelar',
      danger: true,
      ...options,
    });

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  confirmar(): void {
    this.finalizar(true);
  }

  cancelar(): void {
    this.finalizar(false);
  }

  private finalizar(confirmado: boolean): void {
    const resolver = this.resolver;
    this.resolver = null;
    this.requestSubject.next(null);
    resolver?.(confirmado);
  }
}
