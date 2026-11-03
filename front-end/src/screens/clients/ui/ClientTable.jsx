import React from 'react';
import { Edit2, Trash2, Building2, Eye } from 'lucide-react';
import Table from '../../../core/components/ui/Table';

const PendenciasBadge = ({ count }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
      count > 0
        ? 'bg-orange-50 text-orange-700 border-orange-200'
        : 'bg-green-50 text-green-700 border-green-200'
    }`}
  >
    {count > 0 ? `${count} pendente${count > 1 ? 's' : ''}` : 'Sem pendências'}
  </span>
);

const ClientTable = ({ clients, onEdit, onRemove, onOpen }) => (
  <Table>
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-slate-200/50 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
          <th className="p-4 pl-6 font-semibold">Razão Social</th>
          <th className="p-4 font-semibold">CNPJ</th>
          <th className="p-4 font-semibold">Responsável</th>
          <th className="p-4 font-semibold">E-mail</th>
          <th className="p-4 font-semibold">Pendências</th>
          <th className="p-4 font-semibold">Último envio</th>
          <th className="p-4 pr-6 font-semibold text-center">Ações</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((client) => (
          <tr
            key={client.id}
            onClick={() => onOpen(client)}
            className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors cursor-pointer"
          >
            <td className="p-4 pl-6 font-medium text-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-500">
                  <Building2 size={18} />
                </div>
                {client.razaoSocial}
              </div>
            </td>
            <td className="p-4 text-sm text-slate-600">{client.cnpj}</td>
            <td className="p-4 text-sm text-slate-600">{client.responsavel}</td>
            <td className="p-4 text-sm text-slate-600">{client.email}</td>
            <td className="p-4">
              <PendenciasBadge count={client.pendencias ?? 0} />
            </td>
            <td className="p-4 text-sm text-slate-600">{client.ultimoEnvio ?? '—'}</td>
            <td className="p-4 pr-6">
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  title="Abrir ficha do cliente"
                  aria-label={`Abrir ficha de ${client.razaoSocial}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen(client);
                  }}
                  className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Eye size={16} />
                </button>
                <button
                  type="button"
                  title="Editar cliente"
                  aria-label={`Editar ${client.razaoSocial}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(client);
                  }}
                  className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  title="Excluir cliente"
                  aria-label={`Excluir ${client.razaoSocial}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(client);
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {clients.length === 0 && (
          <tr>
            <td colSpan="7" className="p-12 text-center text-slate-500">
              Nenhum cliente encontrado.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </Table>
);

export default ClientTable;
