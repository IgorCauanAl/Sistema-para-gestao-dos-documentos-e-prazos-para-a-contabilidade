import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { EmptyStateComponent } from '../../../core/components/ui/empty-state/empty-state.component';
import type { Cliente, DocumentoNovo, EventoAuditoria, Prazo } from '../../../core/domain/models';
import {
  diasRestantes,
  estaAtrasado,
  prazoEncerrado,
  prioridadeEfetiva,
  StatusPrazo,
  type EstagioBackend,
} from '../../../core/domain/prazo';
import { ClientService } from '../../../core/services/client.service';
import { DocumentService } from '../../../core/services/document.service';
import { DataRefreshService } from '../../../core/services/data-refresh.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PrazoService } from '../../../core/services/prazo.service';
import { AttachDocumentModalComponent } from '../../client-detail/ui/attach-document-modal/attach-document-modal.component';
import { ConfirmDialogComponent } from '../../../core/components/ui/confirm-dialog/confirm-dialog.component';
import { PrazoDetailPanelComponent } from '../ui/prazo-detail-panel/prazo-detail-panel.component';
import { PrazoFiltersComponent, emptyPrazoFilters, type PrazoFiltersModel } from '../ui/prazo-filters/prazo-filters.component';
import { PrazoSummaryCardsComponent, type PrazoContagens } from '../ui/prazo-summary-cards/prazo-summary-cards.component';
import { PrazoTableComponent } from '../ui/prazo-table/prazo-table.component';

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
    AttachDocumentModalComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './deadlines-page.component.html',
  styleUrl: './deadlines-page.component.css',
})
export class DeadlinesPageComponent implements OnInit, OnDestroy {
  prazos: Prazo[] | null = null;
  clientes: Cliente[] = [];
  filters: PrazoFiltersModel = emptyPrazoFilters();
  cardAtivo: string | null = null;
  page = 1;

  anexarOpen = false;
  entregarSolicitado: Prazo | null = null;
  entregando = false;

  detailId: number | null = null;
  eventosDetalhe: EventoAuditoria[] = [];
  readonly hoje = new Date();
  readonly PAGE_SIZE = PAGE_SIZE;
  readonly Math = Math;

  private querySub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private prazoService: PrazoService,
    private documentService: DocumentService,
    private notification: NotificationService,
    private refreshService: DataRefreshService
  ) {}

  ngOnInit(): void {
    this.querySub = this.route.queryParamMap.subscribe((params) => {
      const id = Number(params.get('prazo') ?? params.get('deadline'));
      this.detailId = id || null;
      this.page = 1;
      if (this.detailId) void this.carregarHistorico(this.detailId);
      else this.eventosDetalhe = [];
    });

    this.refresh();
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
  }

  async refresh(): Promise<void> {
    try {
      const [listaClientes, listaPrazos] = await Promise.all([
        this.clientService.list(),
        this.prazoService.list(),
      ]);
      this.clientes = listaClientes;
      this.prazos = listaPrazos;
      this.eventosDetalhe = this.detailId
        ? await this.prazoService.historico(this.detailId)
        : [];
    } catch (error) {
      this.notification.error(error);
    }
  }

  private async carregarHistorico(prazoId: number): Promise<void> {
    try {
      this.eventosDetalhe = await this.prazoService.historico(prazoId);
    } catch {
      this.eventosDetalhe = [];
    }
  }

  emptyFilters(): PrazoFiltersModel {
    return emptyPrazoFilters();
  }

  cancelarEntrega(): void {
    if (this.entregarSolicitado) {
      this.notification.info('Marcação de entrega cancelada.');
    }
    this.entregarSolicitado = null;
  }

  async handleMarcarEntregue(): Promise<void> {
    const alvo = this.entregarSolicitado;
    if (!alvo || this.entregando) return;

    this.entregando = true;
    try {
      await this.prazoService.marcarEntregue(alvo.id);
      this.entregarSolicitado = null;
      await this.refresh();
      this.refreshService.notify('deadlines', 'dashboard');
      this.notification.success(`Prazo de ${alvo.obrigacao} marcado como entregue.`);
    } catch (error) {
      this.notification.error(error);
    } finally {
      this.entregando = false;
    }
  }

  async handleMoverEtapa(etapa: EstagioBackend): Promise<void> {
    const prazo = this.prazoDetalhe;
    if (!prazo) return;

    try {
      await this.prazoService.moverEtapa(prazo.id, etapa);
      await this.refresh();
      await this.carregarHistorico(prazo.id);
      this.refreshService.notify('deadlines', 'dashboard');
      this.notification.success(`Etapa de ${prazo.obrigacao} atualizada.`);
    } catch (error) {
      this.notification.error(error);
    }
  }

  async handleReabrir(justificativa: string): Promise<void> {
    const prazo = this.prazoDetalhe;
    if (!prazo) return;

    try {
      await this.prazoService.reabrir(prazo.id, justificativa);
      await this.refresh();
      await this.carregarHistorico(prazo.id);
      this.refreshService.notify('deadlines', 'dashboard');
      this.notification.success(`Prazo de ${prazo.obrigacao} reaberto e justificativa registrada.`);
    } catch (error) {
      this.notification.error(error);
    }
  }

  async handleExcluir(prazo: Prazo): Promise<void> {
    const confirmado = await this.notification.confirm({
      title: 'Excluir prazo',
      message:
        `Excluir o prazo de ${prazo.obrigacao} (${prazo.competencia}) de ` +
        `${this.nomeClienteFn(prazo.clienteId)}? O documento de origem será preservado. ` +
        'Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir prazo',
      cancelLabel: 'Cancelar',
      danger: true,
    });
    if (!confirmado) return;

    try {
      await this.prazoService.remove(prazo.id);
      await this.refresh();
      this.refreshService.notify('deadlines', 'dashboard');
      if (this.prazoDetalhe?.id === prazo.id) this.fecharDetalhe();
      this.notification.success(`Prazo de ${prazo.obrigacao} removido com sucesso.`);
    } catch (error) {
      this.notification.error(error);
    }
  }

  async handleExcluirDetalhe(): Promise<void> {
    const prazo = this.prazoDetalhe;
    if (!prazo) return;
    await this.handleExcluir(prazo);
  }

  async handleAnexarGuia(payload: DocumentoNovo): Promise<void> {
    try {
      await this.documentService.create(payload);
      this.anexarOpen = false;
      await this.refresh();
      this.refreshService.notify('documents', 'deadlines', 'dashboard');
      this.notification.success('Guia anexada ao acervo de documentos com sucesso.');
    } catch (error) {
      this.notification.error(error);
    }
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
    const abertos = lista.filter((prazo) => !prazoEncerrado(prazo));

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
        !(diasRestantes(prazo, this.hoje) === 0 && !prazoEncerrado(prazo))
      )
        return false;
      if (this.cardAtivo === 'SEMANA') {
        const dias = diasRestantes(prazo, this.hoje);
        if (!(dias !== null && dias >= 0 && dias <= 7 && !prazoEncerrado(prazo))) return false;
      }

      return true;
    });

    const comparador = (a: Prazo, b: Prazo): number => {
      const ea = prazoEncerrado(a);
      const eb = prazoEncerrado(b);
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
