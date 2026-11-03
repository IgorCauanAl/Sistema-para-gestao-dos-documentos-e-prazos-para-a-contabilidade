import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import Modal from '../../../core/components/ui/Modal';
import PrazoFields from '../../../core/components/ui/PrazoFields';
import { MESES, ANOS, ANTECEDENCIA_PADRAO } from '../../../core/domain/documento';
import { paraBR } from '../../../core/domain/data';

const inputClass =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700';

const ApproveItemModal = ({ open, onClose, solicitacao, item, onConfirm }) => {
  const [competencia, setCompetencia] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [diasAntecedencia, setDiasAntecedencia] = useState(ANTECEDENCIA_PADRAO);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !item) return;
    setCompetencia(solicitacao?.competencia ?? '');
    setVencimento('');
    setDiasAntecedencia(ANTECEDENCIA_PADRAO);
    setError('');
  }, [open, item, solicitacao]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = () => {
    if (!vencimento) {
      setError('Informe a data de vencimento do documento.');
      return;
    }
    setError('');
    onConfirm({ competencia, vencimento: paraBR(vencimento), diasAntecedencia });
  };

  if (!item) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Aceitar documento"
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
            className="px-6 py-2.5 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
          >
            <Check size={16} /> Aceitar e registrar
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-5 bg-slate-50/50">
        <p className="text-sm text-slate-500">
          Item: <strong className="text-slate-700">{item.nome}</strong>
        </p>

        <div>
          <label htmlFor="aprovar-competencia" className="block text-sm font-semibold mb-1.5 text-slate-700">
            Competência <span className="text-red-500">*</span>
          </label>
          <select
            id="aprovar-competencia"
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

        <PrazoFields
          idPrefix="aprovar"
          vencimento={vencimento}
          onVencimentoChange={setVencimento}
          diasAntecedencia={diasAntecedencia}
          onDiasAntecedenciaChange={setDiasAntecedencia}
          vencimentoObrigatorio
        />

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl" role="alert">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ApproveItemModal;
