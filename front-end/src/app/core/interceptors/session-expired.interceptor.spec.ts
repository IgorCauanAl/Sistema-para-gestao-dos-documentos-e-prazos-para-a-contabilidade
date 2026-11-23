import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { RETURN_URL_STORAGE_KEY, SessionExpirationService } from '../services/session-expiration.service';
import { ToastService } from '../services/toast.service';

import { sessionExpiredInterceptor } from './session-expired.interceptor';

describe('sessionExpiredInterceptor', () => {
  let http: HttpTestingController;
  let httpClient: HttpClient;
  let router: Router;
  let toastService: ToastService;
  let authService: AuthService;
  let sessionExpiration: SessionExpirationService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem(
      'contadash.usuario',
      JSON.stringify({ id: 1, nome: 'Marina', email: 'marina@contadash.com.br', token: 'jwt' }),
    );

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([sessionExpiredInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
    toastService = TestBed.inject(ToastService);
    authService = TestBed.inject(AuthService);
    sessionExpiration = TestBed.inject(SessionExpirationService);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('redireciona uma única vez quando várias requisições recebem 401', async () => {
    vi.spyOn(router, 'url', 'get').mockReturnValue('/clientes/7?aba=documentos');
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const toastSpy = vi.spyOn(toastService, 'show');

    const primeira = firstValueFrom(
      httpClient.get('/customers').pipe(catchError(() => of(null))),
    );
    const segunda = firstValueFrom(
      httpClient.get('/documents').pipe(catchError(() => of(null))),
    );

    const requisicoes = http.match(
      (req) => req.url === '/customers' || req.url === '/documents',
    );
    expect(requisicoes.length).toBe(2);

    requisicoes[0].flush(
      { code: 'TOKEN_EXPIRED', message: 'Sua sessão expirou. Faça login novamente.' },
      { status: 401, statusText: 'Unauthorized' },
    );
    requisicoes[1].flush(null, { status: 401, statusText: 'Unauthorized' });
    await Promise.all([primeira, segunda]);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
    expect(toastSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy).toHaveBeenCalledWith(
      'Sua sessão expirou. Faça login novamente.',
      'error',
      6000,
    );
    expect(sessionStorage.getItem(RETURN_URL_STORAGE_KEY)).toBe(
      '/clientes/7?aba=documentos',
    );
    expect(authService.autenticado).toBe(false);
  });

  it('não trata o 401 do login como sessão expirada', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const toastSpy = vi.spyOn(toastService, 'show');

    const requisicao = firstValueFrom(
      httpClient.post('/auth/login', {}).pipe(catchError(() => of(null))),
    );

    http.expectOne('/auth/login').flush(null, { status: 401, statusText: 'Unauthorized' });
    await requisicao;

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(toastSpy).not.toHaveBeenCalled();
    expect(authService.autenticado).toBe(true);
  });

  it('libera um novo redirecionamento após o login', () => {
    expect(sessionExpiration.iniciarRedirecionamento()).toBe(true);
    expect(sessionExpiration.iniciarRedirecionamento()).toBe(false);

    sessionExpiration.finalizarRedirecionamento();

    expect(sessionExpiration.iniciarRedirecionamento()).toBe(true);
  });
});
