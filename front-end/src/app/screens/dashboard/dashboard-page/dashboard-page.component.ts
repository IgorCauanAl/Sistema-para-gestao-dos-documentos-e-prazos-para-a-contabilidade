import { Component, OnDestroy, OnInit } from '@angular/core';
import type { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Subscription } from 'rxjs';

import { CardComponent } from '../../../core/components/ui/card/card.component';
import { SummaryCardComponent } from '../../../core/components/ui/summary-card/summary-card.component';
import type { DashboardCharts, DashboardSummaryCard } from '../../../core/domain/models';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DataRefreshService } from '../../../core/services/data-refresh.service';

const INDIGO = '#6366f1';
const SLATE = '#94a3b8';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [BaseChartDirective, CardComponent, SummaryCardComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  summaryCards: DashboardSummaryCard[] | null = null;
  charts: DashboardCharts | null = null;
  carregando = true;
  erro: string | null = null;
  erroGraficos: string | null = null;

  private refreshSubscription?: Subscription;

  fluxoData: ChartData<'line'> = { labels: [], datasets: [] };
  fluxoOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { position: 'bottom' } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#e2e8f0' } },
      x: { grid: { display: false } },
    },
  };

  tiposData: ChartData<'bar'> = { labels: [], datasets: [] };
  tiposOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#e2e8f0' } },
      x: { grid: { display: false } },
    },
  };

  situacaoDocumentosData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  situacaoDocumentosOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: { legend: { position: 'bottom' } },
  };

  obrigacoesData: ChartData<'bar'> = { labels: [], datasets: [] };
  obrigacoesOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#e2e8f0' } },
      y: { grid: { display: false } },
    },
  };

  constructor(
    private dashboardService: DashboardService,
    private refreshService: DataRefreshService
  ) {}

  async ngOnInit(): Promise<void> {
    this.refreshSubscription = this.refreshService.changes$.subscribe(() => void this.recarregarTudo());
    await this.recarregarTudo();
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  private async recarregarTudo(): Promise<void> {
    this.carregando = true;
    await Promise.all([this.carregarIndicadores(), this.carregarGraficos()]);
    this.carregando = false;
  }

  private async carregarIndicadores(): Promise<void> {
    try {
      this.summaryCards = await this.dashboardService.getSummaryCards();
    } catch {
      this.erro = 'Não foi possível carregar os indicadores.';
    }
  }

  private async carregarGraficos(): Promise<void> {
    try {
      this.charts = await this.dashboardService.getCharts();
      this.montarGraficos(this.charts);
    } catch {
      this.erroGraficos = 'Não foi possível carregar os gráficos.';
    }
  }

  private montarGraficos(charts: DashboardCharts): void {
    this.fluxoData = {
      labels: charts.documentFlow.map((point) => point.label),
      datasets: [
        {
          label: 'Enviados (Contabilidade)',
          data: charts.documentFlow.map((point) => point.sent),
          borderColor: INDIGO,
          backgroundColor: 'rgba(99, 102, 241, 0.12)',
          pointBackgroundColor: INDIGO,
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.35,
          fill: true,
        },
        {
          label: 'Recebidos (Clientes)',
          data: charts.documentFlow.map((point) => point.received),
          borderColor: SLATE,
          backgroundColor: SLATE,
          pointBackgroundColor: SLATE,
          borderWidth: 2,
          borderDash: [6, 6],
          pointRadius: 3,
          tension: 0.35,
          fill: false,
        },
      ],
    };

    this.tiposData = {
      labels: charts.documentsByType.map((item) => item.label),
      datasets: [
        {
          label: 'Documentos',
          data: charts.documentsByType.map((item) => item.value),
          backgroundColor: charts.documentsByType.map((_, index) =>
            index === 0 ? INDIGO : '#c7d2fe',
          ),
          borderRadius: 8,
          maxBarThickness: 44,
        },
      ],
    };

    this.situacaoDocumentosData = {
      labels: charts.documentsBySituation.map((item) => item.label),
      datasets: [
        {
          data: charts.documentsBySituation.map((item) => item.value),
          backgroundColor: charts.documentsBySituation.map((item) => this.corSituacao(item.label)),
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    };

    this.obrigacoesData = {
      labels: charts.obligationsByStatus.map((item) => item.label),
      datasets: [
        {
          label: 'Obrigações',
          data: charts.obligationsByStatus.map((item) => item.value),
          backgroundColor: charts.obligationsByStatus.map((item) => this.corObrigacao(item.label)),
          borderRadius: 8,
          maxBarThickness: 24,
        },
      ],
    };
  }

  private corSituacao(label: string): string {
    const normalized = label.toLowerCase();
    if (normalized.includes('atrasado')) return '#ef4444';
    if (normalized.includes('prazo')) return '#16a34a';
    return SLATE;
  }

  private corObrigacao(label: string): string {
    const normalized = label.toLowerCase();
    if (normalized.includes('atrasado')) return '#ef4444';
    if (normalized.includes('pendente')) return '#f59e0b';
    if (normalized.includes('andamento')) return INDIGO;
    if (normalized.includes('conclu')) return '#16a34a';
    return SLATE;
  }
}
