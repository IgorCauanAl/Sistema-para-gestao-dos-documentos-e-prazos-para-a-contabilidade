import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DirecaoDocumento, DocumentStatus } from '../domain/documento';

import { DocumentService } from './document.service';

const doc = (sobrescrever: Partial<Record<string, unknown>> = {}) => ({
  id: 104,
  customerId: 1,
  documentType: 'Guia FGTS',
  competence: '09/2026',
  dueDate: '2026-10-10',
  sendChannel: 'WHATSAPP',
  direction: 'ENVIADO_AO_CLIENTE',
  status: 'ENVIADO',
  fileFormat: 'PDF',
  fileName: 'guia-fgts.pdf',
  createdIn: '2026-10-02T10:12:00',
  ...sobrescrever,
});

describe('DocumentService', () => {
  let service: DocumentService;
  let http: HttpTestingController;

  // As transições fazem uma segunda chamada HTTP após o flush da primeira;
  // aguardar um tick deixa essa continuação ser agendada.
  const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DocumentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('filtra a listagem pela direção repassada pelas abas', async () => {
    const promessa = service.listAll(DirecaoDocumento.SAIDA);

    http.expectOne('/documents').flush([
      doc(),
      doc({ id: 105, direction: 'RECEBIDO_DO_CLIENTE' }),
    ]);

    const enviados = await promessa;
    expect(enviados.length).toBe(1);
    expect(enviados[0].direcao).toBe(DirecaoDocumento.SAIDA);
  });

  it('registra visualização ao servir o arquivo pelo back-end', async () => {
    const promessa = service.markVisualizado(104);

    const view = http.expectOne('/documents/104/file/view');
    expect(view.request.method).toBe('GET');
    view.flush(new Blob(['conteudo']));
    await tick();

    http.expectOne('/documents').flush([doc({ status: 'VISUALIZADO' })]);

    const atualizado = await promessa;
    expect(atualizado?.status).toBe(DocumentStatus.VISUALIZADO);
  });

  it('envia o documento para o cliente pela API', async () => {
    const promessa = service.markEnviado(104);

    const send = http.expectOne('/documents/104/send');
    expect(send.request.method).toBe('POST');
    send.flush(doc({ status: 'ENVIADO' }));
    await tick();

    http.expectOne('/documents').flush([doc({ status: 'ENVIADO' })]);

    expect((await promessa)?.status).toBe(DocumentStatus.ENVIADO);
  });

  it('faz upload multipart com os metadados do RF04', async () => {
    const file = new File(['conteudo'], 'guia.pdf', { type: 'application/pdf' });
    const promessa = service.create({
      clienteId: 1,
      file,
      tipo: 'Guia FGTS',
      competencia: '09/2026',
      canal: 'WhatsApp',
      formato: 'pdf',
      tamanho: '8 bytes',
      enviarAgora: false,
    });

    const req = http.expectOne('/documents');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    expect(req.request.body.get('customerId')).toBe('1');
    expect(req.request.body.get('documentType')).toBe('Guia FGTS');
    expect(req.request.body.get('direction')).toBe('ENVIADO_AO_CLIENTE');
    expect(req.request.body.get('fileFormat')).toBe('PDF');

    req.flush(doc());
    expect((await promessa).id).toBe(104);
  });
});
