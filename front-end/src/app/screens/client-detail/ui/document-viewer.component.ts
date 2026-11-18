import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  LucideAward,
  LucideCheck,
  LucideChevronLeft,
  LucideChevronRight,
  LucideCopy,
  LucideDownload,
  LucidePlus,
  LucideSend,
  LucideX,
  LucideZoomIn,
  LucideZoomOut,
} from '@lucide/angular';

import { FileIconComponent } from '../../../core/components/ui/file-icon.component';
import { StatusBadgeComponent } from '../../../core/components/ui/status-badge.component';
import { TimelineComponent, type TimelineItem } from '../../../core/components/ui/timeline.component';
import type { DocumentoEvento } from '../../../core/domain/models';

export interface ViewerDocument {
  id: number | string;
  nome: string;
  formato: string;
  versao: number;
  competencia: string;
  tamanho: string;
  status: string;
  hash: string;
  direcao?: string;
  historico: DocumentoEvento[];
}

const protocolStepsSaida = [
  { etapa: 'CRIADO', titulo: 'Criado' },
  { etapa: 'ENVIADO', titulo: 'Enviado' },
  { etapa: 'VISUALIZADO', titulo: 'Visualizado' },
  { etapa: 'BAIXADO', titulo: 'Baixado' },
];

const protocolStepsEntrada = [
  { etapa: 'CRIADO', titulo: 'Registrado' },
  { etapa: 'RECEBIDO', titulo: 'Recebido do cliente' },
  { etapa: 'VISUALIZADO', titulo: 'Visualizado' },
  { etapa: 'BAIXADO', titulo: 'Baixado' },
];

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [
    FileIconComponent,
    StatusBadgeComponent,
    TimelineComponent,
    LucideAward,
    LucideCheck,
    LucideChevronLeft,
    LucideChevronRight,
    LucideCopy,
    LucideDownload,
    LucidePlus,
    LucideSend,
    LucideX,
    LucideZoomIn,
    LucideZoomOut,
  ],
  template: `
    @if (open && documento) {
      <div
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end"
        (mousedown)="onBackdrop($event)"
        role="presentation"
      >
        <div
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="'Visualizar ' + documento.nome"
          class="bg-white w-full max-w-6xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
        >
          <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
            <div class="flex items-center gap-3 min-w-0">
              <app-file-icon [formato]="documento.formato"></app-file-icon>
              <div class="min-w-0">
                <p class="text-base font-bold text-slate-800 truncate">
                  {{ documento.nome }} · v{{ documento.versao }} · {{ documento.competencia }}
                </p>
                <p class="text-xs text-slate-400 truncate">
                  {{ documento.tamanho }} · {{ documento.formato.toUpperCase() }}
                </p>
              </div>
            </div>
            <button
              type="button"
              (click)="onClose.emit()"
              aria-label="Fechar visualização"
              class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
            >
              <svg lucideX [size]="20"></svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto">
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
              <div class="lg:col-span-3 space-y-4">
                @if (isPdf) {
                  <div class="bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden">
                    <div class="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
                      <div class="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Página anterior"
                          [disabled]="page <= 1"
                          (click)="page = Math.max(1, page - 1)"
                          class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                        >
                          <svg lucideChevronLeft [size]="16"></svg>
                        </button>
                        <span class="text-xs font-medium text-slate-600">Página {{ page }} de 1</span>
                        <button
                          type="button"
                          aria-label="Próxima página"
                          disabled
                          class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                        >
                          <svg lucideChevronRight [size]="16"></svg>
                        </button>
                      </div>

                      <div class="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Diminuir zoom"
                          (click)="zoom = Math.max(50, zoom - 10)"
                          class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                        >
                          <svg lucideZoomOut [size]="16"></svg>
                        </button>
                        <span class="text-xs font-medium text-slate-600 w-10 text-center">{{ zoom }}%</span>
                        <button
                          type="button"
                          aria-label="Aumentar zoom"
                          (click)="zoom = Math.min(200, zoom + 10)"
                          class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                        >
                          <svg lucideZoomIn [size]="16"></svg>
                        </button>
                      </div>
                    </div>

                    <div class="p-6 flex justify-center overflow-auto max-h-[60vh]">
                      <div
                        class="bg-white shadow-md border border-slate-200 w-full max-w-[520px] aspect-[1/1.414] p-8 space-y-3 transition-transform"
                        [style.transform]="'scale(' + zoom / 100 + ')'"
                        aria-label="Pré-visualização simulada da página do PDF"
                      >
                        <div class="h-6 w-2/5 bg-slate-200 rounded"></div>
                        <div class="h-3 w-full bg-slate-100 rounded"></div>
                        <div class="h-3 w-11/12 bg-slate-100 rounded"></div>
                        <div class="h-3 w-4/5 bg-slate-100 rounded"></div>
                        <div class="h-32 w-full bg-slate-50 border border-slate-200 rounded-xl mt-6"></div>
                        <div class="h-3 w-full bg-slate-100 rounded"></div>
                        <div class="h-3 w-10/12 bg-slate-100 rounded"></div>
                        <p class="text-[10px] text-slate-300 pt-6 text-center">
                          Pré-visualização simulada — conteúdo real disponível após integração com o backend.
                        </p>
                      </div>
                    </div>
                  </div>
                } @else {
                  <div
                    class="bg-slate-50 rounded-3xl border border-slate-200 p-10 flex flex-col items-center justify-center gap-4 text-center min-h-[320px]"
                  >
                    <app-file-icon [formato]="documento.formato" [size]="40"></app-file-icon>
                    <div>
                      <p class="text-lg font-bold text-slate-700">{{ documento.nome }}</p>
                      <p class="text-sm text-slate-500 mt-1">
                        {{ documento.formato.toUpperCase() }} · {{ documento.tamanho }}
                      </p>
                    </div>
                    @if (showActions) {
                      <button
                        type="button"
                        (click)="onDownload.emit()"
                        class="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white rounded-full text-sm font-medium hover:bg-indigo-600 transition-colors"
                      >
                        <svg lucideDownload [size]="16"></svg> Baixar
                      </button>
                    }
                  </div>
                }
              </div>

              <div class="lg:col-span-2 space-y-6">
                <div class="flex flex-wrap items-center gap-3">
                  <h3 class="text-lg font-bold text-slate-800">
                    {{ documento.nome }} · v{{ documento.versao }} · {{ documento.competencia }}
                  </h3>
                  <app-status-badge [status]="documento.status"></app-status-badge>
                </div>

                <div class="bg-slate-50 rounded-2xl border border-slate-100 p-4">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Hash do arquivo (SHA-256)
                  </p>
                  <div class="flex items-center gap-2">
                    <code class="text-xs text-slate-600 font-mono break-all flex-1">
                      {{ documento.hash.slice(0, 24) }}…{{ documento.hash.slice(-8) }}
                    </code>
                    <button
                      type="button"
                      (click)="copyHash()"
                      aria-label="Copiar hash do arquivo"
                      class="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
                    >
                      @if (copied) {
                        <svg lucideCheck [size]="16" class="text-green-600"></svg>
                      } @else {
                        <svg lucideCopy [size]="16"></svg>
                      }
                    </button>
                  </div>
                </div>

                <div>
                  <h4 class="text-sm font-bold text-slate-700 mb-4">Protocolo de entrega</h4>
                  <app-timeline [items]="timelineItems"></app-timeline>
                </div>

                <div>
                  <h4 class="text-sm font-bold text-slate-700 mb-3">Versões</h4>
                  <div class="space-y-2">
                    @for (version of versions; track version.id) {
                      <button
                        type="button"
                        (click)="onSelectVersion.emit(version)"
                        class="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-colors"
                        [class]="
                          version.id === currentVersion?.id
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        "
                      >
                        <span>
                          v{{ version.versao }}
                          @if (version.id === currentVersion?.id) {
                            · vigente
                          }
                        </span>
                        <span class="text-xs text-slate-400">{{ dataCriado(version) }}</span>
                      </button>
                    }
                  </div>
                </div>

                @if (showActions) {
                  <div class="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      (click)="onResend.emit()"
                      class="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
                    >
                      <svg lucideSend [size]="15"></svg> Reenviar
                    </button>
                    <button
                      type="button"
                      (click)="onNewVersion.emit()"
                      class="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors text-sm font-medium"
                    >
                      <svg lucidePlus [size]="15"></svg> Nova versão
                    </button>
                    <button
                      type="button"
                      (click)="onDownload.emit()"
                      class="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
                    >
                      <svg lucideDownload [size]="15"></svg> Baixar
                    </button>
                    <button
                      type="button"
                      (click)="onReceipt.emit()"
                      class="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 transition-colors text-sm font-medium"
                    >
                      <svg lucideAward [size]="15"></svg> Gerar comprovante
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class DocumentViewerComponent implements OnChanges {
  @Input() open = false;
  @Input() documento: ViewerDocument | null = null;
  @Input() versions: ViewerDocument[] = [];
  @Input() showActions = true;
  @Output() onSelectVersion = new EventEmitter<ViewerDocument>();
  @Output() onClose = new EventEmitter<void>();
  @Output() onResend = new EventEmitter<void>();
  @Output() onNewVersion = new EventEmitter<void>();
  @Output() onDownload = new EventEmitter<void>();
  @Output() onReceipt = new EventEmitter<void>();

  readonly Math = Math;
  zoom = 100;
  page = 1;
  copied = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] || changes['documento']) {
      if (this.open) {
        this.zoom = 100;
        this.page = 1;
        this.copied = false;
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.onClose.emit();
  }

  get isPdf(): boolean {
    return this.documento?.formato === 'pdf';
  }

  get steps(): Array<{ etapa: string; titulo: string }> {
    return this.documento?.direcao === 'ENTRADA' ? protocolStepsEntrada : protocolStepsSaida;
  }

  get timelineItems(): TimelineItem[] {
    const doc = this.documento;
    if (!doc) return [];

    return this.steps.map((step) => {
      const evento = doc.historico.find((h) => h.etapa === step.etapa);

      return {
        title: step.etapa === 'ENVIADO' && evento?.canal ? `Enviado (${evento.canal})` : step.titulo,
        done: Boolean(evento),
        date: evento?.data,
        time: evento?.hora,
        extra: evento ? `IP ${evento.ip}` : undefined,
      };
    });
  }

  get currentVersion(): ViewerDocument | null {
    const doc = this.documento;
    if (!doc) return null;
    return this.versions.find((v) => v.id === doc.id) ?? doc;
  }

  dataCriado(version: ViewerDocument): string {
    return version.historico.find((h) => h.etapa === 'CRIADO')?.data ?? '';
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.onClose.emit();
  }

  async copyHash(): Promise<void> {
    if (!this.documento) return;
    try {
      await navigator.clipboard.writeText(this.documento.hash);
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    } catch {
      this.copied = false;
    }
  }
}
