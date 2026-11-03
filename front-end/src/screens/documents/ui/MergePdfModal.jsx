import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, AlertTriangle, FileText } from 'lucide-react';
import Modal from '../../../core/components/ui/Modal';

const MergePdfModal = ({ open, onClose, documentos, nomeCliente, onMerge }) => {
  const [ordem, setOrdem] = useState([]);
  const [nomeFinal, setNomeFinal] = useState('');

  useEffect(() => {
    if (!open) return;
    setOrdem(documentos.map((doc) => doc.id));
    setNomeFinal('Documentos consolidados');
  }, [open, documentos]);

  const mover = (index, direcao) => {
    setOrdem((prev) => {
      const alvo = index + direcao;
      if (alvo < 0 || alvo >= prev.length) return prev;
      const copia = [...prev];
      [copia[index], copia[alvo]] = [copia[alvo], copia[index]];
      return copia;
    });
  };

  const handleSubmit = () => {
    const nome = nomeFinal.trim() || 'Documentos consolidados';
    const fontes = ordem;
    onMerge({ nome, fontes });
  };

  if (!open || documentos.length === 0) return null;

  const docsOrdenados = ordem.map((id) => documentos.find((doc) => doc.id === id)).filter(Boolean);
  const clienteUnico = nomeCliente(documentos[0].clienteId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Juntar em um PDF"
      footer={
        <div className="px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors text-sm"
          >
            Juntar
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-5 bg-slate-50/50">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Cliente</p>
          <p className="text-sm font-semibold text-slate-700">{clienteUnico}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">
            Arquivos selecionados ({docsOrdenados.length})
          </p>
          <ol className="space-y-2">
            {docsOrdenados.map((doc, index) => (
              <li
                key={doc.id}
                className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl"
              >
                <span className="text-xs font-bold text-slate-400 w-5 text-center">{index + 1}</span>
                <FileText size={16} className="text-indigo-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{doc.nome}</p>
                  <p className="text-xs text-slate-400">
                    {doc.tipo} · {doc.competencia} · v{doc.versao} · {doc.formato.toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    aria-label={`Mover ${doc.nome} para cima`}
                    disabled={index === 0}
                    onClick={() => mover(index, -1)}
                    className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Mover ${doc.nome} para baixo`}
                    disabled={index === docsOrdenados.length - 1}
                    onClick={() => mover(index, 1)}
                    className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowDown size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <label htmlFor="nome-final-pdf" className="block text-sm font-semibold mb-1.5 text-slate-700">
            Nome do arquivo final
          </label>
          <input
            id="nome-final-pdf"
            type="text"
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
            value={nomeFinal}
            onChange={(e) => setNomeFinal(e.target.value)}
          />
        </div>

        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-amber-800 leading-relaxed">
            Se os arquivos já estiverem assinados digitalmente, a junção invalida as assinaturas.
            Junte primeiro e assine o arquivo final.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default MergePdfModal;
