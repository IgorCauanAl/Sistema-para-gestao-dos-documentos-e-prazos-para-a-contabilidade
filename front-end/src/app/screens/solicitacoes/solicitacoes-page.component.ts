import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LucidePlus } from '@lucide/angular';

import { EmptyStateComponent } from '../../core/components/ui/empty-state.component';
import { SummaryCardComponent } from '../../core/components/ui/summary-card.component';
import type { Cliente, Solicitacao, SolicitacaoNova } from '../../core/domain/models';
import { calcularStatusSolicitacao, StatusSolicitacao } from '../../core/domain/solicitacao';
import { ClientService } from '../../core/services/client.service';
import { SolicitacaoService } from '../../core/services/solicitacao.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogComponent } from './ui/confirm-dialog.component';
import { LinkGeneratedModalComponent } from './ui/link-generated-modal.component';
import { NovaSolicitacaoModalComponent } from './ui/nova-solicitacao-modal.component';
import {
  emptySolicitacaoFilters,
  SolicitacaoFiltersComponent,
  type SolicitacaoFiltersModel,
} from './ui/solicitacao-filters.component';
import { SolicitacaoTableComponent } from './ui/solicitacao-table.component';

@Component({
  selector: 'app-solicitacoes-page',
  standalone: true,
  imports: [
    SummaryCardComponent,
    EmptyStateComponent,
    SolicitacaoFiltersComponent,
    SolicitacaoTableComponent,
    NovaSolicitacaoModalComponent,
    LinkGeneratedModalComponent,
    ConfirmDialogComponent,
    LucidePlus,
  ],
  template: `
    <div class="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Solicitações</h1>
          <p class="text-sm text-slate-500 mt-1">
            Pedidos de documentos enviados aos clientes e seus links de envio.
          </p>
        </div>
        <button
          type="button"
          (click)="novaOpen = true"
          class="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors"
        >
          <svg lucidePlus [size]="16"></svg> Nova solicitação
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-summary-card title="Total de solicitações" [value]="total.toString()" icon="clipboardList"></app-summary-card>
        <app-summary-card title="Abertas" [value]="contagem(StatusSolicitacao.ABERTA).toString()" icon="inbox"></app-summary-card>
        <app-summary-card
          title="Em conferência"
          [value]="contagem(StatusSolicitacao.EM_CONFERENCIA).toString()"
          icon="send"
          colorTheme="warning"
        ></app-summary-card>
        <app-summary-card
          title="Concluídas"
          [value]="contagem(StatusSolicitacao.CONCLUIDA).toString()"
          icon="checkCircle2"
          colorTheme="success"
        ></app-summary-card>
      </div>

      @if (total > 0) {
        <app-solicitacao-filters
          [filters]="filters"
          [clientes]="clientes"
          (filtersChange)="filters = $event"
        ></app-solicitacao-filters>
      }

      @if (total === 0) {
        <app-empty-state
          title="Nenhuma solicitação criada"
          subtitle="Clique em “+ Nova solicitação” para pedir os primeiros documentos a um cliente."
        ></app-empty-state>
      } @else if (filtradas.length === 0) {
        <app-empty-state
          title="Nenhuma solicitação encontrada"
          subtitle="Ajuste os filtros para encontrar a solicitação desejada."
        ></app-empty-state>
      } @else {
        <app-solicitacao-table
          [solicitacoes]="filtradas"
          [nomeCliente]="nomeClienteFn"
          (onOpen)="abrir($event)"
          (onResend)="linkModal = $event"
          (onCancel)="cancelTarget = $event"
        ></app-solicitacao-table>
      }

      <app-nova-solicitacao-modal
        [open]="novaOpen"
        [clientes]="clientes"
        [clienteInicial]="null"
        (onClose)="novaOpen = false"
        (onSubmit)="handleCreate($event)"
      ></app-nova-solicitacao-modal>

      <app-link-generated-modal
        [open]="!!linkModal"
        [solicitacao]="linkModal"
        [cliente]="clienteDoLink"
        (onClose)="linkModal = null"
        (onToast)="handleToast($event)"
      ></app-link-generated-modal>

      <app-confirm-dialog
        [open]="!!cancelTarget"
        (onClose)="cancelTarget = null"
        (onConfirm)="handleCancel()"
        title="Cancelar solicitação"
        [message]="mensagemCancelamento"
        confirmLabel="Cancelar solicitação"
      ></app-confirm-dialog>
    </div>
  `,
})
export class SolicitacoesPageComponent implements OnInit {
  solicitacoes: Solicitacao[] = [];
  clientes: Cliente[] = [];
  filters: SolicitacaoFiltersModel = emptySolicitacaoFilters();

  novaOpen = false;
  linkModal: Solicitacao | null = null;
  cancelTarget: Solicitacao | null = null;

  readonly StatusSolicitacao = StatusSolicitacao;

  constructor(
    private router: Router,
    private solicitacaoService: SolicitacaoService,
    private clientService: ClientService,
    private toastService: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  private async refresh(): Promise<void> {
    this.solicitacoes = await this.solicitacaoService.list();
    this.clientes = await this.clientService.list();
  }

  get nomeClienteFn(): (clienteId: number) => string {
    return (clienteId: number) => this.clientes.find((c) => c.id === clienteId)?.razaoSocial ?? '—';
  }

  contagem(status: string): number {
    return this.solicitacoes.filter((sol) => calcularStatusSolicitacao(sol) === status).length;
  }

  get total(): number {
    return this.solicitacoes.length;
  }

  get filtradas(): Solicitacao[] {
    return this.solicitacoes.filter((sol) => {
      if (this.filters.clienteId && String(sol.clienteId) !== this.filters.clienteId) return false;
      if (this.filters.status && calcularStatusSolicitacao(sol) !== this.filters.status) return false;
      if (this.filters.competencia && sol.competencia !== this.filters.competencia) return false;
      return true;
    });
  }

  get clienteDoLink(): Cliente | null {
    return this.linkModal ? this.clientes.find((c) => c.id === this.linkModal?.clienteId) ?? null : null;
  }

  get mensagemCancelamento(): string {
    return `A solicitação "${this.cancelTarget?.titulo ?? ''}" será cancelada e o link deixará de funcionar para o cliente. Esta ação não pode ser desfeita.`;
  }

  async handleCreate(payload: SolicitacaoNova): Promise<void> {
    const created = await this.solicitacaoService.create(payload);
    this.novaOpen = false;
    await this.refresh();

    if (payload.enviarAgora) {
      this.linkModal = created;
    } else {
      this.toastService.show('Solicitação salva como rascunho.');
    }
  }

  async handleCancel(): Promise<void> {
    if (!this.cancelTarget) return;
    await this.solicitacaoService.cancelar(this.cancelTarget.id);
    this.cancelTarget = null;
    await this.refresh();
    this.toastService.show('Solicitação cancelada.');
  }

  abrir(sol: Solicitacao): void {
    this.router.navigate([`/solicitacoes/${sol.id}`]);
  }

  handleToast(event: { message: string; type: 'success' | 'info' }): void {
    this.toastService.show(event.message, event.type);
  }
}
