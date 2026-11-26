import { HttpClient, HttpErrorResponse, HttpEventType, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  EmptyError,
  Subject,
  filter,
  firstValueFrom,
  lastValueFrom,
  takeUntil,
  tap,
} from 'rxjs';

import { DirecaoDocumento, areaDoTipo } from '../domain/documento';
import { paraData } from '../domain/data';
import type { Documento, DocumentoEntrada, DocumentoNovo, EventoAuditoria } from '../domain/models';
import { AuditoriaService } from './auditoria.service';

interface DocumentResponse {
  id: number;
  customerId: number;
  documentType: string;
  competence: string | null;
  dueDate: string | null;
  sendChannel: 'WHATSAPP' | 'EMAIL' | 'OUTRO' | null;
  direction: 'ENVIADO_AO_CLIENTE' | 'RECEBIDO_DO_CLIENTE';
  status: 'CRIADO' | 'ENVIADO' | 'VISUALIZADO' | 'BAIXADO';
  fileFormat: 'PDF' | 'OFX' | 'XML' | 'XLSX' | 'CSV' | 'TXT';
  fileName: string;
  storagePath?: string | null;
  /** Detalhe e upload usam createdIn; listagens usam createdAt. */
  createdIn?: string | null;
  createdAt?: string | null;
  /** RF27.1: inativado = histórico preservado, download e link público bloqueados. */
  active?: boolean;
}

