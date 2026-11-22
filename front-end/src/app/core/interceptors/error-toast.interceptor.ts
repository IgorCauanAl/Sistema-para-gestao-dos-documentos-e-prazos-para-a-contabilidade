import { HttpErrorResponse, HttpInterceptorFn, HttpContextToken } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ToastService } from '../services/toast.service';

export const SKIP_GLOBAL_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

type ProblemDetail = {
  detail?: unknown;
  message?: unknown;
  title?: unknown;
  errors?: Record<string, unknown>;
};

function texto(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

/** Extrai a mensagem amigável devolvida pelo back-end (RFC 9457 ou mensagem simples). */
export function mensagemErroHttp(error: HttpErrorResponse): string {
  const body = error.error as ProblemDetail | string | null;

  if (typeof body === 'string') {
    const mensagem = texto(body);
    if (mensagem) return mensagem;
  } else if (body && typeof body === 'object') {
    const detail = texto(body.detail) ?? texto(body.message) ?? texto(body.title);
    if (detail && !/erro interno do servidor/i.test(detail)) return detail;

    const primeiroErro = body.errors ? Object.values(body.errors).map(texto).find(Boolean) : null;
    if (primeiroErro) return primeiroErro;
  }

  switch (error.status) {
    case 0:
      return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    case 400:
      return 'Revise os dados informados e tente novamente.';
    case 401:
      return 'Sua sessão expirou ou as credenciais são inválidas. Entre novamente para continuar.';
    case 403:
      return 'Você não tem permissão para realizar esta ação.';
    case 404:
      return 'O registro solicitado não foi encontrado.';
    case 409:
      return 'Esta operação conflita com um registro existente.';
    case 413:
      return 'O arquivo excede o limite de 25 MB.';
    case 415:
      return 'Formato de arquivo não aceito.';
    case 422:
      return 'Os dados informados não puderam ser processados. Revise e tente novamente.';
    default:
      return 'Não foi possível concluir a operação. Tente novamente.';
  }
}

/**
 * Exibe um toast de erro para toda requisição HTTP que falha.
 * Login e upload do portal já têm mensagem inline própria, então são ignorados aqui.
 */
export const errorToastInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const jaTemFeedbackInline =
    req.context.get(SKIP_GLOBAL_ERROR_TOAST) ||
    req.url.includes('/auth/login') ||
    (req.method === 'POST' && req.url.includes('/public/requests/') && req.url.includes('/upload'));

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!jaTemFeedbackInline) {
        toastService.show(mensagemErroHttp(error), 'error');
      }
      return throwError(() => error);
    }),
  );
};
