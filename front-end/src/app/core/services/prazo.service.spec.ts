import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PrazoService } from './prazo.service';

const prazoDTO = (sobrescrever: Partial<Record<string, unknown>> = {}) => ({
  id: 7,
  customerId: 3,
  customerName: 'Empresa Teste',
  obligation: 'DAS',
  category: 'Fiscal',
  competence: '11/2026',
  dueDate: '2099-12-20',
  priority: 'MEDIA',
  currentStage: 'EM_ANDAMENTO',
  status: 'EM_ANDAMENTO',
  overdue: false,
  ...sobrescrever,
});

describe('PrazoService', () => {
  let service: PrazoService;
  let http: HttpTestingController;

  const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PrazoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('carrega os prazos do read model da API', async () => {
    const promessa = service.list();
    http.expectOne('/deadlines').flush([prazoDTO()]);

    const prazos = await promessa;
    expect(prazos.length).toBe(1);
    expect(prazos[0].obrigacao).toBe('DAS');
    expect(prazos[0].modeloId).toBe('DAS');
    expect(prazos[0].vencimentoAtual).toBe('20/12/2099');
    expect(prazos[0].status).toBe('EM_ANDAMENTO');
    expect(prazos[0].etapaAtual).toBe(1);
    expect(prazos[0].etapasConcluidas).toEqual([0]);
    expect(prazos[0].prioridade).toBe('MEDIA');
    expect(prazos[0].overdue).toBe(false);
    expect(prazos[0].historico).toEqual([]);
  });

  it('mapeia status e etapa do backend para o domínio do front', async () => {
    const promessa = service.list();
    http.expectOne('/deadlines').flush([
      prazoDTO({ id: 8, status: 'CONCLUIDO', currentStage: 'CONCLUIDO', overdue: false }),
      prazoDTO({ id: 9, status: 'ATRASADO', currentStage: 'RECEBIDO', overdue: true }),
      prazoDTO({ id: 10, status: 'CANCELADO', currentStage: 'RECEBIDO', overdue: false }),
    ]);

    const prazos = await promessa;
    expect(prazos.find((p) => p.id === 8)?.status).toBe('ENTREGUE');
    expect(prazos.find((p) => p.id === 8)?.etapaAtual).toBe(4);
    expect(prazos.find((p) => p.id === 9)?.status).toBe('EM_ANDAMENTO');
    expect(prazos.find((p) => p.id === 9)?.overdue).toBe(true);
    expect(prazos.find((p) => p.id === 10)?.status).toBe('CANCELADO');
  });

  it('lista prazos de um cliente pela rota da API', async () => {
    const promessa = service.listByCliente(3);
    http.expectOne('/deadlines/customer/3').flush([prazoDTO()]);

    const prazos = await promessa;
    expect(prazos[0].clienteId).toBe(3);
  });

  it('marca como entregue somente após a chamada PATCH', async () => {
    const promessa = service.marcarEntregue(7);
    const req = http.expectOne('/deadlines/7/deliver');
    expect(req.request.method).toBe('PATCH');
    req.flush(null);
    await tick();
    http
      .expectOne('/deadlines')
      .flush([prazoDTO({ status: 'CONCLUIDO', currentStage: 'CONCLUIDO' })]);

    const atualizado = await promessa;
    expect(atualizado?.status).toBe('ENTREGUE');
  });

  it('calcula alertas a partir dos prazos persistidos', async () => {
    const promessa = service.getAlertas();
    http.expectOne('/deadlines').flush([
      prazoDTO({ id: 1, overdue: true, status: 'ATRASADO', dueDate: '2020-01-01' }),
      prazoDTO({ id: 2, overdue: false, dueDate: '2099-12-20' }),
    ]);

    const alertas = await promessa;
    expect(alertas.atrasados.map((p) => p.id)).toEqual([1]);
    expect(alertas.total).toBe(1);
  });
});
