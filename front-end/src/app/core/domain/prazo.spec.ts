import type { Prazo } from './models';
import { diasRestantes, estaAtrasado, textoRelativoVencimento } from './prazo';

const prazo = (vencimento: string, status = 'EM_ANDAMENTO'): Prazo => ({
  id: 1,
  clienteId: 2,
  modeloId: 'DAS',
  obrigacao: 'DAS',
  categoria: 'Fiscal',
  competencia: '11/2026',
  vencimentoAtual: vencimento,
  prioridade: 'MEDIA',
  prioridadeManual: false,
  status,
  etapaAtual: 1,
  etapasConcluidas: [0],
  historico: [],
  solicitacaoId: null,
  entregueEm: null,
});

describe('regra de atraso de prazo', () => {
  it('não considera atrasado no dia do vencimento', () => {
    const hoje = new Date(2026, 10, 20);

    expect(diasRestantes(prazo('20/11/2026'), hoje)).toBe(0);
    expect(estaAtrasado(prazo('20/11/2026'), hoje)).toBe(false);
    expect(textoRelativoVencimento(prazo('20/11/2026'), hoje)).toBe('vence hoje');
  });

  it('entra em atraso exatamente no dia seguinte', () => {
    const diaSeguinte = new Date(2026, 10, 21);

    expect(diasRestantes(prazo('20/11/2026'), diaSeguinte)).toBe(-1);
    expect(estaAtrasado(prazo('20/11/2026'), diaSeguinte)).toBe(true);
    expect(textoRelativoVencimento(prazo('20/11/2026'), diaSeguinte)).toBe('atrasado há 1 dia');
  });

  it('não tolera fim de semana nem feriado', () => {
    const sabado = '21/11/2026';
    const domingo = new Date(2026, 10, 22);
    const natal = '25/12/2026';
    const diaSeguinteNatal = new Date(2026, 11, 26);

    expect(estaAtrasado(prazo(sabado), domingo)).toBe(true);
    expect(estaAtrasado(prazo(natal), diaSeguinteNatal)).toBe(true);
  });

  it('não marca como atrasados prazos entregues ou cancelados', () => {
    const depois = new Date(2026, 11, 1);

    expect(estaAtrasado(prazo('20/11/2026', 'ENTREGUE'), depois)).toBe(false);
    expect(estaAtrasado(prazo('20/11/2026', 'CANCELADO'), depois)).toBe(false);
  });
});
