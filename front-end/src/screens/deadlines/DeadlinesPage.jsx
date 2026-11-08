import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../../core/components/ToastProvider';
import EmptyState from '../../core/components/ui/EmptyState';
import ConfirmDialog from '../solicitacoes/ui/ConfirmDialog';
import NovaSolicitacaoModal from '../solicitacoes/ui/NovaSolicitacaoModal';
import AttachDocumentModal from '../client-detail/ui/AttachDocumentModal';
import { inMemoryClientRepository } from '../clients/adapters/inMemoryClientRepository';
import { inMemorySolicitacaoRepository } from '../solicitacoes/adapters/inMemorySolicitacaoRepository';
import { inMemoryDocumentRepository } from '../client-detail/adapters/inMemoryDocumentRepository';
import { inMemoryPrazoRepository } from './adapters/inMemoryPrazoRepository';
import PrazoSummaryCards from './ui/PrazoSummaryCards';
import PrazoFilters from './ui/PrazoFilters';
import PrazoTable from './ui/PrazoTable';
import PrazoDetailPanel from './ui/PrazoDetailPanel';
import ReprogramarModal from './ui/ReprogramarModal';
import {
  HOJE,
  StatusPrazo,
  ETAPAS_PADRAO,
  estaAtrasado,
  diasRestantes,
  prioridadeEfetiva,
} from '../../core/domain/deadline';

const PAGE_SIZE = 10;

const emptyFilters = {
  busca: '',
  clienteId: null,
  obrigacao: '',
  categoria: '',
  competencia: '',
  status: '',
  prioridade: '',
};

const notifyUpdate = () => window.dispatchEvent(new Event('prazos-atualizados'));

