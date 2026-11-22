import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideInfo } from '@lucide/angular';
import { Subscription } from 'rxjs';

import { ProgressBarComponent } from '../../../core/components/ui/progress-bar/progress-bar.component';
import { StatusBadgeComponent } from '../../../core/components/ui/status-badge/status-badge.component';
import type { Cliente, Solicitacao, SolicitacaoItem, SolicitacaoTentativa } from '../../../core/domain/models';
import {
  calcularStatusSolicitacao,
  progressoSolicitacao,
  solicitacaoStatusMeta,
  StatusSolicitacao,
} from '../../../core/domain/solicitacao';
import { ClientService } from '../../../core/services/client.service';
import { DocumentService } from '../../../core/services/document.service';
import { SolicitacaoService } from '../../../core/services/solicitacao.service';
import { ToastService } from '../../../core/services/toast.service';
import { DocumentViewerComponent, type ViewerDocument } from '../../client-detail/ui/document-viewer/document-viewer.component';
import { ApproveItemModalComponent } from '../ui/approve-item-modal/approve-item-modal.component';
import { ManualReceiptModalComponent, type RecebimentoManualPayload } from '../ui/manual-receipt-modal/manual-receipt-modal.component';
import { RejectItemModalComponent, type RecusarItemPayload } from '../ui/reject-item-modal/reject-item-modal.component';
import { SolicitacaoItemCardComponent } from '../ui/solicitacao-item-card/solicitacao-item-card.component';

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

  private id = '';
  private paramSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solicitacaoService: SolicitacaoService,
    private clientService: ClientService,
    private documentService: DocumentService,
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

  async handleApproveConfirm(): Promise<void> {
    const item = this.approveItem;
    if (!item || !this.sol) return;

    const updated = await this.solicitacaoService.aprovarItem(this.sol.id, item.id);
    if (!updated) return;
    this.sol = updated;
    this.approveItem = null;
    this.toastService.show(`Item "${item.nome}" aprovado.`);

    if (calcularStatusSolicitacao(updated) === StatusSolicitacao.CONCLUIDA) {
      this.toastService.show('Solicitação concluída: todos os itens foram aprovados.');
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
    this.toastService.show(`Item "${item.nome}" recusado. Motivo registrado na solicitação.`);
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

  async baixarArquivo(event: { tentativa: SolicitacaoTentativa }): Promise<void> {
    const documentId = event.tentativa.documentId;
    if (!documentId) {
      this.toastService.show('O arquivo enviado não está disponível para download.', 'error');
      return;
    }

    await this.documentService.baixarArquivo(documentId);
    this.toastService.show('Download concluído.');
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
