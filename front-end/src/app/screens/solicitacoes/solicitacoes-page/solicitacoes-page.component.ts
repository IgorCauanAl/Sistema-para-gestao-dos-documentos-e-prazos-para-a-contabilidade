import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LucidePlus } from '@lucide/angular';

import { EmptyStateComponent } from '../../../core/components/ui/empty-state/empty-state.component';
import { SummaryCardComponent } from '../../../core/components/ui/summary-card/summary-card.component';
import type { Cliente, Solicitacao, SolicitacaoNova } from '../../../core/domain/models';
import { calcularStatusSolicitacao, StatusSolicitacao } from '../../../core/domain/solicitacao';
import { ClientService } from '../../../core/services/client.service';
import { SolicitacaoService } from '../../../core/services/solicitacao.service';
import { ToastService } from '../../../core/services/toast.service';
import { LinkGeneratedModalComponent } from '../ui/link-generated-modal/link-generated-modal.component';
import { NovaSolicitacaoModalComponent } from '../ui/nova-solicitacao-modal/nova-solicitacao-modal.component';
import {
  emptySolicitacaoFilters,
  SolicitacaoFiltersComponent,
  type SolicitacaoFiltersModel,
} from '../ui/solicitacao-filters/solicitacao-filters.component';
import { SolicitacaoTableComponent } from '../ui/solicitacao-table/solicitacao-table.component';

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
    LucidePlus,
  ],
  templateUrl: './solicitacoes-page.component.html',
  styleUrl: './solicitacoes-page.component.css',
})
export class SolicitacoesPageComponent implements OnInit {
  solicitacoes: Solicitacao[] = [];
  clientes: Cliente[] = [];
  filters: SolicitacaoFiltersModel = emptySolicitacaoFilters();

  novaOpen = false;
  linkModal: Solicitacao | null = null;

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

  abrir(sol: Solicitacao): void {
    this.router.navigate([`/solicitacoes/${sol.id}`]);
  }

  handleToast(event: { message: string; type: 'success' | 'info' }): void {
    this.toastService.show(event.message, event.type);
  }
}
