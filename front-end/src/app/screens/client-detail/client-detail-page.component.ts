import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucidePlus } from '@lucide/angular';
import { Subscription } from 'rxjs';

import { EmptyStateComponent } from '../../core/components/ui/empty-state.component';
import type { Cliente, Documento, DocumentoNovo, Solicitacao, SolicitacaoNova } from '../../core/domain/models';
import { calcularStatusSolicitacao } from '../../core/domain/solicitacao';
import { ClientService } from '../../core/services/client.service';
import { DocumentService } from '../../core/services/document.service';
import { SolicitacaoService } from '../../core/services/solicitacao.service';
import { ToastService } from '../../core/services/toast.service';
import { ClientFormModalComponent, emptyClienteForm, type ClienteForm } from '../clients/ui/client-form-modal.component';
import { AttachDocumentModalComponent } from './ui/attach-document-modal.component';
import { ClientProfileHeaderComponent } from './ui/client-profile-header.component';
import { DetailTabsComponent } from './ui/detail-tabs.component';
import {
  DocumentFiltersComponent,
  emptyDocumentFilters,
  type DocumentFiltersModel,
} from './ui/document-filters.component';
import { DocumentTableComponent } from './ui/document-table.component';
import { DocumentViewerComponent, type ViewerDocument } from './ui/document-viewer.component';
import { ConfirmDialogComponent } from '../solicitacoes/ui/confirm-dialog.component';
import { NovaSolicitacaoModalComponent } from '../solicitacoes/ui/nova-solicitacao-modal.component';
import {
  emptySolicitacaoFilters,
  SolicitacaoFiltersComponent,
  type SolicitacaoFiltersModel,
} from '../solicitacoes/ui/solicitacao-filters.component';
import { SolicitacaoTableComponent } from '../solicitacoes/ui/solicitacao-table.component';

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
    ConfirmDialogComponent,
    LucidePlus,
  ],
  template: `
    @if (client) {
      <div class="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
        <app-client-profile-header
          [client]="client"
          (onEdit)="editOpen = true"
          (onAttach)="openAttach()"
        ></app-client-profile-header>

        <app-detail-tabs [activeTab]="tab" (onChange)="tab = $event"></app-detail-tabs>

        @if (tab === 'Documentos') {
          <div class="space-y-6">
            <app-document-filters
              [filters]="filters"
              (onChange)="filters = $event"
            ></app-document-filters>

            @if (filteredDocs.length > 0) {
              <app-document-table
                [documents]="filteredDocs"
                (onView)="openViewer($event)"
                (onSend)="handleSend($event)"
              ></app-document-table>
            } @else if (hasAnyDoc) {
              <app-empty-state
                title="Nenhum document encontrado"
                subtitle="Ajuste os filtros para encontrar o document desejado."
              ></app-empty-state>
            } @else {
              <app-empty-state
                title="Nenhum document anexado para este cliente"
                subtitle="Clique em “+ Anexar document” para enviar o primeiro arquivo."
              ></app-empty-state>
            }
          </div>
        }

        @if (tab === 'Solicitações') {
          <div class="space-y-6">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <p class="text-sm text-slate-500">
                @if (clientSols.length === 0) {
                  Nenhuma solicitação para este cliente.
                } @else {
                  {{ clientSols.length }} solicitação(ões) para este cliente.
                }
              </p>
              <button
                type="button"
                (click)="novaSolOpen = true"
                class="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors"
              >
                <svg lucidePlus [size]="16"></svg> Nova solicitação
              </button>
            </div>

            @if (clientSols.length > 0) {
              <app-solicitacao-filters
                [filters]="solFilters"
                [clientes]="[]"
                [showCliente]="false"
                (filtersChange)="solFilters = $event"
              ></app-solicitacao-filters>
            }

            @if (clientSols.length === 0) {
              <app-empty-state
                title="Nenhuma solicitação criada"
                subtitle="Clique em “+ Nova solicitação” para pedir documentos ao cliente."
              ></app-empty-state>
            } @else if (filteredSols.length === 0) {
              <app-empty-state
                title="Nenhuma solicitação encontrada"
                subtitle="Ajuste os filtros para encontrar a solicitação desejada."
              ></app-empty-state>
            } @else {
              <app-solicitacao-table
                [solicitacoes]="filteredSols"
                [nomeCliente]="nomeClienteFn"
                [showCliente]="false"
                (onOpen)="abrirSolicitacao($event)"
                (onResend)="abrirSolicitacao($event)"
                (onCancel)="solCancelTarget = $event"
              ></app-solicitacao-table>
            }
          </div>
        }

        @if (tab !== 'Documentos' && tab !== 'Solicitações') {
          <app-empty-state
            [title]="tab + ' — em breve'"
            subtitle="Este módulo estará disponível em breve."
          ></app-empty-state>
        }

        <app-nova-solicitacao-modal
          [open]="novaSolOpen"
          [clientes]="client ? [client] : []"
          [clienteInicial]="client"
          (onClose)="novaSolOpen = false"
          (onSubmit)="handleNovaSolicitacao($event)"
        ></app-nova-solicitacao-modal>

        <app-confirm-dialog
          [open]="!!solCancelTarget"
          (onClose)="solCancelTarget = null"
          (onConfirm)="handleSolCancel()"
          title="Cancelar solicitação"
          [message]="mensagemCancelamento"
          confirmLabel="Cancelar solicitação"
        ></app-confirm-dialog>

        <app-attach-document-modal
          [open]="attachOpen"
          [client]="client"
          [prefill]="attachPrefill"
          (onClose)="closeAttach()"
          (onSubmit)="handleAttach($event)"
        ></app-attach-document-modal>

        <app-document-viewer
          [open]="viewerOpen"
          [documento]="viewedDoc"
          [versions]="versions"
          (onSelectVersion)="refreshViewed($event.id)"
          (onClose)="closeViewer()"
          (onResend)="handleSend(viewedDoc)"
          (onNewVersion)="handleNewVersion()"
          (onDownload)="handleDownload()"
          (onReceipt)="toastService.show('Recurso visual: comprovante em breve.', 'info')"
        ></app-document-viewer>

        <app-client-form-modal
          [open]="editOpen"
          title="Editar Cliente"
          [formData]="formData"
          (formDataChange)="formData = $event"
          (onClose)="editOpen = false"
          (onSubmit)="handleEditSubmit()"
        ></app-client-form-modal>
      </div>
    }
  `,
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
  solCancelTarget: Solicitacao | null = null;

  private clienteId = '';
  private paramSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private documentService: DocumentService,
    private solicitacaoService: SolicitacaoService,
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

  get mensagemCancelamento(): string {
    return `A solicitação "${this.solCancelTarget?.titulo ?? ''}" será cancelada e o link deixará de funcionar para o cliente. Esta ação não pode ser desfeita.`;
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

  async handleSolCancel(): Promise<void> {
    if (!this.solCancelTarget) return;

    await this.solicitacaoService.cancelar(this.solCancelTarget.id);
    this.solCancelTarget = null;
    await this.refreshSolicitacoes();
    this.toastService.show('Solicitação cancelada.');
  }

  async openViewer(doc: Documento): Promise<void> {
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
    this.toastService.show('Download simulado concluído.');
  }

  abrirSolicitacao(sol: Solicitacao): void {
    this.router.navigate([`/solicitacoes/${sol.id}`]);
  }
}
