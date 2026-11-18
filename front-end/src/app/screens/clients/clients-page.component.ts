import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LucideBuilding2, LucideEdit2, LucideEye, LucidePlus, LucideSearch, LucideTrash2 } from '@lucide/angular';

import { CardComponent } from '../../core/components/ui/card.component';
import { TableComponent } from '../../core/components/ui/table.component';
import type { Cliente } from '../../core/domain/models';
import { ClientService } from '../../core/services/client.service';
import { ToastService } from '../../core/services/toast.service';
import {
  ClientFormModalComponent,
  emptyClienteForm,
  type ClienteForm,
} from './ui/client-form-modal.component';

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [
    CardComponent,
    TableComponent,
    ClientFormModalComponent,
    LucideBuilding2,
    LucideEdit2,
    LucideEye,
    LucidePlus,
    LucideSearch,
    LucideTrash2,
  ],
  template: `
    <div class="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Gestão de Clientes</h1>
          <p class="text-sm text-slate-500 mt-1">Cadastre e gerencie as empresas do seu portfólio.</p>
        </div>
        <button
          (click)="handleNew()"
          class="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-full text-sm font-medium shadow-sm hover:bg-indigo-600 transition-colors"
        >
          <svg lucidePlus [size]="18"></svg> Novo Cliente
        </button>
      </div>

      <app-card className="p-2">
        <div class="relative flex-1">
          <svg
            lucideSearch
            [size]="20"
            class="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
          ></svg>
          <input
            type="text"
            placeholder="Buscar por Razão Social ou CNPJ..."
            [value]="searchTerm"
            (input)="searchTerm = $any($event.target).value"
            class="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:outline-none text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </app-card>

      <app-table>
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="border-b border-slate-200/50 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500"
            >
              <th class="p-4 pl-6 font-semibold">Razão Social</th>
              <th class="p-4 font-semibold">CNPJ</th>
              <th class="p-4 font-semibold">Responsável</th>
              <th class="p-4 font-semibold">E-mail</th>
              <th class="p-4 font-semibold">Pendências</th>
              <th class="p-4 font-semibold">Último envio</th>
              <th class="p-4 pr-6 font-semibold text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (client of filteredClients; track client.id) {
              <tr
                (click)="handleOpen(client)"
                class="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors cursor-pointer"
              >
                <td class="p-4 pl-6 font-medium text-slate-700">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-500">
                      <svg lucideBuilding2 [size]="18"></svg>
                    </div>
                    {{ client.razaoSocial }}
                  </div>
                </td>
                <td class="p-4 text-sm text-slate-600">{{ client.cnpj }}</td>
                <td class="p-4 text-sm text-slate-600">{{ client.responsavel }}</td>
                <td class="p-4 text-sm text-slate-600">{{ client.email }}</td>
                <td class="p-4">
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border"
                    [class]="
                      (client.pendencias ?? 0) > 0
                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                        : 'bg-green-50 text-green-700 border-green-200'
                    "
                  >
                    {{
                      (client.pendencias ?? 0) > 0
                        ? (client.pendencias ?? 0) + ' pendente' + ((client.pendencias ?? 0) > 1 ? 's' : '')
                        : 'Sem pendências'
                    }}
                  </span>
                </td>
                <td class="p-4 text-sm text-slate-600">{{ client.ultimoEnvio ?? '—' }}</td>
                <td class="p-4 pr-6">
                  <div class="flex justify-center gap-2">
                    <button
                      type="button"
                      title="Abrir ficha do cliente"
                      [attr.aria-label]="'Abrir ficha de ' + client.razaoSocial"
                      (click)="$event.stopPropagation(); handleOpen(client)"
                      class="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <svg lucideEye [size]="16"></svg>
                    </button>
                    <button
                      type="button"
                      title="Editar cliente"
                      [attr.aria-label]="'Editar ' + client.razaoSocial"
                      (click)="$event.stopPropagation(); handleEdit(client)"
                      class="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <svg lucideEdit2 [size]="16"></svg>
                    </button>
                    <button
                      type="button"
                      title="Excluir cliente"
                      [attr.aria-label]="'Excluir ' + client.razaoSocial"
                      (click)="$event.stopPropagation(); handleRemove(client)"
                      class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg lucideTrash2 [size]="16"></svg>
                    </button>
                  </div>
                </td>
              </tr>
            }
            @if (filteredClients.length === 0) {
              <tr>
                <td colspan="7" class="p-12 text-center text-slate-500">Nenhum cliente encontrado.</td>
              </tr>
            }
          </tbody>
        </table>
      </app-table>

      <app-client-form-modal
        [open]="isModalOpen"
        [title]="editingId ? 'Editar Cliente' : 'Cadastrar Novo Cliente'"
        [formData]="formData"
        (formDataChange)="formData = $event"
        (onClose)="closeModal()"
        (onSubmit)="handleSubmit()"
      ></app-client-form-modal>
    </div>
  `,
})
export class ClientsPageComponent implements OnInit, OnDestroy {
  clients: Cliente[] = [];
  isModalOpen = false;
  editingId: number | null = null;
  searchTerm = '';
  formData: ClienteForm = emptyClienteForm();

  constructor(
    private router: Router,
    private clientService: ClientService,
    private toastService: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    this.clients = await this.clientService.list();
  }

  ngOnDestroy(): void {}

  get filteredClients(): Cliente[] {
    const termo = this.searchTerm.toLowerCase();
    return this.clients.filter(
      (client) => client.razaoSocial.toLowerCase().includes(termo) || client.cnpj.includes(this.searchTerm)
    );
  }

  private async refresh(): Promise<void> {
    this.clients = await this.clientService.list();
  }

  async handleSubmit(): Promise<void> {
    if (this.editingId) {
      await this.clientService.update(this.editingId, this.formData);
      this.toastService.show('Cliente atualizado com sucesso.');
    } else {
      await this.clientService.create(this.formData);
      this.toastService.show('Cliente cadastrado com sucesso.');
    }

    await this.refresh();
    this.closeModal();
  }

  async handleRemove(client: Cliente): Promise<void> {
    await this.clientService.remove(client.id);
    await this.refresh();
    this.toastService.show('Cliente removido.');
  }

  handleEdit(client: Cliente): void {
    const { id, ...data } = client;
    this.editingId = id;
    this.formData = {
      cnpj: data.cnpj,
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
    this.isModalOpen = false;
    this.editingId = null;
  }
}