const DeadlinesPage = () => {
  const showToast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [prazos, setPrazos] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [cardAtivo, setCardAtivo] = useState(null);
  const [page, setPage] = useState(1);

  const [reprogramarOpen, setReprogramarOpen] = useState(false);
  const [novaSolOpen, setNovaSolOpen] = useState(false);
  const [anexarOpen, setAnexarOpen] = useState(false);
  const [entregarSolicitado, setEntregarSolicitado] = useState(null);

  const detailId = Number(searchParams.get('deadline')) || null;

  const refresh = useCallback(async () => {
    const [listaClientes, listaPrazos] = await Promise.all([
      inMemoryClientRepository.list(),
      inMemoryPrazoRepository.list(),
    ]);
    setClientes(listaClientes);
    setPrazos(listaPrazos);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setPage(1);
  }, [filters, cardAtivo, detailId]);

  const nomeCliente = useCallback(
    (clienteId) => clientes.find((c) => c.id === clienteId)?.razaoSocial ?? '—',
    [clientes]
  );

  const opcoesObrigacao = useMemo(
    () => [...new Set((prazos ?? []).map((deadline) => deadline.obrigacao))].sort(),
    [prazos]
  );

  const contagens = useMemo(() => {
    const lista = prazos ?? [];
    const abertos = lista.filter((deadline) => deadline.status !== StatusPrazo.ENTREGUE);
    return {
      ATRASADOS: lista.filter((deadline) => estaAtrasado(deadline, HOJE)).length,
      HOJE: abertos.filter((deadline) => diasRestantes(deadline, HOJE) === 0).length,
      SEMANA: abertos.filter((deadline) => {
        const dias = diasRestantes(deadline, HOJE);
        return dias !== null && dias >= 0 && dias <= 7;
      }).length,
      PENDENTES: lista.filter((deadline) => deadline.status === StatusPrazo.PENDENTE).length,
    };
  }, [prazos]);

  const listaExibida = useMemo(() => {
    const termo = filters.busca.trim().toLowerCase();

    const filtrados = (prazos ?? []).filter((deadline) => {
      if (termo) {
        const alvo = `${deadline.obrigacao} ${deadline.categoria} ${deadline.competencia} ${nomeCliente(deadline.clienteId)}`.toLowerCase();
        if (!alvo.includes(termo)) return false;
      }
      if (filters.clienteId && deadline.clienteId !== filters.clienteId) return false;
      if (filters.obrigacao && deadline.obrigacao !== filters.obrigacao) return false;
      if (filters.categoria && deadline.categoria !== filters.categoria) return false;
      if (filters.competencia && deadline.competencia !== filters.competencia) return false;
      if (filters.status && deadline.status !== filters.status) return false;
      if (filters.prioridade && prioridadeEfetiva(deadline, HOJE) !== filters.prioridade) return false;

      if (cardAtivo === 'ATRASADOS' && !estaAtrasado(deadline, HOJE)) return false;
      if (cardAtivo === 'PENDENTES' && deadline.status !== StatusPrazo.PENDENTE) return false;
      if (cardAtivo === 'HOJE' && !(diasRestantes(deadline, HOJE) === 0 && deadline.status !== StatusPrazo.ENTREGUE)) return false;
      if (cardAtivo === 'SEMANA') {
        const dias = diasRestantes(deadline, HOJE);
        if (!(dias !== null && dias >= 0 && dias <= 7 && deadline.status !== StatusPrazo.ENTREGUE)) return false;
      }

      return true;
    });

    const comparador = (a, b) => {
      const ea = a.status === StatusPrazo.ENTREGUE;
      const eb = b.status === StatusPrazo.ENTREGUE;
      if (ea !== eb) return ea ? 1 : -1;
      const da = diasRestantes(a, HOJE) ?? 9999;
      const db = diasRestantes(b, HOJE) ?? 9999;
      if (da !== db) return da - db;
      return a.id - b.id;
    };

    return [...filtrados].sort(comparador);
  }, [prazos, filters, cardAtivo, nomeCliente]);

  const totalPaginas = Math.max(1, Math.ceil(listaExibida.length / PAGE_SIZE));
  const paginaAtual = Math.min(page, totalPaginas);
  const paginada = listaExibida.slice((paginaAtual - 1) * PAGE_SIZE, paginaAtual * PAGE_SIZE);

  const prazoDetalhe = useMemo(
    () => (prazos ?? []).find((deadline) => deadline.id === detailId) ?? null,
    [prazos, detailId]
  );
  const clienteDetalhe = prazoDetalhe
    ? clientes.find((cliente) => cliente.id === prazoDetalhe.clienteId) ?? null
    : null;

  const abrirDetalhe = (deadline) => setSearchParams({ deadline: String(deadline.id) });
  const fecharDetalhe = () => setSearchParams({});

  const handleToggleEtapa = async (index) => {
    const atualizado = await inMemoryPrazoRepository.concluirEtapa(detailId, index);
    await refresh();
    notifyUpdate();
    if (
      atualizado &&
      atualizado.status !== StatusPrazo.ENTREGUE &&
      atualizado.etapasConcluidas.length === ETAPAS_PADRAO.length
    ) {
      setEntregarSolicitado(atualizado);
    }
  };

  const handleMarcarEntregue = async () => {
    const alvo = entregarSolicitado;
    setEntregarSolicitado(null);
    if (!alvo || alvo === 'todas') return;
    await inMemoryPrazoRepository.marcarEntregue(alvo.id);
    await refresh();
    notifyUpdate();
    showToast(`Prazo de ${alvo.obrigacao} marcado como entregue.`);
  };

  const handleReprogramarConfirm = async (payload) => {
    await inMemoryPrazoRepository.reprogramar(detailId, payload);
    setReprogramarOpen(false);
    await refresh();
    notifyUpdate();
    showToast(`Vencimento reprogramado para ${payload.novaData}.`);
  };

  const handleDefinirPrioridade = async (prioridade) => {
    await inMemoryPrazoRepository.definirPrioridade(detailId, prioridade);
    await refresh();
    notifyUpdate();
    showToast('Prioridade atualizada.');
  };

  const handleCriarSolicitacao = async (payload) => {
    const solicitacao = await inMemorySolicitacaoRepository.create(payload);
    await inMemoryPrazoRepository.vincularSolicitacao(prazoDetalhe.id, solicitacao.id);
    setNovaSolOpen(false);
    await refresh();
    notifyUpdate();
    showToast(`Solicitação criada e vinculada ao deadline de ${prazoDetalhe.obrigacao}.`);
  };

  const handleAnexarGuia = async (payload) => {
    await inMemoryDocumentRepository.create(payload);
    setAnexarOpen(false);
    showToast('Guia anexada e enviada ao cliente.');
  };

  if (!prazos) return null;

  const listaVazia = listaExibida.length === 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Prazos</h1>
        <p className="text-sm text-slate-500 mt-1">
          Acompanhe vencimentos e entregas do escritório
        </p>
      </div>

      <PrazoSummaryCards contagens={contagens} ativo={cardAtivo} onClick={setCardAtivo} />

      <PrazoFilters
        filters={filters}
        onChange={setFilters}
        clientes={clientes}
        opcoesObrigacao={opcoesObrigacao}
        onClear={() => setFilters(emptyFilters)}
      />

      {listaVazia ? (
        <EmptyState
          title="Nenhum deadline encontrado com esses filtros"
          subtitle="Ajuste a busca, o cliente, a categoria ou o status para encontrar o deadline desejado."
        />
      ) : (
        <div className="space-y-4">
          <PrazoTable
            prazos={paginada}
            nomeCliente={nomeCliente}
            hoje={HOJE}
            onView={abrirDetalhe}
            onEntregar={setEntregarSolicitado}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <p>
              Mostrando {(paginaAtual - 1) * PAGE_SIZE + 1}–
              {Math.min(paginaAtual * PAGE_SIZE, listaExibida.length)} de {listaExibida.length} deadline
              {listaExibida.length > 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Página anterior"
                disabled={paginaAtual <= 1}
                onClick={() => setPage(paginaAtual - 1)}
                className="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <button
                type="button"
                aria-label="Próxima página"
                disabled={paginaAtual >= totalPaginas}
                onClick={() => setPage(paginaAtual + 1)}
                className="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
      )}

      <PrazoDetailPanel
        open={Boolean(prazoDetalhe)}
        deadline={prazoDetalhe}
        cliente={clienteDetalhe}
        hoje={HOJE}
        onClose={fecharDetalhe}
        onToggleEtapa={handleToggleEtapa}
        onMarcarEntregue={() => setEntregarSolicitado(prazoDetalhe)}
        onReprogramar={() => setReprogramarOpen(true)}
        onDefinirPrioridade={handleDefinirPrioridade}
        onCriarSolicitacao={() => setNovaSolOpen(true)}
        onAnexarGuia={() => setAnexarOpen(true)}
      />

      <ReprogramarModal
        open={reprogramarOpen}
        onClose={() => setReprogramarOpen(false)}
        deadline={prazoDetalhe}
        onConfirm={handleReprogramarConfirm}
      />

      <NovaSolicitacaoModal
        open={novaSolOpen}
        onClose={() => setNovaSolOpen(false)}
        clientes={clientes}
        clienteInicial={clienteDetalhe}
        onSubmit={handleCriarSolicitacao}
      />

      <AttachDocumentModal
        open={anexarOpen}
        onClose={() => setAnexarOpen(false)}
        client={clienteDetalhe}
        prefill={prazoDetalhe ? { tipo: prazoDetalhe.obrigacao, competencia: prazoDetalhe.competencia } : undefined}
        onSubmit={handleAnexarGuia}
      />

      <ConfirmDialog
        open={Boolean(entregarSolicitado)}
        onClose={() => setEntregarSolicitado(null)}
        onConfirm={handleMarcarEntregue}
        title="Marcar deadline como entregue"
        message={
          entregarSolicitado
            ? `Confirmar a entrega de ${entregarSolicitado.obrigacao} (${entregarSolicitado.competencia}) de ${nomeCliente(entregarSolicitado.clienteId)}?`
            : ''
        }
        confirmLabel="Marcar como entregue"
        danger={false}
      />
    </div>
  );
};

export default DeadlinesPage;
