import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bell, Settings, Globe } from 'lucide-react';
import { useToast } from './ToastProvider';
import AlertaPanel from '../../screens/deadlines/ui/AlertaPanel';
import EmailSimuladoModal from '../../screens/deadlines/ui/EmailSimuladoModal';
import { inMemoryPrazoRepository } from '../../screens/deadlines/adapters/inMemoryPrazoRepository';
import { inMemoryClientRepository } from '../../screens/clients/adapters/inMemoryClientRepository';
import { HOJE } from '../domain/prazo';

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const showToast = useToast();

  const [alertas, setAlertas] = useState({ atrasados: [], semana: [], janela: [], total: 0 });
  const [prazos, setPrazos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const refresh = useCallback(async () => {
    const [lista, listaClientes, listaPrazos] = await Promise.all([
      inMemoryPrazoRepository.getAlertas(HOJE),
      inMemoryClientRepository.list(),
      inMemoryPrazoRepository.list(),
    ]);
    setAlertas(lista);
    setClientes(listaClientes);
    setPrazos(listaPrazos);
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('prazos-atualizados', handler);
    return () => window.removeEventListener('prazos-atualizados', handler);
  }, [refresh]);

  useEffect(() => {
    setPanelOpen(false);
  }, [pathname]);

  const nomeCliente = useMemo(
    () => (clienteId) => clientes.find((cliente) => cliente.id === clienteId)?.razaoSocial ?? '—',
    [clientes]
  );

  const abrirPrazo = (prazo) => {
    setPanelOpen(false);
    navigate(`/prazos?prazo=${prazo.id}`);
  };

  const enviarResumo = () => {
    setEmailOpen(false);
    showToast('Resumo diário enviado (simulado).');
  };

  return (
    <>
      <aside className="w-20 bg-white border-r border-slate-200/50 flex flex-col items-center py-6 h-screen sticky top-0 hidden md:flex shrink-0">
        <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-500 mb-8 cursor-pointer">
          <LayoutDashboard size={20} />
        </div>
        <nav className="flex flex-col gap-6 text-slate-400">
          <button
            type="button"
            aria-label="Alertas de prazos"
            aria-expanded={panelOpen}
            onClick={() => setPanelOpen((prev) => !prev)}
            className="p-3 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-colors relative"
          >
            <Bell size={22} />
            {alertas.total > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 bg-orange-500 text-white text-[11px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                {alertas.total}
              </span>
            )}
          </button>
          <button className="p-3 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-colors">
            <Settings size={22} />
          </button>
          <button className="p-3 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-colors">
            <Globe size={22} />
          </button>
        </nav>
      </aside>

      <AlertaPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        alertas={alertas}
        nomeCliente={nomeCliente}
        onSelect={abrirPrazo}
        onSimularEmail={() => {
          setPanelOpen(false);
          setEmailOpen(true);
        }}
        hoje={HOJE}
      />

      <EmailSimuladoModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        prazos={prazos}
        nomeCliente={nomeCliente}
        hoje={HOJE}
        onSend={enviarResumo}
      />
    </>
  );
};

export default Sidebar;
