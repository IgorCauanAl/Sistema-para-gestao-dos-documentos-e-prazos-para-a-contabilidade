import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { ShellLayoutComponent } from './core/layout/shell-layout.component';
import { ClientDetailPageComponent } from './screens/client-detail/client-detail-page.component';
import { ClientPortalPageComponent } from './screens/client-portal/client-portal-page.component';
import { ClientsPageComponent } from './screens/clients/clients-page.component';
import { DashboardPageComponent } from './screens/dashboard/dashboard-page.component';
import { DeadlinesPageComponent } from './screens/deadlines/deadlines-page.component';
import { DocumentsPageComponent } from './screens/documents/documents-page.component';
import { LoginPageComponent } from './screens/login/login-page.component';
import { SolicitacaoDetailPageComponent } from './screens/solicitacoes/solicitacao-detail-page.component';
import { SolicitacoesPageComponent } from './screens/solicitacoes/solicitacoes-page.component';

export const routes: Routes = [
  {
    path: 's/:token',
    component: ClientPortalPageComponent,
    title: 'ContaDash — Envio de documentos',
  },
  {
    path: 'login',
    component: LoginPageComponent,
    title: 'ContaDash — Login',
  },
  {
    path: '',
    component: ShellLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: DashboardPageComponent,
        title: 'ContaDash — Dashboard',
      },
      {
        path: 'clientes',
        component: ClientsPageComponent,
        title: 'ContaDash — Clientes',
      },
      {
        path: 'clientes/:clienteId',
        component: ClientDetailPageComponent,
        title: 'ContaDash — Cliente',
      },
      {
        path: 'documentos',
        component: DocumentsPageComponent,
        title: 'ContaDash — Documentos',
      },
      {
        path: 'prazos',
        component: DeadlinesPageComponent,
        title: 'ContaDash — Prazos',
      },
      {
        path: 'solicitacoes',
        component: SolicitacoesPageComponent,
        title: 'ContaDash — Solicitações',
      },
      {
        path: 'solicitacoes/:solicitacaoId',
        component: SolicitacaoDetailPageComponent,
        title: 'ContaDash — Solicitação',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
