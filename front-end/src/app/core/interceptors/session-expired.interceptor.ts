import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { SessionExpirationService } from '../services/session-expiration.service';

function requerSessaoAutenticada(url: string): boolean {
  return !url.includes('/auth/login') && !url.includes('/public/');
}

/**
 * Trata respostas 401 de rotas autenticadas:
 * 1. guarda a rota atual no sessionStorage para retornar após o login;
 * 2. limpa o estado local de autenticação;
 * 3. exibe um aviso de sessão expirada;
 * 4. redireciona para /login uma única vez, mesmo com várias requisições 401.
 */
export const sessionExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notification = inject(NotificationService);
  const sessionExpiration = inject(SessionExpirationService);

  return next(req).pipe(
    catchError((error: unknown) => {
      const sessaoExpirada =
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        requerSessaoAutenticada(req.url);

      if (sessaoExpirada && !router.url.startsWith('/login')) {
        // O flag garante idempotência: apenas o primeiro 401 dispara o fluxo.
        if (sessionExpiration.iniciarRedirecionamento()) {
          sessionExpiration.salvarUrlRetorno(router.url);
          auth.logout();
          notification.error(error, { durationMs: 6000 });

          void router.navigate(['/login'], { replaceUrl: true });
        }
      }

      return throwError(() => error);
    }),
  );
};
