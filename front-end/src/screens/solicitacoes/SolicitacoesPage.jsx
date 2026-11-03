import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Inbox, Send, CheckCircle2, ClipboardList } from 'lucide-react';
import SummaryCard from '../../core/components/ui/SummaryCard';
import EmptyState from '../../core/components/ui/EmptyState';
import { useToast } from '../../core/components/ToastProvider';
import { inMemoryClientRepository } from '../clients/adapters/inMemoryClientRepository';
import { inMemorySolicitacaoRepository } from './adapters/inMemorySolicitacaoRepository';
import SolicitacaoFilters from './ui/SolicitacaoFilters';
import SolicitacaoTable from './ui/SolicitacaoTable';
import NovaSolicitacaoModal from './ui/NovaSolicitacaoModal';
import LinkGeneratedModal from './ui/LinkGeneratedModal';
import ConfirmDialog from './ui/ConfirmDialog';
import { StatusSolicitacao, calcularStatusSolicitacao } from '../../core/domain/solicitacao';

const emptyFilters = { clienteId: '', status: '', competencia: '' };

const SolicitacoesPage = () => {
  const navigate = useNavigate();
  const showToast = useToast();

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);

  const [novaOpen, setNovaOpen] = useState(false);
  const [linkModal, setLinkModal] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const refresh = useCallback(async () => {
    setSolicitacoes(await inMemorySolicitacaoRepository.list());
    setClientes(await inMemoryClientRepository.list());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const nomeCliente = (clienteId) =>
    clientes.find((c) => c.id === clienteId)?.razaoSocial ?? '—';

  const filtered = solicitacoes.filter((sol) => {
    if (filters.clienteId && String(sol.clienteId) !== filters.clienteId) return false;
    if (filters.status && calcularStatusSolicitacao(sol) !== filters.status) return false;
    if (filters.competencia && sol.competencia !== filters.competencia) return false;
    return true;
  });

  const contagem = (status) =>
    solicitacoes.filter((sol) => calcularStatusSolicitacao(sol) === status).length;

  const handleCreate = async (payload) => {
    const created = await inMemorySolicitacaoRepository.create(payload);
    setNovaOpen(false);
    await refresh();

    if (payload.enviarAgora) {
      setLinkModal(created);
    } else {
      showToast('Solicitação salva como rascunho.');
    }
  };

  const handleCancel = async () => {
    await inMemorySolicitacaoRepository.cancelar(cancelTarget.id);
    setCancelTarget(null);
    await refresh();
    showToast('Solicitação cancelada.');
  };

  const total = solicitacoes.length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Solicitações</h1>
          <p className="text-sm text-slate-500 mt-1">
            Pedidos de documentos enviados aos clientes e seus links de envio.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNovaOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors"
        >
          <Plus size={16} /> Nova solicitação
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Total de solicitações" value={total} icon={ClipboardList} />
        <SummaryCard title="Abertas" value={contagem(StatusSolicitacao.ABERTA)} icon={Inbox} />
        <SummaryCard title="Em conferência" value={contagem(StatusSolicitacao.EM_CONFERENCIA)} icon={Send} colorTheme="warning" />
        <SummaryCard title="Concluídas" value={contagem(StatusSolicitacao.CONCLUIDA)} icon={CheckCircle2} colorTheme="success" />
      </div>

      {total > 0 && <SolicitacaoFilters filters={filters} onChange={setFilters} clientes={clientes} />}

      {total === 0 ? (
        <EmptyState
          title="Nenhuma solicitação criada"
          subtitle="Clique em “+ Nova solicitação” para pedir os primeiros documentos a um cliente."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma solicitação encontrada"
          subtitle="Ajuste os filtros para encontrar a solicitação desejada."
        />
      ) : (
        <SolicitacaoTable
          solicitacoes={filtered}
          nomeCliente={nomeCliente}
          onOpen={(sol) => navigate(`/solicitacoes/${sol.id}`)}
          onResend={(sol) => setLinkModal(sol)}
          onCancel={(sol) => setCancelTarget(sol)}
        />
      )}

      <NovaSolicitacaoModal
        open={novaOpen}
        onClose={() => setNovaOpen(false)}
        clientes={clientes}
        clienteInicial={null}
        onSubmit={handleCreate}
      />

      <LinkGeneratedModal
        open={Boolean(linkModal)}
        onClose={() => setLinkModal(null)}
        solicitacao={linkModal}
        cliente={linkModal ? clientes.find((c) => c.id === linkModal.clienteId) : null}
        onToast={showToast}
      />

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancelar solicitação"
        message={`A solicitação "${cancelTarget?.titulo ?? ''}" será cancelada e o link deixará de funcionar para o cliente. Esta ação não pode ser desfeita.`}
        confirmLabel="Cancelar solicitação"
      />
    </div>
  );
};

export default SolicitacoesPage;
