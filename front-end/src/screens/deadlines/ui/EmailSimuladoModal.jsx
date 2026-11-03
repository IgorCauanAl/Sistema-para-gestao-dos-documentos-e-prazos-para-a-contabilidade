import React from 'react';
import { Mail, AlertTriangle, CalendarClock, Hourglass } from 'lucide-react';
import Modal from '../../../core/components/ui/Modal';
import { StatusPrazo, estaAtrasado, diasRestantes } from '../../../core/domain/prazo';
import { formatarData } from '../../../core/domain/data';

const Secao = ({ titulo, icon: Icon, tone, itens, nomeCliente }) => (
  <div>
    <p className={`text-sm font-semibold flex items-center gap-2 ${tone}`}>
      <Icon size={15} /> {titulo} ({itens.length})
    </p>
    {itens.length === 0 ? (
      <p className="text-xs text-slate-400 mt-1 ml-6">Nenhum item.</p>
    ) : (
      <ul className="mt-1.5 ml-6 space-y-1">
        {itens.map((prazo) => (
          <li key={prazo.id} className="text-sm text-slate-600">
            <span className="font-medium text-slate-700">{prazo.obrigacao}</span> · {prazo.competencia} —{' '}
            {nomeCliente(prazo.clienteId)} (vence {prazo.vencimentoAtual})
          </li>
        ))}
      </ul>
    )}
  </div>
);

const EmailSimuladoModal = ({ open, onClose, prazos, nomeCliente, hoje, onSend }) => {
  const abertos = (prazos ?? []).filter((prazo) => prazo.status !== StatusPrazo.ENTREGUE);
  const atrasados = abertos.filter((prazo) => estaAtrasado(prazo, hoje));
  const proximos = abertos.filter((prazo) => {
    const dias = diasRestantes(prazo, hoje);
    return dias !== null && dias >= 0 && dias <= 7;
  });
  const aguardando = abertos.filter((prazo) => prazo.status === StatusPrazo.AGUARDANDO_CLIENTE);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Prévia do resumo diário"
      maxWidth="max-w-2xl"
      footer={
        <div className="px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={onSend}
            className="px-6 py-2.5 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors text-sm flex items-center gap-2"
          >
            <Mail size={16} /> Enviar resumo
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-5 bg-slate-50/50">
        <div className="rounded-3xl border border-slate-200/70 bg-white p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3 space-y-1">
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-slate-500">De:</span> resumo@contadash.app
            </p>
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-slate-500">Para:</span> equipes@contadash.app
            </p>
            <p className="text-sm font-semibold text-slate-700">
              Resumo de prazos — {formatarData(hoje)}
            </p>
          </div>

          <p className="text-sm text-slate-600">
            Bom dia! Segue o panorama de obrigações do escritório para hoje:
          </p>

          <Secao
            titulo="Atrasados"
            icon={AlertTriangle}
            tone="text-red-600"
            itens={atrasados}
            nomeCliente={nomeCliente}
          />
          <Secao
            titulo="Vencem nos próximos 7 dias"
            icon={CalendarClock}
            tone="text-amber-600"
            itens={proximos}
            nomeCliente={nomeCliente}
          />
          <Secao
            titulo="Aguardando o cliente"
            icon={Hourglass}
            tone="text-indigo-600"
            itens={aguardando}
            nomeCliente={nomeCliente}
          />

          <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
            Este é um envio simulado — nenhum e-mail é disparado de verdade nesta demonstração.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default EmailSimuladoModal;
