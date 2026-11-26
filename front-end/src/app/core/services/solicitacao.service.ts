import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { dataBRParaISO, formatarData, formatarHora, paraBR, paraData } from '../domain/data';
import type { EventoAuditoria, Solicitacao, SolicitacaoItem, SolicitacaoNova, SolicitacaoTentativa } from '../domain/models';
import { AuditoriaService } from './auditoria.service';
import { ClientService } from './client.service';

// Constantes locais para evitar ciclo de inicialização de módulos no runner de testes.
const STATUS_SOLICITACAO = {
  ABERTA: 'ABERTA',
  CONCLUIDA: 'CONCLUIDA',
  CANCELADA: 'CANCELADA',
  EXPIRADA: 'EXPIRADA',
} as const;

interface ChecklistItemDTO {
  id: number;
  description: string;
  expectedFileFormat: string | null;
  status: 'PENDENTE' | 'ENVIADO_PELO_CLIENTE' | 'ACEITO' | 'RECUSADO';
  uploadedFileName: string | null;
  uploadedDocumentId?: number | null;
  sentAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

interface RequestListItemDTO {
  id: number;
  customerId: number;
  title: string;
  competence: string;
  dueDate: string | null;
  status: string;
  acceptedItems: number;
  totalItems: number;
  progress?: number | string;
  /** RF31.1: o back-end é a fonte autoritativa da validade do link. */
  publicTokenExpiresAt?: string | null;
}

interface RequestResponseDTO extends RequestListItemDTO {
  createdIn: string | null;
  deadline?: string | null;
  publicToken?: string | null;
  checklist: ChecklistItemDTO[] | null;
}

interface RequestReadModelDTO extends RequestListItemDTO {
  createdAt: string | null;
  items: ChecklistItemDTO[] | null;
}

const statusItem = (status: string): string => {
  switch (status) {
    case 'ENVIADO_PELO_CLIENTE':
      return 'ENVIADO';
    case 'ACEITO':
      return 'APROVADO';
    case 'RECUSADO':
      return 'RECUSADO';
    default:
      return 'PENDENTE';
  }
};

const statusSolicitacao = (
  status: string,
  deadline: string | null | undefined,
  expiresAt?: string | null
): string => {
  if (status === STATUS_SOLICITACAO.CANCELADA || status === STATUS_SOLICITACAO.CONCLUIDA) {
    return status;
  }

  if (expiresAt) {
    const expira = new Date(expiresAt);
    if (!Number.isNaN(expira.getTime()) && expira.getTime() <= Date.now()) {
      return STATUS_SOLICITACAO.EXPIRADA;
    }
    return STATUS_SOLICITACAO.ABERTA;
  }

  // Registros legados sem validade persistida: mantém a regra antiga pelo prazo.
  const alvo = paraData(paraBR(deadline));
  if (alvo) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (alvo.getTime() < hoje.getTime()) return STATUS_SOLICITACAO.EXPIRADA;
  }

  return STATUS_SOLICITACAO.ABERTA;
};

const dataHora = (valor: string | null | undefined): { data: string; hora: string } => {
  if (!valor) return { data: '', hora: '' };
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return { data: '', hora: '' };
  return { data: formatarData(data), hora: formatarHora(data) };
};

