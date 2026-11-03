import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { inMemoryClientRepository } from './adapters/inMemoryClientRepository';
import { useToast } from '../../core/components/ToastProvider';
import ClientSearchBar from './ui/ClientSearchBar';
import ClientTable from './ui/ClientTable';
import ClientFormModal from './ui/ClientFormModal';

const emptyForm = { cnpj: '', razaoSocial: '', responsavel: '', email: '', endereco: '' };

const ClientsPage = () => {
  const navigate = useNavigate();
  const showToast = useToast();

  const [clients, setClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    inMemoryClientRepository.list().then(setClients);
  }, []);

  const refresh = async () => setClients(await inMemoryClientRepository.list());

  const handleInputChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await inMemoryClientRepository.update(editingId, formData);
      showToast('Cliente atualizado com sucesso.');
    } else {
      await inMemoryClientRepository.create(formData);
      showToast('Cliente cadastrado com sucesso.');
    }

    await refresh();
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleRemove = async (client) => {
    await inMemoryClientRepository.remove(client.id);
    await refresh();
    showToast('Cliente removido.');
  };

  const handleEdit = (client) => {
    const { id, ...data } = client;
    setEditingId(id);
    setFormData(data);
    setIsModalOpen(true);
  };

  const handleOpen = (client) => navigate(`/clientes/${client.id}`);

  const handleNew = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) || client.cnpj.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Gestão de Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">Cadastre e gerencie as empresas do seu portfólio.</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-full text-sm font-medium shadow-sm hover:bg-indigo-600 transition-colors"
        >
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      <ClientSearchBar value={searchTerm} onChange={setSearchTerm} />

      <ClientTable clients={filteredClients} onEdit={handleEdit} onRemove={handleRemove} onOpen={handleOpen} />

      <ClientFormModal
        open={isModalOpen}
        title={editingId ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={handleSubmit}
        formData={formData}
        onInputChange={handleInputChange}
      />
    </div>
  );
};

export default ClientsPage;
