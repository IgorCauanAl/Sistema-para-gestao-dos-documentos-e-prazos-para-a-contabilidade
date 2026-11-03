import React from 'react';
import { DirecaoDocumento } from '../../../core/domain/documento';

const tabs = [
  { id: 'TODOS', label: 'Todos' },
  { id: DirecaoDocumento.SAIDA, label: 'Enviados ao cliente' },
  { id: DirecaoDocumento.ENTRADA, label: 'Recebidos do cliente' },
];

const DocumentsTabs = ({ active, counts, onChange }) => (
  <div className="flex flex-wrap p-1.5 bg-slate-100 rounded-full gap-1 w-fit" role="tablist">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        role="tab"
        aria-selected={active === tab.id}
        onClick={() => onChange(tab.id)}
        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
          active === tab.id
            ? 'bg-slate-800 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        }`}
      >
        {tab.label}
        <span
          className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
            active === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
          }`}
        >
          {counts[tab.id] ?? 0}
        </span>
      </button>
    ))}
  </div>
);

export default DocumentsTabs;
