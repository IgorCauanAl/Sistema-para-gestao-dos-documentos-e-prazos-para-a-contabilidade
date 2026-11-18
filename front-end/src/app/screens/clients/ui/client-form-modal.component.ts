import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideBuilding2, LucideFileText, LucideMail, LucideMapPin, LucideUser, LucideX } from '@lucide/angular';

import type { Cliente } from '../../../core/domain/models';

export type ClienteForm = Pick<Cliente, 'cnpj' | 'razaoSocial' | 'responsavel' | 'email' | 'endereco'>;

@Component({
  selector: 'app-client-form-modal',
  standalone: true,
  imports: [LucideBuilding2, LucideFileText, LucideMail, LucideMapPin, LucideUser, LucideX],
  template: `
    @if (open) {
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div
          class="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        >
          <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
            <h2 class="text-xl font-bold text-slate-800">{{ title }}</h2>
            <button
              (click)="onClose.emit()"
              class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
            >
              <svg lucideX [size]="20"></svg>
            </button>
          </div>

          <div class="p-6 overflow-y-auto bg-slate-50/50">
            <form id="clientForm" (submit)="submit($event)" class="space-y-5">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div class="col-span-1">
                  <label class="block text-sm font-semibold mb-1.5 text-slate-700">CNPJ</label>
                  <div class="relative">
                    <svg
                      lucideFileText
                      [size]="18"
                      class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    ></svg>
                    <input
                      type="text"
                      name="cnpj"
                      required
                      placeholder="00.000.000/0000-00"
                      [value]="formData.cnpj"
                      (input)="update('cnpj', $event)"
                      class="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-semibold mb-1.5 text-slate-700">Razão Social</label>
                  <div class="relative">
                    <svg
                      lucideBuilding2
                      [size]="18"
                      class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    ></svg>
                    <input
                      type="text"
                      name="razaoSocial"
                      required
                      placeholder="Nome da Empresa LTDA"
                      [value]="formData.razaoSocial"
                      (input)="update('razaoSocial', $event)"
                      class="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label class="block text-sm font-semibold mb-1.5 text-slate-700">Responsável</label>
                  <div class="relative">
                    <svg
                      lucideUser
                      [size]="18"
                      class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    ></svg>
                    <input
                      type="text"
                      name="responsavel"
                      required
                      placeholder="Nome do contato principal"
                      [value]="formData.responsavel"
                      (input)="update('responsavel', $event)"
                      class="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-1.5 text-slate-700">E-mail corporativo</label>
                  <div class="relative">
                    <svg
                      lucideMail
                      [size]="18"
                      class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    ></svg>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="contato@empresa.com.br"
                      [value]="formData.email"
                      (input)="update('email', $event)"
                      class="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold mb-1.5 text-slate-700">Endereço Completo</label>
                <div class="relative">
                  <svg
                    lucideMapPin
                    [size]="18"
                    class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                  ></svg>
                  <input
                    type="text"
                    name="endereco"
                    required
                    placeholder="Logradouro, Número, Bairro, Cidade - UF"
                    [value]="formData.endereco"
                    (input)="update('endereco', $event)"
                    class="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>
            </form>
          </div>

          <div class="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
            <button
              type="button"
              (click)="onClose.emit()"
              class="px-5 py-2.5 rounded-full text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="clientForm"
              class="px-6 py-2.5 rounded-full text-white font-medium hover:opacity-90 transition-opacity bg-[#15803D] text-sm flex items-center gap-2"
            >
              Salvar Cliente
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ClientFormModalComponent {
  @Input() open = false;
  @Input() title = 'Cadastrar Novo Cliente';
  @Input() formData: ClienteForm = emptyClienteForm();
  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<void>();
  @Output() formDataChange = new EventEmitter<ClienteForm>();

  update(field: keyof ClienteForm, event: Event): void {
    this.formData = { ...this.formData, [field]: (event.target as HTMLInputElement).value };
    this.formDataChange.emit(this.formData);
  }

  submit(event: Event): void {
    event.preventDefault();
    this.onSubmit.emit();
  }
}

export function emptyClienteForm(): ClienteForm {
  return { cnpj: '', razaoSocial: '', responsavel: '', email: '', endereco: '' };
}
