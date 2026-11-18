import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  LucideArrowLeft,
  LucideCheck,
  LucideCopy,
  LucideInfo,
  LucideRefreshCw,
  LucideSend,
  LucideXCircle,
} from '@lucide/angular';
import { Subscription } from 'rxjs';

import { ProgressBarComponent } from '../../core/components/ui/progress-bar.component';
import { StatusBadgeComponent } from '../../core/components/ui/status-badge.component';
import type { Cliente, Solicitacao, SolicitacaoItem, SolicitacaoTentativa } from '../../core/domain/models';
import {
  calcularStatusSolicitacao,
  progressoSolicitacao,
  solicitacaoStatusMeta,
  StatusSolicitacao,
} from '../../core/domain/solicitacao';
import { ClientService } from '../../core/services/client.service';
import { PrazoRefreshService } from '../../core/services/prazo-refresh.service';
import { PrazoService } from '../../core/services/prazo.service';
import { SolicitacaoService } from '../../core/services/solicitacao.service';
import { ToastService } from '../../core/services/toast.service';
import { DocumentViewerComponent, type ViewerDocument } from '../client-detail/ui/document-viewer.component';
import { ApproveItemModalComponent, type AprovarItemPayload } from './ui/approve-item-modal.component';
import { ConfirmDialogComponent } from './ui/confirm-dialog.component';
import { LinkGeneratedModalComponent } from './ui/link-generated-modal.component';
import { ManualReceiptModalComponent, type RecebimentoManualPayload } from './ui/manual-receipt-modal.component';
import { RejectItemModalComponent, type RecusarItemPayload } from './ui/reject-item-modal.component';
import { SolicitacaoItemCardComponent } from './ui/solicitacao-item-card.component';

const fakeHash = 'a3f8c9e14b7d2056e8f9a1c3b5d7e2f4a6c8b0d2f4e6a8c1b3d5f7a9c0e2b4d6';

