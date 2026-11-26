import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { MockInstance } from 'vitest';

import { DataRefreshService } from '../../../core/services/data-refresh.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import type { DashboardCharts, DashboardSummaryCard } from '../../../core/domain/models';
import { testProviders } from '../../../testing/test-providers';

import { DashboardPageComponent } from './dashboard-page.component';

const cards: DashboardSummaryCard[] = [
  { title: 'Total de Clientes', value: '2', subtext: 'cadastrados', icon: 'users' },
];

const charts: DashboardCharts = {
  documentFlow: [],
  documentsByType: [],
  documentsBySituation: [],
  obligationsByStatus: [],
};

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;
  let getSummaryCards: MockInstance<() => Promise<DashboardSummaryCard[]>>;
  let getCharts: MockInstance<() => Promise<DashboardCharts>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
    const dashboardService = TestBed.inject(DashboardService);
    getSummaryCards = vi.spyOn(dashboardService, 'getSummaryCards').mockResolvedValue(cards);
    getCharts = vi.spyOn(dashboardService, 'getCharts').mockResolvedValue(charts);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('recarrega indicadores e gráficos quando uma mutação notifica o dashboard', async () => {
    getSummaryCards.mockClear();
    getCharts.mockClear();

    TestBed.inject(DataRefreshService).notify('documents');
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    expect(getSummaryCards).toHaveBeenCalledTimes(1);
    expect(getCharts).toHaveBeenCalledTimes(1);
  });
});
