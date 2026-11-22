import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { LucideAlertTriangle, LucideArrowDown, LucideArrowUp, LucideFileText } from '@lucide/angular';

import { ModalComponent } from '../../../../core/components/ui/modal/modal.component';
import type { Documento } from '../../../../core/domain/models';

export interface MergePdfPayload {
  nome: string;
  fontes: string[];
}

@Component({
  selector: 'app-merge-pdf-modal',
  standalone: true,
  imports: [ModalComponent, LucideAlertTriangle, LucideArrowDown, LucideArrowUp, LucideFileText],
  templateUrl: './merge-pdf-modal.component.html',
  styleUrl: './merge-pdf-modal.component.css',
})
export class MergePdfModalComponent implements OnChanges {
  @Input() open = false;
  @Input() documentos: Documento[] = [];
  @Input() nomeCliente: (clienteId: number) => string = () => '—';
  @Output() onClose = new EventEmitter<void>();
  @Output() onMerge = new EventEmitter<MergePdfPayload>();

  ordem: number[] = [];
  nomeFinal = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open'] || !this.open) return;

    this.ordem = this.documentos.map((doc) => doc.id);
    this.nomeFinal = 'Documentos consolidados';
  }

  get docsOrdenados(): Documento[] {
    return this.ordem
      .map((id) => this.documentos.find((doc) => doc.id === id))
      .filter((doc): doc is Documento => Boolean(doc));
  }

  get clienteUnico(): string {
    const primeiro = this.documentos[0];
    return primeiro ? this.nomeCliente(primeiro.clienteId) : '—';
  }

  mover(index: number, direcao: number): void {
    const alvo = index + direcao;
    if (alvo < 0 || alvo >= this.ordem.length) return;

    const copia = [...this.ordem];
    [copia[index], copia[alvo]] = [copia[alvo], copia[index]];
    this.ordem = copia;
  }

  handleSubmit(): void {
    const nome = this.nomeFinal.trim() || 'Documentos consolidados';
    this.onMerge.emit({ nome, fontes: this.ordem.map((id) => String(id)) });
  }
}
