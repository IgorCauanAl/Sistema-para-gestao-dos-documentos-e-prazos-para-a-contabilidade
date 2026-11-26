import { Component, OnInit } from '@angular/core';
import { LucideInbox, LucidePlus } from '@lucide/angular';

import { EmptyStateComponent } from '../../../core/components/ui/empty-state/empty-state.component';
import {
  DirecaoDocumento,
  DocumentStatus,
  TIPOS_DOCUMENTO,
  documentStatusMeta,
} from '../../../core/domain/documento';
import type { Cliente, Documento, DocumentoEntrada, DocumentoNovo } from '../../../core/domain/models';
import { ClientService } from '../../../core/services/client.service';
import {
  type DocumentoCompartilhado,
  type DocumentoFiltros,
  type DocumentosContadores,
  DocumentService,
} from '../../../core/services/document.service';
import { DataRefreshService } from '../../../core/services/data-refresh.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AttachDocumentModalComponent } from '../../client-detail/ui/attach-document-modal/attach-document-modal.component';
import { DocumentViewerComponent, type ViewerDocument } from '../../client-detail/ui/document-viewer/document-viewer.component';
import { BatchActionsBarComponent } from '../ui/batch-actions-bar/batch-actions-bar.component';
import {
  DocumentsFiltersComponent,
  emptyDocumentsFilters,
  type DocumentsFiltersModel,
} from '../ui/documents-filters/documents-filters.component';
import {
  DocumentsSummaryCardsComponent,
  type DocumentsContagens,
} from '../ui/documents-summary-cards/documents-summary-cards.component';
import { DocumentsTableComponent, type DocumentsSort } from '../ui/documents-table/documents-table.component';
import { DocumentShareModalComponent } from '../ui/document-share-modal/document-share-modal.component';
import { DocumentsTabsComponent } from '../ui/documents-tabs/documents-tabs.component';
import { MergePdfModalComponent, type MergePdfPayload } from '../ui/merge-pdf-modal/merge-pdf-modal.component';
import { ReceiveDocumentModalComponent } from '../ui/receive-document-modal/receive-document-modal.component';

const PAGE_SIZE = 10;
const STATUS_BACKEND = new Set(['CRIADO', 'ENVIADO', 'VISUALIZADO', 'BAIXADO']);

/** Status puramente visuais não existem no back-end; evita enviar um enum inválido. */
const statusParaApi = (status: string | null | undefined): string | undefined => {
  if (!status) return undefined;
  if (status === DocumentStatus.RASCUNHO) return 'CRIADO';
  return STATUS_BACKEND.has(status) ? status : undefined;
};

@Component({
  selector: 'app-documents-page',
  standalone: true,
  imports: [
    DocumentsSummaryCardsComponent,
    DocumentsTabsComponent,
    DocumentsFiltersComponent,
    DocumentsTableComponent,
    EmptyStateComponent,
    BatchActionsBarComponent,
    AttachDocumentModalComponent,
    ReceiveDocumentModalComponent,
    MergePdfModalComponent,
    DocumentViewerComponent,
    DocumentShareModalComponent,
    LucideInbox,
    LucidePlus,
  ],
  templateUrl: './documents-page.component.html',
  styleUrl: './documents-page.component.css',
})
export class DocumentsPageComponent implements OnInit {
  clientes: Cliente[] = [];
  docs: Documento[] | null = null;

  tab = 'TODOS';
  filters: DocumentsFiltersModel = emptyDocumentsFilters();
  cardAtivo: string | null = null;
  sort: DocumentsSort = { key: 'atividade', dir: 'desc' };

  /** Página 1-based na UI; o back-end recebe page-1. */
  page = 1;
  paginaAtual = 1;
  totalPaginas = 1;
  totalElementos = 0;
  contadores: DocumentosContadores | null = null;
  selectedIds = new Set<number>();

  attachOpen = false;
  receiveOpen = false;
  mergeOpen = false;

  shareOpen = false;
  shareDoc: Documento | null = null;
  shareCliente: Cliente | null = null;
  share: DocumentoCompartilhado | null = null;

  viewerOpen = false;
  viewedDoc: ViewerDocument | null = null;
  versions: Documento[] = [];

