import { Injectable } from '@angular/core';

import { agora } from '../domain/data';
import type { Prazo, PrazoEvento } from '../domain/models';
import {
  calcularPrioridade,
  diasRestantes,
  estaAtrasado,
  ETAPAS_PADRAO,
  HOJE,
  motivoReprogramacaoLabel,
  modeloPorId,
  Prioridade,
  StatusPrazo,
} from '../domain/prazo';

const clonar = <T>(obj: T): T => structuredClone(obj);

let eventoSeq = 1000;
const ev = (tipo: string, descricao: string, data: string, hora: string): PrazoEvento => ({
  id: `ev-${eventoSeq++}`,
  tipo,
  descricao,
  data,
  hora,
});

const criarPrazo = (dados: {
  id: number;
  clienteId: number;
  modeloId: string;
  competencia: string;
  vencimentoOriginal?: string;
  vencimentoAtual: string;
  status: string;
  etapaAtual?: number;
  etapasConcluidas?: number[];
  prioridadeManual?: boolean;
  prioridade?: string;
  historico?: PrazoEvento[];
  solicitacaoId?: number | null;
  entregueEm?: { data: string; hora: string } | null;
}): Prazo => {
  const modelo = modeloPorId(dados.modeloId)!;
  return {
    id: dados.id,
    clienteId: dados.clienteId,
    modeloId: dados.modeloId,
    obrigacao: modelo.nome,
    categoria: modelo.categoria,
    competencia: dados.competencia,
    vencimentoOriginal: dados.vencimentoOriginal ?? dados.vencimentoAtual,
    vencimentoAtual: dados.vencimentoAtual,
    prioridade: dados.prioridade ?? calcularPrioridade(dados.vencimentoAtual),
    prioridadeManual: dados.prioridadeManual ?? false,
    status: dados.status,
    etapaAtual: dados.etapaAtual ?? 0,
    etapasConcluidas: [...(dados.etapasConcluidas ?? [])],
    historico: [...(dados.historico ?? [])],
    solicitacaoId: dados.solicitacaoId ?? null,
    entregueEm: dados.entregueEm ?? null,
  };
};

const estadoFinal = () => ETAPAS_PADRAO.map((_, index) => index);

