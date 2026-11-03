export const StatusSolicitacao = Object.freeze({
  ABERTA: 'ABERTA',
  EM_CONFERENCIA: 'EM_CONFERENCIA',
  CONCLUIDA: 'CONCLUIDA',
  EXPIRADA: 'EXPIRADA',
  CANCELADA: 'CANCELADA',
});

export const solicitacaoStatusMeta = Object.freeze({
  [StatusSolicitacao.ABERTA]: { label: 'Aberta', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  [StatusSolicitacao.EM_CONFERENCIA]: { label: 'Em conferência', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  [StatusSolicitacao.CONCLUIDA]: { label: 'Concluída', badge: 'bg-green-100 text-green-700 border-green-200' },
  [StatusSolicitacao.EXPIRADA]: { label: 'Expirada', badge: 'bg-red-100 text-red-700 border-red-200' },
  [StatusSolicitacao.CANCELADA]: { label: 'Cancelada', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
});

export const StatusItem = Object.freeze({
  PENDENTE: 'PENDENTE',
  ENVIADO: 'ENVIADO',
  APROVADO: 'APROVADO',
  RECUSADO: 'RECUSADO',
});

export const itemStatusMeta = Object.freeze({
  [StatusItem.PENDENTE]: { label: 'Pendente', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
  [StatusItem.ENVIADO]: { label: 'Enviado pelo cliente', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  [StatusItem.APROVADO]: { label: 'Aprovado', badge: 'bg-green-100 text-green-700 border-green-200' },
  [StatusItem.RECUSADO]: { label: 'Recusado', badge: 'bg-red-100 text-red-700 border-red-200' },
});

export const itemStatusPortalLabel = Object.freeze({
  [StatusItem.PENDENTE]: 'Pendente',
  [StatusItem.ENVIADO]: 'Enviado',
  [StatusItem.APROVADO]: 'Aprovado',
  [StatusItem.RECUSADO]: 'Precisa reenviar',
});

export const MotivoRecusa = Object.freeze({
  ILEGIVEL: 'ILEGIVEL',
  INCOMPLETO: 'INCOMPLETO',
  COMPETENCIA_ERRADA: 'COMPETENCIA_ERRADA',
  DOCUMENTO_ERRADO: 'DOCUMENTO_ERRADO',
  FORMATO_INVALIDO: 'FORMATO_INVALIDO',
  OUTRO: 'OUTRO',
});

export const motivoRecusaLabel = Object.freeze({
  [MotivoRecusa.ILEGIVEL]: 'Ilegível',
  [MotivoRecusa.INCOMPLETO]: 'Incompleto',
  [MotivoRecusa.COMPETENCIA_ERRADA]: 'Competência errada',
  [MotivoRecusa.DOCUMENTO_ERRADO]: 'Documento errado',
  [MotivoRecusa.FORMATO_INVALIDO]: 'Formato inválido',
  [MotivoRecusa.OUTRO]: 'Outro',
});

export const AcaoTentativa = Object.freeze({
  ENVIADO: 'ENVIADO',
  APROVADO: 'APROVADO',
  RECUSADO: 'RECUSADO',
  REENVIADO: 'REENVIADO',
  REGISTRO_MANUAL: 'REGISTRO_MANUAL',
});

export const acaoTentativaLabel = Object.freeze({
  [AcaoTentativa.ENVIADO]: 'enviado',
  [AcaoTentativa.APROVADO]: 'aprovado',
  [AcaoTentativa.RECUSADO]: 'recusado',
  [AcaoTentativa.REENVIADO]: 'reenviado',
  [AcaoTentativa.REGISTRO_MANUAL]: 'registro manual',
});

export const FORMATOS_ESPERADOS = Object.freeze([
  'PDF',
  'Imagem',
  'OFX',
  'XML',
  'XLSX',
  'CSV',
  'TXT',
  'Qualquer',
]);

export const SUGESTOES_ITENS = Object.freeze([
  'Extrato bancário',
  'Notas fiscais',
  'Recibos',
  'Fluxo de caixa',
  'Folha de ponto',
  'Pagamentos',
]);

export const TAMANHO_MAXIMO_MB = 25;

export const STATUS_ITEM_OPCOES = Object.freeze([
  StatusItem.PENDENTE,
  StatusItem.ENVIADO,
  StatusItem.APROVADO,
  StatusItem.RECUSADO,
]);

export const calcularStatusSolicitacao = (solicitacao) => {
  if (solicitacao.status === StatusSolicitacao.CANCELADA) return StatusSolicitacao.CANCELADA;
  if (solicitacao.status === StatusSolicitacao.EXPIRADA) return StatusSolicitacao.EXPIRADA;

  const itens = solicitacao.itens ?? [];
  if (itens.length > 0 && itens.every((item) => item.status === StatusItem.APROVADO)) {
    return StatusSolicitacao.CONCLUIDA;
  }
  if (itens.some((item) => item.status === StatusItem.ENVIADO)) {
    return StatusSolicitacao.EM_CONFERENCIA;
  }
  return StatusSolicitacao.ABERTA;
};

export const progressoSolicitacao = (solicitacao) => {
  const total = (solicitacao.itens ?? []).length;
  const aprovados = (solicitacao.itens ?? []).filter((item) => item.status === StatusItem.APROVADO).length;

  return {
    aprovados,
    total,
    pct: total === 0 ? 0 : Math.round((aprovados / total) * 100),
    label: `${aprovados} de ${total} aprovado${total === 1 ? '' : 's'}`,
  };
};
