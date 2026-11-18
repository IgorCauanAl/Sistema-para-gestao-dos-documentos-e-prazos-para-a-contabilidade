import { Injectable } from '@angular/core';

import type { Cliente } from '../domain/models';

const initialClients: Cliente[] = [
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

@Injectable({ providedIn: 'root' })
export class ClientService {
  private clients: Cliente[] = [...initialClients];

  async list(): Promise<Cliente[]> {
    return [...this.clients];
  }

  async getById(id: number | string): Promise<Cliente | null> {
    return this.clients.find((item) => item.id === Number(id)) ?? null;
  }

  async create(client: Partial<Cliente>): Promise<Cliente> {
    const newClient: Cliente = {
      whatsapp: '',
      canalPreferido: 'E-mail',
      pendencias: 0,
      ultimoEnvio: '—',
      cnpj: '',
      razaoSocial: '',
      responsavel: '',
      email: '',
      endereco: '',
      ...client,
      id: Date.now(),
    };
    this.clients = [...this.clients, newClient];
    return newClient;
  }

  async update(id: number | string, client: Partial<Cliente>): Promise<Cliente | null> {
    this.clients = this.clients.map((item) =>
      item.id === Number(id) ? { ...item, ...client } : item
    );
    return this.clients.find((item) => item.id === Number(id)) ?? null;
  }

  async remove(id: number | string): Promise<void> {
    this.clients = this.clients.filter((item) => item.id !== Number(id));
  }
}
