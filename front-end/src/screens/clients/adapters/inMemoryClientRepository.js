import { ClientRepositoryPort } from '../ports/clientRepositoryPort';

const initialClients = [
  {
    id: 1,
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'Alpha Tecnologia Ltda',
    responsavel: 'Carlos Almeida',
    email: 'contato@alphatec.com.br',
    endereco: 'Av. Paulista, 1000, São Paulo - SP',
    whatsapp: '(11) 98765-4321',
    canalPreferido: 'WhatsApp',
    pendencias: 2,
    ultimoEnvio: '07/10/2026',
  },
  {
    id: 2,
    cnpj: '98.765.432/0001-10',
    razaoSocial: 'Comércio Varejista Beta',
    responsavel: 'Mariana Costa',
    email: 'financeiro@varejobeta.com',
    endereco: 'Rua das Flores, 123, Curitiba - PR',
    whatsapp: '(41) 99988-7766',
    canalPreferido: 'E-mail',
    pendencias: 0,
    ultimoEnvio: '—',
  },
];

const createInMemoryClientRepository = () => {
  let clients = [...initialClients];

  return {
    ...ClientRepositoryPort,

    async list() {
      return [...clients];
    },

    async getById(id) {
      return clients.find((item) => item.id === Number(id)) ?? null;
    },

    async create(client) {
      const newClient = {
        whatsapp: '',
        canalPreferido: 'E-mail',
        pendencias: 0,
        ultimoEnvio: '—',
        ...client,
        id: Date.now(),
      };
      clients = [...clients, newClient];
      return newClient;
    },

    async update(id, client) {
      clients = clients.map((item) => (item.id === Number(id) ? { ...item, ...client } : item));
      return clients.find((item) => item.id === Number(id));
    },

    async remove(id) {
      clients = clients.filter((item) => item.id !== Number(id));
    },
  };
};

export const inMemoryClientRepository = createInMemoryClientRepository();
