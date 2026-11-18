import { Injectable } from '@angular/core';

import {
  ANTECEDENCIA_PADRAO,
  areaDoTipo,
  DirecaoDocumento,
  DocumentStatus,
} from '../domain/documento';
import { formatarData, somaDias } from '../domain/data';
import type { Documento, DocumentoEntrada, DocumentoNovo } from '../domain/models';

const now = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    data: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`,
    hora: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};

const randomIp = () => {
  const oct = () => Math.floor(Math.random() * 250) + 2;
  return `${oct()}.${oct()}.${oct()}.${oct()}`;
};

const randomHash = () => {
  const hex = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 64; i += 1) out += hex[Math.floor(Math.random() * 16)];
  return out;
};

const IP_FIXO = '189.45.12.8';
const IP_CLIENTE = '201.17.245.19';
const IP_CLIENTE_2 = '177.92.10.44';

const initialDocuments: Documento[] = [
  {
    id: 101,
    clienteId: 1,
    nome: 'Guia FGTS',
    tipo: 'Guia FGTS',
    competencia: '09/2026',
    versao: 2,
    status: DocumentStatus.VISUALIZADO,
    direcao: DirecaoDocumento.SAIDA,
    canal: 'WhatsApp',
    formato: 'pdf',
    tamanho: '245 KB',
    vencimento: formatarData(somaDias(-1)),
    diasAntecedencia: 3,
    hash: 'a3f9c8d2e1b74650a9d8f3c2b1e0d7a65c4b3e2d1f0a9b8c7d6e5f4a3b2c1d0e',
    historico: [
      { etapa: 'CRIADO', data: '02/10/2026', hora: '10:12', ip: IP_FIXO },
      { etapa: 'ENVIADO', data: '02/10/2026', hora: '10:15', ip: IP_FIXO, canal: 'WhatsApp' },
      { etapa: 'VISUALIZADO', data: '05/10/2026', hora: '09:31', ip: IP_CLIENTE },
    ],
  },
  {
    id: 100,
    clienteId: 1,
    nome: 'Guia FGTS',
    tipo: 'Guia FGTS',
    competencia: '09/2026',
    versao: 1,
    status: DocumentStatus.BAIXADO,
    direcao: DirecaoDocumento.SAIDA,
    canal: 'WhatsApp',
    formato: 'pdf',
    tamanho: '238 KB',
    hash: 'b7e2d4c6a8f019375b2d4e6f8a0c2e4d6b8a0f2e4d6c8b0a2f4e6d8c0b2a4f6e',
    historico: [
      { etapa: 'CRIADO', data: '28/09/2026', hora: '14:02', ip: IP_FIXO },
      { etapa: 'ENVIADO', data: '28/09/2026', hora: '14:05', ip: IP_FIXO, canal: 'WhatsApp' },
      { etapa: 'VISUALIZADO', data: '29/09/2026', hora: '08:47', ip: IP_CLIENTE },
      { etapa: 'BAIXADO', data: '30/09/2026', hora: '11:20', ip: IP_CLIENTE },
    ],
  },
  {
    id: 102,
    clienteId: 1,
    nome: 'DRE',
    tipo: 'DRE',
    competencia: '09/2026',
    versao: 1,
    status: DocumentStatus.RASCUNHO,
    direcao: DirecaoDocumento.SAIDA,
    canal: null,
    formato: 'xlsx',
    tamanho: '88 KB',
    hash: 'c1d2e3f4a5b60718293a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    historico: [{ etapa: 'CRIADO', data: '06/10/2026', hora: '16:40', ip: IP_FIXO }],
  },
  {
    id: 103,
    clienteId: 1,
    nome: 'Folha de pagamento',
    tipo: 'Folha de pagamento',
    competencia: '09/2026',
    versao: 1,
    status: DocumentStatus.BAIXADO,
    direcao: DirecaoDocumento.SAIDA,
    canal: 'E-mail',
    formato: 'pdf',
    tamanho: '1.2 MB',
    hash: 'd4e5f6a7b8c901234d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c',
    historico: [
      { etapa: 'CRIADO', data: '01/10/2026', hora: '09:10', ip: IP_FIXO },
      { etapa: 'ENVIADO', data: '01/10/2026', hora: '09:14', ip: IP_FIXO, canal: 'E-mail' },
      { etapa: 'VISUALIZADO', data: '02/10/2026', hora: '15:02', ip: IP_CLIENTE_2 },
      { etapa: 'BAIXADO', data: '03/10/2026', hora: '10:55', ip: IP_CLIENTE_2 },
    ],
  },
  {
    id: 104,
    clienteId: 1,
    nome: 'Guia DAS',
    tipo: 'Guia DAS',
    competencia: '09/2026',
    versao: 1,
    status: DocumentStatus.ENVIADO,
    direcao: DirecaoDocumento.SAIDA,
    canal: 'WhatsApp',
    formato: 'pdf',
    tamanho: '96 KB',
    vencimento: formatarData(somaDias(2)),
    diasAntecedencia: 3,
    hash: 'e5f6a7b8c9d012345e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
    historico: [
      { etapa: 'CRIADO', data: '07/10/2026', hora: '11:30', ip: IP_FIXO },
      { etapa: 'ENVIADO', data: '07/10/2026', hora: '11:33', ip: IP_FIXO, canal: 'WhatsApp' },
    ],
  },
  {
    id: 201,
    clienteId: 1,
    nome: 'Extrato bancário',
    tipo: 'Extrato bancário',
    competencia: '09/2026',
    versao: 1,
    status: DocumentStatus.RECEBIDO,
    direcao: DirecaoDocumento.ENTRADA,
    canal: 'WhatsApp',
    formato: 'pdf',
    tamanho: '1.8 MB',
    hash: '1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    observacao: 'Extrato completo do mês conforme combinado.',
    historico: [
      { etapa: 'CRIADO', data: formatarData(somaDias(-2)), hora: '09:14', ip: IP_CLIENTE },
      { etapa: 'RECEBIDO', data: formatarData(somaDias(-2)), hora: '09:15', ip: IP_CLIENTE, canal: 'WhatsApp' },
    ],
  },
  {
    id: 202,
    clienteId: 1,
    nome: 'Notas fiscais',
    tipo: 'Notas fiscais',
    competencia: '09/2026',
    versao: 1,
    status: DocumentStatus.RECEBIDO,
    direcao: DirecaoDocumento.ENTRADA,
    canal: 'Link',
    formato: 'pdf',
    tamanho: '3.4 MB',
    hash: '9f8e7d6c5b4a392817f6e5d4c3b2a1908f7e6d5c4b3a291807f6e5d4c3b2a190',
    observacao: 'Notas fiscais de setembro enviadas pelo link seguro.',
    historico: [
      { etapa: 'CRIADO', data: formatarData(somaDias(-1)), hora: '14:05', ip: IP_CLIENTE },
      { etapa: 'RECEBIDO', data: formatarData(somaDias(-1)), hora: '14:06', ip: IP_CLIENTE, canal: 'Link' },
    ],
  },
  {
    id: 203,
    clienteId: 2,
    nome: 'Balancete',
    tipo: 'Demonstrativo contábil',
    competencia: '09/2026',
    versao: 1,
    status: DocumentStatus.ENVIADO,
    direcao: DirecaoDocumento.SAIDA,
    canal: 'E-mail',
    formato: 'pdf',
    tamanho: '320 KB',
    hash: '5c4b3a291807f6e5d4c3b2a1908f7e6d5c4b3a291807f6e5d4c3b2a1908f7e6d',
    historico: [
      { etapa: 'CRIADO', data: formatarData(somaDias(-5)), hora: '08:20', ip: IP_FIXO },
      { etapa: 'ENVIADO', data: formatarData(somaDias(-5)), hora: '08:22', ip: IP_FIXO, canal: 'E-mail' },
    ],
  },
];

const grupoKey = (doc: Documento) => `${doc.clienteId}|${doc.direcao}|${doc.nome}|${doc.competencia}`;

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private documents: Documento[] = initialDocuments.map((doc) => ({
    ...doc,
    area: areaDoTipo(doc.tipo),
    historico: [...doc.historico],
  }));

  private maiorVersao(clienteId: number, direcao: string, nome: string, competencia: string): number {
    return this.documents
      .filter(
        (doc) =>
          doc.clienteId === Number(clienteId) &&
          doc.direcao === direcao &&
          doc.nome === nome &&
          doc.competencia === competencia
      )
      .reduce((max, doc) => Math.max(max, doc.versao), 0);
  }

  async listByClient(clienteId: number | string): Promise<Documento[]> {
    const groups = new Map<string, Documento>();

    this.documents
      .filter((doc) => doc.clienteId === Number(clienteId))
      .forEach((doc) => {
        const key = grupoKey(doc);
        const current = groups.get(key);
        if (!current || doc.versao > current.versao) groups.set(key, doc);
      });

    return [...groups.values()].sort((a, b) => b.id - a.id).map((doc) => ({ ...doc }));
  }

  async listAll(): Promise<Documento[]> {
    const groups = new Map<string, Documento>();

    this.documents.forEach((doc) => {
      const key = grupoKey(doc);
      const current = groups.get(key);
      if (!current || doc.versao > current.versao) groups.set(key, doc);
    });

    return [...groups.values()].map((doc) => ({ ...doc, historico: [...doc.historico] }));
  }

  async getById(id: number | string): Promise<Documento | null> {
    const doc = this.documents.find((item) => item.id === Number(id));
    return doc ? { ...doc, historico: [...doc.historico] } : null;
  }

  async listVersions(doc: Documento): Promise<Documento[]> {
    return this.documents
      .filter((item) => grupoKey(item) === grupoKey(doc))
      .sort((a, b) => b.versao - a.versao)
      .map((item) => ({ ...item, historico: [...item.historico] }));
  }

  async findByTipoCompetencia(
    clienteId: number | string,
    tipo: string,
    competencia: string
  ): Promise<Documento | undefined> {
    return this.documents.find(
      (doc) =>
        doc.clienteId === Number(clienteId) &&
        doc.direcao === DirecaoDocumento.SAIDA &&
        doc.tipo === tipo &&
        doc.competencia === competencia
    );
  }

  async create(dados: DocumentoNovo): Promise<Documento> {
    const { clienteId, nome, tipo, competencia, canal, formato, tamanho, enviarAgora, vencimento, diasAntecedencia } =
      dados;
    const nomeFinal = nome ?? tipo;
    const versao = this.maiorVersao(clienteId, DirecaoDocumento.SAIDA, nomeFinal, competencia) + 1;

    const novo: Documento = {
      id: Date.now(),
      clienteId: Number(clienteId),
      nome: nomeFinal,
      tipo,
      competencia,
      versao,
      status: enviarAgora ? DocumentStatus.ENVIADO : DocumentStatus.RASCUNHO,
      direcao: DirecaoDocumento.SAIDA,
      canal: enviarAgora ? canal : null,
      formato,
      tamanho,
      vencimento: vencimento ?? null,
      diasAntecedencia: diasAntecedencia ?? ANTECEDENCIA_PADRAO,
      hash: randomHash(),
      area: areaDoTipo(tipo),
      historico: [
        { etapa: 'CRIADO', ...now(), ip: randomIp() },
        ...(enviarAgora ? [{ etapa: 'ENVIADO', ...now(), ip: randomIp(), canal }] : []),
      ],
    };

    this.documents = [...this.documents, novo];
    return { ...novo, historico: [...novo.historico] };
  }

  async createEntrada(dados: DocumentoEntrada): Promise<Documento> {
    const { clienteId, tipo, competencia, canal, formato, tamanho, observacao, vencimento, diasAntecedencia } = dados;
    const nome = tipo;
    const versao = this.maiorVersao(clienteId, DirecaoDocumento.ENTRADA, nome, competencia) + 1;

    const novo: Documento = {
      id: Date.now(),
      clienteId: Number(clienteId),
      nome,
      tipo,
      competencia,
      versao,
      status: DocumentStatus.RECEBIDO,
      direcao: DirecaoDocumento.ENTRADA,
      canal,
      formato,
      tamanho,
      vencimento: vencimento ?? null,
      diasAntecedencia: diasAntecedencia ?? ANTECEDENCIA_PADRAO,
      hash: randomHash(),
      area: areaDoTipo(tipo),
      observacao: observacao ?? '',
      historico: [
        { etapa: 'CRIADO', ...now(), ip: randomIp() },
        { etapa: 'RECEBIDO', ...now(), ip: randomIp(), canal },
      ],
    };

    this.documents = [...this.documents, novo];
    return { ...novo, historico: [...novo.historico] };
  }

  async createConsolidado(dados: {
    clienteId: number;
    nome: string;
    competencia: string;
    fontes: string[];
  }): Promise<Documento> {
    const { clienteId, nome, competencia, fontes } = dados;
    const versao = this.maiorVersao(clienteId, DirecaoDocumento.SAIDA, nome, competencia) + 1;

    const novo: Documento = {
      id: Date.now(),
      clienteId: Number(clienteId),
      nome,
      tipo: 'Documento consolidado',
      competencia,
      versao,
      status: DocumentStatus.RASCUNHO,
      direcao: DirecaoDocumento.SAIDA,
      canal: null,
      formato: 'pdf',
      tamanho: '—',
      hash: randomHash(),
      area: areaDoTipo('Documento consolidado'),
      fontes: [...fontes],
      historico: [{ etapa: 'CRIADO', ...now(), ip: randomIp() }],
    };

    this.documents = [...this.documents, novo];
    return { ...novo, historico: [...novo.historico] };
  }

  async markEnviado(id: number | string, canal?: string | null): Promise<Documento | null> {
    const doc = this.documents.find((item) => item.id === Number(id));
    if (!doc) return null;

    const canalFinal = canal ?? doc.canal ?? 'WhatsApp';
    doc.status = DocumentStatus.ENVIADO;
    doc.direcao = doc.direcao ?? DirecaoDocumento.SAIDA;
    doc.canal = canalFinal;
    doc.historico = [...doc.historico, { etapa: 'ENVIADO', ...now(), ip: randomIp(), canal: canalFinal }];

    return { ...doc, historico: [...doc.historico] };
  }

  async markBaixado(id: number | string): Promise<Documento | null> {
    const doc = this.documents.find((item) => item.id === Number(id));
    if (!doc) return null;

    doc.status = DocumentStatus.BAIXADO;
    if (!doc.historico.some((h) => h.etapa === 'VISUALIZADO')) {
      doc.historico = [...doc.historico, { etapa: 'VISUALIZADO', ...now(), ip: randomIp() }];
    }
    doc.historico = [...doc.historico, { etapa: 'BAIXADO', ...now(), ip: randomIp() }];

    return { ...doc, historico: [...doc.historico] };
  }
}
