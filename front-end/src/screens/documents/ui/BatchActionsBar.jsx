import React from 'react';
import { RotateCcw, FileDown, Combine, X } from 'lucide-react';

const BatchActionsBar = ({
  count,
  podeReenviar,
  onReenviar,
  onExportar,
  podeJuntar,
  motivoJuntar,
  onJuntar,
  onClear,
}) => (
  <div
    role="toolbar"
    aria-label="Ações em lote"
    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-800 text-white rounded-2xl shadow-2xl border border-slate-700 px-5 py-3 flex flex-wrap items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
  >
    <span className="text-sm font-semibold text-slate-200 pr-1">
      {count} documento{count > 1 ? 's' : ''} selecionado{count > 1 ? 's' : ''}
    </span>

    <button
      type="button"
      disabled={!podeReenviar}
      onClick={onReenviar}
      title={podeReenviar ? 'Reenviar documentos enviados/visualizados' : 'Selecione documentos Enviados ou Visualizados'}
      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed text-sm font-semibold transition-colors"
    >
      <RotateCcw size={15} /> Reenviar
    </button>

    <button
      type="button"
      onClick={onExportar}
      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-700 hover:bg-slate-600 text-sm font-semibold transition-colors"
    >
      <FileDown size={15} /> Exportar protocolos (CSV)
    </button>

    <button
      type="button"
      disabled={!podeJuntar}
      onClick={onJuntar}
      title={motivoJuntar ?? 'Juntar os PDFs selecionados em um único arquivo'}
      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed text-sm font-semibold transition-colors"
    >
      <Combine size={15} /> Juntar em um PDF
    </button>

    <button
      type="button"
      onClick={onClear}
      aria-label="Limpar seleção"
      title="Limpar seleção"
      className="p-2 rounded-full text-slate-300 hover:bg-slate-700 transition-colors"
    >
      <X size={16} />
    </button>
  </div>
);

export default BatchActionsBar;
