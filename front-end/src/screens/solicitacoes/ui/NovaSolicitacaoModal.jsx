import React, { useEffect, useState } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';
import Modal from '../../../core/components/ui/Modal';
import { CANAIS_ENVIO, MESES, ANOS } from '../../../core/domain/documento';
import { FORMATOS_ESPERADOS, SUGESTOES_ITENS } from '../../../core/domain/request';
import { paraBR } from '../../../core/domain/data';

const inputClass =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700';

const NovaSolicitacaoModal = ({ open, onClose, clientes, clienteInicial, onSubmit }) => {
  const [clienteNome, setClienteNome] = useState('');
  const [titulo, setTitulo] = useState('');
  const [competencia, setCompetencia] = useState('09/2026');
  const [deadline, setPrazo] = useState('');
  const [itens, setItens] = useState([{ nome: '', formato: 'PDF' }]);
  const [instrucoes, setInstrucoes] = useState('');
  const [validadeDias, setValidadeDias] = useState('7');
  const [canal, setCanal] = useState('WhatsApp');
  const [error, setError] = useState('');

  const clienteTravado = Boolean(clienteInicial);

  useEffect(() => {
    if (!open) return;

    const cliente = clienteInicial ?? null;
    setClienteNome(cliente?.razaoSocial ?? '');
    setTitulo(cliente ? `Documentos de ${competencia}` : '');
    setPrazo('');
    setItens([{ nome: '', formato: 'PDF' }]);
    setInstrucoes('');
    setValidadeDias('7');
    setCanal(cliente?.canalPreferido ?? 'WhatsApp');
    setError('');
  }, [open, clienteInicial]); // eslint-disable-line react-hooks/exhaustive-deps

  const resolverCliente = (nome) =>
    clientes.find((c) => c.razaoSocial.toLowerCase() === (nome ?? '').trim().toLowerCase());

  const addItem = (nome = '') => setItens((prev) => [...prev, { nome, formato: 'PDF' }]);

  const setItem = (index, patch) =>
    setItens((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const removeItem = (index) => setItens((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = (enviarAgora) => () => {
    const cliente = clienteTravado ? clienteInicial : resolverCliente(clienteNome);

    if (!cliente) {
      setError('Selecione um cliente válido.');
      return;
    }
    if (!titulo.trim()) {
      setError('Informe o título da solicitação.');
      return;
    }
    const itensValidos = itens.filter((item) => item.nome.trim());
    if (itensValidos.length === 0) {
      setError('Adicione pelo menos 1 item à solicitação.');
      return;
    }
    if (!deadline) {
      setError('Informe o deadline para envio.');
      return;
    }

    setError('');
    onSubmit({
      clienteId: cliente.id,
      titulo: titulo.trim(),
      competencia,
      deadline: paraBR(deadline),
      instrucoes: instrucoes.trim(),
      canal,
      validadeDias: Number(validadeDias),
      itens: itensValidos.map((item) => ({ nome: item.nome.trim(), formato: item.formato })),
      enviarAgora,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nova solicitação"
      maxWidth="max-w-3xl"
      footer={
        <div className="px-6 py-4 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={handleSubmit(false)}
            className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
          >
            Salvar como rascunho
          </button>
          <button
            type="button"
            onClick={handleSubmit(true)}
            className="px-6 py-2.5 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors text-sm flex items-center gap-2"
          >
            Criar e enviar link
          </button>
        </div>
      }
    >
      <form onSubmit={(e) => e.preventDefault()} className="p-6 space-y-5 bg-slate-50/50">
        <div>
          <label htmlFor="sol-cliente" className="block text-sm font-semibold mb-1.5 text-slate-700">
            Cliente
          </label>
          <input
            id="sol-cliente"
            list="sol-clientes-list"
            className={inputClass}
            placeholder="Busque pelo nome do cliente..."
            value={clienteTravado ? clienteInicial.razaoSocial : clienteNome}
            readOnly={clienteTravado}
            onChange={(e) => setClienteNome(e.target.value)}
          />
          <datalist id="sol-clientes-list">
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.razaoSocial} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-1">
            <label htmlFor="sol-titulo" className="block text-sm font-semibold mb-1.5 text-slate-700">
              Título
            </label>
            <input
              id="sol-titulo"
              type="text"
              className={inputClass}
              placeholder="Documentos de 09/2026"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="sol-competencia" className="block text-sm font-semibold mb-1.5 text-slate-700">
              Competência
            </label>
            <select
              id="sol-competencia"
              className={inputClass}
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
            >
              {ANOS.flatMap((ano) =>
                MESES.map((mes) => {
                  const value = `${mes}/${ano}`;
                  return (
                    <option key={value} value={value}>
                      {mes}/{ano}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          <div>
            <label htmlFor="sol-deadline" className="block text-sm font-semibold mb-1.5 text-slate-700">
              Prazo para envio
            </label>
            <input id="sol-deadline" type="date" className={inputClass} value={deadline} onChange={(e) => setPrazo(e.target.value)} />
          </div>
        </div>

        <fieldset>
          <legend className="block text-sm font-semibold mb-2 text-slate-700">Checklist de itens</legend>

          <div className="flex flex-wrap gap-2 mb-3">
            {SUGESTOES_ITENS.map((sugestao) => (
              <button
                key={sugestao}
                type="button"
                onClick={() => addItem(sugestao)}
                className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-semibold hover:bg-indigo-100 transition-colors"
              >
                + {sugestao}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {itens.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-3 items-stretch">
                <div className="flex-1">
                  <label htmlFor={`sol-item-${index}`} className="sr-only">
                    Nome do item {index + 1}
                  </label>
                  <input
                    id={`sol-item-${index}`}
                    type="text"
                    className={inputClass}
                    placeholder="Nome do item (ex.: Extrato bancário)"
                    value={item.nome}
                    onChange={(e) => setItem(index, { nome: e.target.value })}
                  />
                </div>
                <div className="sm:w-40">
                  <label htmlFor={`sol-formato-${index}`} className="sr-only">
                    Formato esperado do item {index + 1}
                  </label>
                  <select
                    id={`sol-formato-${index}`}
                    className={inputClass}
                    value={item.formato}
                    onChange={(e) => setItem(index, { formato: e.target.value })}
                  >
                    {FORMATOS_ESPERADOS.map((formato) => (
                      <option key={formato} value={formato}>
                        {formato}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  aria-label={`Remover item ${index + 1}`}
                  onClick={() => removeItem(index)}
                  className="px-3 py-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors self-start"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addItem()}
            className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <Plus size={16} /> Adicionar item
          </button>
        </fieldset>

        <div>
          <label htmlFor="sol-instrucoes" className="block text-sm font-semibold mb-1.5 text-slate-700">
            Instruções para o cliente <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <textarea
            id="sol-instrucoes"
            rows={3}
            className={inputClass}
            placeholder="Ex.: Envie em PDF nomeado com a competência..."
            value={instrucoes}
            onChange={(e) => setInstrucoes(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="sol-validade" className="block text-sm font-semibold mb-1.5 text-slate-700">
              Validade do link
            </label>
            <select
              id="sol-validade"
              className={inputClass}
              value={validadeDias}
              onChange={(e) => setValidadeDias(e.target.value)}
            >
              <option value="7">7 dias</option>
              <option value="15">15 dias</option>
              <option value="30">30 dias</option>
            </select>
          </div>

          <fieldset>
            <legend className="block text-sm font-semibold mb-2 text-slate-700">Canal de envio</legend>
            <div className="flex gap-4">
              {CANAIS_ENVIO.map((opcao) => (
                <label
                  key={opcao}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer text-sm font-medium text-slate-700 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/50 transition-colors"
                >
                  <input
                    type="radio"
                    name="canal-request"
                    value={opcao}
                    checked={canal === opcao}
                    onChange={(e) => setCanal(e.target.value)}
                    className="accent-indigo-500"
                  />
                  {opcao}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {error && (
          <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl" role="alert">
            <FileText size={18} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default NovaSolicitacaoModal;
