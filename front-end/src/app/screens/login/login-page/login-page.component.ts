import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LucideArrowRight,
  LucideCalendarClock,
  LucideCircleAlert,
  LucideEye,
  LucideEyeOff,
  LucideFileCheck2,
  LucideLoader2,
  LucideLock,
  LucideMail,
  LucideShieldCheck,
  LucideSparkles,
} from '@lucide/angular';

import { LogoComponent } from '../../../core/components/logo/logo.component';
import { AuthService } from '../../../core/services/auth.service';
import { SessionExpirationService } from '../../../core/services/session-expiration.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    LogoComponent,
    LucideArrowRight,
    LucideCalendarClock,
    LucideCircleAlert,
    LucideEye,
    LucideEyeOff,
    LucideFileCheck2,
    LucideLoader2,
    LucideLock,
    LucideMail,
    LucideShieldCheck,
    LucideSparkles,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent implements OnInit {
  email = '';
  senha = '';
  lembrarDeMim = false;
  mostrarSenha = false;
  carregando = false;
  erro = '';
  mensagemRecuperacao = false;

  private returnUrl = '/';

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notification: NotificationService,
    private readonly sessionExpiration: SessionExpirationService
  ) {}

  ngOnInit(): void {
    const retornoQuery = this.route.snapshot.queryParamMap.get('returnUrl');
    const retornoSalvo = this.sessionExpiration.consumirUrlRetorno();
    this.returnUrl =
      this.urlRetornoValida(retornoQuery) ??
      this.urlRetornoValida(retornoSalvo) ??
      '/';

    if (this.auth.autenticado) {
      void this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
    }
  }

  mostrarAjudaSenha(): void {
    this.mensagemRecuperacao = !this.mensagemRecuperacao;
  }

  async entrar(event: Event): Promise<void> {
    event.preventDefault();
    this.erro = '';

    if (!this.emailValido) {
      this.erro = 'Informe um e-mail válido para continuar.';
      return;
    }
    if (!this.senha) {
      this.erro = 'Informe sua senha para continuar.';
      return;
    }

    this.carregando = true;
    try {
      await this.auth.login(this.email, this.senha, this.lembrarDeMim);
      this.notification.success('Login realizado com sucesso.');
      await this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
    } catch (error) {
      this.erro = error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.';
    } finally {
      this.carregando = false;
    }
  }

  private get emailValido(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
  }

  private urlRetornoValida(url: string | null): string | null {
    return url && url.startsWith('/') && !url.startsWith('/login') ? url : null;
  }
}
