import { Component, OnInit } from '@angular/core';
import { LucideInbox, LucidePlus } from '@lucide/angular';

import { EmptyStateComponent } from '../../core/components/ui/empty-state.component';
import { diasDesde, paraData } from '../../core/domain/data';
import {
  DirecaoDocumento,
  DocumentStatus,
  documentStatusMeta,
  ultimaAtividade,
} from '../../core/domain/documento';
import type { Cliente, Documento, DocumentoEntrada, DocumentoNovo } from '../../core/domain/models';
import { ClientService } from '../../core/services/client.service';
import { DocumentService } from '../../core/services/document.service';
import { ToastService } from '../../core/services/toast.service';
import { AttachDocumentModalComponent } from '../client-detail/ui/attach-document-modal.component';
import { DocumentViewerComponent, type ViewerDocument } from '../client-detail/ui/document-viewer.component';
import { BatchActionsBarComponent } from './ui/batch-actions-bar.component';
import {
  DocumentsFiltersComponent,
  emptyDocumentsFilters,
  type DocumentsFiltersModel,
} from './ui/documents-filters.component';
import {
  DocumentsSummaryCardsComponent,
  type DocumentsContagens,
} from './ui/documents-summary-cards.component';
import { DocumentsTableComponent, type DocumentsSort } from './ui/documents-table.component';
import { DocumentsTabsComponent } from './ui/documents-tabs.component';
import { MergePdfModalComponent, type MergePdfPayload } from './ui/merge-pdf-modal.component';
import { ReceiveDocumentModalComponent } from './ui/receive-document-modal.component';

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
  template: `
    @if (docs) {
      <div class="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-800">Documentos</h1>
            <p class="text-sm text-slate-500 mt-1">
              Acompanhe tudo que foi enviado e recebido pelo escritório
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              (click)="receiveOpen = true"
              class="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              <svg lucideInbox [size]="16"></svg> Registrar recebimento
            </button>
            <button
              type="button"
              (click)="attachOpen = true"
              class="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors"
            >
              <svg lucidePlus [size]="16"></svg> Anexar document
            </button>
          </div>
        </div>

        <app-documents-summary-cards
          [contagens]="contagens"
          [ativo]="cardAtivo"
          (onClick)="setCardAtivo($event)"
        ></app-documents-summary-cards>

        <div class="flex flex-wrap items-center justify-between gap-4">
          <app-documents-tabs
            [active]="tab"
            [counts]="contadoresAbas"
            (onChange)="setTab($event)"
          ></app-documents-tabs>
          @if (cardAtivo) {
            <button
              type="button"
              (click)="setCardAtivo(null)"
              class="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Limpar filtro do card
            </button>
          }
        </div>

        <app-documents-filters
          [filters]="filters"
          [clientes]="clientes"
          [opcoesTipo]="opcoesTipo"
          (onChange)="setFilters($event)"
          (onClear)="setFilters(emptyFilters)"
        ></app-documents-filters>

        @if (listaExibida.length === 0) {
          <app-empty-state
            title="Nenhum document encontrado com esses filtros"
            subtitle="Ajuste a busca, o cliente, o tipo ou o status para encontrar o document desejado."
          ></app-empty-state>
        } @else {
          <div class="space-y-4">
            <app-documents-table
              [documents]="paginada"
              [nomeCliente]="nomeClienteFn"
              [sort]="sort"
              [selectedIds]="selectedIds"
              [todosDaPaginaSelecionados]="todosDaPaginaSelecionados"
              (onView)="abrirViewer($event)"
              (onSend)="handleSend($event)"
              (onSort)="toggleSort($event)"
              (onToggleRow)="toggleRow($event)"
              (onTogglePage)="togglePage($event)"
            ></app-documents-table>

            <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
              <p>
                Mostrando {{ (paginaAtual - 1) * PAGE_SIZE + 1 }}–{{ fimPagina }} de
                {{ listaExibida.length }} document{{ listaExibida.length > 1 ? 's' : '' }}
              </p>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Página anterior"
                  [disabled]="paginaAtual <= 1"
                  (click)="page = paginaAtual - 1"
                  class="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  aria-label="Próxima página"
                  [disabled]="paginaAtual >= totalPaginas"
                  (click)="page = paginaAtual + 1"
                  class="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        }

        @if (selecionados.length > 0) {
          <app-batch-actions-bar
            [count]="selecionados.length"
            [podeReenviar]="podeReenviar"
            [podeJuntar]="podeJuntar"
            [motivoJuntar]="motivoJuntar"
            (onReenviar)="handleReenviar()"
            (onExportar)="exportarProtocolos()"
            (onJuntar)="mergeOpen = true"
            (onClear)="limparSelecao()"
          ></app-batch-actions-bar>
        }

        <app-attach-document-modal
          [open]="attachOpen"
          [clientes]="clientes"
          (onClose)="attachOpen = false"
          (onSubmit)="handleAttach($event)"
        ></app-attach-document-modal>

        <app-receive-document-modal
          [open]="receiveOpen"
          [clientes]="clientes"
          (onClose)="receiveOpen = false"
          (onSubmit)="handleReceive($event)"
        ></app-receive-document-modal>

        <app-merge-pdf-modal
          [open]="mergeOpen"
          [documentos]="selecionados"
          [nomeCliente]="nomeClienteFn"
          (onClose)="mergeOpen = false"
          (onMerge)="handleMerge($event)"
        ></app-merge-pdf-modal>

        <app-document-viewer
          [open]="viewerOpen"
          [documento]="viewedDoc"
          [versions]="versions"
          [showActions]="viewedDoc?.direcao !== DirecaoDocumento.ENTRADA"
          (onSelectVersion)="selecionarVersao($event)"
          (onClose)="fecharViewer()"
          (onResend)="handleSend(viewedDoc)"
          (onNewVersion)="handleNewVersion()"
          (onDownload)="handleDownload()"
          (onReceipt)="toastService.show('Recurso visual: comprovante em breve.', 'info')"
        ></app-document-viewer>
      </div>
    }
  `,
})
export class DocumentsPageComponent implements OnInit {
  clientes: Cliente[] = [];
  docs: Documento[] | null = null;

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
    public toastService: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  private async refresh(): Promise<void> {
    const [clientes, docs] = await Promise.all([this.clientService.list(), this.documentService.listAll()]);
    this.clientes = clientes;
    this.docs = docs;
  }

