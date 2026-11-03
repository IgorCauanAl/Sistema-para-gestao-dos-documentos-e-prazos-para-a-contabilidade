import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, ShieldCheck, Upload, Loader2, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import StatusBadge from '../../core/components/ui/StatusBadge';
import ProgressBar from '../../core/components/ui/ProgressBar';
import { useToast } from '../../core/components/ToastProvider';
import { inMemorySolicitacaoRepository } from '../solicitacoes/adapters/inMemorySolicitacaoRepository';
import { inMemoryClientRepository } from '../clients/adapters/inMemoryClientRepository';
import {
  StatusSolicitacao,
  StatusItem,
  itemStatusPortalLabel,
  TAMANHO_MAXIMO_MB,
} from '../../core/domain/solicitacao';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const EXTENSOES = Object.freeze({
  PDF: ['pdf'],
  Imagem: ['jpg', 'jpeg', 'png', 'webp'],
  OFX: ['ofx'],
  XML: ['xml'],
  XLSX: ['xlsx'],
  CSV: ['csv'],
  TXT: ['txt'],
  Qualquer: null,
});

const ACCEPT_ATTR = Object.freeze({
  PDF: '.pdf',
  Imagem: '.jpg,.jpeg,.png,.webp',
  OFX: '.ofx',
  XML: '.xml',
  XLSX: '.xlsx',
  CSV: '.csv',
  TXT: '.txt',
  Qualquer: null,
});

const extensaoDe = (nome) => nome.split('.').pop()?.toLowerCase() ?? '';

