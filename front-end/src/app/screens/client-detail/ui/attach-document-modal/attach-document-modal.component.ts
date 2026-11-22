import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { LucideBuilding2, LucideFileText, LucideUploadCloud, LucideX } from '@lucide/angular';

import { PrazoFieldsComponent } from '../../../../core/components/ui/prazo-fields/prazo-fields.component';
import { formatCnpj } from '../../../../core/domain/cnpj';
import { paraBR } from '../../../../core/domain/data';
import {
  ANTECEDENCIA_PADRAO,
  CANAIS_ENVIO,
  extensaoDe,
  FORMATOS_ACEITOS,
  TIPOS_DOCUMENTO,
} from '../../../../core/domain/documento';
import type { Cliente, DocumentoNovo } from '../../../../core/domain/models';
import { ToastService } from '../../../../core/services/toast.service';
import { ClientSelectComponent } from '../../../documents/ui/client-select/client-select.component';

const formatSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

@Component({
  selector: 'app-attach-document-modal',
  standalone: true,
  imports: [
    PrazoFieldsComponent,
    ClientSelectComponent,
    LucideBuilding2,
    LucideFileText,
    LucideUploadCloud,
    LucideX,
  ],
  templateUrl: './attach-document-modal.component.html',
  styleUrl: './attach-document-modal.component.css',
})
export class AttachDocumentModalComponent implements OnChanges {
  @Input() open = false;
  @Input() client: Cliente | null = null;
  @Input() clientes: Cliente[] | null = null;
  @Input() prefill: { tipo?: string; competencia?: string } | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<DocumentoNovo>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  clienteId: number | null = null;
  file: File | null = null;
  tipo: string = TIPOS_DOCUMENTO[0]?.nome ?? '';
  competencia = '10/2026';
  vencimento = '';
  diasAntecedencia = ANTECEDENCIA_PADRAO;
  canal = 'WhatsApp';
  erro = '';
  dragging = false;
  saving = false;

  readonly canais = CANAIS_ENVIO;
  readonly tiposDocument = TIPOS_DOCUMENTO.map((t) => t.nome);
  readonly formatCnpj = formatCnpj;
  readonly formatSize = formatSize;

  constructor(private toastService: ToastService) {}

  get comSelecaoDeCliente(): boolean {
    return Array.isArray(this.clientes);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open'] || !this.open) return;
    this.file = null;
    this.erro = '';
    this.dragging = false;
    this.saving = false;
    this.tipo = this.prefill?.tipo ?? this.tiposDocument[0] ?? '';
    this.competencia = this.prefill?.competencia ?? '10/2026';
    this.vencimento = '';
    this.diasAntecedencia = ANTECEDENCIA_PADRAO;
    this.canal = (this.client?.canalPreferido as 'WhatsApp' | 'E-mail' | 'Ambos') || 'WhatsApp';
    this.clienteId = this.comSelecaoDeCliente ? null : (this.client?.id ?? null);
  }

  selecionarCliente(cliente: Cliente | null): void {
    this.clienteId = cliente?.id ?? null;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.handleFile(input.files?.[0] ?? null);
    input.value = '';
  }

  handleFile(selected: File | null): void {
    if (!selected) return;
    const ext = extensaoDe(selected.name);
    if (!(FORMATOS_ACEITOS as readonly string[]).includes(ext)) {
      this.file = null;
      this.erro = `Formato ".${ext}" não suportado. Use: ${FORMATOS_ACEITOS.map((f) => f.toUpperCase()).join(', ')}.`;
      this.toastService.show(this.erro, 'error');
      return;
    }
    this.erro = '';
    this.file = selected;
  }

  clearFile(): void {
    this.file = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging = true;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
    this.handleFile(event.dataTransfer?.files?.[0] ?? null);
  }

  onDragKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') this.fileInput.nativeElement.click();
  }

  fechar(): void {
    if (this.saving) return;
    this.onClose.emit();
  }

  handleSubmit(enviarAgora: boolean, event?: Event): void {
    event?.preventDefault();
    if (this.saving) return;

    const cliente = this.comSelecaoDeCliente
      ? (this.clientes ?? []).find((c) => c.id === this.clienteId) ?? null
      : this.client;

    if (this.comSelecaoDeCliente && !cliente) {
      this.erro = 'Selecione o cliente para anexar o documento.';
      this.toastService.show(this.erro, 'error');
      return;
    }
    if (!this.file) {
      this.erro = 'Selecione um arquivo para anexar.';
      this.toastService.show(this.erro, 'error');
      return;
    }
    if (!cliente) return;

    if (enviarAgora && !confirm(`Confirmar envio do documento "${this.file.name}" para ${cliente.razaoSocial}?`)) {
      this.toastService.show('Envio do documento cancelado.', 'info');
      return;
    }

    this.erro = '';
    this.saving = true;
    this.onSubmit.emit({
      clienteId: cliente.id,
      file: this.file,
      tipo: this.tipo,
      competencia: this.competencia,
      canal: this.canal,
      vencimento: this.vencimento ? paraBR(this.vencimento) : null,
      diasAntecedencia: this.diasAntecedencia,
      formato: extensaoDe(this.file.name),
      tamanho: formatSize(this.file.size),
      enviarAgora,
    });
    // parent controls close; reset saving on next open/change. Also release after emit in case parent keeps open.
    setTimeout(() => (this.saving = false), 300);
  }
}
