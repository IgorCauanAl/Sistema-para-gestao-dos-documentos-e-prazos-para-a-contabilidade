import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import type { DashboardCharts, DashboardSummaryCard } from '../domain/models';

/** Resposta do endpoint real GET /dashboard/summary. */
export interface DashboardSummaryResponse {
  totalCustomers: number;
  pendingDocuments: number;
  overdueObligations: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  async getSummary(): Promise<DashboardSummaryResponse> {
    return firstValueFrom(this.http.get<DashboardSummaryResponse>('/dashboard/summary'));
  }

  /** Séries agregadas no back-end para os gráficos da visão geral. */
  async getCharts(): Promise<DashboardCharts> {
    return firstValueFrom(this.http.get<DashboardCharts>('/dashboard/charts'));
  }

  /** Indicadores exigidos pelo RF02, montados somente com dados vindos da API. */
  async getSummaryCards(): Promise<DashboardSummaryCard[]> {
    const summary = await this.getSummary();

    return [
      {
        title: 'Total de Clientes',
        value: String(summary.totalCustomers),
        subtext: 'cadastrados',
        icon: 'users',
      },
      {
        title: 'Docs. Pendentes',
        value: String(summary.pendingDocuments),
        subtext: 'aguardando ação/envio do cliente',
        icon: 'fileWarning',
        colorTheme: 'warning',
      },
      {
        title: 'Obrigações Atrasadas',
        value: String(summary.overdueObligations),
        subtext: 'revisão imediata',
        icon: 'clockAlert',
        colorTheme: 'danger',
      },
    ];
  }
}
