import React from 'react';
import { StatusSolicitacao, solicitacaoStatusMeta } from '../../../core/domain/solicitacao';
import { MESES, ANOS } from '../../../core/domain/documento';

const selectClass =
  'px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[170px]';

const SolicitacaoFilters = ({ filters, onChange, clientes, showCliente = true }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-4 flex flex-wrap items-end gap-4">
    {showCliente && (
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filtro-cliente-sol" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Cliente
        </label>
        <select
          id="filtro-cliente-sol"
          className={selectClass}
          value={filters.clienteId}
          onChange={(e) => onChange({ ...filters, clienteId: e.target.value })}
        >
          <option value="">Todos</option>
          {(clientes ?? []).map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.razaoSocial}
            </option>
          ))}
        </select>
      </div>
    )}

    <div className="flex flex-col gap-1.5">
      <label htmlFor="filtro-status-sol" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Status
      </label>
      <select
        id="filtro-status-sol"
        className={selectClass}
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
      >
        <option value="">Todos</option>
        {Object.values(StatusSolicitacao).map((status) => (
          <option key={status} value={status}>
            {solicitacaoStatusMeta[status].label}
          </option>
        ))}
      </select>
    </div>

    <div className="flex flex-col gap-1.5">
      <label htmlFor="filtro-competencia-sol" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Competência
      </label>
      <select
        id="filtro-competencia-sol"
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
  </div>
);

export default SolicitacaoFilters;
