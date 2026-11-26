import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { formatarData, formatarHora, paraBR } from '../domain/data';
import type { EventoAuditoria, Prazo } from '../domain/models';
import { AuditoriaService } from './auditoria.service';
import {
  calcularPrioridade,
  diasRestantes,
  estaAtrasado,
  modeloPorId,
  OBRIGACOES_MODELO,
  StatusPrazo,
} from '../domain/prazo';

interface DeadlineListItemDTO {
  id: number;
  customerId: number;
  customerName: string;
  obligation: string;
  category: string;
  competence: string;
  dueDate: string;
  priority: 'ALTA' | 'MEDIA' | 'BAIXA';
  currentStage:
    | 'RECEBIDO'
    | 'EM_ANDAMENTO'
    | 'AGUARDANDO_CLIENTE'
    | 'AGUARDANDO_ORGAO'
    | 'CONCLUIDO';
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  deliveredOn?: string | null;
  overdue: boolean;
}

export interface AlertasPrazo {
  atrasados: Prazo[];
  semana: Prazo[];
  janela: Prazo[];
  total: number;
}

const ETAPAS_POR_ESTAGIO: Record<DeadlineListItemDTO['currentStage'], number> = {
  RECEBIDO: 0,
  EM_ANDAMENTO: 1,
  AGUARDANDO_CLIENTE: 2,
  AGUARDANDO_ORGAO: 3,
  CONCLUIDO: 4,
};

const STATUS_POR_ESTADO_BACKEND: Record<DeadlineListItemDTO['status'], string> = {
  PENDENTE: StatusPrazo.PENDENTE,
  EM_ANDAMENTO: StatusPrazo.EM_ANDAMENTO,
  CONCLUIDO: StatusPrazo.ENTREGUE,
  CANCELADO: StatusPrazo.CANCELADO,
};

const modeloPorObrigacao = (obrigacao: string): string => {
  const nome = obrigacao.trim().toLowerCase();
  return (
    OBRIGACOES_MODELO.find((modelo) => modelo.nome.toLowerCase() === nome)?.id ??
    OBRIGACOES_MODELO.find((modelo) => modelo.id.toLowerCase() === nome)?.id ??
    ''
  );
};

const paraDataHora = (valor: string | null | undefined) => {
  if (!valor) return null;
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return null;
  return { data: formatarData(data), hora: formatarHora(data) };
};

const toPrazo = (dto: DeadlineListItemDTO): Prazo => {
  const vencimentoAtual = paraBR(dto.dueDate);
  const etapaAtual = ETAPAS_POR_ESTAGIO[dto.currentStage] ?? 0;

  return {
    id: dto.id,
    clienteId: dto.customerId,
    modeloId: modeloPorObrigacao(dto.obligation),
    obrigacao: dto.obligation,
    categoria: dto.category,
    competencia: dto.competence,
    vencimentoAtual,
    prioridade: dto.priority ?? calcularPrioridade(vencimentoAtual),
    prioridadeManual: false,
    status: STATUS_POR_ESTADO_BACKEND[dto.status] ?? StatusPrazo.PENDENTE,
    etapaAtual,
    etapasConcluidas: Array.from({ length: etapaAtual }, (_, indice) => indice),
    historico: [],
    solicitacaoId: null,
    entregueEm: paraDataHora(dto.deliveredOn),
    overdue: dto.overdue,
  };
};

/** Alertas calculados somente a partir dos prazos persistidos na API. */
export const calcularAlertas = (prazos: Prazo[], hoje: Date = new Date()): AlertasPrazo => {
  const abertos = prazos.filter(
    (prazo) => prazo.status !== StatusPrazo.ENTREGUE && prazo.status !== StatusPrazo.CANCELADO
  );

  const atrasados = abertos.filter((prazo) => estaAtrasado(prazo, hoje));
  const semana = abertos.filter((prazo) => {
    const dias = diasRestantes(prazo, hoje);
    return dias !== null && dias >= 0 && dias <= 7;
  });
  const janela = abertos.filter((prazo) => {
    const dias = diasRestantes(prazo, hoje);
    const antecedencia = modeloPorId(prazo.modeloId)?.antecedenciaAlertaDias ?? 7;
    return dias !== null && dias > 7 && dias <= antecedencia;
  });

  return {
    atrasados,
    semana,
    janela,
    total: atrasados.length + semana.length + janela.length,
  };
};

@Injectable({ providedIn: 'root' })
export class PrazoService {
  private readonly http = inject(HttpClient);
  private readonly auditoria = inject(AuditoriaService);

  async list(): Promise<Prazo[]> {
    const response = await firstValueFrom(
      this.http.get<DeadlineListItemDTO[]>('/deadlines')
    );
    return response.map(toPrazo);
  }

  /** Não existe endpoint de detalhe: o read model da listagem contém todos os campos exibidos. */
  async getById(id: number | string): Promise<Prazo | null> {
    const prazos = await this.list();
    return prazos.find((prazo) => prazo.id === Number(id)) ?? null;
  }

  async listByCliente(clienteId: number | string): Promise<Prazo[]> {
    const response = await firstValueFrom(
      this.http.get<DeadlineListItemDTO[]>(`/deadlines/customer/${clienteId}`)
    );
    return response.map(toPrazo);
  }

  async marcarEntregue(prazoId: number | string): Promise<Prazo | null> {
    await firstValueFrom(this.http.patch(`/deadlines/${prazoId}/deliver`, {}));
    return this.getById(prazoId);
  }

  /** RF58.1: avança/retrocede etapa; CONCLUIDO do checklist não entrega o prazo. */
  async moverEtapa(
    prazoId: number | string,
    etapa: DeadlineListItemDTO['currentStage']
  ): Promise<Prazo | null> {
    await firstValueFrom(
      this.http.patch(`/deadlines/${prazoId}/stage`, { stage: etapa })
    );
    return this.getById(prazoId);
  }

  /** RF62.1: reabertura exige justificativa e fica registrada na auditoria. */
  async reabrir(
    prazoId: number | string,
    justificativa: string
  ): Promise<Prazo | null> {
    await firstValueFrom(
      this.http.post(`/deadlines/${prazoId}/reopen`, { justification: justificativa })
    );
    return this.getById(prazoId);
  }

  historico(prazoId: number | string): Promise<EventoAuditoria[]> {
    return this.auditoria.prazo(prazoId);
  }

  async remove(prazoId: number | string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/deadlines/${prazoId}`));
  }

  async getAlertas(hoje: Date = new Date()): Promise<AlertasPrazo> {
    return calcularAlertas(await this.list(), hoje);
  }
}
