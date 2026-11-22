import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideSearch } from '@lucide/angular';

import type { Cliente } from '../../../../core/domain/models';

@Component({
  selector: 'app-client-select',
  standalone: true,
  imports: [LucideCheck, LucideChevronDown, LucideSearch],
  templateUrl: './client-select.component.html',
  styleUrl: './client-select.component.css',
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
