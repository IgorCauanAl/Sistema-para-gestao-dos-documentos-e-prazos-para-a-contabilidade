import { ErrorHandler, Injectable, inject } from '@angular/core';

import { NotificationService } from '../services/notification.service';
import { foiTratado } from './api-error';

/**
 * Captura erros não tratados pela aplicação (templates, event handlers, promises
 * não capturadas) e garante um feedback visual único para o usuário.
 */
@Injectable()
export class GlobalExceptionHandler implements ErrorHandler {
  private readonly notification = inject(NotificationService);

  handleError(error: unknown): void {
    console.error('[ContaDash] Erro não tratado:', error);

    // Interceptors e telas com feedback próprio já exibiram o aviso.
    if (foiTratado(error)) return;

    this.notification.error(error, { marcarTratado: false });
  }
}
