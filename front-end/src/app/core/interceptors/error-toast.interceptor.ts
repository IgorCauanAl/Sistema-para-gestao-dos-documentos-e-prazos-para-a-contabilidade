import { HttpErrorResponse, HttpInterceptorFn, HttpContextToken } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { mensagemErroHttp } from '../errors/api-error';
import { NotificationService } from '../services/notification.service';

export const SKIP_GLOBAL_ERROR_TOAST = new HttpContextToken<boolean>(() => false);
export { mensagemErroHttp };

/**
 * Exibe um toast de erro para toda requisição HTTP que falha.
 * Login e upload do portal já têm mensagem inline própria, então são ignorados aqui.
 */
export const errorToastInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);
  const jaTemFeedbackInline =
    req.context.get(SKIP_GLOBAL_ERROR_TOAST) ||
    req.url.includes('/auth/login') ||
    (req.method === 'POST' && req.url.includes('/public/requests/') && req.url.includes('/upload'));

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // O 401 de sessão autenticada tem um fluxo dedicado (aviso + redirecionamento).
      const falhaDeSessao =
        error.status === 401 &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/public/');

      if (!jaTemFeedbackInline && !falhaDeSessao) {
        notification.error(error);
      }
      return throwError(() => error);
    }),
  );
};
