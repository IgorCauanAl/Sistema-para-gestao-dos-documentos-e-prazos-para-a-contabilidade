import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { formatarData, formatarHora, paraData } from '../domain/data';
import type { Cliente, Solicitacao, SolicitacaoItem, SolicitacaoTentativa } from '../domain/models';
// Constantes locais (espelho de core/domain/solicitacao) para evitar a quebra de
// inicialização de módulos observada quando um service importa esse arquivo no runner de testes.
const STATUS_SOLICITACAO = {
  ABERTA: 'ABERTA',
  CONCLUIDA: 'CONCLUIDA',
  CANCELADA: 'CANCELADA',
  EXPIRADA: 'EXPIRADA',
} as const;

const STATUS_ITEM = {
  PENDENTE: 'PENDENTE',
  ENVIADO: 'ENVIADO',
  APROVADO: 'APROVADO',
  RECUSADO: 'RECUSADO',
} as const;

interface PublicChecklistItemDTO {
  id: number;
  description: string;
  expectedFileFormat: string | null;
  status: string;
  uploadedFileName: string | null;
  uploadedDocumentId: number | null;
  sentAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

interface PublicRequestDTO {
  id: number;
  customerId: number;
  customerName?: string | null;
  title: string;
  competence: string | null;
  deadline: string | null;
  status: string;
  createdIn: string | null;
  completedIn?: string | null;
  cancelledIn?: string | null;
  /** RF31.1: validade efetiva do link, persistida no back-end. */
  publicTokenExpiresAt?: string | null;
  checklist: PublicChecklistItemDTO[] | null;
}

interface PublicUploadResponseDTO {
  protocol: string;
  request: PublicRequestDTO;
  documentId: number;
}

export interface PortalSolicitacao {
  solicitacao: Solicitacao;
  cliente: Cliente | null;
}

export interface PortalEnvio {
  solicitacao: Solicitacao;
  protocolo: string;
  tentativa: SolicitacaoTentativa;
}

export interface PortalTokenValidation {
  valid: boolean;
  requestId: number;
  status: string;
  deadline: string | null;
  expiresAt?: string | null;
}

const statusSolicitacao = (status: string): string => {
  switch (status) {
    case 'CONCLUIDA':
      return STATUS_SOLICITACAO.CONCLUIDA;
    case 'CANCELADA':
      return STATUS_SOLICITACAO.CANCELADA;
    case 'RASCUNHO':
    case 'ABERTA':
    default:
      return STATUS_SOLICITACAO.ABERTA;
  }
};

const statusItem = (status: string): string => {
  switch (status) {
    case 'ENVIADO_PELO_CLIENTE':
      return STATUS_ITEM.ENVIADO;
    case 'ACEITO':
      return STATUS_ITEM.APROVADO;
    case 'RECUSADO':
      return STATUS_ITEM.RECUSADO;
    case 'PENDENTE':
    default:
      return STATUS_ITEM.PENDENTE;
  }
};

const dataHora = (valor: string | null | undefined): { data: string; hora: string } => {
  if (!valor) return { data: '', hora: '' };
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return { data: '', hora: '' };
  return { data: formatarData(data), hora: formatarHora(data) };
};

const prazo = (valor: string | null | undefined): string => {
  if (!valor) return '';
  const [ano, mes, dia] = valor.split('-');
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : '';
};

const expirada = (
  deadline: string | null | undefined,
  expiresAt?: string | null
): boolean => {
  if (expiresAt) {
    const expira = new Date(expiresAt);
    return !Number.isNaN(expira.getTime()) && expira.getTime() <= Date.now();
  }
  if (!deadline) return false;
  const alvo = paraData(prazo(deadline));
  if (!alvo) return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return alvo.getTime() < hoje.getTime();
};

const tentativas = (item: PublicChecklistItemDTO): SolicitacaoTentativa[] => {
  const resultado: SolicitacaoTentativa[] = [];
  if (item.uploadedFileName) {
    const { data, hora } = dataHora(item.sentAt);
    resultado.push({
      id: `envio-${item.id}`,
      data,
      hora,
      acao: 'ENVIADO',
      arquivo: { nome: item.uploadedFileName, tamanho: '' },
      motivo: null,
      detalhes: null,
      canalOrigem: 'Link público',
      ip: '',
      protocolo: null,
      observacao: null,
    });
  }
  if (item.rejectionReason) {
    const { data, hora } = dataHora(item.reviewedAt);
    resultado.push({
      id: `recusa-${item.id}`,
      data,
      hora,
      acao: 'RECUSADO',
      arquivo: null,
      motivo: null,
      detalhes: item.rejectionReason,
      canalOrigem: null,
      ip: '',
      protocolo: null,
      observacao: null,
    });
  }
  return resultado;
};

const paraSolicitacao = (dto: PublicRequestDTO, token: string): Solicitacao => {
  const itens: SolicitacaoItem[] = (dto.checklist ?? []).map((item) => ({
    id: item.id,
    nome: item.description,
    formatoEsperado: item.expectedFileFormat ?? 'Qualquer',
    status: statusItem(item.status),
    tentativas: tentativas(item),
  }));

  let status = statusSolicitacao(dto.status);
  const validadeBackend = dto.publicTokenExpiresAt ?? null;
  if (status === STATUS_SOLICITACAO.ABERTA && expirada(dto.deadline, validadeBackend)) {
    status = STATUS_SOLICITACAO.EXPIRADA;
  }

  const criadoEm = dataHora(dto.createdIn);
  const prazoEnvio = prazo(dto.deadline);
  const validade = validadeBackend ? dataHora(validadeBackend) : null;

  return {
    id: dto.id,
    clienteId: dto.customerId,
    titulo: dto.title,
    competencia: dto.competence ?? '',
    prazo: prazoEnvio,
    instrucoes: '',
    canal: 'Link público',
    token,
    validadeAte: validade ? `${validade.data} ${validade.hora}` : prazoEnvio,
    validadeDias: 0,
    status,
    criadoEm,
    itens,
    expiraEm: validadeBackend,
  };
};

const paraCliente = (dto: PublicRequestDTO): Cliente | null => {
  if (!dto.customerName) return null;
  return {
    id: dto.customerId,
    cnpj: '',
    razaoSocial: dto.customerName,
    responsavel: '',
    email: '',
    endereco: '',
    whatsapp: '',
    canalPreferido: '',
    ultimoEnvio: '',
  };
};

export const mensagemErroPortal = (erro: unknown): string => {
  if (erro instanceof HttpErrorResponse) {
    const detail = (erro.error as { detail?: unknown } | null)?.detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
    if (erro.status === 413) return 'O arquivo excede o limite de 25 MB.';
    if (erro.status === 415) return 'Formato de arquivo não aceito.';
    if (erro.status === 409) return 'Este item já foi enviado. Aguarde a conferência do escritório.';
    if (erro.status === 410) return 'Este link expirou. Solicite um novo link ao escritório.';
    if (erro.status === 404) return 'Solicitação ou item não encontrado.';
  }
  return 'Não foi possível concluir a operação. Tente novamente.';
};

@Injectable({ providedIn: 'root' })
export class PublicRequestService {
  private readonly http = inject(HttpClient);

