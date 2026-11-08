import React from 'react';
import { Eye, Send, RotateCcw, FileSearch, AlertTriangle, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import Table from '../../../core/components/ui/Table';
import StatusBadge from '../../../core/components/ui/StatusBadge';
import FileIcon from '../../../core/components/ui/FileIcon';
import { DocumentStatus, LIMITE_DIAS_SEM_ABERTURA, emRiscoSemAbertura, ultimaAtividade, statusPrazoDocumento, prazoDocumentoMeta } from '../../../core/domain/document';

const contextualAction = (doc) => {
  switch (doc.status) {
    case DocumentStatus.RASCUNHO:
      return { label: 'Enviar', icon: Send, tipo: 'enviar' };
    case DocumentStatus.ENVIADO:
    case DocumentStatus.VISUALIZADO:
      return { label: 'Reenviar', icon: RotateCcw, tipo: 'enviar' };
    case DocumentStatus.BAIXADO:
      return { label: 'Ver protocolo', icon: FileSearch, tipo: 'protocolo' };
    default:
      return null;
  }
};

const SortHeader = ({ label, sortKey, sort, onSort, className = '' }) => {
  const ativo = sort.key === sortKey;
  const Icon = ativo ? (sort.dir === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown;

  return (
    <th className={`p-4 font-semibold ${className}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`flex items-center gap-1.5 uppercase tracking-wider hover:text-slate-700 transition-colors ${
          ativo ? 'text-indigo-600' : ''
        }`}
      >
        {label}
        <Icon size={13} />
      </button>
    </th>
  );
};

const DocumentsTable = ({
  documents,
  nomeCliente,
  onView,
  onSend,
  sort,
  onSort,
  selectedIds,
  onToggleRow,
  onTogglePage,
  todosDaPaginaSelecionados,
}) => (
  <Table>
    <table className="w-full text-left border-collapse min-w-[1024px]">
      <thead>
        <tr className="border-b border-slate-200/50 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
          <th className="p-4 pl-6 w-12">
            <input
              type="checkbox"
              aria-label="Selecionar todos os documentos da página"
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
              checked={todosDaPaginaSelecionados}
              onChange={(e) => onTogglePage(e.target.checked)}
            />
          </th>
          <SortHeader label="Cliente" sortKey="cliente" sort={sort} onSort={onSort} />
          <th className="p-4 font-semibold">Documento</th>
          <th className="p-4 font-semibold">Tipo</th>
          <SortHeader label="Competência" sortKey="competencia" sort={sort} onSort={onSort} />
          <th className="p-4 font-semibold">Vencimento</th>
          <th className="p-4 font-semibold">Versão</th>
          <th className="p-4 font-semibold">Status</th>
          <th className="p-4 font-semibold">Canal</th>
          <SortHeader label="Última atividade" sortKey="atividade" sort={sort} onSort={onSort} />
          <th className="p-4 pr-6 font-semibold text-center">Ações</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((doc) => {
          const risco = emRiscoSemAbertura(doc);
          const acao = contextualAction(doc);
          const ActionIcon = acao?.icon;
          const atividade = ultimaAtividade(doc);
          const marcado = selectedIds.has(doc.id);
          const prazo = statusPrazoDocumento(doc);
          const prazoMeta = prazo ? prazoDocumentoMeta[prazo] : null;

          return (
            <tr
              key={doc.id}
              className={`border-b border-slate-100 last:border-0 transition-colors ${
                risco ? 'bg-amber-50/80 hover:bg-amber-100/70' : 'hover:bg-slate-50/80'
              } ${marcado ? 'ring-1 ring-inset ring-indigo-300' : ''}`}
            >
              <td className="p-4 pl-6">
                <input
                  type="checkbox"
                  aria-label={`Selecionar ${doc.nome}`}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                  checked={marcado}
                  onChange={(e) => onToggleRow(doc.id, e.target.checked)}
                />
              </td>
              <td className="p-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                {nomeCliente(doc.clienteId)}
              </td>
              <td className="p-4 text-sm font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <FileIcon formato={doc.formato} />
                  <span className="truncate max-w-[200px]">{doc.nome}</span>
                  {risco && (
                    <span
                      title={`Enviado há mais de ${LIMITE_DIAS_SEM_ABERTURA} dias sem abertura pelo cliente`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-800 text-[11px] font-semibold whitespace-nowrap"
                    >
                      <AlertTriangle size={12} /> Sem abertura
                    </span>
                  )}
                </div>
              </td>
              <td className="p-4 text-sm text-slate-600">{doc.tipo}</td>
              <td className="p-4 text-sm text-slate-600">{doc.competencia}</td>
              <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                {doc.vencimento ? (
                  <div className="flex items-center gap-2">
                    <span>{doc.vencimento}</span>
                    {prazoMeta && (
                      <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${prazoMeta.badge}`}>
                        {prazoMeta.label}
                      </span>
                    )}
                  </div>
                ) : (
                  '—'
                )}
              </td>
              <td className="p-4 text-sm font-semibold text-slate-600">v{doc.versao}</td>
              <td className="p-4">
                <StatusBadge status={doc.status} />
              </td>
              <td className="p-4 text-sm text-slate-600">{doc.canal ?? '—'}</td>
              <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                {atividade ? `${atividade.data} · ${atividade.hora}` : '—'}
              </td>
              <td className="p-4 pr-6">
                <div className="flex justify-center items-center gap-2">
                  <button
                    type="button"
                    title="Visualizar document"
                    aria-label={`Visualizar ${doc.nome}`}
                    onClick={() => onView(doc)}
                    className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Eye size={16} />
                  </button>

                  {acao && (
                    <button
                      type="button"
                      title={acao.label}
                      aria-label={`${acao.label} ${doc.nome}`}
                      onClick={() => (acao.tipo === 'enviar' ? onSend(doc) : onView(doc))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        acao.tipo === 'enviar'
                          ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <ActionIcon size={14} />
                      {acao.label}
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

export default DocumentsTable;
