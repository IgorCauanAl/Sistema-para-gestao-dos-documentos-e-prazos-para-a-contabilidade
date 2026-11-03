import { SolicitacaoRepositoryPort } from '../ports/solicitacaoRepositoryPort';
import { StatusSolicitacao, StatusItem, calcularStatusSolicitacao, MotivoRecusa } from '../../../core/domain/solicitacao';
import { ANTECEDENCIA_PADRAO } from '../../../core/domain/documento';
import { agora, formatarData, ipAleatorio, somaDias, tokenAleatorio } from '../../../core/domain/data';

const clonar = (obj) => (typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj)));

const criarItem = (id, nome, formatoEsperado, status, tentativas = []) => ({
  id,
  nome,
  formatoEsperado,
  status,
  tentativas,
});

const criarTentativa = (data, hora, acao, extra = {}) => ({
  id: `${data}-${hora}-${acao}-${Math.random().toString(36).slice(2, 7)}`,
  data,
  hora,
  acao,
  arquivo: null,
  motivo: null,
  detalhes: null,
  canalOrigem: null,
  ip: ipAleatorio(),
  protocolo: null,
  observacao: null,
  ...extra,
});

let protocoloSeq = 123;
const proximoProtocolo = () => {
  protocoloSeq += 1;
  return `PROT-${new Date().getFullYear()}-${String(protocoloSeq).padStart(6, '0')}`;
};

const initialSolicitacoes = [
  {
    id: 1,
    clienteId: 1,
    titulo: 'Documentos de 09/2026',
    competencia: '09/2026',
    prazo: '15/10/2026',
    instrucoes:
      'Envie os arquivos em PDF, nomeados com a competência. Em caso de dúvidas, chame no WhatsApp do escritório.',
    canal: 'WhatsApp',
    token: 'a8f3c2e19b7d',
    validadeAte: '15/10/2026',
    validadeDias: 7,
    status: StatusSolicitacao.EM_CONFERENCIA,
    criadoEm: { data: '30/09/2026', hora: '16:10' },
    itens: [
      criarItem(11, 'Extrato bancário', 'PDF', StatusItem.APROVADO, [
        criarTentativa('01/10/2026', '10:20', 'ENVIADO', {
          arquivo: { nome: 'extrato_banco_set.pdf', tamanho: '512 KB' },
          protocolo: 'PROT-2026-000118',
        }),
        criarTentativa('02/10/2026', '09:05', 'APROVADO'),
      ]),
      criarItem(12, 'Notas fiscais', 'PDF', StatusItem.ENVIADO, [
        criarTentativa('06/10/2026', '14:32', 'ENVIADO', {
          arquivo: { nome: 'notas_setembro.pdf', tamanho: '2,3 MB' },
          protocolo: 'PROT-2026-000121',
        }),
      ]),
      criarItem(13, 'Folha de ponto', 'PDF', StatusItem.RECUSADO, [
        criarTentativa('04/10/2026', '08:50', 'ENVIADO', {
          arquivo: { nome: 'folha_ponto_set.pdf', tamanho: '1,1 MB' },
          protocolo: 'PROT-2026-000119',
        }),
        criarTentativa('05/10/2026', '11:15', 'RECUSADO', {
          motivo: MotivoRecusa.INCOMPLETO,
          detalhes: 'faltam as páginas 3 e 4',
        }),
      ]),
    ],
  },
  {
    id: 2,
    clienteId: 1,
    titulo: 'Fluxo de caixa 08/2026',
    competencia: '08/2026',
    prazo: '30/09/2026',
    instrucoes: '',
    canal: 'E-mail',
    token: 'f1e2d3c4b5a6',
    validadeAte: '31/10/2026',
    validadeDias: 30,
    status: StatusSolicitacao.CONCLUIDA,
    criadoEm: { data: '20/09/2026', hora: '09:00' },
    itens: [
      criarItem(21, 'Fluxo de caixa', 'XLSX', StatusItem.APROVADO, [
        criarTentativa('22/09/2026', '11:40', 'ENVIADO', {
          arquivo: { nome: 'fluxo_caixa_082026.xlsx', tamanho: '86 KB' },
          protocolo: 'PROT-2026-000101',
        }),
        criarTentativa('23/09/2026', '10:12', 'APROVADO'),
      ]),
      criarItem(22, 'Extrato bancário', 'PDF', StatusItem.APROVADO, [
        criarTentativa('22/09/2026', '11:41', 'ENVIADO', {
          arquivo: { nome: 'extrato_banco_ago.pdf', tamanho: '480 KB' },
          protocolo: 'PROT-2026-000102',
        }),
        criarTentativa('23/09/2026', '10:14', 'APROVADO'),
      ]),
    ],
  },
  {
    id: 3,
    clienteId: 2,
    titulo: 'Documentos de 09/2026',
    competencia: '09/2026',
    prazo: formatarData(somaDias(5)),
    instrucoes: 'Prioridade para o extrato bancário atualizado.',
    canal: 'E-mail',
    token: 'c4d5e6f7a8b9',
    validadeAte: formatarData(somaDias(7)),
    validadeDias: 7,
    status: StatusSolicitacao.ABERTA,
    criadoEm: { data: formatarData(new Date()), hora: '08:20' },
    itens: [
      criarItem(31, 'Extrato bancário', 'PDF', StatusItem.PENDENTE),
      criarItem(32, 'Recibos', 'Qualquer', StatusItem.PENDENTE),
    ],
  },
];

