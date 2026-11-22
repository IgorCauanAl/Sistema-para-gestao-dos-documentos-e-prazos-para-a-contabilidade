import { Component, OnInit } from '@angular/core';
import { LucideInbox, LucidePlus } from '@lucide/angular';

import { EmptyStateComponent } from '../../../core/components/ui/empty-state/empty-state.component';
import { diasDesde, paraData } from '../../../core/domain/data';
import {
  DirecaoDocumento,
  DocumentStatus,
  documentStatusMeta,
  ultimaAtividade,
} from '../../../core/domain/documento';
import type { Cliente, Documento, DocumentoEntrada, DocumentoNovo } from '../../../core/domain/models';
import { ClientService } from '../../../core/services/client.service';
import { DocumentService } from '../../../core/services/document.service';
import { PrazoRefreshService } from '../../../core/services/prazo-refresh.service';
import { ToastService } from '../../../core/services/toast.service';
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
import { DocumentsTabsComponent } from '../ui/documents-tabs/documents-tabs.component';
import { MergePdfModalComponent, type MergePdfPayload } from '../ui/merge-pdf-modal/merge-pdf-modal.component';
import { ReceiveDocumentModalComponent } from '../ui/receive-document-modal/receive-document-modal.component';

const PAGE_SIZE = 10;

const chaveCompetencia = (competencia: string): number => {
  const [mes, ano] = competencia.split('/').map(Number);
  return ano * 12 + mes;
};

const chaveAtividade = (doc: Documento): number => {
  const evento = ultimaAtividade(doc);
  return evento ? paraData(evento.data)?.getTime() ?? 0 : 0;
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
    LucideInbox,
    LucidePlus,
  ],
  templateUrl: './documents-page.component.html',
  styleUrl: './documents-page.component.css',
})
export class DocumentsPageComponent implements OnInit {
  clientes: Cliente[] = [];
  docs: Documento[] | null = null;
  /** Base completa para contadores e opções; `docs` contém apenas a aba ativa. */
  todosOsDocs: Documento[] = [];

  tab = 'TODOS';
  filters: DocumentsFiltersModel = emptyDocumentsFilters();
  cardAtivo: string | null = null;
  sort: DocumentsSort = { key: 'atividade', dir: 'desc' };
  page = 1;
  selectedIds = new Set<number>();

  attachOpen = false;
  receiveOpen = false;
  mergeOpen = false;

  viewerOpen = false;
  viewedDoc: ViewerDocument | null = null;
  versions: Documento[] = [];

  readonly PAGE_SIZE = PAGE_SIZE;
  readonly DirecaoDocumento = DirecaoDocumento;
  readonly emptyFilters = emptyDocumentsFilters();

