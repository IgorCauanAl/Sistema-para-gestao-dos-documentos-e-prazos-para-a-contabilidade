import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

import { normalizarErro } from '../errors/api-error';
import { SessionExpirationService } from './session-expiration.service';

export interface UsuarioAutenticado {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  dataReferencia: string | null;
  token: string;
}

interface AuthenticationResponseDTO {
  id: number;
  name: string;
  email: string;
  perfil?: string | null;
  dataReferencia?: string | null;
  token: string;
}

const STORAGE_KEY = 'contadash.usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionExpiration = inject(SessionExpirationService);

  private readonly usuarioSubject = new BehaviorSubject<UsuarioAutenticado | null>(
    this.restaurarUsuario(),
  );

  readonly usuario$ = this.usuarioSubject.asObservable();

  get usuario(): UsuarioAutenticado | null {
    return this.usuarioSubject.value;
  }

  get autenticado(): boolean {
    return this.usuario !== null;
  }

  get token(): string | null {
    return this.usuario?.token ?? null;
  }

  async login(email: string, senha: string, lembrarDeMim: boolean): Promise<UsuarioAutenticado> {
    const emailNormalizado = email.trim().toLowerCase();

    try {
      const resposta = await firstValueFrom(
        this.http.post<AuthenticationResponseDTO>('/auth/login', {
          email: emailNormalizado,
          password: senha,
        }),
      );

      const usuario: UsuarioAutenticado = {
        id: resposta.id,
        nome: resposta.name,
        email: resposta.email,
        perfil: resposta.perfil?.trim() || 'Contador',
        dataReferencia: resposta.dataReferencia ?? null,
        token: resposta.token,
      };

      const storage = lembrarDeMim ? localStorage : sessionStorage;
      storage.setItem(STORAGE_KEY, JSON.stringify(usuario));
      this.usuarioSubject.next(usuario);
      // Permite que um novo 401 volte a disparar o fluxo de sessão expirada.
      this.sessionExpiration.finalizarRedirecionamento();

      return usuario;
    } catch (erro) {
      throw new Error(this.mensagemErro(erro));
    }
  }

  logout(): void {
    // Stateless: logout é apenas local, sem sessão no servidor.
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    this.usuarioSubject.next(null);
  }

  private mensagemErro(erro: unknown): string {
    const normalizado = normalizarErro(erro);
    if (normalizado.status === 401) {
      return 'E-mail ou senha incorretos. Verifique os dados e tente novamente.';
    }
    if (normalizado.status === 403) {
      return 'Acesso restrito ao contador. Verifique a conta utilizada.';
    }
    return normalizado.message;
  }

  private restaurarUsuario(): UsuarioAutenticado | null {
    const bruto = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
    if (!bruto) return null;

    try {
      const dados = JSON.parse(bruto) as Partial<UsuarioAutenticado>;
      if (
        typeof dados.id === 'number' &&
        typeof dados.nome === 'string' &&
        typeof dados.email === 'string' &&
        typeof dados.token === 'string'
      ) {
        return {
          id: dados.id,
          nome: dados.nome,
          email: dados.email,
          perfil: typeof dados.perfil === 'string' && dados.perfil.trim()
            ? dados.perfil
            : 'Contador',
          dataReferencia:
            typeof dados.dataReferencia === 'string' ? dados.dataReferencia : null,
          token: dados.token,
        };
      }
    } catch {
      // Storage corrompido é ignorado.
    }

    return null;
  }
}
