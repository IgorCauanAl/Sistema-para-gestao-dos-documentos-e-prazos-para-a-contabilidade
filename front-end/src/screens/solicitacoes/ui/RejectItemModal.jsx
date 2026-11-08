import React, { useEffect, useState } from 'react';
import Modal from '../../../core/components/ui/Modal';
import { MotivoRecusa, motivoRecusaLabel } from '../../../core/domain/solicitacao';

const inputClass =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700';

const mensagemPadrao = ({ cliente, item, solicitacao, motivo, detalhes }) =>
  `Olá, ${cliente?.responsavel ?? ''}! O item "${item?.nome ?? ''}" da solicitação "${solicitacao?.titulo ?? ''}" ` +
  `precisa ser reenviado. Motivo: ${motivo ? motivoRecusaLabel[motivo] : ''}${detalhes ? ` — ${detalhes}` : ''}. ` +
  `Reenvie somente este item pelo link: contadash.app/s/${solicitacao?.token ?? ''}`;

const RejectItemModal = ({ open, onClose, solicitacao, cliente, item, onConfirm }) => {
  const [motivo, setMotivo] = useState('');
  const [detalhes, setDetalhes] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !item) return;

    setMotivo('');
    setDetalhes('');
    setError('');
    setMensagem(mensagemPadrao({ cliente, item, solicitacao, motivo: '', detalhes: '' }));
  }, [open, item]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open || !item) return;
    setMensagem(mensagemPadrao({ cliente, item, solicitacao, motivo, detalhes }));
  }, [motivo, detalhes]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = () => {
    if (!motivo) {
      setError('Selecione o motivo da recusa.');
      return;
    }
    if (motivo === MotivoRecusa.OUTRO && !detalhes.trim()) {
      setError('Descreva os detalhes para o cliente quando o motivo for "Outro".');
      return;
    }

    setError('');
    onConfirm({ motivo, detalhes: detalhes.trim(), mensagem });
  };

  if (!item) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Recusar document"
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
            className="px-6 py-2.5 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-colors text-sm"
          >
            Recusar e enviar retorno
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-5 bg-slate-50/50">
        <p className="text-sm text-slate-500">
          Item: <strong className="text-slate-700">{item.nome}</strong>
        </p>

        <div>
          <label htmlFor="motivo-recusa" className="block text-sm font-semibold mb-1.5 text-slate-700">
            Motivo <span className="text-red-500">*</span>
          </label>
          <select
            id="motivo-recusa"
            className={inputClass}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          >
            <option value="">Selecione o motivo...</option>
            {Object.values(MotivoRecusa).map((m) => (
              <option key={m} value={m}>
                {motivoRecusaLabel[m]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="detalhes-recusa" className="block text-sm font-semibold mb-1.5 text-slate-700">
            Detalhes para o cliente{' '}
            {motivo === MotivoRecusa.OUTRO ? (
              <span className="text-red-500">*</span>
            ) : (
              <span className="font-normal text-slate-400">(opcional)</span>
            )}
          </label>
          <textarea
            id="detalhes-recusa"
            rows={3}
            className={inputClass}
            placeholder="Ex.: faltam as páginas 3 e 4"
            value={detalhes}
            onChange={(e) => setDetalhes(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="mensagem-retorno" className="block text-sm font-semibold mb-1.5 text-slate-700">
            Pré-visualização da mensagem de retorno <span className="font-normal text-slate-400">(editável)</span>
          </label>
          <textarea
            id="mensagem-retorno"
            rows={4}
            className={inputClass}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
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

export default RejectItemModal;