  readonly PAGE_SIZE = PAGE_SIZE;
  readonly DirecaoDocumento = DirecaoDocumento;
  readonly emptyFilters = emptyDocumentsFilters();
  readonly opcoesTipo = TIPOS_DOCUMENTO.map((tipo) => tipo.nome);

  constructor(
    private clientService: ClientService,
    private documentService: DocumentService,
    private refreshService: DataRefreshService,
    private notification: NotificationService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  /** Todos os filtros, ordenação e paginação são aplicados no banco. */
  private async refresh(): Promise<void> {
    const [clientes, pagina, contadores] = await Promise.all([
      this.clientService.list(),
      this.documentService.listPage(this.filtrosBackend()),
      this.documentService.contagens(),
    ]);

    this.clientes = clientes;
    this.docs = pagina.content;
    this.totalElementos = pagina.totalElements;
    this.totalPaginas = Math.max(1, pagina.totalPages);
    this.paginaAtual = pagina.number + 1;
    this.contadores = contadores;
  }

  private filtrosBackend(): DocumentoFiltros {
    const semana = this.cardAtivo === 'SEMANA';
    const hoje = new Date();
    hoje.setDate(hoje.getDate() - 7);

    let status = statusParaApi(this.filters.status);
    if (this.cardAtivo === 'RASCUNHO') status = 'CRIADO';
    if (this.cardAtivo === 'ENVIADO' || this.cardAtivo === 'VISUALIZADO') status = this.cardAtivo;

    return {
      busca: this.filters.busca,
      clienteId: this.filters.clienteId,
      direcao: semana
        ? DirecaoDocumento.ENTRADA
        : this.tab === 'TODOS'
          ? undefined
          : this.tab,
      status,
      tipo: this.filters.tipo,
      competencia: this.filters.competencia,
      canal: this.filters.canal,
      de: semana ? hoje.toISOString().slice(0, 10) : undefined,
      sortBy:
        this.sort.key === 'competencia'
          ? 'competence'
          : this.sort.key === 'cliente'
            ? 'customerId'
            : 'createdIn',
      sortDirection: this.sort.dir,
      page: this.page - 1,
      size: PAGE_SIZE,
    };
  }

  get nomeClienteFn(): (clienteId: number) => string {
    return (clienteId: number) => this.clientes.find((c) => c.id === clienteId)?.razaoSocial ?? '—';
  }

  /** A página já vem filtrada e ordenada do servidor. */
  get listaExibida(): Documento[] {
    return this.docs ?? [];
  }

  get paginada(): Documento[] {
    return this.listaExibida;
  }

  get fimPagina(): number {
    return Math.min(this.paginaAtual * PAGE_SIZE, this.totalElementos);
  }

  get contagens(): DocumentsContagens {
    return {
      RASCUNHO: this.contadores?.rascunho ?? 0,
      ENVIADO: this.contadores?.enviado ?? 0,
      VISUALIZADO: this.contadores?.visualizado ?? 0,
      SEMANA: this.contadores?.semana ?? 0,
    };
  }

  get contadoresAbas(): Record<string, number> {
    return {
      TODOS: this.contadores?.total ?? 0,
      [DirecaoDocumento.SAIDA]: this.contadores?.saida ?? 0,
      [DirecaoDocumento.ENTRADA]: this.contadores?.entrada ?? 0,
    };
  }

  get selecionados(): Documento[] {
    return this.listaExibida.filter((doc) => this.selectedIds.has(doc.id));
  }

  get todosDaPaginaSelecionados(): boolean {
    return this.paginada.length > 0 && this.paginada.every((doc) => this.selectedIds.has(doc.id));
  }

  get podeReenviar(): boolean {
    return (
      this.selecionados.length > 0 &&
      this.selecionados.every(
        (doc) => doc.status === DocumentStatus.ENVIADO || doc.status === DocumentStatus.VISUALIZADO
      )
    );
  }

  get podeJuntar(): boolean {
    if (this.selecionados.length < 2) return false;
    if (this.selecionados.some((doc) => doc.formato !== 'pdf')) return false;
    return new Set(this.selecionados.map((doc) => doc.clienteId)).size === 1;
  }

  get motivoJuntar(): string | null {
    if (this.selecionados.length < 2) return 'Selecione ao menos 2 documentos PDF';
    if (this.selecionados.some((doc) => doc.formato !== 'pdf')) return 'Junte apenas arquivos PDF';
    if (new Set(this.selecionados.map((doc) => doc.clienteId)).size !== 1) {
      return 'Selecione documentos do mesmo cliente';
    }
    return null;
  }

  async setTab(tab: string): Promise<void> {
    this.tab = tab;
    this.resetarPaginaSelecao();
    await this.refresh();
  }

  async setFilters(filters: DocumentsFiltersModel): Promise<void> {
    this.filters = filters;
    this.resetarPaginaSelecao();
    await this.refresh();
  }

  async setCardAtivo(card: string | null): Promise<void> {
    this.cardAtivo = card;
    this.resetarPaginaSelecao();
    await this.refresh();
  }

  async toggleSort(key: string): Promise<void> {
    this.sort =
      this.sort.key === key
        ? { key, dir: this.sort.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' };
    this.resetarPaginaSelecao();
    await this.refresh();
  }

  async irParaPagina(pagina: number): Promise<void> {
    if (pagina < 1 || pagina > this.totalPaginas || pagina === this.paginaAtual) return;
    this.page = pagina;
    this.selectedIds = new Set<number>();
    await this.refresh();
  }

  private resetarPaginaSelecao(): void {
    this.page = 1;
    this.selectedIds = new Set<number>();
  }

  limparSelecao(): void {
    this.selectedIds = new Set<number>();
  }

  toggleRow(event: { id: number; checked: boolean }): void {
    const next = new Set(this.selectedIds);
    if (event.checked) next.add(event.id);
    else next.delete(event.id);
    this.selectedIds = next;
  }

  togglePage(checked: boolean): void {
    const next = new Set(this.selectedIds);
    this.paginada.forEach((doc) => {
      if (checked) next.add(doc.id);
      else next.delete(doc.id);
    });
    this.selectedIds = next;
  }

  private async registrarVisualizacao(id: number | string): Promise<void> {
    await this.documentService.markVisualizado(id);
    await this.refresh();
    this.refreshService.notify('documents', 'dashboard');
  }

  async abrirViewer(doc: Documento): Promise<void> {
    if (doc.direcao !== DirecaoDocumento.ENTRADA) {
      await this.registrarVisualizacao(doc.id);
    }

    const completo = await this.documentService.getById(doc.id);
    if (!completo) return;

    completo.eventosAuditoria = await this.documentService.historico(completo.id);
    this.viewedDoc = completo;
    this.versions = await this.documentService.listVersions(completo);
    this.viewerOpen = true;
  }

  async selecionarVersao(version: ViewerDocument): Promise<void> {
    await this.registrarVisualizacao(version.id);

    const completo = await this.documentService.getById(version.id);
    if (!completo) return;

    completo.eventosAuditoria = await this.documentService.historico(completo.id);
    this.viewedDoc = completo;
    this.versions = await this.documentService.listVersions(completo);
  }

  fecharViewer(): void {
    this.viewerOpen = false;
    this.viewedDoc = null;
    this.versions = [];
  }

  async handleSend(doc: Documento | ViewerDocument | null): Promise<void> {
    if (!doc) return;

    const atualizado = await this.documentService.markEnviado(doc.id);
    await this.refresh();
    this.refreshService.notify('documents', 'dashboard');
    if (this.viewerOpen && this.viewedDoc) {
      const completo = await this.documentService.getById(this.viewedDoc.id);
      if (completo) {
        this.viewedDoc = completo;
        this.versions = await this.documentService.listVersions(completo);
      }
    }
    this.notification.success(`Documento enviado por ${atualizado?.canal ?? 'WhatsApp'} ao cliente.`);
  }

  async handleShare(doc: Documento | ViewerDocument | null): Promise<void> {
    if (!doc) return;
    try {
      const share = await this.documentService.compartilhar(doc.id);
      this.share = share;
      this.shareDoc = doc as Documento;
      this.shareCliente =
        doc.clienteId === undefined
          ? null
          : (this.clientes.find((c) => c.id === doc.clienteId) ?? null);
      this.shareOpen = true;
      await this.refresh();
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

  async handleInactivate(): Promise<void> {
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
      const atualizado = await this.documentService.inativar(doc.id);
      if (atualizado) {
        atualizado.eventosAuditoria = await this.documentService.historico(doc.id);
        this.viewedDoc = atualizado;
        this.versions = await this.documentService.listVersions(atualizado);
      }
      await this.refresh();
      this.refreshService.notify('documents', 'dashboard');
      this.notification.success('Documento inativado. Histórico e arquivo preservados.');
    } catch (error) {
      this.notification.error(error);
    }
  }

  async handleDelete(doc: Documento): Promise<void> {
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
      this.selectedIds = new Set([...this.selectedIds].filter((id) => id !== doc.id));
      await this.refresh();
      this.refreshService.notify('documents', 'deadlines', 'dashboard');
      if (this.viewedDoc?.id === doc.id) this.fecharViewer();
      this.notification.success(`Documento "${doc.nome}" removido com sucesso.`);
    } catch (error) {
      this.notification.error(error);
    }
  }

  async handleAttach(payload: DocumentoNovo): Promise<void> {
    try {
      await this.documentService.create(payload);
      this.attachOpen = false;
      await this.refresh();
      this.refreshService.notify('documents', 'deadlines', 'dashboard');
      if (payload.enviarAgora) {
        this.notification.success(`Documento enviado por ${payload.canal} ao cliente.`);
      } else {
        this.notification.info('Documento salvo como rascunho.');
      }
    } catch (error) {
      this.notification.error(error);
    }
  }

  async handleReceive(payload: DocumentoEntrada): Promise<void> {
    try {
      await this.documentService.createEntrada(payload);
      this.receiveOpen = false;
      await this.refresh();
      this.refreshService.notify('documents', 'deadlines', 'dashboard');
      this.notification.success('Recebimento registrado.');
    } catch (error) {
      this.notification.error(error);
    }
  }

  async handleReenviar(): Promise<void> {
    const elegiveis = this.selecionados.filter(
      (doc) => doc.status === DocumentStatus.ENVIADO || doc.status === DocumentStatus.VISUALIZADO
    );
    for (const doc of elegiveis) {
      await this.documentService.markEnviado(doc.id);
    }
    await this.refresh();
    if (elegiveis.length > 0) this.refreshService.notify('documents', 'dashboard');
    this.selectedIds = new Set<number>();
    this.notification.success(
      elegiveis.length === 1
        ? 'Documento reenviado ao cliente.'
        : `${elegiveis.length} documentos reenviados ao cliente.`
    );
  }

  exportarProtocolos(): void {
    const cabecalho = [
      'Cliente',
      'Documento',
      'Tipo',
      'Competência',
      'Versão',
      'Status',
      'Canal',
      'Hash',
    ];

    const linhas = this.selecionados.map((doc) => [
      this.nomeClienteFn(doc.clienteId),
      doc.nome,
      doc.tipo,
      doc.competencia,
      `v${doc.versao}`,
      documentStatusMeta[doc.status]?.label ?? doc.status,
      doc.canal ?? '—',
      doc.hash,
    ]);

    const csv =
      '\uFEFF' +
      [cabecalho, ...linhas]
        .map((linha) => linha.map((campo) => `"${String(campo).replace(/"/g, '""')}"`).join(';'))
        .join('\r\n');

    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      this.notification.error(new Error('Não foi possível gerar o arquivo CSV neste navegador.'));
      return;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'protocolos.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    this.notification.success('Protocolos exportados em CSV.');
  }

  async handleMerge(payload: MergePdfPayload): Promise<void> {
    const origem = this.selecionados[0];
    if (!origem) return;

    await this.documentService.createConsolidado({
      clienteId: origem.clienteId,
      nome: payload.nome,
      competencia: origem.competencia,
      fontes: payload.fontes,
    });
    this.mergeOpen = false;
    this.selectedIds = new Set<number>();
    await this.refresh();
    this.refreshService.notify('documents', 'dashboard');
    this.notification.success('Documento consolidado criado como rascunho.');
  }

  handleNewVersion(): void {
    this.fecharViewer();
    this.attachOpen = true;
  }

  onComprovante(): void {
    this.notification.info('Recurso visual: comprovante em breve.');
  }

  async handleDownload(): Promise<void> {
    if (!this.viewedDoc) return;

    await this.documentService.markBaixado(this.viewedDoc.id);
    const completo = await this.documentService.getById(this.viewedDoc.id);
    if (completo) {
      this.viewedDoc = completo;
      this.versions = await this.documentService.listVersions(completo);
    }
    await this.refresh();
    this.refreshService.notify('documents', 'dashboard');
    this.notification.success('Download concluído.');
  }
}
