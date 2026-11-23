import { Injectable } from '@angular/core';

/** Chave usada para lembrar a rota em que o usuário estava antes da sessão expirar. */
export const RETURN_URL_STORAGE_KEY = 'contadash.returnUrl';

/**
 * Centraliza o estado do redirecionamento por sessão expirada.
 *
 * O flag de idempotência evita que várias respostas 401 simultâneas disparem
 * múltiplos redirecionamentos, múltiplos avisos e limpezas repetidas do estado.
 */
@Injectable({ providedIn: 'root' })
export class SessionExpirationService {
  private redirecionando = false;

  get redirecionandoParaLogin(): boolean {
    return this.redirecionando;
  }

  /** Retorna true apenas para a primeira chamada enquanto o redirecionamento não termina. */
  iniciarRedirecionamento(): boolean {
    if (this.redirecionando) return false;

    this.redirecionando = true;
    return true;
  }

  /** Libera novo tratamento após um login bem-sucedido. */
  finalizarRedirecionamento(): void {
    this.redirecionando = false;
  }

  salvarUrlRetorno(url: string): void {
    if (!this.urlValida(url)) return;

    try {
      sessionStorage.setItem(RETURN_URL_STORAGE_KEY, url);
    } catch {
      // Storage indisponível: o login continua funcionando sem a rota de retorno.
    }
  }

  /** Lê e remove a rota salva, para que ela seja usada apenas uma vez. */
  consumirUrlRetorno(): string | null {
    try {
      const url = sessionStorage.getItem(RETURN_URL_STORAGE_KEY);
      sessionStorage.removeItem(RETURN_URL_STORAGE_KEY);
      return this.urlValida(url) ? url : null;
    } catch {
      return null;
    }
  }

  private urlValida(url: string | null): url is string {
    return !!url && url.startsWith('/') && !url.startsWith('/login');
  }
}