interface DocumentPageResponse {
  content: DocumentResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface DocumentoFiltros {
  busca?: string | null;
  clienteId?: number | null;
  direcao?: string | null;
  status?: string | null;
  tipo?: string | null;
  competencia?: string | null;
  canal?: string | null;
  de?: string | null;
  ate?: string | null;
  sortBy?: string | null;
  sortDirection?: 'asc' | 'desc' | null;
  page?: number;
  size?: number;
}

export interface PaginaDocumentos {
  content: Documento[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface DocumentosContadores {
  total: number;
  saida: number;
  entrada: number;
  rascunho: number;
  enviado: number;
  visualizado: number;
  semana: number;
}

export interface DocumentoCompartilhado {
  token: string;
  path: string;
  url: string;
}

export interface DocumentoPublico {
  fileName: string;
  documentType: string;
  competence: string | null;
  status: string;
  fileFormat: string;
}

export interface UploadState {
  active: boolean;
  progress: number;
  error: string | null;
}

export type ProgressoUpload = (percentual: number) => void;

const statusOrdem: Record<string, number> = {
  CRIADO: 0,
  ENVIADO: 1,
  VISUALIZADO: 2,
  BAIXADO: 3,
};

const canalParaApi = (canal: string | null | undefined): string => {
  const value = (canal ?? '').toLowerCase();
  if (value.includes('whats')) return 'WHATSAPP';
  if (value.includes('email') || value.includes('e-mail')) return 'EMAIL';
  return 'OUTRO';
};

const canalDoApi = (canal: string | null | undefined): string => {
  switch (canal) {
    case 'WHATSAPP':
      return 'WhatsApp';
    case 'EMAIL':
      return 'E-mail';
    default:
      return 'Manual';
  }
};

const direcaoParaApi = (direcao: string): string =>
  direcao === DirecaoDocumento.ENTRADA ? 'RECEBIDO_DO_CLIENTE' : 'ENVIADO_AO_CLIENTE';

const direcaoDoApi = (direcao: string): string =>
  direcao === 'RECEBIDO_DO_CLIENTE' ? DirecaoDocumento.ENTRADA : DirecaoDocumento.SAIDA;

const dataHora = (valor: string | null | undefined): { data: string; hora: string } => {
  if (!valor) return { data: '', hora: '' };
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return { data: '', hora: '' };
  return {
    data: new Intl.DateTimeFormat('pt-BR').format(data),
    hora: new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(data),
  };
};

const dataParaApi = (valor: string | null | undefined): string | undefined => {
  if (!valor) return undefined;
  const data = paraData(valor);
  if (!data) return undefined;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`;
};

const toDocumento = (response: DocumentResponse): Documento => {
  const tipo = response.documentType;
  const { data, hora } = dataHora(response.createdIn ?? response.createdAt);
  const status = response.status;

  // O back-end não expõe eventos por transição; o histórico é derivado do status real
  // e da data de criação, sem inventar IPs ou horários.
  const historico = ['CRIADO', 'ENVIADO', 'VISUALIZADO', 'BAIXADO']
    .filter((etapa) => statusOrdem[etapa] <= statusOrdem[status])
    .map((etapa) => ({ etapa, data, hora }));

  return {
    id: response.id,
    clienteId: response.customerId,
    nome: response.fileName || tipo,
    tipo,
    competencia: response.competence ?? '',
    versao: 1,
    status,
    direcao: direcaoDoApi(response.direction),
    canal: canalDoApi(response.sendChannel),
    formato: response.fileFormat.toLowerCase(),
    tamanho: '—',
    vencimento: response.dueDate ?? null,
    diasAntecedencia: 3,
    hash: '',
    area: areaDoTipo(tipo),
    historico,
    ativo: response.active ?? true,
  };
};

const montarFormData = (dados: {
  file: File;
  clienteId: number;
  tipo: string;
  competencia: string;
  canal: string;
  vencimento: string | null | undefined;
  formato: string;
  direcao: string;
  sendNow: boolean;
}): FormData => {
  const form = new FormData();
  form.append('file', dados.file, dados.file.name);
  form.append('customerId', String(dados.clienteId));
  form.append('documentType', dados.tipo);
  form.append('competence', dados.competencia);
  const dueDate = dataParaApi(dados.vencimento);
  if (dueDate) form.append('dueDate', dueDate);
  form.append('sendChannel', canalParaApi(dados.canal));
  form.append('direction', direcaoParaApi(dados.direcao));
  form.append('fileFormat', dados.formato.toUpperCase());
  form.append('sendNow', String(dados.sendNow));
  return form;
};

/** Link absoluto do documento compartilhado, para copiar ou enviar no WhatsApp. */
export const urlPublicaDocumento = (path: string): string =>
  typeof location === 'undefined' ? path : `${location.origin}${path}`;

/** Abre o WhatsApp do cliente com o link do documento; não usa API externa. */
export const urlWhatsappCliente = (
  whatsapp: string | null | undefined,
  texto: string
): string | null => {
  const digits = (whatsapp ?? '').replace(/\D/g, '');
  if (!digits) return null;
  const telefone = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${telefone}?text=${encodeURIComponent(texto)}`;
};

const salvarArquivo = (blob: Blob, nome: string): void => {
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly auditoria = inject(AuditoriaService);
  private readonly cancelarUpload$ = new Subject<void>();
  private readonly estadoUpload = new BehaviorSubject<UploadState>({
    active: false,
    progress: 0,
    error: null,
  });

  /** Estado reativo do upload, usado pelos modais para barra, erro e cancelamento. */
  readonly uploadState$ = this.estadoUpload.asObservable();

  /** Cancela o upload em andamento; a Promise rejeita com "Envio cancelado". */
  cancelUpload(): void {
    if (this.estadoUpload.value.active) {
      this.cancelarUpload$.next();
    }
  }

  private async enviarComProgresso(
    form: FormData,
    onProgress?: ProgressoUpload
  ): Promise<DocumentResponse> {
    this.estadoUpload.next({ active: true, progress: 0, error: null });

    const evento$ = this.http
      .post<DocumentResponse>('/documents', form, { observe: 'events', reportProgress: true })
      .pipe(
        takeUntil(this.cancelarUpload$),
        tap((event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const percentual = Math.min(100, Math.round((100 * event.loaded) / event.total));
            onProgress?.(percentual);
            this.estadoUpload.next({ active: true, progress: percentual, error: null });
          }
        }),
        filter((event): event is HttpResponse<DocumentResponse> => event.type === HttpEventType.Response)
      );

    try {
      const response = await lastValueFrom(evento$);
      this.estadoUpload.next({ active: false, progress: 100, error: null });
      return response.body!;
    } catch (erro) {
      const mensagem = erro instanceof EmptyError
        ? 'Envio cancelado pelo usuário.'
        : this.mensagemDeErro(erro);
      this.estadoUpload.next({ active: false, progress: 0, error: mensagem });
      throw new Error(mensagem);
    }
  }

  private mensagemDeErro(erro: unknown): string {
    if (erro instanceof HttpErrorResponse) {
      const body = erro.error as { message?: string } | null;
      return body?.message ?? `Falha no envio (${erro.status}). Tente novamente.`;
    }
    return 'Falha no envio. Tente novamente.';
  }

  /** Listagem paginada: filtros e ordenação executados no banco, nunca no navegador. */
  async listPage(filtros: DocumentoFiltros = {}): Promise<PaginaDocumentos> {
    let params = new HttpParams();
    const aplicar = (chave: string, valor: string | number | null | undefined): HttpParams => {
      if (valor === null || valor === undefined || valor === '') return params;
      params = params.set(chave, String(valor));
      return params;
    };

    aplicar('search', filtros.busca);
    aplicar('customerId', filtros.clienteId);
    aplicar('direction', filtros.direcao);
    aplicar('status', filtros.status);
    aplicar('documentType', filtros.tipo);
    aplicar('competence', filtros.competencia);
    aplicar('sendChannel', filtros.canal);
    aplicar('from', filtros.de);
    aplicar('to', filtros.ate);
    aplicar('sortBy', filtros.sortBy);
    aplicar('sortDirection', filtros.sortDirection);
    aplicar('page', filtros.page ?? 0);
    aplicar('size', filtros.size ?? 20);

    const response = await firstValueFrom(
      this.http.get<DocumentPageResponse>('/documents/page', { params })
    );

    return {
      content: response.content.map(toDocumento),
      totalElements: response.totalElements,
      totalPages: response.totalPages,
      number: response.number,
      size: response.size,
    };
  }

  /** Contadores dos cards e abas direto do banco, sem carregar os documentos. */
  async contagens(): Promise<DocumentosContadores> {
    return firstValueFrom(this.http.get<DocumentosContadores>('/documents/counts'));
  }

  async getById(id: number | string): Promise<Documento | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<DocumentResponse>(`/documents/${id}`)
      );
      return toDocumento(response);
    } catch (erro) {
      if (erro instanceof HttpErrorResponse && erro.status === 404) return null;
      throw erro;
    }
  }

  /** O back-end não versiona arquivos: cada documento é uma versão independente. */
  async listVersions(doc: Documento): Promise<Documento[]> {
    return [doc];
  }

  async findByTipoCompetencia(
    clienteId: number | string,
    tipo: string,
    competencia: string
  ): Promise<Documento | undefined> {
    const pagina = await this.listPage({
      clienteId: Number(clienteId),
      tipo,
      competencia,
      direcao: DirecaoDocumento.SAIDA,
      size: 1,
    });
    return pagina.content[0];
  }

  async create(dados: DocumentoNovo, onProgress?: ProgressoUpload): Promise<Documento> {
    if (!dados.file) throw new Error('É necessário selecionar um arquivo.');

    // "Enviar agora" é uma única operação atômica no back-end: salva e registra o envio.
    const response = await this.enviarComProgresso(
      montarFormData({
        file: dados.file,
        clienteId: dados.clienteId,
        tipo: dados.nome ?? dados.tipo,
        competencia: dados.competencia,
        canal: dados.canal,
        vencimento: dados.vencimento,
        formato: dados.formato,
        direcao: DirecaoDocumento.SAIDA,
        sendNow: dados.enviarAgora,
      }),
      onProgress
    );

    return toDocumento(response);
  }

  async createEntrada(
    dados: DocumentoEntrada,
    onProgress?: ProgressoUpload
  ): Promise<Documento> {
    if (!dados.file) throw new Error('É necessário selecionar um arquivo.');

    const response = await this.enviarComProgresso(
      montarFormData({
        file: dados.file,
        clienteId: dados.clienteId,
        tipo: dados.tipo,
        competencia: dados.competencia,
        canal: dados.canal,
        vencimento: dados.vencimento,
        formato: dados.formato,
        direcao: DirecaoDocumento.ENTRADA,
        sendNow: false,
      }),
      onProgress
    );

    return toDocumento(response);
  }

  async createConsolidado(dados: {
    clienteId: number;
    nome: string;
    competencia: string;
    fontes: string[];
  }): Promise<Documento> {
    const conteudo = [
      `Documento: ${dados.nome}`,
      `Competência: ${dados.competencia}`,
      'Fontes consolidadas:',
      ...dados.fontes.map((fonte) => `- ${fonte}`),
    ].join('\n');
    const file = new File([conteudo], `${dados.nome}.txt`, { type: 'text/plain' });

    return this.create({
      clienteId: dados.clienteId,
      nome: dados.nome,
      tipo: 'Documento consolidado',
      competencia: dados.competencia,
      canal: 'Manual',
      formato: 'txt',
      tamanho: `${file.size} bytes`,
      enviarAgora: false,
      file,
    });
  }

  async markEnviado(id: number | string): Promise<Documento | null> {
    await firstValueFrom(this.http.post<DocumentResponse>(`/documents/${id}/send`, {}));
    return this.getById(id);
  }

  /** RF27.1: inativação lógica e irreversível; mantém arquivo e histórico. */
  async inativar(id: number | string): Promise<Documento | null> {
    await firstValueFrom(this.http.post<DocumentResponse>(`/documents/${id}/inactivate`, {}));
    return this.getById(id);
  }

  historico(id: number | string): Promise<EventoAuditoria[]> {
    return this.auditoria.documento(id);
  }

  /** Gera o link público e registra o envio. O contador envia o link pelo próprio WhatsApp. */
  async compartilhar(id: number | string): Promise<DocumentoCompartilhado> {
    const response = await firstValueFrom(
      this.http.post<{ token: string; path: string }>(`/documents/${id}/share`, {})
    );
    return { ...response, url: urlPublicaDocumento(response.path) };
  }

  /** Metadados da página pública; não altera o status do documento. */
  async documentoPublico(token: string): Promise<DocumentoPublico> {
    return firstValueFrom(this.http.get<DocumentoPublico>(`/public/documents/${token}`));
  }

  /** Abrir o arquivo público registra a transição VISUALIZADO no back-end. */
  async arquivoPublico(token: string): Promise<Blob> {
    return firstValueFrom(
      this.http.get(`/public/documents/${token}/file`, { responseType: 'blob' })
    );
  }

  /** Exclui o documento. O prazo gerado a partir dele também é removido pelo back-end. */
  async remove(id: number | string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/documents/${id}`));
  }

  /** A transição VISUALIZADO é registrada pelo back-end ao servir o arquivo. */
  async markVisualizado(id: number | string): Promise<Documento | null> {
    await firstValueFrom(this.http.get(`/documents/${id}/file/view`, { responseType: 'blob' }));
    return this.getById(id);
  }

  /** A transição BAIXADO é registrada pelo back-end ao servir o arquivo. */
  async markBaixado(id: number | string): Promise<Documento | null> {
    const documento = await this.getById(id);
    const blob = await firstValueFrom(
      this.http.get(`/documents/${id}/file/download`, { responseType: 'blob' })
    );
    salvarArquivo(blob, documento?.nome ?? `documento-${id}`);
    return this.getById(id);
  }

  async baixarArquivo(id: number | string): Promise<void> {
    await this.markBaixado(id);
  }
}
