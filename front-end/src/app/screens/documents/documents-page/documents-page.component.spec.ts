import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { MockInstance } from 'vitest';

import { DirecaoDocumento } from '../../../core/domain/documento';
import type { Documento, DocumentoEntrada, DocumentoNovo } from '../../../core/domain/models';
import { ClientService } from '../../../core/services/client.service';
import { DataRefreshService } from '../../../core/services/data-refresh.service';
import {
  type DocumentoFiltros,
  type DocumentosContadores,
  type PaginaDocumentos,
  DocumentService,
} from '../../../core/services/document.service';
import { NotificationService } from '../../../core/services/notification.service';
import { testProviders } from '../../../testing/test-providers';

import { DocumentsPageComponent } from './documents-page.component';

const documento = (id: number, direcao: string): Documento => ({
  id,
  clienteId: 1,
  nome: `documento-${id}.pdf`,
  tipo: 'Guia FGTS',
  competencia: '09/2026',
  versao: 1,
  status: 'ENVIADO',
  direcao,
  canal: 'WhatsApp',
  formato: 'PDF',
  tamanho: '1 KB',
  hash: `hash-${id}`,
  historico: [],
});

const pagina = (documentos: Documento[]): PaginaDocumentos => ({
  content: documentos,
  totalElements: documentos.length,
  totalPages: 1,
  number: 0,
  size: 10,
});

const contadores: DocumentosContadores = {
  total: 2,
  saida: 1,
  entrada: 1,
  rascunho: 0,
  enviado: 2,
  visualizado: 0,
  semana: 1,
};

const anexo: DocumentoNovo = {
  clienteId: 1,
  tipo: 'Guia FGTS',
  competencia: '09/2026',
  canal: 'WhatsApp',
  formato: 'pdf',
  tamanho: '1 KB',
  enviarAgora: false,
};

const entrada: DocumentoEntrada = {
  clienteId: 1,
  tipo: 'Extrato',
  competencia: '09/2026',
  canal: 'E-mail',
  formato: 'pdf',
  tamanho: '1 KB',
};

