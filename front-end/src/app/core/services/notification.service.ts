import { Injectable, inject } from '@angular/core';

import { marcarErroTratado, normalizarErro } from '../errors/api-error';
import { ConfirmOptions, ConfirmationService } from './confirmation.service';
import { ToastService } from './toast.service';

export interface ErrorNotificationOptions {
  durationMs?: number;
  /** Evita que o ErrorHandler global exiba o mesmo erro novamente. */
  marcarTratado?: boolean;
}

/**
 * Ponto único de feedback da aplicação: snackbar/toast para avisos e erros de API
 * e modal de confirmação para decisões críticas (ex.: sair, excluir, recusar).
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly toastService = inject(ToastService);
  private readonly confirmation = inject(ConfirmationService);

  success(message: string, durationMs?: number): void {
    this.toastService.show(message, 'success', durationMs);
  }

  info(message: string, durationMs?: number): void {
    this.toastService.show(message, 'info', durationMs);
  }

  warning(message: string, durationMs?: number): void {
    this.toastService.show(message, 'warning', durationMs);
  }

  error(error: unknown, options: ErrorNotificationOptions = {}): void {
    const normalizado = normalizarErro(error);
    this.toastService.show(normalizado.message, 'error', options.durationMs ?? 5000);

    if (options.marcarTratado !== false) {
      marcarErroTratado(error);
    }
  }

  confirm(options: ConfirmOptions): Promise<boolean> {
    return this.confirmation.confirm(options);
  }
}
