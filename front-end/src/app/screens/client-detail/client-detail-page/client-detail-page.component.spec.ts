import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { MockInstance } from 'vitest';

import type {
  Cliente,
  Documento,
  DocumentoNovo,
  Solicitacao,
  SolicitacaoNova,
} from '../../../core/domain/models';
import { ClientService } from '../../../core/services/client.service';
import { DataRefreshService } from '../../../core/services/data-refresh.service';
import {
  type DocumentoFiltros,
  type PaginaDocumentos,
  DocumentService,
} from '../../../core/services/document.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SolicitacaoService } from '../../../core/services/solicitacao.service';
import { testProviders } from '../../../testing/test-providers';

import { ClientDetailPageComponent } from './client-detail-page.component';

const cliente = {
  id: 1,
  cnpj: '12.345.678/0001-95',
  razaoSocial: 'Empresa SA',
  responsavel: 'Marina',
  email: 'marina@empresa.com.br',
  endereco: 'Rua A, 1',
  whatsapp: '',
  canalPreferido: 'E-mail',
  ultimoEnvio: '—',
} as Cliente;

const documento = { id: 7, clienteId: 1, nome: 'Guia FGTS' } as Documento;

const paginaVazia: PaginaDocumentos = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 10,
};

const anexo: DocumentoNovo = {
  clienteId: 1,
  tipo: 'Guia FGTS',
  competencia: '09/2026',
  canal: 'E-mail',
  formato: 'pdf',
  tamanho: '1 KB',
  enviarAgora: false,
};

const novaSolicitacao: SolicitacaoNova = {
  clienteId: 1,
  titulo: 'Documentos de setembro',
  competencia: '09/2026',
  prazo: '15/10/2026',
  canal: 'E-mail',
  validadeDias: 7,
  itens: [],
  enviarAgora: false,
};

describe('ClientDetailPageComponent', () => {
  let component: ClientDetailPageComponent;
  let fixture: ComponentFixture<ClientDetailPageComponent>;
  let listPage: MockInstance<(filtros?: DocumentoFiltros) => Promise<PaginaDocumentos>>;

  const prepararMutations = () => {
    listPage.mockClear();
    return {
      notify: vi.spyOn(TestBed.inject(DataRefreshService), 'notify'),
      listPage,
    };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientDetailPageComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(ClientDetailPageComponent);
    component = fixture.componentInstance;
    vi.spyOn(TestBed.inject(ClientService), 'getById').mockResolvedValue(cliente);
    listPage = vi.spyOn(TestBed.inject(DocumentService), 'listPage').mockResolvedValue(paginaVazia);
    vi.spyOn(TestBed.inject(SolicitacaoService), 'list').mockResolvedValue([]);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carrega documentos do cliente com filtros e paginação no back-end', async () => {
    listPage.mockClear();
    // A rota não informa clienteId neste TestBed; o cenário real sempre informa.
    (component as unknown as { clienteId: string }).clienteId = '1';

    await component.setFilters({ competencia: '09/2026', tipo: 'Guia FGTS', status: 'RASCUNHO' });

    expect(listPage).toHaveBeenCalledWith(expect.objectContaining({
      clienteId: 1,
      competencia: '09/2026',
      tipo: 'Guia FGTS',
      status: 'CRIADO',
      page: 0,
      size: 10,
    }));
  });

  it('recarrega documentos e notifica o shell depois de anexar', async () => {
    const { notify } = prepararMutations();
    const documentService = TestBed.inject(DocumentService);
    const create = vi.spyOn(documentService, 'create').mockResolvedValue(documento);

    await component.handleAttach(anexo);

    expect(create).toHaveBeenCalledWith(anexo);
    expect(listPage).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('documents', 'deadlines', 'dashboard');
  });

  it('recarrega documentos e notifica o shell depois de enviar', async () => {
    const { notify } = prepararMutations();
    const markEnviado = vi
      .spyOn(TestBed.inject(DocumentService), 'markEnviado')
      .mockResolvedValue(documento);

    await component.handleSend(documento);

    expect(markEnviado).toHaveBeenCalledWith(documento.id);
    expect(listPage).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('documents', 'dashboard');
  });

  it('exclui documento do cliente e notifica prazos e dashboard', async () => {
    const { notify } = prepararMutations();
    const documentService = TestBed.inject(DocumentService);
    vi.spyOn(TestBed.inject(NotificationService), 'confirm').mockResolvedValue(true);
    const remove = vi.spyOn(documentService, 'remove').mockResolvedValue();

    await component.handleDeleteDoc(documento);

    expect(remove).toHaveBeenCalledWith(documento.id);
    expect(listPage).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('documents', 'deadlines', 'dashboard');
  });

  it('gera link de compartilhamento e usa o WhatsApp cadastrado no cliente', async () => {
    const { notify } = prepararMutations();
    const compartilhar = vi.spyOn(TestBed.inject(DocumentService), 'compartilhar').mockResolvedValue({
      token: 'tok',
      path: '/d/tok',
      url: 'http://localhost/d/tok',
    });

    await component.handleShare(documento);

    expect(compartilhar).toHaveBeenCalledWith(documento.id);
    expect(component.shareOpen).toBe(true);
    expect(component.shareDoc).toEqual(documento);
    expect(listPage).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('documents', 'dashboard');
  });

  it('recarrega o cliente e notifica o shell depois de editar', async () => {
    const clientService = TestBed.inject(ClientService);
    const { notify } = prepararMutations();
    const update = vi.spyOn(clientService, 'update').mockResolvedValue(cliente);
    const getById = vi.spyOn(clientService, 'getById');
    getById.mockClear();

    await component.handleEditSubmit();

    expect(update).toHaveBeenCalledTimes(1);
    expect(getById).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('customers');
  });

  it('recarrega solicitações e notifica o shell depois de criar solicitação', async () => {
    const solicitacaoService = TestBed.inject(SolicitacaoService);
    const { notify } = prepararMutations();
    const create = vi.spyOn(solicitacaoService, 'create').mockResolvedValue({ id: 4 } as Solicitacao);
    const list = vi.spyOn(solicitacaoService, 'list');
    list.mockClear();

    await component.handleNovaSolicitacao(novaSolicitacao);

    expect(create).toHaveBeenCalledWith(novaSolicitacao);
    expect(list).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('requests');
  });
});
