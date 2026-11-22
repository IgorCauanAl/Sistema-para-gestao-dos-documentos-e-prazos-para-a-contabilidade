import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PublicRequestService } from './public-request.service';

const resposta = {
  id: 10,
  customerId: 3,
  customerName: 'Alpha Tecnologia Ltda',
  title: 'Documentos de 09/2026',
  competence: '09/2026',
  deadline: '2099-10-15',
  status: 'ABERTA',
  createdIn: '2026-09-30T16:10:00',
  checklist: [
    {
      id: 11,
      description: 'Extrato bancário',
      expectedFileFormat: 'PDF',
      status: 'PENDENTE',
      uploadedFileName: null,
      uploadedDocumentId: null,
      sentAt: null,
      reviewedAt: null,
      rejectionReason: null,
    },
  ],
};

describe('PublicRequestService', () => {
  let service: PublicRequestService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PublicRequestService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('busca a solicitação pelo token e mapeia os campos para o portal', async () => {
    const promessa = service.getByToken('token-seguro');
    http.expectOne('/public/requests/token-seguro').flush(resposta);

    const resultado = await promessa;

    expect(resultado).not.toBeNull();
    expect(resultado?.solicitacao.id).toBe(10);
    expect(resultado?.solicitacao.status).toBe('ABERTA');
    expect(resultado?.solicitacao.prazo).toBe('15/10/2099');
    expect(resultado?.solicitacao.itens[0]?.status).toBe('PENDENTE');
    expect(resultado?.cliente?.razaoSocial).toBe('Alpha Tecnologia Ltda');
  });

  it('retorna null quando o token é inválido', async () => {
    const promessa = service.getByToken('invalido');
    http.expectOne('/public/requests/invalido').flush(
      { detail: 'Link inválido' },
      { status: 404, statusText: 'Not Found' },
    );

    expect(await promessa).toBeNull();
  });

  it('valida um token público e retorna metadados mínimos', async () => {
    const promessa = service.validateToken('token-seguro');
    http.expectOne('/public/requests/token-seguro/validate').flush({
      valid: true,
      requestId: 10,
      status: 'ABERTA',
      deadline: '2099-10-15',
    });

    expect(await promessa).toEqual({
      valid: true,
      requestId: 10,
      status: 'ABERTA',
      deadline: '2099-10-15',
    });
  });

  it('retorna null ao validar token inexistente', async () => {
    const promessa = service.validateToken('invalido');
    http.expectOne('/public/requests/invalido/validate').flush(
      { detail: 'Link inválido' },
      { status: 404, statusText: 'Not Found' },
    );

    expect(await promessa).toBeNull();
  });

  it('envia o arquivo como multipart e devolve o protocolo', async () => {
    const arquivo = new File(['conteudo'], 'extrato.pdf', { type: 'application/pdf' });
    const promessa = service.enviarPeloPortal('token-seguro', 11, arquivo);
    const req = http.expectOne('/public/requests/token-seguro/items/11/upload');

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    expect((req.request.body as FormData).get('file')).toBe(arquivo);

    req.flush({
      protocol: 'PROT-2026-000001',
      documentId: 55,
      request: {
        ...resposta,
        status: 'ABERTA',
        checklist: [
          {
            ...resposta.checklist[0],
            status: 'ENVIADO_PELO_CLIENTE',
            uploadedFileName: 'extrato.pdf',
            uploadedDocumentId: 55,
            sentAt: '2026-10-01T10:20:00',
          },
        ],
      },
    });

    const resultado = await promessa;

    expect(resultado.protocolo).toBe('PROT-2026-000001');
    expect(resultado.solicitacao.itens[0]?.status).toBe('ENVIADO');
    expect(resultado.tentativa.arquivo?.nome).toBe('extrato.pdf');
  });
});
