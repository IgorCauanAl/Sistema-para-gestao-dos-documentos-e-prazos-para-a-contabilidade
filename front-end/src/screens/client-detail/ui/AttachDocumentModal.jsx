import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Paperclip, UploadCloud, X, FileText, Lock } from 'lucide-react';
import Modal from '../../../core/components/ui/Modal';
import PrazoFields from '../../../core/components/ui/PrazoFields';
import ClientSelect from '../../documents/ui/ClientSelect';
import { inMemoryDocumentRepository } from '../adapters/inMemoryDocumentRepository';
import {
  CANAIS_ENVIO,
  FORMATOS_ACEITOS,
  MESES,
  ANOS,
  TIPOS_DOCUMENTO,
  ANTECEDENCIA_PADRAO,
  extensaoDe,
} from '../../../core/domain/document';
import { paraBR } from '../../../core/domain/data';

const inputClass =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700';

const formatSize = (bytes) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const AttachDocumentModal = ({ open, onClose, client, clientes, prefill, onSubmit }) => {
  const inputRef = useRef(null);

  const comSelecaoDeCliente = Array.isArray(clientes);
  const [clienteId, setClienteId] = useState(null);
  const clienteAtual = comSelecaoDeCliente ? clientes.find((c) => c.id === clienteId) ?? null : client;

  const [file, setFile] = useState(null);
  const [tipo, setTipo] = useState('');
  const [competencia, setCompetencia] = useState('10/2026');
  const [vencimento, setVencimento] = useState('');
  const [diasAntecedencia, setDiasAntecedencia] = useState(ANTECEDENCIA_PADRAO);
  const [canal, setCanal] = useState('WhatsApp');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [nextVersion, setNextVersion] = useState(null);

  useEffect(() => {
    if (!open) return;

    setFile(null);
    setError('');
    setDragging(false);
    setTipo(prefill?.tipo ?? '');
    setCompetencia(prefill?.competencia ?? '10/2026');
    setVencimento('');
    setDiasAntecedencia(ANTECEDENCIA_PADRAO);
    setCanal((comSelecaoDeCliente ? null : client?.canalPreferido) ?? 'WhatsApp');
    setClienteId(comSelecaoDeCliente ? null : client?.id ?? null);
    setNextVersion(null);
  }, [open, prefill, client]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open || !clienteAtual || !tipo || !competencia) {
      setNextVersion(null);
      return;
    }

    inMemoryDocumentRepository
      .findByTipoCompetencia(clienteAtual.id, tipo, competencia)
      .then((existente) => setNextVersion(existente ? existente.versao + 1 : null));
  }, [open, clienteAtual, tipo, competencia]);

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

  const handleSubmit = (enviarAgora) => (e) => {
    e.preventDefault();

    if (comSelecaoDeCliente && !clienteAtual) {
      setError('Selecione o cliente para anexar o document.');
      return;
    }

    if (!file) {
      setError('Selecione um arquivo para anexar.');
      return;
    }

    onSubmit({
      clienteId: clienteAtual.id,
      tipo,
      competencia,
      canal,
      vencimento: vencimento ? paraBR(vencimento) : null,
      diasAntecedencia,
      formato: extensaoDe(file.name),
      tamanho: formatSize(file.size),
      enviarAgora,
    });
  };

  if (!clienteAtual) {
    if (!comSelecaoDeCliente && !client) return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Anexar document"
      footer={
        <div className="px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleSubmit(false)}
            className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
          >
            Salvar como rascunho
          </button>
          <button
            type="button"
            onClick={handleSubmit(true)}
            className="px-6 py-2.5 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors text-sm flex items-center gap-2"
          >
            Salvar e enviar
          </button>
        </div>
      }
    >
      <form id="attach-document-form" onSubmit={(e) => e.preventDefault()} className="p-6 space-y-5 bg-slate-50/50">
        {comSelecaoDeCliente ? (
          <div>
            <p className="block text-sm font-semibold mb-1.5 text-slate-700">
              Cliente <span className="text-red-500">*</span>
            </p>
            <ClientSelect
              id="anexo-cliente"
              clientes={clientes}
              value={clienteId}
              onChange={(c) => setClienteId(c?.id ?? null)}
              placeholder="Busque pelo nome do cliente..."
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl">
            <Lock size={16} className="text-slate-400 shrink-0" />
            <span className="text-sm text-slate-500">
              Destinatário:{' '}
              <strong className="text-slate-700">{client?.razaoSocial}</strong> — CNPJ {client?.cnpj}
            </span>
          </div>
        )}

        <div>
          <label htmlFor="arquivo-anexo" className="block text-sm font-semibold mb-1.5 text-slate-700">
            Arquivo
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
              <p className="text-sm font-medium text-slate-600">Arraste e solte o arquivo aqui ou clique para escolher</p>
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
            id="arquivo-anexo"
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.ofx,.xml,.xlsx,.csv,.txt"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="tipo-document" className="block text-sm font-semibold mb-1.5 text-slate-700">
              Tipo do document
            </label>
            <select
              id="tipo-document"
              required
              className={inputClass}
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="">Selecione...</option>
              {TIPOS_DOCUMENTO.filter((t) => t.nome !== 'Guia DAS').map((t) => (
                <option key={t.nome} value={t.nome}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="competencia-anexo" className="block text-sm font-semibold mb-1.5 text-slate-700">
              Competência
            </label>
            <select
              id="competencia-anexo"
              required
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
          idPrefix="anexo"
          vencimento={vencimento}
          onVencimentoChange={setVencimento}
          diasAntecedencia={diasAntecedencia}
          onDiasAntecedenciaChange={setDiasAntecedencia}
        />

        <fieldset>
          <legend className="block text-sm font-semibold mb-2 text-slate-700">Canal de envio</legend>
          <div className="flex gap-4">
            {CANAIS_ENVIO.map((opcao) => (
              <label
                key={opcao}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer text-sm font-medium text-slate-700 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/50 transition-colors"
              >
                <input
                  type="radio"
                  name="canal"
                  value={opcao}
                  checked={canal === opcao}
                  onChange={(e) => setCanal(e.target.value)}
                  className="accent-indigo-500"
                />
                {opcao}
                {clienteAtual?.canalPreferido === opcao && (
                  <span className="text-xs text-indigo-500">(preferido)</span>
                )}
              </label>
            ))}
          </div>
        </fieldset>

        {nextVersion && (
          <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-amber-800">
              Já existe este document nesta competência. Será criada a versão v{nextVersion} e a anterior ficará no
              histórico de versões.
            </p>
          </div>
        )}

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

export default AttachDocumentModal;