@Component({
  selector: 'app-solicitacao-detail-page',
  standalone: true,
  imports: [
    RouterLink,
    ProgressBarComponent,
    StatusBadgeComponent,
    SolicitacaoItemCardComponent,
    ApproveItemModalComponent,
    RejectItemModalComponent,
    ManualReceiptModalComponent,
    LinkGeneratedModalComponent,
    ConfirmDialogComponent,
    DocumentViewerComponent,
    LucideArrowLeft,
    LucideCheck,
    LucideCopy,
    LucideInfo,
    LucideRefreshCw,
    LucideSend,
    LucideXCircle,
  ],
  template: `
    @if (sol) {
      <div class="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
        <a
          routerLink="/solicitacoes"
          class="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg lucideArrowLeft [size]="16"></svg> Solicitações
        </a>

        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="text-2xl font-bold text-slate-800">{{ sol.titulo }}</h1>
              <app-status-badge [meta]="statusMeta"></app-status-badge>
            </div>
            <p class="text-sm text-slate-500 mt-1">
              {{ cliente?.razaoSocial ?? '—' }} · competência {{ sol.competencia }} · prazo {{ sol.prazo }} ·
              criada em {{ sol.criadoEm.data }} às {{ sol.criadoEm.hora }}
            </p>
          </div>

          @if (!encerrada) {
            <button
              type="button"
              (click)="linkOpen = true"
              class="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors"
            >
              <svg lucideSend [size]="16"></svg> Reenviar link
            </button>
          }
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-5 space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <p class="text-sm font-semibold text-slate-700">Progresso da conferência</p>
                <span class="text-sm font-medium text-slate-500">{{ progresso.label }}</span>
              </div>
              <app-progress-bar
                [pct]="progresso.pct"
                [tone]="progresso.pct === 100 ? 'green' : 'indigo'"
              ></app-progress-bar>
              <p class="flex items-start gap-2 text-xs text-slate-400">
                <svg lucideInfo [size]="14" class="shrink-0 mt-0.5"></svg>
                O status da solicitação é calculado automaticamente a partir dos itens: todos
                aprovados = concluída; algum enviado = em conferência; caso contrário, aberta.
              </p>
            </div>

            @for (item of sol.itens; track item.id) {
              <app-solicitacao-item-card
                [item]="item"
                (onApprove)="approveItem = $event"
                (onReject)="rejectItem = $event"
                (onManualReceipt)="manualItem = $event"
                (onViewFile)="abrirArquivo($event)"
                (onDownload)="toastService.show('Download simulado concluído.')"
              ></app-solicitacao-item-card>
            }
          </div>

          <aside class="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-5 space-y-5 lg:sticky lg:top-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Link da solicitação
              </p>
              <div class="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                <span class="text-xs font-mono text-indigo-600 break-all flex-1">{{ link }}</span>
                <button
                  type="button"
                  (click)="copiarLink()"
                  aria-label="Copiar link da solicitação"
                  class="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
                >
                  @if (copiado) {
                    <svg lucideCheck [size]="14" class="text-green-600"></svg>
                  } @else {
                    <svg lucideCopy [size]="14"></svg>
                  }
                </button>
              </div>
              <p class="text-xs text-slate-400 mt-2">Validade: {{ sol.validadeAte }}</p>
            </div>

            <dl class="space-y-2 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-slate-400">Canal</dt>
                <dd class="font-medium text-slate-700">{{ sol.canal }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-slate-400">Prazo</dt>
                <dd class="font-medium text-slate-700">{{ sol.prazo }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-slate-400">Itens</dt>
                <dd class="font-medium text-slate-700">{{ sol.itens.length }}</dd>
              </div>
            </dl>

            @if (!encerrada) {
              <div class="space-y-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  (click)="handleRenovar()"
                  class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
                >
                  <svg lucideRefreshCw [size]="15"></svg> Renovar validade
                </button>
                <button
                  type="button"
                  (click)="cancelOpen = true"
                  class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  <svg lucideXCircle [size]="15"></svg> Cancelar solicitação
                </button>
              </div>
            }

            @if (sol.instrucoes) {
              <div class="pt-2 border-t border-slate-100">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Instruções ao cliente
                </p>
                <p class="text-sm text-slate-600 leading-relaxed">{{ sol.instrucoes }}</p>
              </div>
            }
          </aside>
        </div>

        <app-reject-item-modal
          [open]="!!rejectItem"
          [solicitacao]="sol"
          [cliente]="cliente"
          [item]="rejectItem"
          (onClose)="rejectItem = null"
          (onConfirm)="handleRejectConfirm($event)"
        ></app-reject-item-modal>

        <app-approve-item-modal
          [open]="!!approveItem"
          [solicitacao]="sol"
          [item]="approveItem"
          (onClose)="approveItem = null"
          (onConfirm)="handleApproveConfirm($event)"
        ></app-approve-item-modal>

        <app-manual-receipt-modal
          [open]="!!manualItem"
          [item]="manualItem"
          (onClose)="manualItem = null"
          (onConfirm)="handleManualConfirm($event)"
        ></app-manual-receipt-modal>

        <app-link-generated-modal
          [open]="linkOpen"
          [solicitacao]="sol"
          [cliente]="cliente"
          (onClose)="linkOpen = false"
          (onToast)="handleToast($event)"
        ></app-link-generated-modal>

        <app-confirm-dialog
          [open]="cancelOpen"
          (onClose)="cancelOpen = false"
          (onConfirm)="handleCancelar()"
          title="Cancelar solicitação"
          [message]="mensagemCancelamento"
          confirmLabel="Cancelar solicitação"
        ></app-confirm-dialog>

        <app-document-viewer
          [open]="!!viewerDoc"
          [documento]="viewerDoc"
          [versions]="viewerVersions"
          [showActions]="false"
          (onSelectVersion)="selecionarVersao($event)"
          (onClose)="viewerDoc = null"
        ></app-document-viewer>
      </div>
    }
  `,
})
export class SolicitacaoDetailPageComponent implements OnInit, OnDestroy {
  sol: Solicitacao | null = null;
  cliente: Cliente | null = null;
  loading = true;

  rejectItem: SolicitacaoItem | null = null;
  approveItem: SolicitacaoItem | null = null;
  manualItem: SolicitacaoItem | null = null;
  linkOpen = false;
  cancelOpen = false;
  copiado = false;

  viewerDoc: ViewerDocument | null = null;
  viewerVersions: ViewerDocument[] = [];

