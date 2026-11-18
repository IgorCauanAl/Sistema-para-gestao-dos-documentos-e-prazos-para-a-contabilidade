import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

export interface UsuarioAutenticado {
  id: number;
  nome: string;
  email: string;
}

interface AuthenticationResponseDTO {
  id: number;
  name: string;
  email: string;
}

export const CREDENCIAIS_DEMO = {
  email: 'contador@contadash.com.br',
  senha: '123456',
} as const;

const STORAGE_KEY = 'contadash.usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly usuarioSubject = new BehaviorSubject<UsuarioAutenticado | null>(
    this.restaurarUsuario()
  );

  readonly usuario$ = this.usuarioSubject.asObservable();

  get usuario(): UsuarioAutenticado | null {
    return this.usuarioSubject.value;
  }

  get autenticado(): boolean {
    return this.usuario !== null;
  }

  async login(email: string, senha: string, lembrarDeMim: boolean): Promise<UsuarioAutenticado> {
    const emailNormalizado = email.trim().toLowerCase();

    try {
      // Obtém o cookie XSRF-TOKEN antes do primeiro POST (proteção CSRF).
      await firstValueFrom(this.http.get('/auth/csrf', { withCredentials: true }));

      const resposta = await firstValueFrom(
        this.http.post<AuthenticationResponseDTO>(
          '/auth/login',
          { email: emailNormalizado, password: senha },
          { withCredentials: true }
        )
      );

      const usuario: UsuarioAutenticado = {
        id: resposta.id,
        nome: resposta.name,
        email: resposta.email,
      };

      const storage = lembrarDeMim ? localStorage : sessionStorage;
      storage.setItem(STORAGE_KEY, JSON.stringify(usuario));
      this.usuarioSubject.next(usuario);

      return usuario;
    } catch (erro) {
      throw new Error(this.mensagemErro(erro));
    }
  }

  logout(): void {
    void firstValueFrom(
      this.http.post<void>('/auth/logout', null, { withCredentials: true })
    ).catch(() => undefined);

    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    this.usuarioSubject.next(null);
  }

  private mensagemErro(erro: unknown): string {
    if (erro instanceof HttpErrorResponse && erro.status === 401) {
      return 'E-mail ou senha incorretos. Verifique os dados e tente novamente.';
    }
    if (erro instanceof HttpErrorResponse && erro.status === 403) {
      return 'Acesso restrito ao contador. Verifique a conta utilizada.';
    }
    if (erro instanceof HttpErrorResponse && erro.status === 0) {
      return 'Não foi possível conectar ao servidor. Tente novamente em instantes.';
    }
    return 'Não foi possível entrar. Tente novamente.';
  }

  private restaurarUsuario(): UsuarioAutenticado | null {
    const bruto = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
    if (!bruto) return null;

    try {
      const dados = JSON.parse(bruto) as Partial<UsuarioAutenticado>;
      if (
        typeof dados.id === 'number' &&
        typeof dados.nome === 'string' &&
        typeof dados.email === 'string'
      ) {
        return { id: dados.id, nome: dados.nome, email: dados.email };
      }
    } catch {
      // Dados de sessão inválidos são descartados.
    }

    return null;
  }
}