  get nomeClienteFn(): (clienteId: number) => string {
    return (clienteId: number) => this.clientes.find((c) => c.id === clienteId)?.razaoSocial ?? '—';
  }

  get opcoesTipo(): string[] {
    return [...new Set((this.docs ?? []).map((d) => d.tipo))].sort();
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
    const naAba = (this.docs ?? []).filter((doc) => this.tab === 'TODOS' || doc.direcao === this.tab);
    const semana = naAba.filter((doc) => {
      if (doc.direcao !== DirecaoDocumento.ENTRADA || doc.status !== DocumentStatus.RECEBIDO) return false;
      const evento = ultimaAtividade(doc);
      return Boolean(evento) && diasDesde(evento.data) <= 7;
    });

    return {
      RASCUNHO: naAba.filter((d) => d.status === DocumentStatus.RASCUNHO).length,
      ENVIADO: naAba.filter((d) => d.status === DocumentStatus.ENVIADO).length,
      VISUALIZADO: naAba.filter((d) => d.status === DocumentStatus.VISUALIZADO).length,
      SEMANA: semana.length,
    };
  }

  get contadoresAbas(): Record<string, number> {
    const base = this.aplicarFiltros(this.docs ?? [], true);
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

  setTab(tab: string): void {
    this.tab = tab;
    this.resetarPaginaSelecao();
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

  async abrirViewer(doc: Documento): Promise<void> {
    const completo = await this.documentService.getById(doc.id);
    if (!completo) return;

    this.viewedDoc = completo;
    this.versions = await this.documentService.listVersions(completo);
    this.viewerOpen = true;
  }

  async selecionarVersao(version: ViewerDocument): Promise<void> {
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
    this.toastService.show('Download simulado concluído.');
  }
}
