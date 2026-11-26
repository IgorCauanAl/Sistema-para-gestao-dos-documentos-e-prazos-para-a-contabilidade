import { formatarData, paraData } from './data';
import type { Prazo } from './models';

export const HOJE = new Date();

export const Categoria = {
  FISCAL: 'Fiscal',
  TRABALHISTA: 'Trabalhista',
  CONTABIL: 'Contábil',
} as const;

export const CATEGORIAS = [Categoria.FISCAL, Categoria.TRABALHISTA, Categoria.CONTABIL];

export const Recorrencia = {
  MENSAL: 'Mensal',
  TRIMESTRAL: 'Trimestral',
  ANUAL: 'Anual',
} as const;

export const StatusPrazo = {
  PENDENTE: 'PENDENTE',
  EM_ANDAMENTO: 'EM_ANDAMENTO',
  AGUARDANDO_CLIENTE: 'AGUARDANDO_CLIENTE',
  ENTREGUE: 'ENTREGUE',
  CANCELADO: 'CANCELADO',
} as const;

export type StatusMeta = { label: string; badge: string };

export const statusPrazoMeta: Record<string, StatusMeta> = {
  [StatusPrazo.PENDENTE]: { label: 'Pendente', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
  [StatusPrazo.EM_ANDAMENTO]: { label: 'Em andamento', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  [StatusPrazo.AGUARDANDO_CLIENTE]: {
    label: 'Aguardando cliente',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  [StatusPrazo.ENTREGUE]: { label: 'Entregue', badge: 'bg-green-100 text-green-700 border-green-200' },
  [StatusPrazo.CANCELADO]: { label: 'Cancelado', badge: 'bg-slate-100 text-slate-500 border-slate-200' },
};

export const STATUS_PRAZO_OPCOES = [
  StatusPrazo.PENDENTE,
  StatusPrazo.EM_ANDAMENTO,
  StatusPrazo.AGUARDANDO_CLIENTE,
  StatusPrazo.ENTREGUE,
  StatusPrazo.CANCELADO,
];

export const Prioridade = {
  ALTA: 'ALTA',
  MEDIA: 'MEDIA',
  BAIXA: 'BAIXA',
} as const;

export const prioridadeMeta: Record<string, StatusMeta> = {
  [Prioridade.ALTA]: { label: 'Alta', badge: 'bg-red-100 text-red-700 border-red-200' },
  [Prioridade.MEDIA]: { label: 'Média', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  [Prioridade.BAIXA]: { label: 'Baixa', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export const PRIORIDADE_OPCOES = [Prioridade.ALTA, Prioridade.MEDIA, Prioridade.BAIXA];

export const ETAPAS_PADRAO = [
  'Receber dados',
  'Conferir',
  'Apurar',
  'Gerar guia',
  'Enviar ao cliente',
];

/** Ordem das etapas aceitas por PATCH /deadlines/{id}/stage (RF58.1). */
export const ESTAGIOS_BACKEND = [
  'RECEBIDO',
  'EM_ANDAMENTO',
  'AGUARDANDO_CLIENTE',
  'AGUARDANDO_ORGAO',
  'CONCLUIDO',
] as const;

export type EstagioBackend = (typeof ESTAGIOS_BACKEND)[number];

export interface ObrigacaoModelo {
  id: string;
  nome: string;
  categoria: string;
  recorrencia: string;
  diaVencimento: number;
  antecedenciaAlertaDias: number;
  etapas: string[];
}

export const OBRIGACOES_MODELO: ObrigacaoModelo[] = [
  {
    id: 'FGTS',
    nome: 'FGTS',
    categoria: Categoria.TRABALHISTA,
    recorrencia: Recorrencia.MENSAL,
    diaVencimento: 7,
    antecedenciaAlertaDias: 7,
    etapas: ETAPAS_PADRAO,
  },
  {
    id: 'ESOCIAL',
    nome: 'eSocial',
    categoria: Categoria.TRABALHISTA,
    recorrencia: Recorrencia.MENSAL,
    diaVencimento: 15,
    antecedenciaAlertaDias: 7,
    etapas: ETAPAS_PADRAO,
  },
  {
    id: 'DAS',
    nome: 'DAS',
    categoria: Categoria.FISCAL,
    recorrencia: Recorrencia.MENSAL,
    diaVencimento: 20,
    antecedenciaAlertaDias: 7,
    etapas: ETAPAS_PADRAO,
  },
  {
    id: 'DCTF',
    nome: 'DCTF',
    categoria: Categoria.FISCAL,
    recorrencia: Recorrencia.MENSAL,
    diaVencimento: 15,
    antecedenciaAlertaDias: 7,
    etapas: ETAPAS_PADRAO,
  },
  {
    id: 'FOLHA',
    nome: 'Folha de pagamento',
    categoria: Categoria.TRABALHISTA,
    recorrencia: Recorrencia.MENSAL,
    diaVencimento: 5,
    antecedenciaAlertaDias: 7,
    etapas: ETAPAS_PADRAO,
  },
  {
    id: 'DRE',
    nome: 'DRE',
    categoria: Categoria.CONTABIL,
    recorrencia: Recorrencia.MENSAL,
    diaVencimento: 10,
    antecedenciaAlertaDias: 7,
    etapas: ETAPAS_PADRAO,
  },
];

export const modeloPorId = (id: string): ObrigacaoModelo | null =>
  OBRIGACOES_MODELO.find((modelo) => modelo.id === id) ?? null;

export const iniciarDia = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const addDias = (d: Date, n: number): Date => {
  const clone = iniciarDia(d);
  clone.setDate(clone.getDate() + n);
  return clone;
};

export const diasEntre = (a: Date, b: Date): number =>
  Math.round((iniciarDia(a).getTime() - iniciarDia(b).getTime()) / 86400000);

export const inicioDaSemana = (d: Date): Date => {
  const clone = iniciarDia(d);
  const offset = (clone.getDay() + 6) % 7;
  return addDias(clone, -offset);
};

export const diasRestantes = (prazo: Prazo | null | undefined, hoje: Date = HOJE): number | null => {
  const vencimento = paraData(prazo?.vencimentoAtual);
  if (!vencimento) return null;
  return diasEntre(vencimento, hoje);
};

export const prazoEncerrado = (prazo: Prazo | null | undefined): boolean =>
  prazo?.status === StatusPrazo.ENTREGUE || prazo?.status === StatusPrazo.CANCELADO;

/**
 * Atraso é tempo corrido sobre a data informada: às 00:00 do dia seguinte.
 * Não existe ajuste para fim de semana/feriado nem status persistido de atraso.
 */
export const estaAtrasado = (prazo: Prazo | null | undefined, hoje: Date = HOJE): boolean => {
  if (!prazo || prazoEncerrado(prazo)) return false;
  if (prazo.overdue !== undefined) return prazo.overdue;
  const dias = diasRestantes(prazo, hoje);
  return dias !== null && dias < 0;
};

export const calcularPrioridade = (vencimento: string | Date | null | undefined, hoje: Date = HOJE): string => {
  const data = typeof vencimento === 'string' ? paraData(vencimento) : vencimento;
  if (!data) return Prioridade.BAIXA;
  const dias = diasEntre(data, hoje);
  if (dias <= 1) return Prioridade.ALTA;
  if (dias <= 7) return Prioridade.MEDIA;
  return Prioridade.BAIXA;
};

export const prioridadeEfetiva = (prazo: Prazo | null | undefined, hoje: Date = HOJE): string =>
  prazo?.prioridade || calcularPrioridade(prazo?.vencimentoAtual, hoje);

export const textoRelativoVencimento = (prazo: Prazo, hoje: Date = HOJE): string => {
  const dias = diasRestantes(prazo, hoje);
  if (dias === null) return '';
  if (prazoEncerrado(prazo)) return prazo.status === StatusPrazo.CANCELADO ? 'cancelado' : 'entregue';
  if (dias < 0) {
    const n = Math.abs(dias);
    return `atrasado há ${n} ${n === 1 ? 'dia' : 'dias'}`;
  }
  if (dias === 0) return 'vence hoje';
  if (dias === 1) return 'vence amanhã';
  return `em ${dias} dias`;
};

export const agruparPorSemana = (prazos: Prazo[], hoje: Date = HOJE, quantidadeSemanas = 8) => {
  const inicio = inicioDaSemana(hoje);
  return Array.from({ length: quantidadeSemanas }, (_, index) => {
    const comeco = addDias(inicio, index * 7);
    const fim = addDias(comeco, 6);
    const itens = (prazos ?? []).filter((prazo) => {
      const vencimento = paraData(prazo.vencimentoAtual);
      if (!vencimento) return false;
      return vencimento >= comeco && vencimento <= addDias(fim, 0);
    });
    return {
      inicio: comeco,
      fim,
      label: `${formatarData(comeco)} – ${formatarData(fim)}`,
      total: itens.length,
      prazos: itens,
    };
  });
};

export const etapaAtualLabel = (prazo: Prazo | null | undefined): string => {
  const etapas = modeloPorId(prazo?.modeloId ?? '')?.etapas ?? ETAPAS_PADRAO;
  if (prazoEncerrado(prazo)) return prazo?.status === StatusPrazo.CANCELADO ? 'Cancelado' : 'Concluído';
  const indice = prazo?.etapaAtual ?? 0;
  return etapas[indice] ?? etapas[etapas.length - 1];
};
