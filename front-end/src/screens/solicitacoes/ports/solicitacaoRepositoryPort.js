export const SolicitacaoRepositoryPort = {
  async list() {
    throw new Error('Not implemented');
  },
  async getById(id) {
    throw new Error('Not implemented');
  },
  async getByToken(token) {
    throw new Error('Not implemented');
  },
  async create(data) {
    throw new Error('Not implemented');
  },
  async renovarLink(id) {
    throw new Error('Not implemented');
  },
  async cancelar(id) {
    throw new Error('Not implemented');
  },
  async aprovarItem(solicitacaoId, itemId, { competencia, vencimento, diasAntecedencia } = {}) {
    throw new Error('Not implemented');
  },
  async recusarItem(solicitacaoId, itemId, { motivo, detalhes }) {
    throw new Error('Not implemented');
  },
  async registrarRecebimentoManual(
    solicitacaoId,
    itemId,
    { arquivo, canalOrigem, observacao, vencimento, diasAntecedencia } = {}
  ) {
    throw new Error('Not implemented');
  },
  async enviarPeloPortal(token, itemId, { arquivo, observacao }) {
    throw new Error('Not implemented');
  },
};
