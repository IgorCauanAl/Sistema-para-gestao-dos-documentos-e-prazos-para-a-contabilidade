import React from 'react';
import { X, User, Mail, MapPin, FileText, Building2 } from 'lucide-react';

const ClientFormModal = ({ open, onClose, onSubmit, formData, onInputChange, title = 'Cadastrar Novo Cliente' }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-slate-50/50">
          <form id="clientForm" onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="col-span-1">
                <label className="block text-sm font-semibold mb-1.5 text-slate-700">CNPJ</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="cnpj"
                    required
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={onInputChange}
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1.5 text-slate-700">Razão Social</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="razaoSocial"
                    required
                    placeholder="Nome da Empresa LTDA"
                    value={formData.razaoSocial}
                    onChange={onInputChange}
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700">Responsável</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="responsavel"
                    required
                    placeholder="Nome do contato principal"
                    value={formData.responsavel}
                    onChange={onInputChange}
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700">E-mail corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="contato@empresa.com.br"
                    value={formData.email}
                    onChange={onInputChange}
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700">Endereço Completo</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  name="endereco"
                  required
                  placeholder="Logradouro, Número, Bairro, Cidade - UF"
                  value={formData.endereco}
                  onChange={onInputChange}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="clientForm"
            className="px-6 py-2.5 rounded-full text-white font-medium hover:opacity-90 transition-opacity bg-[#15803D] text-sm flex items-center gap-2"
          >
            Salvar Cliente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientFormModal;
