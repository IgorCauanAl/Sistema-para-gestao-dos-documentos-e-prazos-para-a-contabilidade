import React, { useEffect, useState } from 'react';
import { X, Copy, Send, Plus, Download, Award, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import StatusBadge from '../../../core/components/ui/StatusBadge';
import Timeline from '../../../core/components/ui/Timeline';
import FileIcon from '../../../core/components/ui/FileIcon';

const protocolStepsSaida = [
  { etapa: 'CRIADO', titulo: 'Criado' },
  { etapa: 'ENVIADO', titulo: 'Enviado' },
  { etapa: 'VISUALIZADO', titulo: 'Visualizado' },
  { etapa: 'BAIXADO', titulo: 'Baixado' },
];

const protocolStepsEntrada = [
  { etapa: 'CRIADO', titulo: 'Registrado' },
  { etapa: 'RECEBIDO', titulo: 'Recebido do cliente' },
  { etapa: 'VISUALIZADO', titulo: 'Visualizado' },
  { etapa: 'BAIXADO', titulo: 'Baixado' },
];

const DocumentViewer = ({
  open,
  document,
  versions,
  onSelectVersion,
  onClose,
  onResend,
  onNewVersion,
  onDownload,
  onReceipt,
  showActions = true,
}) => {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setZoom(100);
      setPage(1);
      setCopied(false);
    }
  }, [open, document?.id]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !document) return null;

  const isPdf = document.formato === 'pdf';
  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(document.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const steps = document.direcao === 'ENTRADA' ? protocolStepsEntrada : protocolStepsSaida;

  const timelineItems = steps.map((step) => {
    const evento = document.historico.find((h) => h.etapa === step.etapa);

    return {
      title:
        step.etapa === 'ENVIADO' && evento?.canal ? `Enviado (${evento.canal})` : step.titulo,
      done: Boolean(evento),
      date: evento?.data,
      time: evento?.hora,
      extra: evento ? `IP ${evento.ip}` : undefined,
    };
  });

  const currentVersion = versions.find((v) => v.id === document.id) ?? document;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Visualizar ${document.nome}`}
        className="bg-white w-full max-w-6xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <FileIcon formato={document.formato} />
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-800 truncate">
                {document.nome} · v{document.versao} · {document.competencia}
              </p>
              <p className="text-xs text-slate-400 truncate">{document.tamanho} · {document.formato.toUpperCase()}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar visualização"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
            <div className="lg:col-span-3 space-y-4">
              {isPdf ? (
                <div className="bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Página anterior"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-xs font-medium text-slate-600">
                        Página {page} de 1
                      </span>
                      <button
                        type="button"
                        aria-label="Próxima página"
                        disabled
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Diminuir zoom"
                        onClick={() => setZoom((z) => Math.max(50, z - 10))}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                      >
                        <ZoomOut size={16} />
                      </button>
                      <span className="text-xs font-medium text-slate-600 w-10 text-center">{zoom}%</span>
                      <button
                        type="button"
                        aria-label="Aumentar zoom"
                        onClick={() => setZoom((z) => Math.min(200, z + 10))}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                      >
                        <ZoomIn size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 flex justify-center overflow-auto max-h-[60vh]">
                    <div
                      className="bg-white shadow-md border border-slate-200 w-full max-w-[520px] aspect-[1/1.414] p-8 space-y-3 transition-transform"
                      style={{ transform: `scale(${zoom / 100})` }}
                      aria-label="Pré-visualização simulada da página do PDF"
                    >
                      <div className="h-6 w-2/5 bg-slate-200 rounded" />
                      <div className="h-3 w-full bg-slate-100 rounded" />
                      <div className="h-3 w-11/12 bg-slate-100 rounded" />
                      <div className="h-3 w-4/5 bg-slate-100 rounded" />
                      <div className="h-32 w-full bg-slate-50 border border-slate-200 rounded-xl mt-6" />
                      <div className="h-3 w-full bg-slate-100 rounded" />
                      <div className="h-3 w-10/12 bg-slate-100 rounded" />
                      <p className="text-[10px] text-slate-300 pt-6 text-center">
                        Pré-visualização simulada — conteúdo real disponível após integração com o backend.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-3xl border border-slate-200 p-10 flex flex-col items-center justify-center gap-4 text-center min-h-[320px]">
                  <FileIcon formato={document.formato} size={40} />
                  <div>
                    <p className="text-lg font-bold text-slate-700">{document.nome}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {document.formato.toUpperCase()} · {document.tamanho}
                    </p>
                  </div>
                  {showActions && (
                    <button
                      type="button"
                      onClick={onDownload}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white rounded-full text-sm font-medium hover:bg-indigo-600 transition-colors"
                    >
                      <Download size={16} /> Baixar
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {document.nome} · v{document.versao} · {document.competencia}
                </h3>
                <StatusBadge status={document.status} />
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Hash do arquivo (SHA-256)
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-slate-600 font-mono break-all flex-1">
                    {document.hash.slice(0, 24)}…{document.hash.slice(-8)}
                  </code>
                  <button
                    type="button"
                    onClick={copyHash}
                    aria-label="Copiar hash do arquivo"
                    className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
                  >
                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-4">Protocolo de entrega</h4>
                <Timeline items={timelineItems} />
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3">Versões</h4>
                <div className="space-y-2">
                  {versions.map((version) => {
                    const isActive = version.id === currentVersion.id;
                    const criado = version.historico.find((h) => h.etapa === 'CRIADO');

                    return (
                      <button
                        key={version.id}
                        type="button"
                        onClick={() => onSelectVersion(version)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                          isActive
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>
                          v{version.versao}
                          {isActive && ' · vigente'}
                        </span>
                        <span className="text-xs text-slate-400">{criado?.data}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {showActions && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onResend}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
                >
                  <Send size={15} /> Reenviar
                </button>
                <button
                  type="button"
                  onClick={onNewVersion}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors text-sm font-medium"
                >
                  <Plus size={15} /> Nova versão
                </button>
                <button
                  type="button"
                  onClick={onDownload}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
                >
                  <Download size={15} /> Baixar
                </button>
                <button
                  type="button"
                  onClick={onReceipt}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 transition-colors text-sm font-medium"
                >
                  <Award size={15} /> Gerar comprovante
                </button>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
