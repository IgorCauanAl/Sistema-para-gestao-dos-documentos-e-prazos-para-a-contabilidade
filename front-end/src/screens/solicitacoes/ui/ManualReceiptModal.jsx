import React, { useEffect, useState } from 'react';
import { Paperclip, X } from 'lucide-react';
import Modal from '../../../core/components/ui/Modal';
import PrazoFields from '../../../core/components/ui/PrazoFields';
import { ANTECEDENCIA_PADRAO } from '../../../core/domain/documento';
import { paraBR } from '../../../core/domain/data';

const inputClass =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700';

const formatSize = (bytes) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const ManualReceiptModal = ({ open, onClose, item, onConfirm }) => {
  const [file, setFile] = useState(null);
  const [canalOrigem, setCanalOrigem] = useState('WhatsApp');
  const [vencimento, setVencimento] = useState('');
  const [diasAntecedencia, setDiasAntecedencia] = useState(ANTECEDENCIA_PADRAO);
  const [observacao, setObservacao] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setCanalOrigem('WhatsApp');
    setVencimento('');
    setDiasAntecedencia(ANTECEDENCIA_PADRAO);
    setObservacao('');
    setError('');
  }, [open]);

  const handleSubmit = () => {
    if (!file) {
      setError('Selecione o arquivo recebido.');
      return;
    }

    onConfirm({
      arquivo: { nome: file.name, tamanho: formatSize(file.size) },
      canalOrigem,
      vencimento: vencimento ? paraBR(vencimento) : null,
      diasAntecedencia,
      observacao: observacao.trim(),
    });
  };

  if (!item) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar recebimento manual"
      maxWidth="max-w-lg"
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
            Salvar registro
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-5 bg-slate-50/50">
        <p className="text-sm text-slate-500">
          Item: <strong className="text-slate-700">{item.nome}</strong>
        </p>

        <div>
          <label htmlFor="manual-arquivo" className="block text-sm font-semibold mb-1.5 text-slate-700">
            Arquivo recebido <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              id="manual-arquivo"
              type="file"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setError('');
              }}
              className="block w-full text-sm text-slate-500 file:mr-3 file:px-4 file:py-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
            />
            {file && (
              <button
                type="button"
                aria-label="Remover arquivo"
                onClick={() => setFile(null)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {file && (
            <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
              <Paperclip size={14} /> {file.name} · {formatSize(file.size)}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="manual-canal" className="block text-sm font-semibold mb-1.5 text-slate-700">
            Canal de origem
          </label>
          <select id="manual-canal" className={inputClass} value={canalOrigem} onChange={(e) => setCanalOrigem(e.target.value)}>
            <option value="WhatsApp">WhatsApp</option>
            <option value="E-mail">E-mail</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <PrazoFields
          idPrefix="manual"
          vencimento={vencimento}
          onVencimentoChange={setVencimento}
          diasAntecedencia={diasAntecedencia}
          onDiasAntecedenciaChange={setDiasAntecedencia}
        />

        <div>
          <label htmlFor="manual-observacao" className="block text-sm font-semibold mb-1.5 text-slate-700">
            Observação <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <textarea
            id="manual-observacao"
            rows={3}
            className={inputClass}
            placeholder="Ex.: cliente enviou pelo WhatsApp"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl" role="alert">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ManualReceiptModal;
