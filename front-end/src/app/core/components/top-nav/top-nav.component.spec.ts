import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { DataRefreshService } from '../../services/data-refresh.service';
import { NotificationService } from '../../services/notification.service';
import { testProviders } from '../../../testing/test-providers';

import { TopNavComponent } from './top-nav.component';

describe('TopNavComponent', () => {
  let component: TopNavComponent;
  let fixture: ComponentFixture<TopNavComponent>;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(
      'contadash.usuario',
      JSON.stringify({
        id: 7,
        nome: 'Marina',
        email: 'marina@contadash.com.br',
        perfil: 'Contador',
        dataReferencia: '2026-11-23T12:34:56Z',
        token: 'jwt-valido',
      }),
    );

    await TestBed.configureTestingModule({
      imports: [TopNavComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(TopNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('mostra nome e perfil vindos do estado global de autenticação', () => {
    const texto = fixture.nativeElement.textContent as string;

    expect(texto).toContain('Marina');
    expect(texto).toContain('Contador');
  });

  it('avisa quando existem documentos em rascunho', async () => {
    const http = TestBed.inject(HttpTestingController);

    http.expectOne('/dashboard/summary').flush({
      totalCustomers: 1,
      resendItems: 0,
      overdueObligations: 0,
      hasDraftDocuments: true,
    });
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(component.hasDraftDocuments).toBe(true);
    expect((fixture.nativeElement.textContent as string)).toContain('Rascunho');
  });

  it('atualiza o aviso de rascunho quando um documento é criado', async () => {
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/dashboard/summary').flush({
      totalCustomers: 1,
      resendItems: 0,
      overdueObligations: 0,
      hasDraftDocuments: false,
    });
    await fixture.whenStable();
    expect(component.hasDraftDocuments).toBe(false);

    TestBed.inject(DataRefreshService).notify('documents');
    http.expectOne('/dashboard/summary').flush({
      totalCustomers: 1,
      resendItems: 0,
      overdueObligations: 0,
      hasDraftDocuments: true,
    });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.hasDraftDocuments).toBe(true);
  });

  it('usa a data atual do sistema em vez de uma data fixa', () => {
    const texto = fixture.nativeElement.textContent as string;

    expect(texto).not.toContain('Quinta-feira, 8 Out 2026');
    expect(texto).toContain(String(new Date().getFullYear()));
  });

  it('pede confirmação antes de sair e mantém a sessão se cancelar', async () => {
    const notification = TestBed.inject(NotificationService);
    const auth = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    const confirm = vi.spyOn(notification, 'confirm').mockResolvedValue(false);
    const info = vi.spyOn(notification, 'info');
    const logout = vi.spyOn(auth, 'logout');
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    await component.sair();

    expect(confirm).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Sair do sistema?', confirmLabel: 'Sair' }),
    );
    expect(info).toHaveBeenCalledWith('Você permaneceu conectado.');
    expect(logout).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(auth.autenticado).toBe(true);
  });

  it('desloga, avisa e navega para o login após confirmar saída', async () => {
    const notification = TestBed.inject(NotificationService);
    const auth = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    vi.spyOn(notification, 'confirm').mockResolvedValue(true);
    const success = vi.spyOn(notification, 'success');
    const logout = vi.spyOn(auth, 'logout');
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    await component.sair();

    expect(logout).toHaveBeenCalledTimes(1);
    expect(success).toHaveBeenCalledWith('Você saiu do sistema com sucesso.');
    expect(navigate).toHaveBeenCalledWith('/login', { replaceUrl: true });
    expect(auth.autenticado).toBe(false);
  });
});
