import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { inMemoryClientRepository } from '../clients/adapters/inMemoryClientRepository';
import { inMemorySolicitacaoRepository } from '../solicitacoes/adapters/inMemorySolicitacaoRepository';
import { inMemoryDocumentRepository } from './adapters/inMemoryDocumentRepository';
import { useToast } from '../../core/components/ToastProvider';
import ClientFormModal from '../clients/ui/ClientFormModal';
import ClientProfileHeader from './ui/ClientProfileHeader';
import DetailTabs from './ui/DetailTabs';
import DocumentFilters from './ui/DocumentFilters';
import DocumentTable from './ui/DocumentTable';
import EmptyState from '../../core/components/ui/EmptyState';
import AttachDocumentModal from './ui/AttachDocumentModal';
import DocumentViewer from './ui/DocumentViewer';
import SolicitacaoFilters from '../solicitacoes/ui/SolicitacaoFilters';
import SolicitacaoTable from '../solicitacoes/ui/SolicitacaoTable';
import NovaSolicitacaoModal from '../solicitacoes/ui/NovaSolicitacaoModal';
import ConfirmDialog from '../solicitacoes/ui/ConfirmDialog';
import { calcularStatusSolicitacao } from '../../core/domain/solicitacao';

const emptyFilters = { competencia: '', tipo: '', status: '' };
const emptySolFilters = { clienteId: '', status: '', competencia: '' };

