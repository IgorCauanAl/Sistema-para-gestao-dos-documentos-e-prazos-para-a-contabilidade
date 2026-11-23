import { HttpErrorResponse } from '@angular/common/http';

/**
 * Marca erros que já tiveram feedback exibido por um interceptor ou pela tela.
 * Usado pelo ErrorHandler global para não duplicar avisos.
 */
export const ERRO_TRATADO = Symbol('contadash.erroTratado');

export interface ApiError {
  status: number;
  code: string;
  message: string;
  detail: string | null;
  fieldErrors: Record<string, string>;
}

type ApiErrorBody = {
  status?: unknown;
  code?: unknown;
  message?: unknown;
  detail?: unknown;
  title?: unknown;
  error?: unknown;
  errors?: unknown;
  fieldErrors?: unknown;
};

const FALLBACKS: Record<number, string> = {
  0: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
  400: 'Revise os dados informados e tente novamente.',
  401: 'Sua sessão expirou ou as credenciais são inválidas. Entre novamente para continuar.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'O registro solicitado não foi encontrado.',
  409: 'Esta operação conflita com um registro existente.',
  413: 'O arquivo excede o limite de 25 MB.',
  415: 'Formato de arquivo não aceito.',
  422: 'Os dados informados não puderam ser processados. Revise e tente novamente.',
  500: 'Não foi possível concluir a operação. Tente novamente em instantes.',
};

const MENSAGENS_GENERICAS = /erro interno do servidor|internal server error|unauthorized|forbidden/i;

function texto(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function mensagemDoCorpo(body: ApiErrorBody): string | null {
  const candidatos = [body.message, body.detail, body.title, body.error];
  const mensagem = candidatos.map(texto).find((valor) => valor && !MENSAGENS_GENERICAS.test(valor));
  return mensagem ?? null;
}

function campoTexto(value: unknown): string | null {
  if (typeof value === 'string') return texto(value);
  if (Array.isArray(value)) return value.map(texto).find(Boolean) ?? null;
  return null;
}

function fieldErrorsDoCorpo(body: ApiErrorBody): Record<string, string> {
  const origem = body.fieldErrors ?? body.errors;
  if (!origem || typeof origem !== 'object' || Array.isArray(origem)) return {};

  const erros: Record<string, string> = {};
  for (const [campo, valor] of Object.entries(origem)) {
    const mensagem = campoTexto(valor);
    if (mensagem) erros[campo] = mensagem;
  }
  return erros;
}

/** Converte qualquer erro recebido (HTTP, JS ou back-end) em um formato único. */
export function normalizarErro(error: unknown): ApiError {
  const status =
    error instanceof HttpErrorResponse
      ? error.status
      : typeof error === 'object' && error !== null && 'status' in error && typeof error.status === 'number'
        ? error.status
        : 0;

  let body: ApiErrorBody = {};
  if (error instanceof HttpErrorResponse) {
    body = (error.error ?? {}) as ApiErrorBody;
  } else if (typeof error === 'string') {
    body = { message: error };
  } else if (error instanceof Error) {
    body = { message: error.message };
  } else if (error && typeof error === 'object') {
    body = error as ApiErrorBody;
  }

  const fieldErrors = fieldErrorsDoCorpo(body);
  const mensagem =
    mensagemDoCorpo(body) ??
    Object.values(fieldErrors)[0] ??
    FALLBACKS[status] ??
    FALLBACKS[500]!;

  const code = texto(body.code)?.toUpperCase() ?? (status > 0 ? `HTTP_${status}` : 'UNKNOWN');

  return {
    status,
    code,
    message: mensagem,
    detail: texto(body.detail),
    fieldErrors,
  };
}

/** Mantém a API usada pelos interceptors e testes existentes. */
export function mensagemErroHttp(error: unknown): string {
  return normalizarErro(error).message;
}

export function marcarErroTratado(error: unknown): void {
  if (!error || typeof error !== 'object') return;
  try {
    Object.defineProperty(error, ERRO_TRATADO, { value: true, configurable: true });
  } catch {
    // Objetos congelados simplesmente não recebem a marca.
  }
}

export function foiTratado(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  return (error as Record<symbol, unknown>)[ERRO_TRATADO] === true;
}