  private id = '';
  private paramSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solicitacaoService: SolicitacaoService,
    private clientService: ClientService,
    private prazoService: PrazoService,
    private refreshService: PrazoRefreshService,
    public toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.paramSub = this.route.paramMap.subscribe((params) => {
      this.id = params.get('solicitacaoId') ?? '';
      this.refresh();
    });
  }

  ngOnDestroy(): void {
    this.paramSub?.unsubscribe();
  }

  private async refresh(): Promise<void> {
    const encontrada = await this.solicitacaoService.getById(this.id);
    this.sol = encontrada;
    this.cliente = encontrada ? await this.clientService.getById(encontrada.clienteId) : null;
    this.loading = false;

    if (!encontrada) {
      this.router.navigate(['/solicitacoes']);
    }
  }

  get status(): string {
    return this.sol ? calcularStatusSolicitacao(this.sol) : StatusSolicitacao.ABERTA;
  }

  get statusMeta() {
    return solicitacaoStatusMeta[this.status];
  }

  get progresso() {
    return progressoSolicitacao(
      this.sol ?? { itens: [] as SolicitacaoItem[] } as unknown as Solicitacao
    );
  }

  get encerrada(): boolean {
    return this.status === StatusSolicitacao.CANCELADA || this.status === StatusSolicitacao.EXPIRADA;
  }

  get link(): string {
    return this.sol ? `contadash.app/s/${this.sol.token}` : '';
  }

  get mensagemCancelamento(): string {
    return `A solicitação "${this.sol?.titulo ?? ''}" será cancelada e o link deixará de funcionar para o cliente. Esta ação não pode ser desfeita.`;
  }

  async handleApproveConfirm(payload: AprovarItemPayload): Promise<void> {
    const item = this.approveItem;
    if (!item || !this.sol) return;

    const updated = await this.solicitacaoService.aprovarItem(this.sol.id, item.id, payload);
    if (!updated) return;
    this.sol = updated;
    this.approveItem = null;
    this.toastService.show(
      `Item "${item.nome}" aprovado e registrado (competência ${payload.competencia}).`
    );

    if (calcularStatusSolicitacao(updated) === StatusSolicitacao.CONCLUIDA) {
      this.toastService.show('Solicitação concluída: todos os itens foram aprovados.');
      const retomados = await this.prazoService.concluirPorSolicitacao(this.sol.id);
      if (retomados.length > 0) {
        this.refreshService.notify();
        this.toastService.show(
          retomados.length === 1
            ? `Prazo de ${retomados[0].obrigacao} voltou para EM_ANDAMENTO.`
            : `${retomados.length} prazos voltaram para EM_ANDAMENTO.`
        );
      }
    }
  }

  async handleRejectConfirm(payload: RecusarItemPayload): Promise<void> {
    const item = this.rejectItem;
    if (!item || !this.sol) return;

    const updated = await this.solicitacaoService.recusarItem(this.sol.id, item.id, {
      motivo: payload.motivo,
      detalhes: payload.detalhes,
    });
    if (!updated) return;
    this.sol = updated;
    this.rejectItem = null;
    this.toastService.show(`Item "${item.nome}" recusado. Retorno enviado ao cliente (simulado).`);
  }

  async handleManualConfirm(payload: RecebimentoManualPayload): Promise<void> {
    const item = this.manualItem;
    if (!item || !this.sol) return;

    const updated = await this.solicitacaoService.registrarRecebimentoManual(this.sol.id, item.id, payload);
    if (!updated) return;
    this.sol = updated;
    this.manualItem = null;
    this.toastService.show('Recebimento manual registrado.');
  }

  async handleRenovar(): Promise<void> {
    if (!this.sol) return;
    const updated = await this.solicitacaoService.renovarLink(this.sol.id);
    if (!updated) return;
    this.sol = updated;
    this.toastService.show(`Validade renovada até ${updated.validadeAte}.`);
  }

  async handleCancelar(): Promise<void> {
    if (!this.sol) return;
    const updated = await this.solicitacaoService.cancelar(this.sol.id);
    if (!updated) return;
    this.sol = updated;
    this.cancelOpen = false;
    this.toastService.show('Solicitação cancelada.');
  }

  async copiarLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(`https://${this.link}`);
      this.copiado = true;
      this.toastService.show('Link copiado para a área de transferência.');
      setTimeout(() => (this.copiado = false), 2500);
    } catch {
      this.toastService.show('Não foi possível copiar o link.', 'info');
    }
  }

  abrirArquivo(event: { item: SolicitacaoItem; tentativa: SolicitacaoTentativa }): void {
    const sol = this.sol;
    if (!sol) return;

    const doc: ViewerDocument = {
      id: `sol-${sol.id}-${event.item.id}`,
      nome: event.tentativa.arquivo?.nome ?? '',
      formato: 'pdf',
      versao: 1,
      competencia: sol.competencia,
      tamanho: event.tentativa.arquivo?.tamanho ?? '',
      status: 'ENVIADO',
      hash: fakeHash,
      historico: [
        { etapa: 'CRIADO', data: sol.criadoEm.data, hora: sol.criadoEm.hora, ip: '10.0.0.1' },
        {
          etapa: 'ENVIADO',
          data: event.tentativa.data,
          hora: event.tentativa.hora,
          ip: event.tentativa.ip,
          canal: event.tentativa.canalOrigem ?? sol.canal,
        },
      ],
    };

    this.viewerDoc = doc;
    this.viewerVersions = [doc];
  }

  selecionarVersao(_versao: ViewerDocument): void {
    // O visualizador de solicitações trabalha com uma única versão simulada.
  }

  handleToast(event: { message: string; type: 'success' | 'info' }): void {
    this.toastService.show(event.message, event.type);
  }
}
