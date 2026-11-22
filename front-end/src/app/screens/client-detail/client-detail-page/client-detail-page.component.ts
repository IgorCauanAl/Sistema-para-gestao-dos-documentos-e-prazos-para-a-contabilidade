import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucidePlus } from '@lucide/angular';
import { Subscription } from 'rxjs';

import { EmptyStateComponent } from '../../../core/components/ui/empty-state/empty-state.component';
import { DirecaoDocumento } from '../../../core/domain/documento';
import type { Cliente, Documento, DocumentoNovo, Solicitacao, SolicitacaoNova } from '../../../core/domain/models';
import { calcularStatusSolicitacao } from '../../../core/domain/solicitacao';
import { ClientService } from '../../../core/services/client.service';
import { DocumentService } from '../../../core/services/document.service';
import { PrazoRefreshService } from '../../../core/services/prazo-refresh.service';
import { SolicitacaoService } from '../../../core/services/solicitacao.service';
import { ToastService } from '../../../core/services/toast.service';
import { ClientFormModalComponent, emptyClienteForm, type ClienteForm } from '../../clients/ui/client-form-modal/client-form-modal.component';
import { AttachDocumentModalComponent } from '../ui/attach-document-modal/attach-document-modal.component';
import { ClientProfileHeaderComponent } from '../ui/client-profile-header/client-profile-header.component';
import { DetailTabsComponent } from '../ui/detail-tabs/detail-tabs.component';
import {
  DocumentFiltersComponent,
  emptyDocumentFilters,
  type DocumentFiltersModel,
} from '../ui/document-filters/document-filters.component';
import { DocumentTableComponent } from '../ui/document-table/document-table.component';
import { DocumentViewerComponent, type ViewerDocument } from '../ui/document-viewer/document-viewer.component';
import { NovaSolicitacaoModalComponent } from '../../solicitacoes/ui/nova-solicitacao-modal/nova-solicitacao-modal.component';
import {
  emptySolicitacaoFilters,
  SolicitacaoFiltersComponent,
  type SolicitacaoFiltersModel,
} from '../../solicitacoes/ui/solicitacao-filters/solicitacao-filters.component';
import { SolicitacaoTableComponent } from '../../solicitacoes/ui/solicitacao-table/solicitacao-table.component';

@Component({
  selector: 'app-client-detail-page',
  standalone: true,
  imports: [
    ClientProfileHeaderComponent,
    DetailTabsComponent,
    DocumentFiltersComponent,
    DocumentTableComponent,
    EmptyStateComponent,
    AttachDocumentModalComponent,
    DocumentViewerComponent,
    ClientFormModalComponent,
    SolicitacaoFiltersComponent,
    SolicitacaoTableComponent,
    NovaSolicitacaoModalComponent,
    LucidePlus,
  ],
  templateUrl: './client-detail-page.component.html',
  styleUrl: './client-detail-page.component.css',
})
export class ClientDetailPageComponent implements OnInit, OnDestroy {
  client: Cliente | null = null;
  loading = true;
  tab = 'Documentos';
  docs: Documento[] = [];
  filters: DocumentFiltersModel = emptyDocumentFilters();

  attachOpen = false;
  attachPrefill: { tipo?: string; competencia?: string } | null = null;

  viewerOpen = false;
  viewedDoc: ViewerDocument | null = null;
  versions: Documento[] = [];

  editOpen = false;
  formData: ClienteForm = emptyClienteForm();

  solicitacoes: Solicitacao[] = [];
  solFilters: SolicitacaoFiltersModel = emptySolicitacaoFilters();
  novaSolOpen = false;

