import React from 'react';
import { Check } from 'lucide-react';
import { ETAPAS_PADRAO, StatusPrazo } from '../../../core/domain/prazo';

const EtapasChecklist = ({ prazo, onToggle }) => {
  const entregue = prazo.status === StatusPrazo.ENTREGUE;

  return (
    <ul className="space-y-2">
      {ETAPAS_PADRAO.map((nome, index) => {
        const concluida = prazo.etapasConcluidas.includes(index);
        const atual = !concluida && index === prazo.etapaAtual && !entregue;

        return (
          <li key={nome}>
            <button
              type="button"
              role="checkbox"
              aria-checked={concluida}
              aria-label={`Etapa ${nome}`}
              disabled={entregue}
              onClick={() => onToggle(index)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl border text-left transition-colors disabled:cursor-not-allowed ${
                concluida
                  ? 'border-green-200 bg-green-50'
                  : atual
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  concluida
                    ? 'bg-green-500 border-green-500 text-white'
                    : atual
                      ? 'border-indigo-500 bg-white'
                      : 'border-slate-300 bg-white'
                }`}
              >
                {concluida && <Check size={12} strokeWidth={3} />}
              </span>

              <span
                className={`text-sm font-medium ${
                  concluida ? 'text-green-700' : atual ? 'text-indigo-700' : 'text-slate-600'
                }`}
              >
                {nome}
              </span>

              {atual && (
                <span className="ml-auto text-[11px] font-semibold uppercase tracking-wider text-indigo-500">
                  Etapa atual
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default EtapasChecklist;
