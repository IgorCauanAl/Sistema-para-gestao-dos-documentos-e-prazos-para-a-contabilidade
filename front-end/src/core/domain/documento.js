import { diasDesde, paraData } from './data';

export const DocumentStatus = Object.freeze({
  RASCUNHO: 'RASCUNHO',
  ENVIADO: 'ENVIADO',
  VISUALIZADO: 'VISUALIZADO',
  BAIXADO: 'BAIXADO',
  APROVADO: 'APROVADO',
  RECUSADO: 'RECUSADO',
  RECEBIDO: 'RECEBIDO',
});

export const documentStatusMeta = Object.freeze({
  [DocumentStatus.RASCUNHO]: { label: 'Rascunho', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
  [DocumentStatus.ENVIADO]: { label: 'Enviado', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  [DocumentStatus.VISUALIZADO]: { label: 'Visualizado', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  [DocumentStatus.BAIXADO]: { label: 'Baixado', badge: 'bg-green-100 text-green-700 border-green-200' },
  [DocumentStatus.APROVADO]: { label: 'Aprovado', badge: 'bg-green-700 text-white border-green-700' },
  [DocumentStatus.RECUSADO]: { label: 'Recusado', badge: 'bg-red-100 text-red-700 border-red-200' },
  [DocumentStatus.RECEBIDO]: { label: 'Recebido', badge: 'bg-purple-100 text-purple-700 border-purple-200' },
});

export const DirecaoDocumento = Object.freeze({
  SAIDA: 'SAIDA',
  ENTRADA: 'ENTRADA',
});

export const direcaoLabel = Object.freeze({
  [DirecaoDocumento.SAIDA]: 'Enviado ao cliente',
  [DirecaoDocumento.ENTRADA]: 'Recebido do cliente',
});

export const CANAIS_DOCUMENTO = Object.freeze(['Link', 'WhatsApp', 'E-mail', 'Manual']);

export const CANAIS_ORIGEM_RECEBIMENTO = Object.freeze(['WhatsApp', 'E-mail', 'Outro']);

export const STATUS_DOCUMENTO_FILTROS = Object.freeze([
  DocumentStatus.RASCUNHO,
  DocumentStatus.ENVIADO,
  DocumentStatus.VISUALIZADO,
  DocumentStatus.BAIXADO,
  DocumentStatus.APROVADO,
  DocumentStatus.RECUSADO,
  DocumentStatus.RECEBIDO,
]);

export const LIMITE_DIAS_SEM_ABERTURA = 3;

export const ANTECEDENCIA_PADRAO = 3;

export const OPCOES_ANTECEDENCIA = Object.freeze([1, 2, 3, 5, 7, 10, 15, 30]);

export const PrazoDocumento = Object.freeze({
  VENCIDO: 'VENCIDO',
  PROXIMO: 'PROXIMO',
  NO_PRAZO: 'NO_PRAZO',
});

export const prazoDocumentoMeta = Object.freeze({
  [PrazoDocumento.VENCIDO]: { label: 'Vencido', badge: 'bg-red-100 text-red-700 border-red-200' },
  [PrazoDocumento.PROXIMO]: { label: 'A vencer', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  [PrazoDocumento.NO_PRAZO]: { label: 'No prazo', badge: 'bg-green-100 text-green-700 border-green-200' },
});

export const diasAteVencimento = (vencimento) => {
  const alvo = paraData(vencimento);
  if (!alvo) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
};

export const statusPrazoDocumento = (doc) => {
  if (!doc?.vencimento) return null;
  const dias = diasAteVencimento(doc.vencimento);
  if (dias === null) return null;
  if (dias < 0) return PrazoDocumento.VENCIDO;
  if (dias <= (doc.diasAntecedencia ?? ANTECEDENCIA_PADRAO)) return PrazoDocumento.PROXIMO;
  return PrazoDocumento.NO_PRAZO;
};

export const AREAS_DOCUMENTO = Object.freeze(['Trabalhista', 'Fiscal', 'Contábil', 'Outros']);

export const TIPOS_DOCUMENTO = Object.freeze([
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
]);

export const areaDoTipo = (tipo) => TIPOS_DOCUMENTO.find((t) => t.nome === tipo)?.area ?? 'Outros';

export const CANAIS_ENVIO = Object.freeze(['WhatsApp', 'E-mail']);

export const MESES = Object.freeze([
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12',
]);

export const ANOS = Object.freeze(['2026', '2025']);

export const FORMATOS_ACEITOS = Object.freeze(['pdf', 'ofx', 'xml', 'xlsx', 'csv', 'txt']);

export const extensaoDe = (nomeArquivo) => nomeArquivo.split('.').pop()?.toLowerCase() ?? '';

export const ultimaAtividade = (doc) => {
  const eventos = doc.historico ?? [];
  return eventos[eventos.length - 1] ?? null;
};

export const emRiscoSemAbertura = (doc, limiteDias = LIMITE_DIAS_SEM_ABERTURA) => {
  if (doc.status !== DocumentStatus.ENVIADO) return false;
  const enviado = [...(doc.historico ?? [])].reverse().find((h) => h.etapa === 'ENVIADO');
  if (!enviado) return false;
  return diasDesde(enviado.data) > limiteDias;
};
