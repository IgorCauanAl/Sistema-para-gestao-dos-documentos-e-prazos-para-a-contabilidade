import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LucideBuilding2, LucideEdit2, LucideEye, LucidePlus, LucideSearch, LucideTrash2 } from '@lucide/angular';

import { CardComponent } from '../../../core/components/ui/card/card.component';
import { TableComponent } from '../../../core/components/ui/table/table.component';
import { formatCnpj } from '../../../core/domain/cnpj';
import type { Cliente } from '../../../core/domain/models';
import { normalizarErro } from '../../../core/errors/api-error';
import { ClientService } from '../../../core/services/client.service';
import { DataRefreshService } from '../../../core/services/data-refresh.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  ClientFormModalComponent,
  emptyClienteForm,
  type ClienteForm,
} from '../ui/client-form-modal/client-form-modal.component';
import { ConfirmDialogComponent } from '../../../core/components/ui/confirm-dialog/confirm-dialog.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [
    CardComponent,
    TableComponent,
    ClientFormModalComponent,
    ConfirmDialogComponent,
    LucideBuilding2,
    LucideEdit2,
    LucideEye,
    LucidePlus,
    LucideSearch,
    LucideTrash2,
  ],
  templateUrl: './clients-page.component.html',
  styleUrl: './clients-page.component.css',
})
export class ClientsPageComponent implements OnInit, OnDestroy {
  clients: Cliente[] = [];
  isModalOpen = false;
  editingId: number | null = null;
  searchTerm = '';
  appliedSearch = '';
  page = 0;
  pageSize = PAGE_SIZE;
  totalElements = 0;
  totalPages = 0;
  formData: ClienteForm = emptyClienteForm();
  fieldErrors: Record<string, string> = {};
  clienteParaExcluir: Cliente | null = null;
  saving = false;
  deleting = false;

  readonly formatCnpj = formatCnpj;

  private formOriginal: string | null = null;
  private buscaTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private router: Router,
    private clientService: ClientService,
    private notification: NotificationService,
    private refreshService: DataRefreshService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  ngOnDestroy(): void {
    this.cancelarTimer();
  }

  /** Usado pelo CanDeactivate para não perder alterações sem confirmação. */
  podeSair(): boolean {
    return !this.isModalOpen || !this.temAlteracoes();
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.cancelarTimer();
    this.buscaTimer = setTimeout(() => {
      this.appliedSearch = this.searchTerm.trim();
      this.page = 0;
      void this.refresh();
    }, 300);
  }

  async goToPage(pagina: number): Promise<void> {
    if (pagina < 0 || pagina >= this.totalPages || pagina === this.page) return;
    this.page = pagina;
    await this.refresh();
  }

  get paginaAtual(): number {
    return this.page + 1;
  }

  get intervaloInicio(): number {
    return this.totalElements === 0 ? 0 : this.page * this.pageSize + 1;
  }

  get intervaloFim(): number {
    return Math.min((this.page + 1) * this.pageSize, this.totalElements);
  }

  private async refresh(): Promise<void> {
    try {
      const resultado = await this.clientService.listPage({
        search: this.appliedSearch,
        page: this.page,
        size: this.pageSize,
      });
      if (resultado.totalPages > 0 && resultado.number >= resultado.totalPages) {
        this.page = resultado.totalPages - 1;
        await this.refresh();
        return;
      }

      this.clients = resultado.content;
      this.totalElements = resultado.totalElements;
      this.totalPages = resultado.totalPages;
    } catch (error) {
      this.notification.error(error);
    }
  }

  async handleSubmit(): Promise<void> {
    if (this.saving) return;
    this.saving = true;
    this.fieldErrors = {};
    try {
      if (this.editingId) {
        await this.clientService.update(this.editingId, this.formData);
        this.notification.success('Cliente atualizado com sucesso.');
      } else {
        await this.clientService.create(this.formData);
        this.notification.success('Cliente cadastrado com sucesso.');
      }

      await this.refresh();
      this.refreshService.notify('customers', 'dashboard');
      this.formOriginal = null;
      this.closeModal();
    } catch (error) {
      this.fieldErrors = normalizarErro(error).fieldErrors;
      this.notification.error(error);
    } finally {
      this.saving = false;
    }
  }

  handleRemove(client: Cliente): void {
    this.clienteParaExcluir = client;
  }

  cancelarExclusao(): void {
    this.clienteParaExcluir = null;
  }

  async confirmarExclusao(): Promise<void> {
    const cliente = this.clienteParaExcluir;
    if (!cliente || this.deleting) return;

    this.deleting = true;
    try {
      await this.clientService.remove(cliente.id);
      await this.refresh();
      this.refreshService.notify('customers', 'documents', 'deadlines', 'requests', 'dashboard');
      this.notification.success(
        `Cliente "${cliente.razaoSocial}" e todos os dados vinculados foram removidos.`
      );
    } catch (error) {
      this.notification.error(error);
    } finally {
      this.deleting = false;
      this.clienteParaExcluir = null;
    }
  }

  async handleEdit(client: Cliente): Promise<void> {
    if (!this.podeSair() && !(await this.confirmarDescarte())) return;

    // A listagem paginada não traz o endereço completo; busca o detalhe antes de editar.
    const completo = await this.clientService.getById(client.id);
    this.editingId = client.id;
    this.formData = {
      cnpj: formatCnpj(completo.cnpj),
      razaoSocial: completo.razaoSocial,
      responsavel: completo.responsavel,
      email: completo.email,
      endereco: completo.endereco,
      whatsapp: completo.whatsapp ?? '',
    };
    this.fieldErrors = {};
    this.formOriginal = JSON.stringify(this.formData);
    this.isModalOpen = true;
  }

  async handleOpen(client: Cliente): Promise<void> {
    if (!this.podeSair() && !(await this.confirmarDescarte())) return;
    await this.router.navigate([`/clientes/${client.id}`]);
  }

  handleNew(): void {
    this.editingId = null;
    this.formData = emptyClienteForm();
    this.fieldErrors = {};
    this.formOriginal = JSON.stringify(this.formData);
    this.isModalOpen = true;
  }

  async closeModal(): Promise<void> {
    if (this.saving) return;
    if (!this.podeSair() && !(await this.confirmarDescarte())) return;
    this.isModalOpen = false;
    this.editingId = null;
    this.formOriginal = null;
  }

  private temAlteracoes(): boolean {
    return this.formOriginal !== null && JSON.stringify(this.formData) !== this.formOriginal;
  }

  private async confirmarDescarte(): Promise<boolean> {
    const confirma = await this.notification.confirm({
      title: 'Descartar alterações?',
      message: 'As alterações não salvas serão perdidas. Deseja continuar?',
      confirmLabel: 'Descartar',
      cancelLabel: 'Voltar',
      danger: true,
    });
    if (confirma) this.formOriginal = null;
    return confirma;
  }

  private cancelarTimer(): void {
    if (this.buscaTimer !== null) {
      clearTimeout(this.buscaTimer);
      this.buscaTimer = null;
    }
  }
}
