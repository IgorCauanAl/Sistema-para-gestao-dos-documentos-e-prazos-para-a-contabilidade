import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LucideBell, LucideGlobe, LucideLayoutDashboard, LucideSettings } from '@lucide/angular';
import { Subscription } from 'rxjs';

import type { Cliente, Prazo } from '../domain/models';
import { HOJE } from '../domain/prazo';
import { ClientService } from '../services/client.service';
import { PrazoRefreshService } from '../services/prazo-refresh.service';
import { AlertasPrazo, PrazoService } from '../services/prazo.service';
import { ToastService } from '../services/toast.service';
import { AlertaPanelComponent } from '../../screens/deadlines/ui/alerta-panel.component';
import { EmailSimuladoModalComponent } from '../../screens/deadlines/ui/email-simulado-modal.component';

const emptyAlertas = (): AlertasPrazo => ({ atrasados: [], semana: [], janela: [], total: 0 });

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    AlertaPanelComponent,
    EmailSimuladoModalComponent,
    LucideBell,
    LucideGlobe,
    LucideLayoutDashboard,
    LucideSettings,
  ],
  template: `
    <aside
      class="w-20 bg-white border-r border-slate-200/50 flex flex-col items-center py-6 h-screen sticky top-0 hidden md:flex shrink-0"
    >
      <div
        class="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-500 mb-8 cursor-pointer"
      >
        <svg lucideLayoutDashboard [size]="20"></svg>
      </div>
      <nav class="flex flex-col gap-6 text-slate-400">
        <button
          type="button"
          aria-label="Alertas de prazos"
          [attr.aria-expanded]="panelOpen"
          (click)="panelOpen = !panelOpen"
          class="p-3 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-colors relative"
        >
          <svg lucideBell [size]="22"></svg>
          @if (alertas.total > 0) {
            <span
              class="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 bg-orange-500 text-white text-[11px] font-bold rounded-full border-2 border-white flex items-center justify-center"
            >
              {{ alertas.total }}
            </span>
          }
        </button>
        <button class="p-3 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-colors">
          <svg lucideSettings [size]="22"></svg>
        </button>
        <button class="p-3 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-colors">
          <svg lucideGlobe [size]="22"></svg>
        </button>
      </nav>
    </aside>

    <app-alerta-panel
      [open]="panelOpen"
      [alertas]="alertas"
      [clientes]="clientes"
      [hoje]="hoje"
      (onClose)="panelOpen = false"
      (onSelect)="abrirPrazo($event)"
      (onSimularEmail)="simularEmail()"
    ></app-alerta-panel>

    <app-email-simulado-modal
      [open]="emailOpen"
      [prazos]="prazos"
      [clientes]="clientes"
      [hoje]="hoje"
      (onClose)="emailOpen = false"
      (onSend)="enviarResumo()"
    ></app-email-simulado-modal>
  `,
})
export class SidebarComponent implements OnInit, OnDestroy {
  alertas: AlertasPrazo = emptyAlertas();
  prazos: Prazo[] = [];
  clientes: Cliente[] = [];
  panelOpen = false;
  emailOpen = false;
  readonly hoje = HOJE;

  private subscription?: Subscription;

  constructor(
    private router: Router,
    private prazoService: PrazoService,
    private clientService: ClientService,
    private toastService: ToastService,
    private refreshService: PrazoRefreshService
  ) {}

  ngOnInit(): void {
    this.refresh();
    this.subscription = this.refreshService.changes$.subscribe(() => this.refresh());
    this.router.events.subscribe(() => {
      this.panelOpen = false;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private async refresh(): Promise<void> {
    const [lista, listaClientes, listaPrazos] = await Promise.all([
      this.prazoService.getAlertas(HOJE),
      this.clientService.list(),
      this.prazoService.list(),
    ]);
    this.alertas = lista;
    this.clientes = listaClientes;
    this.prazos = listaPrazos;
  }

  abrirPrazo(prazo: Prazo): void {
    this.panelOpen = false;
    this.router.navigate(['/prazos'], { queryParams: { prazo: prazo.id } });
  }

  simularEmail(): void {
    this.panelOpen = false;
    this.emailOpen = true;
  }

  enviarResumo(): void {
    this.emailOpen = false;
    this.toastService.show('Resumo diário enviado (simulado).');
  }
}
