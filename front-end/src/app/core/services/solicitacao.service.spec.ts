import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SolicitacaoService } from './solicitacao.service';

const listItem = (sobrescrever: Partial<Record<string, unknown>> = {}) => ({
  id: 10,
  customerId: 3,
  title: 'Documentos de 12/2026',
  competence: '12/2026',
  dueDate: '2099-10-15',
  status: 'ABERTA',
  acceptedItems: 1,
  totalItems: 3,
  progress: 0.3333,
  ...sobrescrever,
});

describe('SolicitacaoService', () => {
  let service: SolicitacaoService;
  let http: HttpTestingController;

  const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SolicitacaoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('carrega solicitações dos clientes pela API e usa progresso aceitos/total', async () => {
    const promessa = service.list();

    http.expectOne('/customers').flush([{ id: 3 }, { id: 4 }]);
    await tick();
    http.expectOne('/requests?customerId=3').flush([listItem()]);
    http.expectOne('/requests?customerId=4').flush([]);

    const solicitacoes = await promessa;
    expect(solicitacoes.length).toBe(1);
    expect(solicitacoes[0].aceitos).toBe(1);
    expect(solicitacoes[0].totalItens).toBe(3);
  });

  it('busca o detalhe com o checklist vindo do back-end', async () => {
    const promessa = service.getById(10);

    http.expectOne('/requests/10').flush({
      ...listItem({ acceptedItems: 1, totalItems: 2 }),
      createdAt: '2026-11-20T10:00:00',
      items: [
        {
          id: 11,
          description: 'Extrato bancário',
          expectedFileFormat: 'PDF',
          status: 'ACEITO',
          uploadedFileName: 'extrato.pdf',
          uploadedDocumentId: 55,
          sentAt: '2026-11-20T09:00:00',
          reviewedAt: '2026-11-20T09:30:00',
          rejectionReason: null,
        },
        {
          id: 12,
          description: 'Notas fiscais',
          expectedFileFormat: 'XML',
          status: 'PENDENTE',
          uploadedFileName: null,
          uploadedDocumentId: null,
          sentAt: null,
          reviewedAt: null,
          rejectionReason: null,
        },
      ],
    });

    const encontrada = await promessa;
    expect(encontrada?.itens.length).toBe(2);
    expect(encontrada?.itens[0].status).toBe('APROVADO');
    expect(encontrada?.itens[0].tentativas[0].documentId).toBe(55);
  });

  it('cria a solicitação enviando o checklist no formato do backend', async () => {
    const promessa = service.create({
      clienteId: 3,
      titulo: 'Documentos de 12/2026',
      competencia: '12/2026',
      prazo: '15/12/2026',
      instrucoes: '',
      canal: 'WhatsApp',
      validadeDias: 7,
      itens: [{ nome: 'Extrato bancário', formato: 'pdf' }],
      enviarAgora: true,
    });

    const req = http.expectOne('/requests');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      customerId: 3,
      title: 'Documentos de 12/2026',
      competence: '12/2026',
      deadline: '2026-12-15',
      checklist: [{ description: 'Extrato bancário', expectedFileFormat: 'PDF' }],
    });

    req.flush({
      ...listItem(),
      createdIn: '2026-11-20T10:00:00',
      publicToken: 'token-cru',
      checklist: [],
    });

    const criada = await promessa;
    expect(criada.token).toBe('token-cru');
  });

  it('aceita e recusa itens pelos endpoints reais', async () => {
    const aceite = service.aprovarItem(10, 11);
    const reqAceite = http.expectOne('/requests/10/items/11/accept');
    expect(reqAceite.request.method).toBe('POST');
    reqAceite.flush({});
    await tick();
    http.expectOne('/requests/10').flush(listItem());
    await aceite;

    const recusa = service.recusarItem(10, 11, { motivo: 'INCOMPLETO', detalhes: 'faltam páginas' });
    const reqRecusa = http.expectOne('/requests/10/items/11/reject');
    expect(reqRecusa.request.body).toEqual({ reason: 'INCOMPLETO: faltam páginas' });
    reqRecusa.flush({});
    await tick();
    http.expectOne('/requests/10').flush(listItem());
    await recusa;
  });

  it('marca solicitação vencida a partir do prazo real da API', async () => {
    const promessa = service.list();
    http.expectOne('/customers').flush([{ id: 3 }]);
    await tick();
    http
      .expectOne('/requests?customerId=3')
      .flush([listItem({ dueDate: '2020-01-01', status: 'ABERTA' })]) ;

    const [encontrada] = await promessa;
    expect(encontrada.status).toBe('EXPIRADA');
  });
});
