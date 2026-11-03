import React, { useState } from 'react';
import { Eye, Download, Check, X, History, ClipboardPlus, FileText } from 'lucide-react';
import StatusBadge from '../../../core/components/ui/StatusBadge';
import { StatusItem, itemStatusMeta, acaoTentativaLabel, MotivoRecusa, motivoRecusaLabel } from '../../../core/domain/solicitacao';

const ultimaTentativaComArquivo = (item) =>
  [...item.tentativas].reverse().find((t) => t.arquivo) ?? null;

const SolicitacaoItemCard = ({
  item,
  onApprove,
  onReject,
  onManualReceipt,
  onViewFile,
  onDownload,
}) => {
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const enviado = item.status === StatusItem.ENVIADO;
  const arquivo = ultimaTentativaComArquivo(item);
  const ultimaRecusa = [...item.tentativas].reverse().find((t) => t.acao === 'RECUSADO') ?? null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
            <FileText size={18} />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate">{item.nome}</p>
            <p className="text-xs text-slate-400">Formato esperado: {item.formatoEsperado}</p>
          </div>
        </div>
        <StatusBadge meta={itemStatusMeta[item.status]} />
      </div>

      {item.status === StatusItem.RECUSADO && ultimaRecusa && (
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-2xl">
          <p className="text-xs font-semibold text-red-700">
            Recusado: {motivoRecusaLabel[ultimaRecusa.motivo]}
            {ultimaRecusa.detalhes ? ` — ${ultimaRecusa.detalhes}` : ''}
          </p>
        </div>
      )}

      {arquivo && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Arquivo do cliente</p>
            <p className="text-sm font-medium text-slate-700 truncate">{arquivo.arquivo.nome}</p>
          </div>
          <span className="text-sm text-slate-500">{arquivo.arquivo.tamanho}</span>
          <span className="text-sm text-slate-500">
            {arquivo.data} às {arquivo.hora}
          </span>
          {arquivo.canalOrigem && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-50 text-indigo-600">
              {arquivo.canalOrigem}
            </span>
          )}
          {arquivo.observacao && (
            <span className="text-sm text-slate-500 italic w-full">“{arquivo.observacao}”</span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              title="Visualizar arquivo"
              aria-label={`Visualizar ${arquivo.arquivo.nome}`}
              onClick={() => onViewFile(item, arquivo)}
              className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Eye size={16} />
            </button>
            <button
              type="button"
              title="Baixar arquivo"
              aria-label={`Baixar ${arquivo.arquivo.nome}`}
              onClick={() => onDownload(item, arquivo)}
              className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      )}

      {item.status === StatusItem.APROVADO && item.vencimento && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 bg-green-50 rounded-2xl border border-green-100">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-green-700/70">Competência</p>
            <p className="text-sm font-medium text-slate-700">{item.competencia}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-green-700/70">Vencimento</p>
            <p className="text-sm font-medium text-slate-700">{item.vencimento}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {enviado && (
          <>
            <button
              type="button"
              onClick={() => onApprove(item)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              <Check size={16} /> Aceitar
            </button>
            <button
              type="button"
              onClick={() => onReject(item)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
            >
              <X size={16} /> Recusar
            </button>
          </>
        )}

        {(item.status === StatusItem.PENDENTE || item.status === StatusItem.RECUSADO) && (
          <button
            type="button"
            onClick={() => onManualReceipt(item)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <ClipboardPlus size={16} /> Registrar recebimento manual
          </button>
        )}
      </div>

      <div className="border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => setHistoricoAberto((v) => !v)}
          aria-expanded={historicoAberto}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <History size={15} />
          Histórico de tentativas ({item.tentativas.length})
        </button>

        {historicoAberto && (
          <ol className="mt-3 space-y-3">
            {item.tentativas.length === 0 && (
              <li className="text-sm text-slate-400 italic">Nenhuma tentativa registrada.</li>
            )}
            {item.tentativas.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="text-slate-500">
                  {t.data} às {t.hora}
                </span>
                <span
                  className={`font-semibold ${
                    t.acao === 'APROVADO'
                      ? 'text-green-700'
                      : t.acao === 'RECUSADO'
                        ? 'text-red-600'
                        : 'text-slate-700'
                  }`}
                >
                  {acaoTentativaLabel[t.acao] ?? t.acao}
                </span>
                {t.motivo && <span className="text-slate-500">({motivoRecusaLabel[t.motivo]})</span>}
                {t.detalhes && <span className="text-slate-400 truncate">— {t.detalhes}</span>}
                <span className="text-xs text-slate-400 ml-auto">IP {t.ip}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default SolicitacaoItemCard;
