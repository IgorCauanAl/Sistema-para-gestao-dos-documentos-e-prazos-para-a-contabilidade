import { PrazoRepositoryPort } from '../ports/prazoRepositoryPort';
import {
  StatusPrazo,
  Prioridade,
  motivoReprogramacaoLabel,
  modeloPorId,
  ETAPAS_PADRAO,
  calcularPrioridade,
  diasRestantes,
  estaAtrasado,
  HOJE,
} from '../../../core/domain/prazo';
import { agora } from '../../../core/domain/data';

const clonar = (obj) =>
  typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));

let eventoSeq = 1000;
const ev = (tipo, descricao, data, hora) => ({
  id: `ev-${eventoSeq++}`,
  tipo,
  descricao,
  data,
  hora,
});

const criarPrazo = ({
  id,
  clienteId,
  modeloId,
  competencia,
  vencimentoOriginal,
  vencimentoAtual,
  status,
  etapaAtual = 0,
  etapasConcluidas = [],
  prioridadeManual = false,
  prioridade,
  historico = [],
  solicitacaoId = null,
  entregueEm = null,
}) => {
  const modelo = modeloPorId(modeloId);
  return {
    id,
    clienteId,
    modeloId,
    obrigacao: modelo.nome,
    categoria: modelo.categoria,
    competencia,
    vencimentoOriginal: vencimentoOriginal ?? vencimentoAtual,
    vencimentoAtual,
    prioridade: prioridade ?? calcularPrioridade(vencimentoAtual),
    prioridadeManual,
    status,
    etapaAtual,
    etapasConcluidas: [...etapasConcluidas],
    historico: [...historico],
    solicitacaoId,
    entregueEm,
  };
};

const estadoFinal = () => ETAPAS_PADRAO.map((_, index) => index);

const initialPrazos = [
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
      ev('REPROGRAMACAO', 'Vencimento ajustado para 18/09/2026 (20/09/2026 caiu em dia não útil).', '02/09/2026', '09:00'),
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

const createInMemoryPrazoRepository = () => {
  let prazos = initialPrazos.map(clonar);

  const encontrar = (id) => prazos.find((prazo) => prazo.id === Number(id));

  const anexarEvento = (prazo, tipo, descricao, { data, hora } = agora()) => {
    prazo.historico = [...prazo.historico, ev(tipo, descricao, data, hora)];
  };

  const recalcularEtapaAtual = (prazo) => {
    const etapa = ETAPAS_PADRAO.findIndex((_, index) => !prazo.etapasConcluidas.includes(index));
    prazo.etapaAtual = etapa === -1 ? ETAPAS_PADRAO.length - 1 : etapa;
  };

  return {
    ...PrazoRepositoryPort,

    async list() {
      return prazos.map(clonar);
    },

    async getById(id) {
      const prazo = encontrar(id);
      return prazo ? clonar(prazo) : null;
    },

    async listByCliente(clienteId) {
      return prazos.filter((prazo) => prazo.clienteId === Number(clienteId)).map(clonar);
    },

    async concluirEtapa(prazoId, etapaIndice) {
      const prazo = encontrar(prazoId);
      if (!prazo) return null;

      const concluida = prazo.etapasConcluidas.includes(etapaIndice);
      prazo.etapasConcluidas = concluida
        ? prazo.etapasConcluidas.filter((index) => index !== etapaIndice)
        : [...prazo.etapasConcluidas, etapaIndice].sort((a, b) => a - b);

      if (prazo.status !== StatusPrazo.ENTREGUE) {
        prazo.status = StatusPrazo.EM_ANDAMENTO;
      }
      recalcularEtapaAtual(prazo);

      const nomeEtapa = ETAPAS_PADRAO[etapaIndice] ?? 'Etapa';
      anexarEvento(
        prazo,
        'ETAPA',
        concluida ? `Etapa "${nomeEtapa}" desmarcada.` : `Etapa "${nomeEtapa}" concluída.`
      );

      return clonar(prazo);
    },

    async marcarEntregue(prazoId) {
      const prazo = encontrar(prazoId);
      if (!prazo) return null;

      prazo.status = StatusPrazo.ENTREGUE;
      prazo.etapasConcluidas = estadoFinal();
      prazo.etapaAtual = ETAPAS_PADRAO.length - 1;
      prazo.entregueEm = agora();
      anexarEvento(prazo, 'ENTREGA', 'Prazo marcado como entregue.');

      return clonar(prazo);
    },

    async reprogramar(prazoId, { novaData, motivo, observacao }) {
      const prazo = encontrar(prazoId);
      if (!prazo) return null;

      prazo.vencimentoAtual = novaData;
      if (!prazo.prioridadeManual) {
        prazo.prioridade = calcularPrioridade(novaData);
      }
      const rotuloMotivo = motivoReprogramacaoLabel[motivo] ?? motivo;
      anexarEvento(
        prazo,
        'REPROGRAMACAO',
        `Vencimento reprogramado para ${novaData} (${rotuloMotivo})${observacao ? ` — ${observacao}` : ''}.`
      );

      return clonar(prazo);
    },

    async definirPrioridade(prazoId, prioridade) {
      const prazo = encontrar(prazoId);
      if (!prazo) return null;

      prazo.prioridade = prioridade;
      prazo.prioridadeManual = true;
      anexarEvento(prazo, 'PRIORIDADE', `Prioridade definida manualmente como ${prioridade}.`);

      return clonar(prazo);
    },

    async vincularSolicitacao(prazoId, solicitacaoId) {
      const prazo = encontrar(prazoId);
      if (!prazo) return null;

      prazo.solicitacaoId = Number(solicitacaoId);
      prazo.status = StatusPrazo.AGUARDANDO_CLIENTE;
      anexarEvento(prazo, 'SOLICITACAO', `Solicitação de documentos enviada ao cliente (#${solicitacaoId}).`);

      return clonar(prazo);
    },

    async atualizarStatus(prazoId, status) {
      const prazo = encontrar(prazoId);
      if (!prazo) return null;

      prazo.status = status;
      if (status === StatusPrazo.EM_ANDAMENTO) recalcularEtapaAtual(prazo);

      return clonar(prazo);
    },

    async concluirPorSolicitacao(solicitacaoId) {
      const atualizados = prazos.filter(
        (prazo) => prazo.solicitacaoId === Number(solicitacaoId) && prazo.status === StatusPrazo.AGUARDANDO_CLIENTE
      );

      atualizados.forEach((prazo) => {
        prazo.status = StatusPrazo.EM_ANDAMENTO;
        anexarEvento(prazo, 'SOLICITACAO', 'Solicitação concluída pelo cliente — prazo retomado.');
      });

      return atualizados.map(clonar);
    },

    async getAlertas(hoje = HOJE) {
      const abertos = prazos.filter((prazo) => prazo.status !== StatusPrazo.ENTREGUE);

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
    },
  };
};

export const inMemoryPrazoRepository = createInMemoryPrazoRepository();