const initialPrazos: Prazo[] = [
  criarPrazo({
    id: 1,
    clienteId: 1,
    modeloId: 'ESOCIAL',
    competencia: '09/2026',
    vencimentoAtual: '15/09/2026',
    status: StatusPrazo.ENTREGUE,
    etapaAtual: 4,
    etapasConcluidas: estadoFinal(),
    entregueEm: { data: '14/09/2026', hora: '10:20' },
    historico: [
      ev('CRIACAO', 'Prazo criado a partir do modelo eSocial.', '01/09/2026', '08:10'),
      ev('ENTREGA', 'Prazo marcado como entregue.', '14/09/2026', '10:20'),
    ],
  }),
  criarPrazo({
    id: 2,
    clienteId: 1,
    modeloId: 'DAS',
    competencia: '09/2026',
    vencimentoOriginal: '20/09/2026',
    vencimentoAtual: '18/09/2026',
    status: StatusPrazo.ENTREGUE,
    etapaAtual: 4,
    etapasConcluidas: estadoFinal(),
    entregueEm: { data: '17/09/2026', hora: '16:05' },
    historico: [
      ev('CRIACAO', 'Prazo criado a partir do modelo DAS.', '01/09/2026', '08:12'),
      ev(
        'REPROGRAMACAO',
        'Vencimento ajustado para 18/09/2026 (20/09/2026 caiu em dia não útil).',
        '02/09/2026',
        '09:00'
      ),
      ev('ENTREGA', 'Prazo marcado como entregue.', '17/09/2026', '16:05'),
    ],
  }),
  criarPrazo({
    id: 3,
    clienteId: 1,
    modeloId: 'DCTF',
    competencia: '09/2026',
    vencimentoAtual: '06/10/2026',
    status: StatusPrazo.EM_ANDAMENTO,
    etapaAtual: 2,
    etapasConcluidas: [0, 1],
    historico: [
      ev('CRIACAO', 'Prazo criado a partir do modelo DCTF.', '01/10/2026', '08:15'),
      ev('ETAPA', 'Etapa "Receber dados" concluída.', '02/10/2026', '09:40'),
      ev('ETAPA', 'Etapa "Conferir" concluída.', '05/10/2026', '11:05'),
    ],
  }),
  criarPrazo({
    id: 4,
    clienteId: 1,
    modeloId: 'FGTS',
    competencia: '09/2026',
    vencimentoOriginal: '07/10/2026',
    vencimentoAtual: '09/10/2026',
    status: StatusPrazo.EM_ANDAMENTO,
    etapaAtual: 3,
    etapasConcluidas: [0, 1, 2],
    historico: [
      ev('CRIACAO', 'Prazo criado a partir do modelo FGTS.', '01/10/2026', '08:20'),
      ev('ETAPA', 'Etapa "Receber dados" concluída.', '02/10/2026', '09:10'),
      ev('ETAPA', 'Etapa "Conferir" concluída.', '05/10/2026', '10:30'),
      ev('ETAPA', 'Etapa "Apurar" concluída.', '07/10/2026', '15:00'),
      ev('REPROGRAMACAO', 'Vencimento reprogramado (Recálculo de guia).', '08/10/2026', '08:35'),
    ],
  }),
  criarPrazo({
    id: 5,
    clienteId: 1,
    modeloId: 'FOLHA',
    competencia: '10/2026',
    vencimentoAtual: '08/10/2026',
    status: StatusPrazo.PENDENTE,
    historico: [ev('CRIACAO', 'Prazo criado a partir do modelo Folha de pagamento.', '01/10/2026', '08:25')],
  }),
  criarPrazo({
    id: 6,
    clienteId: 1,
    modeloId: 'DAS',
    competencia: '10/2026',
    vencimentoAtual: '20/10/2026',
    status: StatusPrazo.PENDENTE,
    prioridadeManual: true,
    prioridade: Prioridade.BAIXA,
    historico: [
      ev('CRIACAO', 'Prazo criado a partir do modelo DAS.', '01/10/2026', '08:26'),
      ev('PRIORIDADE', 'Prioridade definida manualmente como Baixa.', '03/10/2026', '14:00'),
    ],
  }),
  criarPrazo({
    id: 7,
    clienteId: 1,
    modeloId: 'ESOCIAL',
    competencia: '10/2026',
    vencimentoAtual: '16/10/2026',
    status: StatusPrazo.PENDENTE,
    historico: [ev('CRIACAO', 'Prazo criado a partir do modelo eSocial.', '01/10/2026', '08:27')],
  }),
  criarPrazo({
    id: 8,
    clienteId: 2,
    modeloId: 'FOLHA',
    competencia: '10/2026',
    vencimentoAtual: '09/10/2026',
    status: StatusPrazo.AGUARDANDO_CLIENTE,
    solicitacaoId: 3,
    prioridadeManual: true,
    prioridade: Prioridade.ALTA,
    historico: [
      ev('CRIACAO', 'Prazo criado a partir do modelo Folha de pagamento.', '01/10/2026', '08:30'),
      ev('SOLICITACAO', 'Solicitação de documentos enviada ao cliente (#3).', '02/10/2026', '09:00'),
    ],
  }),
  criarPrazo({
    id: 9,
    clienteId: 2,
    modeloId: 'FGTS',
    competencia: '10/2026',
    vencimentoAtual: '09/10/2026',
    status: StatusPrazo.PENDENTE,
    historico: [ev('CRIACAO', 'Prazo criado a partir do modelo FGTS.', '01/10/2026', '08:31')],
  }),
  criarPrazo({
    id: 10,
    clienteId: 2,
    modeloId: 'DRE',
    competencia: '10/2026',
    vencimentoAtual: '10/10/2026',
    status: StatusPrazo.PENDENTE,
    historico: [ev('CRIACAO', 'Prazo criado a partir do modelo DRE.', '01/10/2026', '08:32')],
  }),
  criarPrazo({
    id: 11,
    clienteId: 2,
    modeloId: 'DCTF',
    competencia: '10/2026',
    vencimentoAtual: '15/10/2026',
    status: StatusPrazo.PENDENTE,
    historico: [ev('CRIACAO', 'Prazo criado a partir do modelo DCTF.', '01/10/2026', '08:33')],
  }),
  criarPrazo({
    id: 12,
    clienteId: 2,
    modeloId: 'DAS',
    competencia: '10/2026',
    vencimentoAtual: '20/10/2026',
    status: StatusPrazo.PENDENTE,
    historico: [ev('CRIACAO', 'Prazo criado a partir do modelo DAS.', '01/10/2026', '08:34')],
  }),
  criarPrazo({
    id: 13,
    clienteId: 2,
    modeloId: 'ESOCIAL',
    competencia: '10/2026',
    vencimentoAtual: '15/10/2026',
    status: StatusPrazo.PENDENTE,
    historico: [ev('CRIACAO', 'Prazo criado a partir do modelo eSocial.', '01/10/2026', '08:35')],
  }),
];

