import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LucideBuilding2, LucideEdit2, LucideEye, LucidePlus, LucideSearch, LucideTrash2 } from '@lucide/angular';

import { CardComponent } from '../../../core/components/ui/card/card.component';
import { TableComponent } from '../../../core/components/ui/table/table.component';
import { formatCnpj, onlyCnpjDigits } from '../../../core/domain/cnpj';
import type { Cliente } from '../../../core/domain/models';
import { ClientService } from '../../../core/services/client.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  ClientFormModalComponent,
  emptyClienteForm,
  type ClienteForm,
} from '../ui/client-form-modal/client-form-modal.component';
import { ConfirmDialogComponent } from '../../../core/components/ui/confirm-dialog/confirm-dialog.component';

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
  formData: ClienteForm = emptyClienteForm();
  clienteParaExcluir: Cliente | null = null;
  saving = false;
  deleting = false;

  readonly formatCnpj = formatCnpj;

  constructor(
    private router: Router,
    private clientService: ClientService,
    private toastService: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  ngOnDestroy(): void {}

  get filteredClients(): Cliente[] {
    const termo = this.searchTerm.trim().toLowerCase();
    const termoCnpj = onlyCnpjDigits(this.searchTerm);
    return this.clients.filter((client) => {
      const razao = client.razaoSocial.toLowerCase();
      const cnpj = onlyCnpjDigits(client.cnpj);
      return razao.includes(termo) || (termoCnpj.length > 0 && cnpj.includes(termoCnpj));
    });
  }

  private async refresh(): Promise<void> {
    try {
      this.clients = await this.clientService.list();
    } catch {
      this.toastService.show('Não foi possível carregar a lista de clientes.', 'error');
    }
  }

  async handleSubmit(): Promise<void> {
    if (this.saving) return;
    this.saving = true;
    try {
      if (this.editingId) {
        const atualizado = await this.clientService.update(this.editingId, this.formData);
        if (!atualizado) {
          this.toastService.show('Não foi possível atualizar o cliente. Tente novamente.', 'error');
          return;
        }
        this.toastService.show('Cliente atualizado com sucesso.');
      } else {
        await this.clientService.create(this.formData);
        this.toastService.show('Cliente cadastrado com sucesso.');
      }

      await this.refresh();
      this.closeModal();
    } catch {
      this.toastService.show(
        this.editingId ? 'Não foi possível atualizar o cliente.' : 'Não foi possível cadastrar o cliente.',
        'error'
      );
    } finally {
      this.saving = false;
    }
  }

  handleRemove(client: Cliente): void {
    this.clienteParaExcluir = client;
  }

  cancelarExclusao(): void {
    if (this.clienteParaExcluir) {
      this.toastService.show('Exclusão de cliente cancelada.', 'info');
    }
    this.clienteParaExcluir = null;
  }

  async confirmarExclusao(): Promise<void> {
    const cliente = this.clienteParaExcluir;
    if (!cliente || this.deleting) return;

    this.deleting = true;
    try {
      await this.clientService.remove(cliente.id);
      await this.refresh();
      this.toastService.show(`Cliente "${cliente.razaoSocial}" removido com sucesso.`);
    } catch {
      this.toastService.show('Não foi possível remover o cliente.', 'error');
    } finally {
      this.deleting = false;
      this.clienteParaExcluir = null;
    }
  }

  handleEdit(client: Cliente): void {
    const { id, ...data } = client;
    this.editingId = id;
    this.formData = {
      cnpj: formatCnpj(data.cnpj),
      razaoSocial: data.razaoSocial,
      responsavel: data.responsavel,
      email: data.email,
      endereco: data.endereco,
    };
    this.isModalOpen = true;
  }

  handleOpen(client: Cliente): void {
    this.router.navigate([`/clientes/${client.id}`]);
  }

  handleNew(): void {
    this.editingId = null;
    this.formData = emptyClienteForm();
    this.isModalOpen = true;
  }

  closeModal(): void {
    if (this.saving) return;
    this.isModalOpen = false;
    this.editingId = null;
  }
}
