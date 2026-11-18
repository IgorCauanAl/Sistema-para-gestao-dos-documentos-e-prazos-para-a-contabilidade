import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideSearch } from '@lucide/angular';

import type { Cliente } from '../../../core/domain/models';

@Component({
  selector: 'app-client-select',
  standalone: true,
  imports: [LucideCheck, LucideChevronDown, LucideSearch],
  template: `
    <div class="relative min-w-[210px]">
      @if (label) {
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">{{ label }}</label>
      }
      <div class="relative">
        <svg
          lucideSearch
          [size]="15"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        ></svg>
        <input
          [id]="id"
          type="text"
          role="combobox"
          [attr.aria-expanded]="open"
          aria-autocomplete="list"
          autoComplete="off"
          class="w-full px-3 py-2.5 pl-9 pr-8 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          [placeholder]="placeholder"
          [value]="query"
          (input)="handleChange($any($event.target).value)"
          (focus)="open = true"
          (blur)="fechar()"
        />
        <svg
          lucideChevronDown
          [size]="15"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        ></svg>
      </div>

      @if (sugestoes.length > 0) {
        <ul
          role="listbox"
          class="absolute z-30 mt-1.5 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg py-1"
        >
          @for (cliente of sugestoes; track cliente.id) {
            <li role="option" [attr.aria-selected]="cliente.id === value">
              <button
                type="button"
                tabindex="-1"
                (mousedown)="$event.preventDefault()"
                (click)="selecionar(cliente)"
                class="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 flex items-center justify-between gap-2"
              >
                <span class="truncate">{{ cliente.razaoSocial }}</span>
                @if (cliente.id === value) {
                  <svg lucideCheck [size]="14" class="text-indigo-500 shrink-0"></svg>
                }
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class ClientSelectComponent implements OnChanges, OnDestroy {
  @Input() clientes: Cliente[] = [];
  @Input() value: number | null = null;
  @Input() id = '';
  @Input() placeholder = 'Buscar cliente...';
  @Input() label = '';
  @Output() clienteChange = new EventEmitter<Cliente | null>();

  query = '';
  open = false;
  private blurTimer?: ReturnType<typeof setTimeout>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] || changes['clientes']) {
      this.query = this.selecionado?.razaoSocial ?? '';
    }
  }

  ngOnDestroy(): void {
    if (this.blurTimer) clearTimeout(this.blurTimer);
  }

  get selecionado(): Cliente | null {
    return this.clientes.find((c) => c.id === this.value) ?? null;
  }

  get sugestoes(): Cliente[] {
    const termo = this.query.trim().toLowerCase();
    const selecionadoEstaDigitado = Boolean(this.selecionado && this.query === this.selecionado.razaoSocial);
    return this.open && termo && !selecionadoEstaDigitado
      ? this.clientes.filter((c) => c.razaoSocial.toLowerCase().includes(termo)).slice(0, 6)
      : [];
  }

  handleChange(valor: string): void {
    this.query = valor;
    this.open = true;
    if (this.selecionado && valor !== this.selecionado.razaoSocial) this.clienteChange.emit(null);
  }

  selecionar(cliente: Cliente): void {
    this.clienteChange.emit(cliente);
    this.query = cliente.razaoSocial;
    this.open = false;
  }

  fechar(): void {
    this.blurTimer = setTimeout(() => (this.open = false), 120);
  }
}
