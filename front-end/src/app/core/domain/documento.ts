import { diasDesde, paraData } from './data';
import type { Documento } from './models';

export const DocumentStatus = {
  CRIADO: 'CRIADO',
  RASCUNHO: 'RASCUNHO',
  ENVIADO: 'ENVIADO',
  VISUALIZADO: 'VISUALIZADO',
  BAIXADO: 'BAIXADO',
  APROVADO: 'APROVADO',
  RECUSADO: 'RECUSADO',
  RECEBIDO: 'RECEBIDO',
} as const;

export type StatusMeta = { label: string; badge: string };

export const documentStatusMeta: Record<string, StatusMeta> = {
  [DocumentStatus.CRIADO]: { label: 'Criado', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
  [DocumentStatus.RASCUNHO]: { label: 'Rascunho', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
  [DocumentStatus.ENVIADO]: { label: 'Enviado', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  [DocumentStatus.VISUALIZADO]: { label: 'Visualizado', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  [DocumentStatus.BAIXADO]: { label: 'Baixado', badge: 'bg-green-100 text-green-700 border-green-200' },
  [DocumentStatus.APROVADO]: { label: 'Aprovado', badge: 'bg-green-700 text-white border-green-700' },
  [DocumentStatus.RECUSADO]: { label: 'Recusado', badge: 'bg-red-100 text-red-700 border-red-200' },
  [DocumentStatus.RECEBIDO]: { label: 'Recebido', badge: 'bg-purple-100 text-purple-700 border-purple-200' },
};

export const DirecaoDocumento = {
  SAIDA: 'SAIDA',
  ENTRADA: 'ENTRADA',
} as const;

export const direcaoLabel: Record<string, string> = {
  [DirecaoDocumento.SAIDA]: 'Enviado ao cliente',
  [DirecaoDocumento.ENTRADA]: 'Recebido do cliente',
};

export const CANAIS_DOCUMENTO = ['Link', 'WhatsApp', 'E-mail', 'Manual'] as const;

export const CANAIS_ORIGEM_RECEBIMENTO = ['WhatsApp', 'E-mail', 'Outro'] as const;

export const STATUS_DOCUMENTO_FILTROS = [
  DocumentStatus.CRIADO,
  DocumentStatus.RASCUNHO,
  DocumentStatus.ENVIADO,
  DocumentStatus.VISUALIZADO,
  DocumentStatus.BAIXADO,
  DocumentStatus.APROVADO,
  DocumentStatus.RECUSADO,
  DocumentStatus.RECEBIDO,
] as const;

export const LIMITE_DIAS_SEM_ABERTURA = 3;

export const ANTECEDENCIA_PADRAO = 3;

export const OPCOES_ANTECEDENCIA = [1, 2, 3, 5, 7, 10, 15, 30] as const;

export const PrazoDocumento = {
  VENCIDO: 'VENCIDO',
  PROXIMO: 'PROXIMO',
  NO_PRAZO: 'NO_PRAZO',
} as const;

export const prazoDocumentoMeta: Record<string, StatusMeta> = {
  [PrazoDocumento.VENCIDO]: { label: 'Vencido', badge: 'bg-red-100 text-red-700 border-red-200' },
  [PrazoDocumento.PROXIMO]: { label: 'A vencer', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  [PrazoDocumento.NO_PRAZO]: { label: 'No prazo', badge: 'bg-green-100 text-green-700 border-green-200' },
};

export const diasAteVencimento = (vencimento: string | null | undefined): number | null => {
  const alvo = paraData(vencimento);
  if (!alvo) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
};

export const statusPrazoDocumento = (doc: Documento | null | undefined): string | null => {
  if (!doc?.vencimento) return null;
  const dias = diasAteVencimento(doc.vencimento);
  if (dias === null) return null;
  if (dias < 0) return PrazoDocumento.VENCIDO;
  if (dias <= (doc.diasAntecedencia ?? ANTECEDENCIA_PADRAO)) return PrazoDocumento.PROXIMO;
  return PrazoDocumento.NO_PRAZO;
};

export const AREAS_DOCUMENTO = ['Trabalhista', 'Fiscal', 'Contábil', 'Outros'] as const;

export const TIPOS_DOCUMENTO = [
  { nome: 'Guia FGTS', area: 'Trabalhista' },
  { nome: 'DRE', area: 'Contábil' },
  { nome: 'Folha de pagamento', area: 'Trabalhista' },
  { nome: 'Demonstrativo contábil', area: 'Contábil' },
  { nome: 'Guia de imposto', area: 'Fiscal' },
  { nome: 'Declaração', area: 'Fiscal' },
  { nome: 'Guia DAS', area: 'Fiscal' },
  { nome: 'Extrato bancário', area: 'Contábil' },
  { nome: 'Notas fiscais', area: 'Fiscal' },
  { nome: 'Documento consolidado', area: 'Outros' },
  { nome: 'Outros', area: 'Outros' },
] as const;

export const areaDoTipo = (tipo: string): string =>
  TIPOS_DOCUMENTO.find((t) => t.nome === tipo)?.area ?? 'Outros';

export const CANAIS_ENVIO = ['WhatsApp', 'E-mail'] as const;

export const MESES = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'] as const;

export const ANOS = ['2026', '2025'] as const;

export const FORMATOS_ACEITOS = ['pdf', 'ofx', 'xml', 'xlsx', 'csv', 'txt'] as const;

export const extensaoDe = (nomeArquivo: string): string =>
  nomeArquivo.split('.').pop()?.toLowerCase() ?? '';

export const ultimaAtividade = (doc: Documento | null | undefined) => {
  const eventos = doc?.historico ?? [];
  return eventos[eventos.length - 1] ?? null;
};

export const emRiscoSemAbertura = (doc: Documento, limiteDias = LIMITE_DIAS_SEM_ABERTURA): boolean => {
  if (doc.status !== DocumentStatus.ENVIADO) return false;
  const enviado = [...(doc.historico ?? [])].reverse().find((h) => h.etapa === 'ENVIADO');
  if (!enviado) return false;
  return diasDesde(enviado.data) > limiteDias;
};
