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

export const RegraDiaNaoUtil = {
  ANTECIPAR: 'ANTECIPAR',
  POSTERGAR: 'POSTERGAR',
} as const;

export const regraDiaNaoUtilLabel: Record<string, string> = {
  [RegraDiaNaoUtil.ANTECIPAR]: 'Antecipar para o dia útil anterior',
  [RegraDiaNaoUtil.POSTERGAR]: 'Postergar para o próximo dia útil',
};

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

export interface ObrigacaoModelo {
  id: string;
  nome: string;
  categoria: string;
  recorrencia: string;
  diaVencimento: number;
  regraDiaNaoUtil: string;
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
    regraDiaNaoUtil: RegraDiaNaoUtil.ANTECIPAR,
    antecedenciaAlertaDias: 7,
    etapas: ETAPAS_PADRAO,
  },
  {
    id: 'ESOCIAL',
    nome: 'eSocial',
    categoria: Categoria.TRABALHISTA,
    recorrencia: Recorrencia.MENSAL,
    diaVencimento: 15,
    regraDiaNaoUtil: RegraDiaNaoUtil.ANTECIPAR,
    antecedenciaAlertaDias: 7,
    etapas: ETAPAS_PADRAO,
  },
  {
    id: 'DAS',
    nome: 'DAS',
    categoria: Categoria.FISCAL,
    recorrencia: Recorrencia.MENSAL,
    diaVencimento: 20,
    regraDiaNaoUtil: RegraDiaNaoUtil.ANTECIPAR,
    antecedenciaAlertaDias: 7,
    etapas: ETAPAS_PADRAO,
  },
  {
    id: 'DCTF',
    nome: 'DCTF',
    categoria: Categoria.FISCAL,
    recorrencia: Recorrencia.MENSAL,
    diaVencimento: 15,
    regraDiaNaoUtil: RegraDiaNaoUtil.ANTECIPAR,
    antecedenciaAlertaDias: 7,
    etapas: ETAPAS_PADRAO,
  },
  {
    id: 'FOLHA',
    nome: 'Folha de pagamento',
    categoria: Categoria.TRABALHISTA,
    recorrencia: Recorrencia.MENSAL,
    diaVencimento: 5,
    regraDiaNaoUtil: RegraDiaNaoUtil.ANTECIPAR,
    antecedenciaAlertaDias: 7,
    etapas: ETAPAS_PADRAO,
  },
  {
    id: 'DRE',
    nome: 'DRE',
    categoria: Categoria.CONTABIL,
    recorrencia: Recorrencia.MENSAL,
    diaVencimento: 10,
    regraDiaNaoUtil: RegraDiaNaoUtil.POSTERGAR,
    antecedenciaAlertaDias: 7,
    etapas: ETAPAS_PADRAO,
  },
];

export const modeloPorId = (id: string): ObrigacaoModelo | null =>
  OBRIGACOES_MODELO.find((modelo) => modelo.id === id) ?? null;

export const FERIADOS_2026 = [
  { id: 1, nome: 'Confraternização Universal', data: '01/01/2026' },
  { id: 2, nome: 'Carnaval', data: '16/02/2026' },
  { id: 3, nome: 'Carnaval', data: '17/02/2026' },
  { id: 4, nome: 'Sexta-feira Santa', data: '03/04/2026' },
  { id: 5, nome: 'Tiradentes', data: '21/04/2026' },
  { id: 6, nome: 'Dia do Trabalho', data: '01/05/2026' },
  { id: 7, nome: 'Corpus Christi', data: '04/06/2026' },
  { id: 8, nome: 'Independência do Brasil', data: '07/09/2026' },
  { id: 9, nome: 'Nossa Senhora Aparecida', data: '12/10/2026' },
  { id: 10, nome: 'Finados', data: '02/11/2026' },
  { id: 11, nome: 'Proclamação da República', data: '15/11/2026' },
  { id: 12, nome: 'Consciência Negra', data: '20/11/2026' },
  { id: 13, nome: 'Natal', data: '25/12/2026' },
];

export const iniciarDia = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const addDias = (d: Date, n: number): Date => {
  const clone = iniciarDia(d);
  clone.setDate(clone.getDate() + n);
  return clone;
};

export const diasEntre = (a: Date, b: Date): number =>
  Math.round((iniciarDia(a).getTime() - iniciarDia(b).getTime()) / 86400000);

export const ehFimDeSemana = (d: Date): boolean => d.getDay() === 0 || d.getDay() === 6;

export const feriadoEm = (
  d: Date,
  feriados: ReadonlyArray<{ nome: string; data: string }> = FERIADOS_2026
) => feriados.find((feriado) => feriado.data === formatarData(d)) ?? null;

export const ehDiaUtil = (
  d: Date,
  feriados: ReadonlyArray<{ nome: string; data: string }> = FERIADOS_2026
): boolean => !ehFimDeSemana(d) && !feriadoEm(d, feriados);

export const ajustarParaDiaUtil = (
  d: Date,
  regra: string = RegraDiaNaoUtil.ANTECIPAR,
  feriados: ReadonlyArray<{ nome: string; data: string }> = FERIADOS_2026
): Date => {
  const passo = regra === RegraDiaNaoUtil.POSTERGAR ? 1 : -1;
  let atual = iniciarDia(d);
  while (!ehDiaUtil(atual, feriados)) atual = addDias(atual, passo);
  return atual;
};

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

export const vencimentoFoiAjustado = (prazo: Prazo | null | undefined): boolean => {
  if (!prazo?.vencimentoOriginal || !prazo?.vencimentoAtual) return false;
  if (prazo.vencimentoOriginal === prazo.vencimentoAtual) return false;
  const original = paraData(prazo.vencimentoOriginal);
  return original ? !ehDiaUtil(original) : false;
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
