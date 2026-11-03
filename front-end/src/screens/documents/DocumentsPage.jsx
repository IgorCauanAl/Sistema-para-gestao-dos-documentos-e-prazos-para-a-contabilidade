import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Inbox } from 'lucide-react';
import { useToast } from '../../core/components/ToastProvider';
import EmptyState from '../../core/components/ui/EmptyState';
import { inMemoryClientRepository } from '../clients/adapters/inMemoryClientRepository';
import { inMemoryDocumentRepository } from '../client-detail/adapters/inMemoryDocumentRepository';
import AttachDocumentModal from '../client-detail/ui/AttachDocumentModal';
import DocumentViewer from '../client-detail/ui/DocumentViewer';
import DocumentsFilters from './ui/DocumentsFilters';
import DocumentsTabs from './ui/DocumentsTabs';
import DocumentsSummaryCards from './ui/DocumentsSummaryCards';
import DocumentsTable from './ui/DocumentsTable';
import BatchActionsBar from './ui/BatchActionsBar';
import MergePdfModal from './ui/MergePdfModal';
import ReceiveDocumentModal from './ui/ReceiveDocumentModal';
import {
  DocumentStatus,
  DirecaoDocumento,
  documentStatusMeta,
  ultimaAtividade,
} from '../../core/domain/documento';
import { diasDesde, paraData } from '../../core/domain/data';

const PAGE_SIZE = 10;

const emptyFilters = {
  busca: '',
  clienteId: null,
  tipo: '',
  competencia: '',
  status: '',
  canal: '',
};

const chaveCompetencia = (competencia) => {
  const [mes, ano] = competencia.split('/').map(Number);
  return ano * 12 + mes;
};

const chaveAtividade = (doc) => {
  const evento = ultimaAtividade(doc);
  return evento ? paraData(evento.data)?.getTime() ?? 0 : 0;
};

