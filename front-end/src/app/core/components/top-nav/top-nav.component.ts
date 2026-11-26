import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LucideCalendar, LucideLayoutDashboard, LucideLogOut } from '@lucide/angular';
import { filter, Subscription } from 'rxjs';

import { LogoComponent } from '../logo/logo.component';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { DataRefreshService } from '../../services/data-refresh.service';
import { NotificationService } from '../../services/notification.service';

interface NavTab {
  id: string;
  label: string;
  path: string;
  icon?: 'dashboard';
}

const navigationTabs: NavTab[] = [
  { id: 'Dashboard', label: 'Dashboard', icon: 'dashboard', path: '/' },
  { id: 'Clientes', label: 'Clientes', path: '/clientes' },
  { id: 'Documentos', label: 'Documentos', path: '/documentos' },
  { id: 'Prazos', label: 'Prazos', path: '/prazos' },
  { id: 'Solicitações', label: 'Solicitações', path: '/solicitacoes' },
];

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [
    LogoComponent,
    LucideCalendar,
    LucideLayoutDashboard,
    LucideLogOut,
    AsyncPipe,
    DatePipe,
  ],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.css',
})
export class TopNavComponent implements OnInit, OnDestroy {
  readonly tabs = navigationTabs;
  // Data atual do sistema, formatada pelo pipe `date` no template.
  readonly hoje = new Date();
  hasDraftDocuments = false;

  private refreshSubscription?: Subscription;

  constructor(
    public router: Router,
    public readonly auth: AuthService,
    private readonly notification: NotificationService,
    private readonly dashboardService: DashboardService,
    private readonly refreshService: DataRefreshService
  ) {}

  async ngOnInit(): Promise<void> {
    this.refreshSubscription = this.refreshService.changes$
      .pipe(
        filter((scopes) =>
          this.refreshService.has(scopes, 'documents', 'dashboard', 'customers', 'requests')
        )
      )
      .subscribe(() => void this.carregarResumo());

    await this.carregarResumo();
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  private async carregarResumo(): Promise<void> {
    try {
      const summary = await this.dashboardService.getSummary();
      this.hasDraftDocuments = summary.hasDraftDocuments;
    } catch {
      // O aviso é auxiliar: falha ao carregar o resumo não bloqueia a navegação.
    }
  }

  isTabActive(tab: NavTab): boolean {
    const pathname = this.router.url.split('?')[0];
    return tab.path === '/'
      ? pathname === '/'
      : pathname === tab.path || pathname.startsWith(`${tab.path}/`);
  }

  avatarUrl(nome: string): string {
    const seed = encodeURIComponent(nome || 'Contador');
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=e2e8f0`;
  }

  async sair(): Promise<void> {
    const confirmado = await this.notification.confirm({
      title: 'Sair do sistema?',
      message: 'Você será desconectado e precisará entrar novamente para continuar.',
      confirmLabel: 'Sair',
      cancelLabel: 'Permanecer',
      danger: false,
    });

    if (!confirmado) {
      this.notification.info('Você permaneceu conectado.');
      return;
    }

    try {
      this.auth.logout();
      this.notification.success('Você saiu do sistema com sucesso.');
      await this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch (error) {
      this.notification.error(error);
    }
  }
}
