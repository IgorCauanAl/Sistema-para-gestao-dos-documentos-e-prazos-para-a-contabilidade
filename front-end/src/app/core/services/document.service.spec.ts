import { HttpEventType } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { DocumentService, type UploadState } from './document.service';

const resposta = {
  id: 7,
  customerId: 1,
  documentType: 'Guia FGTS',
  competence: '09/2026',
  dueDate: null,
  sendChannel: 'WHATSAPP',
  direction: 'ENVIADO_AO_CLIENTE',
  status: 'ENVIADO',
  fileFormat: 'PDF',
  fileName: 'guia.pdf',
  createdIn: '2026-11-25T10:00:00',
};

const arquivo = () => new File(['conteudo'], 'guia.pdf', { type: 'application/pdf' });

describe('DocumentService', () => {
  let service: DocumentService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DocumentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('exclui o documento pela rota DELETE; o back-end remove o prazo vinculado', async () => {
    const promessa = service.remove(12);
    const req = http.expectOne('/documents/12');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    await promessa;
  });

  it('envia rascunho/enviar agora em uma única requisição, com FormData e progresso', async () => {
    const progresso: number[] = [];
    const estados: UploadState[] = [];
    const sub = service.uploadState$.subscribe((estado) => estados.push(estado));

    const promessa = service.create(
      {
        clienteId: 1,
        tipo: 'Guia FGTS',
        competencia: '09/2026',
        canal: 'WhatsApp',
        formato: 'pdf',
        tamanho: '1 KB',
        enviarAgora: true,
        file: arquivo(),
      },
      (pct) => progresso.push(pct)
    );

    const req = http.expectOne('/documents');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    const form = req.request.body as FormData;
    expect(form.get('sendNow')).toBe('true');
    expect(form.get('customerId')).toBe('1');
    expect(form.get('direction')).toBe('ENVIADO_AO_CLIENTE');
    expect(form.get('file')).toBeInstanceOf(File);

    req.event({ type: HttpEventType.UploadProgress, loaded: 50, total: 100 });
    req.flush(resposta);
    const criado = await promessa;

    expect(criado.id).toBe(7);
    expect(criado.status).toBe('ENVIADO');
    expect(progresso).toContain(50);
    expect(estados.some((estado) => estado.active && estado.progress === 50)).toBe(true);
    expect(estados.at(-1)?.active).toBe(false);
    sub.unsubscribe();
  });

  it('permite cancelar o upload em andamento', async () => {
    const promessa = service.create({
      clienteId: 1,
      tipo: 'Guia FGTS',
      competencia: '09/2026',
      canal: 'WhatsApp',
      formato: 'pdf',
      tamanho: '1 KB',
      enviarAgora: false,
      file: arquivo(),
    });

    http.expectOne('/documents');
    const resultado = expect(promessa).rejects.toThrow('Envio cancelado');
    service.cancelUpload();

    await resultado;
    expect((await firstValueFrom(service.uploadState$)).active).toBe(false);
  });

  it('envia filtros, ordenação e paginação como parâmetros da listagem', async () => {
    const promessa = service.listPage({
      clienteId: 1,
      status: 'CRIADO',
      busca: 'fgts',
      sortBy: 'createdIn',
      sortDirection: 'desc',
      page: 2,
      size: 5,
    });

    const req = http.expectOne((r) => r.url === '/documents/page');
    expect(req.request.params.get('customerId')).toBe('1');
    expect(req.request.params.get('status')).toBe('CRIADO');
    expect(req.request.params.get('search')).toBe('fgts');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('5');
    req.flush({
      content: [resposta],
      totalElements: 6,
      totalPages: 2,
      number: 1,
      size: 5,
    });

    const pagina = await promessa;
    expect(pagina.number).toBe(1);
    expect(pagina.content[0].id).toBe(7);
  });

  it('busca contagens agregadas do back-end', async () => {
    const promessa = service.contagens();
    const req = http.expectOne('/documents/counts');
    expect(req.request.method).toBe('GET');
    req.flush({
      total: 4,
      saida: 2,
      entrada: 2,
      rascunho: 1,
      enviado: 2,
      visualizado: 1,
      semana: 1,
    });

    expect((await promessa).total).toBe(4);
  });

  it('gera o link público e registra o envio ao compartilhar', async () => {
    const promessa = service.compartilhar(7);
    const req = http.expectOne('/documents/7/share');
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'abc', path: '/d/abc' });

    const share = await promessa;
    expect(share.token).toBe('abc');
    expect(share.url).toContain('/d/abc');
  });

  it('lê metadados públicos sem alterar o status do documento', async () => {
    const promessa = service.documentoPublico('abc');
    const req = http.expectOne('/public/documents/abc');
    expect(req.request.method).toBe('GET');
    req.flush({
      fileName: 'guia.pdf',
      documentType: 'Guia FGTS',
      competence: '09/2026',
      status: 'ENVIADO',
      fileFormat: 'PDF',
    });

    expect((await promessa).fileName).toBe('guia.pdf');
  });

  it('registra visualização ao abrir o arquivo público', async () => {
    const promessa = service.arquivoPublico('abc');
    const req = http.expectOne('/public/documents/abc/file');
    expect(req.request.method).toBe('GET');
    req.flush(new Blob(['pdf']));

    expect((await promessa).size).toBe(3);
  });

  it('inativa documento preservando o registro e lendo o histórico', async () => {
    const promessa = service.inativar(7);
    const req = http.expectOne('/documents/7/inactivate');
    expect(req.request.method).toBe('POST');
    req.flush({ ...resposta, active: false });
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    http.expectOne('/documents/7').flush({ ...resposta, active: false });

    const inativo = await promessa;
    expect(inativo?.ativo).toBe(false);

    const historico = service.historico(7);
    http.expectOne('/documents/7/history').flush([
      {
        id: 3,
        occurredAt: '2026-11-26T10:00:00',
        actor: 'contador',
        action: 'DOCUMENT_INACTIVATED',
        entityType: 'DOCUMENT',
        entityId: 7,
        customerId: 1,
        ipAddress: '127.0.0.1',
        channel: 'WEB',
        justification: null,
        metadata: null,
      },
    ]);
    expect((await historico)[0].acao).toBe('DOCUMENT_INACTIVATED');
  });

  it('trata documento fora do escopo como inexistente', async () => {
    const promessa = service.getById(99);
    http.expectOne('/documents/99').flush(null, { status: 404, statusText: 'Not Found' });

    expect(await promessa).toBeNull();
  });
});
