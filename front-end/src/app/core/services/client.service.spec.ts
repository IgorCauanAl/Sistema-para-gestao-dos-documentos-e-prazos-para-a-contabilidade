import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ClientService } from './client.service';

describe('ClientService', () => {
  let service: ClientService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ClientService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista clientes vindos da API', async () => {
    const promessa = service.list();

    http.expectOne('/customers').flush([
      {
        id: 3,
        cnpj: '12.345.678/0001-90',
        legalName: 'Alpha Tecnologia Ltda',
        responsibleName: 'Carlos Almeida',
        email: 'contato@alphatec.com.br',
        pendingStatus: 'PENDENTE',
        lastSubmissionAt: '2026-10-07T10:00:00',
      },
    ]);

    const clientes = await promessa;

    expect(clientes.length).toBe(1);
    expect(clientes[0].razaoSocial).toBe('Alpha Tecnologia Ltda');
    expect(clientes[0].pendencias).toBe(1);
  });

  it('cadastra um cliente enviando os campos do backend', async () => {
    const promessa = service.create({
      cnpj: '12.345.678/0001-90',
      razaoSocial: 'Alpha Tecnologia Ltda',
      responsavel: 'Carlos Almeida',
      email: 'contato@alphatec.com.br',
      endereco: 'Av. Paulista, 1000',
    });

    const req = http.expectOne('/customers');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      cnpj: '12.345.678/0001-90',
      legalName: 'Alpha Tecnologia Ltda',
      responsibleName: 'Carlos Almeida',
      email: 'contato@alphatec.com.br',
      fullAddress: 'Av. Paulista, 1000',
    });

    req.flush({
      id: 9,
      cnpj: '12.345.678/0001-90',
      legalName: 'Alpha Tecnologia Ltda',
      responsibleName: 'Carlos Almeida',
      email: 'contato@alphatec.com.br',
      fullAddress: 'Av. Paulista, 1000',
      pendingStatus: 'EM_DIA',
      lastSubmissionAt: null,
    });

    expect((await promessa).id).toBe(9);
  });

  it('exclui cliente pela API', async () => {
    const promessa = service.remove(9);
    const req = http.expectOne('/customers/9');

    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    await promessa;
  });
});
