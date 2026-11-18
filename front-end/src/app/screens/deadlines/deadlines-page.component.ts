import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { EmptyStateComponent } from '../../core/components/ui/empty-state.component';
import type { Cliente, DocumentoNovo, Prazo, SolicitacaoNova } from '../../core/domain/models';
import { diasRestantes, estaAtrasado, HOJE, prioridadeEfetiva, StatusPrazo } from '../../core/domain/prazo';
import { ClientService } from '../../core/services/client.service';
import { DocumentService } from '../../core/services/document.service';
import { PrazoRefreshService } from '../../core/services/prazo-refresh.service';
import { PrazoService } from '../../core/services/prazo.service';
import { SolicitacaoService } from '../../core/services/solicitacao.service';
import { ToastService } from '../../core/services/toast.service';
import { AttachDocumentModalComponent } from '../client-detail/ui/attach-document-modal.component';
import { ConfirmDialogComponent } from '../solicitacoes/ui/confirm-dialog.component';
import { NovaSolicitacaoModalComponent } from '../solicitacoes/ui/nova-solicitacao-modal.component';
import { PrazoDetailPanelComponent } from './ui/prazo-detail-panel.component';
import { PrazoFiltersComponent, emptyPrazoFilters, type PrazoFiltersModel } from './ui/prazo-filters.component';
import { PrazoSummaryCardsComponent, type PrazoContagens } from './ui/prazo-summary-cards.component';
import { PrazoTableComponent } from './ui/prazo-table.component';
import { ReprogramarModalComponent, type ReprogramarPayload } from './ui/reprogramar-modal.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-deadlines-page',
  standalone: true,
  imports: [
    EmptyStateComponent,
    PrazoSummaryCardsComponent,
    PrazoFiltersComponent,
    PrazoTableComponent,
    PrazoDetailPanelComponent,
    ReprogramarModalComponent,
    NovaSolicitacaoModalComponent,
    AttachDocumentModalComponent,
    ConfirmDialogComponent,
  ],
  template: `
    @if (prazos) {
      <div class="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-800">Prazos</h1>
          <p class="text-sm text-slate-500 mt-1">Acompanhe vencimentos e entregas do escritório</p>
        </div>

        <app-prazo-summary-cards
          [contagens]="contagens"
          [ativo]="cardAtivo"
          (onClick)="setCardAtivo($event)"
        ></app-prazo-summary-cards>

        <app-prazo-filters
          [filters]="filters"
          [clientes]="clientes"
          [opcoesObrigacao]="opcoesObrigacao"
          (filtersChange)="filters = $event"
          (onClear)="filters = emptyFilters()"
        ></app-prazo-filters>

        @if (listaExibida.length === 0) {
          <app-empty-state
            title="Nenhum deadline encontrado com esses filtros"
            subtitle="Ajuste a busca, o cliente, a categoria ou o status para encontrar o deadline desejado."
          ></app-empty-state>
        } @else {
          <div class="space-y-4">
            <app-prazo-table
              [prazos]="paginada"
              [nomeCliente]="nomeClienteFn"
              [hoje]="hoje"
              (onView)="abrirDetalhe($event)"
              (onEntregar)="entregarSolicitado = $event"
            ></app-prazo-table>

            <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
              <p>
                Mostrando {{ (paginaAtual - 1) * PAGE_SIZE + 1 }}–{{
                  Math.min(paginaAtual * PAGE_SIZE, listaExibida.length)
                }}
                de {{ listaExibida.length }} deadline{{ listaExibida.length > 1 ? 's' : '' }}
              </p>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Página anterior"
                  [disabled]="paginaAtual <= 1"
                  (click)="page = paginaAtual - 1"
                  class="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  aria-label="Próxima página"
                  [disabled]="paginaAtual >= totalPaginas"
                  (click)="page = paginaAtual + 1"
                  class="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        }

        <app-prazo-detail-panel
          [open]="!!prazoDetalhe"
          [deadline]="prazoDetalhe"
          [cliente]="clienteDetalhe"
          [hoje]="hoje"
          (onClose)="fecharDetalhe()"
          (onToggleEtapa)="handleToggleEtapa($event)"
          (onMarcarEntregue)="entregarSolicitado = prazoDetalhe"
          (onReprogramar)="reprogramarOpen = true"
          (onDefinirPrioridade)="handleDefinirPrioridade($event)"
          (onCriarSolicitacao)="novaSolOpen = true"
          (onAnexarGuia)="anexarOpen = true"
        ></app-prazo-detail-panel>

        <app-reprogramar-modal
          [open]="reprogramarOpen"
          [prazo]="prazoDetalhe"
          (onClose)="reprogramarOpen = false"
          (onConfirm)="handleReprogramarConfirm($event)"
        ></app-reprogramar-modal>

        <app-nova-solicitacao-modal
          [open]="novaSolOpen"
          [clientes]="clientes"
          [clienteInicial]="clienteDetalhe"
          (onClose)="novaSolOpen = false"
          (onSubmit)="handleCriarSolicitacao($event)"
        ></app-nova-solicitacao-modal>

        <app-attach-document-modal
          [open]="anexarOpen"
          [client]="clienteDetalhe"
          [prefill]="prefillAnexo"
          (onClose)="anexarOpen = false"
          (onSubmit)="handleAnexarGuia($event)"
        ></app-attach-document-modal>

        <app-confirm-dialog
          [open]="!!entregarSolicitado"
          (onClose)="entregarSolicitado = null"
          (onConfirm)="handleMarcarEntregue()"
          title="Marcar deadline como entregue"
          [message]="mensagemEntrega"
          confirmLabel="Marcar como entregue"
          [danger]="false"
        ></app-confirm-dialog>
      </div>
    }
  `,
})
export class DeadlinesPageComponent implements OnInit, OnDestroy {
  prazos: Prazo[] | null = null;
  clientes: Cliente[] = [];
  filters: PrazoFiltersModel = emptyPrazoFilters();
  cardAtivo: string | null = null;
  page = 1;

