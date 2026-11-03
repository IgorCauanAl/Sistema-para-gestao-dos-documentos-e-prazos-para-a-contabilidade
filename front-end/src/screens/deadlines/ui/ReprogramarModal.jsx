import React, { useEffect, useState } from 'react';
import { CalendarClock, AlertTriangle } from 'lucide-react';
import Modal from '../../../core/components/ui/Modal';
import {
  MOTIVOS_REPROGRAMACAO_OPCOES,
  motivoReprogramacaoLabel,
  MotivoReprogramacao,
  ehDiaUtil,
} from '../../../core/domain/prazo';
import { paraBR, paraData } from '../../../core/domain/data';

const inputClass =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700';

const ReprogramarModal = ({ open, onClose, prazo, onConfirm }) => {
  const [novaData, setNovaData] = useState('');
  const [motivo, setMotivo] = useState(MotivoReprogramacao.RECALCULO_GUIA);
  const [observacao, setObservacao] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setNovaData('');
    setMotivo(MotivoReprogramacao.RECALCULO_GUIA);
    setObservacao('');
    setError('');
  }, [open]);

  if (!prazo) return null;

  const diaUtil = novaData ? ehDiaUtil(paraData(paraBR(novaData))) : true;

  const handleSubmit = () => {
    if (!novaData) {
      setError('Informe a nova data de vencimento.');
      return;
    }
    if (!diaUtil) {
      setError('Selecione um dia útil para o vencimento.');
      return;
    }
    setError('');
    onConfirm({ novaData: paraBR(novaData), motivo, observacao: observacao.trim() });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reprogramar vencimento"
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
            className="px-6 py-2.5 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors text-sm flex items-center gap-2"
          >
            <CalendarClock size={16} /> Reprogramar
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-5 bg-slate-50/50">
        <p className="text-sm text-slate-500">
          {prazo.obrigacao} · {prazo.competencia}. Vencimento atual:{' '}
          <strong className="text-slate-700">{prazo.vencimentoAtual}</strong>.
        </p>

        <div>
          <label htmlFor="reprogramar-data" className="block text-sm font-semibold mb-1.5 text-slate-700">
            Nova data de vencimento <span className="text-red-500">*</span>
          </label>
          <input
            id="reprogramar-data"
            type="date"
            className={inputClass}
            value={novaData}
            onChange={(e) => setNovaData(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-slate-400">
            O vencimento original ({prazo.vencimentoOriginal}) é mantido no histórico.
          </p>
        </div>

        {novaData && !diaUtil && (
          <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-amber-800">
              A data escolhida cai em fim de semana ou feriado.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="reprogramar-motivo" className="block text-sm font-semibold mb-1.5 text-slate-700">
            Motivo
          </label>
          <select
            id="reprogramar-motivo"
            className={inputClass}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          >
            {MOTIVOS_REPROGRAMACAO_OPCOES.map((opcao) => (
              <option key={opcao} value={opcao}>
                {motivoReprogramacaoLabel[opcao]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="reprogramar-observacao" className="block text-sm font-semibold mb-1.5 text-slate-700">
            Observação <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <textarea
            id="reprogramar-observacao"
            rows={3}
            className={inputClass}
            placeholder="Ex.: guia reemitida após correção da base de cálculo"
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

export default ReprogramarModal;
