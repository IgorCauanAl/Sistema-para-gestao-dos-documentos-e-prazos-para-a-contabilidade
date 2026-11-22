import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LucideCalendar, LucideLayoutDashboard, LucideLogOut } from '@lucide/angular';

import { LogoComponent } from '../logo/logo.component';
import { AuthService } from '../../services/auth.service';

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
  imports: [LogoComponent, LucideCalendar, LucideLayoutDashboard, LucideLogOut],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.css',
})
export class TopNavComponent {
  readonly tabs = navigationTabs;

  constructor(
    public router: Router,
    public readonly auth: AuthService
  ) {}

  isTabActive(tab: NavTab): boolean {
    const pathname = this.router.url.split('?')[0];
    return tab.path === '/'
      ? pathname === '/'
      : pathname === tab.path || pathname.startsWith(`${tab.path}/`);
  }

  sair(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