const DocumentsPage = () => {
  const showToast = useToast();

  const [clientes, setClientes] = useState([]);
  const [docs, setDocs] = useState(null);
  const [tab, setTab] = useState('TODOS');
  const [filters, setFilters] = useState(emptyFilters);
  const [cardAtivo, setCardAtivo] = useState(null);
  const [sort, setSort] = useState({ key: 'atividade', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const [attachOpen, setAttachOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewedDoc, setViewedDoc] = useState(null);
  const [versions, setVersions] = useState([]);

  const refresh = useCallback(async () => {
    const [listaClientes, listaDocs] = await Promise.all([
      inMemoryClientRepository.list(),
      inMemoryDocumentRepository.listAll(),
    ]);
    setClientes(listaClientes);
    setDocs(listaDocs);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [filters, tab, cardAtivo, sort]);

  const nomeCliente = useCallback(
    (clienteId) => clientes.find((c) => c.id === clienteId)?.razaoSocial ?? '—',
    [clientes]
  );

  const opcoesTipo = useMemo(() => [...new Set((docs ?? []).map((d) => d.tipo))].sort(), [docs]);

  const aplicarFiltros = useCallback(
    (lista, { ignorarDirecao = false } = {}) =>
      lista.filter((doc) => {
        if (!ignorarDirecao && tab !== 'TODOS' && doc.direcao !== tab) return false;

        const termo = filters.busca.trim().toLowerCase();
        if (termo) {
          const alvo = `${doc.nome} ${doc.tipo} ${nomeCliente(doc.clienteId)}`.toLowerCase();
          if (!alvo.includes(termo)) return false;
        }
        if (filters.clienteId && doc.clienteId !== filters.clienteId) return false;
        if (filters.tipo && doc.tipo !== filters.tipo) return false;
        if (filters.competencia && doc.competencia !== filters.competencia) return false;
        if (filters.status && doc.status !== filters.status) return false;
        if (filters.canal && doc.canal !== filters.canal) return false;

        if (cardAtivo === 'SEMANA') {
          const evento = ultimaAtividade(doc);
          if (doc.direcao !== DirecaoDocumento.ENTRADA || doc.status !== DocumentStatus.RECEBIDO) return false;
          if (!evento || diasDesde(evento.data) > 7) return false;
        } else if (cardAtivo && doc.status !== cardAtivo) {
          return false;
        }

        return true;
      }),
    [tab, filters, cardAtivo, nomeCliente]
  );

  const listaExibida = useMemo(() => {
    const filtrados = aplicarFiltros(docs ?? []);
    const comparador = (a, b) => {
      let cmp;
      if (sort.key === 'cliente') {
        cmp = nomeCliente(a.clienteId).localeCompare(nomeCliente(b.clienteId), 'pt-BR');
      } else if (sort.key === 'competencia') {
        cmp = chaveCompetencia(a.competencia) - chaveCompetencia(b.competencia);
      } else {
        cmp = chaveAtividade(a) - chaveAtividade(b);
      }
      return sort.dir === 'asc' ? cmp : -cmp;
    };
    return [...filtrados].sort(comparador);
  }, [docs, aplicarFiltros, sort, nomeCliente]);

  const contagens = useMemo(() => {
    const naAba = (docs ?? []).filter((doc) => tab === 'TODOS' || doc.direcao === tab);
    const semana = naAba.filter((doc) => {
      if (doc.direcao !== DirecaoDocumento.ENTRADA || doc.status !== DocumentStatus.RECEBIDO) return false;
      const evento = ultimaAtividade(doc);
      return Boolean(evento) && diasDesde(evento.data) <= 7;
    });
    return {
      RASCUNHO: naAba.filter((d) => d.status === DocumentStatus.RASCUNHO).length,
      ENVIADO: naAba.filter((d) => d.status === DocumentStatus.ENVIADO).length,
      VISUALIZADO: naAba.filter((d) => d.status === DocumentStatus.VISUALIZADO).length,
      SEMANA: semana.length,
    };
  }, [docs, tab]);

  const contadoresAbas = useMemo(() => {
    const base = aplicarFiltros(docs ?? [], { ignorarDirecao: true });
    return {
      TODOS: base.length,
      [DirecaoDocumento.SAIDA]: base.filter((d) => d.direcao === DirecaoDocumento.SAIDA).length,
      [DirecaoDocumento.ENTRADA]: base.filter((d) => d.direcao === DirecaoDocumento.ENTRADA).length,
    };
  }, [docs, aplicarFiltros]);

  const totalPaginas = Math.max(1, Math.ceil(listaExibida.length / PAGE_SIZE));
  const paginaAtual = Math.min(page, totalPaginas);
  const paginada = listaExibida.slice((paginaAtual - 1) * PAGE_SIZE, paginaAtual * PAGE_SIZE);

  const selecionados = listaExibida.filter((doc) => selectedIds.has(doc.id));
  const todosDaPaginaSelecionados = paginada.length > 0 && paginada.every((doc) => selectedIds.has(doc.id));

  const podeReenviar =
    selecionados.length > 0 &&
    selecionados.every(
      (doc) => doc.status === DocumentStatus.ENVIADO || doc.status === DocumentStatus.VISUALIZADO
    );
  const pdfs = selecionados.filter((doc) => doc.formato === 'pdf');
  const mesmoCliente = new Set(selecionados.map((doc) => doc.clienteId)).size === 1;

  let podeJuntar = false;
  let motivoJuntar = null;
  if (selecionados.length < 2) {
    motivoJuntar = 'Selecione ao menos 2 documentos PDF';
  } else if (pdfs.length !== selecionados.length) {
    motivoJuntar = 'Junte apenas arquivos PDF';
  } else if (!mesmoCliente) {
    motivoJuntar = 'Selecione documentos do mesmo cliente';
  } else {
    podeJuntar = true;
  }

  const abrirViewer = async (doc) => {
    const completo = await inMemoryDocumentRepository.getById(doc.id);
    if (!completo) return;
    setViewedDoc(completo);
    setVersions(await inMemoryDocumentRepository.listVersions(completo));
    setViewerOpen(true);
  };

  const fecharViewer = () => {
    setViewerOpen(false);
    setViewedDoc(null);
    setVersions([]);
  };

  const handleSend = async (doc) => {
    const atualizado = await inMemoryDocumentRepository.markEnviado(doc.id);
    await refresh();
    if (viewerOpen && viewedDoc) {
      const completo = await inMemoryDocumentRepository.getById(viewedDoc.id);
      if (completo) {
        setViewedDoc(completo);
        setVersions(await inMemoryDocumentRepository.listVersions(completo));
      }
    }
    showToast(`Documento enviado por ${atualizado?.canal ?? 'WhatsApp'} ao cliente.`);
  };

  const handleAttach = async (payload) => {
    await inMemoryDocumentRepository.create(payload);
    setAttachOpen(false);
    await refresh();
    showToast(
      payload.enviarAgora
        ? `Documento enviado por ${payload.canal} ao cliente.`
        : 'Documento salvo como rascunho.'
    );
  };

  const handleReceive = async (payload) => {
    await inMemoryDocumentRepository.createEntrada(payload);
    setReceiveOpen(false);
    await refresh();
    showToast('Recebimento registrado.');
  };

  const toggleRow = (id, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const togglePage = (checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      paginada.forEach((doc) => {
        if (checked) next.add(doc.id);
        else next.delete(doc.id);
      });
      return next;
    });
  };

  const handleReenviar = async () => {
    const elegiveis = selecionados.filter(
      (doc) => doc.status === DocumentStatus.ENVIADO || doc.status === DocumentStatus.VISUALIZADO
    );
    for (const doc of elegiveis) {
      await inMemoryDocumentRepository.markEnviado(doc.id);
    }
    await refresh();
    setSelectedIds(new Set());
    showToast(
      elegiveis.length === 1
        ? 'Documento reenviado ao cliente.'
        : `${elegiveis.length} documentos reenviados ao cliente.`
    );
  };

  const exportarProtocolos = () => {
    const cabecalho = [
      'Cliente',
      'Documento',
      'Tipo',
      'Competência',
      'Versão',
      'Status',
      'Canal',
      'Última atividade',
      'Hash',
    ];
    const linhas = selecionados.map((doc) => {
      const evento = ultimaAtividade(doc);
      return [
        nomeCliente(doc.clienteId),
        doc.nome,
        doc.tipo,
        doc.competencia,
        `v${doc.versao}`,
        documentStatusMeta[doc.status].label,
        doc.canal ?? '—',
        evento ? `${evento.data} ${evento.hora}` : '—',
        doc.hash,
      ];
    });
    const csv =
      '\uFEFF' +
      [cabecalho, ...linhas]
        .map((linha) => linha.map((campo) => `"${String(campo).replace(/"/g, '""')}"`).join(';'))
        .join('\r\n');

    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'protocolos.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }

    showToast('Protocolos exportados em CSV.');
  };

  const handleMerge = async ({ nome, fontes }) => {
    const origem = selecionados[0];
    await inMemoryDocumentRepository.createConsolidado({
      clienteId: origem.clienteId,
      nome,
      competencia: origem.competencia,
      fontes,
    });
    setMergeOpen(false);
    setSelectedIds(new Set());
    await refresh();
    showToast('Documento consolidado criado como rascunho.');
  };

  if (!docs) return null;

  const listaVazia = listaExibida.length === 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Documentos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Acompanhe tudo que foi enviado e recebido pelo escritório
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setReceiveOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors"
          >
            <Inbox size={16} /> Registrar recebimento
          </button>
          <button
            type="button"
            onClick={() => setAttachOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors"
          >
            <Plus size={16} /> Anexar documento
          </button>
        </div>
      </div>

      <DocumentsSummaryCards
        contagens={contagens}
        ativo={cardAtivo}
        onClick={setCardAtivo}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <DocumentsTabs active={tab} counts={contadoresAbas} onChange={setTab} />
        {cardAtivo && (
          <button
            type="button"
            onClick={() => setCardAtivo(null)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Limpar filtro do card
          </button>
        )}
      </div>

      <DocumentsFilters
        filters={{ ...filters, opcoesTipo }}
        onChange={setFilters}
        clientes={clientes}
        onClear={() => setFilters(emptyFilters)}
      />

      {listaVazia ? (
        <EmptyState
          title="Nenhum documento encontrado com esses filtros"
          subtitle="Ajuste a busca, o cliente, o tipo ou o status para encontrar o documento desejado."
        />
      ) : (
        <div className="space-y-4">
          <DocumentsTable
            documents={paginada}
            nomeCliente={nomeCliente}
            onView={abrirViewer}
            onSend={handleSend}
            sort={sort}
            onSort={(key) =>
              setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
            }
            selectedIds={selectedIds}
            onToggleRow={toggleRow}
            onTogglePage={togglePage}
            todosDaPaginaSelecionados={todosDaPaginaSelecionados}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <p>
              Mostrando {(paginaAtual - 1) * PAGE_SIZE + 1}–
              {Math.min(paginaAtual * PAGE_SIZE, listaExibida.length)} de {listaExibida.length} documento
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

      {selecionados.length > 0 && (
        <BatchActionsBar
          count={selecionados.length}
          podeReenviar={podeReenviar}
          onReenviar={handleReenviar}
          onExportar={exportarProtocolos}
          podeJuntar={podeJuntar}
          motivoJuntar={motivoJuntar}
          onJuntar={() => setMergeOpen(true)}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      <AttachDocumentModal
        open={attachOpen}
        onClose={() => setAttachOpen(false)}
        clientes={clientes}
        onSubmit={handleAttach}
      />

      <ReceiveDocumentModal
        open={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        clientes={clientes}
        onSubmit={handleReceive}
      />

      <MergePdfModal
        open={mergeOpen}
        onClose={() => setMergeOpen(false)}
        documentos={selecionados}
        nomeCliente={nomeCliente}
        onMerge={handleMerge}
      />

      <DocumentViewer
        open={viewerOpen}
        document={viewedDoc}
        versions={versions}
        onSelectVersion={async (version) => {
          const completo = await inMemoryDocumentRepository.getById(version.id);
          if (completo) {
            setViewedDoc(completo);
            setVersions(await inMemoryDocumentRepository.listVersions(completo));
          }
        }}
        onClose={fecharViewer}
        showActions={viewedDoc?.direcao !== DirecaoDocumento.ENTRADA}
        onResend={() => handleSend(viewedDoc)}
        onNewVersion={() => {
          fecharViewer();
          setAttachOpen(true);
        }}
        onDownload={async () => {
          await inMemoryDocumentRepository.markBaixado(viewedDoc.id);
          const completo = await inMemoryDocumentRepository.getById(viewedDoc.id);
          if (completo) {
            setViewedDoc(completo);
            setVersions(await inMemoryDocumentRepository.listVersions(completo));
          }
          await refresh();
          showToast('Download simulado concluído.');
        }}
        onReceipt={() => showToast('Recurso visual: comprovante em breve.', 'info')}
      />
    </div>
  );
};

export default DocumentsPage;
