import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LucideBell, LucideGlobe, LucideLayoutDashboard, LucideSettings } from '@lucide/angular';
import { Subscription } from 'rxjs';

import type { Cliente, Prazo } from '../../domain/models';
import { ClientService } from '../../services/client.service';
import { PrazoRefreshService } from '../../services/prazo-refresh.service';
import { AlertasPrazo, calcularAlertas, PrazoService } from '../../services/prazo.service';
import { ToastService } from '../../services/toast.service';
import { AlertaPanelComponent } from '../../../screens/deadlines/ui/alerta-panel/alerta-panel.component';
import { EmailSimuladoModalComponent } from '../../../screens/deadlines/ui/email-simulado-modal/email-simulado-modal.component';

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
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit, OnDestroy {
  alertas: AlertasPrazo = emptyAlertas();
  prazos: Prazo[] = [];
  clientes: Cliente[] = [];
  panelOpen = false;
  emailOpen = false;
  readonly hoje = new Date();

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
    const [listaPrazos, listaClientes] = await Promise.all([
      this.prazoService.list(),
      this.clientService.list(),
    ]);
    this.prazos = listaPrazos;
    this.alertas = calcularAlertas(listaPrazos, this.hoje);
    this.clientes = listaClientes;
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
