import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  LucideAlertTriangle,
  LucideCheckCircle2,
  LucideClock,
  LucideFileText,
  LucideLoader2,
  LucideShieldCheck,
  LucideUpload,
} from '@lucide/angular';
import { Subscription } from 'rxjs';

import { ProgressBarComponent } from '../../core/components/ui/progress-bar.component';
import { StatusBadgeComponent } from '../../core/components/ui/status-badge.component';
import type { Cliente, Solicitacao, SolicitacaoItem, SolicitacaoTentativa } from '../../core/domain/models';
import {
  itemStatusPortalLabel,
  StatusItem,
  StatusSolicitacao,
  TAMANHO_MAXIMO_MB,
  type StatusMeta,
} from '../../core/domain/solicitacao';
import { ClientService } from '../../core/services/client.service';
import { SolicitacaoService } from '../../core/services/solicitacao.service';
import { ToastService } from '../../core/services/toast.service';

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const EXTENSOES: Record<string, string[] | null> = {
  PDF: ['pdf'],
  Imagem: ['jpg', 'jpeg', 'png', 'webp'],
  OFX: ['ofx'],
  XML: ['xml'],
  XLSX: ['xlsx'],
  CSV: ['csv'],
  TXT: ['txt'],
  Qualquer: null,
};

const ACCEPT_ATTR: Record<string, string | null> = {
  PDF: '.pdf',
  Imagem: '.jpg,.jpeg,.png,.webp',
  OFX: '.ofx',
  XML: '.xml',
  XLSX: '.xlsx',
  CSV: '.csv',
  TXT: '.txt',
  Qualquer: null,
};

const extensaoDe = (nome: string): string => nome.split('.').pop()?.toLowerCase() ?? '';

const formatSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const portalBadge: Record<string, StatusMeta> = {
  [StatusItem.PENDENTE]: {
    label: itemStatusPortalLabel[StatusItem.PENDENTE],
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  [StatusItem.ENVIADO]: {
    label: itemStatusPortalLabel[StatusItem.ENVIADO],
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  [StatusItem.APROVADO]: {
    label: itemStatusPortalLabel[StatusItem.APROVADO],
    badge: 'bg-green-100 text-green-700 border-green-200',
  },
  [StatusItem.RECUSADO]: {
    label: itemStatusPortalLabel[StatusItem.RECUSADO],
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
  },
};

interface UploadState {
  file: File | null;
  error: string;
  pct: number;
  enviando: boolean;
  observacao: string;
}

interface SucessoEnvio {
  itemId: number;
  nome: string;
  protocolo: string;
}

const uploadVazio = (): UploadState => ({
  file: null,
  error: '',
  pct: 0,
  enviando: false,
  observacao: '',
});

const ultimaTentativaComArquivo = (item: SolicitacaoItem): SolicitacaoTentativa | null =>
  [...item.tentativas].reverse().find((t) => t.arquivo) ?? null;

const ultimaRecusa = (item: SolicitacaoItem): SolicitacaoTentativa | null =>
  [...item.tentativas].reverse().find((t) => t.acao === 'RECUSADO') ?? null;

@Component({
  selector: 'app-client-portal-page',
  standalone: true,
  imports: [
    StatusBadgeComponent,
    ProgressBarComponent,
    LucideAlertTriangle,
    LucideCheckCircle2,
    LucideClock,
    LucideFileText,
    LucideLoader2,
    LucideShieldCheck,
    LucideUpload,
  ],
  template: `
    @if (!loading) {
      @if (erroLink || cancelada || expirada) {
        <div class="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-8 max-w-md w-full text-center space-y-4">
            <div class="flex items-center gap-3">
              <span
                class="w-11 h-11 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-bold"
              >
                CD
              </span>
              <div>
                <p class="font-bold text-slate-800">ContaDash</p>
                <p class="text-xs text-slate-400">Solicitação de documentos</p>
              </div>
            </div>

            <div class="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mt-4">
              <svg lucideAlertTriangle [size]="32" class="text-red-500"></svg>
            </div>
            <div>
              <p class="text-lg font-bold text-slate-800">{{ tituloErro }}</p>
              <p class="text-sm text-slate-500 mt-2 leading-relaxed">{{ mensagemErro }}</p>
            </div>
          </div>
        </div>
      } @else if (sol) {
        <div class="min-h-screen bg-[#F1F5F9] p-4 md:p-8">
          <div class="max-w-3xl mx-auto space-y-6">
            <header class="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-6 space-y-5">
              <div class="flex items-center gap-3">
                <span
                  class="w-11 h-11 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-bold"
                >
                  CD
                </span>
                <div>
                  <p class="font-bold text-slate-800">ContaDash</p>
                  <p class="text-xs text-slate-400">Solicitação de documentos</p>
                </div>
              </div>

              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                  {{ cliente?.razaoSocial }}
                </p>
                <h1 class="text-xl md:text-2xl font-bold text-slate-800 mt-1">{{ sol.titulo }}</h1>
                <p class="text-sm text-slate-500 mt-1">
                  Competência {{ sol.competencia }} · Prazo para envio: <strong>{{ sol.prazo }}</strong>
                </p>
              </div>

              @if (sol.instrucoes) {
                <div class="px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl">
                  <p class="text-xs font-semibold text-indigo-700 mb-1">Instruções do escritório</p>
                  <p class="text-sm text-indigo-900/80 leading-relaxed">{{ sol.instrucoes }}</p>
                </div>
              }
            </header>

            @if (sucesso) {
              <div
                class="bg-green-50 border border-green-200 rounded-3xl p-5 flex flex-wrap items-center gap-4"
                role="status"
              >
                <svg lucideCheckCircle2 [size]="28" class="text-green-600 shrink-0"></svg>
                <div class="min-w-0 flex-1">
                  <p class="font-bold text-green-800">Documento enviado com sucesso!</p>
                  <p class="text-sm text-green-700">
                    {{ sucesso.nome }} · Protocolo: <strong>{{ sucesso.protocolo }}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  (click)="sucesso = null"
                  class="text-xs font-semibold text-green-700 hover:text-green-900 underline"
                >
                  Fechar
                </button>
              </div>
            }

            <div class="space-y-4">
              @for (item of sol.itens; track item.id) {
                <section class="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-5 space-y-4">
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                      <span
                        class="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0"
                      >
                        <svg lucideFileText [size]="18"></svg>
                      </span>
                      <div class="min-w-0">
                        <p class="font-semibold text-slate-800">{{ item.nome }}</p>
                        <p class="text-xs text-slate-400">Formato aceito: {{ item.formatoEsperado }}</p>
                      </div>
                    </div>
                    <app-status-badge [meta]="metaItem(item)"></app-status-badge>
                  </div>

                  @if (recusa(item); as recusaInfo) {
                    <div class="px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
                      <p class="text-sm font-semibold text-amber-800">
                        O escritório pediu reenvio deste item{{ recusaInfo.detalhes ? ': ' + recusaInfo.detalhes : '.' }}
                      </p>
                      <p class="text-xs text-amber-700 mt-0.5">
                        Data da recusa: {{ recusaInfo.data }} às {{ recusaInfo.hora }}
                      </p>
                    </div>
                  }

                  @if (item.status === StatusItem.ENVIADO && arquivo(item); as arquivoInfo) {
                    <div
                      class="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-900"
                    >
                      <span class="flex items-center gap-1.5">
                        <svg lucideClock [size]="15"></svg> Aguardando conferência pelo escritório
                      </span>
                      <span class="text-blue-700">
                        {{ arquivoInfo.arquivo?.nome }} · {{ arquivoInfo.arquivo?.tamanho }} ·
                        {{ arquivoInfo.data }} {{ arquivoInfo.hora }}
                      </span>
                    </div>
                  }

                  @if (item.status === StatusItem.APROVADO && arquivo(item); as arquivoInfo) {
                    <div
                      class="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 bg-green-50 border border-green-100 rounded-2xl text-sm text-green-800"
                    >
                      <span class="flex items-center gap-1.5 font-semibold">
                        <svg lucideCheckCircle2 [size]="15"></svg> Aprovado pelo escritório
                      </span>
                      <span>{{ arquivoInfo.arquivo?.nome }} · {{ arquivoInfo.arquivo?.tamanho }}</span>
                    </div>
                  }

                  @if (podeEnviar(item)) {
                    <div class="space-y-3">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            [attr.for]="'arquivo-' + item.id"
                            class="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-2xl text-sm font-medium text-slate-500 hover:border-indigo-400 hover:text-indigo-500 cursor-pointer transition-colors"
                          >
                            <svg lucideUpload [size]="16"></svg>
                            {{ estado(item.id).file ? estado(item.id).file?.name : 'Escolher arquivo' }}
                          </label>
                          <input
                            [id]="'arquivo-' + item.id"
                            type="file"
                            [attr.accept]="acceptAttr(item.formatoEsperado)"
                            class="sr-only"
                            (change)="selecionarArquivo(item, fileInputValue($event))"
                          />
                          @if (estado(item.id).file) {
                            <p class="text-xs text-slate-500 mt-1.5">
                              {{ estado(item.id).file?.name }} ·
                              {{ formatSize(estado(item.id).file?.size ?? 0) }}
                            </p>
                          }
                        </div>

                        <div>
                          <label [attr.for]="'obs-' + item.id" class="sr-only">
                            Observação para {{ item.nome }}
                          </label>
                          <input
                            [id]="'obs-' + item.id"
                            type="text"
                            placeholder="Observação (opcional)"
                            [value]="estado(item.id).observacao"
                            (input)="setUpload(item.id, { observacao: $any($event.target).value })"
                            class="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          />
                        </div>
                      </div>

                      @if (estado(item.id).error) {
                        <p class="text-sm font-medium text-red-600 flex items-center gap-1.5" role="alert">
                          <svg lucideAlertTriangle [size]="15"></svg> {{ estado(item.id).error }}
                        </p>
                      }

                      @if (estado(item.id).enviando) {
                        <app-progress-bar [pct]="estado(item.id).pct" tone="indigo"></app-progress-bar>
                      }

                      <button
                        type="button"
                        [disabled]="estado(item.id).enviando"
                        (click)="enviarItem(item)"
                        class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 disabled:opacity-60 transition-colors"
                      >
                        @if (estado(item.id).enviando) {
                          <svg lucideLoader2 [size]="16" class="animate-spin"></svg> Enviando...
                        } @else {
                          <svg lucideUpload [size]="16"></svg> Enviar documento
                        }
                      </button>
                    </div>
                  }

                  @if (item.status === StatusItem.APROVADO) {
                    <p class="text-xs text-slate-400">Este item já foi aprovado. Nada mais é necessário.</p>
                  }
                </section>
              }
            </div>

            <footer class="flex items-start gap-3 px-5 py-4 bg-white rounded-3xl shadow-sm border border-slate-200/50">
              <svg lucideShieldCheck [size]="18" class="text-indigo-500 shrink-0 mt-0.5"></svg>
              <p class="text-xs text-slate-400 leading-relaxed">
                Seus arquivos são enviados somente ao escritório contábil responsável por esta
                solicitação e usados exclusivamente para a prestação dos serviços contábeis. O link é
                pessoal e intransferível. Em caso de dúvidas, fale diretamente com o seu contador.
              </p>
            </footer>
          </div>
        </div>
      }
    }
  `,
})
export class ClientPortalPageComponent implements OnInit, OnDestroy {
  sol: Solicitacao | null = null;
  cliente: Cliente | null = null;
  loading = true;

  uploads: Record<number, UploadState> = {};
  sucesso: SucessoEnvio | null = null;

  readonly StatusItem = StatusItem;

  private token = '';
  private paramSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private solicitacaoService: SolicitacaoService,
    private clientService: ClientService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.paramSub = this.route.paramMap.subscribe((params) => {
      this.token = params.get('token') ?? '';
      this.refresh();
    });
  }

  ngOnDestroy(): void {
    this.paramSub?.unsubscribe();
  }

  private async refresh(): Promise<void> {
    const found = await this.solicitacaoService.getByToken(this.token);
    this.sol = found;
    this.cliente = found ? await this.clientService.getById(found.clienteId) : null;
    this.loading = false;
  }

  get erroLink(): boolean {
    return !this.sol;
  }

  get cancelada(): boolean {
    return this.sol?.status === StatusSolicitacao.CANCELADA;
  }

  get expirada(): boolean {
    return this.sol?.status === StatusSolicitacao.EXPIRADA;
  }

  get tituloErro(): string {
    if (this.erroLink) return 'Link inválido';
    return this.cancelada ? 'Solicitação cancelada' : 'Solicitação expirada';
  }

  get mensagemErro(): string {
    if (this.erroLink) {
      return 'Este link não existe ou foi substituído. Peça ao seu contador um novo link de envio.';
    }
    if (this.cancelada) {
      return 'Esta solicitação foi cancelada pelo escritório contábil. Em caso de dúvidas, fale com o seu contador.';
    }
    return 'O prazo de envio deste link encerrou. Fale com o seu escritório contábil para solicitar a renovação.';
  }

  estado(itemId: number): UploadState {
    return this.uploads[itemId] ?? uploadVazio();
  }

  setUpload(itemId: number, patch: Partial<UploadState>): void {
    this.uploads = {
      ...this.uploads,
      [itemId]: { ...uploadVazio(), ...this.uploads[itemId], ...patch },
    };
  }

  metaItem(item: SolicitacaoItem): StatusMeta {
    return portalBadge[item.status] ?? portalBadge[StatusItem.PENDENTE];
  }

  arquivo(item: SolicitacaoItem): SolicitacaoTentativa | null {
    return ultimaTentativaComArquivo(item);
  }

  recusa(item: SolicitacaoItem): SolicitacaoTentativa | null {
    return item.status === StatusItem.RECUSADO ? ultimaRecusa(item) : null;
  }

  podeEnviar(item: SolicitacaoItem): boolean {
    return item.status === StatusItem.PENDENTE || item.status === StatusItem.RECUSADO;
  }

  acceptAttr(formatoEsperado: string): string | null {
    return ACCEPT_ATTR[formatoEsperado] ?? null;
  }

  fileInputValue(event: Event): File | null {
    const input = event.target as HTMLInputElement;
    return input.files?.[0] ?? null;
  }

  formatSize(bytes: number): string {
    return formatSize(bytes);
  }

  selecionarArquivo(item: SolicitacaoItem, file: File | null): void {
    if (!file) return;

    const ext = extensaoDe(file.name);
    const permitidas = EXTENSOES[item.formatoEsperado];

    if (permitidas && !permitidas.includes(ext)) {
      this.setUpload(item.id, {
        file: null,
        error: `Formato .${ext} não aceito para "${item.nome}". Envie: ${permitidas.map((e) => `.${e}`).join(', ')}.`,
      });
      return;
    }

    if (file.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
      this.setUpload(item.id, {
        file: null,
        error: `O arquivo excede o limite de ${TAMANHO_MAXIMO_MB} MB.`,
      });
      return;
    }

    this.setUpload(item.id, { file, error: '', pct: 0 });
  }

  async enviarItem(item: SolicitacaoItem): Promise<void> {
    const atual = this.estado(item.id);

    if (!atual.file) {
      this.setUpload(item.id, { error: 'Selecione um arquivo para envio.' });
      return;
    }

    this.setUpload(item.id, { enviando: true, error: '', pct: 10 });
    await wait(150);
    this.setUpload(item.id, { pct: 45 });
    await wait(150);
    this.setUpload(item.id, { pct: 80 });
    await wait(150);

    const resultado = await this.solicitacaoService.enviarPeloPortal(this.token, item.id, {
      arquivo: { nome: atual.file.name, tamanho: formatSize(atual.file.size) },
      observacao: atual.observacao.trim() || undefined,
    });

    if (!resultado) {
      this.setUpload(item.id, { enviando: false, pct: 0, error: 'Não foi possível enviar este item.' });
      return;
    }

    this.setUpload(item.id, { pct: 100, enviando: false, file: null, observacao: '' });
    this.sucesso = { itemId: item.id, nome: item.nome, protocolo: resultado.protocolo };
    this.toastService.show('Documento enviado com sucesso.');
    await this.refresh();
  }
}
