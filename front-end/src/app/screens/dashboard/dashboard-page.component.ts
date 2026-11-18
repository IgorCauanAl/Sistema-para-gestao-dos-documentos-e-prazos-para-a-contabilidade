import { Component, OnInit } from '@angular/core';
import {
  LucideArrowUpRight,
  LucideBuilding2,
  LucideCalendar,
  LucideChevronDown,
  LucideDownload,
  LucideSettings,
} from '@lucide/angular';

import { CardComponent } from '../../core/components/ui/card.component';
import { SummaryCardComponent } from '../../core/components/ui/summary-card.component';
import type {
  DashboardClientProfile,
  DashboardDocumentType,
  DashboardFlow,
  DashboardObligations,
  DashboardSummaryCard,
  DashboardWeekly,
} from '../../core/domain/models';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CardComponent,
    SummaryCardComponent,
    LucideArrowUpRight,
    LucideBuilding2,
    LucideCalendar,
    LucideChevronDown,
    LucideDownload,
    LucideSettings,
  ],
  template: `
    @if (summaryCards) {
      <div class="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4">
          <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Visão Geral</h1>

          <div class="flex items-center gap-3">
            <button
              class="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <svg lucideBuilding2 [size]="16"></svg> Todos os Clientes
              <svg lucideChevronDown [size]="16" class="ml-1"></svg>
            </button>
            <button
              class="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <svg lucideCalendar [size]="16"></svg> Este Mês
              <svg lucideChevronDown [size]="16" class="ml-1"></svg>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (card of summaryCards; track card.title) {
            <app-summary-card
              [title]="card.title"
              [value]="card.value"
              [trend]="card.trend ?? ''"
              [trendUp]="card.trendUp ?? false"
              [subtext]="card.subtext ?? ''"
              [icon]="card.icon"
              [colorTheme]="card.colorTheme ?? ''"
            ></app-summary-card>
          }
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <!-- Main chart -->
          @if (documentFlow) {
            <app-card className="col-span-1 lg:col-span-2 relative overflow-hidden">
              <div class="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h3 class="text-xl font-bold text-slate-800">Fluxo de Documentos</h3>
                  <div class="flex gap-6 mt-4">
                    <div>
                      <p class="text-sm text-slate-500 font-medium">Enviados (Contabilidade)</p>
                      <p class="text-2xl font-bold text-slate-800">{{ documentFlow.sent }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-slate-500 font-medium">Recebidos (Clientes)</p>
                      <p class="text-2xl font-bold text-slate-800">{{ documentFlow.received }}</p>
                    </div>
                  </div>
                </div>
                <button
                  class="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-medium transition-colors border border-slate-200"
                >
                  <svg lucideSettings [size]="16"></svg> Mensal
                  <svg lucideChevronDown [size]="16"></svg>
                </button>
              </div>

              <div class="h-48 w-full mt-4 relative">
                <svg viewBox="0 0 800 200" class="w-full h-full preserve-3d" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient-enviados" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#6366F1" stop-opacity="0.2" />
                      <stop offset="100%" stop-color="#6366F1" stop-opacity="0" />
                    </linearGradient>
                    <pattern id="diagonal-stripe" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M-5,25 L25,-5" stroke="#e2e8f0" stroke-width="1" />
                    </pattern>
                  </defs>

                  <rect width="100%" height="100%" fill="url(#diagonal-stripe)" />

                  <path
                    d="M 0,150 Q 100,140 200,100 T 400,60 T 600,80 T 800,20"
                    fill="none"
                    stroke="#94a3b8"
                    stroke-width="3"
                    stroke-dasharray="6 6"
                  />

                  <path
                    d="M 0,180 Q 100,160 200,130 T 400,150 T 600,120 T 800,90"
                    fill="none"
                    stroke="#6366F1"
                    stroke-width="4"
                  />

                  <path
                    d="M 0,180 Q 100,160 200,130 T 400,150 T 600,120 T 800,90 L 800,200 L 0,200 Z"
                    fill="url(#gradient-enviados)"
                  />

                  <circle cx="600" cy="120" r="6" fill="white" stroke="#6366F1" stroke-width="3" />
                </svg>

                <div
                  class="absolute top-6 right-[20%] bg-white p-3 rounded-2xl shadow-lg border border-slate-100 flex flex-col gap-2 z-20"
                >
                  <p class="text-xs text-slate-400 font-medium mb-1">{{ documentFlow.tooltip.date }}</p>
                  <div class="flex items-center justify-between gap-4">
                    <span class="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                      <span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Recebidos
                    </span>
                    <span class="text-sm font-bold">{{ documentFlow.tooltip.received }}</span>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <span class="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                      <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Enviados
                    </span>
                    <span class="text-sm font-bold">{{ documentFlow.tooltip.sent }}</span>
                  </div>
                </div>

                <div
                  class="absolute bottom-0 w-full flex justify-between text-xs font-medium text-slate-400 px-2"
                >
                  @for (month of documentFlow.months; track month) {
                    <span>{{ month }}</span>
                  }
                </div>
              </div>
            </app-card>
          }

          <!-- Status widget -->
          @if (obligationsStatus) {
            <app-card className="col-span-1 flex flex-col">
              <div class="flex justify-between items-start mb-6">
                <h3 class="text-xl font-bold text-slate-800">Status Obrigações</h3>
                <button class="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <svg lucideArrowUpRight [size]="20" class="text-slate-400"></svg>
                </button>
              </div>

              <div
                class="p-4 bg-slate-50 rounded-2xl mb-6 flex justify-between items-center border border-slate-100"
              >
                <span class="font-semibold text-slate-700">
                  Novas Solicitações:
                  <span class="text-indigo-600">{{ obligationsStatus.newRequests }}</span>
                </span>
                <svg lucideArrowUpRight [size]="18" class="text-slate-400"></svg>
              </div>

              <div class="grid grid-cols-2 gap-3 mb-6 flex-1">
                @for (block of obligationsStatus.blocks; track block.label) {
                  <div
                    class="rounded-3xl p-4 flex flex-col justify-center items-center text-white shadow-sm hover:scale-[1.02] transition-transform cursor-pointer"
                    [class]="block.className"
                  >
                    <span class="text-3xl font-bold mb-1">{{ block.value }}</span>
                    <span
                      class="text-xs font-medium text-center leading-tight opacity-90 whitespace-pre-line"
                      >{{ block.label }}</span
                    >
                  </div>
                }
              </div>
            </app-card>
          }
        </div>

        <!-- Bottom widgets -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          @if (clientProfile) {
            <app-card title="Perfil de Clientes">
              <div cardAction>
                <svg lucideArrowUpRight [size]="18" class="text-slate-400 cursor-pointer"></svg>
              </div>
              <div class="flex flex-col h-[220px] justify-between">
                <div class="space-y-4 mt-4">
                  @for (item of clientProfile; track item.type) {
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="w-3 h-3 rounded-full" [class]="item.color"></div>
                        <span class="text-sm font-medium text-slate-600">{{ item.type }}</span>
                      </div>
                      <div class="flex items-center gap-4">
                        <span class="text-sm font-bold text-slate-800">{{ item.count }}</span>
                        <span class="text-xs font-medium text-slate-400 w-8 text-right">{{ item.pct }}</span>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </app-card>
          }

          @if (documentsByType) {
            <app-card title="Documentos por Tipo">
              <div cardAction>
                <svg lucideCalendar [size]="18" class="text-slate-400 cursor-pointer"></svg>
              </div>
              <div class="h-[220px] flex flex-col justify-end mt-4">
                <div class="flex justify-between items-end h-full px-2 gap-2">
                  @for (bar of documentsByType; track bar.label) {
                    <div class="flex flex-col items-center gap-2 flex-1 group">
                      @if (bar.highlight) {
                        <span class="text-xs font-bold text-indigo-600 mb-1">{{ bar.val }}</span>
                      }
                      <div
                        class="w-full rounded-t-lg transition-all duration-300"
                        [class]="
                          bar.highlight
                            ? 'bg-indigo-500 shadow-md shadow-indigo-200'
                            : 'bg-slate-200 group-hover:bg-slate-300'
                        "
                        [style.height]="bar.height"
                      ></div>
                      <span class="text-xs font-medium text-slate-500">{{ bar.label }}</span>
                    </div>
                  }
                </div>
              </div>
            </app-card>
          }

          @if (weeklyDeliveries) {
            <app-card title="Entregas na Semana">
              <div cardAction>
                <svg lucideDownload [size]="18" class="text-slate-400 cursor-pointer"></svg>
              </div>
              <div class="mt-2">
                <div class="flex items-end gap-3 mb-6">
                  <h4 class="text-3xl font-bold text-slate-800">{{ weeklyDeliveries.total }}</h4>
                  <span
                    class="flex items-center text-xs font-semibold px-2 py-1 rounded-md mb-1 bg-green-100 text-green-700"
                  >
                    ↑ {{ weeklyDeliveries.trend }}
                  </span>
                </div>

                <div class="h-24 w-full relative">
                  <svg viewBox="0 0 400 100" class="w-full h-full preserve-3d" preserveAspectRatio="none">
                    <path
                      d="M 0,80 Q 50,70 100,50 T 200,60 T 300,20 T 400,10"
                      fill="none"
                      stroke="#6366F1"
                      stroke-width="3"
                    />
                    <path
                      d="M 0,90 Q 50,85 100,70 T 200,80 T 300,40 T 400,50"
                      fill="none"
                      stroke="#cbd5e1"
                      stroke-width="2"
                      stroke-dasharray="4 4"
                    />
                    <circle cx="300" cy="20" r="4" fill="white" stroke="#6366F1" stroke-width="2" />
                  </svg>
                  <div
                    class="absolute bottom-[-10px] w-full flex justify-between text-[10px] font-medium text-slate-400 px-1"
                  >
                    @for (day of weeklyDeliveries.days; track day) {
                      <span>{{ day }}</span>
                    }
                  </div>
                </div>
              </div>
            </app-card>
          }
        </div>

        <div class="h-8"></div>
      </div>
    }
  `,
})
export class DashboardPageComponent implements OnInit {
  summaryCards: DashboardSummaryCard[] | null = null;
  documentFlow: DashboardFlow | null = null;
  obligationsStatus: DashboardObligations | null = null;
  clientProfile: DashboardClientProfile[] | null = null;
  documentsByType: DashboardDocumentType[] | null = null;
  weeklyDeliveries: DashboardWeekly | null = null;

  constructor(private dashboardService: DashboardService) {}

  async ngOnInit(): Promise<void> {
    const [summaryCards, documentFlow, obligationsStatus, clientProfile, documentsByType, weeklyDeliveries] =
      await Promise.all([
        this.dashboardService.getSummaryCards(),
        this.dashboardService.getDocumentFlow(),
        this.dashboardService.getObligationsStatus(),
        this.dashboardService.getClientProfile(),
        this.dashboardService.getDocumentsByType(),
        this.dashboardService.getWeeklyDeliveries(),
      ]);

    this.summaryCards = summaryCards;
    this.documentFlow = documentFlow;
    this.obligationsStatus = obligationsStatus;
    this.clientProfile = clientProfile;
    this.documentsByType = documentsByType;
    this.weeklyDeliveries = weeklyDeliveries;
  }
}
