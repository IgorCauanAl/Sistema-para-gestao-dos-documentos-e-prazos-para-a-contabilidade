import React, { useEffect, useRef, useState } from 'react';
import { Paperclip, UploadCloud, X, FileText } from 'lucide-react';
import Modal from '../../../core/components/ui/Modal';
import PrazoFields from '../../../core/components/ui/PrazoFields';
import ClientSelect from './ClientSelect';
import {
  CANAIS_ORIGEM_RECEBIMENTO,
  TIPOS_DOCUMENTO,
  MESES,
  ANOS,
  ANTECEDENCIA_PADRAO,
  extensaoDe,
  FORMATOS_ACEITOS,
} from '../../../core/domain/documento';
import { paraBR } from '../../../core/domain/data';

const inputClass =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700';

const formatSize = (bytes) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const ReceiveDocumentModal = ({ open, onClose, clientes, onSubmit }) => {
  const inputRef = useRef(null);

  const [clienteId, setClienteId] = useState(null);
  const [file, setFile] = useState(null);
  const [tipo, setTipo] = useState('');
  const [competencia, setCompetencia] = useState('10/2026');
  const [vencimento, setVencimento] = useState('');
  const [diasAntecedencia, setDiasAntecedencia] = useState(ANTECEDENCIA_PADRAO);
  const [canal, setCanal] = useState('WhatsApp');
  const [observacao, setObservacao] = useState('');
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setClienteId(null);
    setFile(null);
    setTipo('');
    setCompetencia('10/2026');
    setVencimento('');
    setDiasAntecedencia(ANTECEDENCIA_PADRAO);
    setCanal('WhatsApp');
    setObservacao('');
    setDragging(false);
    setError('');
  }, [open]);

  const handleFile = (selected) => {
    if (!selected) return;

    const ext = extensaoDe(selected.name);
    if (!FORMATOS_ACEITOS.includes(ext)) {
      setFile(null);
      setError(
        `Formato ".${ext}" não suportado. Envie um dos formatos: ${FORMATOS_ACEITOS.map((f) => f.toUpperCase()).join(', ')}.`
      );
      return;
    }

    setError('');
    setFile(selected);
  };

  const handleSubmit = () => {
    if (!clienteId) {
      setError('Selecione o cliente que enviou o documento.');
      return;
    }
    if (!file) {
      setError('Selecione o arquivo recebido.');
      return;
    }
    if (!tipo) {
      setError('Selecione o tipo do documento.');
      return;
    }

    setError('');
    onSubmit({
      clienteId,
      tipo,
      competencia,
      canal: canal === 'Outro' ? 'Manual' : canal,
      vencimento: vencimento ? paraBR(vencimento) : null,
      diasAntecedencia,
      formato: extensaoDe(file.name),
      tamanho: formatSize(file.size),
      observacao: observacao.trim(),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar recebimento"
      footer={
        <div className="px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors text-sm"
          >
            Registrar recebimento
          </button>
        </div>
      }
    >
      <form onSubmit={(e) => e.preventDefault()} className="p-6 space-y-5 bg-slate-50/50">
        <div>
          <p className="block text-sm font-semibold mb-1.5 text-slate-700">
            Cliente <span className="text-red-500">*</span>
          </p>
          <ClientSelect
            id="recebimento-cliente"
            clientes={clientes}
            value={clienteId}
            onChange={(cliente) => setClienteId(cliente?.id ?? null)}
            placeholder="Busque pelo nome do cliente..."
          />
        </div>

        <div>
          <label htmlFor="recebimento-arquivo" className="block text-sm font-semibold mb-1.5 text-slate-700">
            Arquivo <span className="text-red-500">*</span>
          </label>

          {!file ? (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
              }}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                dragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 bg-white hover:border-indigo-400'
              }`}
            >
              <UploadCloud size={36} className="text-indigo-500" />
              <p className="text-sm font-medium text-slate-600">
                Arraste e solte o arquivo aqui ou clique para escolher
              </p>
              <p className="text-xs text-slate-400">Formatos aceitos: PDF, OFX, XML, XLSX, CSV, TXT</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-2xl">
              <Paperclip size={18} className="text-indigo-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Remover arquivo"
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <input
            id="recebimento-arquivo"
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.ofx,.xml,.xlsx,.csv,.txt"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="recebimento-tipo" className="block text-sm font-semibold mb-1.5 text-slate-700">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              id="recebimento-tipo"
              className={inputClass}
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="">Selecione...</option>
              {TIPOS_DOCUMENTO.map((t) => (
                <option key={t.nome} value={t.nome}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="recebimento-competencia" className="block text-sm font-semibold mb-1.5 text-slate-700">
              Competência <span className="text-red-500">*</span>
            </label>
            <select
              id="recebimento-competencia"
              className={inputClass}
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
            >
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
        </div>

        <PrazoFields
          idPrefix="recebimento"
          vencimento={vencimento}
          onVencimentoChange={setVencimento}
          diasAntecedencia={diasAntecedencia}
          onDiasAntecedenciaChange={setDiasAntecedencia}
        />

        <fieldset>
          <legend className="block text-sm font-semibold mb-2 text-slate-700">Canal de origem</legend>
          <div className="flex flex-wrap gap-4">
            {CANAIS_ORIGEM_RECEBIMENTO.map((opcao) => (
              <label
                key={opcao}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer text-sm font-medium text-slate-700 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/50 transition-colors"
              >
                <input
                  type="radio"
                  name="canal-origem"
                  value={opcao}
                  checked={canal === opcao}
                  onChange={(e) => setCanal(e.target.value)}
                  className="accent-indigo-500"
                />
                {opcao}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="recebimento-observacao" className="block text-sm font-semibold mb-1.5 text-slate-700">
            Observação <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <textarea
            id="recebimento-observacao"
            rows={3}
            className={inputClass}
            placeholder="Ex.: cliente enviou pelo WhatsApp"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
        </div>

        {error && (
          <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl" role="alert">
            <FileText size={18} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default ReceiveDocumentModal;
