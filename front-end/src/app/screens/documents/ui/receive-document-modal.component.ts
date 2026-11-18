import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { LucideFileText, LucidePaperclip, LucideUploadCloud, LucideX } from '@lucide/angular';

import { ModalComponent } from '../../../core/components/ui/modal.component';
import { PrazoFieldsComponent } from '../../../core/components/ui/table.component';
import { paraBR } from '../../../core/domain/data';
import {
  ANOS,
  ANTECEDENCIA_PADRAO,
  CANAIS_ORIGEM_RECEBIMENTO,
  extensaoDe,
  FORMATOS_ACEITOS,
  MESES,
  TIPOS_DOCUMENTO,
} from '../../../core/domain/documento';
import type { Cliente, DocumentoEntrada } from '../../../core/domain/models';
import { ClientSelectComponent } from './client-select.component';

const inputClass =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700';

const formatSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

@Component({
  selector: 'app-receive-document-modal',
  standalone: true,
  imports: [ModalComponent, PrazoFieldsComponent, ClientSelectComponent, LucideFileText, LucidePaperclip, LucideUploadCloud, LucideX],
  template: `
    @if (open) {
      <app-modal [open]="open" (onClose)="onClose.emit()" title="Registrar recebimento">
        <form (submit)="$event.preventDefault()" class="p-6 space-y-5 bg-slate-50/50">
          <div>
            <p class="block text-sm font-semibold mb-1.5 text-slate-700">
              Cliente <span class="text-red-500">*</span>
            </p>
            <app-client-select
              id="recebimento-cliente"
              [clientes]="clientes"
              [value]="clienteId"
              (clienteChange)="clienteId = $event?.id ?? null"
              placeholder="Busque pelo nome do cliente..."
            ></app-client-select>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1.5 text-slate-700">
              Arquivo <span class="text-red-500">*</span>
            </label>

            @if (!file) {
              <div
                (click)="fileInput.click()"
                (dragover)="onDragOver($event)"
                (dragleave)="dragging = false"
                (drop)="onDrop($event)"
                role="button"
                tabindex="0"
                (keydown)="onDragKey($event)"
                class="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors"
                [class]="
                  dragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 bg-white hover:border-indigo-400'
                "
              >
                <svg lucideUploadCloud [size]="36" class="text-indigo-500"></svg>
                <p class="text-sm font-medium text-slate-600">
                  Arraste e solte o arquivo aqui ou clique para escolher
                </p>
                <p class="text-xs text-slate-400">Formatos aceitos: PDF, OFX, XML, XLSX, CSV, TXT</p>
              </div>
            } @else {
              <div class="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-2xl">
                <svg lucidePaperclip [size]="18" class="text-indigo-500 shrink-0"></svg>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-slate-700 truncate">{{ file.name }}</p>
                  <p class="text-xs text-slate-400">{{ formatSize(file.size) }}</p>
                </div>
                <button
                  type="button"
                  (click)="file = null"
                  aria-label="Remover arquivo"
                  class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg lucideX [size]="16"></svg>
                </button>
              </div>
            }

            <input
              #fileInput
              id="recebimento-arquivo"
              type="file"
              class="hidden"
              accept=".pdf,.ofx,.xml,.xlsx,.csv,.txt"
              (change)="handleFile(fileInput.files?.[0] ?? null)"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-semibold mb-1.5 text-slate-700">
                Tipo <span class="text-red-500">*</span>
              </label>
              <select
                class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
                [value]="tipo"
                (change)="tipo = $any($event.target).value"
              >
                <option value="">Selecione...</option>
                @for (t of tipos; track t.nome) {
                  <option [value]="t.nome">{{ t.nome }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-1.5 text-slate-700">
                Competência <span class="text-red-500">*</span>
              </label>
              <select
                class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
                [value]="competencia"
                (change)="competencia = $any($event.target).value"
              >
                @for (valor of competencias; track valor) {
                  <option [value]="valor">{{ valor }}</option>
                }
              </select>
            </div>
          </div>

          <app-prazo-fields
            [vencimento]="vencimento"
            [diasAntecedencia]="diasAntecedencia"
            (onVencimentoChange)="vencimento = $event"
            (onDiasAntecedenciaChange)="diasAntecedencia = $event"
          ></app-prazo-fields>

          <fieldset>
            <legend class="block text-sm font-semibold mb-2 text-slate-700">Canal de origem</legend>
            <div class="flex flex-wrap gap-4">
              @for (opcao of canais; track opcao) {
                <label
                  class="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer text-sm font-medium text-slate-700 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/50 transition-colors"
                >
                  <input
                    type="radio"
                    name="canal-origem"
                    [value]="opcao"
                    [checked]="canal === opcao"
                    (change)="canal = opcao"
                    class="accent-indigo-500"
                  />
                  {{ opcao }}
                </label>
              }
            </div>
          </fieldset>

          <div>
            <label class="block text-sm font-semibold mb-1.5 text-slate-700">
              Observação <span class="font-normal text-slate-400">(opcional)</span>
            </label>
            <textarea
              rows="3"
              class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
              placeholder="Ex.: cliente enviou pelo WhatsApp"
              [value]="observacao"
              (input)="observacao = $any($event.target).value"
            ></textarea>
          </div>

          @if (error) {
            <div class="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl" role="alert">
              <svg lucideFileText [size]="18" class="text-red-600 shrink-0 mt-0.5"></svg>
              <p class="text-sm font-medium text-red-700">{{ error }}</p>
            </div>
          }
        </form>

        <div modalFooter class="px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            (click)="onClose.emit()"
            class="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            (click)="handleSubmit()"
            class="px-6 py-2.5 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors text-sm"
          >
            Registrar recebimento
          </button>
        </div>
      </app-modal>
    }
  `,
})
export class ReceiveDocumentModalComponent implements OnChanges {
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

  readonly inputClass = inputClass;
  readonly formatSize = formatSize;
  readonly tipos = TIPOS_DOCUMENTO;
  readonly canais = CANAIS_ORIGEM_RECEBIMENTO;
  readonly competencias = ANOS.flatMap((ano) => MESES.map((mes) => `${mes}/${ano}`));

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open'] || !this.open) return;

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
