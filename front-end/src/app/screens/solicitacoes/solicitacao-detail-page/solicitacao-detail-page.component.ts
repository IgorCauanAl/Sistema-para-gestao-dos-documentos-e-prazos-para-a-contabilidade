import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideInfo } from '@lucide/angular';
import { Subscription } from 'rxjs';

import { ProgressBarComponent } from '../../../core/components/ui/progress-bar/progress-bar.component';
import { StatusBadgeComponent } from '../../../core/components/ui/status-badge/status-badge.component';
import type { Cliente, EventoAuditoria, Solicitacao, SolicitacaoItem, SolicitacaoTentativa } from '../../../core/domain/models';
import {
  calcularStatusSolicitacao,
  progressoSolicitacao,
  solicitacaoStatusMeta,
  StatusSolicitacao,
} from '../../../core/domain/solicitacao';
import { ClientService } from '../../../core/services/client.service';
import { DataRefreshService } from '../../../core/services/data-refresh.service';
import { DocumentService } from '../../../core/services/document.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SolicitacaoService } from '../../../core/services/solicitacao.service';
import { DocumentViewerComponent, type ViewerDocument } from '../../client-detail/ui/document-viewer/document-viewer.component';
import { ApproveItemModalComponent } from '../ui/approve-item-modal/approve-item-modal.component';
import { ManualReceiptModalComponent, type RecebimentoManualPayload } from '../ui/manual-receipt-modal/manual-receipt-modal.component';
import { RejectItemModalComponent, type RecusarItemPayload } from '../ui/reject-item-modal/reject-item-modal.component';
import { SolicitacaoItemCardComponent } from '../ui/solicitacao-item-card/solicitacao-item-card.component';

@Component({
  selector: 'app-solicitacao-detail-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    ProgressBarComponent,
    StatusBadgeComponent,
    SolicitacaoItemCardComponent,
    ApproveItemModalComponent,
    RejectItemModalComponent,
    ManualReceiptModalComponent,
    DocumentViewerComponent,
    LucideArrowLeft,
    LucideInfo,
  ],
  templateUrl: './solicitacao-detail-page.component.html',
  styleUrl: './solicitacao-detail-page.component.css',
})
export class SolicitacaoDetailPageComponent implements OnInit, OnDestroy {
  sol: Solicitacao | null = null;
  cliente: Cliente | null = null;
  loading = true;

  rejectItem: SolicitacaoItem | null = null;
  approveItem: SolicitacaoItem | null = null;
  manualItem: SolicitacaoItem | null = null;

  viewerDoc: ViewerDocument | null = null;
  viewerVersions: ViewerDocument[] = [];

  eventosAuditoria: EventoAuditoria[] = [];
  novaValidade = '';
  itemReaberturaId: number | null = null;
  statusReabertura: 'PENDENTE' | 'RECUSADO' = 'PENDENTE';
  motivoReabertura = '';

  private id = '';
  private paramSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solicitacaoService: SolicitacaoService,
    private clientService: ClientService,
    private documentService: DocumentService,
    private notification: NotificationService,
    private refreshService: DataRefreshService
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
    try {
      this.eventosAuditoria = encontrada
        ? await this.solicitacaoService.historico(encontrada.id)
        : [];
    } catch {
      this.eventosAuditoria = [];
    }
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

  get podeRenovarLink(): boolean {
    return this.status !== StatusSolicitacao.CANCELADA && this.status !== StatusSolicitacao.CONCLUIDA;
  }

  get itensAceitos(): SolicitacaoItem[] {
    return (this.sol?.itens ?? []).filter((item) => item.status === 'APROVADO');
  }

  get podeReabrir(): boolean {
    return this.status === StatusSolicitacao.CONCLUIDA && this.itensAceitos.length > 0;
  }

  async handleRenovarLink(): Promise<void> {
    if (!this.sol || !this.novaValidade) return;
    try {
      await this.solicitacaoService.renovarLink(this.sol.id, this.novaValidade);
      this.novaValidade = '';
      await this.refresh();
      this.refreshService.notify('requests');
      this.notification.success('Validade do link público renovada. O token não foi alterado.');
    } catch (error) {
      this.notification.error(error);
    }
  }

