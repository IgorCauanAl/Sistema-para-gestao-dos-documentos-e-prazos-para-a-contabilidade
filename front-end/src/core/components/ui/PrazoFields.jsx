import React from 'react';
import { OPCOES_ANTECEDENCIA } from '../../domain/documento';

const inputClass =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed';

const PrazoFields = ({
  idPrefix,
  vencimento,
  onVencimentoChange,
  diasAntecedencia,
  onDiasAntecedenciaChange,
  vencimentoObrigatorio = false,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    <div>
      <label htmlFor={`${idPrefix}-vencimento`} className="block text-sm font-semibold mb-1.5 text-slate-700">
        Data de vencimento{' '}
        {vencimentoObrigatorio ? (
          <span className="text-red-500">*</span>
        ) : (
          <span className="font-normal text-slate-400">(opcional)</span>
        )}
      </label>
      <input
        id={`${idPrefix}-vencimento`}
        type="date"
        className={inputClass}
        value={vencimento}
        onChange={(e) => onVencimentoChange(e.target.value)}
      />
    </div>

    <div>
      <label htmlFor={`${idPrefix}-antecedencia`} className="block text-sm font-semibold mb-1.5 text-slate-700">
        Avisar com antecedência
      </label>
      <select
        id={`${idPrefix}-antecedencia`}
        className={inputClass}
        value={diasAntecedencia}
        disabled={!vencimento}
        onChange={(e) => onDiasAntecedenciaChange(Number(e.target.value))}
      >
        {OPCOES_ANTECEDENCIA.map((dias) => (
          <option key={dias} value={dias}>
            {dias} {dias === 1 ? 'dia' : 'dias'} antes
          </option>
        ))}
      </select>
      <p className="mt-1.5 text-xs text-slate-400">
        {vencimento
          ? 'Aviso gerado quando faltar esse prazo para o vencimento.'
          : 'Informe a data de vencimento para definir o aviso.'}
      </p>
    </div>
  </div>
);

export default PrazoFields;
