import React from 'react';
import { Search, X } from 'lucide-react';
import ClientSelect from '../../documents/ui/ClientSelect';
import { MESES, ANOS } from '../../../core/domain/documento';
import {
  CATEGORIAS,
  STATUS_PRAZO_OPCOES,
  statusPrazoMeta,
  PRIORIDADE_OPCOES,
  prioridadeMeta,
} from '../../../core/domain/prazo';

const selectClass =
  'px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[150px]';

const PrazoFilters = ({ filters, onChange, clientes, opcoesObrigacao, onClear }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-4 flex flex-wrap items-end gap-4">
    <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
      <label htmlFor="filtro-busca-prazo" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Busca
      </label>
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id="filtro-busca-prazo"
          type="text"
          placeholder="Ex.: FGTS, eSocial, DAS"
          className="w-full px-3 py-2.5 pl-9 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          value={filters.busca}
          onChange={(e) => onChange({ ...filters, busca: e.target.value })}
        />
      </div>
    </div>

    <div className="flex flex-col gap-1.5">
      <ClientSelect
        id="filtro-cliente-prazo"
        label="Cliente"
        clientes={clientes}
        value={filters.clienteId}
        onChange={(cliente) => onChange({ ...filters, clienteId: cliente?.id ?? null })}
        placeholder="Todos os clientes"
      />
    </div>

    <div className="flex flex-col gap-1.5">
      <label htmlFor="filtro-obrigacao-prazo" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Obrigação
      </label>
      <select
        id="filtro-obrigacao-prazo"
        className={selectClass}
        value={filters.obrigacao}
        onChange={(e) => onChange({ ...filters, obrigacao: e.target.value })}
      >
        <option value="">Todas</option>
        {opcoesObrigacao.map((nome) => (
          <option key={nome} value={nome}>
            {nome}
          </option>
        ))}
      </select>
    </div>

    <div className="flex flex-col gap-1.5">
      <label htmlFor="filtro-categoria-prazo" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Categoria
      </label>
      <select
        id="filtro-categoria-prazo"
        className={selectClass}
        value={filters.categoria}
        onChange={(e) => onChange({ ...filters, categoria: e.target.value })}
      >
        <option value="">Todas</option>
        {CATEGORIAS.map((categoria) => (
          <option key={categoria} value={categoria}>
            {categoria}
          </option>
        ))}
      </select>
    </div>

    <div className="flex flex-col gap-1.5">
      <label htmlFor="filtro-competencia-prazo" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Competência
      </label>
      <select
        id="filtro-competencia-prazo"
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
      <label htmlFor="filtro-status-prazo" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Status
      </label>
      <select
        id="filtro-status-prazo"
        className={selectClass}
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
      >
        <option value="">Todos</option>
        {STATUS_PRAZO_OPCOES.map((status) => (
          <option key={status} value={status}>
            {statusPrazoMeta[status].label}
          </option>
        ))}
      </select>
    </div>

    <div className="flex flex-col gap-1.5">
      <label htmlFor="filtro-prioridade-prazo" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Prioridade
      </label>
      <select
        id="filtro-prioridade-prazo"
        className={selectClass}
        value={filters.prioridade}
        onChange={(e) => onChange({ ...filters, prioridade: e.target.value })}
      >
        <option value="">Todas</option>
        {PRIORIDADE_OPCOES.map((prioridade) => (
          <option key={prioridade} value={prioridade}>
            {prioridadeMeta[prioridade].label}
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

export default PrazoFilters;