const createInMemorySolicitacaoRepository = () => {
  let solicitacoes = clonar(initialSolicitacoes);

  const salvar = (sol) => {
    sol.status = calcularStatusSolicitacao(sol);
    return clonar(sol);
  };

  const encontrar = (id) => solicitacoes.find((sol) => sol.id === Number(id));

  return {
    ...SolicitacaoRepositoryPort,

    async list() {
      return clonar(solicitacoes);
    },

    async getById(id) {
      const sol = encontrar(id);
      return sol ? clonar(sol) : null;
    },

    async getByToken(token) {
      const sol = solicitacoes.find((item) => item.token === token);
      return sol ? clonar(sol) : null;
    },

    async create({ clienteId, titulo, competencia, prazo, instrucoes, canal, validadeDias, itens, enviarAgora }) {
      const nova = {
        id: Date.now(),
        clienteId: Number(clienteId),
        titulo,
        competencia,
        prazo,
        instrucoes: instrucoes ?? '',
        canal,
        token: tokenAleatorio(),
        validadeDias: Number(validadeDias),
        validadeAte: formatarData(somaDias(Number(validadeDias))),
        status: StatusSolicitacao.ABERTA,
        criadoEm: agora(),
        itens: (itens ?? []).map((item, index) => criarItem(Date.now() + index, item.nome, item.formato, StatusItem.PENDENTE)),
      };

      solicitacoes = [...solicitacoes, nova];
      return salvar(nova);
    },

    async renovarLink(id) {
      const sol = encontrar(id);
      if (!sol) return null;
      sol.validadeAte = formatarData(somaDias(sol.validadeDias ?? 7));
      return salvar(sol);
    },

    async cancelar(id) {
      const sol = encontrar(id);
      if (!sol) return null;
      sol.status = StatusSolicitacao.CANCELADA;
      return salvar(sol);
    },

    async aprovarItem(solicitacaoId, itemId, { competencia, vencimento, diasAntecedencia } = {}) {
      const sol = encontrar(solicitacaoId);
      const item = sol?.itens.find((i) => i.id === Number(itemId));
      if (!item) return null;

      const { data, hora } = agora();
      item.status = StatusItem.APROVADO;
      item.competencia = competencia ?? sol.competencia;
      item.vencimento = vencimento ?? null;
      item.diasAntecedencia = diasAntecedencia ?? ANTECEDENCIA_PADRAO;
      item.tentativas = [
        ...item.tentativas,
        criarTentativa(data, hora, 'APROVADO', {
          competencia: item.competencia,
          vencimento: item.vencimento,
        }),
      ];
      return salvar(sol);
    },

    async recusarItem(solicitacaoId, itemId, { motivo, detalhes }) {
      const sol = encontrar(solicitacaoId);
      const item = sol?.itens.find((i) => i.id === Number(itemId));
      if (!item) return null;

      const { data, hora } = agora();
      item.status = StatusItem.RECUSADO;
      item.tentativas = [...item.tentativas, criarTentativa(data, hora, 'RECUSADO', { motivo, detalhes })];
      return salvar(sol);
    },

    async registrarRecebimentoManual(solicitacaoId, itemId, { arquivo, canalOrigem, vencimento, diasAntecedencia, observacao }) {
      const sol = encontrar(solicitacaoId);
      const item = sol?.itens.find((i) => i.id === Number(itemId));
      if (!item) return null;

      const { data, hora } = agora();
      item.status = StatusItem.ENVIADO;
      item.tentativas = [
        ...item.tentativas,
        criarTentativa(data, hora, 'REGISTRO_MANUAL', { arquivo, canalOrigem, vencimento, diasAntecedencia, observacao }),
      ];
      return salvar(sol);
    },

    async enviarPeloPortal(token, itemId, { arquivo, observacao }) {
      const sol = solicitacoes.find((item) => item.token === token);
      if (!sol || sol.status === StatusSolicitacao.CANCELADA) return null;

      const item = sol.itens.find((i) => i.id === Number(itemId));
      if (!item || item.status === StatusItem.APROVADO) return null;

      const { data, hora } = agora();
      const eraRecusado = item.status === StatusItem.RECUSADO;
      const protocolo = proximoProtocolo();
      const tentativa = criarTentativa(data, hora, eraRecusado ? 'REENVIADO' : 'ENVIADO', {
        arquivo,
        observacao,
        protocolo,
      });

      item.status = StatusItem.ENVIADO;
      item.tentativas = [...item.tentativas, tentativa];

      return { solicitacao: salvar(sol), protocolo, tentativa: clonar(tentativa) };
    },
  };
};

export const inMemorySolicitacaoRepository = createInMemorySolicitacaoRepository();
