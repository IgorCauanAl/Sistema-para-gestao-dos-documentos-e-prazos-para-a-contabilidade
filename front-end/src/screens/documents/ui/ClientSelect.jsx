import React, { useEffect, useRef, useState } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

const ClientSelect = ({ clientes, value, onChange, id, placeholder = 'Buscar cliente...', label }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const blurTimer = useRef(null);

  const selecionado = clientes.find((c) => c.id === value) ?? null;

  useEffect(() => {
    setQuery(selecionado?.razaoSocial ?? '');
  }, [value, clientes]);

  const termo = query.trim().toLowerCase();
  const selecionadoEstaDigitado = Boolean(selecionado && query === selecionado.razaoSocial);
  const sugestoes =
    open && termo && !selecionadoEstaDigitado
      ? clientes.filter((c) => c.razaoSocial.toLowerCase().includes(termo)).slice(0, 6)
      : [];

  const handleChange = (valor) => {
    setQuery(valor);
    setOpen(true);
    if (selecionado && valor !== selecionado.razaoSocial) onChange(null);
  };

  const selecionar = (cliente) => {
    onChange(cliente);
    setQuery(cliente.razaoSocial);
    setOpen(false);
  };

  const fechar = () => {
    blurTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => () => clearTimeout(blurTimer.current), []);

  return (
    <div className="relative min-w-[210px]">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          className="w-full px-3 py-2.5 pl-9 pr-8 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={fechar}
        />
        <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>

      {sugestoes.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1.5 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg py-1"
        >
          {sugestoes.map((cliente) => (
            <li key={cliente.id} role="option" aria-selected={cliente.id === value}>
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selecionar(cliente)}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 flex items-center justify-between gap-2"
              >
                <span className="truncate">{cliente.razaoSocial}</span>
                {cliente.id === value && <Check size={14} className="text-indigo-500 shrink-0" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClientSelect;
