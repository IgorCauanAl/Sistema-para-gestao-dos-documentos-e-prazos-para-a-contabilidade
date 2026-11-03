import React from 'react';
import Modal from '../../../core/components/ui/Modal';

const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', danger = true }) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    maxWidth="max-w-md"
    footer={
      <div className="px-6 py-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`px-6 py-2.5 rounded-full text-white font-medium transition-colors text-sm ${
            danger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-500 hover:bg-indigo-600'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    }
  >
    <div className="p-6 bg-slate-50/50">
      <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
    </div>
  </Modal>
);

export default ConfirmDialog;
