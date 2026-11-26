import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  LucideBuilding2,
  LucideFileText,
  LucideMail,
  LucideMessageCircle,
  LucideUploadCloud,
  LucideX,
} from '@lucide/angular';
import { Subscription } from 'rxjs';

import { ProgressBarComponent } from '../../../../core/components/ui/progress-bar/progress-bar.component';
import { PrazoFieldsComponent } from '../../../../core/components/ui/prazo-fields/prazo-fields.component';
import { formatCnpj } from '../../../../core/domain/cnpj';
import { paraBR } from '../../../../core/domain/data';
import {
  ANOS,
  ANTECEDENCIA_PADRAO,
  CANAIS_ENVIO,
  extensaoDe,
  FORMATOS_ACEITOS,
  MESES,
  TIPOS_DOCUMENTO,
} from '../../../../core/domain/documento';
import type { Cliente, DocumentoNovo } from '../../../../core/domain/models';
import { DocumentService } from '../../../../core/services/document.service';
import { NotificationService } from '../../../../core/services/notification.service';
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
    ProgressBarComponent,
    ClientSelectComponent,
    LucideBuilding2,
    LucideFileText,
    LucideMail,
    LucideMessageCircle,
    LucideUploadCloud,
    LucideX,
  ],
  templateUrl: './attach-document-modal.component.html',
  styleUrl: './attach-document-modal.component.css',
})
export class AttachDocumentModalComponent implements OnChanges, OnDestroy {
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
  uploadErro = '';
  progress = 0;
  dragging = false;
  saving = false;

  readonly canais = CANAIS_ENVIO;
  readonly competencias = ANOS.flatMap((ano) => MESES.map((mes) => `${mes}/${ano}`));
  readonly tiposDocument = TIPOS_DOCUMENTO.map((t) => t.nome);
  readonly formatCnpj = formatCnpj;
  readonly formatSize = formatSize;

  private uploadSub?: Subscription;

  constructor(
    private readonly notification: NotificationService,
    private readonly documentService: DocumentService
  ) {}

  get comSelecaoDeCliente(): boolean {
    return Array.isArray(this.clientes);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open']) return;

    this.uploadSub?.unsubscribe();
    this.uploadSub = undefined;
    this.saving = false;
    this.progress = 0;
    this.uploadErro = '';

    if (!this.open) return;

    this.uploadSub = this.documentService.uploadState$.subscribe((state) => {
      this.saving = state.active;
      this.progress = state.progress;
      this.uploadErro = state.error ?? '';
    });

    this.file = null;
    this.erro = '';
    this.dragging = false;
    this.tipo = this.prefill?.tipo ?? this.tiposDocument[0] ?? '';
    this.competencia = this.prefill?.competencia ?? '10/2026';
    this.vencimento = '';
    this.diasAntecedencia = ANTECEDENCIA_PADRAO;
    this.canal = (this.client?.canalPreferido as 'WhatsApp' | 'E-mail' | 'Ambos') || 'WhatsApp';
    this.clienteId = this.comSelecaoDeCliente ? null : (this.client?.id ?? null);
  }

  ngOnDestroy(): void {
    this.uploadSub?.unsubscribe();
  }

  cancelarUpload(): void {
    this.documentService.cancelUpload();
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
      this.notification.error(this.erro);
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

  async handleSubmit(enviarAgora: boolean, event?: Event): Promise<void> {
    event?.preventDefault();
    if (this.saving) return;

    const cliente = this.comSelecaoDeCliente
      ? (this.clientes ?? []).find((c) => c.id === this.clienteId) ?? null
      : this.client;

    if (this.comSelecaoDeCliente && !cliente) {
      this.erro = 'Selecione o cliente para anexar o documento.';
      this.notification.error(this.erro);
      return;
    }
    if (!this.file) {
      this.erro = 'Selecione um arquivo para anexar.';
      this.notification.error(this.erro);
      return;
    }
    if (!cliente) return;

    if (enviarAgora) {
      const confirmado = await this.notification.confirm({
        title: 'Enviar documento agora?',
        message: `Confirmar envio do documento "${this.file.name}" para ${cliente.razaoSocial}?`,
        confirmLabel: 'Enviar agora',
        cancelLabel: 'Cancelar',
        danger: false,
      });
      if (!confirmado) {
        this.notification.info('Envio do documento cancelado.');
        return;
      }
    }

    this.erro = '';
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
  }
}
