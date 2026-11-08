import React from 'react';
import {
  X,
  CalendarClock,
  Send,
  Paperclip,
  CheckCircle2,
  History,
  User,
  Building2,
} from 'lucide-react';
import EtapasChecklist from './EtapasChecklist';
import { PrazoStatusBadge, PrioridadeBadge, AtrasoBadge } from './PrazoBadges';
import {
  StatusPrazo,
  PRIORIDADE_OPCOES,
  prioridadeMeta,
  prioridadeEfetiva,
  estaAtrasado,
  textoRelativoVencimento,
  vencimentoFoiAjustado,
  etapaAtualLabel,
} from '../../../core/domain/deadline';

const PrazoDetailPanel = ({
  open,
  deadline,
  cliente,
  hoje,
  onClose,
  onToggleEtapa,
  onMarcarEntregue,
  onReprogramar,
  onDefinirPrioridade,
  onCriarSolicitacao,
  onAnexarGuia,
}) => {
  if (!open || !deadline) return null;

  const atrasado = estaAtrasado(deadline, hoje);
  const entregue = deadline.status === StatusPrazo.ENTREGUE;
  const relativo = textoRelativoVencimento(deadline, hoje);
  const prioridadeAtual = prioridadeEfetiva(deadline, hoje);
  const ajustado = vencimentoFoiAjustado(deadline);

  const acoes = [
    {
      id: 'criar-solicitacao',
      label: deadline.solicitacaoId ? `Solicitação vinculada (#${deadline.solicitacaoId})` : 'Criar solicitação ao cliente',
      icon: Send,
      onClick: onCriarSolicitacao,
      className: 'border-slate-200 text-slate-700 hover:bg-slate-50',
    },
    {
      id: 'anexar-guia',
      label: 'Anexar e enviar guia',
      icon: Paperclip,
      onClick: onAnexarGuia,
      className: 'border-slate-200 text-slate-700 hover:bg-slate-50',
    },
    {
      id: 'reprogramar',
      label: 'Reprogramar vencimento',
      icon: CalendarClock,
      onClick: onReprogramar,
      className: 'border-slate-200 text-slate-700 hover:bg-slate-50',
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 flex justify-end"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes do deadline ${deadline.obrigacao}`}
        className="bg-white w-full max-w-xl h-full overflow-y-auto shadow-xl animate-in slide-in-from-right duration-200"
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800">{deadline.obrigacao}</h2>
              <PrazoStatusBadge status={deadline.status} />
              {atrasado && <AtrasoBadge />}
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <Building2 size={14} /> {cliente?.razaoSocial ?? '—'} · competência {deadline.competencia}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes do deadline"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section className="rounded-3xl border border-slate-200/70 bg-slate-50/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Vencimento atual
            </p>
            <div className="flex items-end justify-between gap-3 flex-wrap">
              <p className={`text-2xl font-bold ${atrasado ? 'text-red-600' : 'text-slate-800'}`}>
                {deadline.vencimentoAtual}
              </p>
              {relativo && (
                <span className={`text-sm font-medium ${atrasado ? 'text-red-500' : 'text-slate-500'}`}>
                  {relativo}
                </span>
              )}
            </div>
            {deadline.vencimentoOriginal !== deadline.vencimentoAtual && (
              <p className="text-xs text-slate-400 mt-2">Vencimento original: {deadline.vencimentoOriginal}</p>
            )}
            {ajustado && (
              <p className="text-xs text-amber-700 mt-1">
                O vencimento original caiu em dia não útil e foi ajustado automaticamente.
              </p>
            )}
          </section>

          <section className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Etapa atual</p>
              <p className="font-medium text-slate-700">{etapaAtualLabel(deadline)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Categoria</p>
              <p className="font-medium text-slate-700">{deadline.categoria}</p>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-sm font-semibold text-slate-700">Prioridade</p>
              {deadline.prioridadeManual && (
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500">
                  Definida manualmente
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <PrioridadeBadge prioridade={prioridadeAtual} />
              <select
                id="deadline-prioridade"
                aria-label="Definir prioridade do deadline"
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={prioridadeAtual}
                onChange={(e) => onDefinirPrioridade(e.target.value)}
              >
                {PRIORIDADE_OPCOES.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {prioridadeMeta[opcao].label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section>
            <p className="text-sm font-semibold text-slate-700 mb-3">Etapas da obrigação</p>
            <EtapasChecklist deadline={deadline} onToggle={onToggleEtapa} />
          </section>

          <section className="space-y-2">
            {acoes.map((acao) => {
              const Icon = acao.icon;
              return (
                <button
                  key={acao.id}
                  type="button"
                  onClick={acao.onClick}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border transition-colors text-sm font-medium ${acao.className}`}
                >
                  <Icon size={15} /> {acao.label}
                </button>
              );
            })}

            {!entregue && (
              <button
                type="button"
                onClick={onMarcarEntregue}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-semibold"
              >
                <CheckCircle2 size={15} /> Marcar como entregue
              </button>
            )}
          </section>

          <section>
            <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <History size={16} className="text-slate-400" /> Histórico
            </p>
            {deadline.historico.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Nenhum evento registrado.</p>
            ) : (
              <ol className="relative border-l border-slate-200 ml-2 space-y-4">
                {deadline.historico
                  .slice()
                  .reverse()
                  .map((evento, index) => (
                    <li key={`${evento.id}-${index}`} className="pl-4 relative">
                      <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-400 border-2 border-white" />
                      <p className="text-sm text-slate-700">{evento.descricao}</p>
                      <p className="text-xs text-slate-400">
                        {evento.data} às {evento.hora}
                      </p>
                    </li>
                  ))}
              </ol>
            )}
          </section>

          {deadline.entregueEm && (
            <p className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
              <CheckCircle2 size={15} /> Entregue em {deadline.entregueEm.data} às {deadline.entregueEm.hora}.
            </p>
          )}

          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <User size={13} /> Responsável: escritório.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrazoDetailPanel;
