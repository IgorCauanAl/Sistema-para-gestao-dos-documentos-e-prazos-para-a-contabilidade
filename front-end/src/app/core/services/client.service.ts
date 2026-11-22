import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import type { Cliente } from '../domain/models';

interface CustomerListItemResponse {
  id: number;
  cnpj: string;
  legalName: string;
  responsibleName: string;
  email: string;
  pendingStatus: 'EM_DIA' | 'PENDENTE';
  lastSubmissionAt: string | null;
}

interface CustomerResponse extends CustomerListItemResponse {
  fullAddress: string;
}

interface CustomerCreateRequest {
  cnpj: string;
  legalName: string;
  responsibleName: string;
  email: string;
  fullAddress: string;
}

type CustomerUpdateRequest = Omit<CustomerCreateRequest, 'cnpj'>;

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
  whatsapp: '',
  canalPreferido: 'E-mail',
  pendencias: response.pendingStatus === 'PENDENTE' ? 1 : 0,
  ultimoEnvio: dataHora(response.lastSubmissionAt),
});

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly http = inject(HttpClient);

  async list(): Promise<Cliente[]> {
    const response = await firstValueFrom(
      this.http.get<CustomerListItemResponse[]>('/customers')
    );
    return response.map(toCliente);
  }

  async getById(id: number | string): Promise<Cliente | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<CustomerResponse>(`/customers/${id}`)
      );
      return toCliente(response);
    } catch {
      return null;
    }
  }

  async create(client: Partial<Cliente>): Promise<Cliente> {
    const body: CustomerCreateRequest = {
      cnpj: client.cnpj ?? '',
      legalName: client.razaoSocial ?? '',
      responsibleName: client.responsavel ?? '',
      email: client.email ?? '',
      fullAddress: client.endereco ?? '',
    };
    const response = await firstValueFrom(
      this.http.post<CustomerResponse>('/customers', body)
    );
    return toCliente(response);
  }

  async update(id: number | string, client: Partial<Cliente>): Promise<Cliente | null> {
    const body: CustomerUpdateRequest = {
      legalName: client.razaoSocial ?? '',
      responsibleName: client.responsavel ?? '',
      email: client.email ?? '',
      fullAddress: client.endereco ?? '',
    };
    try {
      const response = await firstValueFrom(
        this.http.put<CustomerResponse>(`/customers/${id}`, body)
      );
      return toCliente(response);
    } catch {
      return null;
    }
  }

  async remove(id: number | string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/customers/${id}`));
  }
}
