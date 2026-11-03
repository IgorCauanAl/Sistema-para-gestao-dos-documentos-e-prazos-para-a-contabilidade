import React, { useEffect, useState } from 'react';
import { Copy, Check, MessageCircle, Mail } from 'lucide-react';
import Modal from '../../../core/components/ui/Modal';

const LinkGeneratedModal = ({ open, onClose, solicitacao, cliente, onToast }) => {
  const [mensagem, setMensagem] = useState('');
  const [copiado, setCopiado] = useState(false);

  const link = solicitacao ? `contadash.app/s/${solicitacao.token}` : '';

  useEffect(() => {
    if (!open || !solicitacao || !cliente) return;

    setMensagem(
      `Olá, ${cliente.responsavel?.split(' ')[0] ?? cliente.responsavel}! Aqui é o escritório contábil. ` +
        `Precisamos dos documentos: "${solicitacao.titulo}" (competência ${solicitacao.competencia}). ` +
        `Prazo para envio: ${solicitacao.prazo}. ` +
        `Acesse o link seguro: ${link}`
    );
    setCopiado(false);
  }, [open, solicitacao, cliente, link]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(`https://${link}`);
      setCopiado(true);
      onToast?.('Link copiado para a área de transferência.');
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      onToast?.('Não foi possível copiar o link.', 'info');
    }
  };

  if (!solicitacao) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Link gerado"
      footer={
        <div className="px-6 py-4 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => onToast?.('Envio por e-mail simulado.', 'info')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
          >
            <Mail size={16} /> Enviar por e-mail
          </button>
          <button
            type="button"
            onClick={() => onToast?.('WhatsApp aberto (simulado).', 'info')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <MessageCircle size={16} /> Abrir WhatsApp
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-5 bg-slate-50/50">
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Link da solicitação</p>
          <div className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl">
            <span className="text-sm font-mono text-indigo-600 break-all flex-1">{link}</span>
            <button
              type="button"
              onClick={copiar}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition-colors shrink-0"
            >
              {copiado ? <Check size={14} /> : <Copy size={14} />}
              {copiado ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="mensagem-whatsapp" className="block text-sm font-semibold mb-1.5 text-slate-700">
            Mensagem pronta para envio <span className="font-normal text-slate-400">(editável)</span>
          </label>
          <textarea
            id="mensagem-whatsapp"
            rows={5}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
          />
        </div>
      </div>
    </Modal>
  );
};

export default LinkGeneratedModal;
