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

import { LogoComponent } from '../../core/components/logo.component';
import { AuthService, CREDENCIAIS_DEMO } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

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
  template: `
    <div class="min-h-screen bg-[#F1F5F9] font-sans text-slate-800 flex">
      <section
        class="relative hidden lg:flex lg:w-1/2 min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-500 to-violet-600 p-10 xl:p-14 text-white"
      >
        <div class="pointer-events-none absolute -top-28 -right-24 w-96 h-96 rounded-full bg-white/10 blur-2xl"></div>
        <div class="pointer-events-none absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-indigo-300/20 blur-3xl"></div>

        <div class="relative z-10">
          <app-logo label="ContaDash" [inverted]="true"></app-logo>

          <div class="mt-16 xl:mt-20 max-w-lg">
            <span
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-medium"
            >
              <svg lucideSparkles [size]="14"></svg>
              Gestão inteligente para escritórios contábeis
            </span>

            <h1 class="mt-6 text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
              Documentos, prazos e solicitações<br />
              <span class="text-indigo-100">tudo sob controle.</span>
            </h1>
            <p class="mt-5 text-white/75 text-base leading-relaxed max-w-md">
              Acompanhe cada etapa dos seus clientes, receba arquivos com segurança e nunca mais
              perca um prazo importante.
            </p>

            <div class="mt-10 space-y-3">
              <div class="flex items-center gap-4 rounded-2xl bg-white/10 border border-white/15 p-4 backdrop-blur-sm">
                <span class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <svg lucideFileCheck2 [size]="20"></svg>
                </span>
                <div>
                  <p class="text-sm font-semibold">Documentos organizados</p>
                  <p class="text-xs text-white/65">Recebimento, conferência e aprovação em um só fluxo.</p>
                </div>
              </div>
              <div class="flex items-center gap-4 rounded-2xl bg-white/10 border border-white/15 p-4 backdrop-blur-sm">
                <span class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <svg lucideCalendarClock [size]="20"></svg>
                </span>
                <div>
                  <p class="text-sm font-semibold">Prazos sempre em dia</p>
                  <p class="text-xs text-white/65">Alertas e acompanhamento de cada etapa.</p>
                </div>
              </div>
              <div class="flex items-center gap-4 rounded-2xl bg-white/10 border border-white/15 p-4 backdrop-blur-sm">
                <span class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <svg lucideShieldCheck [size]="20"></svg>
                </span>
                <div>
                  <p class="text-sm font-semibold">Envio seguro pelos clientes</p>
                  <p class="text-xs text-white/65">Links exclusivos para cada solicitação.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="relative z-10 w-full max-w-sm rounded-3xl bg-white/10 border border-white/20 p-5 backdrop-blur-md shadow-2xl">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-widest text-white/60">Resumo do mês</p>
              <p class="text-xl font-bold mt-1">Outubro / 2026</p>
            </div>
            <span class="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
              <svg lucideSparkles [size]="20"></svg>
            </span>
          </div>
          <div class="mt-5 grid grid-cols-3 gap-3">
            <div class="rounded-2xl bg-white/10 p-3">
              <p class="text-2xl font-bold">12</p>
              <p class="text-[11px] text-white/65">Documentos</p>
            </div>
            <div class="rounded-2xl bg-white/10 p-3">
              <p class="text-2xl font-bold">05</p>
              <p class="text-[11px] text-white/65">Prazos</p>
            </div>
            <div class="rounded-2xl bg-white/10 p-3">
              <p class="text-2xl font-bold">03</p>
              <p class="text-[11px] text-white/65">Pendências</p>
            </div>
          </div>
        </div>
      </section>

      <section class="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 md:p-10">
        <div class="w-full max-w-md">
          <div class="lg:hidden mb-8">
            <app-logo label="ContaDash"></app-logo>
          </div>

          <div>
            <p class="text-xs font-semibold uppercase tracking-widest text-indigo-500">Acesso ao sistema</p>
            <h2 class="mt-2 text-3xl font-bold text-slate-800">Bem-vindo de volta</h2>
            <p class="mt-2 text-sm text-slate-500">
              Entre com sua conta para acompanhar documentos e prazos.
            </p>
          </div>

          @if (erro) {
            <div
              class="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              <svg lucideCircleAlert [size]="18" class="shrink-0 mt-0.5"></svg>
              <span>{{ erro }}</span>
            </div>
          }

          <form class="mt-8 space-y-5" (submit)="entrar($event)">
            <div>
              <label for="email" class="block text-sm font-semibold mb-1.5 text-slate-700">E-mail</label>
              <div class="relative">
                <svg
                  lucideMail
                  [size]="18"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                ></svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="username"
                  placeholder="seuemail@empresa.com.br"
                  [value]="email"
                  [disabled]="carregando"
                  (input)="email = $any($event.target).value; erro = ''"
                  class="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between">
                <label for="senha" class="block text-sm font-semibold mb-1.5 text-slate-700">Senha</label>
                <button
                  type="button"
                  (click)="mostrarAjudaSenha()"
                  class="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div class="relative">
                <svg
                  lucideLock
                  [size]="18"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                ></svg>
                <input
                  id="senha"
                  name="senha"
                  [type]="mostrarSenha ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Digite sua senha"
                  [value]="senha"
                  [disabled]="carregando"
                  (input)="senha = $any($event.target).value; erro = ''"
                  class="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm disabled:opacity-60"
                />
                <button
                  type="button"
                  (click)="mostrarSenha = !mostrarSenha"
                  [attr.aria-label]="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
                  class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  @if (mostrarSenha) {
                    <svg lucideEyeOff [size]="18"></svg>
                  } @else {
                    <svg lucideEye [size]="18"></svg>
                  }
                </button>
              </div>
              @if (mensagemRecuperacao) {
                <p class="mt-2 text-xs text-slate-500 leading-relaxed">
                  Entre em contato com o administrador do escritório para redefinir sua senha.
                </p>
              }
            </div>

            <label class="flex items-center gap-2.5 cursor-pointer select-none text-sm text-slate-600">
              <input
                type="checkbox"
                [checked]="lembrarDeMim"
                (change)="lembrarDeMim = $any($event.target).checked"
                class="w-4 h-4 rounded border-slate-300 text-indigo-500 accent-indigo-500"
              />
              Lembrar de mim neste dispositivo
            </label>

            <button
              type="submit"
              [disabled]="carregando"
              class="w-full py-3 rounded-full bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-indigo-600 disabled:opacity-60 transition-colors shadow-sm shadow-indigo-200"
            >
              @if (carregando) {
                <svg lucideLoader2 [size]="18" class="animate-spin"></svg>
                Entrando...
              } @else {
                Entrar
                <svg lucideArrowRight [size]="18"></svg>
              }
            </button>
          </form>

          <div class="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
            <p class="text-xs font-semibold text-indigo-700">Acesso de demonstração</p>
            <p class="mt-1 text-xs text-indigo-900/70 leading-relaxed">
              E-mail: <strong>{{ credenciaisDemo.email }}</strong><br />
              Senha: <strong>{{ credenciaisDemo.senha }}</strong>
            </p>
            <button
              type="button"
              (click)="preencherDemo()"
              class="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
            >
              Preencher dados automaticamente
            </button>
          </div>

          <p class="mt-8 flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
            <svg lucideShieldCheck [size]="16" class="shrink-0 mt-0.5 text-indigo-400"></svg>
            Seus dados são usados apenas para a gestão dos documentos e prazos do escritório.
          </p>
        </div>
      </section>
    </div>
  `,
})
export class LoginPageComponent implements OnInit {
  email = '';
  senha = '';
  lembrarDeMim = false;
  mostrarSenha = false;
  carregando = false;
  erro = '';
  mensagemRecuperacao = false;

  readonly credenciaisDemo = CREDENCIAIS_DEMO;

  private returnUrl = '/';

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly toastService: ToastService
  ) {}

  ngOnInit(): void {
    const retorno = this.route.snapshot.queryParamMap.get('returnUrl');
    this.returnUrl =
      retorno && retorno.startsWith('/') && !retorno.startsWith('/login') ? retorno : '/';

    if (this.auth.autenticado) {
      void this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
    }
  }

  preencherDemo(): void {
    this.email = CREDENCIAIS_DEMO.email;
    this.senha = CREDENCIAIS_DEMO.senha;
    this.erro = '';
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
      this.toastService.show('Login realizado com sucesso.');
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
}