  constructor(
    private clientService: ClientService,
    private documentService: DocumentService,
    private prazoRefreshService: PrazoRefreshService,
    public toastService: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  private async refresh(): Promise<void> {
    // As abas repassam a direção ao serviço, que espelha o filtro `?direction=` do back-end.
    const direcao = this.tab === 'TODOS' ? undefined : this.tab;
    const [clientes, todosOsDocs, docs] = await Promise.all([
      this.clientService.list(),
      this.documentService.listAll(),
      this.documentService.listAll(direcao),
    ]);
    this.clientes = clientes;
    this.todosOsDocs = todosOsDocs;
    this.docs = docs;
  }

  get nomeClienteFn(): (clienteId: number) => string {
    return (clienteId: number) => this.clientes.find((c) => c.id === clienteId)?.razaoSocial ?? '—';
  }

  get opcoesTipo(): string[] {
    return [...new Set(this.todosOsDocs.map((d) => d.tipo))].sort();
  }

  private aplicarFiltros(lista: Documento[], ignorarDirecao = false): Documento[] {
    return lista.filter((doc) => {
      if (!ignorarDirecao && this.tab !== 'TODOS' && doc.direcao !== this.tab) return false;

      const termo = this.filters.busca.trim().toLowerCase();
      if (termo) {
        const alvo = `${doc.nome} ${doc.tipo} ${this.nomeClienteFn(doc.clienteId)}`.toLowerCase();
        if (!alvo.includes(termo)) return false;
      }
      if (this.filters.clienteId && doc.clienteId !== this.filters.clienteId) return false;
      if (this.filters.tipo && doc.tipo !== this.filters.tipo) return false;
      if (this.filters.competencia && doc.competencia !== this.filters.competencia) return false;
      if (this.filters.status && doc.status !== this.filters.status) return false;
      if (this.filters.canal && doc.canal !== this.filters.canal) return false;

      if (this.cardAtivo === 'SEMANA') {
        const evento = ultimaAtividade(doc);
        if (doc.direcao !== DirecaoDocumento.ENTRADA || doc.status !== DocumentStatus.RECEBIDO) return false;
        if (!evento || diasDesde(evento.data) > 7) return false;
      } else if (this.cardAtivo && doc.status !== this.cardAtivo) {
        return false;
      }

      return true;
    });
  }

  get listaExibida(): Documento[] {
    const filtrados = this.aplicarFiltros(this.docs ?? []);
    const comparador = (a: Documento, b: Documento): number => {
      let cmp: number;
      if (this.sort.key === 'cliente') {
        cmp = this.nomeClienteFn(a.clienteId).localeCompare(this.nomeClienteFn(b.clienteId), 'pt-BR');
      } else if (this.sort.key === 'competencia') {
        cmp = chaveCompetencia(a.competencia) - chaveCompetencia(b.competencia);
      } else {
        cmp = chaveAtividade(a) - chaveAtividade(b);
      }
      return this.sort.dir === 'asc' ? cmp : -cmp;
    };

    return [...filtrados].sort(comparador);
  }

  get contagens(): DocumentsContagens {
    const naAba = this.todosOsDocs.filter((doc) => this.tab === 'TODOS' || doc.direcao === this.tab);
    const semana = naAba.filter((doc) => {
      if (doc.direcao !== DirecaoDocumento.ENTRADA || doc.status !== DocumentStatus.RECEBIDO) return false;
      const evento = ultimaAtividade(doc);
      return Boolean(evento) && diasDesde(evento.data) <= 7;
    });

    return {
      RASCUNHO: naAba.filter(
        (d) => d.status === DocumentStatus.CRIADO || d.status === DocumentStatus.RASCUNHO
      ).length,
      ENVIADO: naAba.filter((d) => d.status === DocumentStatus.ENVIADO).length,
      VISUALIZADO: naAba.filter((d) => d.status === DocumentStatus.VISUALIZADO).length,
      SEMANA: semana.length,
    };
  }

  get contadoresAbas(): Record<string, number> {
    const base = this.aplicarFiltros(this.todosOsDocs, true);
    return {
      TODOS: base.length,
      [DirecaoDocumento.SAIDA]: base.filter((d) => d.direcao === DirecaoDocumento.SAIDA).length,
      [DirecaoDocumento.ENTRADA]: base.filter((d) => d.direcao === DirecaoDocumento.ENTRADA).length,
    };
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.listaExibida.length / PAGE_SIZE));
  }

  get paginaAtual(): number {
    return Math.min(this.page, this.totalPaginas);
  }

  get paginada(): Documento[] {
    return this.listaExibida.slice((this.paginaAtual - 1) * PAGE_SIZE, this.paginaAtual * PAGE_SIZE);
  }

  get fimPagina(): number {
    return Math.min(this.paginaAtual * PAGE_SIZE, this.listaExibida.length);
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

  setFilters(filters: DocumentsFiltersModel): void {
    this.filters = filters;
    this.resetarPaginaSelecao();
  }

  setCardAtivo(card: string | null): void {
    this.cardAtivo = card;
    this.resetarPaginaSelecao();
  }

  toggleSort(key: string): void {
    this.sort =
      this.sort.key === key
        ? { key, dir: this.sort.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' };
    this.resetarPaginaSelecao();
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
  }

  async abrirViewer(doc: Documento): Promise<void> {
    if (doc.direcao !== DirecaoDocumento.ENTRADA) {
      await this.registrarVisualizacao(doc.id);
    }

    const completo = await this.documentService.getById(doc.id);
    if (!completo) return;

    this.viewedDoc = completo;
    this.versions = await this.documentService.listVersions(completo);
    this.viewerOpen = true;
  }

  async selecionarVersao(version: ViewerDocument): Promise<void> {
    await this.registrarVisualizacao(version.id);

    const completo = await this.documentService.getById(version.id);
    if (!completo) return;

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
    if (this.viewerOpen && this.viewedDoc) {
      const completo = await this.documentService.getById(this.viewedDoc.id);
      if (completo) {
        this.viewedDoc = completo;
        this.versions = await this.documentService.listVersions(completo);
      }
    }
    this.toastService.show(`Documento enviado por ${atualizado?.canal ?? 'WhatsApp'} ao cliente.`);
  }

  async handleAttach(payload: DocumentoNovo): Promise<void> {
    await this.documentService.create(payload);
    this.attachOpen = false;
    await this.refresh();
    this.prazoRefreshService.notify();
    this.toastService.show(
      payload.enviarAgora
        ? `Documento enviado por ${payload.canal} ao cliente.`
        : 'Documento salvo como rascunho.'
    );
  }

  async handleReceive(payload: DocumentoEntrada): Promise<void> {
    await this.documentService.createEntrada(payload);
    this.receiveOpen = false;
    await this.refresh();
    this.prazoRefreshService.notify();
    this.toastService.show('Recebimento registrado.');
  }

  async handleReenviar(): Promise<void> {
    const elegiveis = this.selecionados.filter(
      (doc) => doc.status === DocumentStatus.ENVIADO || doc.status === DocumentStatus.VISUALIZADO
    );
    for (const doc of elegiveis) {
      await this.documentService.markEnviado(doc.id);
    }
    await this.refresh();
    this.selectedIds = new Set<number>();
    this.toastService.show(
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
      'Última atividade',
      'Hash',
    ];

    const linhas = this.selecionados.map((doc) => {
      const evento = ultimaAtividade(doc);
      return [
        this.nomeClienteFn(doc.clienteId),
        doc.nome,
        doc.tipo,
        doc.competencia,
        `v${doc.versao}`,
        documentStatusMeta[doc.status].label,
        doc.canal ?? '—',
        evento ? `${evento.data} ${evento.hora}` : '—',
        doc.hash,
      ];
    });

    const csv =
      '\uFEFF' +
      [cabecalho, ...linhas]
        .map((linha) => linha.map((campo) => `"${String(campo).replace(/"/g, '""')}"`).join(';'))
        .join('\r\n');

    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'protocolos.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }

    this.toastService.show('Protocolos exportados em CSV.');
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
    this.toastService.show('Documento consolidado criado como rascunho.');
  }

  handleNewVersion(): void {
    this.fecharViewer();
    this.attachOpen = true;
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
    this.toastService.show('Download concluído.');
  }
}