  private clienteId = '';
  private paramSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private documentService: DocumentService,
    private solicitacaoService: SolicitacaoService,
    private prazoRefreshService: PrazoRefreshService,
    public toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.paramSub = this.route.paramMap.subscribe((params) => {
      this.clienteId = params.get('clienteId') ?? '';
      this.refreshAll();
    });
  }

  ngOnDestroy(): void {
    this.paramSub?.unsubscribe();
  }

  private async refreshAll(): Promise<void> {
    await Promise.all([this.refreshClient(), this.refreshDocs(), this.refreshSolicitacoes()]);
    this.loading = false;

    if (!this.client) {
      this.router.navigate(['/clientes'], { replaceUrl: true });
    }
  }

  private async refreshClient(): Promise<void> {
    const found = await this.clientService.getById(this.clienteId);
    this.client = found;

    if (found) {
      this.formData = {
        cnpj: found.cnpj,
        razaoSocial: found.razaoSocial,
        responsavel: found.responsavel,
        email: found.email,
        endereco: found.endereco,
      };
    }
  }

  private async refreshDocs(): Promise<void> {
    this.docs = await this.documentService.listByClient(this.clienteId);
  }

  private async refreshSolicitacoes(): Promise<void> {
    this.solicitacoes = await this.solicitacaoService.list();
  }

  async refreshViewed(docId: number | string): Promise<void> {
    const doc = await this.documentService.getById(docId);
    if (!doc) return;

    this.viewedDoc = doc;
    this.versions = await this.documentService.listVersions(doc);
  }

  get filteredDocs(): Documento[] {
    return this.docs.filter((doc) => {
      if (this.filters.competencia && doc.competencia !== this.filters.competencia) return false;
      if (this.filters.tipo && doc.area !== this.filters.tipo) return false;
      if (this.filters.status && doc.status !== this.filters.status) return false;
      return true;
    });
  }

  get hasAnyDoc(): boolean {
    return this.docs.length > 0;
  }

  get clientSols(): Solicitacao[] {
    return this.solicitacoes.filter((sol) => String(sol.clienteId) === String(this.client?.id));
  }

  get filteredSols(): Solicitacao[] {
    return this.clientSols.filter((sol) => {
      if (this.solFilters.status && calcularStatusSolicitacao(sol) !== this.solFilters.status) return false;
      if (this.solFilters.competencia && sol.competencia !== this.solFilters.competencia) return false;
      return true;
    });
  }

  get nomeClienteFn(): (clienteId: number) => string {
    return () => this.client?.razaoSocial ?? '—';
  }

  async handleNovaSolicitacao(payload: SolicitacaoNova): Promise<void> {
    const created = await this.solicitacaoService.create(payload);
    this.novaSolOpen = false;
    await this.refreshSolicitacoes();

    if (payload.enviarAgora) {
      this.router.navigate([`/solicitacoes/${created.id}`]);
      this.toastService.show('Solicitação criada. Compartilhe o link de envio com o cliente.');
    } else {
      this.toastService.show('Solicitação salva como rascunho.');
    }
  }

  async openViewer(doc: Documento): Promise<void> {
    if (doc.direcao !== DirecaoDocumento.ENTRADA) {
      await this.documentService.markVisualizado(doc.id);
      await this.refreshDocs();
    }
    await this.refreshViewed(doc.id);
    this.viewerOpen = true;
  }

  closeViewer(): void {
    this.viewerOpen = false;
    this.viewedDoc = null;
    this.versions = [];
  }

  async handleSend(doc: Documento | ViewerDocument | null): Promise<void> {
    if (!doc) return;

    const updated = await this.documentService.markEnviado(doc.id);
    await this.refreshDocs();
    if (this.viewerOpen && this.viewedDoc) await this.refreshViewed(this.viewedDoc.id);
    this.toastService.show(`Documento enviado por ${updated?.canal ?? 'WhatsApp'} ao cliente.`);
  }

  async handleAttach(payload: DocumentoNovo): Promise<Documento> {
    const created = await this.documentService.create(payload);
    this.closeAttach();
    await this.refreshDocs();
    this.prazoRefreshService.notify();
    this.toastService.show(
      payload.enviarAgora
        ? `Documento enviado por ${payload.canal} ao cliente.`
        : 'Documento salvo como rascunho.'
    );
    return created;
  }

  openAttach(prefill: { tipo?: string; competencia?: string } | null = null): void {
    this.attachPrefill = prefill;
    this.attachOpen = true;
  }

  closeAttach(): void {
    this.attachOpen = false;
    this.attachPrefill = null;
  }

  async handleEditSubmit(): Promise<void> {
    await this.clientService.update(this.clienteId, this.formData);
    await this.refreshClient();
    this.editOpen = false;
    this.toastService.show('Cliente atualizado com sucesso.');
  }

  handleNewVersion(): void {
    if (!this.viewedDoc) return;

    const prefill = { tipo: this.viewedDoc.nome, competencia: this.viewedDoc.competencia };
    this.closeViewer();
    this.openAttach(prefill);
  }

  async handleDownload(): Promise<void> {
    if (!this.viewedDoc) return;

    await this.documentService.markBaixado(this.viewedDoc.id);
    await this.refreshDocs();
    await this.refreshViewed(this.viewedDoc.id);
    this.toastService.show('Download concluído.');
  }

  abrirSolicitacao(sol: Solicitacao): void {
    this.router.navigate([`/solicitacoes/${sol.id}`]);
  }
}