const formatSize = (bytes) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const portalBadge = Object.freeze({
  [StatusItem.PENDENTE]: { label: itemStatusPortalLabel[StatusItem.PENDENTE], badge: 'bg-slate-100 text-slate-600 border-slate-200' },
  [StatusItem.ENVIADO]: { label: itemStatusPortalLabel[StatusItem.ENVIADO], badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  [StatusItem.APROVADO]: { label: itemStatusPortalLabel[StatusItem.APROVADO], badge: 'bg-green-100 text-green-700 border-green-200' },
  [StatusItem.RECUSADO]: { label: itemStatusPortalLabel[StatusItem.RECUSADO], badge: 'bg-amber-100 text-amber-700 border-amber-200' },
});

const ultimaTentativaComArquivo = (item) =>
  [...item.tentativas].reverse().find((t) => t.arquivo) ?? null;

const ultimaRecusa = (item) =>
  [...item.tentativas].reverse().find((t) => t.acao === 'RECUSADO') ?? null;

const ClientPortalPage = () => {
  const { token } = useParams();
  const showToast = useToast();

  const [sol, setSol] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  const [uploads, setUploads] = useState({});
  const [sucesso, setSucesso] = useState(null);

  const refresh = useCallback(async () => {
    const found = await inMemorySolicitacaoRepository.getByToken(token);
    setSol(found);
    setCliente(found ? await inMemoryClientRepository.getById(found.clienteId) : null);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setUpload = (itemId, patch) =>
    setUploads((prev) => ({
      ...prev,
      [itemId]: { file: null, error: '', pct: 0, enviando: false, observacao: '', ...prev[itemId], ...patch },
    }));

  const selecionarArquivo = (item, file) => {
    if (!file) return;

    const ext = extensaoDe(file.name);
    const permitidas = EXTENSOES[item.formatoEsperado];

    if (permitidas && !permitidas.includes(ext)) {
      setUpload(item.id, {
        file: null,
        error: `Formato .${ext} não aceito para "${item.nome}". Envie: ${permitidas.map((e) => `.${e}`).join(', ')}.`,
      });
      return;
    }

    if (file.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
      setUpload(item.id, { file: null, error: `O arquivo excede o limite de ${TAMANHO_MAXIMO_MB} MB.` });
      return;
    }

    setUpload(item.id, { file, error: '', pct: 0 });
  };

  const enviarItem = async (item) => {
    const atual = uploads[item.id];

    if (!atual?.file) {
      setUpload(item.id, { error: 'Selecione um arquivo para envio.' });
      return;
    }

    setUpload(item.id, { enviando: true, error: '', pct: 10 });
    await wait(150);
    setUpload(item.id, { pct: 45 });
    await wait(150);
    setUpload(item.id, { pct: 80 });
    await wait(150);

    const resultado = await inMemorySolicitacaoRepository.enviarPeloPortal(token, item.id, {
      arquivo: {
        nome: atual.file.name,
        tamanho: formatSize(atual.file.size),
      },
      observacao: atual.observacao?.trim() || null,
    });

    if (!resultado) {
      setUpload(item.id, { enviando: false, pct: 0, error: 'Não foi possível enviar este item.' });
      return;
    }

    setUpload(item.id, { pct: 100, enviando: false, file: null, observacao: '' });
    setSucesso({ itemId: item.id, nome: item.nome, protocolo: resultado.protocolo });
    showToast('Documento enviado com sucesso.');
    await refresh();
  };

  if (loading) return null;

  const erroLink = !sol;
  const cancelada = sol?.status === StatusSolicitacao.CANCELADA;
  const expirada = sol?.status === StatusSolicitacao.EXPIRADA;

  const headerMarca = (
    <div className="flex items-center gap-3">
      <span className="w-11 h-11 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-bold">
        CD
      </span>
      <div>
        <p className="font-bold text-slate-800">ContaDash</p>
        <p className="text-xs text-slate-400">Solicitação de documentos</p>
      </div>
    </div>
  );

  if (erroLink || cancelada || expirada) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-8 max-w-md w-full text-center space-y-4">
          {headerMarca}
          <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mt-4">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">
              {erroLink ? 'Link inválido' : cancelada ? 'Solicitação cancelada' : 'Solicitação expirada'}
            </p>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              {erroLink
                ? 'Este link não existe ou foi substituído. Peça ao seu contador um novo link de envio.'
                : cancelada
                  ? 'Esta solicitação foi cancelada pelo escritório contábil. Em caso de dúvidas, fale com o seu contador.'
                  : 'O prazo de envio deste link encerrou. Fale com o seu escritório contábil para solicitar a renovação.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-6 space-y-5">
          {headerMarca}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
              {cliente?.razaoSocial}
            </p>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 mt-1">{sol.titulo}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Competência {sol.competencia} · Prazo para envio: <strong>{sol.prazo}</strong>
            </p>
          </div>

          {sol.instrucoes && (
            <div className="px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <p className="text-xs font-semibold text-indigo-700 mb-1">Instruções do escritório</p>
              <p className="text-sm text-indigo-900/80 leading-relaxed">{sol.instrucoes}</p>
            </div>
          )}
        </header>

        {sucesso && (
          <div
            className="bg-green-50 border border-green-200 rounded-3xl p-5 flex flex-wrap items-center gap-4"
            role="status"
          >
            <CheckCircle2 size={28} className="text-green-600 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-green-800">Documento enviado com sucesso!</p>
              <p className="text-sm text-green-700">
                {sucesso.nome} · Protocolo: <strong>{sucesso.protocolo}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSucesso(null)}
              className="text-xs font-semibold text-green-700 hover:text-green-900 underline"
            >
              Fechar
            </button>
          </div>
        )}

        <div className="space-y-4">
          {sol.itens.map((item) => {
            const arquivo = ultimaTentativaComArquivo(item);
            const recusa = item.status === StatusItem.RECUSADO ? ultimaRecusa(item) : null;
            const atual = uploads[item.id] ?? {};
            const podeEnviar =
              item.status === StatusItem.PENDENTE || item.status === StatusItem.RECUSADO;

            return (
              <section key={item.id} className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                      <FileText size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800">{item.nome}</p>
                      <p className="text-xs text-slate-400">Formato aceito: {item.formatoEsperado}</p>
                    </div>
                  </div>
                  <StatusBadge meta={portalBadge[item.status]} />
                </div>

                {recusa && (
                  <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
                    <p className="text-sm font-semibold text-amber-800">
                      O escritório pediu reenvio deste item
                      {recusa.detalhes ? `: ${recusa.detalhes}` : '.'}
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Data da recusa: {recusa.data} às {recusa.hora}
                    </p>
                  </div>
                )}

                {item.status === StatusItem.ENVIADO && arquivo && (
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-900">
                    <span className="flex items-center gap-1.5">
                      <Clock size={15} /> Aguardando conferência pelo escritório
                    </span>
                    <span className="text-blue-700">
                      {arquivo.arquivo.nome} · {arquivo.arquivo.tamanho} · {arquivo.data} {arquivo.hora}
                    </span>
                  </div>
                )}

                {item.status === StatusItem.APROVADO && arquivo && (
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 bg-green-50 border border-green-100 rounded-2xl text-sm text-green-800">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 size={15} /> Aprovado pelo escritório
                    </span>
                    <span>
                      {arquivo.arquivo.nome} · {arquivo.arquivo.tamanho}
                    </span>
                  </div>
                )}

                {podeEnviar && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor={`arquivo-${item.id}`}
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-2xl text-sm font-medium text-slate-500 hover:border-indigo-400 hover:text-indigo-500 cursor-pointer transition-colors"
                        >
                          <Upload size={16} />
                          {atual.file ? atual.file.name : 'Escolher arquivo'}
                        </label>
                        <input
                          id={`arquivo-${item.id}`}
                          type="file"
                          accept={ACCEPT_ATTR[item.formatoEsperado] ?? undefined}
                          className="sr-only"
                          onChange={(e) => selecionarArquivo(item, e.target.files?.[0] ?? null)}
                        />
                        {atual.file && (
                          <p className="text-xs text-slate-500 mt-1.5">
                            {atual.file.name} · {formatSize(atual.file.size)}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor={`obs-${item.id}`} className="sr-only">
                          Observação para {item.nome}
                        </label>
                        <input
                          id={`obs-${item.id}`}
                          type="text"
                          placeholder="Observação (opcional)"
                          value={atual.observacao ?? ''}
                          onChange={(e) => setUpload(item.id, { observacao: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    {atual.error && (
                      <p className="text-sm font-medium text-red-600 flex items-center gap-1.5" role="alert">
                        <AlertTriangle size={15} /> {atual.error}
                      </p>
                    )}

                    {atual.enviando && <ProgressBar pct={atual.pct ?? 0} tone="indigo" />}

                    <button
                      type="button"
                      disabled={atual.enviando}
                      onClick={() => enviarItem(item)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 disabled:opacity-60 transition-colors"
                    >
                      {atual.enviando ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Enviando...
                        </>
                      ) : (
                        <>
                          <Upload size={16} /> Enviar documento
                        </>
                      )}
                    </button>
                  </div>
                )}

                {item.status === StatusItem.APROVADO && !podeEnviar && (
                  <p className="text-xs text-slate-400">Este item já foi aprovado. Nada mais é necessário.</p>
                )}
              </section>
            );
          })}
        </div>

        <footer className="flex items-start gap-3 px-5 py-4 bg-white rounded-3xl shadow-sm border border-slate-200/50">
          <ShieldCheck size={18} className="text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed">
            Seus arquivos são enviados somente ao escritório contábil responsável por esta
            solicitação e usados exclusivamente para a prestação dos serviços contábeis. O link é
            pessoal e intransferível. Em caso de dúvidas, fale diretamente com o seu contador.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ClientPortalPage;
