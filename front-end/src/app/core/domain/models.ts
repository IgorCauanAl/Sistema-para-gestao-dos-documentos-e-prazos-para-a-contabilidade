import type { DataHora } from './data';

export interface Cliente {
  id: number;
  cnpj: string;
  razaoSocial: string;
  responsavel: string;
  email: string;
  endereco: string;
  whatsapp: string;
  canalPreferido: string;
  pendencias: number;
  ultimoEnvio: string;
}

export interface DocumentoEvento {
  etapa: string;
  data: string;
  hora: string;
  ip?: string;
  canal?: string | null;
}

export interface Documento {
  id: number;
  clienteId: number;
  nome: string;
  tipo: string;
  competencia: string;
  versao: number;
  status: string;
  direcao: string;
  canal: string | null;
  formato: string;
  tamanho: string;
  vencimento?: string | null;
  diasAntecedencia?: number;
  hash: string;
  area?: string;
  observacao?: string;
  fontes?: string[];
  historico: DocumentoEvento[];
}

export interface DocumentoNovo {
  clienteId: number;
  nome?: string;
  tipo: string;
  competencia: string;
  canal: string;
  formato: string;
  tamanho: string;
  enviarAgora: boolean;
  vencimento?: string | null;
  diasAntecedencia?: number;
}

export interface DocumentoEntrada {
  clienteId: number;
  tipo: string;
  competencia: string;
  canal: string;
  formato: string;
  tamanho: string;
  observacao?: string;
  vencimento?: string | null;
  diasAntecedencia?: number;
}

export interface PrazoEvento {
  id: string;
  tipo: string;
  descricao: string;
  data: string;
  hora: string;
}

export interface Prazo {
  id: number;
  clienteId: number;
  modeloId: string;
  obrigacao: string;
  categoria: string;
  competencia: string;
  vencimentoOriginal: string;
  vencimentoAtual: string;
  prioridade: string;
  prioridadeManual: boolean;
  status: string;
  etapaAtual: number;
  etapasConcluidas: number[];
  historico: PrazoEvento[];
  solicitacaoId: number | null;
  entregueEm: DataHora | null;
}

export interface DocumentoTentativaArquivo {
  nome: string;
  tamanho: string;
}

export interface SolicitacaoTentativa {
  id: string;
  data: string;
  hora: string;
  acao: string;
  arquivo: DocumentoTentativaArquivo | null;
  motivo: string | null;
  detalhes: string | null;
  canalOrigem: string | null;
  ip: string;
  protocolo: string | null;
  observacao: string | null;
  competencia?: string | null;
  vencimento?: string | null;
  diasAntecedencia?: number | null;
}

export interface SolicitacaoItem {
  id: number;
  nome: string;
  formatoEsperado: string;
  status: string;
  tentativas: SolicitacaoTentativa[];
  competencia?: string | null;
  vencimento?: string | null;
  diasAntecedencia?: number | null;
}

export interface Solicitacao {
  id: number;
  clienteId: number;
  titulo: string;
  competencia: string;
  prazo: string;
  instrucoes: string;
  canal: string;
  token: string;
  validadeAte: string;
  validadeDias: number;
  status: string;
  criadoEm: DataHora;
  itens: SolicitacaoItem[];
}

export interface SolicitacaoNova {
  clienteId: number;
  titulo: string;
  competencia: string;
  prazo: string;
  instrucoes?: string;
  canal: string;
  validadeDias: number;
  itens: Array<{ nome: string; formato: string }>;
  enviarAgora: boolean;
}

export interface DashboardSummaryCard {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  subtext?: string;
  icon: string;
  colorTheme?: string;
}

export interface DashboardFlow {
  sent: string;
  received: string;
  tooltip: { date: string; received: string; sent: string };
  months: string[];
}

export interface DashboardObligations {
  newRequests: number;
  blocks: Array<{ label: string; value: string; className: string }>;
}

export interface DashboardClientProfile {
  type: string;
  count: number;
  pct: string;
  color: string;
}

export interface DashboardDocumentType {
  label: string;
  height: string;
  val: string;
  highlight?: boolean;
}

export interface DashboardWeekly {
  total: string;
  trend: string;
  days: string[];
}
