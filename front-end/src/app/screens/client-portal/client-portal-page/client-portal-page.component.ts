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

import { ProgressBarComponent } from '../../../core/components/ui/progress-bar/progress-bar.component';
import { StatusBadgeComponent } from '../../../core/components/ui/status-badge/status-badge.component';
import type { Cliente, Solicitacao, SolicitacaoItem, SolicitacaoTentativa } from '../../../core/domain/models';
import {
  itemStatusPortalLabel,
  progressoSolicitacao,
  StatusItem,
  StatusSolicitacao,
  TAMANHO_MAXIMO_MB,
  type StatusMeta,
} from '../../../core/domain/solicitacao';
import { mensagemErroPortal, PublicRequestService } from '../../../core/services/public-request.service';
import { ToastService } from '../../../core/services/toast.service';

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
  templateUrl: './client-portal-page.component.html',
  styleUrl: './client-portal-page.component.css',
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
    private publicRequestService: PublicRequestService,
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
    this.loading = true;
    try {
      const found = await this.publicRequestService.getByToken(this.token);
      this.sol = found?.solicitacao ?? null;
      this.cliente = found?.cliente ?? null;
    } catch {
      this.sol = null;
      this.cliente = null;
    } finally {
      this.loading = false;
    }
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

  get progresso(): { aprovados: number; total: number; pct: number; label: string } {
    if (!this.sol) return { aprovados: 0, total: 0, pct: 0, label: '0 de 0 aprovados' };
    return progressoSolicitacao(this.sol);
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

    this.setUpload(item.id, { enviando: true, error: '', pct: 20 });

    try {
      const resultado = await this.publicRequestService.enviarPeloPortal(this.token, item.id, atual.file);

      this.setUpload(item.id, { pct: 100, enviando: false, file: null, observacao: '' });
      this.sucesso = { itemId: item.id, nome: item.nome, protocolo: resultado.protocolo };
      this.toastService.show('Documento enviado com sucesso.');
      await this.refresh();
    } catch (erro) {
      this.setUpload(item.id, {
        enviando: false,
        pct: 0,
        error: mensagemErroPortal(erro),
      });
    }
  }
}
