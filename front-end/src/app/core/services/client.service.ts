import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import type { Cliente } from '../domain/models';

interface CustomerListItemResponse {
  id: number;
  cnpj: string;
  legalName: string;
  responsibleName: string;
  email: string;
  whatsapp?: string | null;
  lastSubmissionAt: string | null;
}

interface CustomerResponse extends CustomerListItemResponse {
  fullAddress: string;
}

interface CustomerPageResponse {
  content: CustomerListItemResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

interface CustomerCreateRequest {
  cnpj: string;
  legalName: string;
  responsibleName: string;
  email: string;
  fullAddress: string;
  whatsapp?: string | null;
}

type CustomerUpdateRequest = Omit<CustomerCreateRequest, 'cnpj'>;

export interface ClienteListOptions {
  search?: string;
  page?: number;
  size?: number;
}

export interface ClientePage {
  content: Cliente[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const PAGE_SIZE = 100;

const dataHora = (valor: string | null | undefined): string => {
  if (!valor) return '—';
  const data = new Date(valor);
  return Number.isNaN(data.getTime())
    ? '—'
    : new Intl.DateTimeFormat('pt-BR').format(data);
};

const toCliente = (response: CustomerListItemResponse): Cliente => ({
  id: response.id,
  cnpj: response.cnpj,
  razaoSocial: response.legalName,
  responsavel: response.responsibleName,
  email: response.email,
  endereco: 'fullAddress' in response ? (response as CustomerResponse).fullAddress ?? '' : '',
  whatsapp: response.whatsapp ?? '',
  canalPreferido: 'E-mail',
  ultimoEnvio: dataHora(response.lastSubmissionAt),
});

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly http = inject(HttpClient);

  /** Lista usada por seletores: percorre todas as páginas para não perder clientes. */
  async list(): Promise<Cliente[]> {
    const clientes: Cliente[] = [];
    let pagina = 0;
    let totalPages = 1;

    do {
      const resultado = await this.listPage({ page: pagina, size: PAGE_SIZE });
      clientes.push(...resultado.content);
      totalPages = resultado.totalPages;
      pagina += 1;
    } while (pagina < totalPages);

    return clientes;
  }

  /** Lista paginada e filtrada para a tela de gestão de clientes. */
  async listPage(options: ClienteListOptions = {}): Promise<ClientePage> {
    const params = new HttpParams()
      .set('search', options.search ?? '')
      .set('page', String(Math.max(0, options.page ?? 0)))
      .set('size', String(Math.max(1, options.size ?? PAGE_SIZE)));

    const response = await firstValueFrom(
      this.http.get<CustomerPageResponse>('/customers', { params })
    );

    return {
      content: response.content.map(toCliente),
      totalElements: response.totalElements,
      totalPages: response.totalPages,
      number: response.number,
      size: response.size,
    };
  }

  async getById(id: number | string): Promise<Cliente> {
    const response = await firstValueFrom(
      this.http.get<CustomerResponse>(`/customers/${id}`)
    );
    return toCliente(response);
  }

  async create(client: Partial<Cliente>): Promise<Cliente> {
    const body: CustomerCreateRequest = {
      cnpj: client.cnpj ?? '',
      legalName: client.razaoSocial ?? '',
      responsibleName: client.responsavel ?? '',
      email: client.email ?? '',
      fullAddress: client.endereco ?? '',
      whatsapp: client.whatsapp || null,
    };
    const response = await firstValueFrom(
      this.http.post<CustomerResponse>('/customers', body)
    );
    return toCliente(response);
  }

  async update(id: number | string, client: Partial<Cliente>): Promise<Cliente> {
    const body: CustomerUpdateRequest = {
      legalName: client.razaoSocial ?? '',
      responsibleName: client.responsavel ?? '',
      email: client.email ?? '',
      fullAddress: client.endereco ?? '',
      whatsapp: client.whatsapp || null,
    };
    const response = await firstValueFrom(
      this.http.put<CustomerResponse>(`/customers/${id}`, body)
    );
    return toCliente(response);
  }

  async remove(id: number | string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/customers/${id}`));
  }
}
