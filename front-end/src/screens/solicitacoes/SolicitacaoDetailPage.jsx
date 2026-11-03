import React, { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Check, RefreshCw, Send, XCircle, Info } from 'lucide-react';
import { useToast } from '../../core/components/ToastProvider';
import StatusBadge from '../../core/components/ui/StatusBadge';
import ProgressBar from '../../core/components/ui/ProgressBar';
import DocumentViewer from '../client-detail/ui/DocumentViewer';
import { inMemorySolicitacaoRepository } from './adapters/inMemorySolicitacaoRepository';
import { inMemoryClientRepository } from '../clients/adapters/inMemoryClientRepository';
import { inMemoryPrazoRepository } from '../deadlines/adapters/inMemoryPrazoRepository';
import SolicitacaoItemCard from './ui/SolicitacaoItemCard';
import RejectItemModal from './ui/RejectItemModal';
import ApproveItemModal from './ui/ApproveItemModal';
import ManualReceiptModal from './ui/ManualReceiptModal';
import LinkGeneratedModal from './ui/LinkGeneratedModal';
import ConfirmDialog from './ui/ConfirmDialog';
import {
  StatusSolicitacao,
  calcularStatusSolicitacao,
  progressoSolicitacao,
  solicitacaoStatusMeta,
} from '../../core/domain/solicitacao';

const fakeHash = 'a3f8c9e14b7d2056e8f9a1c3b5d7e2f4a6c8b0d2f4e6a8c1b3d5f7a9c0e2b4d6';

