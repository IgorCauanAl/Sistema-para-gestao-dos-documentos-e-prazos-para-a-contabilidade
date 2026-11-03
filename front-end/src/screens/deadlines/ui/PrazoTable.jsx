import React from 'react';
import { Eye, CheckCircle2 } from 'lucide-react';
import Table from '../../../core/components/ui/Table';
import { PrazoStatusBadge, PrioridadeBadge, AtrasoBadge } from './PrazoBadges';
import {
  StatusPrazo,
  estaAtrasado,
  diasRestantes,
  textoRelativoVencimento,
  prioridadeEfetiva,
  etapaAtualLabel,
} from '../../../core/domain/prazo';

const PrazoTable = ({ prazos, nomeCliente, hoje, onView, onEntregar }) => (
  <Table>
    <table className="w-full text-left border-collapse min-w-[1024px]">
      <thead>
        <tr className="border-b border-slate-200/50 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
          <th className="p-4 pl-6 font-semibold">Cliente</th>
          <th className="p-4 font-semibold">Obrigação</th>
          <th className="p-4 font-semibold">Categoria</th>
          <th className="p-4 font-semibold">Competência</th>
          <th className="p-4 font-semibold">Vencimento</th>
          <th className="p-4 font-semibold">Prioridade</th>
          <th className="p-4 font-semibold">Etapa atual</th>
          <th className="p-4 font-semibold">Status</th>
          <th className="p-4 pr-6 font-semibold text-center">Ações</th>
        </tr>
      </thead>
      <tbody>
        {prazos.map((prazo) => {
          const atrasado = estaAtrasado(prazo, hoje);
          const dias = diasRestantes(prazo, hoje);
          const venceHoje = dias === 0 && prazo.status !== StatusPrazo.ENTREGUE;
          const relativo = textoRelativoVencimento(prazo, hoje);

          return (
            <tr
              key={prazo.id}
              className={`border-b border-slate-100 last:border-0 transition-colors ${
                atrasado
                  ? 'bg-red-50/70 hover:bg-red-100/60'
                  : venceHoje
                    ? 'bg-orange-50/70 hover:bg-orange-100/60'
                    : 'hover:bg-slate-50/80'
              }`}
            >
              <td className="p-4 pl-6 text-sm font-medium text-slate-700 whitespace-nowrap">
                {nomeCliente(prazo.clienteId)}
              </td>
              <td className="p-4 text-sm font-medium text-slate-700">{prazo.obrigacao}</td>
              <td className="p-4 text-sm text-slate-600">{prazo.categoria}</td>
              <td className="p-4 text-sm text-slate-600 whitespace-nowrap">{prazo.competencia}</td>
              <td className="p-4 text-sm whitespace-nowrap">
                <div className="flex flex-col">
                  <span className={atrasado ? 'font-semibold text-red-600' : 'text-slate-600'}>
                    {prazo.vencimentoAtual}
                  </span>
                  {relativo && (
                    <span className={`text-xs ${atrasado ? 'text-red-500' : 'text-slate-400'}`}>{relativo}</span>
                  )}
                </div>
              </td>
              <td className="p-4">
                <PrioridadeBadge prioridade={prioridadeEfetiva(prazo, hoje)} />
              </td>
              <td className="p-4 text-sm text-slate-600 whitespace-nowrap">{etapaAtualLabel(prazo)}</td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <PrazoStatusBadge status={prazo.status} />
                  {atrasado && <AtrasoBadge />}
                </div>
              </td>
              <td className="p-4 pr-6">
                <div className="flex justify-center items-center gap-2">
                  <button
                    type="button"
                    title="Ver detalhes do prazo"
                    aria-label={`Ver prazo ${prazo.obrigacao} de ${nomeCliente(prazo.clienteId)}`}
                    onClick={() => onView(prazo)}
                    className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Eye size={16} />
                  </button>

                  {prazo.status !== StatusPrazo.ENTREGUE && (
                    <button
                      type="button"
                      title="Marcar como entregue"
                      aria-label={`Marcar ${prazo.obrigacao} de ${nomeCliente(prazo.clienteId)} como entregue`}
                      onClick={() => onEntregar(prazo)}
                      className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </Table>
);

export default PrazoTable;