  async handleReabrir(): Promise<void> {
    const sol = this.sol;
    if (!sol || !this.itemReaberturaId) return;
    if (this.statusReabertura === 'RECUSADO' && !this.motivoReabertura.trim()) {
      this.notification.error(new Error('Informe o motivo da recusa.'));
      return;
    }

    try {
      await this.solicitacaoService.reabrir(sol.id, {
        itemId: this.itemReaberturaId,
        itemStatus: this.statusReabertura,
        reason: this.statusReabertura === 'RECUSADO' ? this.motivoReabertura.trim() : undefined,
      });
      this.itemReaberturaId = null;
      this.statusReabertura = 'PENDENTE';
      this.motivoReabertura = '';
      await this.refresh();
      this.refreshService.notify('requests', 'deadlines', 'dashboard');
      this.notification.success('Solicitação reaberta. O prazo original não foi alterado.');
    } catch (error) {
      this.notification.error(error);
    }
  }

  async handleApproveConfirm(): Promise<void> {
    const item = this.approveItem;
    if (!item || !this.sol) return;

    const updated = await this.solicitacaoService.aprovarItem(this.sol.id, item.id);
    if (!updated) return;
    await this.refresh();
    this.approveItem = null;
    this.refreshService.notify('requests');
    this.notification.success(`Item "${item.nome}" aprovado.`);

    if (calcularStatusSolicitacao(updated) === StatusSolicitacao.CONCLUIDA) {
      this.notification.success('Solicitação concluída: todos os itens foram aprovados.');
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
    await this.refresh();
    this.rejectItem = null;
    this.refreshService.notify('requests', 'dashboard');
    this.notification.success(`Item "${item.nome}" recusado. Motivo registrado na solicitação.`);
  }

  async handleManualConfirm(payload: RecebimentoManualPayload): Promise<void> {
    const item = this.manualItem;
    if (!item || !this.sol) return;

    const updated = await this.solicitacaoService.registrarRecebimentoManual(this.sol.id, item.id, payload);
    if (!updated) return;
    await this.refresh();
    this.manualItem = null;
    this.refreshService.notify('requests', 'documents', 'deadlines', 'dashboard');
    this.notification.success('Recebimento manual registrado.');
  }

  async baixarArquivo(event: { tentativa: SolicitacaoTentativa }): Promise<void> {
    const documentId = event.tentativa.documentId;
    if (!documentId) {
      this.notification.error(new Error('O arquivo enviado não está disponível para download.'));
      return;
    }

    await this.documentService.baixarArquivo(documentId);
    this.refreshService.notify('documents', 'dashboard');
    this.notification.success('Download concluído.');
  }

  abrirArquivo(event: { item: SolicitacaoItem; tentativa: SolicitacaoTentativa }): void {
    const sol = this.sol;
    if (!sol) return;

    const nome = event.tentativa.arquivo?.nome ?? '';
    const formato = nome.includes('.') ? nome.split('.').pop()!.toLowerCase() : '';

    const doc: ViewerDocument = {
      id: event.tentativa.documentId ?? `sol-${sol.id}-${event.item.id}`,
      nome,
      formato,
      versao: 1,
      competencia: sol.competencia,
      tamanho: event.tentativa.arquivo?.tamanho ?? '',
      status: 'ENVIADO',
      hash: '',
      historico: [
        { etapa: 'CRIADO', data: sol.criadoEm.data, hora: sol.criadoEm.hora },
        {
          etapa: 'ENVIADO',
          data: event.tentativa.data,
          hora: event.tentativa.hora,
          canal: event.tentativa.canalOrigem ?? sol.canal,
        },
      ],
    };

    this.viewerDoc = doc;
    this.viewerVersions = [doc];
  }

  selecionarVersao(_versao: ViewerDocument): void {
    // Cada arquivo enviado pelo portal é exibido individualmente.
  }
}