export interface AlertasPrazo {
  atrasados: Prazo[];
  semana: Prazo[];
  janela: Prazo[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class PrazoService {
  private prazos: Prazo[] = initialPrazos.map(clonar);

  private encontrar(id: number | string): Prazo | undefined {
    return this.prazos.find((prazo) => prazo.id === Number(id));
  }

  private anexarEvento(
    prazo: Prazo,
    tipo: string,
    descricao: string,
    { data, hora }: { data: string; hora: string } = agora()
  ): void {
    prazo.historico = [...prazo.historico, ev(tipo, descricao, data, hora)];
  }

  private recalcularEtapaAtual(prazo: Prazo): void {
    const etapa = ETAPAS_PADRAO.findIndex((_, index) => !prazo.etapasConcluidas.includes(index));
    prazo.etapaAtual = etapa === -1 ? ETAPAS_PADRAO.length - 1 : etapa;
  }

  async list(): Promise<Prazo[]> {
    return this.prazos.map(clonar);
  }

  async getById(id: number | string): Promise<Prazo | null> {
    const prazo = this.encontrar(id);
    return prazo ? clonar(prazo) : null;
  }

  async listByCliente(clienteId: number | string): Promise<Prazo[]> {
    return this.prazos.filter((prazo) => prazo.clienteId === Number(clienteId)).map(clonar);
  }

  async concluirEtapa(prazoId: number | string, etapaIndice: number): Promise<Prazo | null> {
    const prazo = this.encontrar(prazoId);
    if (!prazo) return null;

    const concluida = prazo.etapasConcluidas.includes(etapaIndice);
    prazo.etapasConcluidas = concluida
      ? prazo.etapasConcluidas.filter((index) => index !== etapaIndice)
      : [...prazo.etapasConcluidas, etapaIndice].sort((a, b) => a - b);

    if (prazo.status !== StatusPrazo.ENTREGUE) {
      prazo.status = StatusPrazo.EM_ANDAMENTO;
    }
    this.recalcularEtapaAtual(prazo);

    const nomeEtapa = ETAPAS_PADRAO[etapaIndice] ?? 'Etapa';
    this.anexarEvento(
      prazo,
      'ETAPA',
      concluida ? `Etapa "${nomeEtapa}" desmarcada.` : `Etapa "${nomeEtapa}" concluída.`
    );

    return clonar(prazo);
  }

  async marcarEntregue(prazoId: number | string): Promise<Prazo | null> {
    const prazo = this.encontrar(prazoId);
    if (!prazo) return null;

    prazo.status = StatusPrazo.ENTREGUE;
    prazo.etapasConcluidas = estadoFinal();
    prazo.etapaAtual = ETAPAS_PADRAO.length - 1;
    prazo.entregueEm = agora();
    this.anexarEvento(prazo, 'ENTREGA', 'Prazo marcado como entregue.');

    return clonar(prazo);
  }

  async reprogramar(
    prazoId: number | string,
    dados: { novaData: string; motivo: string; observacao?: string }
  ): Promise<Prazo | null> {
    const prazo = this.encontrar(prazoId);
    if (!prazo) return null;

    prazo.vencimentoAtual = dados.novaData;
    if (!prazo.prioridadeManual) {
      prazo.prioridade = calcularPrioridade(dados.novaData);
    }
    const rotuloMotivo = motivoReprogramacaoLabel[dados.motivo] ?? dados.motivo;
    this.anexarEvento(
      prazo,
      'REPROGRAMACAO',
      `Vencimento reprogramado para ${dados.novaData} (${rotuloMotivo})${dados.observacao ? ` — ${dados.observacao}` : ''}.`
    );

    return clonar(prazo);
  }

  async definirPrioridade(prazoId: number | string, prioridade: string): Promise<Prazo | null> {
    const prazo = this.encontrar(prazoId);
    if (!prazo) return null;

    prazo.prioridade = prioridade;
    prazo.prioridadeManual = true;
    this.anexarEvento(prazo, 'PRIORIDADE', `Prioridade definida manualmente como ${prioridade}.`);

    return clonar(prazo);
  }

  async vincularSolicitacao(prazoId: number | string, solicitacaoId: number | string): Promise<Prazo | null> {
    const prazo = this.encontrar(prazoId);
    if (!prazo) return null;

    prazo.solicitacaoId = Number(solicitacaoId);
    prazo.status = StatusPrazo.AGUARDANDO_CLIENTE;
    this.anexarEvento(prazo, 'SOLICITACAO', `Solicitação de documentos enviada ao cliente (#${solicitacaoId}).`);

    return clonar(prazo);
  }

  async atualizarStatus(prazoId: number | string, status: string): Promise<Prazo | null> {
    const prazo = this.encontrar(prazoId);
    if (!prazo) return null;

    prazo.status = status;
    if (status === StatusPrazo.EM_ANDAMENTO) this.recalcularEtapaAtual(prazo);

    return clonar(prazo);
  }

  async concluirPorSolicitacao(solicitacaoId: number | string): Promise<Prazo[]> {
    const atualizados = this.prazos.filter(
      (prazo) =>
        prazo.solicitacaoId === Number(solicitacaoId) && prazo.status === StatusPrazo.AGUARDANDO_CLIENTE
    );

    atualizados.forEach((prazo) => {
      prazo.status = StatusPrazo.EM_ANDAMENTO;
      this.anexarEvento(prazo, 'SOLICITACAO', 'Solicitação concluída pelo cliente — prazo retomado.');
    });

    return atualizados.map(clonar);
  }

  async getAlertas(hoje: Date = HOJE): Promise<AlertasPrazo> {
    const abertos = this.prazos.filter((prazo) => prazo.status !== StatusPrazo.ENTREGUE);

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
      atrasados: atrasados.map(clonar),
      semana: semana.map(clonar),
      janela: janela.map(clonar),
      total: atrasados.length + semana.length + janela.length,
    };
  }
}
