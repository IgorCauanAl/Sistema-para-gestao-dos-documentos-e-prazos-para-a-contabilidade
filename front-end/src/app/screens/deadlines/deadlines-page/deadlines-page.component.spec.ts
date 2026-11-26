import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { Documento, DocumentoNovo, Prazo } from '../../../core/domain/models';
import { ClientService } from '../../../core/services/client.service';
import { DataRefreshService } from '../../../core/services/data-refresh.service';
import { DocumentService } from '../../../core/services/document.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PrazoService } from '../../../core/services/prazo.service';
import { testProviders } from '../../../testing/test-providers';

import { DeadlinesPageComponent } from './deadlines-page.component';

const prazo: Prazo = {
  id: 3,
  clienteId: 1,
  modeloId: 'fgts',
  obrigacao: 'FGTS',
  categoria: 'Trabalhista',
  competencia: '09/2026',
  vencimentoAtual: '15/10/2026',
  prioridade: 'ALTA',
  prioridadeManual: false,
  status: 'PENDENTE',
  etapaAtual: 0,
  etapasConcluidas: [],
  historico: [],
  solicitacaoId: null,
  entregueEm: null,
};

const guia: DocumentoNovo = {
  clienteId: 1,
  tipo: 'Guia FGTS',
  competencia: '09/2026',
  canal: 'Manual',
  formato: 'pdf',
  tamanho: '1 KB',
  enviarAgora: false,
};

describe('DeadlinesPageComponent', () => {
  let component: DeadlinesPageComponent;
  let fixture: ComponentFixture<DeadlinesPageComponent>;
  let http: HttpTestingController;

  const prepararMutations = () => {
    vi.spyOn(TestBed.inject(ClientService), 'list').mockResolvedValue([]);
    return {
      list: vi.spyOn(TestBed.inject(PrazoService), 'list').mockResolvedValue([]),
      notify: vi.spyOn(TestBed.inject(DataRefreshService), 'notify'),
    };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeadlinesPageComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(DeadlinesPageComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.match('/deadlines').forEach((req) => req.flush([]));
    http
      .match((req) => req.url === '/customers')
      .forEach((req) =>
        req.flush({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 100 })
      );
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('recarrega os prazos e notifica o shell após marcar entrega', async () => {
    const prazoService = TestBed.inject(PrazoService);
    const { list, notify } = prepararMutations();
    const marcarEntregue = vi.spyOn(prazoService, 'marcarEntregue').mockResolvedValue(null);
    component.entregarSolicitado = prazo;

    await component.handleMarcarEntregue();

    expect(marcarEntregue).toHaveBeenCalledWith(prazo.id);
    expect(list).toHaveBeenCalledTimes(1);
    expect(component.entregarSolicitado).toBeNull();
    expect(notify).toHaveBeenCalledWith('deadlines', 'dashboard');
  });

  it('exclui prazo confirmado e notifica o dashboard', async () => {
    const prazoService = TestBed.inject(PrazoService);
    const { list, notify } = prepararMutations();
    vi.spyOn(TestBed.inject(NotificationService), 'confirm').mockResolvedValue(true);
    const remove = vi.spyOn(prazoService, 'remove').mockResolvedValue();

    await component.handleExcluir(prazo);

    expect(remove).toHaveBeenCalledWith(prazo.id);
    expect(list).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('deadlines', 'dashboard');
  });

  it('não exclui o prazo quando a confirmação é cancelada', async () => {
    prepararMutations();
    vi.spyOn(TestBed.inject(NotificationService), 'confirm').mockResolvedValue(false);
    const remove = vi.spyOn(TestBed.inject(PrazoService), 'remove');

    await component.handleExcluir(prazo);

    expect(remove).not.toHaveBeenCalled();
  });

  it('recarrega os prazos e notifica documentos após anexar guia', async () => {
    const documentService = TestBed.inject(DocumentService);
    const { list, notify } = prepararMutations();
    const create = vi.spyOn(documentService, 'create').mockResolvedValue({} as Documento);

    await component.handleAnexarGuia(guia);

    expect(create).toHaveBeenCalledWith(guia);
    expect(list).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('documents', 'deadlines', 'dashboard');
  });
});
