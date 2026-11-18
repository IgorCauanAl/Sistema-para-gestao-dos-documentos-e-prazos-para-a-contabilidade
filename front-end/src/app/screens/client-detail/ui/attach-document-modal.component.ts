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
import {
  LucideAlertTriangle,
  LucideFileText,
  LucideLock,
  LucidePaperclip,
  LucideUploadCloud,
  LucideX,
} from '@lucide/angular';

import { ModalComponent } from '../../../core/components/ui/modal.component';
import { PrazoFieldsComponent } from '../../../core/components/ui/table.component';
import { paraBR } from '../../../core/domain/data';
import {
  ANOS,
  ANTECEDENCIA_PADRAO,
  CANAIS_ENVIO,
  extensaoDe,
  FORMATOS_ACEITOS,
  MESES,
  TIPOS_DOCUMENTO,
} from '../../../core/domain/documento';
import type { Cliente, DocumentoNovo } from '../../../core/domain/models';
import { DocumentService } from '../../../core/services/document.service';
import { ClientSelectComponent } from '../../documents/ui/client-select.component';

const inputClass =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700';

const formatSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

@Component({
  selector: 'app-attach-document-modal',
  standalone: true,
  imports: [
    ModalComponent,
    PrazoFieldsComponent,
    ClientSelectComponent,
    LucideAlertTriangle,
    LucideFileText,
    LucideLock,
    LucidePaperclip,
    LucideUploadCloud,
    LucideX,
  ],
  template: `
    @if (open) {
      <app-modal [open]="open" (onClose)="onClose.emit()" title="Anexar document">
        <form (submit)="$event.preventDefault()" class="p-6 space-y-5 bg-slate-50/50">
          @if (comSelecaoDeCliente) {
            <div>
              <p class="block text-sm font-semibold mb-1.5 text-slate-700">
                Cliente <span class="text-red-500">*</span>
              </p>
              <app-client-select
                id="anexo-cliente"
                [clientes]="clientes ?? []"
                [value]="clienteId"
                (clienteChange)="selecionarCliente($event)"
                placeholder="Busque pelo nome do cliente..."
              ></app-client-select>
            </div>
          } @else {
            <div class="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl">
              <svg lucideLock [size]="16" class="text-slate-400 shrink-0"></svg>
              <span class="text-sm text-slate-500">
                Destinatário:
                <strong class="text-slate-700">{{ client?.razaoSocial }}</strong> — CNPJ {{ client?.cnpj }}
              </span>
            </div>
          }

          <div>
            <label class="block text-sm font-semibold mb-1.5 text-slate-700">Arquivo</label>

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
              id="arquivo-anexo"
              type="file"
              class="hidden"
              accept=".pdf,.ofx,.xml,.xlsx,.csv,.txt"
              (change)="handleFile(fileInput.files?.[0] ?? null)"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-semibold mb-1.5 text-slate-700">Tipo do document</label>
              <select
                required
                class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
                [value]="tipo"
                (change)="setTipo($any($event.target).value)"
              >
                <option value="">Selecione...</option>
                @for (opcao of tipos; track opcao.nome) {
                  <option [value]="opcao.nome">{{ opcao.nome }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-1.5 text-slate-700">Competência</label>
              <select
                required
                class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
                [value]="competencia"
                (change)="setCompetencia($any($event.target).value)"
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
            <legend class="block text-sm font-semibold mb-2 text-slate-700">Canal de envio</legend>
            <div class="flex gap-4">
              @for (opcao of canais; track opcao) {
                <label
                  class="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer text-sm font-medium text-slate-700 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/50 transition-colors"
                >
                  <input
                    type="radio"
                    name="canal"
                    [value]="opcao"
                    [checked]="canal === opcao"
                    (change)="canal = opcao"
                    class="accent-indigo-500"
                  />
                  {{ opcao }}
                  @if (clienteAtual?.canalPreferido === opcao) {
                    <span class="text-xs text-indigo-500">(preferido)</span>
                  }
                </label>
              }
            </div>
          </fieldset>

          @if (nextVersion) {
            <div class="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
              <svg lucideAlertTriangle [size]="18" class="text-amber-600 shrink-0 mt-0.5"></svg>
              <p class="text-sm font-medium text-amber-800">
                Já existe este document nesta competência. Será criada a versão v{{ nextVersion }} e a anterior
                ficará no histórico de versões.
              </p>
            </div>
          }

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
            (click)="handleSubmit(false)"
            class="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
          >
            Salvar como rascunho
          </button>
          <button
            type="button"
            (click)="handleSubmit(true)"
            class="px-6 py-2.5 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors text-sm flex items-center gap-2"
          >
            Salvar e enviar
          </button>
        </div>
      </app-modal>
    }
  `,
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
  tipo = '';
  competencia = '10/2026';
  vencimento = '';
  diasAntecedencia = ANTECEDENCIA_PADRAO;
  canal = 'WhatsApp';
  error = '';
  dragging = false;
  nextVersion: number | null = null;

  readonly canais = CANAIS_ENVIO;
  readonly competencias = ANOS.flatMap((ano) => MESES.map((mes) => `${mes}/${ano}`));
  readonly tipos = TIPOS_DOCUMENTO.filter((t) => t.nome !== 'Guia DAS');
  readonly formatSize = formatSize;

  constructor(private documentService: DocumentService) {}

  get comSelecaoDeCliente(): boolean {
    return Array.isArray(this.clientes);
  }

  get clienteAtual(): Cliente | null {
    return this.comSelecaoDeCliente
      ? (this.clientes ?? []).find((c) => c.id === this.clienteId) ?? null
      : this.client;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open'] || !this.open) return;

    this.file = null;
    this.error = '';
    this.dragging = false;
    this.tipo = this.prefill?.tipo ?? '';
    this.competencia = this.prefill?.competencia ?? '10/2026';
    this.vencimento = '';
    this.diasAntecedencia = ANTECEDENCIA_PADRAO;
    this.canal = (this.comSelecaoDeCliente ? null : this.client?.canalPreferido) ?? 'WhatsApp';
    this.clienteId = this.comSelecaoDeCliente ? null : (this.client?.id ?? null);
    this.nextVersion = null;
  }

  selecionarCliente(cliente: Cliente | null): void {
    this.clienteId = cliente?.id ?? null;
    this.atualizarVersao();
  }

  setTipo(tipo: string): void {
    this.tipo = tipo;
    this.atualizarVersao();
  }

  setCompetencia(competencia: string): void {
    this.competencia = competencia;
    this.atualizarVersao();
  }

  private atualizarVersao(): void {
    const cliente = this.clienteAtual;
    if (!this.open || !cliente || !this.tipo || !this.competencia) {
      this.nextVersion = null;
      return;
    }

    this.documentService
      .findByTipoCompetencia(cliente.id, this.tipo, this.competencia)
      .then((existente) => (this.nextVersion = existente ? existente.versao + 1 : null));
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

  handleSubmit(enviarAgora: boolean): void {
    const cliente = this.clienteAtual;

    if (this.comSelecaoDeCliente && !cliente) {
      this.error = 'Selecione o cliente para anexar o document.';
      return;
    }

    if (!this.file) {
      this.error = 'Selecione um arquivo para anexar.';
      return;
    }

    if (!cliente) return;

    this.onSubmit.emit({
      clienteId: cliente.id,
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
