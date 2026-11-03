export const DocumentRepositoryPort = {
  async listByClient(clienteId) {
    throw new Error('Not implemented');
  },
  async getById(id) {
    throw new Error('Not implemented');
  },
  async listVersions(doc) {
    throw new Error('Not implemented');
  },
  async create(doc) {
    throw new Error('Not implemented');
  },
  async markEnviado(id) {
    throw new Error('Not implemented');
  },
  async markBaixado(id) {
    throw new Error('Not implemented');
  },
  async listAll() {
    throw new Error('Not implemented');
  },
  async findByTipoCompetencia(clienteId, tipo, competencia) {
    throw new Error('Not implemented');
  },
  async createEntrada(payload) {
    throw new Error('Not implemented');
  },
  async createConsolidado(payload) {
    throw new Error('Not implemented');
  },
};
