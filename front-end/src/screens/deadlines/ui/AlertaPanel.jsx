import React from 'react';
import { X, Mail, AlertTriangle, CalendarRange, BellRing } from 'lucide-react';
import { estaAtrasado } from '../../../core/domain/prazo';

const Grupo = ({ titulo, tom, itens, nomeCliente, onSelect, hoje }) => {
  if (itens.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className={`text-xs font-semibold uppercase tracking-wider ${tom}`}>
        {titulo} ({itens.length})
      </p>
      {itens.map((prazo) => (
        <button
          key={prazo.id}
          type="button"
          onClick={() => onSelect(prazo)}
          className="w-full text-left px-3 py-2.5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-700">{prazo.obrigacao}</span>
            <span className={`text-xs font-medium ${estaAtrasado(prazo, hoje) ? 'text-red-500' : 'text-slate-400'}`}>
              {prazo.vencimentoAtual}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {nomeCliente(prazo.clienteId)} · {prazo.competencia}
          </p>
        </button>
      ))}
    </div>
  );
};

const AlertaPanel = ({ open, onClose, alertas, nomeCliente, onSelect, onSimularEmail, hoje }) => {
  if (!open) return null;

  const { atrasados, semana, janela, total } = alertas;

  return (
    <div className="fixed inset-0 z-40" onMouseDown={onClose} role="presentation">
      <div
        role="dialog"
        aria-label="Alertas de prazos"
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute left-24 top-6 w-96 max-h-[80vh] overflow-y-auto bg-white rounded-3xl shadow-xl border border-slate-200/70 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-orange-50 text-orange-500">
              <BellRing size={18} />
            </span>
            <h3 className="text-base font-bold text-slate-800">Alertas de prazos</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar alertas"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={onSimularEmail}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors"
        >
          <Mail size={15} /> Simular resumo diário por e-mail
        </button>

        {total === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            Nenhum alerta no momento. Bom trabalho!
          </p>
        ) : (
          <div className="space-y-4">
            <Grupo
              titulo="Atrasados"
              tom="text-red-600"
              itens={atrasados}
              nomeCliente={nomeCliente}
              onSelect={onSelect}
              hoje={hoje}
            />
            <Grupo
              titulo="Vencem esta semana"
              tom="text-amber-600"
              itens={semana}
              nomeCliente={nomeCliente}
              onSelect={onSelect}
              hoje={hoje}
            />
            <Grupo
              titulo="Entram na janela de alerta"
              tom="text-indigo-600"
              itens={janela}
              nomeCliente={nomeCliente}
              onSelect={onSelect}
              hoje={hoje}
            />
          </div>
        )}

        <p className="flex items-center gap-1.5 text-xs text-slate-400 pt-1 border-t border-slate-100">
          <AlertTriangle size={13} /> <CalendarRange size={13} /> Prazos entregues não geram alertas.
        </p>
      </div>
    </div>
  );
};

export default AlertaPanel;