  reprogramarOpen = false;
  novaSolOpen = false;
  anexarOpen = false;
  entregarSolicitado: Prazo | null = null;

  detailId: number | null = null;
  readonly hoje = HOJE;
  readonly PAGE_SIZE = PAGE_SIZE;
  readonly Math = Math;

  private querySub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private prazoService: PrazoService,
    private solicitacaoService: SolicitacaoService,
    private documentService: DocumentService,
    private toastService: ToastService,
    private refreshService: PrazoRefreshService
  ) {}

  ngOnInit(): void {
    this.querySub = this.route.queryParamMap.subscribe((params) => {
      const id = Number(params.get('prazo') ?? params.get('deadline'));
      this.detailId = id || null;
      this.page = 1;
    });

    this.refresh();
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
  }

  async refresh(): Promise<void> {
    const [listaClientes, listaPrazos] = await Promise.all([
      this.clientService.list(),
      this.prazoService.list(),
    ]);
    this.clientes = listaClientes;
    this.prazos = listaPrazos;
  }

  emptyFilters(): PrazoFiltersModel {
    return emptyPrazoFilters();
  }

  async handleToggleEtapa(index: number): Promise<void> {
    if (!this.detailId) return;
    const atualizado = await this.prazoService.concluirEtapa(this.detailId, index);
    await this.refresh();
    this.refreshService.notify();
    if (
      atualizado &&
      atualizado.status !== StatusPrazo.ENTREGUE &&
      atualizado.etapasConcluidas.length === 5
    ) {
      this.entregarSolicitado = atualizado;
    }
  }

  async handleMarcarEntregue(): Promise<void> {
    const alvo = this.entregarSolicitado;
    this.entregarSolicitado = null;
    if (!alvo) return;

    await this.prazoService.marcarEntregue(alvo.id);
    await this.refresh();
    this.refreshService.notify();
    this.toastService.show(`Prazo de ${alvo.obrigacao} marcado como entregue.`);
  }

  async handleReprogramarConfirm(payload: ReprogramarPayload): Promise<void> {
    if (!this.detailId) return;
    await this.prazoService.reprogramar(this.detailId, payload);
    this.reprogramarOpen = false;
    await this.refresh();
    this.refreshService.notify();
    this.toastService.show(`Vencimento reprogramado para ${payload.novaData}.`);
  }

  async handleDefinirPrioridade(prioridade: string): Promise<void> {
    if (!this.detailId) return;
    await this.prazoService.definirPrioridade(this.detailId, prioridade);
    await this.refresh();
    this.refreshService.notify();
    this.toastService.show('Prioridade atualizada.');
  }

  async handleCriarSolicitacao(payload: SolicitacaoNova): Promise<void> {
    const detalhe = this.prazoDetalhe;
    if (!detalhe) return;

    const solicitacao = await this.solicitacaoService.create(payload);
    await this.prazoService.vincularSolicitacao(detalhe.id, solicitacao.id);
    this.novaSolOpen = false;
    await this.refresh();
    this.refreshService.notify();
    this.toastService.show(
      `Solicitação criada e vinculada ao deadline de ${detalhe.obrigacao}.`
    );
  }

  async handleAnexarGuia(payload: DocumentoNovo): Promise<void> {
    await this.documentService.create(payload);
    this.anexarOpen = false;
    this.toastService.show('Guia anexada e enviada ao cliente.');
  }

  setCardAtivo(valor: string | null): void {
    this.cardAtivo = valor;
    this.page = 1;
  }

  abrirDetalhe(prazo: Prazo): void {
    this.router.navigate([], { queryParams: { prazo: prazo.id } });
  }

  fecharDetalhe(): void {
    this.router.navigate([], { queryParams: {} });
  }

  get nomeClienteFn(): (clienteId: number) => string {
    return (clienteId: number) =>
      this.clientes.find((cliente) => cliente.id === clienteId)?.razaoSocial ?? '—';
  }

  get opcoesObrigacao(): string[] {
    return [...new Set((this.prazos ?? []).map((prazo) => prazo.obrigacao))].sort();
  }

  get contagens(): PrazoContagens {
    const lista = this.prazos ?? [];
    const abertos = lista.filter((prazo) => prazo.status !== StatusPrazo.ENTREGUE);

    return {
      ATRASADOS: lista.filter((prazo) => estaAtrasado(prazo, this.hoje)).length,
      HOJE: abertos.filter((prazo) => diasRestantes(prazo, this.hoje) === 0).length,
      SEMANA: abertos.filter((prazo) => {
        const dias = diasRestantes(prazo, this.hoje);
        return dias !== null && dias >= 0 && dias <= 7;
      }).length,
      PENDENTES: lista.filter((prazo) => prazo.status === StatusPrazo.PENDENTE).length,
    };
  }

  get listaExibida(): Prazo[] {
    const termo = this.filters.busca.trim().toLowerCase();

    const filtrados = (this.prazos ?? []).filter((prazo) => {
      if (termo) {
        const alvo =
          `${prazo.obrigacao} ${prazo.categoria} ${prazo.competencia} ${this.nomeClienteFn(prazo.clienteId)}`.toLowerCase();
        if (!alvo.includes(termo)) return false;
      }
      if (this.filters.clienteId && prazo.clienteId !== this.filters.clienteId) return false;
      if (this.filters.obrigacao && prazo.obrigacao !== this.filters.obrigacao) return false;
      if (this.filters.categoria && prazo.categoria !== this.filters.categoria) return false;
      if (this.filters.competencia && prazo.competencia !== this.filters.competencia) return false;
      if (this.filters.status && prazo.status !== this.filters.status) return false;
      if (this.filters.prioridade && prioridadeEfetiva(prazo, this.hoje) !== this.filters.prioridade) return false;

      if (this.cardAtivo === 'ATRASADOS' && !estaAtrasado(prazo, this.hoje)) return false;
      if (this.cardAtivo === 'PENDENTES' && prazo.status !== StatusPrazo.PENDENTE) return false;
      if (
        this.cardAtivo === 'HOJE' &&
        !(diasRestantes(prazo, this.hoje) === 0 && prazo.status !== StatusPrazo.ENTREGUE)
      )
        return false;
      if (this.cardAtivo === 'SEMANA') {
        const dias = diasRestantes(prazo, this.hoje);
        if (!(dias !== null && dias >= 0 && dias <= 7 && prazo.status !== StatusPrazo.ENTREGUE)) return false;
      }

      return true;
    });

    const comparador = (a: Prazo, b: Prazo): number => {
      const ea = a.status === StatusPrazo.ENTREGUE;
      const eb = b.status === StatusPrazo.ENTREGUE;
      if (ea !== eb) return ea ? 1 : -1;
      const da = diasRestantes(a, this.hoje) ?? 9999;
      const db = diasRestantes(b, this.hoje) ?? 9999;
      if (da !== db) return da - db;
      return a.id - b.id;
    };

    return [...filtrados].sort(comparador);
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.listaExibida.length / PAGE_SIZE));
  }

  get paginaAtual(): number {
    return Math.min(this.page, this.totalPaginas);
  }

  get paginada(): Prazo[] {
    return this.listaExibida.slice((this.paginaAtual - 1) * PAGE_SIZE, this.paginaAtual * PAGE_SIZE);
  }

  get prazoDetalhe(): Prazo | null {
    return (this.prazos ?? []).find((prazo) => prazo.id === this.detailId) ?? null;
  }

  get clienteDetalhe(): Cliente | null {
    const prazo = this.prazoDetalhe;
    return prazo ? this.clientes.find((cliente) => cliente.id === prazo.clienteId) ?? null : null;
  }

  get prefillAnexo(): { tipo: string; competencia: string } | null {
    const prazo = this.prazoDetalhe;
    return prazo ? { tipo: prazo.obrigacao, competencia: prazo.competencia } : null;
  }

  get mensagemEntrega(): string {
    const alvo = this.entregarSolicitado;
    return alvo
      ? `Confirmar a entrega de ${alvo.obrigacao} (${alvo.competencia}) de ${this.nomeClienteFn(
          alvo.clienteId
        )}?`
      : '';
  }
}
