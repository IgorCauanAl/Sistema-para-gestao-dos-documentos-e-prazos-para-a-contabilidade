import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideBuilding2, LucidePencil, LucidePlus } from '@lucide/angular';

import type { Cliente } from '../../../core/domain/models';

@Component({
  selector: 'app-client-profile-header',
  standalone: true,
  imports: [RouterLink, LucideArrowLeft, LucideBuilding2, LucidePencil, LucidePlus],
  template: `
    <div>
      <a
        routerLink="/clientes"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-4"
      >
        <svg lucideArrowLeft [size]="16"></svg> Clientes
      </a>

      <div
        class="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-6 flex flex-col lg:flex-row lg:items-center gap-6"
      >
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <div
            class="w-14 h-14 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-500 shrink-0"
          >
            <svg lucideBuilding2 [size]="26"></svg>
          </div>

          <div class="min-w-0">
            <h1 class="text-2xl font-bold text-slate-800 tracking-tight truncate">{{ client.razaoSocial }}</h1>
            <div class="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2">
              <span class="text-sm text-slate-500">CNPJ {{ client.cnpj }}</span>
              <span class="text-sm text-slate-500">Responsável: {{ client.responsavel }}</span>
              <span class="text-sm text-slate-500">{{ client.email }}</span>
              @if (client.whatsapp) {
                <span class="text-sm text-slate-500">WhatsApp: {{ client.whatsapp }}</span>
              }
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border"
                [class]="canalBadge"
              >
                Canal preferido: {{ client.canalPreferido }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <button
            type="button"
            (click)="onEdit.emit()"
            class="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <svg lucidePencil [size]="16"></svg> Editar
          </button>
          <button
            type="button"
            (click)="onAttach.emit()"
            class="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-full text-sm font-medium shadow-sm hover:bg-indigo-600 transition-colors"
          >
            <svg lucidePlus [size]="18"></svg> Anexar documento
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ClientProfileHeaderComponent {
  @Input() client!: Cliente;
  @Output() onEdit = new EventEmitter<void>();
  @Output() onAttach = new EventEmitter<void>();

  get canalBadge(): string {
    return this.client.canalPreferido === 'WhatsApp'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-indigo-50 text-indigo-600 border-indigo-200';
  }
}
