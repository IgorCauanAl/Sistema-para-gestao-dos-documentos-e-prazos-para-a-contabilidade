import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DashboardService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('busca o resumo na API e troca pendências por itens a reenviar', async () => {
    const promessa = service.getSummaryCards();

    http.expectOne('/dashboard/summary').flush({
      totalCustomers: 7,
      resendItems: 3,
      overdueObligations: 2,
      hasDraftDocuments: true,
    });

    const cards = await promessa;

    expect(cards.length).toBe(3);
    expect(cards[0].title).toBe('Total de Clientes');
    expect(cards[0].value).toBe('7');
    expect(cards[1].title).toBe('Itens para Reenviar');
    expect(cards[1].value).toBe('3');
    expect(cards[2].title).toBe('Obrigações Atrasadas');
    expect(cards[2].value).toBe('2');
  });

  it('expõe o aviso de rascunho vindo do resumo', async () => {
    const promessa = service.getSummary();

    http.expectOne('/dashboard/summary').flush({
      totalCustomers: 7,
      resendItems: 0,
      overdueObligations: 0,
      hasDraftDocuments: true,
    });

    expect((await promessa).hasDraftDocuments).toBe(true);
  });

  it('busca as séries dos gráficos na API', async () => {
    const promessa = service.getCharts();

    http.expectOne('/dashboard/charts').flush({
      documentFlow: [{ label: 'nov/26', sent: 2, received: 5 }],
      documentsByType: [{ label: 'NF-e', value: 7 }],
      documentsBySituation: [{ label: 'Atrasado', value: 3 }],
      obligationsByStatus: [{ label: 'Pendente', value: 4 }],
    });

    const charts = await promessa;

    expect(charts.documentFlow[0].received).toBe(5);
    expect(charts.documentsByType[0].label).toBe('NF-e');
    expect(charts.documentsBySituation[0].value).toBe(3);
    expect(charts.obligationsByStatus[0].value).toBe(4);
  });
});