const SolicitacaoDetailPage = () => {
  const { solicitacaoId } = useParams();
  const showToast = useToast();

  const [sol, setSol] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  const [rejectItem, setRejectItem] = useState(null);
  const [approveItem, setApproveItem] = useState(null);
  const [manualItem, setManualItem] = useState(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const [viewerDoc, setViewerDoc] = useState(null);
  const [viewerVersions, setViewerVersions] = useState([]);

  const refresh = useCallback(async () => {
    const found = await inMemorySolicitacaoRepository.getById(solicitacaoId);
    setSol(found);
    setCliente(found ? await inMemoryClientRepository.getById(found.clienteId) : null);
    setLoading(false);
  }, [solicitacaoId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) return null;
  if (!sol) return <Navigate to="/solicitacoes" replace />;

  const status = calcularStatusSolicitacao(sol);
  const progresso = progressoSolicitacao(sol);
  const encerrada =
    status === StatusSolicitacao.CANCELADA || status === StatusSolicitacao.EXPIRADA;
  const link = `contadash.app/s/${sol.token}`;

  const handleApproveConfirm = async (payload) => {
    const item = approveItem;
    const updated = await inMemorySolicitacaoRepository.aprovarItem(sol.id, item.id, payload);
    setSol(updated);
    setApproveItem(null);
    showToast(`Item "${item.nome}" aprovado e registrado (competência ${payload.competencia}).`);
    if (calcularStatusSolicitacao(updated) === StatusSolicitacao.CONCLUIDA) {
      showToast('Solicitação concluída: todos os itens foram aprovados.');
      const retomados = await inMemoryPrazoRepository.concluirPorSolicitacao(sol.id);
      if (retomados.length > 0) {
        window.dispatchEvent(new Event('prazos-atualizados'));
        showToast(
          retomados.length === 1
            ? `Prazo de ${retomados[0].obrigacao} voltou para EM_ANDAMENTO.`
            : `${retomados.length} prazos voltaram para EM_ANDAMENTO.`
        );
      }
    }
  };

  const handleRejectConfirm = async ({ motivo, detalhes }) => {
    const updated = await inMemorySolicitacaoRepository.recusarItem(sol.id, rejectItem.id, {
      motivo,
      detalhes,
    });
    setSol(updated);
    setRejectItem(null);
    showToast(`Item "${rejectItem.nome}" recusado. Retorno enviado ao cliente (simulado).`);
  };

  const handleManualConfirm = async (payload) => {
    const updated = await inMemorySolicitacaoRepository.registrarRecebimentoManual(
      sol.id,
      manualItem.id,
      payload
    );
    setSol(updated);
    setManualItem(null);
    showToast('Recebimento manual registrado.');
  };

  const handleRenovar = async () => {
    const updated = await inMemorySolicitacaoRepository.renovarLink(sol.id);
    setSol(updated);
    showToast(`Validade renovada até ${updated.validadeAte}.`);
  };

  const handleCancelar = async () => {
    const updated = await inMemorySolicitacaoRepository.cancelar(sol.id);
    setSol(updated);
    setCancelOpen(false);
    showToast('Solicitação cancelada.');
  };

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${link}`);
      setCopiado(true);
      showToast('Link copiado para a área de transferência.');
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      showToast('Não foi possível copiar o link.', 'info');
    }
  };

  const abrirArquivo = (item, tentativa) => {
    const doc = {
      id: `sol-${sol.id}-${item.id}`,
      nome: tentativa.arquivo.nome,
      formato: 'pdf',
      versao: 1,
      competencia: sol.competencia,
      tamanho: tentativa.arquivo.tamanho,
      status: 'ENVIADO',
      hash: fakeHash,
      historico: [
        { etapa: 'CRIADO', data: sol.criadoEm.data, hora: sol.criadoEm.hora, ip: '10.0.0.1' },
        {
          etapa: 'ENVIADO',
          data: tentativa.data,
          hora: tentativa.hora,
          ip: tentativa.ip,
          canal: tentativa.canalOrigem ?? sol.canal,
        },
      ],
    };
    setViewerDoc(doc);
    setViewerVersions([doc]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Link
        to="/solicitacoes"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft size={16} /> Solicitações
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">{sol.titulo}</h1>
            <StatusBadge meta={solicitacaoStatusMeta[status]} />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {cliente?.razaoSocial ?? '—'} · competência {sol.competencia} · prazo {sol.prazo} ·
            criada em {sol.criadoEm.data} às {sol.criadoEm.hora}
          </p>
        </div>

        {!encerrada && (
          <button
            type="button"
            onClick={() => setLinkOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors"
          >
            <Send size={16} /> Reenviar link
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-700">Progresso da conferência</p>
              <span className="text-sm font-medium text-slate-500">{progresso.label}</span>
            </div>
            <ProgressBar pct={progresso.pct} tone={progresso.pct === 100 ? 'green' : 'indigo'} />
            <p className="flex items-start gap-2 text-xs text-slate-400">
              <Info size={14} className="shrink-0 mt-0.5" />
              O status da solicitação é calculado automaticamente a partir dos itens: todos
              aprovados = concluída; algum enviado = em conferência; caso contrário, aberta.
            </p>
          </div>

          {sol.itens.map((item) => (
            <SolicitacaoItemCard
              key={item.id}
              item={item}
              onApprove={setApproveItem}
              onReject={setRejectItem}
              onManualReceipt={setManualItem}
              onViewFile={abrirArquivo}
              onDownload={() => showToast('Download simulado concluído.')}
            />
          ))}
        </div>

        <aside className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-5 space-y-5 lg:sticky lg:top-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Link da solicitação
            </p>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-xs font-mono text-indigo-600 break-all flex-1">{link}</span>
              <button
                type="button"
                onClick={copiarLink}
                aria-label="Copiar link da solicitação"
                className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
              >
                {copiado ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">Validade: {sol.validadeAte}</p>
          </div>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400">Canal</dt>
              <dd className="font-medium text-slate-700">{sol.canal}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400">Prazo</dt>
              <dd className="font-medium text-slate-700">{sol.prazo}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400">Itens</dt>
              <dd className="font-medium text-slate-700">{sol.itens.length}</dd>
            </div>
          </dl>

          {!encerrada && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleRenovar}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                <RefreshCw size={15} /> Renovar validade
              </button>
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
              >
                <XCircle size={15} /> Cancelar solicitação
              </button>
            </div>
          )}

          {sol.instrucoes && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Instruções ao cliente
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">{sol.instrucoes}</p>
            </div>
          )}
        </aside>
      </div>

      <RejectItemModal
        open={Boolean(rejectItem)}
        onClose={() => setRejectItem(null)}
        solicitacao={sol}
        cliente={cliente}
        item={rejectItem}
        onConfirm={handleRejectConfirm}
      />

      <ApproveItemModal
        open={Boolean(approveItem)}
        onClose={() => setApproveItem(null)}
        solicitacao={sol}
        item={approveItem}
        onConfirm={handleApproveConfirm}
      />

      <ManualReceiptModal
        open={Boolean(manualItem)}
        onClose={() => setManualItem(null)}
        item={manualItem}
        onConfirm={handleManualConfirm}
      />

      <LinkGeneratedModal
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        solicitacao={sol}
        cliente={cliente}
        onToast={showToast}
      />

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancelar}
        title="Cancelar solicitação"
        message={`A solicitação "${sol.titulo}" será cancelada e o link deixará de funcionar para o cliente. Esta ação não pode ser desfeita.`}
        confirmLabel="Cancelar solicitação"
      />

      <DocumentViewer
        open={Boolean(viewerDoc)}
        document={viewerDoc}
        versions={viewerVersions}
        onSelectVersion={() => {}}
        onClose={() => setViewerDoc(null)}
        showActions={false}
      />
    </div>
  );
};

export default SolicitacaoDetailPage;
