import React from 'react';
import { Search, X } from 'lucide-react';
import ClientSelect from './ClientSelect';
import {
  CANAIS_DOCUMENTO,
  STATUS_DOCUMENTO_FILTROS,
  documentStatusMeta,
  MESES,
  ANOS,
} from '../../../core/domain/documento';

const selectClass =
  'px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[150px]';

const DocumentsFilters = ({ filters, onChange, clientes, onClear }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-4 flex flex-wrap items-end gap-4">
    <div className="flex flex-col gap-1.5 flex-1 min-w-[220px]">
      <label htmlFor="filtro-busca-doc" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Busca por nome
      </label>
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id="filtro-busca-doc"
          type="text"
          placeholder="Ex.: Guia FGTS"
          className="w-full px-3 py-2.5 pl-9 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          value={filters.busca}
          onChange={(e) => onChange({ ...filters, busca: e.target.value })}
        />
      </div>
    </div>

    <div className="flex flex-col gap-1.5">
      <ClientSelect
        id="filtro-cliente-doc"
        label="Cliente"
        clientes={clientes}
        value={filters.clienteId}
        onChange={(cliente) => onChange({ ...filters, clienteId: cliente?.id ?? null })}
        placeholder="Todos os clientes"
      />
    </div>

    <div className="flex flex-col gap-1.5">
      <label htmlFor="filtro-tipo-doc" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Tipo
      </label>
      <select
        id="filtro-tipo-doc"
        className={selectClass}
        value={filters.tipo}
        onChange={(e) => onChange({ ...filters, tipo: e.target.value })}
      >
        <option value="">Todos</option>
        {filters.opcoesTipo.map((tipo) => (
          <option key={tipo} value={tipo}>
            {tipo}
          </option>
        ))}
      </select>
    </div>

    <div className="flex flex-col gap-1.5">
      <label htmlFor="filtro-competencia-doc" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Competência
      </label>
      <select
        id="filtro-competencia-doc"
        className={selectClass}
        value={filters.competencia}
        onChange={(e) => onChange({ ...filters, competencia: e.target.value })}
      >
        <option value="">Todas</option>
        {ANOS.flatMap((ano) =>
          MESES.map((mes) => {
            const value = `${mes}/${ano}`;
            return (
              <option key={value} value={value}>
                {mes}/{ano}
              </option>
            );
          })
        )}
      </select>
    </div>

    <div className="flex flex-col gap-1.5">
      <label htmlFor="filtro-status-doc" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Status
      </label>
      <select
        id="filtro-status-doc"
        className={selectClass}
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
      >
        <option value="">Todos</option>
        {STATUS_DOCUMENTO_FILTROS.map((status) => (
          <option key={status} value={status}>
            {documentStatusMeta[status].label}
          </option>
        ))}
      </select>
    </div>

    <div className="flex flex-col gap-1.5">
      <label htmlFor="filtro-canal-doc" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Canal
      </label>
      <select
        id="filtro-canal-doc"
        className={selectClass}
        value={filters.canal}
        onChange={(e) => onChange({ ...filters, canal: e.target.value })}
      >
        <option value="">Todos</option>
        {CANAIS_DOCUMENTO.map((canal) => (
          <option key={canal} value={canal}>
            {canal}
          </option>
        ))}
      </select>
    </div>

    <button
      type="button"
      onClick={onClear}
      className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
    >
      <X size={15} /> Limpar filtros
    </button>
  </div>
);

export default DocumentsFilters;
