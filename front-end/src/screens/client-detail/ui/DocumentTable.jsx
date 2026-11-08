import React from 'react';
import { Eye, Send, RotateCcw, FileSearch } from 'lucide-react';
import Table from '../../../core/components/ui/Table';
import StatusBadge from '../../../core/components/ui/StatusBadge';
import FileIcon from '../../../core/components/ui/FileIcon';
import { DocumentStatus, statusPrazoDocumento, prazoDocumentoMeta } from '../../../core/domain/document';

const rowAction = (status) => {
  switch (status) {
    case DocumentStatus.RASCUNHO:
      return { label: 'Enviar', icon: Send, onClick: 'send' };
    case DocumentStatus.ENVIADO:
    case DocumentStatus.VISUALIZADO:
      return { label: 'Reenviar', icon: RotateCcw, onClick: 'send' };
    default:
      return { label: 'Ver protocolo', icon: FileSearch, onClick: 'view' };
  }
};

const DocumentTable = ({ documents, onView, onSend }) => (
  <Table>
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-slate-200/50 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
          <th className="p-4 pl-6 font-semibold">Documento</th>
          <th className="p-4 font-semibold">Tipo</th>
          <th className="p-4 font-semibold">Competência</th>
          <th className="p-4 font-semibold">Vencimento</th>
          <th className="p-4 font-semibold">Versão</th>
          <th className="p-4 font-semibold">Status</th>
          <th className="p-4 pr-6 font-semibold text-center">Ações</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((doc) => {
          const action = rowAction(doc.status);
          const ActionIcon = action.icon;
          const prazo = statusPrazoDocumento(doc);
          const prazoMeta = prazo ? prazoDocumentoMeta[prazo] : null;

          return (
            <tr key={doc.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors">
              <td className="p-4 pl-6 font-medium text-slate-700">
                <div className="flex items-center gap-3">
                  <FileIcon formato={doc.formato} />
                  {doc.nome}
                </div>
              </td>
              <td className="p-4 text-sm text-slate-600">{doc.area}</td>
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

                  <button
                    type="button"
                    onClick={() => (action.onClick === 'send' ? onSend(doc) : onView(doc))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      action.onClick === 'send'
                        ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ActionIcon size={14} />
                    {action.label}
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

export default DocumentTable;
