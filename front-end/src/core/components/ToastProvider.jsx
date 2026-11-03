import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const typeStyles = {
  success: { icon: CheckCircle2, className: 'text-green-600' },
  info: { icon: Info, className: 'text-indigo-500' },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id) => setToasts((prev) => prev.filter((toast) => toast.id !== id));

  return (
    <ToastContext.Provider value={showToast}>
      {children}

      <div className="fixed top-6 right-6 z-[60] flex flex-col gap-3" role="status" aria-live="polite">
        {toasts.map((toast) => {
          const { icon: Icon, className } = typeStyles[toast.type] ?? typeStyles.success;

          return (
            <div
              key={toast.id}
              className="bg-white border border-slate-200 shadow-lg rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[260px] animate-in fade-in slide-in-from-right duration-300"
            >
              <Icon size={20} className={className} />
              <span className="text-sm font-medium text-slate-700 flex-1">{toast.message}</span>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Fechar notificação"
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return ctx;
};