const tentativas = (item: ChecklistItemDTO): SolicitacaoTentativa[] => {
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
      documentId: item.uploadedDocumentId ?? null,
    });
  }

  if (item.status === 'ACEITO') {
    const { data, hora } = dataHora(item.reviewedAt);
    resultado.push({
      id: `aprovacao-${item.id}`,
      data,
      hora,
      acao: 'APROVADO',
      arquivo: null,
      motivo: null,
      detalhes: null,
      canalOrigem: null,
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

const toItem = (item: ChecklistItemDTO): SolicitacaoItem => ({
  id: item.id,
  nome: item.description,
  formatoEsperado: item.expectedFileFormat ?? '',
  status: statusItem(item.status),
  tentativas: tentativas(item),
});

const toSolicitacao = (
  dto: RequestListItemDTO,
  opcoes: {
    criadoEm?: string | null;
    token?: string | null;
    deadline?: string | null;
    itens?: SolicitacaoItem[];
  } = {}
): Solicitacao => {
  const prazo = paraBR(dto.dueDate ?? opcoes.deadline ?? null);
  const criadoEm = dataHora(opcoes.criadoEm);
  const expiraEm = dto.publicTokenExpiresAt ?? null;
  const validade = expiraEm ? dataHora(expiraEm) : null;

  return {
    id: dto.id,
    clienteId: dto.customerId,
    titulo: dto.title,
    competencia: dto.competence,
    prazo,
    instrucoes: '',
    canal: 'Link público',
    token: opcoes.token ?? '',
    validadeAte: validade ? `${validade.data} ${validade.hora}` : prazo,
    validadeDias: 0,
    status: statusSolicitacao(dto.status, dto.dueDate ?? opcoes.deadline, expiraEm),
    criadoEm,
    itens: opcoes.itens ?? [],
    aceitos: dto.acceptedItems ?? 0,
    totalItens: dto.totalItems ?? 0,
    expiraEm,
  };
};

@Injectable({ providedIn: 'root' })
export class SolicitacaoService {
  private readonly http = inject(HttpClient);
  private readonly clientService = inject(ClientService);
  private readonly auditoria = inject(AuditoriaService);

  async list(): Promise<Solicitacao[]> {
    const clientes = await this.clientService.list();

    const porCliente = await Promise.all(
      clientes.map((cliente) =>
        firstValueFrom(
          this.http.get<RequestListItemDTO[]>(`/requests?customerId=${cliente.id}`)
        )
      )
    );

    return porCliente.flat().map((dto) => toSolicitacao(dto));
  }

  async listByCliente(clienteId: number | string): Promise<Solicitacao[]> {
    const response = await firstValueFrom(
      this.http.get<RequestListItemDTO[]>(`/requests?customerId=${clienteId}`)
    );
    return response.map((dto) => toSolicitacao(dto));
  }

  async getById(id: number | string): Promise<Solicitacao | null> {
    try {
      const dto = await firstValueFrom(
        this.http.get<RequestReadModelDTO>(`/requests/${id}`)
      );
      return toSolicitacao(dto, {
        criadoEm: dto.createdAt,
        itens: (dto.items ?? []).map(toItem),
      });
    } catch {
      return null;
    }
  }

  async create(dados: SolicitacaoNova): Promise<Solicitacao> {
    const body = {
      customerId: Number(dados.clienteId),
      title: dados.titulo,
      competence: dados.competencia,
      deadline: dataBRParaISO(dados.prazo),
      checklist: (dados.itens ?? []).map((item) => ({
        description: item.nome,
        expectedFileFormat: item.formato.toUpperCase(),
      })),
    };

    const dto = await firstValueFrom(
      this.http.post<RequestResponseDTO>('/requests', body)
    );

    return toSolicitacao(dto, {
      criadoEm: dto.createdIn,
      token: dto.publicToken,
      deadline: dto.deadline,
      itens: (dto.checklist ?? []).map(toItem),
    });
  }

  async aprovarItem(
    solicitacaoId: number | string,
    itemId: number | string
  ): Promise<Solicitacao | null> {
    await firstValueFrom(
      this.http.post(`/requests/${solicitacaoId}/items/${itemId}/accept`, {})
    );
    return this.getById(solicitacaoId);
  }

  async recusarItem(
    solicitacaoId: number | string,
    itemId: number | string,
    dados: { motivo: string; detalhes?: string }
  ): Promise<Solicitacao | null> {
    const reason = [dados.motivo, dados.detalhes].filter(Boolean).join(': ');
    await firstValueFrom(
      this.http.post(`/requests/${solicitacaoId}/items/${itemId}/reject`, { reason })
    );
    return this.getById(solicitacaoId);
  }

  async registrarRecebimentoManual(
    solicitacaoId: number | string,
    itemId: number | string,
    dados: { file: File }
  ): Promise<Solicitacao | null> {
    const form = new FormData();
    form.append('file', dados.file, dados.file.name);

    await firstValueFrom(
      this.http.post(`/requests/${solicitacaoId}/items/${itemId}/upload`, form)
    );
    return this.getById(solicitacaoId);
  }

  /**
   * RF31.1: renova o MESMO link público. `expiresAt` é ISO local (yyyy-MM-ddTHH:mm),
   * aceito diretamente pelo LocalDateTime do back-end.
   */
  async renovarLink(
    solicitacaoId: number | string,
    expiresAt: string
  ): Promise<Solicitacao | null> {
    await firstValueFrom(
      this.http.patch(`/requests/${solicitacaoId}/public-link/expiration`, { expiresAt })
    );
    return this.getById(solicitacaoId);
  }

  /** RF34.1: reabre solicitação concluída devolvendo um item ao fluxo. */
  async reabrir(
    solicitacaoId: number | string,
    dados: { itemId: number | string; itemStatus: 'PENDENTE' | 'RECUSADO'; reason?: string }
  ): Promise<Solicitacao | null> {
    await firstValueFrom(
      this.http.post(`/requests/${solicitacaoId}/reopen`, dados)
    );
    return this.getById(solicitacaoId);
  }

  historico(solicitacaoId: number | string): Promise<EventoAuditoria[]> {
    return this.auditoria.solicitacao(solicitacaoId);
  }
}
