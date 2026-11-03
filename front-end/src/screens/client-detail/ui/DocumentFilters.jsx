import React from 'react';
import { AREAS_DOCUMENTO, DocumentStatus, documentStatusMeta, MESES, ANOS } from '../../../core/domain/documento';

const selectClass =
  'px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[160px]';

const DocumentFilters = ({ filters, onChange }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-4 flex flex-wrap items-end gap-4">
    <div className="flex flex-col gap-1.5">
      <label htmlFor="filtro-competencia" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Competência
      </label>
      <select
        id="filtro-competencia"
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
      <label htmlFor="filtro-tipo" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Tipo
      </label>
      <select
        id="filtro-tipo"
        className={selectClass}
        value={filters.tipo}
        onChange={(e) => onChange({ ...filters, tipo: e.target.value })}
      >
        <option value="">Todos</option>
        {AREAS_DOCUMENTO.map((area) => (
          <option key={area} value={area}>
            {area}
          </option>
        ))}
      </select>
    </div>

    <div className="flex flex-col gap-1.5">
      <label htmlFor="filtro-status" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Status
      </label>
      <select
        id="filtro-status"
        className={selectClass}
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
      >
        <option value="">Todos</option>
        {Object.values(DocumentStatus).map((status) => (
          <option key={status} value={status}>
            {documentStatusMeta[status].label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default DocumentFilters;