const ClientDetailPage = () => {
  const { clienteId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Documentos');
  const [docs, setDocs] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);

  const [attachOpen, setAttachOpen] = useState(false);
  const [attachPrefill, setAttachPrefill] = useState(null);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewedDoc, setViewedDoc] = useState(null);
  const [versions, setVersions] = useState([]);

  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [solFilters, setSolFilters] = useState(emptySolFilters);
  const [novaSolOpen, setNovaSolOpen] = useState(false);
  const [solCancelTarget, setSolCancelTarget] = useState(null);

  const refreshClient = useCallback(async () => {
    const found = await inMemoryClientRepository.getById(clienteId);
    setClient(found);
    if (found) {
      const { id, ...data } = found;
      setFormData(data);
    }
    setLoading(false);
  }, [clienteId]);

  const refreshDocs = useCallback(async () => {
    setDocs(await inMemoryDocumentRepository.listByClient(clienteId));
  }, [clienteId]);

  const refreshViewed = useCallback(async (docId) => {
    const doc = await inMemoryDocumentRepository.getById(docId);
    if (doc) {
      setViewedDoc(doc);
      setVersions(await inMemoryDocumentRepository.listVersions(doc));
    }
  }, []);

  const refreshSolicitacoes = useCallback(async () => {
    setSolicitacoes(await inMemorySolicitacaoRepository.list());
  }, []);

  useEffect(() => {
    refreshClient();
    refreshDocs();
    refreshSolicitacoes();
  }, [refreshClient, refreshDocs, refreshSolicitacoes]);

  const handleNovaSolicitacao = async (payload) => {
    const created = await inMemorySolicitacaoRepository.create(payload);
    setNovaSolOpen(false);
    await refreshSolicitacoes();
    if (payload.enviarAgora) {
      navigate(`/solicitacoes/${created.id}`);
      showToast('Solicitação criada. Compartilhe o link de envio com o cliente.');
    } else {
      showToast('Solicitação salva como rascunho.');
    }
  };

  const handleSolCancel = async () => {
    await inMemorySolicitacaoRepository.cancelar(solCancelTarget.id);
    setSolCancelTarget(null);
    await refreshSolicitacoes();
    showToast('Solicitação cancelada.');
  };

  const openViewer = async (doc) => {
    await refreshViewed(doc.id);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setViewedDoc(null);
    setVersions([]);
  };

  const handleSend = async (doc) => {
    const updated = await inMemoryDocumentRepository.markEnviado(doc.id);
    await refreshDocs();
    if (viewerOpen && viewedDoc) await refreshViewed(viewedDoc.id);
    showToast(`Documento enviado por ${updated?.canal ?? 'WhatsApp'} ao cliente.`);
  };

  const handleAttach = async (payload) => {
    const created = await inMemoryDocumentRepository.create(payload);
    setAttachOpen(false);
    setAttachPrefill(null);
    await refreshDocs();
    showToast(
      payload.enviarAgora
        ? `Documento enviado por ${payload.canal} ao cliente.`
        : 'Documento salvo como rascunho.'
    );
    return created;
  };

  const openAttach = (prefill = null) => {
    setAttachPrefill(prefill);
    setAttachOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await inMemoryClientRepository.update(clienteId, formData);
    await refreshClient();
    setEditOpen(false);
    showToast('Cliente atualizado com sucesso.');
  };

  const filteredDocs = docs.filter((doc) => {
    if (filters.competencia && doc.competencia !== filters.competencia) return false;
    if (filters.tipo && doc.area !== filters.tipo) return false;
    if (filters.status && doc.status !== filters.status) return false;
    return true;
  });

  if (loading) return null;
  if (!client) return <Navigate to="/clientes" replace />;

  const hasAnyDoc = docs.length > 0;

  const clientSols = solicitacoes.filter((sol) => String(sol.clienteId) === String(client.id));
  const filteredSols = clientSols.filter((sol) => {
    if (solFilters.status && calcularStatusSolicitacao(sol) !== solFilters.status) return false;
    if (solFilters.competencia && sol.competencia !== solFilters.competencia) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <ClientProfileHeader
        client={client}
        onEdit={() => setEditOpen(true)}
        onAttach={() => openAttach()}
      />

      <DetailTabs activeTab={tab} onChange={setTab} />

      {tab === 'Documentos' && (
        <div className="space-y-6">
          <DocumentFilters filters={filters} onChange={setFilters} />

          {filteredDocs.length > 0 ? (
            <DocumentTable documents={filteredDocs} onView={openViewer} onSend={handleSend} />
          ) : hasAnyDoc ? (
            <EmptyState
              title="Nenhum document encontrado"
              subtitle="Ajuste os filtros para encontrar o document desejado."
            />
          ) : (
            <EmptyState
              title="Nenhum document anexado para este cliente"
              subtitle="Clique em “+ Anexar document” para enviar o primeiro arquivo."
            />
          )}
        </div>
      )}

      {tab === 'Solicitações' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {clientSols.length === 0
                ? 'Nenhuma solicitação para este cliente.'
                : `${clientSols.length} solicitação(ões) para este cliente.`}
            </p>
            <button
              type="button"
              onClick={() => setNovaSolOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors"
            >
              + Nova solicitação
            </button>
          </div>

          {clientSols.length > 0 && (
            <SolicitacaoFilters
              filters={solFilters}
              onChange={setSolFilters}
              clientes={[]}
              showCliente={false}
            />
          )}

          {clientSols.length === 0 ? (
            <EmptyState
              title="Nenhuma solicitação criada"
              subtitle="Clique em “+ Nova solicitação” para pedir documentos ao cliente."
            />
          ) : filteredSols.length === 0 ? (
            <EmptyState
              title="Nenhuma solicitação encontrada"
              subtitle="Ajuste os filtros para encontrar a solicitação desejada."
            />
          ) : (
            <SolicitacaoTable
              solicitacoes={filteredSols}
              nomeCliente={() => client.razaoSocial}
              showCliente={false}
              onOpen={(sol) => navigate(`/solicitacoes/${sol.id}`)}
              onResend={(sol) => navigate(`/solicitacoes/${sol.id}`)}
              onCancel={(sol) => setSolCancelTarget(sol)}
            />
          )}
        </div>
      )}

      {tab !== 'Documentos' && tab !== 'Solicitações' && (
        <EmptyState
          title={`${tab} — em breve`}
          subtitle="Este módulo estará disponível em breve."
        />
      )}

      <NovaSolicitacaoModal
        open={novaSolOpen}
        onClose={() => setNovaSolOpen(false)}
        clientes={[client]}
        clienteInicial={client}
        onSubmit={handleNovaSolicitacao}
      />

      <ConfirmDialog
        open={Boolean(solCancelTarget)}
        onClose={() => setSolCancelTarget(null)}
        onConfirm={handleSolCancel}
        title="Cancelar solicitação"
        message={`A solicitação "${solCancelTarget?.titulo ?? ''}" será cancelada e o link deixará de funcionar para o cliente. Esta ação não pode ser desfeita.`}
        confirmLabel="Cancelar solicitação"
      />

      <AttachDocumentModal
        open={attachOpen}
        onClose={() => {
          setAttachOpen(false);
          setAttachPrefill(null);
        }}
        client={client}
        prefill={attachPrefill}
        onSubmit={handleAttach}
      />

      <DocumentViewer
        open={viewerOpen}
        document={viewedDoc}
        versions={versions}
        onSelectVersion={(version) => refreshViewed(version.id)}
        onClose={closeViewer}
        onResend={() => handleSend(viewedDoc)}
        onNewVersion={() => {
          const prefill = { tipo: viewedDoc.tipo, competencia: viewedDoc.competencia };
          closeViewer();
          openAttach(prefill);
        }}
        onDownload={async () => {
          await inMemoryDocumentRepository.markBaixado(viewedDoc.id);
          await refreshDocs();
          await refreshViewed(viewedDoc.id);
          showToast('Download simulado concluído.');
        }}
        onReceipt={() => showToast('Recurso visual: comprovante em breve.', 'info')}
      />

      <ClientFormModal
        open={editOpen}
        title="Editar Cliente"
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
        formData={formData}
        onInputChange={(e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
      />
    </div>
  );
};

export default ClientDetailPage;
