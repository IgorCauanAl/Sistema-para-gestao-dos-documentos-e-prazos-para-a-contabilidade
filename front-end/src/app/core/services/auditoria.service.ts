import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { formatarData, formatarHora } from '../domain/data';
import type { EventoAuditoria } from '../domain/models';

interface AuditEventDTO {
  id: number;
  occurredAt: string;
  actor: string | null;
  action: string;
  entityType: string;
  entityId: number;
  customerId: number | null;
  ipAddress: string | null;
  channel: string | null;
  justification: string | null;
  metadata: string | null;
}

const paraEvento = (dto: AuditEventDTO): EventoAuditoria => {
  const quando = new Date(dto.occurredAt);
  return {
    id: dto.id,
    ocorridoEm: Number.isNaN(quando.getTime())
      ? dto.occurredAt
      : `${formatarData(quando)} ${formatarHora(quando)}`,
    ator: dto.actor,
    acao: dto.action,
    tipoEntidade: dto.entityType,
    entidadeId: dto.entityId,
    ip: dto.ipAddress,
    canal: dto.channel,
    justificativa: dto.justification,
    detalhes: dto.metadata,
  };
};

/**Histórico append-only das operações sensíveis (RF62.1). */
@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly http = inject(HttpClient);

  private async carregar(url: string): Promise<EventoAuditoria[]> {
    const eventos = await firstValueFrom(this.http.get<AuditEventDTO[]>(url));
    return (eventos ?? []).map(paraEvento);
  }

  prazo(prazoId: number | string): Promise<EventoAuditoria[]> {
    return this.carregar(`/deadlines/${prazoId}/history`);
  }

  solicitacao(solicitacaoId: number | string): Promise<EventoAuditoria[]> {
    return this.carregar(`/requests/${solicitacaoId}/history`);
  }

  documento(documentoId: number | string): Promise<EventoAuditoria[]> {
    return this.carregar(`/documents/${documentoId}/history`);
  }
}
