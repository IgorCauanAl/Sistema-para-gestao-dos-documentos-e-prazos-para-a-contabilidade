import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucidePlus } from '@lucide/angular';
import { Subscription } from 'rxjs';

import { EmptyStateComponent } from '../../../core/components/ui/empty-state/empty-state.component';
import { DirecaoDocumento } from '../../../core/domain/documento';
import type { Cliente, Documento, DocumentoNovo, Solicitacao, SolicitacaoNova } from '../../../core/domain/models';
import { calcularStatusSolicitacao } from '../../../core/domain/solicitacao';
import { normalizarErro } from '../../../core/errors/api-error';
import { ClientService } from '../../../core/services/client.service';
import {
  type DocumentoCompartilhado,
  DocumentService,
} from '../../../core/services/document.service';
import { DataRefreshService } from '../../../core/services/data-refresh.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SolicitacaoService } from '../../../core/services/solicitacao.service';
import { ClientFormModalComponent, emptyClienteForm, type ClienteForm } from '../../clients/ui/client-form-modal/client-form-modal.component';
import { AttachDocumentModalComponent } from '../ui/attach-document-modal/attach-document-modal.component';
import { ClientProfileHeaderComponent } from '../ui/client-profile-header/client-profile-header.component';
import { DetailTabsComponent } from '../ui/detail-tabs/detail-tabs.component';
import {
  DocumentFiltersComponent,
  emptyDocumentFilters,
  type DocumentFiltersModel,
} from '../ui/document-filters/document-filters.component';
import { DocumentShareModalComponent } from '../../documents/ui/document-share-modal/document-share-modal.component';
import { DocumentTableComponent } from '../ui/document-table/document-table.component';
import { DocumentViewerComponent, type ViewerDocument } from '../ui/document-viewer/document-viewer.component';
import { NovaSolicitacaoModalComponent } from '../../solicitacoes/ui/nova-solicitacao-modal/nova-solicitacao-modal.component';
import {
  emptySolicitacaoFilters,
  SolicitacaoFiltersComponent,
  type SolicitacaoFiltersModel,
} from '../../solicitacoes/ui/solicitacao-filters/solicitacao-filters.component';
import { SolicitacaoTableComponent } from '../../solicitacoes/ui/solicitacao-table/solicitacao-table.component';

const PAGE_SIZE = 10;
const STATUS_BACKEND = new Set(['CRIADO', 'ENVIADO', 'VISUALIZADO', 'BAIXADO']);

/** O filtro visual "Rascunho" corresponde ao status CRIADO no back-end. */
const statusParaApi = (status: string | null | undefined): string | undefined => {
  if (!status) return undefined;
  if (status === 'RASCUNHO') return 'CRIADO';
  return STATUS_BACKEND.has(status) ? status : undefined;
};

