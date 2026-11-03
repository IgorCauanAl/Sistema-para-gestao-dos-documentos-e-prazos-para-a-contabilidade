import React from 'react';
import { Eye, Send, XCircle } from 'lucide-react';
import Table from '../../../core/components/ui/Table';
import StatusBadge from '../../../core/components/ui/StatusBadge';
import ProgressBar from '../../../core/components/ui/ProgressBar';
import {
  calcularStatusSolicitacao,
  progressoSolicitacao,
  solicitacaoStatusMeta,
} from '../../../core/domain/solicitacao';

const SolicitacaoTable = ({ solicitacoes, nomeCliente, onOpen, onResend, onCancel, showCliente = true }) => (
  <Table>
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-slate-200/50 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
          {showCliente && <th className="p-4 pl-6 font-semibold">Cliente</th>}
          <th className="p-4 font-semibold">Solicitação</th>
          <th className="p-4 font-semibold">Competência</th>
          <th className="p-4 font-semibold min-w-[180px]">Progresso</th>
          <th className="p-4 font-semibold">Prazo</th>
          <th className="p-4 font-semibold">Status</th>
          <th className="p-4 pr-6 font-semibold text-center">Ações</th>
        </tr>
      </thead>
      <tbody>
        {solicitacoes.map((sol) => {
          const status = calcularStatusSolicitacao(sol);
          const progresso = progressoSolicitacao(sol);

          return (
            <tr
              key={sol.id}
              onClick={() => onOpen(sol)}
              className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              {showCliente && (
                <td className="p-4 pl-6 text-sm font-medium text-slate-700">{nomeCliente(sol.clienteId)}</td>
              )}
              <td className="p-4 text-sm font-semibold text-slate-700">{sol.titulo}</td>
              <td className="p-4 text-sm text-slate-600">{sol.competencia}</td>
              <td className="p-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-500">{progresso.label}</span>
                  <ProgressBar pct={progresso.pct} tone={progresso.pct === 100 ? 'green' : 'indigo'} />
                </div>
              </td>
              <td className="p-4 text-sm text-slate-600">{sol.prazo}</td>
              <td className="p-4">
                <StatusBadge meta={solicitacaoStatusMeta[status]} />
              </td>
              <td className="p-4 pr-6">
                <div className="flex justify-center items-center gap-2">
                  <button
                    type="button"
                    title="Ver solicitação"
                    aria-label={`Ver solicitação ${sol.titulo}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen(sol);
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    type="button"
                    title="Reenviar link"
                    aria-label={`Reenviar link de ${sol.titulo}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onResend(sol);
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Send size={16} />
                  </button>
                  <button
                    type="button"
                    title="Cancelar solicitação"
                    aria-label={`Cancelar solicitação ${sol.titulo}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel(sol);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </Table>
);

export default SolicitacaoTable;
