export const PrazoRepositoryPort = {
  async list() {
    throw new Error('Not implemented');
  },
  async getById(id) {
    throw new Error('Not implemented');
  },
  async listByCliente(clienteId) {
    throw new Error('Not implemented');
  },
  async concluirEtapa(prazoId, etapaIndice) {
    throw new Error('Not implemented');
  },
  async marcarEntregue(prazoId) {
    throw new Error('Not implemented');
  },
  async reprogramar(prazoId, { novaData, motivo, observacao }) {
    throw new Error('Not implemented');
  },
  async definirPrioridade(prazoId, prioridade) {
    throw new Error('Not implemented');
  },
  async vincularSolicitacao(prazoId, solicitacaoId) {
    throw new Error('Not implemented');
  },
  async atualizarStatus(prazoId, status) {
    throw new Error('Not implemented');
  },
  async concluirPorSolicitacao(solicitacaoId) {
    throw new Error('Not implemented');
  },
  async getAlertas() {
    throw new Error('Not implemented');
  },
};
