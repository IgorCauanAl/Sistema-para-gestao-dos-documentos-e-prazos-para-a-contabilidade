import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const Modal = ({ open, onClose, title, children, footer, maxWidth = 'max-w-2xl' }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    panelRef.current?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`bg-white rounded-3xl shadow-xl w-full ${maxWidth} overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200`}
      >
        {title && (
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="overflow-y-auto">{children}</div>

        {footer && <div className="border-t border-slate-100 bg-white">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
