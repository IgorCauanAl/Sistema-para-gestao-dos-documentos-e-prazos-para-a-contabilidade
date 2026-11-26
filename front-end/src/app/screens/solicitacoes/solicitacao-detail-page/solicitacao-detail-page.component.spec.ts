import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { Cliente, Solicitacao, SolicitacaoItem } from '../../../core/domain/models';
import { ClientService } from '../../../core/services/client.service';
import { DataRefreshService } from '../../../core/services/data-refresh.service';
import { DocumentService } from '../../../core/services/document.service';
import { SolicitacaoService } from '../../../core/services/solicitacao.service';
import { testProviders } from '../../../testing/test-providers';

import { SolicitacaoDetailPageComponent } from './solicitacao-detail-page.component';

const item: SolicitacaoItem = {
  id: 5,
  nome: 'Guia FGTS',
  formatoEsperado: 'PDF',
  status: 'ENVIADO',
  tentativas: [],
};

const solicitacao: Solicitacao = {
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
};

const cliente = { id: 1, razaoSocial: 'Empresa SA' } as Cliente;

describe('SolicitacaoDetailPageComponent', () => {
  let component: SolicitacaoDetailPageComponent;
  let fixture: ComponentFixture<SolicitacaoDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitacaoDetailPageComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitacaoDetailPageComponent);
    component = fixture.componentInstance;
    vi.spyOn(TestBed.inject(SolicitacaoService), 'getById').mockResolvedValue(solicitacao);
    vi.spyOn(TestBed.inject(ClientService), 'getById').mockResolvedValue(cliente);
    vi.spyOn(TestBed.inject(SolicitacaoService), 'historico').mockResolvedValue([]);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('recarrega a solicitação e notifica o shell após aprovar item', async () => {
    const service = TestBed.inject(SolicitacaoService);
    const notify = vi.spyOn(TestBed.inject(DataRefreshService), 'notify');
    const aprovarItem = vi.spyOn(service, 'aprovarItem').mockResolvedValue(solicitacao);
    const getById = vi.spyOn(service, 'getById');
    getById.mockClear();
    component.approveItem = item;

    await component.handleApproveConfirm();

    expect(aprovarItem).toHaveBeenCalledWith(solicitacao.id, item.id);
    expect(getById).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('requests');
  });

  it('recarrega a solicitação e notifica dashboard após recusar item', async () => {
    const service = TestBed.inject(SolicitacaoService);
    const notify = vi.spyOn(TestBed.inject(DataRefreshService), 'notify');
    const recusarItem = vi.spyOn(service, 'recusarItem').mockResolvedValue(solicitacao);
    const getById = vi.spyOn(service, 'getById');
    getById.mockClear();
    component.rejectItem = item;

    const payload = { motivo: 'Arquivo ilegível', detalhes: '', mensagem: 'Reenviar o arquivo.' };
    await component.handleRejectConfirm(payload);

    expect(recusarItem).toHaveBeenCalledWith(solicitacao.id, item.id, {
      motivo: 'Arquivo ilegível',
      detalhes: '',
    });
    expect(getById).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('requests', 'dashboard');
  });

  it('notifica documentos e dashboard depois de baixar arquivo enviado', async () => {
    const notify = vi.spyOn(TestBed.inject(DataRefreshService), 'notify');
    const baixarArquivo = vi
      .spyOn(TestBed.inject(DocumentService), 'baixarArquivo')
      .mockResolvedValue();

    await component.baixarArquivo({
      tentativa: {
        id: 'tentativa-1',
        data: '02/10/2026',
        hora: '10:00',
        acao: 'ENVIO',
        arquivo: null,
        motivo: null,
        detalhes: null,
        canalOrigem: null,
        ip: '',
        protocolo: null,
        observacao: null,
        documentId: 77,
      },
    });

    expect(baixarArquivo).toHaveBeenCalledWith(77);
    expect(notify).toHaveBeenCalledWith('documents', 'dashboard');
  });

  it('recarrega a solicitação e notifica todos os escopos após recebimento manual', async () => {
    const service = TestBed.inject(SolicitacaoService);
    const notify = vi.spyOn(TestBed.inject(DataRefreshService), 'notify');
    const registrar = vi.spyOn(service, 'registrarRecebimentoManual').mockResolvedValue(solicitacao);
    const getById = vi.spyOn(service, 'getById');
    getById.mockClear();
    component.manualItem = item;
    const payload = {
      file: new File(['x'], 'extrato.pdf', { type: 'application/pdf' }),
      arquivo: { nome: 'extrato.pdf', tamanho: '1 KB' },
      canalOrigem: 'Manual',
      vencimento: null,
      diasAntecedencia: 5,
      observacao: '',
    };

    await component.handleManualConfirm(payload);

    expect(registrar).toHaveBeenCalledWith(solicitacao.id, item.id, payload);
    expect(getById).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('requests', 'documents', 'deadlines', 'dashboard');
  });
});
