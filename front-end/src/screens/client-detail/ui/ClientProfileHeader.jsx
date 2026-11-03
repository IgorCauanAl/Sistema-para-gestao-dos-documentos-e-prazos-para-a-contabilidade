import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Pencil, Plus } from 'lucide-react';

const InfoItem = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
    <span className="text-sm font-medium text-slate-700">{value}</span>
  </div>
);

const ClientProfileHeader = ({ client, onEdit, onAttach }) => {
  const canalBadge =
    client.canalPreferido === 'WhatsApp'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-indigo-50 text-indigo-600 border-indigo-200';

  return (
    <div>
      <Link
        to="/clientes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-4"
      >
        <ArrowLeft size={16} /> Clientes
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-6 flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-500 shrink-0">
            <Building2 size={26} />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight truncate">{client.razaoSocial}</h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2">
              <span className="text-sm text-slate-500">CNPJ {client.cnpj}</span>
              <span className="text-sm text-slate-500">Responsável: {client.responsavel}</span>
              <span className="text-sm text-slate-500">{client.email}</span>
              {client.whatsapp && <span className="text-sm text-slate-500">WhatsApp: {client.whatsapp}</span>}
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${canalBadge}`}
              >
                Canal preferido: {client.canalPreferido}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Pencil size={16} /> Editar
          </button>
          <button
            type="button"
            onClick={onAttach}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-full text-sm font-medium shadow-sm hover:bg-indigo-600 transition-colors"
          >
            <Plus size={18} /> Anexar documento
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientProfileHeader;
