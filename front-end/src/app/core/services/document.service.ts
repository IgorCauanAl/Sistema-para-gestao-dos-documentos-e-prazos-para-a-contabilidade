import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  DirecaoDocumento,
  DocumentStatus,
  areaDoTipo,
} from '../domain/documento';
import { paraData } from '../domain/data';
import type {
  Documento,
  DocumentoEntrada,
  DocumentoNovo,
} from '../domain/models';

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
  storagePath?: string;
  createdIn: string;
}

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

const dataHora = (valor: string): { data: string; hora: string } => {
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
  const { data, hora } = dataHora(response.createdIn);
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
  return form;
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

  private async listarTodos(): Promise<Documento[]> {
    const response = await firstValueFrom(this.http.get<DocumentResponse[]>('/documents'));
    return response.map(toDocumento);
  }

  async listByClient(clienteId: number | string): Promise<Documento[]> {
    const documentos = await this.listarTodos();
    return documentos.filter((doc) => doc.clienteId === Number(clienteId));
  }

  async listAll(direcao?: string | null): Promise<Documento[]> {
    const documentos = await this.listarTodos();
    if (!direcao) return documentos;
    return documentos.filter((doc) => doc.direcao === direcao);
  }

  async getById(id: number | string): Promise<Documento | null> {
    const documentos = await this.listarTodos();
    return documentos.find((doc) => doc.id === Number(id)) ?? null;
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
    const documentos = await this.listarTodos();
    return documentos.find(
      (doc) =>
        doc.clienteId === Number(clienteId) &&
        doc.direcao === DirecaoDocumento.SAIDA &&
        doc.tipo === tipo &&
        doc.competencia === competencia
    );
  }

  async create(dados: DocumentoNovo): Promise<Documento> {
    if (!dados.file) throw new Error('É necessário selecionar um arquivo.');

    const response = await firstValueFrom(
      this.http.post<DocumentResponse>(
        '/documents',
        montarFormData({
          file: dados.file,
          clienteId: dados.clienteId,
          tipo: dados.nome ?? dados.tipo,
          competencia: dados.competencia,
          canal: dados.canal,
          vencimento: dados.vencimento,
          formato: dados.formato,
          direcao: DirecaoDocumento.SAIDA,
        })
      )
    );

    if (dados.enviarAgora) {
      await this.markEnviado(response.id);
      return (await this.getById(response.id)) ?? toDocumento(response);
    }

    return toDocumento(response);
  }

  async createEntrada(dados: DocumentoEntrada): Promise<Documento> {
    if (!dados.file) throw new Error('É necessário selecionar um arquivo.');

    const response = await firstValueFrom(
      this.http.post<DocumentResponse>(
        '/documents',
        montarFormData({
          file: dados.file,
          clienteId: dados.clienteId,
          tipo: dados.tipo,
          competencia: dados.competencia,
          canal: dados.canal,
          vencimento: dados.vencimento,
          formato: dados.formato,
          direcao: DirecaoDocumento.ENTRADA,
        })
      )
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