  async validateToken(token: string): Promise<PortalTokenValidation | null> {
    try {
      return await firstValueFrom(
        this.http.get<PortalTokenValidation>(
          `/public/requests/${encodeURIComponent(token)}/validate`,
        ),
      );
    } catch (erro) {
      if (
        erro instanceof HttpErrorResponse &&
        (erro.status === 404 || erro.status === 400 || erro.status === 410)
      ) {
        return null;
      }
      throw erro;
    }
  }

  async getByToken(token: string): Promise<PortalSolicitacao | null> {
    try {
      const dto = await firstValueFrom(
        this.http.get<PublicRequestDTO>(`/public/requests/${encodeURIComponent(token)}`),
      );
      return { solicitacao: paraSolicitacao(dto, token), cliente: paraCliente(dto) };
    } catch (erro) {
      if (
        erro instanceof HttpErrorResponse &&
        (erro.status === 404 || erro.status === 400 || erro.status === 410)
      ) {
        return null;
      }
      throw erro;
    }
  }

  async enviarPeloPortal(token: string, itemId: number, arquivo: File): Promise<PortalEnvio> {
    const form = new FormData();
    form.append('file', arquivo);

    const resposta = await firstValueFrom(
      this.http.post<PublicUploadResponseDTO>(
        `/public/requests/${encodeURIComponent(token)}/items/${itemId}/upload`,
        form,
      ),
    );

    const enviado = (resposta.request.checklist ?? []).find((item) => item.id === Number(itemId));
    const { data, hora } = dataHora(enviado?.sentAt);
    const tentativa: SolicitacaoTentativa = {
      id: `envio-${itemId}-${resposta.documentId}`,
      data,
      hora,
      acao: 'ENVIADO',
      arquivo: { nome: enviado?.uploadedFileName ?? arquivo.name, tamanho: '' },
      motivo: null,
      detalhes: null,
      canalOrigem: 'Link público',
      ip: '',
      protocolo: resposta.protocol,
      observacao: null,
    };

    return {
      solicitacao: paraSolicitacao(resposta.request, token),
      protocolo: resposta.protocol,
      tentativa,
    };
  }
}