@Component({
  selector: 'app-client-detail-page',
  standalone: true,
  imports: [
    ClientProfileHeaderComponent,
    DetailTabsComponent,
    DocumentFiltersComponent,
    DocumentTableComponent,
    DocumentShareModalComponent,
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

  /** Página 1-based na UI; o back-end recebe page-1. */
  page = 1;
  paginaAtual = 1;
  totalPaginas = 1;
  totalElementos = 0;

  readonly PAGE_SIZE = PAGE_SIZE;

  attachOpen = false;
  attachPrefill: { tipo?: string; competencia?: string } | null = null;

  viewerOpen = false;
  viewedDoc: ViewerDocument | null = null;
  versions: Documento[] = [];

  shareOpen = false;
  share: DocumentoCompartilhado | null = null;
  shareDoc: Documento | null = null;

  editOpen = false;
  savingEdit = false;
  formData: ClienteForm = emptyClienteForm();
  fieldErrors: Record<string, string> = {};

  solicitacoes: Solicitacao[] = [];
  solFilters: SolicitacaoFiltersModel = emptySolicitacaoFilters();
  novaSolOpen = false;

  private clienteId = '';
  private paramSub?: Subscription;
  private formOriginal: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private documentService: DocumentService,
    private solicitacaoService: SolicitacaoService,
    private refreshService: DataRefreshService,
    private notification: NotificationService
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

  /** Usado pelo CanDeactivate para proteger a edição em andamento. */
  podeSair(): boolean {
    return !this.editOpen || this.formOriginal === null ||
      JSON.stringify(this.formData) === this.formOriginal;
  }

  onComprovante(): void {
    this.notification.info('Recurso visual: comprovante em breve.');
  }

  private async refreshAll(): Promise<void> {
    await Promise.all([this.refreshClient(), this.refreshDocs(), this.refreshSolicitacoes()]);
    this.loading = false;

    if (!this.client) {
      this.router.navigate(['/clientes'], { replaceUrl: true });
    }
  }

  private async refreshClient(): Promise<void> {
    try {
      const found = await this.clientService.getById(this.clienteId);
      this.client = found;

      if (found) {
        this.formData = {
          cnpj: found.cnpj,
          razaoSocial: found.razaoSocial,
          responsavel: found.responsavel,
          email: found.email,
          endereco: found.endereco,
          whatsapp: found.whatsapp ?? '',
        };
      }
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        this.client = null;
        return;
      }
      this.notification.error(error);
    }
  }

  /** Filtros e paginação executados no banco; a página não varre toda a base. */
  private async refreshDocs(): Promise<void> {
    const pagina = await this.documentService.listPage({
      clienteId: Number(this.clienteId),
      competencia: this.filters.competencia,
      tipo: this.filters.tipo,
      status: statusParaApi(this.filters.status),
      page: this.page - 1,
      size: PAGE_SIZE,
    });

    this.docs = pagina.content;
    this.totalElementos = pagina.totalElements;
    this.totalPaginas = Math.max(1, pagina.totalPages);
    this.paginaAtual = pagina.number + 1;
  }

  async setFilters(filters: DocumentFiltersModel): Promise<void> {
    this.filters = filters;
    this.page = 1;
    await this.refreshDocs();
  }

  async irParaPagina(pagina: number): Promise<void> {
    if (pagina < 1 || pagina > this.totalPaginas || pagina === this.paginaAtual) return;
    this.page = pagina;
    await this.refreshDocs();
  }

  private async refreshSolicitacoes(): Promise<void> {
    this.solicitacoes = await this.solicitacaoService.list();
  }

  async refreshViewed(docId: number | string): Promise<void> {
    const doc = await this.documentService.getById(docId);
    if (!doc) return;

    doc.eventosAuditoria = await this.documentService.historico(docId);
    this.viewedDoc = doc;
    this.versions = await this.documentService.listVersions(doc);
  }

  /** Já vem filtrada do back-end; nenhum filtro é aplicado no navegador. */
  get filteredDocs(): Documento[] {
    return this.docs;
  }

  get hasAnyDoc(): boolean {
    return this.totalElementos > 0;
  }

  get fimPagina(): number {
    return Math.min(this.paginaAtual * PAGE_SIZE, this.totalElementos);
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
    this.refreshService.notify('requests');

    if (payload.enviarAgora) {
      this.router.navigate([`/solicitacoes/${created.id}`]);
      this.notification.success('Solicitação criada. Compartilhe o link de envio com o cliente.');
    } else {
      this.notification.info('Solicitação salva como rascunho.');
    }
  }

  async openViewer(doc: Documento): Promise<void> {
    if (doc.direcao !== DirecaoDocumento.ENTRADA) {
      await this.documentService.markVisualizado(doc.id);
      await this.refreshDocs();
      this.refreshService.notify('documents', 'dashboard');
    }
    await this.refreshViewed(doc.id);
    this.viewerOpen = true;
  }

  closeViewer(): void {
    this.viewerOpen = false;
    this.viewedDoc = null;
    this.versions = [];
  }

  async handleInactivateDoc(): Promise<void> {
    const doc = this.viewedDoc;
    if (!doc || doc.ativo === false) return;

    const confirmado = await this.notification.confirm({
      title: 'Inativar documento',
      message:
        `Inativar "${doc.nome}"? O arquivo e o histórico serão preservados, ` +
        'mas o download e o link público deixarão de funcionar. Esta ação é irreversível.',
      confirmLabel: 'Inativar documento',
      cancelLabel: 'Cancelar',
      danger: true,
    });
    if (!confirmado) return;

    try {
      await this.documentService.inativar(doc.id);
      await this.refreshDocs();
      this.refreshService.notify('documents', 'dashboard');
      await this.refreshViewed(doc.id);
      this.notification.success('Documento inativado. Histórico e arquivo preservados.');
    } catch (error) {
      this.notification.error(error);
    }
  }

  async handleDeleteDoc(doc: Documento): Promise<void> {
    const confirmado = await this.notification.confirm({
      title: 'Excluir documento',
      message:
        `Excluir "${doc.nome}" também removerá o prazo vinculado a ele. ` +
        'Esta ação não pode ser desfeita. Deseja continuar?',
      confirmLabel: 'Excluir documento',
      cancelLabel: 'Cancelar',
      danger: true,
    });
    if (!confirmado) return;

    try {
      await this.documentService.remove(doc.id);
      await this.refreshDocs();
      this.refreshService.notify('documents', 'deadlines', 'dashboard');
      if (this.viewedDoc?.id === doc.id) this.closeViewer();
      this.notification.success(`Documento "${doc.nome}" removido com sucesso.`);
    } catch (error) {
      this.notification.error(error);
    }
  }

  async handleSend(doc: Documento | ViewerDocument | null): Promise<void> {
    if (!doc) return;

    const updated = await this.documentService.markEnviado(doc.id);
    await this.refreshDocs();
    this.refreshService.notify('documents', 'dashboard');
    if (this.viewerOpen && this.viewedDoc) await this.refreshViewed(this.viewedDoc.id);
    this.notification.success(`Documento enviado por ${updated?.canal ?? 'WhatsApp'} ao cliente.`);
  }

  async handleShare(doc: Documento | ViewerDocument | null): Promise<void> {
    if (!doc) return;

    try {
      this.share = await this.documentService.compartilhar(doc.id);
      this.shareDoc = (doc as Documento).clienteId
        ? (doc as Documento)
        : (this.docs.find((item) => item.id === doc.id) ?? (doc as Documento));
      this.shareOpen = true;
      await this.refreshDocs();
      this.refreshService.notify('documents', 'dashboard');
    } catch (error) {
      this.notification.error(error);
    }
  }

  onShareToast(evento: { message: string; type: 'success' | 'info' | 'error' }): void {
    if (evento.type === 'success') this.notification.success(evento.message);
    else if (evento.type === 'error') this.notification.error(evento.message);
    else this.notification.info(evento.message);
  }

  async handleAttach(payload: DocumentoNovo): Promise<Documento> {
    const created = await this.documentService.create(payload);
    this.closeAttach();
    await this.refreshDocs();
    this.refreshService.notify('documents', 'deadlines', 'dashboard');
    if (payload.enviarAgora) {
      this.notification.success(`Documento enviado por ${payload.canal} ao cliente.`);
    } else {
      this.notification.info('Documento salvo como rascunho.');
    }
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

  openEdit(): void {
    this.fieldErrors = {};
    this.formOriginal = JSON.stringify(this.formData);
    this.editOpen = true;
  }

  async closeEdit(): Promise<void> {
    if (this.savingEdit) return;
    if (!this.podeSair()) {
      const confirma = await this.notification.confirm({
        title: 'Descartar alterações?',
        message: 'As alterações não salvas serão perdidas. Deseja continuar?',
        confirmLabel: 'Descartar',
        cancelLabel: 'Voltar',
        danger: true,
      });
      if (!confirma) return;
    }
    this.editOpen = false;
    this.formOriginal = null;
    this.fieldErrors = {};
  }

  async handleEditSubmit(): Promise<void> {
    if (this.savingEdit) return;
    this.savingEdit = true;
    this.fieldErrors = {};
    try {
      await this.clientService.update(this.clienteId, this.formData);
      await this.refreshClient();
      this.refreshService.notify('customers');
      this.formOriginal = null;
      this.editOpen = false;
      this.notification.success('Cliente atualizado com sucesso.');
    } catch (error) {
      this.fieldErrors = normalizarErro(error).fieldErrors;
      this.notification.error(error);
    } finally {
      this.savingEdit = false;
    }
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
    this.refreshService.notify('documents', 'dashboard');
    await this.refreshViewed(this.viewedDoc.id);
    this.notification.success('Download concluído.');
  }

  abrirSolicitacao(sol: Solicitacao): void {
    this.router.navigate([`/solicitacoes/${sol.id}`]);
  }
}
