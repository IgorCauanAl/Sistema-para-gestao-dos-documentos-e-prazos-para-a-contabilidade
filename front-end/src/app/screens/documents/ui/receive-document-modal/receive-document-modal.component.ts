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
import { LucideFileText, LucidePaperclip, LucideUploadCloud, LucideX } from '@lucide/angular';
import { Subscription } from 'rxjs';

import { ModalComponent } from '../../../../core/components/ui/modal/modal.component';
import { ProgressBarComponent } from '../../../../core/components/ui/progress-bar/progress-bar.component';
import { PrazoFieldsComponent } from '../../../../core/components/ui/prazo-fields/prazo-fields.component';
import { paraBR } from '../../../../core/domain/data';
import {
  ANOS,
  ANTECEDENCIA_PADRAO,
  CANAIS_ORIGEM_RECEBIMENTO,
  extensaoDe,
  FORMATOS_ACEITOS,
  MESES,
  TIPOS_DOCUMENTO,
} from '../../../../core/domain/documento';
import type { Cliente, DocumentoEntrada } from '../../../../core/domain/models';
import { DocumentService } from '../../../../core/services/document.service';
import { ClientSelectComponent } from '../client-select/client-select.component';

const inputClass =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700';

const formatSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

@Component({
  selector: 'app-receive-document-modal',
  standalone: true,
  imports: [ModalComponent, PrazoFieldsComponent, ProgressBarComponent, ClientSelectComponent, LucideFileText, LucidePaperclip, LucideUploadCloud, LucideX],
  templateUrl: './receive-document-modal.component.html',
  styleUrl: './receive-document-modal.component.css',
})
export class ReceiveDocumentModalComponent implements OnChanges, OnDestroy {
  @Input() open = false;
  @Input() clientes: Cliente[] = [];
  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<DocumentoEntrada>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  clienteId: number | null = null;
  file: File | null = null;
  tipo = '';
  competencia = '10/2026';
  vencimento = '';
  diasAntecedencia = ANTECEDENCIA_PADRAO;
  canal = 'WhatsApp';
  observacao = '';
  dragging = false;
  error = '';
  saving = false;
  progress = 0;
  uploadErro = '';

  private uploadSub?: Subscription;

  constructor(private readonly documentService: DocumentService) {}

  readonly inputClass = inputClass;
  readonly formatSize = formatSize;
  readonly tipos = TIPOS_DOCUMENTO;
  readonly canais = CANAIS_ORIGEM_RECEBIMENTO;
  readonly competencias = ANOS.flatMap((ano) => MESES.map((mes) => `${mes}/${ano}`));

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

    this.clienteId = null;
    this.file = null;
    this.tipo = '';
    this.competencia = '10/2026';
    this.vencimento = '';
    this.diasAntecedencia = ANTECEDENCIA_PADRAO;
    this.canal = 'WhatsApp';
    this.observacao = '';
    this.dragging = false;
    this.error = '';
  }

  ngOnDestroy(): void {
    this.uploadSub?.unsubscribe();
  }

  cancelarUpload(): void {
    this.documentService.cancelUpload();
  }

  handleFile(selected: File | null): void {
    if (!selected) return;

    const ext = extensaoDe(selected.name);
    if (!(FORMATOS_ACEITOS as readonly string[]).includes(ext)) {
      this.file = null;
      this.error = `Formato ".${ext}" não suportado. Envie um dos formatos: ${FORMATOS_ACEITOS.map((f) =>
        f.toUpperCase()
      ).join(', ')}.`;
      return;
    }

    this.error = '';
    this.file = selected;
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

  handleSubmit(): void {
    if (!this.clienteId) {
      this.error = 'Selecione o cliente que enviou o documento.';
      return;
    }
    if (!this.file) {
      this.error = 'Selecione o arquivo recebido.';
      return;
    }
    if (!this.tipo) {
      this.error = 'Selecione o tipo do documento.';
      return;
    }

    this.error = '';
    this.onSubmit.emit({
      clienteId: this.clienteId,
      file: this.file,
      tipo: this.tipo,
      competencia: this.competencia,
      canal: this.canal === 'Outro' ? 'Manual' : this.canal,
      vencimento: this.vencimento ? paraBR(this.vencimento) : null,
      diasAntecedencia: this.diasAntecedencia,
      formato: extensaoDe(this.file.name),
      tamanho: formatSize(this.file.size),
      observacao: this.observacao.trim(),
    });
  }
}