describe('DocumentsPageComponent', () => {
  let component: DocumentsPageComponent;
  let fixture: ComponentFixture<DocumentsPageComponent>;
  let documentService: DocumentService;
  let listPage: MockInstance<(filtros?: DocumentoFiltros) => Promise<PaginaDocumentos>>;

  const prepararMutations = () => {
    listPage.mockClear();
    return {
      documentService,
      notify: vi.spyOn(TestBed.inject(DataRefreshService), 'notify'),
      listPage,
    };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentsPageComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentsPageComponent);
    component = fixture.componentInstance;
    documentService = TestBed.inject(DocumentService);
    vi.spyOn(TestBed.inject(ClientService), 'list').mockResolvedValue([]);
    listPage = vi.spyOn(documentService, 'listPage').mockResolvedValue(
      pagina([documento(1, DirecaoDocumento.SAIDA), documento(2, DirecaoDocumento.ENTRADA)])
    );
    vi.spyOn(documentService, 'contagens').mockResolvedValue(contadores);
    fixture.detectChanges();
    listPage.mockClear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('envia a direção da aba, a página e o tamanho para o back-end', async () => {
    listPage.mockImplementation(async (filtros?: DocumentoFiltros) =>
      pagina(filtros?.direcao === DirecaoDocumento.ENTRADA ? [documento(2, DirecaoDocumento.ENTRADA)] : [])
    );

    await component.setTab(DirecaoDocumento.ENTRADA);

    expect(listPage).toHaveBeenCalledWith(expect.objectContaining({
      direcao: DirecaoDocumento.ENTRADA,
      page: 0,
      size: 10,
    }));
    expect(component.docs?.length).toBe(1);
    expect(component.docs?.every((doc) => doc.direcao === DirecaoDocumento.ENTRADA)).toBe(true);
  });

  it('busca contagens agregadas sem carregar todos os documentos', () => {
    expect(component.contagens.ENVIADO).toBe(2);
    expect(component.contadoresAbas[DirecaoDocumento.SAIDA]).toBe(1);
  });

  it('recarrega e notifica depois de anexar documento', async () => {
    const { notify } = prepararMutations();
    const create = vi.spyOn(documentService, 'create').mockResolvedValue(documento(3, DirecaoDocumento.SAIDA));

    await component.handleAttach(anexo);

    expect(create).toHaveBeenCalledWith(anexo);
    expect(listPage).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('documents', 'deadlines', 'dashboard');
  });

  it('recarrega e notifica depois de registrar recebimento', async () => {
    const { notify } = prepararMutations();
    const createEntrada = vi
      .spyOn(documentService, 'createEntrada')
      .mockResolvedValue(documento(4, DirecaoDocumento.ENTRADA));

    await component.handleReceive(entrada);

    expect(createEntrada).toHaveBeenCalledWith(entrada);
    expect(listPage).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('documents', 'deadlines', 'dashboard');
  });

  it('recarrega e notifica depois de enviar documento', async () => {
    const { notify } = prepararMutations();
    const markEnviado = vi
      .spyOn(documentService, 'markEnviado')
      .mockResolvedValue(documento(1, DirecaoDocumento.SAIDA));
    const doc = documento(1, DirecaoDocumento.SAIDA);

    await component.handleSend(doc);

    expect(markEnviado).toHaveBeenCalledWith(doc.id);
    expect(listPage).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('documents', 'dashboard');
  });

  it('recarrega a listagem ao gerar o link de compartilhamento', async () => {
    const { notify } = prepararMutations();
    const compartilhar = vi.spyOn(documentService, 'compartilhar').mockResolvedValue({
      token: 'tok',
      path: '/d/tok',
      url: 'http://localhost/d/tok',
    });

    await component.handleShare(documento(1, DirecaoDocumento.SAIDA));

    expect(compartilhar).toHaveBeenCalledWith(1);
    expect(component.shareOpen).toBe(true);
    expect(listPage).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('documents', 'dashboard');
  });

  it('recarrega e notifica depois de reenviar seleção', async () => {
    const { notify } = prepararMutations();
    const markEnviado = vi
      .spyOn(documentService, 'markEnviado')
      .mockResolvedValue(documento(1, DirecaoDocumento.SAIDA));
    component.docs = [documento(1, DirecaoDocumento.SAIDA)];
    component.selectedIds = new Set([1]);

    await component.handleReenviar();

    expect(markEnviado).toHaveBeenCalledTimes(1);
    expect(listPage).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('documents', 'dashboard');
  });

  it('recarrega e notifica depois de juntar PDFs', async () => {
    const { notify } = prepararMutations();
    const createConsolidado = vi
      .spyOn(documentService, 'createConsolidado')
      .mockResolvedValue(documento(5, DirecaoDocumento.SAIDA));
    const primeiro = { ...documento(1, DirecaoDocumento.SAIDA), formato: 'pdf' };
    component.docs = [primeiro, { ...primeiro, id: 2 }];
    component.selectedIds = new Set([1, 2]);

    await component.handleMerge({ nome: 'Consolidado', fontes: ['a', 'b'] });

    expect(createConsolidado).toHaveBeenCalledTimes(1);
    expect(listPage).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('documents', 'dashboard');
  });

  it('exclui documento confirmado e notifica prazos e dashboard', async () => {
    const { notify } = prepararMutations();
    vi.spyOn(TestBed.inject(NotificationService), 'confirm').mockResolvedValue(true);
    const remove = vi.spyOn(documentService, 'remove').mockResolvedValue();
    component.selectedIds = new Set([1]);

    await component.handleDelete(documento(1, DirecaoDocumento.SAIDA));

    expect(remove).toHaveBeenCalledWith(1);
    expect(component.selectedIds.size).toBe(0);
    expect(listPage).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('documents', 'deadlines', 'dashboard');
  });

  it('não exclui documento quando a confirmação é cancelada', async () => {
    prepararMutations();
    vi.spyOn(TestBed.inject(NotificationService), 'confirm').mockResolvedValue(false);
    const remove = vi.spyOn(documentService, 'remove');

    await component.handleDelete(documento(1, DirecaoDocumento.SAIDA));

    expect(remove).not.toHaveBeenCalled();
  });

  it('recarrega e notifica depois de baixar documento do visualizador', async () => {
    const { notify } = prepararMutations();
    const markBaixado = vi
      .spyOn(documentService, 'markBaixado')
      .mockResolvedValue(documento(1, DirecaoDocumento.SAIDA));
    vi.spyOn(documentService, 'getById').mockResolvedValue(null);
    component.viewedDoc = documento(1, DirecaoDocumento.SAIDA);

    await component.handleDownload();

    expect(markBaixado).toHaveBeenCalledWith(1);
    expect(listPage).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('documents', 'dashboard');
  });
});
