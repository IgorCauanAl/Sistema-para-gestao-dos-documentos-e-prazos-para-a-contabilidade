import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { Solicitacao, SolicitacaoItem } from '../../../core/domain/models';
import { DataRefreshService } from '../../../core/services/data-refresh.service';
import { PortalEnvio, PublicRequestService } from '../../../core/services/public-request.service';
import { testProviders } from '../../../testing/test-providers';

import { ClientPortalPageComponent } from './client-portal-page.component';

const item: SolicitacaoItem = {
  id: 5,
  nome: 'Guia FGTS',
  formatoEsperado: 'PDF',
  status: 'PENDENTE',
  tentativas: [],
};

const solicitacao = {
  id: 12,
  clienteId: 1,
  titulo: 'Documentos de setembro',
  competencia: '09/2026',
  prazo: '15/10/2026',
  instrucoes: '',
  canal: 'E-mail',
  token: 'token-publico',
  validadeAte: '22/10/2026',
  validadeDias: 7,
  status: 'ABERTA',
  criadoEm: { data: '02/10/2026', hora: '10:00' },
  itens: [item],
} as Solicitacao;

describe('ClientPortalPageComponent', () => {
  let component: ClientPortalPageComponent;
  let fixture: ComponentFixture<ClientPortalPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPortalPageComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(ClientPortalPageComponent);
    component = fixture.componentInstance;
    vi.spyOn(TestBed.inject(PublicRequestService), 'getByToken').mockResolvedValue({
      solicitacao,
      cliente: null,
    });
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('recarrega a solicitação e notifica o shell depois de enviar item pelo portal', async () => {
    const publicRequestService = TestBed.inject(PublicRequestService);
    const notify = vi.spyOn(TestBed.inject(DataRefreshService), 'notify');
    const arquivo = new File(['conteudo'], 'guia.pdf', { type: 'application/pdf' });
    const enviar = vi
      .spyOn(publicRequestService, 'enviarPeloPortal')
      .mockResolvedValue({ protocolo: 'PROT-1' } as PortalEnvio);
    const getByToken = vi.spyOn(publicRequestService, 'getByToken');
    getByToken.mockClear();
    component.setUpload(item.id, { file: arquivo });

    await component.enviarItem(item);

    expect(enviar).toHaveBeenCalledTimes(1);
    expect(getByToken).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('requests', 'documents', 'deadlines', 'dashboard');
  });
});
