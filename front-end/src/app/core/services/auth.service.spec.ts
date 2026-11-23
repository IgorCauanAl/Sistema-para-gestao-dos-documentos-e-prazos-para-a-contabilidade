import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService, UsuarioAutenticado } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('publica no BehaviorSubject o contexto completo devolvido pelo login', async () => {
    const estados: Array<UsuarioAutenticado | null> = [];
    service.usuario$.subscribe((usuario) => estados.push(usuario));

    const promessa = service.login('marina@contadash.com.br', 'senha', false);

    http.expectOne('/auth/login').flush({
      id: 7,
      name: 'Marina',
      email: 'marina@contadash.com.br',
      token: 'jwt-valido',
      perfil: 'Contador',
      dataReferencia: '2026-11-23T12:34:56Z',
    });

    const usuario = await promessa;
    const ultimo = estados.at(-1);
    expect(usuario.perfil).toBe('Contador');
    expect(usuario.dataReferencia).toBe('2026-11-23T12:34:56Z');
    expect(ultimo?.nome).toBe('Marina');
    expect(ultimo?.perfil).toBe('Contador');
  });

  it('usa um perfil padrão quando o login não informa o perfil', async () => {
    const promessa = service.login('marina@contadash.com.br', 'senha', false);

    http.expectOne('/auth/login').flush({
      id: 7,
      name: 'Marina',
      email: 'marina@contadash.com.br',
      token: 'jwt-valido',
    });

    expect((await promessa).perfil).toBe('Contador');
  });
});
