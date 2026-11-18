import { Injectable } from '@angular/core';

import type {
  DashboardClientProfile,
  DashboardDocumentType,
  DashboardFlow,
  DashboardObligations,
  DashboardSummaryCard,
  DashboardWeekly,
} from '../domain/models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  async getSummaryCards(): Promise<DashboardSummaryCard[]> {
    return [
      {
        title: 'Total de Clientes',
        value: '312',
        trend: '12%',
        trendUp: true,
        subtext: 'vs mês passado',
        icon: 'users',
      },
      {
        title: 'Docs. Pendentes',
        value: '87',
        trend: '24%',
        trendUp: false,
        subtext: 'aguardando cliente',
        icon: 'fileWarning',
        colorTheme: 'warning',
      },
      {
        title: 'Obrigações Atrasadas',
        value: '12',
        trend: '5%',
        trendUp: false,
        subtext: 'revisão imediata',
        icon: 'clockAlert',
        colorTheme: 'danger',
      },
      {
        title: 'Entregas Concluídas',
        value: '64',
        trend: '16%',
        trendUp: true,
        subtext: 'vs mês passado',
        icon: 'checkCircle2',
        colorTheme: 'success',
      },
    ];
  }

  async getDocumentFlow(): Promise<DashboardFlow> {
    return {
      sent: '1,248',
      received: '3,892',
      tooltip: {
        date: 'Out 12, 2026',
        received: '482',
        sent: '124',
      },
      months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out'],
    };
  }

  async getObligationsStatus(): Promise<DashboardObligations> {
    return {
      newRequests: 45,
      blocks: [
        { label: 'Pendentes', value: '142', className: 'bg-indigo-600' },
        { label: 'Preparando', value: '84', className: 'bg-indigo-400' },
        { label: 'Aguardando\nCliente', value: '36', className: 'bg-purple-400' },
        { label: 'Concluídas', value: '420', className: 'bg-[#15803D]' },
      ],
    };
  }

  async getClientProfile(): Promise<DashboardClientProfile[]> {
    return [
      { type: 'Comércio Varejista', count: 145, pct: '46%', color: 'bg-indigo-500' },
      { type: 'Prestadores de Serviço', count: 98, pct: '31%', color: 'bg-purple-400' },
      { type: 'Indústria', count: 42, pct: '13%', color: 'bg-slate-400' },
      { type: 'Outros', count: 27, pct: '10%', color: 'bg-slate-200' },
    ];
  }

  async getDocumentsByType(): Promise<DashboardDocumentType[]> {
    return [
      { label: 'NF-e', height: '80%', val: '45%' },
      { label: 'Folha', height: '40%', val: '20%' },
      { label: 'Impostos', height: '90%', val: '55%', highlight: true },
      { label: 'Extratos', height: '60%', val: '30%' },
      { label: 'Outros', height: '30%', val: '15%' },
    ];
  }

  async getWeeklyDeliveries(): Promise<DashboardWeekly> {
    return {
      total: '124',
      trend: '12.5%',
      days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
    };
  }
}
